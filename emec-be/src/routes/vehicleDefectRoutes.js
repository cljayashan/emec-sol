import express from 'express';
import {
  getAllVehicleDefects,
  getVehicleDefectById,
  createVehicleDefect,
  updateVehicleDefect,
  deleteVehicleDefect
} from '../controllers/vehicleDefectController.js';
import { validate, validateVehicleDefect } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllVehicleDefects);
router.get('/:id', getVehicleDefectById);
router.post('/', validate(validateVehicleDefect), createVehicleDefect);
router.put('/:id', validate(validateVehicleDefect), updateVehicleDefect);
router.delete('/:id', deleteVehicleDefect);

export default router;

