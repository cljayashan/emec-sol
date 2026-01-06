import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class VehicleDefect {
  static async findAll(page = 1, limit = 10, search = '') {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    
    let query = `SELECT * FROM vehicle_defects WHERE is_deleted = 0`;
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    // MySQL2 requires LIMIT values to be numbers, not placeholders
    query += ` ORDER BY created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    
    // Count query
    let countQuery = `SELECT COUNT(*) as total FROM vehicle_defects WHERE is_deleted = 0`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (name LIKE ? OR description LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern);
    }
    
    const [count] = await pool.execute(countQuery, countParams);
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM vehicle_defects WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return rows[0];
  }

  static async findByName(name, excludeId = null) {
    let query = `SELECT * FROM vehicle_defects WHERE name = ? AND is_deleted = 0`;
    const params = [name];
    
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0];
  }

  static async create(data) {
    // Check for duplicate name (only for non-deleted records)
    const existing = await this.findByName(data.name);
    if (existing) {
      const error = new Error('Vehicle defect with this name already exists');
      error.code = 'DUPLICATE_NAME';
      throw error;
    }

    const id = generateUUID();
    await pool.execute(
      `INSERT INTO vehicle_defects (id, name, description) VALUES (?, ?, ?)`,
      [id, data.name, data.description || null]
    );
    return this.findById(id);
  }

  static async update(id, data) {
    // Check for duplicate name (excluding current record, only for non-deleted records)
    const existing = await this.findByName(data.name, id);
    if (existing) {
      const error = new Error('Vehicle defect with this name already exists');
      error.code = 'DUPLICATE_NAME';
      throw error;
    }

    await pool.execute(
      `UPDATE vehicle_defects SET name = ?, description = ? WHERE id = ?`,
      [data.name, data.description || null, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE vehicle_defects SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default VehicleDefect;

