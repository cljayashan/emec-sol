-- Migration: Add vehicles table for vehicle registration
-- Version: 003
-- Run this migration to add vehicle registration support
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

-- Create Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(36) PRIMARY KEY,
    customer VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(100),
    reg_no VARCHAR(100) UNIQUE NOT NULL,
    brand_id VARCHAR(36) NOT NULL,
    model_id VARCHAR(36) NOT NULL,
    version VARCHAR(255),
    year_of_manufacture INT,
    year_of_registration INT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id) ON DELETE RESTRICT,
    FOREIGN KEY (model_id) REFERENCES vehicle_models(id) ON DELETE RESTRICT
);

-- Create indexes for better query performance
CREATE INDEX idx_vehicles_reg_no ON vehicles(reg_no);
CREATE INDEX idx_vehicles_brand_id ON vehicles(brand_id);
CREATE INDEX idx_vehicles_model_id ON vehicles(model_id);
CREATE INDEX idx_vehicles_customer ON vehicles(customer);

