-- Migration: Add service_jobs table
-- Version: 009
-- Run this migration to add service job management support
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

USE emec_db;

-- Create Service Jobs Table
CREATE TABLE IF NOT EXISTS service_jobs (
    id VARCHAR(36) PRIMARY KEY,
    job_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id VARCHAR(36) NOT NULL,
    service_type_id VARCHAR(36),
    fuel_level VARCHAR(50),
    odometer_reading DECIMAL(10,2),
    remarks TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT
);

-- Create Service Job Defects Table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS service_job_defects (
    id VARCHAR(36) PRIMARY KEY,
    service_job_id VARCHAR(36) NOT NULL,
    vehicle_defect_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_job_id) REFERENCES service_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_defect_id) REFERENCES vehicle_defects(id) ON DELETE RESTRICT
);

-- Create Service Job Recommendations Table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS service_job_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    service_job_id VARCHAR(36) NOT NULL,
    pre_inspection_recommendation_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_job_id) REFERENCES service_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (pre_inspection_recommendation_id) REFERENCES pre_inspection_recommendations(id) ON DELETE RESTRICT
);

-- Create indexes for better query performance
CREATE INDEX idx_service_jobs_vehicle ON service_jobs(vehicle_id);
CREATE INDEX idx_service_jobs_service_type ON service_jobs(service_type_id);
CREATE INDEX idx_service_jobs_job_number ON service_jobs(job_number);
CREATE INDEX idx_service_jobs_status ON service_jobs(status);
CREATE INDEX idx_service_job_defects_job ON service_job_defects(service_job_id);
CREATE INDEX idx_service_job_recommendations_job ON service_job_recommendations(service_job_id);

