import Purchase from '../models/Purchase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { generatePurchaseBillPDF } from '../utils/billGenerator.js';

export const getAllPurchases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      billNumber: req.query.billNumber || null,
      date: req.query.date || null
    };
    const result = await Purchase.findAll(page, limit, filters);
    sendSuccess(res, result, 'Purchase bills retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return sendError(res, 'Purchase bill not found', 404);
    }
    sendSuccess(res, purchase, 'Purchase bill retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createPurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.create(req.body);
    sendSuccess(res, purchase, 'Purchase bill created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const cancelPurchase = async (req, res, next) => {
  try {
    await Purchase.cancel(req.params.id);
    sendSuccess(res, null, 'Purchase bill cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export const printPurchaseBill = async (req, res, next) => {
  try {
    const pdfBuffer = await generatePurchaseBillPDF(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=purchase-bill-${req.params.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

