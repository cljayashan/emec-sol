import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class Stock {
  static async findAll(page = 1, limit = 10, itemId = null) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    let query = `SELECT s.*, i.item_name, i.brand, i.measurement_unit 
                 FROM stock s 
                 LEFT JOIN items i ON s.item_id = i.id 
                 WHERE i.is_deleted = 0`;
    const params = [];

    if (itemId) {
      query += ` AND s.item_id = ?`;
      params.push(itemId);
    }

    // MySQL2 requires LIMIT values to be numbers, not placeholders
    query += ` ORDER BY s.created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    
    const countQuery = `SELECT COUNT(*) as total 
                        FROM stock s 
                        LEFT JOIN items i ON s.item_id = i.id 
                        WHERE i.is_deleted = 0${itemId ? ` AND s.item_id = ?` : ''}`;
    const countParams = itemId ? [itemId] : [];
    
    const [count] = await pool.execute(countQuery, countParams);
    return { data: rows, total: count[0].total };
  }

  static async getBatchesByItemId(itemId) {
    const [rows] = await pool.execute(
      `SELECT s.*, i.item_name 
       FROM stock s 
       LEFT JOIN items i ON s.item_id = i.id 
       WHERE s.item_id = ? AND s.available_quantity > 0 
       ORDER BY s.created_at ASC`,
      [itemId]
    );
    return rows;
  }

  static async adjust(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get current stock
      const [currentStock] = await connection.execute(
        `SELECT * FROM stock WHERE item_id = ? AND batch_number = ?`,
        [data.item_id, data.batch_number]
      );

      if (currentStock.length === 0) {
        throw new Error('Stock not found');
      }

      const oldQuantity = currentStock[0].available_quantity;
      const newQuantity = parseFloat(data.new_quantity);
      const adjustmentQuantity = newQuantity - oldQuantity;

      // Update stock
      await connection.execute(
        `UPDATE stock SET available_quantity = ? WHERE item_id = ? AND batch_number = ?`,
        [newQuantity, data.item_id, data.batch_number]
      );

      // Record adjustment
      const adjustmentId = generateUUID();
      await connection.execute(
        `INSERT INTO stock_adjustments (id, item_id, batch_number, old_quantity, new_quantity, adjustment_quantity, reason, adjusted_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          adjustmentId,
          data.item_id,
          data.batch_number,
          oldQuantity,
          newQuantity,
          adjustmentQuantity,
          data.reason || null,
          data.adjusted_by || 'System'
        ]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default Stock;

