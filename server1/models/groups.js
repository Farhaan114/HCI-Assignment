const pool = require('../config/db');

const createGroupsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_name VARCHAR(255) UNIQUE NOT NULL,
      admin_id UUID REFERENCES users(id),
      members JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('Groups table created successfully');
  } catch (err) {
    console.error('Error creating groups table', err);
  }
};

module.exports = createGroupsTable; 