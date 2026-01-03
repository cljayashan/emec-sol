import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';
import bcrypt from 'bcrypt';

class User {
  static async findByUsername(username) {
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE username = ? AND is_active = 1`,
      [username]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE email = ? AND is_active = 1`,
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ? AND is_active = 1`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = generateUUID();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    await pool.execute(
      `INSERT INTO users (id, username, email, password_hash, salt, full_name, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.username,
        data.email,
        passwordHash,
        salt,
        data.full_name || null,
        data.role || 'user'
      ]
    );

    return this.findById(id);
  }

  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  static async updatePassword(userId, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.execute(
      `UPDATE users SET password_hash = ?, salt = ? WHERE id = ?`,
      [passwordHash, salt, userId]
    );

    return true;
  }
}

export default User;

