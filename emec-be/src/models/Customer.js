import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class Customer {
  static async findAll(page = 1, limit = 10, search = '') {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    
    let query = `SELECT * FROM customers WHERE is_deleted = 0`;
    const params = [];

    if (search) {
      query += ` AND (full_name LIKE ? OR name_with_initials LIKE ? OR nic LIKE ? OR mobile1 LIKE ? OR email_address LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    
    // Count query
    let countQuery = `SELECT COUNT(*) as total FROM customers WHERE is_deleted = 0`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (full_name LIKE ? OR name_with_initials LIKE ? OR nic LIKE ? OR mobile1 LIKE ? OR email_address LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    const [count] = await pool.execute(countQuery, countParams);
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM customers WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO customers (id, full_name, name_with_initials, nic, mobile1, mobile2, address, email_address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.full_name,
        data.name_with_initials || null,
        data.nic || null,
        data.mobile1 || null,
        data.mobile2 || null,
        data.address || null,
        data.email_address || null
      ]
    );
    return this.findById(id);
  }

  static async update(id, data) {
    await pool.execute(
      `UPDATE customers SET full_name = ?, name_with_initials = ?, nic = ?, mobile1 = ?, mobile2 = ?, address = ?, email_address = ? WHERE id = ?`,
      [
        data.full_name,
        data.name_with_initials || null,
        data.nic || null,
        data.mobile1 || null,
        data.mobile2 || null,
        data.address || null,
        data.email_address || null,
        id
      ]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE customers SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default Customer;

