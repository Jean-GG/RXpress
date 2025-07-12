/*
  # Fix RLS policies for authentication and data access

  1. Security Updates
    - Update RLS policies on `profiles` table to allow user registration
    - Add proper RLS policies for `mechanic_profiles` table
    - Update RLS policies for `service_requests` table
    - Update RLS policies for `chat_messages` table

  2. Changes Made
    - Allow authenticated users to insert their own profile during registration
    - Allow users to view profiles (needed for mechanic discovery)
    - Ensure proper access control for all tables
    - Fix policy conditions to work with Supabase auth functions

  3. Important Notes
    - These policies ensure users can only access their own data
    - Public profile viewing is allowed for mechanic discovery
    - Chat messages are restricted to service request participants
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create comprehensive RLS policies for profiles table
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

-- Update mechanic_profiles policies
DROP POLICY IF EXISTS "Anyone can view mechanic profiles" ON mechanic_profiles;
DROP POLICY IF EXISTS "Mechanics can insert own profile" ON mechanic_profiles;
DROP POLICY IF EXISTS "Mechanics can update own profile" ON mechanic_profiles;

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

-- Update service_requests policies
DROP POLICY IF EXISTS "Clients and mechanics can update their service requests" ON service_requests;
DROP POLICY IF EXISTS "Clients can create service requests" ON service_requests;
DROP POLICY IF EXISTS "Users can view their own service requests" ON service_requests;

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

-- Update chat_messages policies
DROP POLICY IF EXISTS "Users can insert messages to their service requests" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages from their service requests" ON chat_messages;

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