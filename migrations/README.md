# Database Migrations

This folder contains database migration scripts that should be run sequentially in order.

## Migration Files

- **001_add_vehicle_brands.sql** - Adds vehicle_brands table and updates items table to use brand_id
- **002_add_vehicle_models.sql** - Adds vehicle_models table with foreign key to vehicle_brands
- **003_add_vehicles.sql** - Adds vehicles table for vehicle registration with foreign keys to vehicle_brands and vehicle_models
- **004_add_customers.sql** - Adds customers table for customer management
- **005_add_remarks_to_vehicles.sql** - Adds remarks column to vehicles table
- **006_add_service_types.sql** - Adds service_types table for managing service types

## How to Run Migrations

1. Run migrations in sequential order (001, 002, etc.)
2. Each migration script is idempotent (safe to run multiple times)
3. Run each script in your MySQL client (MySQL Workbench, phpMyAdmin, or command line)

## Important Notes

- Always backup your database before running migrations
- Run migrations in a test environment first
- Check for any errors after running each migration
- Some migrations may have dependencies on previous ones (e.g., 002 depends on 001)

