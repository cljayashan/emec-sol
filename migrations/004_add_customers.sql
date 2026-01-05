-- Migration: Add customers table
-- Version: 004
-- Run this migration to add customer management support
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    name_with_initials VARCHAR(255),
    nic VARCHAR(50) UNIQUE,
    mobile1 VARCHAR(20),
    mobile2 VARCHAR(20),
    address TEXT,
    email_address VARCHAR(255),
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_customers_nic ON customers(nic);
CREATE INDEX idx_customers_email ON customers(email_address);
CREATE INDEX idx_customers_mobile1 ON customers(mobile1);
CREATE INDEX idx_customers_full_name ON customers(full_name);

