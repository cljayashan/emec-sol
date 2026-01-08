import express from 'express';
import {
  getAllServiceJobs,
  getServiceJobById,
  createServiceJob,
  updateServiceJob,
  deleteServiceJob,
  addItemToServiceJob,
  removeItemFromServiceJob
} from '../controllers/serviceJobController.js';

const router = express.Router();

router.get('/', getAllServiceJobs);
router.get('/:id', getServiceJobById);
router.post('/', createServiceJob);
router.put('/:id', updateServiceJob);
router.delete('/:id', deleteServiceJob);

// Item management routes
router.post('/:serviceJobId/items', addItemToServiceJob);
router.delete('/:serviceJobId/items/:itemId', removeItemFromServiceJob);

export default router;

