import express from 'express';
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
} from '../controllers/brandController.js';
import { validate, validateBrand } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllBrands);
router.get('/:id', getBrandById);
router.post('/', validate(validateBrand), createBrand);
router.put('/:id', validate(validateBrand), updateBrand);
router.delete('/:id', deleteBrand);

export default router;

