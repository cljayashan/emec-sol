import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class Vehicle {
  static async findAll(page = 1, limit = 10, search = '') {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    
    let query = `
      SELECT v.*, 
             vb.name as brand_name,
             vm.name as model_name
      FROM vehicles v
      LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
      LEFT JOIN vehicle_models vm ON v.model_id = vm.id
      WHERE v.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (v.customer LIKE ? OR v.reg_no LIKE ? OR vb.name LIKE ? OR vm.name LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY v.created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    
    // Count query
    let countQuery = `SELECT COUNT(*) as total FROM vehicles v 
                      LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
                      LEFT JOIN vehicle_models vm ON v.model_id = vm.id
                      WHERE v.is_deleted = 0`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (v.customer LIKE ? OR v.reg_no LIKE ? OR vb.name LIKE ? OR vm.name LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    const [count] = await pool.execute(countQuery, countParams);
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT v.*, 
              vb.name as brand_name,
              vm.name as model_name
       FROM vehicles v
       LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
       LEFT JOIN vehicle_models vm ON v.model_id = vm.id
       WHERE v.id = ? AND v.is_deleted = 0`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO vehicles (id, customer, vehicle_type, reg_no, brand_id, model_id, version, year_of_manufacture, year_of_registration, remarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.customer,
        data.vehicle_type || null,
        data.reg_no,
        data.brand_id,
        data.model_id,
        data.version || null,
        data.year_of_manufacture || null,
        data.year_of_registration || null,
        data.remarks || null
      ]
    );
    return this.findById(id);
  }

  static async update(id, data) {
    await pool.execute(
      `UPDATE vehicles SET customer = ?, vehicle_type = ?, reg_no = ?, brand_id = ?, model_id = ?, 
       version = ?, year_of_manufacture = ?, year_of_registration = ?, remarks = ? WHERE id = ?`,
      [
        data.customer,
        data.vehicle_type || null,
        data.reg_no,
        data.brand_id,
        data.model_id,
        data.version || null,
        data.year_of_manufacture || null,
        data.year_of_registration || null,
        data.remarks || null,
        id
      ]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE vehicles SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default Vehicle;

