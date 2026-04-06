-- Migration auth marchands (a executer manuellement dans Supabase SQL Editor)
-- Ce fichier suit le meme principe que supabase/schema.sql.

-- Ajouter les champs d authentification sur merchants
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Ajouter les colonnes manquantes a promos
ALTER TABLE promos
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'expired'));
