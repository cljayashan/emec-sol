import express from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { validate, validateVehicle } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', validate(validateVehicle), createVehicle);
router.put('/:id', validate(validateVehicle), updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;

