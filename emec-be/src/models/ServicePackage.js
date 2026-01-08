import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class ServicePackage {
  static async findAll(page = 1, limit = 10, search = '') {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    
    let query = `SELECT * FROM service_packages WHERE is_deleted = 0`;
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    // MySQL2 requires LIMIT values to be numbers, not placeholders
    query += ` ORDER BY created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    
    // Count query
    let countQuery = `SELECT COUNT(*) as total FROM service_packages WHERE is_deleted = 0`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (name LIKE ? OR description LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern);
    }
    
    const [count] = await pool.execute(countQuery, countParams);
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM service_packages WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const servicePackage = rows[0];
    
    // Get associated services
    const [services] = await pool.execute(
      `SELECT s.* FROM services s
       INNER JOIN service_service_packages ssp ON s.id = ssp.service_id
       WHERE ssp.service_package_id = ? AND s.is_deleted = 0
       ORDER BY s.name ASC`,
      [id]
    );
    
    servicePackage.services = services;
    return servicePackage;
  }

  static async findByName(name, excludeId = null) {
    let query = `SELECT * FROM service_packages WHERE name = ? AND is_deleted = 0`;
    const params = [name];
    
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0];
  }

  static async create(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check for duplicate name (only for non-deleted records)
      const existing = await this.findByName(data.name);
      if (existing) {
        const error = new Error('Service package with this name already exists');
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      const id = generateUUID();
      await connection.execute(
        `INSERT INTO service_packages (id, name, description) VALUES (?, ?, ?)`,
        [id, data.name, data.description || null]
      );

      // Add services if provided
      if (data.service_ids && Array.isArray(data.service_ids) && data.service_ids.length > 0) {
        for (const serviceId of data.service_ids) {
          const junctionId = generateUUID();
          await connection.execute(
            `INSERT INTO service_service_packages (id, service_id, service_package_id) VALUES (?, ?, ?)`,
            [junctionId, serviceId, id]
          );
        }
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

  static async update(id, data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check for duplicate name (excluding current record, only for non-deleted records)
      const existing = await this.findByName(data.name, id);
      if (existing) {
        const error = new Error('Service package with this name already exists');
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      await connection.execute(
        `UPDATE service_packages SET name = ?, description = ? WHERE id = ?`,
        [data.name, data.description || null, id]
      );

      // Update services if provided
      if (data.service_ids !== undefined) {
        // Delete existing service associations
        await connection.execute(
          `DELETE FROM service_service_packages WHERE service_package_id = ?`,
          [id]
        );

        // Add new service associations
        if (Array.isArray(data.service_ids) && data.service_ids.length > 0) {
          for (const serviceId of data.service_ids) {
            const junctionId = generateUUID();
            await connection.execute(
              `INSERT INTO service_service_packages (id, service_id, service_package_id) VALUES (?, ?, ?)`,
              [junctionId, serviceId, id]
            );
          }
        }
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
      `UPDATE service_packages SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default ServicePackage;
