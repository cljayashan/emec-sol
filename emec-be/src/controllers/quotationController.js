import Quotation from '../models/Quotation.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllQuotations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await Quotation.findAll(page, limit);
    sendSuccess(res, result, 'Quotations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getQuotationById = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }
    sendSuccess(res, quotation, 'Quotation retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.create(req.body);
    sendSuccess(res, quotation, 'Quotation created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.update(req.params.id, req.body);
    if (!quotation) {
      return sendError(res, 'Quotation not found', 404);
    }
    sendSuccess(res, quotation, 'Quotation updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteQuotation = async (req, res, next) => {
  try {
    await Quotation.delete(req.params.id);
    sendSuccess(res, null, 'Quotation deleted successfully');
  } catch (error) {
    next(error);
  }
};

