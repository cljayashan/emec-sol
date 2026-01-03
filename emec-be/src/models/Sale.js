import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class Sale {
  static async findAll(page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    
    // MySQL2 requires LIMIT values to be numbers, not placeholders
    const [rows] = await pool.execute(
      `SELECT * FROM sale_bills WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT ${offset}, ${limitNum}`
    );
    const [count] = await pool.execute(
      `SELECT COUNT(*) as total FROM sale_bills WHERE is_deleted = 0`
    );
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [bills] = await pool.execute(
      `SELECT * FROM sale_bills WHERE id = ? AND is_deleted = 0`,
      [id]
    );

    if (bills.length === 0) return null;

    const bill = bills[0];

    const [items] = await pool.execute(
      `SELECT sbi.*, i.item_name, i.brand, i.measurement_unit 
       FROM sale_bill_items sbi 
       LEFT JOIN items i ON sbi.item_id = i.id 
       WHERE sbi.sale_bill_id = ?`,
      [id]
    );

    const [payments] = await pool.execute(
      `SELECT * FROM payment_details WHERE sale_bill_id = ?`,
      [id]
    );

    bill.items = items;
    bill.payments = payments;
    return bill;
  }

  static async create(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create sale bill
      const saleBillId = generateUUID();
      await connection.execute(
        `INSERT INTO sale_bills (id, bill_number, sale_date, subtotal, labour_charge, discount, total_amount, payment_method) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          saleBillId,
          data.bill_number,
          data.sale_date,
          data.subtotal,
          data.labour_charge || 0,
          data.discount || 0,
          data.total_amount,
          data.payment_method
        ]
      );

      // Create sale bill items and update stock (FIFO)
      for (const item of data.items) {
        const itemId = generateUUID();
        await connection.execute(
          `INSERT INTO sale_bill_items (id, sale_bill_id, item_id, batch_number, quantity, unit_price, labour_charge, total_price) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            saleBillId,
            item.item_id,
            item.batch_number,
            item.quantity,
            item.unit_price,
            item.labour_charge || 0,
            item.total_price
          ]
        );

        // Update stock (FIFO - reduce from available quantity)
        await connection.execute(
          `UPDATE stock SET available_quantity = available_quantity - ? 
           WHERE item_id = ? AND batch_number = ? AND available_quantity >= ?`,
          [item.quantity, item.item_id, item.batch_number, item.quantity]
        );
      }

      // Create payment details
      if (data.payment_details) {
        for (const payment of data.payment_details) {
          const paymentId = generateUUID();
          await connection.execute(
            `INSERT INTO payment_details (id, sale_bill_id, payment_method, amount, bank_name, card_type, card_last_four, reference_number, cheque_date, cheque_name, remarks) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              paymentId,
              saleBillId,
              payment.payment_method,
              payment.amount,
              payment.bank_name || null,
              payment.card_type || null,
              payment.card_last_four || null,
              payment.reference_number || null,
              payment.cheque_date || null,
              payment.cheque_name || null,
              payment.remarks || null
            ]
          );
        }
      }

      await connection.commit();
      return this.findById(saleBillId);
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

      // Get sale bill items
      const [items] = await connection.execute(
        `SELECT * FROM sale_bill_items WHERE sale_bill_id = ?`,
        [id]
      );

      // Reverse stock
      for (const item of items) {
        await connection.execute(
          `UPDATE stock SET available_quantity = available_quantity + ? 
           WHERE item_id = ? AND batch_number = ?`,
          [item.quantity, item.item_id, item.batch_number]
        );
      }

      // Update sale bill status
      await connection.execute(
        `UPDATE sale_bills SET status = 'cancelled' WHERE id = ?`,
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

export default Sale;

