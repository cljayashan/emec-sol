-- Migration: Add vehicle_brands table and update items table
-- Version: 001
-- Run this migration to add vehicle brand support
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

-- Step 1: Create Vehicle Brands Table
CREATE TABLE IF NOT EXISTS vehicle_brands (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 2: Add brand_id column to items table
-- Note: If you get an error that the column already exists, you can skip this step
ALTER TABLE items ADD COLUMN brand_id VARCHAR(36) AFTER brand;

-- Step 3: Add foreign key constraint
-- Note: If you get an error that the constraint already exists, you can skip this step
-- If the constraint already exists with a different name, you may need to drop it first:
-- ALTER TABLE items DROP FOREIGN KEY fk_items_brand;
ALTER TABLE items ADD CONSTRAINT fk_items_brand FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id);

-- Migrate existing brand data (if any)
-- This will create vehicle brand records from existing brand text values
INSERT INTO vehicle_brands (id, name, description, is_deleted, created_at, updated_at)
SELECT 
    UUID() as id,
    brand as name,
    NULL as description,
    0 as is_deleted,
    NOW() as created_at,
    NOW() as updated_at
FROM items
WHERE brand IS NOT NULL AND brand != '' AND brand_id IS NULL
GROUP BY brand;

-- Update items table to set brand_id based on brand name
UPDATE items i
INNER JOIN vehicle_brands b ON i.brand = b.name
SET i.brand_id = b.id
WHERE i.brand IS NOT NULL AND i.brand != '' AND i.brand_id IS NULL;

-- Note: After migration, you can drop the brand column if desired:
-- ALTER TABLE items DROP COLUMN brand;

