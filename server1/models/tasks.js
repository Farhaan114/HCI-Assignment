const pool = require('../config/db');

const createTasksTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES users(id),
      title VARCHAR(255) NOT NULL,
      status VARCHAR(50) CHECK (status IN ('pending', 'completed', 'ongoing')) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('Tasks table created successfully');
  } catch (err) {
    console.error('Error creating tasks table', err);
  }
};

module.exports = createTasksTable; 