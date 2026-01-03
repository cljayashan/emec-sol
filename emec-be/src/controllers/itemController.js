import Item from '../models/Item.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await Item.findAll(page, limit, search);
    sendSuccess(res, result, 'Items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, 'Item not found', 404);
    }
    sendSuccess(res, item, 'Item retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getItemByBarcode = async (req, res, next) => {
  try {
    const item = await Item.findByBarcode(req.params.barcode);
    if (!item) {
      return sendError(res, 'Item not found', 404);
    }
    sendSuccess(res, item, 'Item retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const item = await Item.create(req.body);
    sendSuccess(res, item, 'Item created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await Item.update(req.params.id, req.body);
    if (!item) {
      return sendError(res, 'Item not found', 404);
    }
    sendSuccess(res, item, 'Item updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    await Item.delete(req.params.id);
    sendSuccess(res, null, 'Item deleted successfully');
  } catch (error) {
    next(error);
  }
};

