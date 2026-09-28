const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/case-history/:patientId
router.get('/:patientId', authenticateToken, (req, res) => {
  try {
    const { patientId } = req.params;
    const cases = db.prepare(`
      SELECT ch.*, u.name as doctor_name
      FROM case_histories ch
      LEFT JOIN users u ON ch.doctor_id = u.id
      WHERE ch.patient_id = ?
      ORDER BY ch.consultation_date DESC
    `).all(patientId);

    res.json(cases);
  } catch (error) {
    console.error('Error fetching case history:', error);
    res.status(500).json({ message: 'Error retrieving case history.' });
  }
});

// POST /api/case-history
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const {
      patient_id,
      consultation_date,
      chief_complaint,
      symptoms,
      duration,
      severity,
      previous_history,
      family_history,
      lifestyle,
      notes
    } = req.body;

    if (!patient_id || !chief_complaint || !symptoms) {
      return res.status(400).json({ message: 'Patient, Chief Complaint, and Symptoms are required.' });
    }

    const doctor_id = req.user.id;
    const dateStr = consultation_date || new Date().toISOString().split('T')[0];

    const result = db.prepare(`
      INSERT INTO case_histories (
        patient_id, doctor_id, consultation_date, chief_complaint, symptoms, duration, severity, previous_history, family_history, lifestyle, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      patient_id,
      doctor_id,
      dateStr,
      chief_complaint,
      symptoms,
      duration || null,
      severity || 'Moderate',
      previous_history || null,
      family_history || null,
      lifestyle || null,
      notes || null
    );

    const createdCase = db.prepare(`
      SELECT ch.*, u.name as doctor_name FROM case_histories ch LEFT JOIN users u ON ch.doctor_id = u.id WHERE ch.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ message: 'Case history recorded successfully.', caseHistory: createdCase });
  } catch (error) {
    console.error('Error saving case history:', error);
    res.status(500).json({ message: 'Failed to record case history.' });
  }
});

// PUT /api/case-history/:id
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { id } = req.params;
    const {
      chief_complaint,
      symptoms,
      duration,
      severity,
      previous_history,
      family_history,
      lifestyle,
      notes
    } = req.body;

    db.prepare(`
      UPDATE case_histories SET
        chief_complaint = ?,
        symptoms = ?,
        duration = ?,
        severity = ?,
        previous_history = ?,
        family_history = ?,
        lifestyle = ?,
        notes = ?
      WHERE id = ?
    `).run(
      chief_complaint,
      symptoms,
      duration,
      severity,
      previous_history,
      family_history,
      lifestyle,
      notes,
      id
    );

    res.json({ message: 'Case history updated successfully.' });
  } catch (error) {
    console.error('Error updating case history:', error);
    res.status(500).json({ message: 'Failed to update case history.' });
  }
});

module.exports = router;
