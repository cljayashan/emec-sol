# Database Migrations

This folder contains database migration scripts that should be run sequentially in order.

## Migration Files

- **000_create_complete_database_innodb.sql** - Complete database creation script with all tables using InnoDB engine and all foreign keys (WARNING: Drops existing database - backup data first!)
- **001_add_vehicle_brands.sql** - Adds vehicle_brands table and updates items table to use brand_id
- **002_add_vehicle_models.sql** - Adds vehicle_models table with foreign key to vehicle_brands
- **003_add_vehicles.sql** - Adds vehicles table for vehicle registration with foreign keys to vehicle_brands and vehicle_models
- **004_add_customers.sql** - Adds customers table for customer management
- **005_add_remarks_to_vehicles.sql** - Adds remarks column to vehicles table
- **006_add_service_types.sql** - Adds service_types table for managing service types
- **007_add_vehicle_defects.sql** - Adds vehicle_defects table for managing vehicle defects
- **008_add_pre_inspection_recommendations.sql** - Adds pre_inspection_recommendations table for managing pre inspection recommendations
- **009_add_service_jobs.sql** - Adds service_jobs table and related tables for service job management
- **010_add_customer_foreign_keys.sql** - Adds customer_id foreign keys to vehicles and quotations tables, replacing direct customer storage
- **011_add_vehicle_foreign_keys.sql** - Ensures all foreign key constraints exist for customer_id, brand_id, and model_id in vehicles table (NOTE: Tables must be InnoDB - MyISAM doesn't support foreign keys. Migration will verify this)
- **013_add_service_job_items.sql** - Adds service_job_items table for managing parts/items that need to be replaced during service jobs, with support for labour charges
- **014_add_purchase_sale_price_to_stock.sql** - Adds purchase_price and sale_price columns to stock table for batchwise price tracking
- **015_add_services.sql** - Adds services table for managing services with name, price, and remarks
- **018_rename_service_types_to_service_packages.sql** - Renames service_types table to service_packages and updates all related foreign keys, indexes, and column names (uses transactions with rollback on failure)

## How to Run Migrations

1. Run migrations in sequential order (001, 002, etc.)
2. Each migration script is idempotent (safe to run multiple times)
3. Run each script in your MySQL client (MySQL Workbench, phpMyAdmin, or command line)

## Important Notes

- Always backup your database before running migrations
- Run migrations in a test environment first
- Check for any errors after running each migration
- Some migrations may have dependencies on previous ones (e.g., 002 depends on 001)

