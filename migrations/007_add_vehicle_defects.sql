-- Migration: Add vehicle_defects table
-- Version: 007
-- Run this migration to add vehicle defects management support
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

-- Create Vehicle Defects Table
CREATE TABLE IF NOT EXISTS vehicle_defects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

