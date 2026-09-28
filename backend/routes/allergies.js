const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/allergies/:patientId
router.get('/:patientId', authenticateToken, (req, res) => {
  try {
    const { patientId } = req.params;
    const allergies = db.prepare('SELECT * FROM allergies WHERE patient_id = ? ORDER BY severity DESC').all(patientId);
    res.json(allergies);
  } catch (error) {
    console.error('Error fetching allergies:', error);
    res.status(500).json({ message: 'Error retrieving allergies.' });
  }
});

// POST /api/allergies
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { patient_id, allergy_name, allergy_type, reaction, severity, notes } = req.body;

    if (!patient_id || !allergy_name || !reaction) {
      return res.status(400).json({ message: 'Patient ID, Allergy Name, and Reaction are required.' });
    }

    const result = db.prepare(`
      INSERT INTO allergies (patient_id, allergy_name, allergy_type, reaction, severity, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      patient_id,
      allergy_name.trim(),
      allergy_type || 'Drug',
      reaction.trim(),
      severity || 'Moderate',
      notes || null
    );

    const allergy = db.prepare('SELECT * FROM allergies WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Allergy alert added successfully.', allergy });
  } catch (error) {
    console.error('Error adding allergy:', error);
    res.status(500).json({ message: 'Failed to add allergy.' });
  }
});

// PUT /api/allergies/:id
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { id } = req.params;
    const { allergy_name, allergy_type, reaction, severity, notes } = req.body;

    db.prepare(`
      UPDATE allergies SET
        allergy_name = ?,
        allergy_type = ?,
        reaction = ?,
        severity = ?,
        notes = ?
      WHERE id = ?
    `).run(allergy_name, allergy_type, reaction, severity, notes, id);

    res.json({ message: 'Allergy record updated.' });
  } catch (error) {
    console.error('Error updating allergy:', error);
    res.status(500).json({ message: 'Failed to update allergy.' });
  }
});

// DELETE /api/allergies/:id
router.delete('/:id', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM allergies WHERE id = ?').run(id);
    res.json({ message: 'Allergy record deleted.' });
  } catch (error) {
    console.error('Error deleting allergy:', error);
    res.status(500).json({ message: 'Failed to delete allergy.' });
  }
});

module.exports = router;
