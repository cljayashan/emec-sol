-- Migration: Add service_job_items table for parts/items in service jobs
-- Version: 013
-- Run this migration to add parts/items management to service jobs
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

-- Create Service Job Items Table
-- This table stores parts/items that need to be replaced/repaired during service
CREATE TABLE IF NOT EXISTS service_job_items (
    id VARCHAR(36) PRIMARY KEY,
    service_job_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    batch_number VARCHAR(100),
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    labour_charge DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_job_items_belongs_to_job FOREIGN KEY (service_job_id) REFERENCES service_jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_service_job_items_has_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX idx_service_job_items_job ON service_job_items(service_job_id);
CREATE INDEX idx_service_job_items_item ON service_job_items(item_id);
