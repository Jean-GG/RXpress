/*
  # Fix RLS policies for profiles table

  1. Changes
    - Drop existing RLS policies that use custom current_setting
    - Create new RLS policies using auth.uid() for proper authentication
    - Ensure users can manage their own profiles and view other profiles for mechanic discovery

  2. Security
    - Users can insert their own profile during registration
    - Users can update their own profile data
    - Users can view their own profile
    - All authenticated users can view profiles (needed for mechanic discovery)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public viewing of profiles for mechanic discovery" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policies using auth.uid()
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow viewing all profiles for mechanic discovery"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);