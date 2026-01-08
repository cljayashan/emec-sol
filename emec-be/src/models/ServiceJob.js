import pool from '../config/database.js';
import { generateUUID } from '../utils/uuid.js';

class ServiceJob {
  // Helper method to get the correct service package column name
  static async getServicePackageColumnName() {
    try {
      // Check for service_package_id first (new column)
      const [newCols] = await pool.execute(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_jobs' 
         AND COLUMN_NAME = 'service_package_id'
         LIMIT 1`
      );
      if (newCols.length > 0) {
        return 'service_package_id';
      }
      
      // Check for service_type_id (old column)
      const [oldCols] = await pool.execute(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_jobs' 
         AND COLUMN_NAME = 'service_type_id'
         LIMIT 1`
      );
      if (oldCols.length > 0) {
        return 'service_type_id';
      }
    } catch (error) {
      console.warn('Could not check column name:', error.message);
    }
    // Default to service_type_id since that's what likely exists
    return 'service_type_id';
  }
  
  // Helper to build service package join condition
  // Returns object with join clause and alias name
  static async buildServicePackageJoin() {
    try {
      // Check which columns actually exist
      const [allColumns] = await pool.execute(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_jobs' 
         AND COLUMN_NAME IN ('service_package_id', 'service_type_id')`
      );
      
      const hasPackageId = allColumns.some(col => col.COLUMN_NAME === 'service_package_id');
      const hasTypeId = allColumns.some(col => col.COLUMN_NAME === 'service_type_id');
      
      console.log('Service package columns check:', { hasPackageId, hasTypeId, columns: allColumns.map(c => c.COLUMN_NAME) });
      
      // Check which tables exist
      const [packageTables] = await pool.execute(
        `SELECT TABLE_NAME FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_packages'`
      );
      
      const [typeTables] = await pool.execute(
        `SELECT TABLE_NAME FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_types'`
      );
      
      console.log('Service package tables check:', { hasPackageTable: packageTables.length > 0, hasTypeTable: typeTables.length > 0 });
      
      // If service_packages table exists, use it (preferred)
      if (packageTables.length > 0) {
        if (hasPackageId) {
          console.log('Using service_packages table with service_package_id column');
          return { join: `LEFT JOIN service_packages sp ON sj.service_package_id = sp.id`, alias: 'sp' };
        } else if (hasTypeId) {
          // Column is service_type_id but table is service_packages (migration in progress)
          console.log('Using service_packages table with service_type_id column');
          return { join: `LEFT JOIN service_packages sp ON sj.service_type_id = sp.id`, alias: 'sp' };
        }
      }
      
      // Fallback to service_types table if it exists
      if (typeTables.length > 0 && hasTypeId) {
        console.log('Using service_types table with service_type_id column');
        return { join: `LEFT JOIN service_types st ON sj.service_type_id = st.id`, alias: 'st' };
      }
      
      console.log('No valid service package join found');
    } catch (error) {
      console.warn('Error building service package join:', error.message);
    }
    // Return empty join if nothing works
    return { join: '', alias: null };
  }
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

  static async findAll(page = 1, limit = 10, search = '', date = null) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    
    // Build service package join
    const { join: servicePackageJoin, alias: servicePackageAlias } = await this.buildServicePackageJoin();
    
    // Build the service package name field based on which alias exists
    const servicePackageNameField = servicePackageAlias 
      ? `${servicePackageAlias}.name as service_package_name`
      : `NULL as service_package_name`;
    
    // Build query with the correct column name
    let query = `
      SELECT sj.*, 
             v.reg_no as vehicle_reg_no,
             c.full_name as vehicle_customer,
             c.id as customer_id,
             c.mobile1 as customer_mobile1,
             c.mobile2 as customer_mobile2,
             vb.name as vehicle_brand_name,
             vm.name as vehicle_model_name,
             ${servicePackageNameField}
      FROM service_jobs sj
      LEFT JOIN vehicles v ON sj.vehicle_id = v.id
      LEFT JOIN customers c ON v.customer_id = c.id
      LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
      LEFT JOIN vehicle_models vm ON v.model_id = vm.id
      ${servicePackageJoin}
      WHERE sj.is_deleted = 0
    `;
    const params = [];

