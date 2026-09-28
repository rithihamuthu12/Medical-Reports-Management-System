const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/stats/admin
router.get('/admin', authenticateToken, (req, res) => {
  try {
    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
    const totalDoctors = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'doctor'").get().count;
    const totalConsultations = db.prepare('SELECT COUNT(*) as count FROM consultations').get().count;
    const pendingFollowups = db.prepare("SELECT COUNT(*) as count FROM follow_ups WHERE status = 'Scheduled'").get().count;

    const recentPatients = db.prepare(`
      SELECT id, patient_id, full_name, age, gender, phone, blood_group, created_at
      FROM patients ORDER BY created_at DESC LIMIT 5
    `).all();

    const recentConsultations = db.prepare(`
      SELECT c.id, c.consultation_date, c.chief_complaint, c.diagnosis_primary,
             p.full_name as patient_name, p.patient_id as patient_code,
             u.name as doctor_name
      FROM consultations c
      JOIN patients p ON c.patient_id = p.id
      LEFT JOIN users u ON c.doctor_id = u.id
      ORDER BY c.created_at DESC LIMIT 5
    `).all();

    const upcomingFollowups = db.prepare(`
      SELECT f.id, f.follow_up_date, f.reason, f.status,
             p.full_name as patient_name, p.patient_id as patient_code, p.phone as patient_phone,
             u.name as doctor_name
      FROM follow_ups f
      JOIN patients p ON f.patient_id = p.id
      LEFT JOIN users u ON f.doctor_id = u.id
      WHERE f.status = 'Scheduled'
      ORDER BY f.follow_up_date ASC LIMIT 5
    `).all();

    res.json({
      totalPatients,
      totalDoctors,
      totalConsultations,
      pendingFollowups,
      recentPatients,
      recentConsultations,
      upcomingFollowups
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/stats/doctor
router.get('/doctor', authenticateToken, (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const todayConsultations = db.prepare(`
      SELECT COUNT(*) as count FROM consultations
      WHERE consultation_date = ? OR (doctor_id = ? AND consultation_date = ?)
    `).get(todayStr, req.user.id, todayStr).count;

    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;

    const upcomingFollowupsCount = db.prepare(`
      SELECT COUNT(*) as count FROM follow_ups
      WHERE status = 'Scheduled' AND (doctor_id = ? OR doctor_id IS NULL)
    `).get(req.user.id).count;

    const recentRecords = db.prepare(`
      SELECT p.id, p.patient_id, p.full_name, p.age, p.gender, p.blood_group, p.phone,
             (SELECT MAX(consultation_date) FROM consultations WHERE patient_id = p.id) as last_visit
      FROM patients p
      ORDER BY p.created_at DESC LIMIT 6
    `).all();

    const todaySchedule = db.prepare(`
      SELECT f.id, f.follow_up_date, f.reason, f.status,
             p.id as patient_id, p.patient_id as patient_code, p.full_name as patient_name, p.phone as patient_phone
      FROM follow_ups f
      JOIN patients p ON f.patient_id = p.id
      WHERE f.follow_up_date = ? AND f.status = 'Scheduled'
    `).all(todayStr);

    res.json({
      todayConsultations,
      totalPatients,
      upcomingFollowupsCount,
      recentRecords,
      todaySchedule
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/stats/patient
router.get('/patient', authenticateToken, (req, res) => {
  try {
    let patient = db.prepare('SELECT * FROM patients WHERE user_id = ? OR email = ?').get(req.user.id, req.user.email);

    if (!patient) {
      return res.status(404).json({ message: 'Patient record not associated with this user.' });
    }

    const totalConsultations = db.prepare('SELECT COUNT(*) as count FROM consultations WHERE patient_id = ?').get(patient.id).count;
    const activeMedicationsCount = db.prepare("SELECT COUNT(*) as count FROM medications WHERE patient_id = ? AND status = 'Active'").get(patient.id).count;
    const allergiesCount = db.prepare('SELECT COUNT(*) as count FROM allergies WHERE patient_id = ?').get(patient.id).count;

    const nextFollowUp = db.prepare(`
      SELECT f.id, f.follow_up_date, f.reason, f.status, u.name as doctor_name
      FROM follow_ups f
      LEFT JOIN users u ON f.doctor_id = u.id
      WHERE f.patient_id = ? AND f.status = 'Scheduled'
      ORDER BY f.follow_up_date ASC LIMIT 1
    `).get(patient.id);

    const recentConsultations = db.prepare(`
      SELECT c.*, u.name as doctor_name, u.specialization
      FROM consultations c
      LEFT JOIN users u ON c.doctor_id = u.id
      WHERE c.patient_id = ?
      ORDER BY c.consultation_date DESC LIMIT 5
    `).all(patient.id);

    const activeMedications = db.prepare(`
      SELECT * FROM medications WHERE patient_id = ? AND status = 'Active' ORDER BY created_at DESC
    `).all(patient.id);

    const allergies = db.prepare(`
      SELECT * FROM allergies WHERE patient_id = ? ORDER BY severity DESC
    `).all(patient.id);

    res.json({
      patient,
      totalConsultations,
      activeMedicationsCount,
      allergiesCount,
      nextFollowUp,
      recentConsultations,
      activeMedications,
      allergies
    });
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
