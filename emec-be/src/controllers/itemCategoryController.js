import ItemCategory from '../models/ItemCategory.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllItemCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await ItemCategory.findAll(page, limit);
    sendSuccess(res, result, 'Item categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getItemCategoryById = async (req, res, next) => {
  try {
    const category = await ItemCategory.findById(req.params.id);
    if (!category) {
      return sendError(res, 'Item category not found', 404);
    }
    sendSuccess(res, category, 'Item category retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createItemCategory = async (req, res, next) => {
  try {
    const category = await ItemCategory.create(req.body);
    sendSuccess(res, category, 'Item category created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateItemCategory = async (req, res, next) => {
  try {
    const category = await ItemCategory.update(req.params.id, req.body);
    if (!category) {
      return sendError(res, 'Item category not found', 404);
    }
    sendSuccess(res, category, 'Item category updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteItemCategory = async (req, res, next) => {
  try {
    await ItemCategory.delete(req.params.id);
    sendSuccess(res, null, 'Item category deleted successfully');
  } catch (error) {
    next(error);
  }
};

