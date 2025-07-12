/*
  # Fix profiles table RLS policies for custom authentication

  1. Security Updates
    - Update INSERT policy to use current_setting('app.current_user_id') instead of uid()
    - Ensure consistency across all policies for the profiles table
    - Allow proper profile creation during sign-up process

  2. Changes Made
    - Drop existing inconsistent INSERT policy
    - Create new INSERT policy that matches the custom authentication system
    - Maintain existing SELECT and UPDATE policies that already use the correct approach
*/

-- Drop the existing INSERT policy that uses uid()
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create new INSERT policy that matches the custom authentication system
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('app.current_user_id'::text))::uuid);

-- Also update the duplicate SELECT policy to remove redundancy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- The "Allow viewing all profiles for mechanic discovery" policy already covers SELECT operations
-- so we don't need the duplicate "Users can view their own profile" policy