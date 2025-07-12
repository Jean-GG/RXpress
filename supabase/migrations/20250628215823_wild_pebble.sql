/*
  # Fix profiles table foreign key and RLS policies

  1. Changes
    - Remove incorrect foreign key constraint that references non-existent 'users' table
    - Update RLS policies to use proper auth.uid() function
    - Ensure profiles table works correctly with Supabase auth

  2. Security
    - Maintain RLS on profiles table
    - Allow users to insert their own profile during registration
    - Allow users to view and update their own profile
    - Allow public viewing of profiles for mechanic discovery
*/

-- Remove the incorrect foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Update the INSERT policy to be more explicit about profile creation
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;

CREATE POLICY "Allow authenticated users to insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the SELECT policy for own profile is correct
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON profiles;

CREATE POLICY "Allow authenticated users to view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure the UPDATE policy is correct
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON profiles;

CREATE POLICY "Allow authenticated users to update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keep the public viewing policy for mechanic discovery
-- This should already exist but let's ensure it's correct
DROP POLICY IF EXISTS "Allow public viewing of profiles for mechanic discovery" ON profiles;

CREATE POLICY "Allow public viewing of profiles for mechanic discovery"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);