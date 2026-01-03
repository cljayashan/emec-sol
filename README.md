# EMEC Vehicle Service Station Management System

A comprehensive full-stack Management Information System for vehicle service station operations.

## Project Structure

```
emec/
├── emec-be/          # Backend (Node.js/Express)
├── emec-fe/          # Frontend (React)
└── emec_database.sql # Database schema
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Database Setup

1. Make sure MySQL is running on `localhost` with user `root` and password `123`
2. Run the SQL script to create the database:

```bash
mysql -u root -p123 < emec_database.sql
```

Or manually execute the SQL file in your MySQL client.

## Backend Setup

1. Navigate to the backend directory:
```bash
cd emec-be
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in `emec-be/` directory (if not already created):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123
DB_NAME=emec_db
PORT=3000
```

4. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd emec-fe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Features

### Master Data Management
- **Suppliers**: Manage supplier information
- **Delivery Persons**: Manage delivery person details
- **Item Categories**: Organize items by categories
- **Items**: Complete item master with barcode support

### Transaction Management
- **Purchases**: 
  - Create purchase bills with multiple items
  - Batch management
  - Free quantity support
  - Automatic stock update
  - Purchase bill printing (PDF)
  - Cancel purchases with stock reversal

- **Sales**:
  - Barcode-based item selection
  - FIFO batch selection
  - Variable labour charges (item-level and bill-level)
  - Multiple payment methods (Cash, Card, Bank Transfer, Cheque)
  - Bill-level discounts
  - Sale bill printing (PDF)
  - Cancel sales with stock reversal

- **Quotations**:
  - Create quotations for customers
  - Similar to sales but without payment
  - No stock update
  - Status tracking (Pending, Accepted, Rejected)

### Stock Management
- **Stock List**: View all stock with batch-wise details
- **Stock Adjustment**: Adjust stock quantities with reason tracking
- **FIFO**: Automatic FIFO batch selection for sales

### Reporting
- **Bill Templates**: Customize purchase and sale bill templates
  - Company name, motto, address
  - Phone numbers, email
  - Logo support

## API Endpoints

### Suppliers
- `GET /api/suppliers` - List all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier (soft delete)

### Items
- `GET /api/items` - List all items
- `GET /api/items/:id` - Get item by ID
- `GET /api/items/barcode/:barcode` - Get item by barcode
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Purchases
- `GET /api/purchases` - List all purchases
- `GET /api/purchases/:id` - Get purchase by ID
- `GET /api/purchases/:id/print` - Print purchase bill (PDF)
- `POST /api/purchases` - Create purchase
- `PUT /api/purchases/:id/cancel` - Cancel purchase

### Sales
- `GET /api/sales` - List all sales
- `GET /api/sales/:id` - Get sale by ID
- `GET /api/sales/:id/print` - Print sale bill (PDF)
- `POST /api/sales` - Create sale
- `PUT /api/sales/:id/cancel` - Cancel sale

### Stock
- `GET /api/stock` - List all stock
- `GET /api/stock/batches/:itemId` - Get batches for an item
- `POST /api/stock/adjust` - Adjust stock

Similar endpoints exist for:
- Delivery Persons (`/api/delivery-persons`)
- Item Categories (`/api/item-categories`)
- Quotations (`/api/quotations`)
- Bill Templates (`/api/bill-templates`)

## Development Notes

- The backend uses ES6 modules (type: "module" in package.json)
- The frontend uses Vite for fast development
- All database operations use prepared statements to prevent SQL injection
- Transactions are used for operations that update multiple tables
- Soft deletes are implemented for master data
- Stock updates are automatic on purchase/sale creation/cancellation

## Troubleshooting

1. **Database Connection Error**: 
   - Verify MySQL is running
   - Check database credentials in `.env` file
   - Ensure database `emec_db` exists

2. **Port Already in Use**:
   - Change PORT in backend `.env` file
   - Update proxy in `emec-fe/vite.config.js` if needed

3. **CORS Issues**:
   - Backend CORS is configured to allow all origins in development
   - Adjust in production

## Production Deployment

1. Build the frontend:
```bash
cd emec-fe
npm run build
```

2. Serve the built files using a web server (nginx, Apache, etc.)

3. Set up environment variables properly in production

4. Use a process manager like PM2 for the backend:
```bash
pm2 start emec-be/src/app.js
```

## License

ISC

