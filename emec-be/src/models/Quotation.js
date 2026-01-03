import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class Quotation {
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT * FROM quotations WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [count] = await pool.execute(
      `SELECT COUNT(*) as total FROM quotations WHERE is_deleted = 0`
    );
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [quotations] = await pool.execute(
      `SELECT * FROM quotations WHERE id = ? AND is_deleted = 0`,
      [id]
    );

    if (quotations.length === 0) return null;

    const quotation = quotations[0];

    const [items] = await pool.execute(
      `SELECT qi.*, i.item_name, i.brand, i.measurement_unit 
       FROM quotation_items qi 
       LEFT JOIN items i ON qi.item_id = i.id 
       WHERE qi.quotation_id = ?`,
      [id]
    );

    quotation.items = items;
    return quotation;
  }

  static async create(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create quotation
      const quotationId = generateUUID();
      await connection.execute(
        `INSERT INTO quotations (id, quotation_number, quotation_date, customer_name, customer_contact, subtotal, labour_charge, discount, total_amount) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quotationId,
          data.quotation_number,
          data.quotation_date,
          data.customer_name || null,
          data.customer_contact || null,
          data.subtotal,
          data.labour_charge || 0,
          data.discount || 0,
          data.total_amount
        ]
      );

      // Create quotation items
      for (const item of data.items) {
        const itemId = generateUUID();
        await connection.execute(
          `INSERT INTO quotation_items (id, quotation_id, item_id, quantity, unit_price, labour_charge, total_price) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            quotationId,
            item.item_id,
            item.quantity,
            item.unit_price,
            item.labour_charge || 0,
            item.total_price
          ]
        );
      }

      await connection.commit();
      return this.findById(quotationId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update quotation
      await connection.execute(
        `UPDATE quotations SET quotation_number = ?, quotation_date = ?, customer_name = ?, customer_contact = ?, 
         subtotal = ?, labour_charge = ?, discount = ?, total_amount = ?, status = ? 
         WHERE id = ?`,
        [
          data.quotation_number,
          data.quotation_date,
          data.customer_name || null,
          data.customer_contact || null,
          data.subtotal,
          data.labour_charge || 0,
          data.discount || 0,
          data.total_amount,
          data.status || 'pending',
          id
        ]
      );

      // Delete existing items
      await connection.execute(
        `DELETE FROM quotation_items WHERE quotation_id = ?`,
        [id]
      );

      // Create new items
      for (const item of data.items) {
        const itemId = generateUUID();
        await connection.execute(
          `INSERT INTO quotation_items (id, quotation_id, item_id, quantity, unit_price, labour_charge, total_price) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            id,
            item.item_id,
            item.quantity,
            item.unit_price,
            item.labour_charge || 0,
            item.total_price
          ]
        );
      }

      await connection.commit();
      return this.findById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE quotations SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default Quotation;

