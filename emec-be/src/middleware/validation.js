import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array()
    });
  };
};

// Common validation rules
export const validateSupplier = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim()
];

export const validateDeliveryPerson = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim()
];

export const validateItemCategory = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim()
];

export const validateBrand = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim()
];

export const validateVehicleModel = [
  body('brand_id').trim().notEmpty().isUUID().withMessage('Brand ID is required and must be a valid UUID'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim()
];

export const validateVehicle = [
  body('customer').trim().notEmpty().withMessage('Customer is required'),
  body('vehicle_type').optional().trim(),
  body('reg_no').trim().notEmpty().withMessage('Registration number is required'),
  body('brand_id').trim().notEmpty().isUUID().withMessage('Brand ID is required and must be a valid UUID'),
  body('model_id').trim().notEmpty().isUUID().withMessage('Model ID is required and must be a valid UUID'),
  body('version').optional().trim(),
  body('year_of_manufacture').optional().isInt({ min: 1900, max: 2100 }).withMessage('Year of manufacture must be a valid year'),
  body('year_of_registration').optional().isInt({ min: 1900, max: 2100 }).withMessage('Year of registration must be a valid year'),
  body('remarks').optional().trim()
];

export const validateCustomer = [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('name_with_initials').optional().trim(),
  body('nic').optional().trim(),
  body('mobile1').optional().trim(),
  body('mobile2').optional().trim(),
  body('address').optional().trim(),
  body('email_address').optional().isEmail().withMessage('Email address must be a valid email')
];

export const validateItem = [
  body('item_name').trim().notEmpty().withMessage('Item name is required'),
  body('category_id').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  body('brand_id').optional().isUUID().withMessage('Brand ID must be a valid UUID'),
  body('barcode').optional().trim(),
  body('measurement_unit').optional().trim()
];

export const validatePurchase = [
  body('bill_number').trim().notEmpty().withMessage('Bill number is required'),
  body('supplier_id').isUUID().withMessage('Supplier ID must be a valid UUID'),
  body('purchase_date').isISO8601().withMessage('Valid purchase date is required'),
  body('items').isArray().notEmpty().withMessage('At least one item is required')
];

export const validateSale = [
  body('bill_number').trim().notEmpty().withMessage('Bill number is required'),
  body('sale_date').isISO8601().withMessage('Valid sale date is required'),
  body('items').isArray().notEmpty().withMessage('At least one item is required'),
  body('payment_method').isIn(['cash', 'card', 'bank_transfer', 'cheque']).withMessage('Valid payment method is required')
];

export const validateQuotation = [
  body('quotation_number').trim().notEmpty().withMessage('Quotation number is required'),
  body('quotation_date').isISO8601().withMessage('Valid quotation date is required'),
  body('items').isArray().notEmpty().withMessage('At least one item is required')
];

