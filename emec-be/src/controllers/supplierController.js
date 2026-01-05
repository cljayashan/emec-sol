import Supplier from '../models/Supplier.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllSuppliers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    console.log('Fetching suppliers - page:', page, 'limit:', limit, 'search:', search);
    const result = await Supplier.findAll(page, limit, search);
    console.log('Suppliers found:', result.data.length, 'total:', result.total);
    sendSuccess(res, result, 'Suppliers retrieved successfully');
  } catch (error) {
    console.error('Error in getAllSuppliers:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

export const getSupplierById = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    console.log('Fetching supplier by ID:', supplierId);
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      console.log('Supplier not found:', supplierId);
      return sendError(res, 'Supplier not found', 404);
    }
    console.log('Supplier found:', supplier);
    sendSuccess(res, supplier, 'Supplier retrieved successfully');
  } catch (error) {
    console.error('Error in getSupplierById:', error);
    console.error('Error stack:', error.stack);
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

