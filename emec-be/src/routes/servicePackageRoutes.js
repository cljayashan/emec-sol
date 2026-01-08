import express from 'express';
import {
  getAllServicePackages,
  getServicePackageById,
  createServicePackage,
  updateServicePackage,
  deleteServicePackage
} from '../controllers/servicePackageController.js';
import { validate, validateServicePackage } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllServicePackages);
router.get('/:id', getServicePackageById);
router.post('/', validate(validateServicePackage), createServicePackage);
router.put('/:id', validate(validateServicePackage), updateServicePackage);
router.delete('/:id', deleteServicePackage);

export default router;
