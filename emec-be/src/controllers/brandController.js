import Brand from '../models/Brand.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllBrands = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await Brand.findAll(page, limit);
    sendSuccess(res, result, 'Vehicle brands retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getBrandById = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return sendError(res, 'Vehicle brand not found', 404);
    }
    sendSuccess(res, brand, 'Vehicle brand retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const brand = await Brand.create(req.body);
    sendSuccess(res, brand, 'Vehicle brand created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.update(req.params.id, req.body);
    if (!brand) {
      return sendError(res, 'Vehicle brand not found', 404);
    }
    sendSuccess(res, brand, 'Vehicle brand updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    await Brand.delete(req.params.id);
    sendSuccess(res, null, 'Vehicle brand deleted successfully');
  } catch (error) {
    next(error);
  }
};

