import ServiceType from '../models/ServiceType.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllServiceTypes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await ServiceType.findAll(page, limit, search);
    sendSuccess(res, result, 'Service types retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getServiceTypeById = async (req, res, next) => {
  try {
    const serviceType = await ServiceType.findById(req.params.id);
    if (!serviceType) {
      return sendError(res, 'Service type not found', 404);
    }
    sendSuccess(res, serviceType, 'Service type retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createServiceType = async (req, res, next) => {
  try {
    const serviceType = await ServiceType.create(req.body);
    sendSuccess(res, serviceType, 'Service type created successfully', 201);
  } catch (error) {
    if (error.code === 'DUPLICATE_NAME' || error.message.includes('already exists')) {
      return sendError(res, 'Service type with this name already exists', 400);
    }
    next(error);
  }
};

export const updateServiceType = async (req, res, next) => {
  try {
    const serviceType = await ServiceType.update(req.params.id, req.body);
    if (!serviceType) {
      return sendError(res, 'Service type not found', 404);
    }
    sendSuccess(res, serviceType, 'Service type updated successfully');
  } catch (error) {
    if (error.code === 'DUPLICATE_NAME' || error.message.includes('already exists')) {
      return sendError(res, 'Service type with this name already exists', 400);
    }
    next(error);
  }
};

export const deleteServiceType = async (req, res, next) => {
  try {
    await ServiceType.delete(req.params.id);
    sendSuccess(res, null, 'Service type deleted successfully');
  } catch (error) {
    next(error);
  }
};

