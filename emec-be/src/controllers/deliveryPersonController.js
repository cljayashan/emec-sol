import DeliveryPerson from '../models/DeliveryPerson.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllDeliveryPersons = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await DeliveryPerson.findAll(page, limit);
    sendSuccess(res, result, 'Delivery persons retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getDeliveryPersonById = async (req, res, next) => {
  try {
    const deliveryPerson = await DeliveryPerson.findById(req.params.id);
    if (!deliveryPerson) {
      return sendError(res, 'Delivery person not found', 404);
    }
    sendSuccess(res, deliveryPerson, 'Delivery person retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createDeliveryPerson = async (req, res, next) => {
  try {
    const deliveryPerson = await DeliveryPerson.create(req.body);
    sendSuccess(res, deliveryPerson, 'Delivery person created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryPerson = async (req, res, next) => {
  try {
    const deliveryPerson = await DeliveryPerson.update(req.params.id, req.body);
    if (!deliveryPerson) {
      return sendError(res, 'Delivery person not found', 404);
    }
    sendSuccess(res, deliveryPerson, 'Delivery person updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteDeliveryPerson = async (req, res, next) => {
  try {
    await DeliveryPerson.delete(req.params.id);
    sendSuccess(res, null, 'Delivery person deleted successfully');
  } catch (error) {
    next(error);
  }
};

