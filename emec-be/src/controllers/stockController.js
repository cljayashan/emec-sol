import Stock from '../models/Stock.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllStock = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const itemId = req.query.itemId || null;
    const result = await Stock.findAll(page, limit, itemId);
    sendSuccess(res, result, 'Stock retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getBatchesByItemId = async (req, res, next) => {
  try {
    const batches = await Stock.getBatchesByItemId(req.params.itemId);
    sendSuccess(res, batches, 'Batches retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    await Stock.adjust(req.body);
    sendSuccess(res, null, 'Stock adjusted successfully');
  } catch (error) {
    next(error);
  }
};

