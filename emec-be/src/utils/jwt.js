import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const getRefreshTokenExpiry = () => {
  // Parse expiry string like "7d" or "30d"
  const match = REFRESH_TOKEN_EXPIRY.match(/(\d+)([dhms])/);
  if (!match) {
    // Default to 7 days if format is invalid
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    return expiryDate;
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  const expiryDate = new Date();
  
  switch (unit) {
    case 'd':
      expiryDate.setDate(expiryDate.getDate() + value);
      break;
    case 'h':
      expiryDate.setHours(expiryDate.getHours() + value);
      break;
    case 'm':
      expiryDate.setMinutes(expiryDate.getMinutes() + value);
      break;
    case 's':
      expiryDate.setSeconds(expiryDate.getSeconds() + value);
      break;
    default:
      expiryDate.setDate(expiryDate.getDate() + 7);
  }
  
  return expiryDate;
};

