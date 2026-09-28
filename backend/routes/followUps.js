const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/follow-ups
router.get('/', authenticateToken, (req, res) => {
  try {
    const { filter = 'all', status = 'all', patientId } = req.query;

    let query = `
      SELECT f.*, p.full_name as patient_name, p.patient_id as patient_code, p.phone as patient_phone,
             u.name as doctor_name
      FROM follow_ups f
      JOIN patients p ON f.patient_id = p.id
      LEFT JOIN users u ON f.doctor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Patient role constraint
    if (req.user.role === 'patient') {
      const selfPatient = db.prepare('SELECT id FROM patients WHERE user_id = ? OR email = ?').get(req.user.id, req.user.email);
      if (selfPatient) {
        query += ' AND f.patient_id = ?';
        params.push(selfPatient.id);
      } else {
        return res.json([]);
      }
    } else if (patientId) {
      query += ' AND f.patient_id = ?';
      params.push(patientId);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (filter === 'today') {
      query += ' AND f.follow_up_date = ?';
      params.push(todayStr);
    } else if (filter === 'this_week') {
      const today = new Date();
      const endOfWeek = new Date();
      endOfWeek.setDate(today.getDate() + 7);
      query += ' AND f.follow_up_date >= ? AND f.follow_up_date <= ?';
      params.push(todayStr, endOfWeek.toISOString().split('T')[0]);
    } else if (filter === 'upcoming') {
      query += " AND f.follow_up_date >= ? AND f.status = 'Scheduled'";
      params.push(todayStr);
    } else if (filter === 'completed') {
      query += " AND f.status = 'Completed'";
    }

    if (status !== 'all' && filter !== 'completed') {
      query += ' AND f.status = ?';
      params.push(status);
    }

    query += ' ORDER BY f.follow_up_date ASC';

    const followUps = db.prepare(query).all(...params);
    res.json(followUps);
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    res.status(500).json({ message: 'Error retrieving follow-ups.' });
  }
});

// POST /api/follow-ups
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { patient_id, follow_up_date, reason, status, notes } = req.body;

    if (!patient_id || !follow_up_date || !reason) {
      return res.status(400).json({ message: 'Patient, Follow-up Date, and Reason are required.' });
    }

    const doctor_id = req.user.id;

    const result = db.prepare(`
      INSERT INTO follow_ups (patient_id, doctor_id, follow_up_date, reason, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      patient_id,
      doctor_id,
      follow_up_date,
      reason.trim(),
      status || 'Scheduled',
      notes || null
    );

    const followUp = db.prepare(`
      SELECT f.*, p.full_name as patient_name, p.patient_id as patient_code, u.name as doctor_name
      FROM follow_ups f
      JOIN patients p ON f.patient_id = p.id
      LEFT JOIN users u ON f.doctor_id = u.id
      WHERE f.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ message: 'Follow-up appointment scheduled.', followUp });
  } catch (error) {
    console.error('Error creating follow-up:', error);
    res.status(500).json({ message: 'Failed to schedule follow-up.' });
  }
});

// PUT /api/follow-ups/:id - Update status or details
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { id } = req.params;
    const { follow_up_date, reason, status, notes } = req.body;

    const existing = db.prepare('SELECT * FROM follow_ups WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ message: 'Follow-up not found.' });
    }

    db.prepare(`
      UPDATE follow_ups SET
        follow_up_date = ?,
        reason = ?,
        status = ?,
        notes = ?
      WHERE id = ?
    `).run(
      follow_up_date || existing.follow_up_date,
      reason || existing.reason,
      status || existing.status,
      notes !== undefined ? notes : existing.notes,
      id
    );

    const updated = db.prepare('SELECT * FROM follow_ups WHERE id = ?').get(id);
    res.json({ message: 'Follow-up record updated.', followUp: updated });
  } catch (error) {
    console.error('Error updating follow-up:', error);
    res.status(500).json({ message: 'Failed to update follow-up.' });
  }
});

// DELETE /api/follow-ups/:id
router.delete('/:id', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM follow_ups WHERE id = ?').run(id);
    res.json({ message: 'Follow-up deleted.' });
  } catch (error) {
    console.error('Error deleting follow-up:', error);
    res.status(500).json({ message: 'Failed to delete follow-up.' });
  }
});

module.exports = router;
