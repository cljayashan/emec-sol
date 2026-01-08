import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { validate, validateService } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', validate(validateService), createService);
router.put('/:id', validate(validateService), updateService);
router.delete('/:id', deleteService);

export default router;
