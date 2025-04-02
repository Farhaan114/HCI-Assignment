const pool = require('../config/db');

const createVideoCallsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS video_calls (
      id SERIAL PRIMARY KEY,
      call_type VARCHAR(50) CHECK (call_type IN ('one-one', 'group')) NOT NULL,
      initiator_id UUID REFERENCES users(id),
      participants JSON NOT NULL,
      call_status VARCHAR(50) CHECK (call_status IN ('ongoing', 'completed')) NOT NULL,
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('Video Calls table created successfully');
  } catch (err) {
    console.error('Error creating video calls table', err);
  }
};

module.exports = createVideoCallsTable; 