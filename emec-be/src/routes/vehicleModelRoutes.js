import express from 'express';
import {
  getAllVehicleModels,
  getVehicleModelById,
  createVehicleModel,
  updateVehicleModel,
  deleteVehicleModel
} from '../controllers/vehicleModelController.js';
import { validate, validateVehicleModel } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllVehicleModels);
router.get('/:id', getVehicleModelById);
router.post('/', validate(validateVehicleModel), createVehicleModel);
router.put('/:id', validate(validateVehicleModel), updateVehicleModel);
router.delete('/:id', deleteVehicleModel);

export default router;

