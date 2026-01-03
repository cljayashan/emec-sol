import { format } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'yyyy-MM-dd');
  } catch (error) {
    return date;
  }
};

export const formatCurrency = (amount) => {
  return parseFloat(amount || 0).toFixed(2);
};

export const generateBillNumber = (prefix = 'BILL') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

export const generateQuotationNumber = () => {
  return generateBillNumber('QUO');
};

