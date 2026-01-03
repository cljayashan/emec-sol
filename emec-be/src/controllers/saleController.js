import Sale from '../models/Sale.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { generateSaleBillPDF } from '../utils/billGenerator.js';

export const getAllSales = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await Sale.findAll(page, limit);
    sendSuccess(res, result, 'Sale bills retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return sendError(res, 'Sale bill not found', 404);
    }
    sendSuccess(res, sale, 'Sale bill retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createSale = async (req, res, next) => {
  try {
    const sale = await Sale.create(req.body);
    sendSuccess(res, sale, 'Sale bill created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const cancelSale = async (req, res, next) => {
  try {
    await Sale.cancel(req.params.id);
    sendSuccess(res, null, 'Sale bill cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export const printSaleBill = async (req, res, next) => {
  try {
    const pdfBuffer = await generateSaleBillPDF(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sale-bill-${req.params.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

