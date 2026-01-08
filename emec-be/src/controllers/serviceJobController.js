import ServiceJob from '../models/ServiceJob.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllServiceJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const date = req.query.date || null;
    const result = await ServiceJob.findAll(page, limit, search, date);
    sendSuccess(res, result, 'Service jobs retrieved successfully');
  } catch (error) {
    console.error('Error in getAllServiceJobs:', error);
    next(error);
  }
};

export const getServiceJobById = async (req, res, next) => {
  try {
    const serviceJob = await ServiceJob.findById(req.params.id);
    if (!serviceJob) {
      return sendError(res, 'Service job not found', 404);
    }
    sendSuccess(res, serviceJob, 'Service job retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createServiceJob = async (req, res, next) => {
  try {
    const serviceJob = await ServiceJob.create(req.body);
    sendSuccess(res, serviceJob, 'Service job created successfully', 201);
  } catch (error) {
    console.error('Error in createServiceJob:', error);
    next(error);
  }
};

export const updateServiceJob = async (req, res, next) => {
  try {
    const serviceJob = await ServiceJob.update(req.params.id, req.body);
    if (!serviceJob) {
      return sendError(res, 'Service job not found', 404);
    }
    sendSuccess(res, serviceJob, 'Service job updated successfully');
  } catch (error) {
    console.error('Error in updateServiceJob:', error);
    next(error);
  }
};

export const deleteServiceJob = async (req, res, next) => {
  try {
    await ServiceJob.delete(req.params.id);
    sendSuccess(res, null, 'Service job deleted successfully');
  } catch (error) {
    next(error);
  }
};

