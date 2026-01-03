import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class BillTemplate {
  static async findByType(type) {
    const [rows] = await pool.execute(
      `SELECT * FROM bill_templates WHERE template_type = ? AND is_active = 1 LIMIT 1`,
      [type]
    );
    return rows[0] || null;
  }

  static async create(data) {
    // Deactivate existing template of same type
    await pool.execute(
      `UPDATE bill_templates SET is_active = 0 WHERE template_type = ?`,
      [data.template_type]
    );

    // Create new template
    const id = generateUUID();
    await pool.execute(
      `INSERT INTO bill_templates (id, template_type, company_name, motto, address, phone_numbers, email, logo_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.template_type,
        data.company_name || null,
        data.motto || null,
        data.address || null,
        data.phone_numbers || null,
        data.email || null,
        data.logo_path || null
      ]
    );

    const [rows] = await pool.execute(
      `SELECT * FROM bill_templates WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, data) {
    await pool.execute(
      `UPDATE bill_templates SET company_name = ?, motto = ?, address = ?, phone_numbers = ?, email = ?, logo_path = ? 
       WHERE id = ?`,
      [
        data.company_name || null,
        data.motto || null,
        data.address || null,
        data.phone_numbers || null,
        data.email || null,
        data.logo_path || null,
        id
      ]
    );

    const [rows] = await pool.execute(
      `SELECT * FROM bill_templates WHERE id = ?`,
      [id]
    );
    return rows[0];
  }
}

export default BillTemplate;

