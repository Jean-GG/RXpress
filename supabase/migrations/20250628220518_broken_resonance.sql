/*
  # Fix profiles table RLS policy for user registration

  1. Security Updates
    - Update the INSERT policy for profiles table to use auth.uid() instead of uid()
    - Ensure the policy allows new users to create their own profile during registration
    
  2. Changes
    - Drop the existing INSERT policy that may be causing issues
    - Create a new INSERT policy with proper auth.uid() function
    - Ensure the policy works correctly during the registration flow
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;

-- Create a new INSERT policy that properly handles user registration
CREATE POLICY "Allow users to insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also ensure the SELECT policy uses auth.uid() consistently
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON profiles;

CREATE POLICY "Allow users to view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Update the UPDATE policy to use auth.uid() consistently
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON profiles;

CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);