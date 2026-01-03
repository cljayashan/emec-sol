import express from 'express';
import {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  cancelPurchase,
  printPurchaseBill
} from '../controllers/purchaseController.js';
import { validate, validatePurchase } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllPurchases);
router.get('/:id', getPurchaseById);
router.get('/:id/print', printPurchaseBill);
router.post('/', validate(validatePurchase), createPurchase);
router.put('/:id/cancel', cancelPurchase);

export default router;

