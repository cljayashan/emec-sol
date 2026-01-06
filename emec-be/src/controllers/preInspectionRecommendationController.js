import PreInspectionRecommendation from '../models/PreInspectionRecommendation.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllPreInspectionRecommendations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await PreInspectionRecommendation.findAll(page, limit, search);
    sendSuccess(res, result, 'Pre inspection recommendations retrieved successfully');
  } catch (error) {
    console.error('Error in getAllPreInspectionRecommendations:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    next(error);
  }
};

export const getPreInspectionRecommendationById = async (req, res, next) => {
  try {
    const preInspectionRecommendation = await PreInspectionRecommendation.findById(req.params.id);
    if (!preInspectionRecommendation) {
      return sendError(res, 'Pre inspection recommendation not found', 404);
    }
    sendSuccess(res, preInspectionRecommendation, 'Pre inspection recommendation retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createPreInspectionRecommendation = async (req, res, next) => {
  try {
    const preInspectionRecommendation = await PreInspectionRecommendation.create(req.body);
    sendSuccess(res, preInspectionRecommendation, 'Pre inspection recommendation created successfully', 201);
  } catch (error) {
    if (error.code === 'DUPLICATE_NAME' || error.message.includes('already exists')) {
      return sendError(res, 'Pre inspection recommendation with this name already exists', 400);
    }
    next(error);
  }
};

export const updatePreInspectionRecommendation = async (req, res, next) => {
  try {
    const preInspectionRecommendation = await PreInspectionRecommendation.update(req.params.id, req.body);
    if (!preInspectionRecommendation) {
      return sendError(res, 'Pre inspection recommendation not found', 404);
    }
    sendSuccess(res, preInspectionRecommendation, 'Pre inspection recommendation updated successfully');
  } catch (error) {
    if (error.code === 'DUPLICATE_NAME' || error.message.includes('already exists')) {
      return sendError(res, 'Pre inspection recommendation with this name already exists', 400);
    }
    next(error);
  }
};

export const deletePreInspectionRecommendation = async (req, res, next) => {
  try {
    await PreInspectionRecommendation.delete(req.params.id);
    sendSuccess(res, null, 'Pre inspection recommendation deleted successfully');
  } catch (error) {
    next(error);
  }
};

