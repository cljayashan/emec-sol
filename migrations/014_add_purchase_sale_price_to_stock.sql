-- Migration: Add purchase_price and sale_price to stock table
-- Version: 014
-- Run this migration to add purchase and sale price tracking to stock batches
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

-- Add purchase_price and sale_price columns to stock table
ALTER TABLE stock 
ADD COLUMN purchase_price DECIMAL(10,2) DEFAULT 0 AFTER available_quantity,
ADD COLUMN sale_price DECIMAL(10,2) DEFAULT 0 AFTER purchase_price;

-- Add comments for documentation
ALTER TABLE stock 
MODIFY COLUMN purchase_price DECIMAL(10,2) DEFAULT 0 COMMENT 'Purchase price per unit for this batch',
MODIFY COLUMN sale_price DECIMAL(10,2) DEFAULT 0 COMMENT 'Sale price per unit for this batch';
