import Vehicle from '../models/Vehicle.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllVehicles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await Vehicle.findAll(page, limit, search);
    sendSuccess(res, result, 'Vehicles retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return sendError(res, 'Vehicle not found', 404);
    }
    sendSuccess(res, vehicle, 'Vehicle retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    sendSuccess(res, vehicle, 'Vehicle registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.update(req.params.id, req.body);
    if (!vehicle) {
      return sendError(res, 'Vehicle not found', 404);
    }
    sendSuccess(res, vehicle, 'Vehicle updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    await Vehicle.delete(req.params.id);
    sendSuccess(res, null, 'Vehicle deleted successfully');
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    if (error.message === 'Vehicle not found or already deleted') {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

