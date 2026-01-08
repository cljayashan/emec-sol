-- Complete Database Creation Script with InnoDB Engine
-- Version: 000
-- This script creates the entire database from scratch with all tables using InnoDB engine
-- IMPORTANT: This will DROP existing database if it exists. BACKUP YOUR DATA FIRST!
-- IMPORTANT: Run this script in your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command line)

-- ============================================
-- DATABASE RELATIONSHIPS OVERVIEW
-- ============================================
-- 
-- CORE REFERENCE TABLES (No dependencies):
--   - suppliers
--   - delivery_persons
--   - item_categories
--   - vehicle_brands
--   - service_types
--   - vehicle_defects
--   - pre_inspection_recommendations
--   - customers
--   - users
--   - bill_templates
--
-- VEHICLE RELATIONSHIPS:
--   vehicle_brands (1) --> (N) vehicle_models [brand_id]
--   vehicle_brands (1) --> (N) vehicles [brand_id]
--   vehicle_brands (1) --> (N) items [brand_id]
--   vehicle_models (1) --> (N) vehicles [model_id]
--   customers (1) --> (N) vehicles [customer_id]
--   vehicles (1) --> (N) service_jobs [vehicle_id]
--
-- ITEM RELATIONSHIPS:
--   item_categories (1) --> (N) items [category_id]
--   vehicle_brands (1) --> (N) items [brand_id]
--   items (1) --> (N) purchase_bill_items [item_id]
--   items (1) --> (N) sale_bill_items [item_id]
--   items (1) --> (N) quotation_items [item_id]
--   items (1) --> (N) stock [item_id]
--   items (1) --> (N) stock_adjustments [item_id]
--
-- PURCHASE RELATIONSHIPS:
--   suppliers (1) --> (N) purchase_bills [supplier_id]
--   purchase_bills (1) --> (N) purchase_bill_items [purchase_bill_id]
--   purchase_bills (1) --> (N) stock [purchase_bill_id]
--
-- SALE RELATIONSHIPS:
--   sale_bills (1) --> (N) sale_bill_items [sale_bill_id]
--   sale_bills (1) --> (N) payment_details [sale_bill_id]
--
-- QUOTATION RELATIONSHIPS:
--   customers (1) --> (N) quotations [customer_id]
--   quotations (1) --> (N) quotation_items [quotation_id]
--
-- SERVICE JOB RELATIONSHIPS:
--   vehicles (1) --> (N) service_jobs [vehicle_id]
--   service_types (1) --> (N) service_jobs [service_type_id]
--   service_jobs (N) <--> (N) vehicle_defects [service_job_defects junction table]
--   service_jobs (N) <--> (N) pre_inspection_recommendations [service_job_recommendations junction table]
--
-- USER RELATIONSHIPS:
--   users (1) --> (N) refresh_tokens [user_id]
--
-- ============================================

-- Drop and create database
DROP DATABASE IF EXISTS emec_db;
CREATE DATABASE emec_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE emec_db;

-- ============================================
-- Core Reference Tables (No dependencies)
-- ============================================

