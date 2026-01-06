import express from 'express';
import {
  getAllServiceJobs,
  getServiceJobById,
  createServiceJob,
  updateServiceJob,
  deleteServiceJob
} from '../controllers/serviceJobController.js';

const router = express.Router();

router.get('/', getAllServiceJobs);
router.get('/:id', getServiceJobById);
router.post('/', createServiceJob);
router.put('/:id', updateServiceJob);
router.delete('/:id', deleteServiceJob);

export default router;

