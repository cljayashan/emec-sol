import express from 'express';
import {
  getAllPreInspectionRecommendations,
  getPreInspectionRecommendationById,
  createPreInspectionRecommendation,
  updatePreInspectionRecommendation,
  deletePreInspectionRecommendation
} from '../controllers/preInspectionRecommendationController.js';
import { validate, validatePreInspectionRecommendation } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllPreInspectionRecommendations);
router.get('/:id', getPreInspectionRecommendationById);
router.post('/', validate(validatePreInspectionRecommendation), createPreInspectionRecommendation);
router.put('/:id', validate(validatePreInspectionRecommendation), updatePreInspectionRecommendation);
router.delete('/:id', deletePreInspectionRecommendation);

export default router;