-- Suppliers Table
-- Relationships:
--   - One-to-Many: purchase_bills (supplier_id)
CREATE TABLE suppliers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delivery Persons Table
-- Relationships:
--   - (Currently no foreign key relationships - can be added later if needed)
CREATE TABLE delivery_persons (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Item Categories Table
-- Relationships:
--   - One-to-Many: items (category_id)
CREATE TABLE item_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vehicle Brands Table
-- Relationships:
--   - One-to-Many: vehicle_models (brand_id)
--   - One-to-Many: vehicles (brand_id)
--   - One-to-Many: items (brand_id)
CREATE TABLE vehicle_brands (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service Types Table
-- Relationships:
--   - One-to-Many: service_jobs (service_type_id)
CREATE TABLE service_types (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vehicle Defects Table
-- Relationships:
--   - Many-to-Many: service_jobs (via service_job_defects junction table)
CREATE TABLE vehicle_defects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre Inspection Recommendations Table
-- Relationships:
--   - Many-to-Many: service_jobs (via service_job_recommendations junction table)
CREATE TABLE pre_inspection_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Dependent Reference Tables
-- ============================================

-- Vehicle Models Table
-- Relationships:
--   - Many-to-One: vehicle_brands (brand_id) [FK]
--   - One-to-Many: vehicles (model_id)
CREATE TABLE vehicle_models (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_models_belongs_to_brand FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customers Table
-- Relationships:
--   - One-to-Many: vehicles (customer_id)
--   - One-to-Many: quotations (customer_id)
CREATE TABLE customers (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Items Table
-- Relationships:
--   - Many-to-One: item_categories (category_id) [FK]
--   - Many-to-One: vehicle_brands (brand_id) [FK]
--   - One-to-Many: purchase_bill_items (item_id)
--   - One-to-Many: sale_bill_items (item_id)
--   - One-to-Many: quotation_items (item_id)
--   - One-to-Many: stock (item_id)
--   - One-to-Many: stock_adjustments (item_id)
CREATE TABLE items (
    id VARCHAR(36) PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(255),
    brand_id VARCHAR(36),
    category_id VARCHAR(36),
    barcode VARCHAR(100) UNIQUE,
    measurement_unit VARCHAR(50),
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_items_has_category FOREIGN KEY (category_id) REFERENCES item_categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_items_has_brand FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vehicles Table
-- Relationships:
--   - Many-to-One: customers (customer_id) [FK]
--   - Many-to-One: vehicle_brands (brand_id) [FK]
--   - Many-to-One: vehicle_models (model_id) [FK]
--   - One-to-Many: service_jobs (vehicle_id)
CREATE TABLE vehicles (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36),
    vehicle_type VARCHAR(100),
    reg_no VARCHAR(100) UNIQUE NOT NULL,
    brand_id VARCHAR(36) NOT NULL,
    model_id VARCHAR(36) NOT NULL,
    version VARCHAR(255),
    year_of_manufacture INT,
    year_of_registration INT,
    remarks TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicles_owned_by_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    CONSTRAINT fk_vehicles_has_brand FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id) ON DELETE RESTRICT,
    CONSTRAINT fk_vehicles_has_model FOREIGN KEY (model_id) REFERENCES vehicle_models(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Transaction Tables
-- ============================================

-- Purchase Bills Table
-- Relationships:
--   - Many-to-One: suppliers (supplier_id) [FK]
--   - One-to-Many: purchase_bill_items (purchase_bill_id)
--   - One-to-Many: stock (purchase_bill_id)
CREATE TABLE purchase_bills (
    id VARCHAR(36) PRIMARY KEY,
    bill_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id VARCHAR(36),
    purchase_date DATE NOT NULL,
    total_amount DECIMAL(10,2),
    status ENUM('active', 'cancelled') DEFAULT 'active',
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchase_bills_from_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Purchase Bill Items Table
-- Relationships:
--   - Many-to-One: purchase_bills (purchase_bill_id) [FK]
--   - Many-to-One: items (item_id) [FK]
CREATE TABLE purchase_bill_items (
    id VARCHAR(36) PRIMARY KEY,
    purchase_bill_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    batch_number VARCHAR(100),
    quantity DECIMAL(10,2),
    free_quantity DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchase_bill_items_belongs_to_bill FOREIGN KEY (purchase_bill_id) REFERENCES purchase_bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_purchase_bill_items_has_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Table
-- Relationships:
--   - Many-to-One: items (item_id) [FK]
--   - Many-to-One: purchase_bills (purchase_bill_id) [FK]
CREATE TABLE stock (
    id VARCHAR(36) PRIMARY KEY,
    item_id VARCHAR(36) NOT NULL,
    batch_number VARCHAR(100),
    quantity DECIMAL(10,2),
    available_quantity DECIMAL(10,2),
    purchase_bill_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_for_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT,
    CONSTRAINT fk_stock_from_purchase_bill FOREIGN KEY (purchase_bill_id) REFERENCES purchase_bills(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sale Bills Table
-- Relationships:
--   - One-to-Many: sale_bill_items (sale_bill_id)
--   - One-to-Many: payment_details (sale_bill_id)
CREATE TABLE sale_bills (
    id VARCHAR(36) PRIMARY KEY,
    bill_number VARCHAR(100) UNIQUE NOT NULL,
    sale_date DATE NOT NULL,
    subtotal DECIMAL(10,2),
    labour_charge DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2),
    payment_method ENUM('cash', 'card', 'bank_transfer', 'cheque'),
    status ENUM('active', 'cancelled') DEFAULT 'active',
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sale Bill Items Table
-- Relationships:
--   - Many-to-One: sale_bills (sale_bill_id) [FK]
--   - Many-to-One: items (item_id) [FK]
CREATE TABLE sale_bill_items (
    id VARCHAR(36) PRIMARY KEY,
    sale_bill_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    batch_number VARCHAR(100),
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    labour_charge DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sale_bill_items_belongs_to_bill FOREIGN KEY (sale_bill_id) REFERENCES sale_bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_sale_bill_items_has_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Details Table
-- Relationships:
--   - Many-to-One: sale_bills (sale_bill_id) [FK]
CREATE TABLE payment_details (
    id VARCHAR(36) PRIMARY KEY,
    sale_bill_id VARCHAR(36) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'cheque'),
    amount DECIMAL(10,2),
    bank_name VARCHAR(255),
    card_type VARCHAR(50),
    card_last_four VARCHAR(4),
    reference_number VARCHAR(255),
    cheque_date DATE,
    cheque_name VARCHAR(255),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_details_for_sale_bill FOREIGN KEY (sale_bill_id) REFERENCES sale_bills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quotations Table
-- Relationships:
--   - Many-to-One: customers (customer_id) [FK]
--   - One-to-Many: quotation_items (quotation_id)
CREATE TABLE quotations (
    id VARCHAR(36) PRIMARY KEY,
    quotation_number VARCHAR(100) UNIQUE NOT NULL,
    quotation_date DATE NOT NULL,
    customer_id VARCHAR(36),
    subtotal DECIMAL(10,2),
    labour_charge DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2),
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quotations_for_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quotation Items Table
-- Relationships:
--   - Many-to-One: quotations (quotation_id) [FK]
--   - Many-to-One: items (item_id) [FK]
CREATE TABLE quotation_items (
    id VARCHAR(36) PRIMARY KEY,
    quotation_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    labour_charge DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quotation_items_belongs_to_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    CONSTRAINT fk_quotation_items_has_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Adjustments Table
-- Relationships:
--   - Many-to-One: items (item_id) [FK]
CREATE TABLE stock_adjustments (
    id VARCHAR(36) PRIMARY KEY,
    item_id VARCHAR(36) NOT NULL,
    batch_number VARCHAR(100),
    old_quantity DECIMAL(10,2),
    new_quantity DECIMAL(10,2),
    adjustment_quantity DECIMAL(10,2),
    reason TEXT,
    adjusted_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_adjustments_for_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service Jobs Table
-- Relationships:
--   - Many-to-One: vehicles (vehicle_id) [FK]
--   - Many-to-One: service_types (service_type_id) [FK]
--   - Many-to-Many: vehicle_defects (via service_job_defects)
--   - Many-to-Many: pre_inspection_recommendations (via service_job_recommendations)
CREATE TABLE service_jobs (
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
    CONSTRAINT fk_service_jobs_for_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_service_jobs_has_service_type FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service Job Defects Table (Junction Table)
-- Relationships:
--   - Many-to-One: service_jobs (service_job_id) [FK]
--   - Many-to-One: vehicle_defects (vehicle_defect_id) [FK]
--   - This table creates a Many-to-Many relationship between service_jobs and vehicle_defects
CREATE TABLE service_job_defects (
    id VARCHAR(36) PRIMARY KEY,
    service_job_id VARCHAR(36) NOT NULL,
    vehicle_defect_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_job_defects_belongs_to_job FOREIGN KEY (service_job_id) REFERENCES service_jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_service_job_defects_has_defect FOREIGN KEY (vehicle_defect_id) REFERENCES vehicle_defects(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service Job Recommendations Table (Junction Table)
-- Relationships:
--   - Many-to-One: service_jobs (service_job_id) [FK]
--   - Many-to-One: pre_inspection_recommendations (pre_inspection_recommendation_id) [FK]
--   - This table creates a Many-to-Many relationship between service_jobs and pre_inspection_recommendations
CREATE TABLE service_job_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    service_job_id VARCHAR(36) NOT NULL,
    pre_inspection_recommendation_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_job_recommendations_belongs_to_job FOREIGN KEY (service_job_id) REFERENCES service_jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_service_job_recommendations_has_recommendation FOREIGN KEY (pre_inspection_recommendation_id) REFERENCES pre_inspection_recommendations(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- System Tables
-- ============================================

-- Bill Templates Table
-- Relationships:
--   - (Reference table - no foreign key relationships)
CREATE TABLE bill_templates (
    id VARCHAR(36) PRIMARY KEY,
    template_type ENUM('purchase', 'sale') NOT NULL,
    company_name VARCHAR(255),
    motto TEXT,
    address TEXT,
    phone_numbers VARCHAR(255),
    email VARCHAR(255),
    logo_path VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
-- Relationships:
--   - One-to-Many: refresh_tokens (user_id)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('admin', 'user', 'manager') DEFAULT 'user',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh Tokens Table
-- Relationships:
--   - Many-to-One: users (user_id) [FK]
CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_belongs_to_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Indexes for Performance
-- ============================================

-- Items indexes
CREATE INDEX idx_items_barcode ON items(barcode);
CREATE INDEX idx_items_brand_id ON items(brand_id);
CREATE INDEX idx_items_category_id ON items(category_id);

-- Purchase Bills indexes
CREATE INDEX idx_purchase_bills_date ON purchase_bills(purchase_date);
CREATE INDEX idx_purchase_bills_supplier ON purchase_bills(supplier_id);
CREATE INDEX idx_purchase_bill_items_bill ON purchase_bill_items(purchase_bill_id);
CREATE INDEX idx_purchase_bill_items_item ON purchase_bill_items(item_id);

-- Sale Bills indexes
CREATE INDEX idx_sale_bills_date ON sale_bills(sale_date);
CREATE INDEX idx_sale_bill_items_bill ON sale_bill_items(sale_bill_id);
CREATE INDEX idx_sale_bill_items_item ON sale_bill_items(item_id);

-- Stock indexes
CREATE INDEX idx_stock_item_batch ON stock(item_id, batch_number);
CREATE INDEX idx_stock_item ON stock(item_id);

-- Quotations indexes
CREATE INDEX idx_quotations_date ON quotations(quotation_date);
CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotation_items_quotation ON quotation_items(quotation_id);
CREATE INDEX idx_quotation_items_item ON quotation_items(item_id);

-- Vehicles indexes
CREATE INDEX idx_vehicles_reg_no ON vehicles(reg_no);
CREATE INDEX idx_vehicles_brand_id ON vehicles(brand_id);
CREATE INDEX idx_vehicles_model_id ON vehicles(model_id);
CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);

-- Vehicle Models indexes
CREATE INDEX idx_vehicle_models_brand_id ON vehicle_models(brand_id);
CREATE INDEX idx_vehicle_models_name ON vehicle_models(name);

-- Customers indexes
CREATE INDEX idx_customers_nic ON customers(nic);
CREATE INDEX idx_customers_email ON customers(email_address);
CREATE INDEX idx_customers_mobile1 ON customers(mobile1);
CREATE INDEX idx_customers_full_name ON customers(full_name);

-- Service Jobs indexes
CREATE INDEX idx_service_jobs_vehicle ON service_jobs(vehicle_id);
CREATE INDEX idx_service_jobs_service_type ON service_jobs(service_type_id);
CREATE INDEX idx_service_jobs_job_number ON service_jobs(job_number);
CREATE INDEX idx_service_jobs_status ON service_jobs(status);
CREATE INDEX idx_service_job_defects_job ON service_job_defects(service_job_id);
CREATE INDEX idx_service_job_recommendations_job ON service_job_recommendations(service_job_id);

-- Users indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================
-- Verification
-- ============================================

-- Show all tables with their engines
SELECT 
    TABLE_NAME,
    ENGINE,
    TABLE_ROWS,
    TABLE_COLLATION
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = 'emec_db'
ORDER BY 
    TABLE_NAME;

-- Show all foreign keys
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'emec_db'
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY 
    TABLE_NAME, CONSTRAINT_NAME;

