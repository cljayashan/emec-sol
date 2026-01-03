import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class Item {
  static async findAll(page = 1, limit = 10, search = '') {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    let query = `SELECT i.*, ic.name as category_name 
                 FROM items i 
                 LEFT JOIN item_categories ic ON i.category_id = ic.id 
                 WHERE i.is_deleted = 0`;
    const params = [];

    if (search) {
      query += ` AND (i.item_name LIKE ? OR i.barcode LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // MySQL2 requires LIMIT values to be numbers, not placeholders
    query += ` ORDER BY i.created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    const [count] = await pool.execute(
      `SELECT COUNT(*) as total FROM items WHERE is_deleted = 0${search ? ` AND (item_name LIKE ? OR barcode LIKE ?)` : ''}`,
      search ? [`%${search}%`, `%${search}%`] : []
    );
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT i.*, ic.name as category_name 
       FROM items i 
       LEFT JOIN item_categories ic ON i.category_id = ic.id 
       WHERE i.id = ? AND i.is_deleted = 0`,
      [id]
    );
    return rows[0];
  }

  static async findByBarcode(barcode) {
    const [rows] = await pool.execute(
      `SELECT * FROM items WHERE barcode = ? AND is_deleted = 0`,
      [barcode]
    );
    return rows[0];
  }

  static async create(data) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO items (id, item_name, description, brand, category_id, barcode, measurement_unit) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.item_name,
        data.description || null,
        data.brand || null,
        data.category_id || null,
        data.barcode || null,
        data.measurement_unit || null
      ]
    );
    return this.findById(id);
  }

  static async update(id, data) {
    await pool.execute(
      `UPDATE items SET item_name = ?, description = ?, brand = ?, category_id = ?, barcode = ?, measurement_unit = ? 
       WHERE id = ?`,
      [
        data.item_name,
        data.description || null,
        data.brand || null,
        data.category_id || null,
        data.barcode || null,
        data.measurement_unit || null,
        id
      ]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE items SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default Item;

