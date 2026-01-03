import BillTemplate from '../models/BillTemplate.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getBillTemplateByType = async (req, res, next) => {
  try {
    const template = await BillTemplate.findByType(req.params.type);
    if (!template) {
      return sendError(res, 'Bill template not found', 404);
    }
    sendSuccess(res, template, 'Bill template retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createBillTemplate = async (req, res, next) => {
  try {
    const template = await BillTemplate.create(req.body);
    sendSuccess(res, template, 'Bill template created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateBillTemplate = async (req, res, next) => {
  try {
    const template = await BillTemplate.update(req.params.id, req.body);
    if (!template) {
      return sendError(res, 'Bill template not found', 404);
    }
    sendSuccess(res, template, 'Bill template updated successfully');
  } catch (error) {
    next(error);
  }
};

