import express from 'express';
import {
  getAllQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation
} from '../controllers/quotationController.js';
import { validate, validateQuotation } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllQuotations);
router.get('/:id', getQuotationById);
router.post('/', validate(validateQuotation), createQuotation);
router.put('/:id', validate(validateQuotation), updateQuotation);
router.delete('/:id', deleteQuotation);

export default router;

