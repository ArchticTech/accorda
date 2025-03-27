/*
  # Create customers table

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `auth_id` (uuid, references auth.users)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `customers` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read only their own data
CREATE POLICY "Users can read own customer data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- Policy to allow users to update only their own data
CREATE POLICY "Users can update own customer data"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid());

-- Policy to allow users to insert their own data
CREATE POLICY "Users can insert own customer data"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());