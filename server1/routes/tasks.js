const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error retrieving tasks');
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Error retrieving task');
  }
});

// Create task
router.post('/', async (req, res) => {
  const { user_id, title, status } = req.body;
  try {
    await pool.query('INSERT INTO tasks (user_id, title, status) VALUES ($1, $2, $3)', [user_id, title, status]);
    res.status(201).send('Task created');
  } catch (err) {
    res.status(500).send('Error creating task');
  }
});

// Update task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, title, status } = req.body;
  try {
    await pool.query('UPDATE tasks SET user_id = $1, title = $2, status = $3 WHERE id = $4', [user_id, title, status, id]);
    res.send('Task updated');
  } catch (err) {
    res.status(500).send('Error updating task');
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.send('Task deleted');
  } catch (err) {
    res.status(500).send('Error deleting task');
  }
});

module.exports = router; 