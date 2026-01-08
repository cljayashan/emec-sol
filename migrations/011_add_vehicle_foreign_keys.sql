-- Migration: Add foreign keys for customer_id, brand_id, and model_id in vehicles table
-- Version: 011
-- Run this migration to ensure all foreign key constraints exist for the vehicles table
-- IMPORTANT: Tables must be InnoDB engine (MyISAM doesn't support foreign keys). This migration will verify and warn if not InnoDB.
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

SET @dbname = DATABASE();
SET @tablename = 'vehicles';

-- ============================================
-- Step 0: Verify table engine is InnoDB
-- ============================================

SELECT 
    TABLE_NAME,
    ENGINE
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename;

-- Check if vehicles table is InnoDB
SET @engine = (
  SELECT ENGINE 
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
);

SET @sql = IF(@engine != 'InnoDB',
  'SELECT "ERROR: vehicles table must be InnoDB to support foreign keys. Run migration 012_convert_vehicles_to_innodb.sql first!" as ErrorMessage',
  'SELECT "Table engine is InnoDB - proceeding with foreign key creation" as Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Step 1: Show current foreign keys (for debugging)
-- ============================================

SELECT 
    'Current Foreign Keys' as Info,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY 
    CONSTRAINT_NAME;

-- ============================================
-- Step 2: Drop existing foreign keys on customer_id, brand_id, and model_id (if any)
-- ============================================

-- Drop foreign key on customer_id
SET @fk_customer = (
  SELECT CONSTRAINT_NAME 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'customer_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);

SET @sql = IF(@fk_customer IS NOT NULL, 
  CONCAT('ALTER TABLE ', @tablename, ' DROP FOREIGN KEY ', @fk_customer),
  'SELECT 1 as "No existing FK on customer_id"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign key on brand_id
SET @fk_brand = (
  SELECT CONSTRAINT_NAME 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'brand_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);

SET @sql = IF(@fk_brand IS NOT NULL, 
  CONCAT('ALTER TABLE ', @tablename, ' DROP FOREIGN KEY ', @fk_brand),
  'SELECT 1 as "No existing FK on brand_id"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign key on model_id
SET @fk_model = (
  SELECT CONSTRAINT_NAME 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'model_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);

SET @sql = IF(@fk_model IS NOT NULL, 
  CONCAT('ALTER TABLE ', @tablename, ' DROP FOREIGN KEY ', @fk_model),
  'SELECT 1 as "No existing FK on model_id"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Step 3: Check for data integrity issues before adding foreign keys
-- ============================================

-- Check for invalid brand_id values
SELECT 
    'Data Integrity Check - Invalid brand_id' as CheckType,
    COUNT(*) as InvalidCount
FROM vehicles v 
LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id 
WHERE v.brand_id IS NOT NULL AND vb.id IS NULL AND v.is_deleted = 0;

-- Check for invalid model_id values
SELECT 
    'Data Integrity Check - Invalid model_id' as CheckType,
    COUNT(*) as InvalidCount
FROM vehicles v 
LEFT JOIN vehicle_models vm ON v.model_id = vm.id 
WHERE v.model_id IS NOT NULL AND vm.id IS NULL AND v.is_deleted = 0;

-- Check for invalid customer_id values (if column exists)
SET @column_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = 'customer_id'
);

SET @sql = IF(@column_exists > 0,
  'SELECT "Data Integrity Check - Invalid customer_id" as CheckType, COUNT(*) as InvalidCount FROM vehicles v LEFT JOIN customers c ON v.customer_id = c.id WHERE v.customer_id IS NOT NULL AND c.id IS NULL AND v.is_deleted = 0',
  'SELECT "customer_id column does not exist" as CheckType, 0 as InvalidCount'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Step 4: Add foreign keys
-- ============================================

-- Add foreign key for customer_id (if column exists)
SET @sql = IF(@column_exists > 0,
  'ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_customer_id FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL',
  'SELECT "customer_id column does not exist - skipping FK creation" as Message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for brand_id
ALTER TABLE vehicles 
ADD CONSTRAINT fk_vehicles_brand_id 
FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id) ON DELETE RESTRICT;

-- Add foreign key for model_id
ALTER TABLE vehicles 
ADD CONSTRAINT fk_vehicles_model_id 
FOREIGN KEY (model_id) REFERENCES vehicle_models(id) ON DELETE RESTRICT;

-- ============================================
-- Step 5: Verify foreign keys were created
-- ============================================

SELECT 
    'Final Foreign Keys' as Info,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY 
    CONSTRAINT_NAME;
