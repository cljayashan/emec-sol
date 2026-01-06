import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class ServiceJob {
  static async generateJobNumber() {
    // Get current date components
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // Last 2 digits of year
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month (1-12)
    const day = String(now.getDate()).padStart(2, '0'); // Day (1-31)
    const datePrefix = `${year}${month}${day}`; // YYMMDD format
    const prefix = 'SJ-';
    
    // Get the last job number for today
    const [rows] = await pool.execute(
      `SELECT job_number FROM service_jobs 
       WHERE is_deleted = 0 
       AND job_number LIKE ? 
       ORDER BY job_number DESC LIMIT 1`,
      [`${prefix}${datePrefix}%`]
    );
    
    if (rows.length === 0) {
      // First job number for today
      return `${prefix}${datePrefix}001`;
    }
    
    const lastJobNumber = rows[0].job_number;
    // Extract sequential part (last 3 digits after the date)
    const sequentialPart = lastJobNumber.slice(-3);
    const nextNumber = parseInt(sequentialPart) + 1;
    
    if (nextNumber > 999) {
      // If we exceed 999 jobs in a day, use timestamp as fallback
      return `${prefix}${datePrefix}${String(Date.now()).slice(-3)}`;
    }
    
    return `${prefix}${datePrefix}${String(nextNumber).padStart(3, '0')}`;
  }

  static async findAll(page = 1, limit = 10, search = '') {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    
    let query = `
      SELECT sj.*, 
             v.reg_no as vehicle_reg_no,
             v.customer as vehicle_customer,
             vb.name as vehicle_brand_name,
             vm.name as vehicle_model_name,
             st.name as service_type_name
      FROM service_jobs sj
      LEFT JOIN vehicles v ON sj.vehicle_id = v.id
      LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
      LEFT JOIN vehicle_models vm ON v.model_id = vm.id
      LEFT JOIN service_types st ON sj.service_type_id = st.id
      WHERE sj.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (sj.job_number LIKE ? OR v.reg_no LIKE ? OR v.customer LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY sj.created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    
    // Count query
    let countQuery = `
      SELECT COUNT(*) as total FROM service_jobs sj
      LEFT JOIN vehicles v ON sj.vehicle_id = v.id
      WHERE sj.is_deleted = 0
    `;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (sj.job_number LIKE ? OR v.reg_no LIKE ? OR v.customer LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    const [count] = await pool.execute(countQuery, countParams);
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `       SELECT sj.*, 
              v.id as vehicle_id,
              v.reg_no as vehicle_reg_no,
              v.customer as vehicle_customer,
              v.vehicle_type,
              vb.name as vehicle_brand_name,
              vm.name as vehicle_model_name,
              st.id as service_type_id,
              st.name as service_type_name
       FROM service_jobs sj
       LEFT JOIN vehicles v ON sj.vehicle_id = v.id
       LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
       LEFT JOIN vehicle_models vm ON v.model_id = vm.id
       LEFT JOIN service_types st ON sj.service_type_id = st.id
       WHERE sj.id = ? AND sj.is_deleted = 0`,
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const job = rows[0];
    
    // Get defects
    const [defects] = await pool.execute(
      `SELECT vd.* FROM service_job_defects sjd
       JOIN vehicle_defects vd ON sjd.vehicle_defect_id = vd.id
       WHERE sjd.service_job_id = ? AND vd.is_deleted = 0`,
      [id]
    );
    job.defects = defects;
    
    // Get recommendations
    const [recommendations] = await pool.execute(
      `SELECT pir.* FROM service_job_recommendations sjr
       JOIN pre_inspection_recommendations pir ON sjr.pre_inspection_recommendation_id = pir.id
       WHERE sjr.service_job_id = ? AND pir.is_deleted = 0`,
      [id]
    );
    job.recommendations = recommendations;
    
    return job;
  }

  static async create(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Generate job number
      const jobNumber = await this.generateJobNumber();
      
      // Create service job
      const jobId = generateUUID();
      await connection.execute(
        `INSERT INTO service_jobs (id, job_number, vehicle_id, service_type_id, fuel_level, odometer_reading, remarks, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          jobId,
          jobNumber,
          data.vehicle_id,
          data.service_type_id || null,
          data.fuel_level || null,
          data.odometer_reading || null,
          data.remarks || null,
          data.status || 'pending'
        ]
      );

      // Add defects
      if (data.defects && data.defects.length > 0) {
        for (const defectId of data.defects) {
          const defectJobId = generateUUID();
          await connection.execute(
            `INSERT INTO service_job_defects (id, service_job_id, vehicle_defect_id) 
             VALUES (?, ?, ?)`,
            [defectJobId, jobId, defectId]
          );
        }
      }

      // Add recommendations
      if (data.recommendations && data.recommendations.length > 0) {
        for (const recommendationId of data.recommendations) {
          const recJobId = generateUUID();
          await connection.execute(
            `INSERT INTO service_job_recommendations (id, service_job_id, pre_inspection_recommendation_id) 
             VALUES (?, ?, ?)`,
            [recJobId, jobId, recommendationId]
          );
        }
      }

      await connection.commit();
      return this.findById(jobId);
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

      // Update service job
      await connection.execute(
        `UPDATE service_jobs SET vehicle_id = ?, service_type_id = ?, fuel_level = ?, odometer_reading = ?, remarks = ?, status = ? 
         WHERE id = ?`,
        [
          data.vehicle_id,
          data.service_type_id || null,
          data.fuel_level || null,
          data.odometer_reading || null,
          data.remarks || null,
          data.status || 'pending',
          id
        ]
      );

      // Delete existing defects
      await connection.execute(
        `DELETE FROM service_job_defects WHERE service_job_id = ?`,
        [id]
      );

      // Add new defects
      if (data.defects && data.defects.length > 0) {
        for (const defectId of data.defects) {
          const defectJobId = generateUUID();
          await connection.execute(
            `INSERT INTO service_job_defects (id, service_job_id, vehicle_defect_id) 
             VALUES (?, ?, ?)`,
            [defectJobId, id, defectId]
          );
        }
      }

      // Delete existing recommendations
      await connection.execute(
        `DELETE FROM service_job_recommendations WHERE service_job_id = ?`,
        [id]
      );

      // Add new recommendations
      if (data.recommendations && data.recommendations.length > 0) {
        for (const recommendationId of data.recommendations) {
          const recJobId = generateUUID();
          await connection.execute(
            `INSERT INTO service_job_recommendations (id, service_job_id, pre_inspection_recommendation_id) 
             VALUES (?, ?, ?)`,
            [recJobId, id, recommendationId]
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

  static async delete(id) {
    await pool.execute(
      `UPDATE service_jobs SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default ServiceJob;