    if (search) {
      query += ` AND (sj.job_number LIKE ? OR v.reg_no LIKE ? OR c.full_name LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (date) {
      query += ` AND DATE(sj.created_at) = ?`;
      params.push(date);
    }

    query += ` ORDER BY sj.created_at DESC LIMIT ${offset}, ${limitNum}`;

    const [rows] = await pool.execute(query, params);
    
    // Count query
    let countQuery = `
      SELECT COUNT(*) as total FROM service_jobs sj
      LEFT JOIN vehicles v ON sj.vehicle_id = v.id
      LEFT JOIN customers c ON v.customer_id = c.id
      WHERE sj.is_deleted = 0
    `;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (sj.job_number LIKE ? OR v.reg_no LIKE ? OR c.full_name LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (date) {
      countQuery += ` AND DATE(sj.created_at) = ?`;
      countParams.push(date);
    }
    
    const [count] = await pool.execute(countQuery, countParams);
    return { data: rows, total: count[0].total };
  }

  static async findById(id) {
    // Build service package join
    const { join: servicePackageJoin, alias: servicePackageAlias } = await this.buildServicePackageJoin();
    
    // Build the service package fields based on which alias exists
    const servicePackageIdField = servicePackageAlias 
      ? `${servicePackageAlias}.id as service_package_id`
      : `NULL as service_package_id`;
    const servicePackageNameField = servicePackageAlias 
      ? `${servicePackageAlias}.name as service_package_name`
      : `NULL as service_package_name`;
    
    // Build query with the correct column name
    const query = `
       SELECT sj.*, 
              v.id as vehicle_id,
              v.reg_no as vehicle_reg_no,
              c.full_name as vehicle_customer,
              c.id as customer_id,
              c.mobile1 as owner_mobile,
              c.mobile2 as customer_mobile2,
              v.vehicle_type,
              vb.name as vehicle_brand_name,
              vm.name as vehicle_model_name,
              ${servicePackageIdField},
              ${servicePackageNameField}
       FROM service_jobs sj
       LEFT JOIN vehicles v ON sj.vehicle_id = v.id
       LEFT JOIN customers c ON v.customer_id = c.id
       LEFT JOIN vehicle_brands vb ON v.brand_id = vb.id
       LEFT JOIN vehicle_models vm ON v.model_id = vm.id
       ${servicePackageJoin}
       WHERE sj.id = ? AND sj.is_deleted = 0
    `;
    
    const [rows] = await pool.execute(query, [id]);
    
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
    
    // Get items/parts (optional - table may not exist if migration hasn't been run)
    try {
      const [items] = await pool.execute(
        `SELECT sji.*, i.item_name, i.barcode
         FROM service_job_items sji
         JOIN items i ON sji.item_id = i.id
         WHERE sji.service_job_id = ? AND i.is_deleted = 0
         ORDER BY sji.created_at ASC`,
        [id]
      );
      job.items = items || [];
    } catch (error) {
      // If table doesn't exist yet, just set empty array
      // This allows the system to work before migration is run
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
        job.items = [];
      } else {
        throw error;
      }
    }
    
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
        `INSERT INTO service_jobs (id, job_number, vehicle_id, service_package_id, fuel_level, odometer_reading, remarks, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          jobId,
          jobNumber,
          data.vehicle_id,
          data.service_package_id || null,
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

      // Add items/parts (optional - table may not exist if migration hasn't been run)
      if (data.items && data.items.length > 0) {
        try {
          for (const item of data.items) {
            const itemId = generateUUID();
            const totalPrice = (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)) + parseFloat(item.labour_charge || 0);
            await connection.execute(
              `INSERT INTO service_job_items (id, service_job_id, item_id, batch_number, quantity, unit_price, labour_charge, total_price) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                itemId,
                jobId,
                item.item_id,
                item.batch_number || null,
                item.quantity || 1,
                item.unit_price || 0,
                item.labour_charge || 0,
                totalPrice
              ]
            );
          }
        } catch (error) {
          // If table doesn't exist yet, just skip items
          // This allows the system to work before migration is run
          if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
            console.warn('service_job_items table does not exist yet. Items will not be saved. Please run migration 013.');
          } else {
            throw error;
          }
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
        `UPDATE service_jobs SET vehicle_id = ?, service_package_id = ?, fuel_level = ?, odometer_reading = ?, remarks = ?, status = ? 
         WHERE id = ?`,
        [
          data.vehicle_id,
          data.service_package_id || null,
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

      // Delete existing items (optional - table may not exist if migration hasn't been run)
      try {
        await connection.execute(
          `DELETE FROM service_job_items WHERE service_job_id = ?`,
          [id]
        );

        // Add new items/parts
        if (data.items && data.items.length > 0) {
          for (const item of data.items) {
            const itemId = generateUUID();
            const totalPrice = (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)) + parseFloat(item.labour_charge || 0);
            await connection.execute(
              `INSERT INTO service_job_items (id, service_job_id, item_id, batch_number, quantity, unit_price, labour_charge, total_price) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                itemId,
                id,
                item.item_id,
                item.batch_number || null,
                item.quantity || 1,
                item.unit_price || 0,
                item.labour_charge || 0,
                totalPrice
              ]
            );
          }
        }
      } catch (error) {
        // If table doesn't exist yet, just skip items
        // This allows the system to work before migration is run
        if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
          console.warn('service_job_items table does not exist yet. Items will not be saved. Please run migration 013.');
        } else {
          throw error;
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

  static async addItem(serviceJobId, itemData) {
    const connection = await pool.getConnection();
    try {
      // Verify service job exists
      const [jobs] = await connection.execute(
        `SELECT id FROM service_jobs WHERE id = ? AND is_deleted = 0`,
        [serviceJobId]
      );
      
      if (jobs.length === 0) {
        throw new Error('Service job not found');
      }

      const itemId = generateUUID();
      const totalPrice = (parseFloat(itemData.quantity || 0) * parseFloat(itemData.unit_price || 0)) + parseFloat(itemData.labour_charge || 0);
      
      await connection.execute(
        `INSERT INTO service_job_items (id, service_job_id, item_id, batch_number, quantity, unit_price, labour_charge, total_price) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          serviceJobId,
          itemData.item_id,
          itemData.batch_number || null,
          itemData.quantity || 1,
          itemData.unit_price || 0,
          itemData.labour_charge || 0,
          totalPrice
        ]
      );

      // Return the created item with item details
      const [items] = await connection.execute(
        `SELECT sji.*, i.item_name, i.barcode
         FROM service_job_items sji
         JOIN items i ON sji.item_id = i.id
         WHERE sji.id = ?`,
        [itemId]
      );

      return items[0];
    } finally {
      connection.release();
    }
  }

  static async removeItem(serviceJobId, itemId) {
    const connection = await pool.getConnection();
    try {
      // Verify the item belongs to the service job
      const [items] = await connection.execute(
        `SELECT id FROM service_job_items WHERE id = ? AND service_job_id = ?`,
        [itemId, serviceJobId]
      );
      
      if (items.length === 0) {
        throw new Error('Item not found in this service job');
      }

      await connection.execute(
        `DELETE FROM service_job_items WHERE id = ? AND service_job_id = ?`,
        [itemId, serviceJobId]
      );

      return true;
    } finally {
      connection.release();
    }
  }
}

export default ServiceJob;

