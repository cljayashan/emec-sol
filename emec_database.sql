-- Create database
CREATE DATABASE IF NOT EXISTS emec_db;
USE emec_db;

-- Suppliers Table
CREATE TABLE suppliers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Delivery Persons Table
CREATE TABLE delivery_persons (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Item Categories Table
CREATE TABLE item_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Items Table
CREATE TABLE items (
    id VARCHAR(36) PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(255),
    category_id VARCHAR(36),
    barcode VARCHAR(100) UNIQUE,
    measurement_unit VARCHAR(50),
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES item_categories(id)
);

-- Purchase Bills Table
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
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Purchase Bill Items Table
CREATE TABLE purchase_bill_items (
    id VARCHAR(36) PRIMARY KEY,
    purchase_bill_id VARCHAR(36),
    item_id VARCHAR(36),
    batch_number VARCHAR(100),
    quantity DECIMAL(10,2),
    free_quantity DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_bill_id) REFERENCES purchase_bills(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Stock Table (Batch-wise)
CREATE TABLE stock (
    id VARCHAR(36) PRIMARY KEY,
    item_id VARCHAR(36),
    batch_number VARCHAR(100),
    quantity DECIMAL(10,2),
    available_quantity DECIMAL(10,2),
    purchase_bill_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (purchase_bill_id) REFERENCES purchase_bills(id)
);

-- Sale Bills Table
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
);

-- Sale Bill Items Table
CREATE TABLE sale_bill_items (
    id VARCHAR(36) PRIMARY KEY,
    sale_bill_id VARCHAR(36),
    item_id VARCHAR(36),
    batch_number VARCHAR(100),
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    labour_charge DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_bill_id) REFERENCES sale_bills(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Payment Details Table
CREATE TABLE payment_details (
    id VARCHAR(36) PRIMARY KEY,
    sale_bill_id VARCHAR(36),
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
    FOREIGN KEY (sale_bill_id) REFERENCES sale_bills(id)
);

-- Quotations Table
CREATE TABLE quotations (
    id VARCHAR(36) PRIMARY KEY,
    quotation_number VARCHAR(100) UNIQUE NOT NULL,
    quotation_date DATE NOT NULL,
    customer_name VARCHAR(255),
    customer_contact VARCHAR(100),
    subtotal DECIMAL(10,2),
    labour_charge DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2),
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Quotation Items Table
CREATE TABLE quotation_items (
    id VARCHAR(36) PRIMARY KEY,
    quotation_id VARCHAR(36),
    item_id VARCHAR(36),
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    labour_charge DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Stock Adjustment Table
CREATE TABLE stock_adjustments (
    id VARCHAR(36) PRIMARY KEY,
    item_id VARCHAR(36),
    batch_number VARCHAR(100),
    old_quantity DECIMAL(10,2),
    new_quantity DECIMAL(10,2),
    adjustment_quantity DECIMAL(10,2),
    reason TEXT,
    adjusted_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Bill Templates Table
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
);

-- Users Table
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
);

-- Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_items_barcode ON items(barcode);
CREATE INDEX idx_purchase_bills_date ON purchase_bills(purchase_date);
CREATE INDEX idx_sale_bills_date ON sale_bills(sale_date);
CREATE INDEX idx_stock_item_batch ON stock(item_id, batch_number);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

