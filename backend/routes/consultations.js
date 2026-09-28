const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/consultations/:patientId
router.get('/:patientId', authenticateToken, (req, res) => {
  try {
    const { patientId } = req.params;

    const consultations = db.prepare(`
      SELECT c.*, u.name as doctor_name, u.specialization
      FROM consultations c
      LEFT JOIN users u ON c.doctor_id = u.id
      WHERE c.patient_id = ?
      ORDER BY c.consultation_date DESC
    `).all(patientId);

    res.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ message: 'Error retrieving consultation records.' });
  }
});

// POST /api/consultations - Create consultation with optional auto-prescribed medicines
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const {
      patient_id,
      consultation_date,
      chief_complaint,
      symptoms,
      temperature,
      blood_pressure,
      heart_rate,
      spo2,
      weight,
      clinical_notes,
      diagnosis_primary,
      diagnosis_additional,
      treatment_plan,
      doctor_notes,
      prescribed_medicines // optional array: [{ medicine_name, dosage, frequency, duration, instructions }]
    } = req.body;

    if (!patient_id || !chief_complaint || !symptoms || !diagnosis_primary || !treatment_plan) {
      return res.status(400).json({
        message: 'Patient, Chief Complaint, Symptoms, Primary Diagnosis, and Treatment Plan are required.'
      });
    }

    const doctor_id = req.user.id;
    const dateStr = consultation_date || new Date().toISOString().split('T')[0];

    const result = db.prepare(`
      INSERT INTO consultations (
        patient_id, doctor_id, consultation_date, chief_complaint, symptoms,
        temperature, blood_pressure, heart_rate, spo2, weight,
        clinical_notes, diagnosis_primary, diagnosis_additional, treatment_plan, doctor_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      patient_id,
      doctor_id,
      dateStr,
      chief_complaint.trim(),
      symptoms.trim(),
      temperature || null,
      blood_pressure || null,
      heart_rate || null,
      spo2 || null,
      weight || null,
      clinical_notes || null,
      diagnosis_primary.trim(),
      diagnosis_additional || null,
      treatment_plan.trim(),
      doctor_notes || null
    );

    const consultationId = result.lastInsertRowid;

    // Auto-record in Case History table as well for thorough record-keeping!
    db.prepare(`
      INSERT INTO case_histories (patient_id, doctor_id, consultation_date, chief_complaint, symptoms, severity, notes)
      VALUES (?, ?, ?, ?, ?, 'Moderate', ?)
    `).run(patient_id, doctor_id, dateStr, chief_complaint, symptoms, `Recorded during consultation #${consultationId}`);

    // Insert prescribed medicines if provided
    if (Array.isArray(prescribed_medicines) && prescribed_medicines.length > 0) {
      const insertMed = db.prepare(`
        INSERT INTO medications (patient_id, doctor_id, medicine_name, dosage, frequency, duration, start_date, instructions, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
      `);

      for (const med of prescribed_medicines) {
        if (med.medicine_name && med.medicine_name.trim()) {
          insertMed.run(
            patient_id,
            doctor_id,
            med.medicine_name.trim(),
            med.dosage || '1 tablet',
            med.frequency || 'Once daily',
            med.duration || '7 Days',
            dateStr,
            med.instructions || null
          );
        }
      }
    }

    const newConsultation = db.prepare(`
      SELECT c.*, u.name as doctor_name, u.specialization
      FROM consultations c
      LEFT JOIN users u ON c.doctor_id = u.id
      WHERE c.id = ?
    `).get(consultationId);

    res.status(201).json({
      message: 'Consultation recorded successfully.',
      consultation: newConsultation
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ message: 'Failed to record consultation.' });
  }
});

module.exports = router;
