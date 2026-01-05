import express from 'express';
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
} from '../controllers/brandController.js';
import { validate, validateBrand } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllBrands);
router.get('/:id', getBrandById);
router.post('/', validate(validateBrand), createBrand);
router.put('/:id', validate(validateBrand), updateBrand);
router.delete('/:id', deleteBrand);

export default router;

