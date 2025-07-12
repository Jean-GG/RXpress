/*
  # Recrear esquema completo de base de datos

  1. Eliminar y recrear todas las tablas
  2. Crear tipos de datos (enums)
  3. Configurar RLS y políticas de seguridad
  4. Insertar datos demo con UUIDs válidos
  5. Crear funciones y triggers para automatización
*/

-- Eliminar tablas existentes si existen (en orden correcto para evitar errores de FK)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS mechanic_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Eliminar tipos existentes si existen
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS availability_status CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;

-- Eliminar funciones existentes si existen
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_demo_profile_data() CASCADE;
DROP FUNCTION IF EXISTS seed_demo_service_data() CASCADE;

-- Crear tipos de datos (enums)
CREATE TYPE user_type AS ENUM ('client', 'mechanic');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'card');
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'offline');
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabla de perfiles de usuarios
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  user_type user_type NOT NULL DEFAULT 'client',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de perfiles extendidos para mecánicos
CREATE TABLE IF NOT EXISTS mechanic_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  specialties text[] NOT NULL DEFAULT '{}',
  rating numeric(3,2) DEFAULT 5.00,
  total_reviews integer DEFAULT 0,
  hourly_rate numeric(10,2) NOT NULL DEFAULT 0,
  availability_status availability_status DEFAULT 'offline',
  current_latitude numeric(10,8),
  current_longitude numeric(11,8),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Tabla de solicitudes de servicio
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid,
  mechanic_id uuid,
  service_type text NOT NULL,
  description text NOT NULL,
  client_latitude numeric(10,8) NOT NULL,
  client_longitude numeric(11,8) NOT NULL,
  client_address text NOT NULL,
  status request_status DEFAULT 'pending',
  payment_method payment_method DEFAULT 'cash',
  estimated_cost numeric(10,2) NOT NULL DEFAULT 0,
  actual_cost numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (mechanic_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Tabla de mensajes de chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id uuid,
  sender_id uuid,
  message text NOT NULL,
  message_type message_type DEFAULT 'text',
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_mechanic_profiles_availability ON mechanic_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_mechanic_profiles_user_id ON mechanic_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_service_requests_client ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_mechanic ON service_requests(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

CREATE INDEX IF NOT EXISTS idx_chat_messages_service_request ON chat_messages(service_request_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Allow authenticated users to insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow authenticated users to view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow public viewing of profiles for mechanic discovery"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Políticas RLS para mechanic_profiles
CREATE POLICY "Allow viewing mechanic profiles"
  ON mechanic_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow mechanics to insert their own profile"
  ON mechanic_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow mechanics to update their own profile"
  ON mechanic_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para service_requests
CREATE POLICY "Allow clients to create service requests"
  ON service_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Allow users to view their service requests"
  ON service_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = mechanic_id);

CREATE POLICY "Allow participants to update service requests"
  ON service_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = mechanic_id)
  WITH CHECK (auth.uid() = client_id OR auth.uid() = mechanic_id);

-- Políticas RLS para chat_messages
CREATE POLICY "Allow users to view messages from their service requests"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE sr.id = chat_messages.service_request_id
      AND (sr.client_id = auth.uid() OR sr.mechanic_id = auth.uid())
    )
  );

CREATE POLICY "Allow users to insert messages to their service requests"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE sr.id = chat_messages.service_request_id
      AND (sr.client_id = auth.uid() OR sr.mechanic_id = auth.uid())
    )
  );

-- Crear triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mechanic_profiles_updated_at
  BEFORE UPDATE ON mechanic_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfiles demo automáticamente
