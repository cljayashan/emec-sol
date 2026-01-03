import Supplier from '../models/Supplier.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllSuppliers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await Supplier.findAll(page, limit);
    sendSuccess(res, result, 'Suppliers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return sendError(res, 'Supplier not found', 404);
    }
    sendSuccess(res, supplier, 'Supplier retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    sendSuccess(res, supplier, 'Supplier created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.update(req.params.id, req.body);
    if (!supplier) {
      return sendError(res, 'Supplier not found', 404);
    }
    sendSuccess(res, supplier, 'Supplier updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    await Supplier.delete(req.params.id);
    sendSuccess(res, null, 'Supplier deleted successfully');
  } catch (error) {
    next(error);
  }
};

