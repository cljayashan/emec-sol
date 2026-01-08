-- Migration: Ensure service_package_id column exists in service_jobs table
-- Version: 020
-- This migration ensures the service_jobs table has service_package_id column
-- It will create it if it doesn't exist, or rename service_type_id if that exists
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

START TRANSACTION;

-- Step 1: Check current state
SET @has_package_id = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND COLUMN_NAME = 'service_package_id'
);

SET @has_type_id = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND COLUMN_NAME = 'service_type_id'
);

-- Step 2: If service_package_id doesn't exist, create it or rename from service_type_id
-- Case 1: service_type_id exists but service_package_id doesn't - rename it
SET @sql = IF(@has_package_id = 0 AND @has_type_id > 0, 
    'ALTER TABLE service_jobs CHANGE COLUMN service_type_id service_package_id VARCHAR(36)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Case 2: Neither exists - create service_package_id (shouldn't happen, but just in case)
SET @sql = IF(@has_package_id = 0 AND @has_type_id = 0, 
    'ALTER TABLE service_jobs ADD COLUMN service_package_id VARCHAR(36) NULL AFTER vehicle_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Drop old foreign key if it exists (for service_type_id)
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

-- Step 4: Drop old index if it exists (for service_type_id)
SET @idx_type_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND INDEX_NAME = 'idx_service_jobs_service_type'
);

SET @sql = IF(@idx_type_exists > 0, 
    'DROP INDEX idx_service_jobs_service_type ON service_jobs',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Verify service_packages table exists
SET @packages_table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_packages'
);

-- Step 6: Re-verify service_package_id column now exists (after potential rename/create)
-- Query again to get the current state after ALTER TABLE commands
SELECT COUNT(*) INTO @package_id_now_exists
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'emec_db' 
AND TABLE_NAME = 'service_jobs' 
AND COLUMN_NAME = 'service_package_id';

-- Step 7: Add foreign key constraint if service_packages table exists and FK doesn't exist
SET @fk_package_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND CONSTRAINT_NAME = 'fk_service_jobs_has_service_package'
);

SET @sql = IF(@package_id_now_exists > 0 AND @packages_table_exists > 0 AND @fk_package_exists = 0, 
    'ALTER TABLE service_jobs ADD CONSTRAINT fk_service_jobs_has_service_package FOREIGN KEY (service_package_id) REFERENCES service_packages(id) ON DELETE RESTRICT',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 8: Create index if it doesn't exist
SET @idx_package_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'emec_db' 
    AND TABLE_NAME = 'service_jobs' 
    AND INDEX_NAME = 'idx_service_jobs_service_package'
);

SET @sql = IF(@package_id_now_exists > 0 AND @idx_package_exists = 0, 
    'CREATE INDEX idx_service_jobs_service_package ON service_jobs(service_package_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 9: Final verification
SELECT 
    'Migration Status' as status,
    CASE 
        WHEN @package_id_now_exists > 0 THEN '✓ service_package_id column exists'
        ELSE '✗ service_package_id column missing'
    END as column_status,
    CASE 
        WHEN @packages_table_exists > 0 THEN '✓ service_packages table exists'
        ELSE '✗ service_packages table missing'
    END as table_status,
    CASE 
        WHEN @fk_package_exists > 0 OR (@package_id_now_exists > 0 AND @packages_table_exists > 0) THEN '✓ Foreign key configured'
        ELSE '⚠ Foreign key not configured'
    END as fk_status;

COMMIT;

-- If you encounter any errors, you can rollback by uncommenting the line below
-- and commenting out COMMIT above
-- ROLLBACK;
