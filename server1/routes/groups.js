const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Get all groups
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM groups');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error retrieving groups');
  }
});

// Get group by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM groups WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Error retrieving group');
  }
});

// Create group
router.post('/', async (req, res) => {
  const { group_name, admin_id, members } = req.body;
  try {
    await pool.query('INSERT INTO groups (group_name, admin_id, members) VALUES ($1, $2, $3)', [group_name, admin_id, members]);
    res.status(201).send('Group created');
  } catch (err) {
    res.status(500).send('Error creating group');
  }
});

// Update group
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { group_name, admin_id, members } = req.body;
  try {
    await pool.query('UPDATE groups SET group_name = $1, admin_id = $2, members = $3 WHERE id = $4', [group_name, admin_id, members, id]);
    res.send('Group updated');
  } catch (err) {
    res.status(500).send('Error updating group');
  }
});

// Delete group
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM groups WHERE id = $1', [id]);
    res.send('Group deleted');
  } catch (err) {
    res.status(500).send('Error deleting group');
  }
});

module.exports = router; 