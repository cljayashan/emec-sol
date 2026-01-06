-- Migration: Add pre_inspection_recommendations table
-- Version: 008
-- Run this migration to add pre inspection recommendations management support
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

-- Create Pre Inspection Recommendations Table
CREATE TABLE IF NOT EXISTS pre_inspection_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

