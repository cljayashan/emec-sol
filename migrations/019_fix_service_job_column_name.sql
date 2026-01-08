-- Migration: Fix Service Job Column Name
-- Version: 019
-- This migration ensures service_jobs table has the correct column name (service_package_id)
-- It will rename service_type_id to service_package_id if needed
-- IMPORTANT: This script uses transactions - if any command fails, all changes will be rolled back
-- Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

START TRANSACTION;

-- Step 1: Check if service_package_id column already exists
SET @package_id_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND COLUMN_NAME = 'service_package_id'
);

-- Step 2: Check if service_type_id column exists
SET @type_id_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND COLUMN_NAME = 'service_type_id'
);

-- Step 3: If service_package_id doesn't exist but service_type_id does, rename it
SET @sql = IF(@package_id_exists = 0 AND @type_id_exists > 0, 
    'ALTER TABLE service_jobs CHANGE COLUMN service_type_id service_package_id VARCHAR(36)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Drop old foreign key constraint if it exists (service_type_id)
SET @fk_type_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND CONSTRAINT_NAME = 'fk_service_jobs_has_service_type'
);

SET @sql = IF(@fk_type_exists > 0, 
    'ALTER TABLE service_jobs DROP FOREIGN KEY fk_service_jobs_has_service_type',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Drop old index if it exists (service_type_id)
SET @index_type_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND INDEX_NAME = 'idx_service_jobs_service_type'
);

SET @sql = IF(@index_type_exists > 0, 
    'DROP INDEX idx_service_jobs_service_type ON service_jobs',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 6: Verify service_packages table exists
SET @packages_table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_packages'
);

-- Step 7: Add foreign key constraint for service_package_id (if column exists and table exists)
SET @package_id_exists_after = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND COLUMN_NAME = 'service_package_id'
);

SET @fk_package_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND CONSTRAINT_NAME = 'fk_service_jobs_has_service_package'
);

SET @sql = IF(@package_id_exists_after > 0 AND @packages_table_exists > 0 AND @fk_package_exists = 0, 
    'ALTER TABLE service_jobs ADD CONSTRAINT fk_service_jobs_has_service_package FOREIGN KEY (service_package_id) REFERENCES service_packages(id) ON DELETE RESTRICT',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 8: Create index for service_package_id (if column exists and index doesn't exist)
SET @index_package_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND INDEX_NAME = 'idx_service_jobs_service_package'
);

SET @sql = IF(@package_id_exists_after > 0 AND @index_package_exists = 0, 
    'CREATE INDEX idx_service_jobs_service_package ON service_jobs(service_package_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 9: Verify the changes
SELECT 
    CASE 
        WHEN @package_id_exists_after > 0 THEN 'SUCCESS: service_package_id column exists'
        ELSE 'WARNING: service_package_id column does not exist'
    END as column_status,
    CASE 
        WHEN @packages_table_exists > 0 THEN 'SUCCESS: service_packages table exists'
        ELSE 'WARNING: service_packages table does not exist'
    END as table_status;

COMMIT;

-- If you need to rollback, uncomment the line below and comment out COMMIT above
-- ROLLBACK;
