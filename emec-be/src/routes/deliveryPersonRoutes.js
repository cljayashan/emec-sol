import express from 'express';
import {
  getAllDeliveryPersons,
  getDeliveryPersonById,
  createDeliveryPerson,
  updateDeliveryPerson,
  deleteDeliveryPerson
} from '../controllers/deliveryPersonController.js';
import { validate, validateDeliveryPerson } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllDeliveryPersons);
router.get('/:id', getDeliveryPersonById);
router.post('/', validate(validateDeliveryPerson), createDeliveryPerson);
router.put('/:id', validate(validateDeliveryPerson), updateDeliveryPerson);
router.delete('/:id', deleteDeliveryPerson);

export default router;

