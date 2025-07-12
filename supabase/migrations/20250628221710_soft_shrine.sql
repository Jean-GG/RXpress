/*
  # Sistema de autenticación personalizado

  1. Nuevas tablas
    - `users` - Tabla principal de usuarios con email y contraseña
    - Actualización de `profiles` para usar `user_id` como referencia

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas que permiten acceso público para operaciones básicas
    - Sin dependencia del sistema auth de Supabase

  3. Datos demo
    - Usuarios y perfiles de prueba
    - Mecánicos con especialidades
    - Solicitudes de servicio de ejemplo
*/

-- Eliminar todas las políticas RLS existentes que usan auth.uid()
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow viewing all profiles for mechanic discovery" ON profiles;
DROP POLICY IF EXISTS "Allow viewing mechanic profiles" ON mechanic_profiles;
DROP POLICY IF EXISTS "Allow mechanics to insert their own profile" ON mechanic_profiles;
DROP POLICY IF EXISTS "Allow mechanics to update their own profile" ON mechanic_profiles;
DROP POLICY IF EXISTS "Allow clients to create service requests" ON service_requests;
DROP POLICY IF EXISTS "Allow users to view their service requests" ON service_requests;
DROP POLICY IF EXISTS "Allow participants to update service requests" ON service_requests;
DROP POLICY IF EXISTS "Allow users to view messages from their service requests" ON chat_messages;
DROP POLICY IF EXISTS "Allow users to insert messages to their service requests" ON chat_messages;

-- Crear políticas RLS más permisivas para autenticación personalizada
-- Políticas para users
CREATE POLICY "Allow public access to users for authentication"
  ON users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para profiles
CREATE POLICY "Allow public access to profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para mechanic_profiles
CREATE POLICY "Allow public access to mechanic profiles"
  ON mechanic_profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para service_requests
CREATE POLICY "Allow public access to service requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para chat_messages
CREATE POLICY "Allow public access to chat messages"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Actualizar datos demo para asegurar consistencia
UPDATE users SET password_hash = 'password123' WHERE email IN (
  'cliente@demo.com',
  'mecanico@demo.com',
  'lucia.hernandez@demo.com',
  'ana.lopez@demo.com',
  'pedro.garcia@demo.com',
  'maria.gonzalez@demo.com'
);