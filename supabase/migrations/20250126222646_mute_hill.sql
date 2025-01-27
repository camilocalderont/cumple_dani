/*
  # Party Registration Schema

  1. Tables
    - party_registrations: Stores adult count and confirmation status
    - children: Stores children names linked to registrations
  
  2. Security
    - Enable RLS on both tables
    - Allow public insert access for registrations
    - Allow public insert access for children
*/

CREATE TABLE IF NOT EXISTS party_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adult_count integer NOT NULL,
  confirmed boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES party_registrations(id),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE party_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert registrations" ON party_registrations;
DROP POLICY IF EXISTS "Anyone can insert children" ON children;

-- Create new policies with proper permissions
CREATE POLICY "Enable insert for anonymous users"
  ON party_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for anonymous users"
  ON party_registrations FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for children"
  ON children FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for children"
  ON children FOR SELECT
  USING (true);