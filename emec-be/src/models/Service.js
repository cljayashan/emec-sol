import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class Service {
  static async findAll(page = 1, limit = 10, search = '') {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 per page
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    
    let query = `SELECT * FROM services WHERE is_deleted = 0`;
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR remarks LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // MySQL2 requires LIMIT values to be numbers, not placeholders
    // Values are sanitized with parseInt and Math functions, so safe from SQL injection
    query += ` ORDER BY name ASC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    const [count] = await pool.execute(
      `SELECT COUNT(*) as total FROM services WHERE is_deleted = 0${search ? ` AND (name LIKE ? OR remarks LIKE ?)` : ''}`,
      search ? [`%${search}%`, `%${search}%`] : []
    );
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM services WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO services (id, name, price, remarks) VALUES (?, ?, ?, ?)`,
      [id, data.name, data.price || 0, data.remarks || null]
    );
    return this.findById(id);
  }

  static async update(id, data) {
    await pool.execute(
      `UPDATE services SET name = ?, price = ?, remarks = ? WHERE id = ?`,
      [data.name, data.price || 0, data.remarks || null, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE services SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default Service;
