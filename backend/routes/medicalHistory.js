const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/medical-history/:patientId
router.get('/:patientId', authenticateToken, (req, res) => {
  try {
    const { patientId } = req.params;
    const history = db.prepare(`
      SELECT * FROM medical_history WHERE patient_id = ? ORDER BY created_at DESC
    `).all(patientId);

    res.json(history);
  } catch (error) {
    console.error('Error fetching medical history:', error);
    res.status(500).json({ message: 'Error retrieving medical history.' });
  }
});

// POST /api/medical-history
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { patient_id, condition, diagnosed_date, status, treatment, notes } = req.body;

    if (!patient_id || !condition) {
      return res.status(400).json({ message: 'Patient ID and Condition are required.' });
    }

    const result = db.prepare(`
      INSERT INTO medical_history (patient_id, condition, diagnosed_date, status, treatment, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      patient_id,
      condition.trim(),
      diagnosed_date || new Date().toISOString().split('T')[0],
      status || 'Active',
      treatment || null,
      notes || null
    );

    const record = db.prepare('SELECT * FROM medical_history WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Medical history entry added.', record });
  } catch (error) {
    console.error('Error adding medical history:', error);
    res.status(500).json({ message: 'Failed to add medical history.' });
  }
});

// PUT /api/medical-history/:id
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { id } = req.params;
    const { condition, diagnosed_date, status, treatment, notes } = req.body;

    db.prepare(`
      UPDATE medical_history SET
        condition = ?,
        diagnosed_date = ?,
        status = ?,
        treatment = ?,
        notes = ?
      WHERE id = ?
    `).run(condition, diagnosed_date, status, treatment, notes, id);

    res.json({ message: 'Medical history updated.' });
  } catch (error) {
    console.error('Error updating medical history:', error);
    res.status(500).json({ message: 'Failed to update medical history.' });
  }
});

// DELETE /api/medical-history/:id
router.delete('/:id', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM medical_history WHERE id = ?').run(id);
    res.json({ message: 'Medical history record removed.' });
  } catch (error) {
    console.error('Error deleting medical history:', error);
    res.status(500).json({ message: 'Failed to delete record.' });
  }
});

module.exports = router;
