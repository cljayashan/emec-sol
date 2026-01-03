import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class DeliveryPerson {
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT * FROM delivery_persons WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [count] = await pool.execute(
      `SELECT COUNT(*) as total FROM delivery_persons WHERE is_deleted = 0`
    );
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM delivery_persons WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO delivery_persons (id, name, description) VALUES (?, ?, ?)`,
      [id, data.name, data.description || null]
    );
    return this.findById(id);
  }

  static async update(id, data) {
    await pool.execute(
      `UPDATE delivery_persons SET name = ?, description = ? WHERE id = ?`,
      [data.name, data.description || null, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE delivery_persons SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default DeliveryPerson;

