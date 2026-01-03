import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class Purchase {
  static async findAll(page = 1, limit = 10, filters = {}) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    let query = `SELECT pb.*, s.name as supplier_name 
                 FROM purchase_bills pb 
                 LEFT JOIN suppliers s ON pb.supplier_id = s.id 
                 WHERE pb.is_deleted = 0`;
    const params = [];

    if (filters.billNumber) {
      query += ` AND pb.bill_number LIKE ?`;
      params.push(`%${filters.billNumber}%`);
    }

    if (filters.date) {
      query += ` AND pb.purchase_date = ?`;
      params.push(filters.date);
    }

    // MySQL2 requires LIMIT values to be numbers, not placeholders
    query += ` ORDER BY pb.created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    
    const countQuery = `SELECT COUNT(*) as total 
                        FROM purchase_bills pb 
                        WHERE pb.is_deleted = 0${filters.billNumber ? ` AND pb.bill_number LIKE ?` : ''}${filters.date ? ` AND pb.purchase_date = ?` : ''}`;
    const countParams = [];
    if (filters.billNumber) countParams.push(`%${filters.billNumber}%`);
    if (filters.date) countParams.push(filters.date);
    
    const [count] = await pool.execute(countQuery, countParams);
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [bills] = await pool.execute(
      `SELECT pb.*, s.name as supplier_name 
       FROM purchase_bills pb 
       LEFT JOIN suppliers s ON pb.supplier_id = s.id 
       WHERE pb.id = ? AND pb.is_deleted = 0`,
      [id]
    );

    if (bills.length === 0) return null;

    const bill = bills[0];

    const [items] = await pool.execute(
      `SELECT pbi.*, i.item_name, i.brand, i.measurement_unit 
       FROM purchase_bill_items pbi 
       LEFT JOIN items i ON pbi.item_id = i.id 
       WHERE pbi.purchase_bill_id = ?`,
      [id]
    );

    bill.items = items;
    return bill;
  }

  static async create(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create purchase bill
      const purchaseBillId = generateUUID();
      await connection.execute(
        `INSERT INTO purchase_bills (id, bill_number, supplier_id, purchase_date, total_amount) 
         VALUES (?, ?, ?, ?, ?)`,
        [purchaseBillId, data.bill_number, data.supplier_id, data.purchase_date, data.total_amount]
      );

      // Create purchase bill items and update stock
      for (const item of data.items) {
        const itemId = generateUUID();
        await connection.execute(
          `INSERT INTO purchase_bill_items (id, purchase_bill_id, item_id, batch_number, quantity, free_quantity, unit_price, total_price) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            purchaseBillId,
            item.item_id,
            item.batch_number,
            item.quantity,
            item.free_quantity || 0,
            item.unit_price,
            item.total_price
          ]
        );

        // Update or create stock
        const totalQty = parseFloat(item.quantity) + parseFloat(item.free_quantity || 0);
        const [existingStock] = await connection.execute(
          `SELECT * FROM stock WHERE item_id = ? AND batch_number = ?`,
          [item.item_id, item.batch_number]
        );

        if (existingStock.length > 0) {
          await connection.execute(
            `UPDATE stock SET quantity = quantity + ?, available_quantity = available_quantity + ? 
             WHERE item_id = ? AND batch_number = ?`,
            [totalQty, totalQty, item.item_id, item.batch_number]
          );
        } else {
          const stockId = generateUUID();
          await connection.execute(
            `INSERT INTO stock (id, item_id, batch_number, quantity, available_quantity, purchase_bill_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [stockId, item.item_id, item.batch_number, totalQty, totalQty, purchaseBillId]
          );
        }
      }

      await connection.commit();
      return this.findById(purchaseBillId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async cancel(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get purchase bill items
      const [items] = await connection.execute(
        `SELECT * FROM purchase_bill_items WHERE purchase_bill_id = ?`,
        [id]
      );

      // Reverse stock
      for (const item of items) {
        const totalQty = parseFloat(item.quantity) + parseFloat(item.free_quantity || 0);
        await connection.execute(
          `UPDATE stock SET available_quantity = available_quantity - ? 
           WHERE item_id = ? AND batch_number = ? AND available_quantity >= ?`,
          [totalQty, item.item_id, item.batch_number, totalQty]
        );
      }

      // Update purchase bill status
      await connection.execute(
        `UPDATE purchase_bills SET status = 'cancelled' WHERE id = ?`,
        [id]
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

export default Purchase;

