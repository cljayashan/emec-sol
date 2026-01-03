import express from 'express';
import {
  getBillTemplateByType,
  createBillTemplate,
  updateBillTemplate
} from '../controllers/billTemplateController.js';

const router = express.Router();

router.get('/:type', getBillTemplateByType);
router.post('/', createBillTemplate);
router.put('/:id', updateBillTemplate);

export default router;

