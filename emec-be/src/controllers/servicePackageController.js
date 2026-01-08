import ServicePackage from '../models/ServicePackage.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllServicePackages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await ServicePackage.findAll(page, limit, search);
    sendSuccess(res, result, 'Service packages retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getServicePackageById = async (req, res, next) => {
  try {
    const servicePackage = await ServicePackage.findById(req.params.id);
    if (!servicePackage) {
      return sendError(res, 'Service package not found', 404);
    }
    sendSuccess(res, servicePackage, 'Service package retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createServicePackage = async (req, res, next) => {
  try {
    const servicePackage = await ServicePackage.create(req.body);
    sendSuccess(res, servicePackage, 'Service package created successfully', 201);
  } catch (error) {
    if (error.code === 'DUPLICATE_NAME' || error.message.includes('already exists')) {
      return sendError(res, 'Service package with this name already exists', 400);
    }
    next(error);
  }
};

export const updateServicePackage = async (req, res, next) => {
  try {
    const servicePackage = await ServicePackage.update(req.params.id, req.body);
    if (!servicePackage) {
      return sendError(res, 'Service package not found', 404);
    }
    sendSuccess(res, servicePackage, 'Service package updated successfully');
  } catch (error) {
    if (error.code === 'DUPLICATE_NAME' || error.message.includes('already exists')) {
      return sendError(res, 'Service package with this name already exists', 400);
    }
    next(error);
  }
};

export const deleteServicePackage = async (req, res, next) => {
  try {
    await ServicePackage.delete(req.params.id);
    sendSuccess(res, null, 'Service package deleted successfully');
  } catch (error) {
    next(error);
  }
};
