import Service from '../models/Service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllServices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await Service.findAll(page, limit, search);
    sendSuccess(res, result, 'Services retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findById(serviceId);
    if (!service) {
      return sendError(res, 'Service not found', 404);
    }
    sendSuccess(res, service, 'Service retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    sendSuccess(res, service, 'Service created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const service = await Service.update(req.params.id, req.body);
    if (!service) {
      return sendError(res, 'Service not found', 404);
    }
    sendSuccess(res, service, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    await Service.delete(req.params.id);
    sendSuccess(res, null, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};
