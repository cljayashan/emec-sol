-- Migration: Add customer foreign keys to vehicles and quotations tables
-- Version: 010
-- Run this migration to replace direct customer storage with foreign key references
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

-- ============================================
-- PART 1: Update vehicles table
-- ============================================

-- Step 1: Add customer_id column (nullable initially) if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'vehicles';
SET @columnname = 'customer_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(36) NULL AFTER customer')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Step 2: Migrate existing customer data to customer_id (only if customer column still exists)
-- Check if customer column exists and migrate data
SET @columnname_customer = 'customer';
SET @column_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE
    (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = @tablename)
    AND (COLUMN_NAME = @columnname_customer)
);

-- Temporarily disable safe update mode for this UPDATE
SET @old_safe_updates = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- Conditionally execute UPDATE
SET @sql = IF(@column_exists > 0,
  'UPDATE vehicles v LEFT JOIN customers c ON v.customer = c.full_name SET v.customer_id = c.id WHERE v.customer IS NOT NULL AND v.customer != \'\'',
  'SELECT 1 as skipped'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Restore safe update mode
SET SQL_SAFE_UPDATES = @old_safe_updates;

-- Step 3: Add foreign key constraint if it doesn't exist
SET @constraintname = 'fk_vehicles_customer';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (CONSTRAINT_NAME = @constraintname)
      AND (CONSTRAINT_TYPE = 'FOREIGN KEY')
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @constraintname, ' FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Step 4: Remove the old customer column if it exists
SET @columnname_customer = 'customer';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname_customer)
  ) > 0,
  CONCAT('ALTER TABLE ', @tablename, ' DROP COLUMN ', @columnname_customer),
  'SELECT 1'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- Step 5: Remove old index if it exists and create new one
SET @old_indexname = 'idx_vehicles_customer';
SET @index_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE
    (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = 'vehicles')
    AND (INDEX_NAME = @old_indexname)
);
SET @preparedStatement = IF(@index_exists > 0,
  CONCAT('DROP INDEX ', @old_indexname, ' ON vehicles'),
  'SELECT 1'
);
PREPARE dropIfExists FROM @preparedStatement;
EXECUTE dropIfExists;
DEALLOCATE PREPARE dropIfExists;

SET @indexname = 'idx_vehicles_customer_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = 'vehicles')
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX ', @indexname, ' ON vehicles(customer_id)')
));
PREPARE createIfNotExists FROM @preparedStatement;
EXECUTE createIfNotExists;
DEALLOCATE PREPARE createIfNotExists;

-- ============================================
-- PART 2: Update quotations table
-- ============================================

-- Step 1: Add customer_id column (nullable initially) if it doesn't exist
SET @tablename = 'quotations';
SET @columnname = 'customer_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(36) NULL AFTER quotation_date')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Step 2: Migrate existing customer data to customer_id (only if old columns exist)
-- Check if old customer columns exist and migrate data
SET @column_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE
    (TABLE_SCHEMA = @dbname)
    AND (TABLE_NAME = @tablename)
    AND (COLUMN_NAME IN ('customer_name', 'customer_contact'))
);

-- Temporarily disable safe update mode for this UPDATE
SET @old_safe_updates = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- Conditionally execute UPDATE
SET @sql = IF(@column_exists > 0,
  'UPDATE quotations q LEFT JOIN customers c ON q.customer_name = c.full_name OR q.customer_contact = c.mobile1 OR q.customer_contact = c.mobile2 SET q.customer_id = c.id WHERE q.customer_name IS NOT NULL OR q.customer_contact IS NOT NULL',
  'SELECT 1 as skipped'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Restore safe update mode
SET SQL_SAFE_UPDATES = @old_safe_updates;

-- Step 3: Add foreign key constraint if it doesn't exist
SET @constraintname = 'fk_quotations_customer';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (CONSTRAINT_NAME = @constraintname)
      AND (CONSTRAINT_TYPE = 'FOREIGN KEY')
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @constraintname, ' FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Step 4: Remove the old customer columns if they exist
SET @columnname_customer_name = 'customer_name';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname_customer_name)
  ) > 0,
  CONCAT('ALTER TABLE ', @tablename, ' DROP COLUMN ', @columnname_customer_name),
  'SELECT 1'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

SET @columnname_customer_contact = 'customer_contact';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname_customer_contact)
  ) > 0,
  CONCAT('ALTER TABLE ', @tablename, ' DROP COLUMN ', @columnname_customer_contact),
  'SELECT 1'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

-- Step 5: Create index for better query performance
SET @indexname = 'idx_quotations_customer_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = 'quotations')
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX ', @indexname, ' ON quotations(customer_id)')
));
PREPARE createIfNotExists FROM @preparedStatement;
EXECUTE createIfNotExists;
DEALLOCATE PREPARE createIfNotExists;

