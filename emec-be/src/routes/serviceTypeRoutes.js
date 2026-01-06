import express from 'express';
import {
  getAllServiceTypes,
  getServiceTypeById,
  createServiceType,
  updateServiceType,
  deleteServiceType
} from '../controllers/serviceTypeController.js';
import { validate, validateServiceType } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllServiceTypes);
router.get('/:id', getServiceTypeById);
router.post('/', validate(validateServiceType), createServiceType);
router.put('/:id', validate(validateServiceType), updateServiceType);
router.delete('/:id', deleteServiceType);

export default router;

