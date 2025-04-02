const { Pool } = require('pg');
const pool = require('../config/db');

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      profile_pic VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('Users table created successfully');
  } catch (err) {
    console.error('Error creating users table', err);
  }
};

module.exports = createUsersTable; 