/*
  # RXpress - Vulkanizadora Móvil Database Schema

  1. New Tables
    - `profiles` - User profiles for both clients and mechanics
    - `mechanic_profiles` - Extended profiles for mechanics with ratings and specialties
    - `service_requests` - Service requests from clients to mechanics
    - `chat_messages` - Chat messages between clients and mechanics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on user roles
    - Ensure users can only access their own data and related records

  3. Features
    - User authentication with role-based access
    - Real-time chat functionality
    - Service request management
    - Mechanic ratings and reviews system
    - Location tracking capabilities
*/

-- Create enum types
CREATE TYPE user_type AS ENUM ('client', 'mechanic');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'card');
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'offline');
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');

-- Profiles table for all users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  user_type user_type NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extended profiles for mechanics
CREATE TABLE IF NOT EXISTS mechanic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_reviews INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  availability_status availability_status DEFAULT 'offline',
  current_latitude DECIMAL(10,8),
  current_longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Service requests
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mechanic_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  description TEXT NOT NULL,
  client_latitude DECIMAL(10,8) NOT NULL,
  client_longitude DECIMAL(11,8) NOT NULL,
  client_address TEXT NOT NULL,
  status request_status DEFAULT 'pending',
  payment_method payment_method DEFAULT 'cash',
  estimated_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  actual_cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for mechanic_profiles
CREATE POLICY "Anyone can view mechanic profiles"
  ON mechanic_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Mechanics can update own profile"
  ON mechanic_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Mechanics can insert own profile"
  ON mechanic_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for service_requests
CREATE POLICY "Users can view their own service requests"
  ON service_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = mechanic_id);

CREATE POLICY "Clients can create service requests"
  ON service_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients and mechanics can update their service requests"
  ON service_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = mechanic_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages from their service requests"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE sr.id = service_request_id
      AND (sr.client_id = auth.uid() OR sr.mechanic_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages to their service requests"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE sr.id = service_request_id
      AND (sr.client_id = auth.uid() OR sr.mechanic_id = auth.uid())
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_mechanic_profiles_availability ON mechanic_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_client ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_mechanic ON service_requests(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_service_request ON chat_messages(service_request_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mechanic_profiles_updated_at
  BEFORE UPDATE ON mechanic_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();