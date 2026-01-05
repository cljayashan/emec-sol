import VehicleModel from '../models/VehicleModel.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllVehicleModels = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const brandId = req.query.brand_id || null;
    const result = await VehicleModel.findAll(page, limit, search, brandId);
    sendSuccess(res, result, 'Vehicle models retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getVehicleModelById = async (req, res, next) => {
  try {
    const vehicleModel = await VehicleModel.findById(req.params.id);
    if (!vehicleModel) {
      return sendError(res, 'Vehicle model not found', 404);
    }
    sendSuccess(res, vehicleModel, 'Vehicle model retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createVehicleModel = async (req, res, next) => {
  try {
    const vehicleModel = await VehicleModel.create(req.body);
    sendSuccess(res, vehicleModel, 'Vehicle model created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateVehicleModel = async (req, res, next) => {
  try {
    const vehicleModel = await VehicleModel.update(req.params.id, req.body);
    if (!vehicleModel) {
      return sendError(res, 'Vehicle model not found', 404);
    }
    sendSuccess(res, vehicleModel, 'Vehicle model updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteVehicleModel = async (req, res, next) => {
  try {
    await VehicleModel.delete(req.params.id);
    sendSuccess(res, null, 'Vehicle model deleted successfully');
  } catch (error) {
    next(error);
  }
};

