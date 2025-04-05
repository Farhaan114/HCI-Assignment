const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Get all video calls
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM video_calls');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error retrieving video calls');
  }
});

// Get video call by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM video_calls WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Error retrieving video call');
  }
});

// Create video call
router.post('/', async (req, res) => {
  const { call_type, initiator_id, participants, call_status, start_time, end_time } = req.body;
  try {
    await pool.query('INSERT INTO video_calls (call_type, initiator_id, participants, call_status, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6)', [call_type, initiator_id, participants, call_status, start_time, end_time]);
    res.status(201).send('Video call created');
  } catch (err) {
    res.status(500).send('Error creating video call');
  }
});

// Update video call
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { call_type, initiator_id, participants, call_status, start_time, end_time } = req.body;
  try {
    await pool.query('UPDATE video_calls SET call_type = $1, initiator_id = $2, participants = $3, call_status = $4, start_time = $5, end_time = $6 WHERE id = $7', [call_type, initiator_id, participants, call_status, start_time, end_time, id]);
    res.send('Video call updated');
  } catch (err) {
    res.status(500).send('Error updating video call');
  }
});

// Delete video call
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM video_calls WHERE id = $1', [id]);
    res.send('Video call deleted');
  } catch (err) {
    res.status(500).send('Error deleting video call');
  }
});

module.exports = router; 