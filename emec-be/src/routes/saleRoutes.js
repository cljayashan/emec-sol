import express from 'express';
import {
  getAllSales,
  getSaleById,
  createSale,
  cancelSale,
  printSaleBill
} from '../controllers/saleController.js';
import { validate, validateSale } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllSales);
router.get('/:id', getSaleById);
router.get('/:id/print', printSaleBill);
router.post('/', validate(validateSale), createSale);
router.put('/:id/cancel', cancelSale);

export default router;

