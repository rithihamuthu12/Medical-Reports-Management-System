const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/medications/:patientId
router.get('/:patientId', authenticateToken, (req, res) => {
  try {
    const { patientId } = req.params;
    const medications = db.prepare(`
      SELECT m.*, u.name as doctor_name
      FROM medications m
      LEFT JOIN users u ON m.doctor_id = u.id
      WHERE m.patient_id = ?
      ORDER BY m.start_date DESC
    `).all(patientId);

    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ message: 'Error retrieving medications.' });
  }
});

// POST /api/medications
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const {
      patient_id,
      medicine_name,
      dosage,
      frequency,
      duration,
      start_date,
      end_date,
      instructions,
      status
    } = req.body;

    if (!patient_id || !medicine_name || !dosage || !frequency) {
      return res.status(400).json({ message: 'Patient, Medicine Name, Dosage, and Frequency are required.' });
    }

    const doctor_id = req.user.id;
    const startDateVal = start_date || new Date().toISOString().split('T')[0];

    const result = db.prepare(`
      INSERT INTO medications (
        patient_id, doctor_id, medicine_name, dosage, frequency, duration, start_date, end_date, instructions, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      patient_id,
      doctor_id,
      medicine_name.trim(),
      dosage.trim(),
      frequency.trim(),
      duration || '7 Days',
      startDateVal,
      end_date || null,
      instructions || null,
      status || 'Active'
    );

    const medication = db.prepare(`
      SELECT m.*, u.name as doctor_name FROM medications m LEFT JOIN users u ON m.doctor_id = u.id WHERE m.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ message: 'Medication prescribed successfully.', medication });
  } catch (error) {
    console.error('Error prescribing medication:', error);
    res.status(500).json({ message: 'Failed to prescribe medication.' });
  }
});

// PUT /api/medications/:id
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { id } = req.params;
    const { medicine_name, dosage, frequency, duration, start_date, end_date, instructions, status } = req.body;

    db.prepare(`
      UPDATE medications SET
        medicine_name = ?,
        dosage = ?,
        frequency = ?,
        duration = ?,
        start_date = ?,
        end_date = ?,
        instructions = ?,
        status = ?
      WHERE id = ?
    `).run(medicine_name, dosage, frequency, duration, start_date, end_date, instructions, status, id);

    res.json({ message: 'Medication status updated.' });
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ message: 'Failed to update medication.' });
  }
});

// DELETE /api/medications/:id
router.delete('/:id', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM medications WHERE id = ?').run(id);
    res.json({ message: 'Medication removed.' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ message: 'Failed to delete medication.' });
  }
});

module.exports = router;
