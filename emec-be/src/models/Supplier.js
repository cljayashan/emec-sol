import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class Supplier {
  static async findAll(page = 1, limit = 10, search = '') {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 per page
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    
    let query = `SELECT * FROM suppliers WHERE is_deleted = 0`;
    const params = [];

    if (search) {
      query += ` AND name LIKE ?`;
      params.push(`%${search}%`);
    }

    // MySQL2 requires LIMIT values to be numbers, not placeholders
    // Values are sanitized with parseInt and Math functions, so safe from SQL injection
    query += ` ORDER BY created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    const [count] = await pool.execute(
      `SELECT COUNT(*) as total FROM suppliers WHERE is_deleted = 0${search ? ` AND name LIKE ?` : ''}`,
      search ? [`%${search}%`] : []
    );
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM suppliers WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO suppliers (id, name, description) VALUES (?, ?, ?)`,
      [id, data.name, data.description || null]
    );
    return this.findById(id);
  }

  static async update(id, data) {
    await pool.execute(
      `UPDATE suppliers SET name = ?, description = ? WHERE id = ?`,
      [data.name, data.description || null, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE suppliers SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default Supplier;

