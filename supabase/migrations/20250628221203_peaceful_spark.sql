/*
  # Fix profiles table RLS policies for Supabase authentication

  1. Security Changes
    - Update INSERT policy to use auth.uid() consistently
    - Update UPDATE policy to use auth.uid() consistently  
    - Update SELECT policy to use auth.uid() consistently
    - Remove conflicting policies that use current_setting

  2. Changes Made
    - Drop existing policies that use current_setting
    - Create new policies that work with Supabase's built-in auth.uid()
    - Ensure all policies are consistent with Supabase authentication
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow viewing all profiles for mechanic discovery" ON profiles;

-- Create new consistent policies using auth.uid()
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