import express from 'express';
import {
  getAllItemCategories,
  getItemCategoryById,
  createItemCategory,
  updateItemCategory,
  deleteItemCategory
} from '../controllers/itemCategoryController.js';
import { validate, validateItemCategory } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllItemCategories);
router.get('/:id', getItemCategoryById);
router.post('/', validate(validateItemCategory), createItemCategory);
router.put('/:id', validate(validateItemCategory), updateItemCategory);
router.delete('/:id', deleteItemCategory);

export default router;

