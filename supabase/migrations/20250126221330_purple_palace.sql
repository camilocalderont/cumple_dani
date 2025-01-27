/*
  # Birthday Party Registration Schema

  1. New Tables
    - `party_registrations`
      - `id` (uuid, primary key)
      - `adult_count` (integer)
      - `confirmed` (boolean)
      - `created_at` (timestamp)
    - `children`
      - `id` (uuid, primary key)
      - `registration_id` (uuid, foreign key)
      - `name` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for inserting data
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

CREATE POLICY "Anyone can insert registrations"
  ON party_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can insert children"
  ON children
  FOR INSERT
  TO anon
  WITH CHECK (true);