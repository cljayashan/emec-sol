import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/authRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import deliveryPersonRoutes from './routes/deliveryPersonRoutes.js';
import itemCategoryRoutes from './routes/itemCategoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import vehicleModelRoutes from './routes/vehicleModelRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import billTemplateRoutes from './routes/billTemplateRoutes.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes (add authenticate middleware as needed)
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/delivery-persons', deliveryPersonRoutes);
app.use('/api/item-categories', itemCategoryRoutes);
app.use('/api/vehicle-brands', brandRoutes);
app.use('/api/vehicle-models', vehicleModelRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/bill-templates', billTemplateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EMEC API is running' });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

