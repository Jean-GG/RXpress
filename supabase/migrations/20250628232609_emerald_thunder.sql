/*
  # Update RLS policies for custom authentication

  1. Security Changes
    - Remove RLS policies that depend on Supabase auth
    - Add policies that allow public access for custom authentication
    - Update all tables to work with custom user management

  2. Tables Updated
    - users: Allow public insert/select for registration and login
    - profiles: Allow public access for profile management
    - mechanic_profiles: Allow public access for mechanic data
    - service_requests: Allow public access for service management
    - chat_messages: Allow public access for messaging
*/

-- Drop existing RLS policies that depend on Supabase auth
DROP POLICY IF EXISTS "Allow public access to users for authentication" ON users;
DROP POLICY IF EXISTS "Allow public access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow public access to mechanic profiles" ON mechanic_profiles;
DROP POLICY IF EXISTS "Allow public access to service requests" ON service_requests;
DROP POLICY IF EXISTS "Allow public access to chat messages" ON chat_messages;

-- Create new policies for custom authentication system

-- Users table policies
CREATE POLICY "Allow public registration and login"
  ON users
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Profiles table policies
CREATE POLICY "Allow public profile access"
  ON profiles
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Mechanic profiles table policies
CREATE POLICY "Allow public mechanic profile access"
  ON mechanic_profiles
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Service requests table policies
CREATE POLICY "Allow public service request access"
  ON service_requests
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Chat messages table policies
CREATE POLICY "Allow public chat message access"
  ON chat_messages
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);