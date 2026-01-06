-- Migration: Add remarks column to vehicles table
-- Run this migration to add remarks field to vehicle registration
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

-- Add remarks column to vehicles table
-- Note: If you get an error "Duplicate column name 'remarks'", the column already exists and you can ignore the error
ALTER TABLE vehicles 
ADD COLUMN remarks TEXT NULL AFTER year_of_registration;

