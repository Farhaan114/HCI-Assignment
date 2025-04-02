const pool = require('../config/db');

const createChatsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS chats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      chat_type VARCHAR(50) CHECK (chat_type IN ('private', 'group')) NOT NULL,
      members JSON NOT NULL,
      messages JSON
    );
  `;

  try {
    await pool.query(query);
    console.log('Chats table created successfully');
  } catch (err) {
    console.error('Error creating chats table', err);
  }
};

module.exports = createChatsTable; 