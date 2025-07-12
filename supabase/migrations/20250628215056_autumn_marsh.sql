/*
  # Demo Data Migration

  This migration creates demo data that will be populated when users register.
  It creates a trigger function that automatically sets up demo profiles and data
  when specific demo email addresses are used during registration.
*/

-- Create a function to populate demo profiles when users register
CREATE OR REPLACE FUNCTION create_demo_profile_data()
RETURNS TRIGGER AS $$
DECLARE
    mechanic_profile_id uuid;
BEGIN
    -- Check if this is one of our demo users and create appropriate profile
    IF NEW.email = 'mecanico@demo.com' THEN
        INSERT INTO profiles (id, email, full_name, phone, user_type, avatar_url)
        VALUES (NEW.id, NEW.email, 'Sofía Martínez', '867-456-7890', 'mechanic', 
                'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2');
        
        -- Create mechanic profile
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

-- Create trigger to automatically create demo profiles
DROP TRIGGER IF EXISTS on_auth_user_created_demo ON auth.users;
CREATE TRIGGER on_auth_user_created_demo
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_demo_profile_data();

-- Create a function to seed additional demo data after mechanic registration
CREATE OR REPLACE FUNCTION seed_demo_service_data()
RETURNS void AS $$
DECLARE
    mechanic_sofia_id uuid;
    mechanic_lucia_id uuid;
    mechanic_pedro_id uuid;
    client_carlos_id uuid;
    client_ana_id uuid;
    client_miguel_id uuid;
    service_request_1_id uuid := gen_random_uuid();
    service_request_2_id uuid := gen_random_uuid();
    service_request_3_id uuid := gen_random_uuid();
BEGIN
    -- Get user IDs for demo accounts (if they exist)
    SELECT id INTO mechanic_sofia_id FROM profiles WHERE email = 'mecanico@demo.com' LIMIT 1;
    SELECT id INTO mechanic_lucia_id FROM profiles WHERE email = 'lucia.hernandez@demo.com' LIMIT 1;
    SELECT id INTO mechanic_pedro_id FROM profiles WHERE email = 'pedro.garcia@demo.com' LIMIT 1;
    SELECT id INTO client_carlos_id FROM profiles WHERE email = 'cliente@demo.com' LIMIT 1;
    SELECT id INTO client_ana_id FROM profiles WHERE email = 'ana.rodriguez@demo.com' LIMIT 1;
    SELECT id INTO client_miguel_id FROM profiles WHERE email = 'miguel.santos@demo.com' LIMIT 1;
    
    -- Only create service requests if we have the required users
    IF mechanic_sofia_id IS NOT NULL AND client_carlos_id IS NOT NULL THEN
        INSERT INTO service_requests (id, client_id, mechanic_id, service_type, description, client_latitude, client_longitude, client_address, status, payment_method, estimated_cost, actual_cost, created_at, updated_at) VALUES
        (service_request_1_id, client_carlos_id, mechanic_sofia_id, 'Cambio de aceite', 
         'Necesito cambio de aceite urgente, mi carro está haciendo ruidos extraños', 
         27.5024, -99.5075, 'Av. Guerrero 1234, Centro, Nuevo Laredo', 
         'completed', 'cash', 350.00, 350.00,
         NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');
        
        -- Add chat messages for this service
        INSERT INTO chat_messages (service_request_id, sender_id, message, message_type, created_at) VALUES
        (service_request_1_id, client_carlos_id, 'Solicitud de Cambio de aceite creada. El mecánico Sofía Martínez se dirigirá a tu ubicación.', 'system', NOW() - INTERVAL '2 days'),
        (service_request_1_id, mechanic_sofia_id, 'Hola Carlos, ya recibí tu solicitud. Estoy en camino a tu ubicación.', 'text', NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'),
        (service_request_1_id, client_carlos_id, 'Perfecto, estaré esperando. ¿Cuánto tiempo aproximadamente?', 'text', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes'),
        (service_request_1_id, mechanic_sofia_id, 'Llego en unos 15 minutos. ¿Tienes alguna preferencia de aceite?', 'text', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'),
        (service_request_1_id, client_carlos_id, 'Con que sea de buena calidad está bien, gracias', 'text', NOW() - INTERVAL '2 days' + INTERVAL '20 minutes');
    END IF;
    
    IF mechanic_lucia_id IS NOT NULL AND client_ana_id IS NOT NULL THEN
        INSERT INTO service_requests (id, client_id, mechanic_id, service_type, description, client_latitude, client_longitude, client_address, status, payment_method, estimated_cost, actual_cost, created_at, updated_at) VALUES
        (service_request_2_id, client_ana_id, mechanic_lucia_id, 'Diagnóstico de motor', 
         'El carro no enciende bien por las mañanas, creo que es la batería', 
         27.4989, -99.5142, 'Calle Venezuela 567, San José, Nuevo Laredo', 
         'in_progress', 'card', 400.00, NULL,
         NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours');
        
        -- Add chat messages for this service
        INSERT INTO chat_messages (service_request_id, sender_id, message, message_type, created_at) VALUES
        (service_request_2_id, client_ana_id, 'Solicitud de Diagnóstico de motor creada. El mecánico Lucía Hernández se dirigirá a tu ubicación.', 'system', NOW() - INTERVAL '1 day'),
        (service_request_2_id, mechanic_lucia_id, 'Hola Ana, estoy revisando tu caso. Parece ser problema de batería efectivamente.', 'text', NOW() - INTERVAL '1 day' + INTERVAL '10 minutes'),
        (service_request_2_id, client_ana_id, '¿Necesitas que compre la batería nueva o la tienes?', 'text', NOW() - INTERVAL '1 day' + INTERVAL '20 minutes');
    END IF;
    
    IF mechanic_pedro_id IS NOT NULL AND client_miguel_id IS NOT NULL THEN
        INSERT INTO service_requests (id, client_id, mechanic_id, service_type, description, client_latitude, client_longitude, client_address, status, payment_method, estimated_cost, actual_cost, created_at, updated_at) VALUES
        (service_request_3_id, client_miguel_id, mechanic_pedro_id, 'Vulcanización', 
         'Se me ponchó la llanta en la carretera, necesito reparación urgente', 
         27.4834, -99.5234, 'Carretera Nacional Km 15, Nuevo Laredo', 
         'accepted', 'cash', 250.00, NULL,
         NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour');
        
        -- Add chat messages for this service
        INSERT INTO chat_messages (service_request_id, sender_id, message, message_type, created_at) VALUES
        (service_request_3_id, client_miguel_id, 'Solicitud de Vulcanización creada. El mecánico Pedro García se dirigirá a tu ubicación.', 'system', NOW() - INTERVAL '2 hours'),
        (service_request_3_id, mechanic_pedro_id, 'Miguel, ya voy hacia tu ubicación. Veo que estás en carretera, ¿es seguro el lugar?', 'text', NOW() - INTERVAL '2 hours' + INTERVAL '15 minutes'),
        (service_request_3_id, client_miguel_id, 'Sí, estoy en el acotamiento con las luces intermitentes puestas', 'text', NOW() - INTERVAL '2 hours' + INTERVAL '30 minutes');
    END IF;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add some comments for documentation
COMMENT ON FUNCTION create_demo_profile_data() IS 'Automatically creates demo profiles when specific demo email addresses are used during registration';
COMMENT ON FUNCTION seed_demo_service_data() IS 'Seeds demo service requests and chat messages after demo users are registered';