import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';
import { validate, validateCustomer } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', validate(validateCustomer), createCustomer);
router.put('/:id', validate(validateCustomer), updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;

