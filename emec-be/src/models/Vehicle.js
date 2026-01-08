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
             vm.name as model_name,
             c.full_name as customer_name,
             c.name_with_initials as customer_name_with_initials,
             c.nic as customer_nic,
             c.mobile1 as customer_mobile1,
             c.mobile2 as customer_mobile2,
             c.address as customer_address,
             c.email_address as customer_email
      FROM vehicles v
      LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
      LEFT JOIN vehicle_models vm ON v.model_id = vm.id
      LEFT JOIN customers c ON v.customer_id = c.id
      WHERE v.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (c.full_name LIKE ? OR v.reg_no LIKE ? OR vb.name LIKE ? OR vm.name LIKE ? OR c.mobile1 LIKE ? OR c.mobile2 LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY v.created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    
    // Count query
    let countQuery = `SELECT COUNT(*) as total FROM vehicles v 
                      LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
                      LEFT JOIN vehicle_models vm ON v.model_id = vm.id
                      LEFT JOIN customers c ON v.customer_id = c.id
                      WHERE v.is_deleted = 0`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (c.full_name LIKE ? OR v.reg_no LIKE ? OR vb.name LIKE ? OR vm.name LIKE ? OR c.mobile1 LIKE ? OR c.mobile2 LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    const [count] = await pool.execute(countQuery, countParams);
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT v.*, 
              vb.name as brand_name,
              vm.name as model_name,
              c.full_name as customer_name,
              c.name_with_initials as customer_name_with_initials,
              c.nic as customer_nic,
              c.mobile1 as customer_mobile1,
              c.mobile2 as customer_mobile2,
              c.address as customer_address,
              c.email_address as customer_email
       FROM vehicles v
       LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
       LEFT JOIN vehicle_models vm ON v.model_id = vm.id
       LEFT JOIN customers c ON v.customer_id = c.id
       WHERE v.id = ? AND v.is_deleted = 0`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO vehicles (id, customer_id, vehicle_type, reg_no, brand_id, model_id, version, year_of_manufacture, year_of_registration, remarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.customer_id || null,
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
      `UPDATE vehicles SET customer_id = ?, vehicle_type = ?, reg_no = ?, brand_id = ?, model_id = ?, 
       version = ?, year_of_manufacture = ?, year_of_registration = ?, remarks = ? WHERE id = ?`,
      [
        data.customer_id || null,
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
    const [result] = await pool.execute(
      `UPDATE vehicles SET is_deleted = 1 WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Vehicle not found or already deleted');
    }
    
    return true;
  }
}

export default Vehicle;

