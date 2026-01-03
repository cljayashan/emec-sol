import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    // Check if username exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return sendError(res, 'Username already exists', 400);
    }

    // Check if email exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return sendError(res, 'Email already exists', 400);
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      full_name,
      role: role || 'user'
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      username: user.username
    });

    // Store refresh token
    const expiresAt = getRefreshTokenExpiry();
    await RefreshToken.create(user.id, refreshToken, expiresAt);

    sendSuccess(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      accessToken,
      refreshToken
    }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 'Username and password are required', 400);
    }

    // Find user by username or email
    let user = await User.findByUsername(username);
    if (!user) {
      user = await User.findByEmail(username);
    }

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(user, password);
    if (!isValidPassword) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      username: user.username
    });

    // Store refresh token
    const expiresAt = getRefreshTokenExpiry();
    await RefreshToken.create(user.id, refreshToken, expiresAt);

    sendSuccess(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      accessToken,
      refreshToken
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const tokenRecord = await RefreshToken.findByToken(refreshToken);
    if (!tokenRecord) {
      return sendError(res, 'Invalid refresh token', 401);
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    sendSuccess(res, {
      accessToken: newAccessToken
    }, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.deleteByToken(refreshToken);
    }

    sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

