/*
  # Create walking data tracking system

  1. New Tables
    - `walking_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date, unique per user)
      - `minutes` (integer, walking duration in minutes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `walking_data` table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS walking_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  minutes integer NOT NULL CHECK (minutes >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint to prevent duplicate entries for same user and date
CREATE UNIQUE INDEX IF NOT EXISTS walking_data_user_date_idx ON walking_data(user_id, date);

-- Enable RLS
ALTER TABLE walking_data ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own walking data"
  ON walking_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own walking data"
  ON walking_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own walking data"
  ON walking_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own walking data"
  ON walking_data
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);