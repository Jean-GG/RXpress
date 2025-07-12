-- Insert demo users with proper error handling
-- First, delete any existing conflicting data to ensure clean insert
DELETE FROM mechanic_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email IN ('cliente@demo.com', 'mecanico@demo.com')
);

DELETE FROM profiles WHERE email IN ('cliente@demo.com', 'mecanico@demo.com');

DELETE FROM users WHERE email IN ('cliente@demo.com', 'mecanico@demo.com');

-- Insert demo users (password is base64 encoded "password123" = "cGFzc3dvcmQxMjM=")
INSERT INTO users (id, email, password_hash) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'cliente@demo.com', 'cGFzc3dvcmQxMjM='),
  ('550e8400-e29b-41d4-a716-446655440002', 'mecanico@demo.com', 'cGFzc3dvcmQxMjM=');

-- Insert demo profiles (must come after users)
INSERT INTO profiles (user_id, email, full_name, phone, user_type) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'cliente@demo.com', 'Cliente Demo', '+1234567890', 'client'),
  ('550e8400-e29b-41d4-a716-446655440002', 'mecanico@demo.com', 'Mecánico Demo', '+1234567891', 'mechanic');

-- Insert demo mechanic profile (must come after users)
INSERT INTO mechanic_profiles (user_id, specialties, hourly_rate, availability_status) VALUES 
  ('550e8400-e29b-41d4-a716-446655440002', ARRAY['Motor', 'Frenos', 'Transmisión'], 25.00, 'available');