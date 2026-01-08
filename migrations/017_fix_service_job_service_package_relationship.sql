-- Migration: Fix Service Job and Service Package Relationship
-- Version: 017
-- This migration:
-- 1. Rolls back the rename from service_types to service_packages (from migration 016)
-- 2. Creates proper many-to-many relationships:
--    - service_jobs <-> services (via service_job_services junction table)
--    - services <-> service_packages (via service_service_packages junction table)
-- IMPORTANT: This script uses transactions - if any command fails, all changes will be rolled back
-- Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

START TRANSACTION;

-- Step 1: Rollback migration 016 changes
-- Drop the foreign key constraint added in migration 016 (if it exists)
SET @fk_exists_package = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND CONSTRAINT_NAME = 'fk_service_jobs_has_service_package'
);

SET @sql = IF(@fk_exists_package > 0, 
    'ALTER TABLE service_jobs DROP FOREIGN KEY fk_service_jobs_has_service_package',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename column back from service_package_id to service_type_id (if column exists)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND COLUMN_NAME = 'service_package_id'
);

SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE service_jobs CHANGE COLUMN service_package_id service_type_id VARCHAR(36)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename table back from service_packages to service_types (if table exists)
SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_packages'
);

SET @sql = IF(@table_exists > 0, 
    'ALTER TABLE service_packages RENAME TO service_types',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Recreate the old foreign key constraint (drop if exists first)
SET @fk_exists_type = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND CONSTRAINT_NAME = 'fk_service_jobs_has_service_type'
);

SET @sql = IF(@fk_exists_type > 0, 
    'ALTER TABLE service_jobs DROP FOREIGN KEY fk_service_jobs_has_service_type',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE service_jobs 
ADD CONSTRAINT fk_service_jobs_has_service_type 
FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT;

-- Update indexes
SET @index_exists_package = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND INDEX_NAME = 'idx_service_jobs_service_package'
);

SET @sql = IF(@index_exists_package > 0, 
    'DROP INDEX idx_service_jobs_service_package ON service_jobs',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create index if it doesn't exist
SET @index_exists_type = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND INDEX_NAME = 'idx_service_jobs_service_type'
);

SET @sql = IF(@index_exists_type = 0, 
    'CREATE INDEX idx_service_jobs_service_type ON service_jobs(service_type_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Rename service_types to service_packages (this is what we want for the new structure)
SET @table_exists_types = (
    SELECT COUNT(*) 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_types'
);

SET @sql = IF(@table_exists_types > 0, 
    'ALTER TABLE service_types RENAME TO service_packages',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Ensure services table exists and is InnoDB (required for foreign keys)
-- First, create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    remarks TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Convert services table to InnoDB if it's currently MyISAM (foreign keys require InnoDB)
SET @services_engine = (
    SELECT ENGINE 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'services'
);

SET @sql = IF(@services_engine != 'InnoDB' AND @services_engine IS NOT NULL, 
    'ALTER TABLE services ENGINE=InnoDB',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Create junction table for service_jobs <-> services (many-to-many)
-- This allows one service job to have multiple services
-- First create the table without foreign keys
CREATE TABLE IF NOT EXISTS service_job_services (
    id VARCHAR(36) PRIMARY KEY,
    service_job_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_service_job_service (service_job_id, service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Now add foreign keys separately (check if they exist first)
SET @fk_job_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_job_services' 
    AND CONSTRAINT_NAME = 'fk_service_job_services_job'
);

SET @sql = IF(@fk_job_exists = 0, 
    'ALTER TABLE service_job_services ADD CONSTRAINT fk_service_job_services_job FOREIGN KEY (service_job_id) REFERENCES service_jobs(id) ON DELETE CASCADE',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_service_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_job_services' 
    AND CONSTRAINT_NAME = 'fk_service_job_services_service'
);

SET @sql = IF(@fk_service_exists = 0, 
    'ALTER TABLE service_job_services ADD CONSTRAINT fk_service_job_services_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create indexes for service_job_services table (only if they don't exist)
SET @index_exists_job = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_job_services' 
    AND INDEX_NAME = 'idx_service_job_services_job'
);

SET @sql = IF(@index_exists_job = 0, 
    'CREATE INDEX idx_service_job_services_job ON service_job_services(service_job_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists_service = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_job_services' 
    AND INDEX_NAME = 'idx_service_job_services_service'
);

SET @sql = IF(@index_exists_service = 0, 
    'CREATE INDEX idx_service_job_services_service ON service_job_services(service_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Create junction table for services <-> service_packages (many-to-many)
-- This allows one service to be in multiple service packages
-- First create the table without foreign keys
CREATE TABLE IF NOT EXISTS service_service_packages (
    id VARCHAR(36) PRIMARY KEY,
    service_id VARCHAR(36) NOT NULL,
    service_package_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_service_package (service_id, service_package_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Now add foreign keys separately (check if they exist first)
SET @fk_pkg_service_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_service_packages' 
    AND CONSTRAINT_NAME = 'fk_service_service_packages_service'
);

SET @sql = IF(@fk_pkg_service_exists = 0, 
    'ALTER TABLE service_service_packages ADD CONSTRAINT fk_service_service_packages_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_pkg_package_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_service_packages' 
    AND CONSTRAINT_NAME = 'fk_service_service_packages_package'
);

SET @sql = IF(@fk_pkg_package_exists = 0, 
    'ALTER TABLE service_service_packages ADD CONSTRAINT fk_service_service_packages_package FOREIGN KEY (service_package_id) REFERENCES service_packages(id) ON DELETE CASCADE',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create indexes for service_service_packages table (only if they don't exist)
SET @index_exists_pkg_service = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_service_packages' 
    AND INDEX_NAME = 'idx_service_service_packages_service'
);

SET @sql = IF(@index_exists_pkg_service = 0, 
    'CREATE INDEX idx_service_service_packages_service ON service_service_packages(service_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists_pkg_package = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_service_packages' 
    AND INDEX_NAME = 'idx_service_service_packages_package'
);

SET @sql = IF(@index_exists_pkg_package = 0, 
    'CREATE INDEX idx_service_service_packages_package ON service_service_packages(service_package_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 6: Remove the old service_type_id column from service_jobs
-- Since we now use junction tables, the direct foreign key is no longer needed
SET @fk_exists_type2 = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND CONSTRAINT_NAME = 'fk_service_jobs_has_service_type'
);

SET @sql = IF(@fk_exists_type2 > 0, 
    'ALTER TABLE service_jobs DROP FOREIGN KEY fk_service_jobs_has_service_type',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop index if exists
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

-- Drop column if exists
SET @column_exists_type = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND COLUMN_NAME = 'service_type_id'
);

SET @sql = IF(@column_exists_type > 0, 
    'ALTER TABLE service_jobs DROP COLUMN service_type_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- If all commands succeeded, commit the transaction
COMMIT;

-- Note: If any error occurs, the transaction will automatically rollback
-- To manually rollback if needed: ROLLBACK;
