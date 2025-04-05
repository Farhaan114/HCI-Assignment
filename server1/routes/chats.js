const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Get all chats
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chats');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error retrieving chats');
  }
});

// Get chat by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM chats WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Error retrieving chat');
  }
});

// Create chat
router.post('/', async (req, res) => {
  const { chat_type, members, messages } = req.body;
  try {
    await pool.query('INSERT INTO chats (chat_type, members, messages) VALUES ($1, $2, $3)', [chat_type, members, messages]);
    res.status(201).send('Chat created');
  } catch (err) {
    res.status(500).send('Error creating chat');
  }
});

// Update chat
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { chat_type, members, messages } = req.body;
  try {
    await pool.query('UPDATE chats SET chat_type = $1, members = $2, messages = $3 WHERE id = $4', [chat_type, members, messages, id]);
    res.send('Chat updated');
  } catch (err) {
    res.status(500).send('Error updating chat');
  }
});

// Delete chat
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM chats WHERE id = $1', [id]);
    res.send('Chat deleted');
  } catch (err) {
    res.status(500).send('Error deleting chat');
  }
});

// Get chat messages between two users
router.get('/between/:userId1/:userId2', async (req, res) => {
  const { userId1, userId2 } = req.params;
  try {
    const result = await pool.query(
      `SELECT messages FROM chats WHERE members @> $1::jsonb AND members @> $2::jsonb`,
      [JSON.stringify([userId1]), JSON.stringify([userId2])]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0].messages);
    } else {
      res.status(404).send('No chat found between these users');
    }
  } catch (err) {
    res.status(500).send('Error retrieving chat messages');
  }
});

// Append message to chat between two users
router.post('/append-message', async (req, res) => {
  const { userId1, userId2, username, message } = req.body;
  const datetime = new Date().toISOString();
  try {
    const result = await pool.query(
      `UPDATE chats SET messages = messages || $1::jsonb WHERE members @> $2::jsonb AND members @> $3::jsonb RETURNING messages`,
      [JSON.stringify([{ username, chat: message, datetime }]), JSON.stringify([userId1]), JSON.stringify([userId2])]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0].messages);
    } else {
      res.status(404).send('No chat found between these users');
    }
  } catch (err) {
    res.status(500).send('Error appending message to chat');
  }
});

module.exports = router; 