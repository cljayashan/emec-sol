import express from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController.js';
import { validate, validateSupplier } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.post('/', validate(validateSupplier), createSupplier);
router.put('/:id', validate(validateSupplier), updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;

