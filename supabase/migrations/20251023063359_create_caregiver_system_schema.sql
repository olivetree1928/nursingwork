/*
  # Caregiver Dispatch Management System - Database Schema

  ## Overview
  Complete database schema for a caregiver dispatch management system supporting patients and caregivers.

  ## New Tables

  ### 1. profiles
  Extends auth.users with role-based profile information
  - `id` (uuid, FK to auth.users)
  - `role` (text): 'patient' or 'caregiver'
  - `full_name` (text)
  - `phone` (text)
  - `avatar_url` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. caregiver_profiles
  Detailed information for caregivers
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `gender` (text)
  - `age` (integer)
  - `years_of_experience` (integer)
  - `skills` (text array): specialized skills
  - `bio` (text): introduction
  - `hourly_rate` (decimal)
  - `is_available` (boolean)
  - `rating_average` (decimal)
  - `total_reviews` (integer)
  - `certifications` (text array)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. bookings
  Service booking records
  - `id` (uuid, PK)
  - `patient_id` (uuid, FK to profiles)
  - `caregiver_id` (uuid, FK to profiles)
  - `service_type` (text): type of care needed
  - `start_time` (timestamptz)
  - `end_time` (timestamptz)
  - `total_hours` (decimal)
  - `hourly_rate` (decimal)
  - `total_cost` (decimal)
  - `status` (text): 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  - `special_requirements` (text, nullable)
  - `address` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. reviews
  Patient reviews for caregivers
  - `id` (uuid, PK)
  - `booking_id` (uuid, FK to bookings)
  - `caregiver_id` (uuid, FK to profiles)
  - `patient_id` (uuid, FK to profiles)
  - `rating` (integer): 1-5
  - `comment` (text, nullable)
  - `created_at` (timestamptz)

  ### 5. training_resources
  Training materials for caregivers
  - `id` (uuid, PK)
  - `title` (text)
  - `description` (text)
  - `content_type` (text): 'video', 'article', 'document'
  - `content_url` (text)
  - `category` (text)
  - `created_at` (timestamptz)

  ### 6. notifications
  System notifications for users
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `title` (text)
  - `message` (text)
  - `type` (text): 'booking', 'payment', 'review', 'system'
  - `is_read` (boolean)
  - `related_booking_id` (uuid, nullable)
  - `created_at` (timestamptz)

  ### 7. payment_records
  Payment transaction records
  - `id` (uuid, PK)
  - `booking_id` (uuid, FK to bookings)
  - `patient_id` (uuid, FK to profiles)
  - `amount` (decimal)
  - `payment_method` (text)
  - `payment_status` (text): 'pending', 'completed', 'failed', 'refunded'
  - `transaction_id` (text, nullable)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users based on role
  - Patients can view their own data and caregiver public profiles
  - Caregivers can manage their profiles and view assigned bookings
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('patient', 'caregiver')),
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create caregiver_profiles table
CREATE TABLE IF NOT EXISTS caregiver_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  age integer CHECK (age >= 18 AND age <= 100),
  years_of_experience integer DEFAULT 0,
  skills text[] DEFAULT '{}',
  bio text,
  hourly_rate decimal(10,2) NOT NULL DEFAULT 0,
  is_available boolean DEFAULT true,
  rating_average decimal(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  certifications text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE caregiver_profiles ENABLE ROW LEVEL SECURITY;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caregiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  total_hours decimal(10,2) NOT NULL,
  hourly_rate decimal(10,2) NOT NULL,
  total_cost decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  special_requirements text,
  address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  caregiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create training_resources table
CREATE TABLE IF NOT EXISTS training_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('video', 'article', 'document')),
  content_url text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_resources ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('booking', 'payment', 'review', 'system')),
  is_read boolean DEFAULT false,
  related_booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for caregiver_profiles
CREATE POLICY "Anyone can view caregiver profiles"
  ON caregiver_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Caregivers can update own profile"
  ON caregiver_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = caregiver_profiles.user_id
      AND profiles.role = 'caregiver'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = caregiver_profiles.user_id
      AND profiles.role = 'caregiver'
    )
  );

CREATE POLICY "Caregivers can insert own profile"
  ON caregiver_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = caregiver_profiles.user_id
      AND profiles.role = 'caregiver'
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid() OR caregiver_id = auth.uid());

CREATE POLICY "Patients can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'patient'
    )
  );

CREATE POLICY "Related users can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid() OR caregiver_id = auth.uid())
  WITH CHECK (patient_id = auth.uid() OR caregiver_id = auth.uid());

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Patients can create reviews for own bookings"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.patient_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- RLS Policies for training_resources
CREATE POLICY "Caregivers can view training resources"
  ON training_resources FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'caregiver'
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for payment_records
CREATE POLICY "Users can view own payment records"
  ON payment_records FOR SELECT
  TO authenticated
  USING (
    patient_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payment_records.booking_id
      AND bookings.caregiver_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create payment records"
  ON payment_records FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_caregiver_profiles_user_id ON caregiver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_profiles_available ON caregiver_profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_patient_id ON bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_bookings_caregiver_id ON bookings(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_caregiver_id ON reviews(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Function to update caregiver rating after review
CREATE OR REPLACE FUNCTION update_caregiver_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE caregiver_profiles
  SET 
    rating_average = (
      SELECT AVG(rating)::decimal(3,2)
      FROM reviews
      WHERE caregiver_id = NEW.caregiver_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE caregiver_id = NEW.caregiver_id
    ),
    updated_at = now()
  WHERE user_id = NEW.caregiver_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update caregiver rating after review
DROP TRIGGER IF EXISTS trigger_update_caregiver_rating ON reviews;
CREATE TRIGGER trigger_update_caregiver_rating
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_caregiver_rating();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_caregiver_profiles_updated_at ON caregiver_profiles;
CREATE TRIGGER update_caregiver_profiles_updated_at
  BEFORE UPDATE ON caregiver_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();