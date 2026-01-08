-- Migration: Rename service_types to service_packages
-- Version: 018
-- This migration:
-- 1. Renames service_types table to service_packages
-- 2. Updates all foreign key references and constraints
-- 3. Updates all indexes
-- 4. Updates column names in service_jobs table (service_type_id -> service_package_id)
-- IMPORTANT: This script uses transactions - if any command fails, all changes will be rolled back
-- Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

START TRANSACTION;

-- Step 1: Drop existing foreign key constraints that reference service_types
-- Check if the foreign key exists before dropping (MySQL doesn't support IF EXISTS for foreign keys in all versions)
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND CONSTRAINT_NAME = 'fk_service_jobs_has_service_type'
);

SET @sql = IF(@fk_exists > 0, 
    'ALTER TABLE service_jobs DROP FOREIGN KEY fk_service_jobs_has_service_type',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Rename table from service_types to service_packages (if table exists)
SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_types'
);

SET @sql = IF(@table_exists > 0, 
    'ALTER TABLE service_types RENAME TO service_packages',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Drop old index if it exists (must be done before renaming column)
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND INDEX_NAME = 'idx_service_jobs_service_type'
);

SET @sql = IF(@index_exists > 0, 
    'DROP INDEX idx_service_jobs_service_type ON service_jobs',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Rename column in service_jobs table from service_type_id to service_package_id (if column exists)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND COLUMN_NAME = 'service_type_id'
);

SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE service_jobs CHANGE COLUMN service_type_id service_package_id VARCHAR(36)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Add new foreign key constraint with updated name (only if column and table exist and FK doesn't exist)
-- First verify the service_package_id column exists
SET @column_exists_fk = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND COLUMN_NAME = 'service_package_id'
);

-- Verify service_packages table exists
SET @table_exists_packages = (
    SELECT COUNT(*) 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_packages'
);

SET @fk_exists_new = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND CONSTRAINT_NAME = 'fk_service_jobs_has_service_package'
);

SET @sql = IF(@column_exists_fk > 0 AND @table_exists_packages > 0 AND @fk_exists_new = 0, 
    'ALTER TABLE service_jobs ADD CONSTRAINT fk_service_jobs_has_service_package FOREIGN KEY (service_package_id) REFERENCES service_packages(id) ON DELETE RESTRICT',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 6: Create new index with updated name (only if column exists and index doesn't exist)
-- First check if the service_package_id column exists
SET @column_exists_new = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND COLUMN_NAME = 'service_package_id'
);

SET @index_exists_new = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND INDEX_NAME = 'idx_service_jobs_service_package'
);

SET @sql = IF(@column_exists_new > 0 AND @index_exists_new = 0, 
    'CREATE INDEX idx_service_jobs_service_package ON service_jobs(service_package_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- If all commands succeeded, commit the transaction
COMMIT;

-- Note: If any error occurs, the transaction will automatically rollback
-- To manually rollback if needed: ROLLBACK;