CREATE OR REPLACE FUNCTION create_demo_profile_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si es uno de nuestros usuarios demo y crear el perfil apropiado
    IF NEW.email = 'mecanico@demo.com' THEN
        INSERT INTO profiles (id, email, full_name, phone, user_type, avatar_url)
        VALUES (NEW.id, NEW.email, 'Sofía Martínez', '867-456-7890', 'mechanic', 
                'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2');
        
        INSERT INTO mechanic_profiles (user_id, specialties, rating, total_reviews, hourly_rate, availability_status, current_latitude, current_longitude)
        VALUES (NEW.id, ARRAY['Cambio de aceite', 'Ajustes de frenos', 'Revisión de suspensión'], 
                4.7, 156, 350.00, 'available', 27.5024, -99.5075);
        
    ELSIF NEW.email = 'lucia.hernandez@demo.com' THEN
        INSERT INTO profiles (id, email, full_name, phone, user_type, avatar_url)
        VALUES (NEW.id, NEW.email, 'Lucía Hernández', '867-567-8901', 'mechanic',
                'https://images.pexels.com/photos/3184318/pexels-photo-3184318.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2');
        
        INSERT INTO mechanic_profiles (user_id, specialties, rating, total_reviews, hourly_rate, availability_status, current_latitude, current_longitude)
        VALUES (NEW.id, ARRAY['Diagnóstico de motor', 'Cambio de batería', 'Reparación de sistema eléctrico'], 
                4.9, 320, 400.00, 'available', 27.4989, -99.5142);
        
    ELSIF NEW.email = 'ana.lopez@demo.com' THEN
        INSERT INTO profiles (id, email, full_name, phone, user_type, avatar_url)
        VALUES (NEW.id, NEW.email, 'Ana López', '867-678-9012', 'mechanic',
                'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2');
        
        INSERT INTO mechanic_profiles (user_id, specialties, rating, total_reviews, hourly_rate, availability_status, current_latitude, current_longitude)
        VALUES (NEW.id, ARRAY['Cambio de aceite', 'Revisión general', 'Ajustes de frenos'], 
                4.8, 200, 325.00, 'available', 27.5156, -99.4923);
        
    ELSIF NEW.email = 'pedro.garcia@demo.com' THEN
        INSERT INTO profiles (id, email, full_name, phone, user_type, avatar_url)
        VALUES (NEW.id, NEW.email, 'Pedro García', '867-789-0123', 'mechanic',
                'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2');
        
        INSERT INTO mechanic_profiles (user_id, specialties, rating, total_reviews, hourly_rate, availability_status, current_latitude, current_longitude)
        VALUES (NEW.id, ARRAY['Vulcanización', 'Cambio de llantas', 'Reparación de neumáticos'], 
                4.6, 189, 300.00, 'available', 27.4834, -99.5234);
        
    ELSIF NEW.email = 'maria.gonzalez@demo.com' THEN
        INSERT INTO profiles (id, email, full_name, phone, user_type, avatar_url)
        VALUES (NEW.id, NEW.email, 'María González', '867-890-1234', 'mechanic',
                'https://images.pexels.com/photos/3184427/pexels-photo-3184427.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2');
        
        INSERT INTO mechanic_profiles (user_id, specialties, rating, total_reviews, hourly_rate, availability_status, current_latitude, current_longitude)
        VALUES (NEW.id, ARRAY['Transmisión', 'Embrague', 'Reparaciones mayores'], 
                4.8, 145, 450.00, 'available', 27.5089, -99.4889);
        
    ELSIF NEW.email = 'cliente@demo.com' THEN
        INSERT INTO profiles (id, email, full_name, phone, user_type, avatar_url)
        VALUES (NEW.id, NEW.email, 'Carlos Mendoza', '867-123-4567', 'client',
                'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2');
        
    ELSIF NEW.email = 'ana.rodriguez@demo.com' THEN
        INSERT INTO profiles (id, email, full_name, phone, user_type, avatar_url)
        VALUES (NEW.id, NEW.email, 'Ana Rodríguez', '867-234-5678', 'client',
                'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2');
        
    ELSIF NEW.email = 'miguel.santos@demo.com' THEN
        INSERT INTO profiles (id, email, full_name, phone, user_type, avatar_url)
        VALUES (NEW.id, NEW.email, 'Miguel Santos', '867-345-6789', 'client',
                'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para crear perfiles demo automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created_demo ON auth.users;
CREATE TRIGGER on_auth_user_created_demo
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_demo_profile_data();

-- Insertar algunos mecánicos adicionales para demo usando UUIDs válidos
INSERT INTO profiles (id, email, full_name, phone, user_type, avatar_url) VALUES
  ('10000000-0000-0000-0000-000000000001', 'demo1@mechanic.local', 'Roberto Vázquez', '867-111-2222', 'mechanic', 
   'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'),
  ('10000000-0000-0000-0000-000000000002', 'demo2@mechanic.local', 'Carmen Ruiz', '867-333-4444', 'mechanic',
   'https://images.pexels.com/photos/3184427/pexels-photo-3184427.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'),
  ('10000000-0000-0000-0000-000000000003', 'demo3@mechanic.local', 'José Morales', '867-555-6666', 'mechanic',
   'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2');

-- Insertar perfiles de mecánicos adicionales
INSERT INTO mechanic_profiles (user_id, specialties, rating, total_reviews, hourly_rate, availability_status, current_latitude, current_longitude) VALUES
  ('10000000-0000-0000-0000-000000000001', ARRAY['Vulcanización', 'Cambio de llantas', 'Balanceo'], 
   4.5, 89, 280.00, 'available', 27.5200, -99.5100),
  ('10000000-0000-0000-0000-000000000002', ARRAY['Aire acondicionado', 'Sistema de enfriamiento', 'Radiador'], 
   4.7, 134, 380.00, 'available', 27.4900, -99.4800),
  ('10000000-0000-0000-0000-000000000003', ARRAY['Afinación', 'Cambio de filtros', 'Bujías'], 
   4.6, 167, 320.00, 'offline', 27.5300, -99.5200);

-- Insertar algunos datos de ejemplo para service_requests y chat_messages
-- usando los UUIDs de los perfiles demo
INSERT INTO service_requests (id, client_id, mechanic_id, service_type, description, client_latitude, client_longitude, client_address, status, payment_method, estimated_cost, actual_cost, created_at, updated_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 
   '10000000-0000-0000-0000-000000000001', -- Usando Roberto como cliente temporal
   '10000000-0000-0000-0000-000000000002', -- Carmen como mecánico
   'Cambio de aceite', 
   'Necesito cambio de aceite urgente, mi carro está haciendo ruidos extraños', 
   27.5024, -99.5075, 
   'Av. Guerrero 1234, Centro, Nuevo Laredo', 
   'completed', 'cash', 350.00, 350.00,
   NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '2 days');

-- Insertar mensajes de chat de ejemplo
INSERT INTO chat_messages (service_request_id, sender_id, message, message_type, created_at) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 
   'Solicitud de Cambio de aceite creada. El mecánico Carmen Ruiz se dirigirá a tu ubicación.', 'system',
   NOW() - INTERVAL '2 days'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 
   'Hola, ya recibí tu solicitud. Estoy en camino a tu ubicación.', 'text',
   NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 
   'Perfecto, estaré esperando. ¿Cuánto tiempo aproximadamente?', 'text',
   NOW() - INTERVAL '2 days' + INTERVAL '10 minutes');

-- Comentarios para documentación
COMMENT ON TABLE profiles IS 'Perfiles de usuarios (clientes y mecánicos)';
COMMENT ON TABLE mechanic_profiles IS 'Información extendida para mecánicos con calificaciones, especialidades y datos de ubicación';
COMMENT ON TABLE service_requests IS 'Solicitudes de servicio entre clientes y mecánicos';
COMMENT ON TABLE chat_messages IS 'Mensajes de chat para cada solicitud de servicio';

COMMENT ON FUNCTION create_demo_profile_data() IS 'Crea automáticamente perfiles demo cuando se usan direcciones de email específicas durante el registro';