import VehicleDefect from '../models/VehicleDefect.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllVehicleDefects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await VehicleDefect.findAll(page, limit, search);
    sendSuccess(res, result, 'Vehicle defects retrieved successfully');
  } catch (error) {
    console.error('Error in getAllVehicleDefects:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    next(error);
  }
};

export const getVehicleDefectById = async (req, res, next) => {
  try {
    const vehicleDefect = await VehicleDefect.findById(req.params.id);
    if (!vehicleDefect) {
      return sendError(res, 'Vehicle defect not found', 404);
    }
    sendSuccess(res, vehicleDefect, 'Vehicle defect retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createVehicleDefect = async (req, res, next) => {
  try {
    const vehicleDefect = await VehicleDefect.create(req.body);
    sendSuccess(res, vehicleDefect, 'Vehicle defect created successfully', 201);
  } catch (error) {
    if (error.code === 'DUPLICATE_NAME' || error.message.includes('already exists')) {
      return sendError(res, 'Vehicle defect with this name already exists', 400);
    }
    next(error);
  }
};

export const updateVehicleDefect = async (req, res, next) => {
  try {
    const vehicleDefect = await VehicleDefect.update(req.params.id, req.body);
    if (!vehicleDefect) {
      return sendError(res, 'Vehicle defect not found', 404);
    }
    sendSuccess(res, vehicleDefect, 'Vehicle defect updated successfully');
  } catch (error) {
    if (error.code === 'DUPLICATE_NAME' || error.message.includes('already exists')) {
      return sendError(res, 'Vehicle defect with this name already exists', 400);
    }
    next(error);
  }
};

export const deleteVehicleDefect = async (req, res, next) => {
  try {
    await VehicleDefect.delete(req.params.id);
    sendSuccess(res, null, 'Vehicle defect deleted successfully');
  } catch (error) {
    next(error);
  }
};

