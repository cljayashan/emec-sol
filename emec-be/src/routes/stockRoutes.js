import express from 'express';
import {
  getAllStock,
  getBatchesByItemId,
  adjustStock
} from '../controllers/stockController.js';

const router = express.Router();

router.get('/', getAllStock);
router.get('/batches/:itemId', getBatchesByItemId);
router.post('/adjust', adjustStock);

export default router;

