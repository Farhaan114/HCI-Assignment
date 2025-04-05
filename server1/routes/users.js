const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error retrieving users');
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Error retrieving user');
  }
});

// Create user
router.post('/', async (req, res) => {
  const { username, email, password_hash } = req.body;
  try {
    await pool.query('INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)', [username, email, password_hash]);
    res.status(201).send('User created');
  } catch (err) {
    res.status(500).send('Error creating user');
  }
});

// Update user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, password_hash } = req.body;
  try {
    await pool.query('UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE id = $4', [username, email, password_hash, id]);
    res.send('User updated');
  } catch (err) {
    res.status(500).send('Error updating user');
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.send('User deleted');
  } catch (err) {
    res.status(500).send('Error deleting user');
  }
});

module.exports = router; 