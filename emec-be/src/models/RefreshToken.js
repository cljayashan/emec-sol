import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class RefreshToken {
  static async create(userId, token, expiresAt) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
      [id, userId, token, expiresAt]
    );
    return { id, userId, token, expiresAt };
  }

  static async findByToken(token) {
    const [rows] = await pool.execute(
      `SELECT rt.*, u.id as user_id, u.username, u.email, u.role 
       FROM refresh_tokens rt 
       JOIN users u ON rt.user_id = u.id 
       WHERE rt.token = ? AND rt.expires_at > NOW() AND u.is_active = 1`,
      [token]
    );
    return rows[0];
  }

  static async deleteByToken(token) {
    await pool.execute(
      `DELETE FROM refresh_tokens WHERE token = ?`,
      [token]
    );
    return true;
  }

  static async deleteByUserId(userId) {
    await pool.execute(
      `DELETE FROM refresh_tokens WHERE user_id = ?`,
      [userId]
    );
    return true;
  }

  static async deleteExpired() {
    await pool.execute(
      `DELETE FROM refresh_tokens WHERE expires_at < NOW()`
    );
    return true;
  }
}

export default RefreshToken;

