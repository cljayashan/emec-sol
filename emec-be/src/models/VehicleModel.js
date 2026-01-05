import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class VehicleModel {
  static async findAll(page = 1, limit = 10, search = '', brandId = null) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    
    let query = `
      SELECT vm.*, vb.name as brand_name 
      FROM vehicle_models vm
      LEFT JOIN vehicle_brands vb ON vm.brand_id = vb.id
      WHERE vm.is_deleted = 0
    `;
    const params = [];

    if (brandId) {
      query += ` AND vm.brand_id = ?`;
      params.push(brandId);
    }

    if (search) {
      query += ` AND vm.name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY vm.created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    
    // Count query
    let countQuery = `SELECT COUNT(*) as total FROM vehicle_models vm WHERE vm.is_deleted = 0`;
    const countParams = [];
    
    if (brandId) {
      countQuery += ` AND vm.brand_id = ?`;
      countParams.push(brandId);
    }
    
    if (search) {
      countQuery += ` AND vm.name LIKE ?`;
      countParams.push(`%${search}%`);
    }
    
    const [count] = await pool.execute(countQuery, countParams);
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT vm.*, vb.name as brand_name 
       FROM vehicle_models vm
       LEFT JOIN vehicle_brands vb ON vm.brand_id = vb.id
       WHERE vm.id = ? AND vm.is_deleted = 0`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO vehicle_models (id, brand_id, name, description) VALUES (?, ?, ?, ?)`,
      [id, data.brand_id, data.name, data.description || null]
    );
    return this.findById(id);
  }

  static async update(id, data) {
    await pool.execute(
      `UPDATE vehicle_models SET brand_id = ?, name = ?, description = ? WHERE id = ?`,
      [data.brand_id, data.name, data.description || null, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE vehicle_models SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default VehicleModel;

