-- =============================================
-- INSOLIT - Database Schema
-- Run this in the Supabase SQL Editor
-- =============================================

-- Clean existing objects to ensure exact compatibility with the target model.
-- Avoid DROP POLICY here because PostgreSQL errors if the table does not exist.

DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS redemptions;
DROP TABLE IF EXISTS promos;
DROP TABLE IF EXISTS merchants;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- USER (pure app authentication: no Supabase auth dependency)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORY
CREATE TABLE categories (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  icon TEXT
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  USING (true);

-- MERCHANT
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  coordinates POINT,
  category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT
);

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants are publicly readable"
  ON merchants FOR SELECT
  USING (true);

-- PROMO
CREATE TABLE promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  promo_code TEXT,
  end_date DATE,
  is_exclusive BOOLEAN DEFAULT false,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL
);

ALTER TABLE promos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promos are publicly readable"
  ON promos FOR SELECT
  USING (true);

-- FAVORITE
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  promo_id UUID REFERENCES promos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, promo_id)
);

-- REDEMPTION
CREATE TABLE redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  promo_id UUID REFERENCES promos(id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, promo_id)
);
