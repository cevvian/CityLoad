-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create indexes (will run after restore if tables exist)
-- These are just templates, actual indexes will be created by migrations or restore
