import dotenv from 'dotenv';
import pool from '../src/config/database.js';
import bcrypt from 'bcrypt';
import { generateUUID } from '../src/utils/uuid.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    console.log('Creating admin user...');

    // Check if admin user already exists
    const [existingUsers] = await pool.execute(
      `SELECT * FROM users WHERE username = ? OR email = ?`,
      ['admin', 'admin@emec.com']
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists!');
      console.log('Username:', existingUsers[0].username);
      console.log('Email:', existingUsers[0].email);
      process.exit(0);
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin', salt);
    const userId = generateUUID();

    // Insert admin user
    await pool.execute(
      `INSERT INTO users (id, username, email, password_hash, salt, full_name, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'admin',
        'admin@emec.com',
        passwordHash,
        salt,
        'Administrator',
        'admin'
      ]
    );

    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin');
    console.log('Email: admin@emec.com');
    console.log('Role: admin');
    console.log('\n⚠️  IMPORTANT: Please change the default password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();

