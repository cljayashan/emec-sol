import express from 'express';
import {
  getAllItems,
  getItemById,
  getItemByBarcode,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';
import { validate, validateItem } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllItems);
router.get('/barcode/:barcode', getItemByBarcode);
router.get('/:id', getItemById);
router.post('/', validate(validateItem), createItem);
router.put('/:id', validate(validateItem), updateItem);
router.delete('/:id', deleteItem);

export default router;

