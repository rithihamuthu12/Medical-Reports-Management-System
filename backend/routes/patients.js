const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Helper to calculate age from DOB
function calculateAge(dobString) {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Helper to generate unique Patient ID
function generatePatientId() {
  const currentYear = new Date().getFullYear();
  const countRow = db.prepare('SELECT COUNT(*) as count FROM patients').get();
  const nextNum = String(countRow.count + 1).padStart(3, '0');
  let candidate = `PAT-${currentYear}-${nextNum}`;
  
  // Ensure uniqueness
  const existing = db.prepare('SELECT id FROM patients WHERE patient_id = ?').get(candidate);
  if (existing) {
    const timestamp = String(Date.now()).slice(-4);
    candidate = `PAT-${currentYear}-${timestamp}`;
  }
  return candidate;
}

// GET /api/patients - List with search, filter, sort, pagination
router.get('/', authenticateToken, (req, res) => {
  try {
    const { search, gender, blood_group, status, sort = 'newest', page = 1, limit = 50 } = req.query;

    let query = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    if (search) {
      const term = `%${search.trim()}%`;
      query += ' AND (full_name LIKE ? OR patient_id LIKE ? OR phone LIKE ? OR email LIKE ?)';
      params.push(term, term, term, term);
    }

    if (gender && gender !== 'All') {
      query += ' AND gender = ?';
      params.push(gender);
    }

    if (blood_group && blood_group !== 'All') {
      query += ' AND blood_group = ?';
      params.push(blood_group);
    }

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (sort === 'newest') {
      query += ' ORDER BY created_at DESC';
    } else if (sort === 'oldest') {
      query += ' ORDER BY created_at ASC';
    } else if (sort === 'name_asc') {
      query += ' ORDER BY full_name ASC';
    } else if (sort === 'name_desc') {
      query += ' ORDER BY full_name DESC';
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const patients = db.prepare(query).all(...params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM patients WHERE 1=1';
    const countParams = [];
    if (search) {
      const term = `%${search.trim()}%`;
      countQuery += ' AND (full_name LIKE ? OR patient_id LIKE ? OR phone LIKE ? OR email LIKE ?)';
      countParams.push(term, term, term, term);
    }
    if (gender && gender !== 'All') {
      countQuery += ' AND gender = ?';
      countParams.push(gender);
    }
    if (blood_group && blood_group !== 'All') {
      countQuery += ' AND blood_group = ?';
      countParams.push(blood_group);
    }
    if (status && status !== 'All') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const total = db.prepare(countQuery).get(...countParams).total;

    res.json({
      patients,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Internal server error while retrieving patients.' });
  }
});

// GET /api/patients/quick-search - Global search endpoint
router.get('/quick-search', authenticateToken, (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 1) {
      return res.json([]);
    }
    const term = `%${query.trim()}%`;
    const results = db.prepare(`
      SELECT id, patient_id, full_name, age, gender, phone, email, blood_group
      FROM patients
      WHERE full_name LIKE ? OR patient_id LIKE ? OR phone LIKE ?
      ORDER BY full_name ASC LIMIT 10
    `).all(term, term, term);

    res.json(results);
  } catch (error) {
    console.error('Quick search error:', error);
    res.status(500).json({ message: 'Error performing search.' });
  }
});

// GET /api/patients/:id - Complete patient profile overview
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const patientId = req.params.id;

    // Check if patient exists by numeric ID or string patient_id
    let patient = db.prepare('SELECT * FROM patients WHERE id = ? OR patient_id = ?').get(patientId, patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient record not found.' });
    }

    // Role-based security check: Patients can only view their own record
    if (req.user.role === 'patient') {
      const selfPatient = db.prepare('SELECT id FROM patients WHERE user_id = ? OR email = ?').get(req.user.id, req.user.email);
      if (!selfPatient || selfPatient.id !== patient.id) {
        return res.status(403).json({ message: 'Unauthorized. You can only view your own medical record.' });
      }
    }

    const allergies = db.prepare('SELECT * FROM allergies WHERE patient_id = ? ORDER BY severity DESC').all(patient.id);
    const medicalHistory = db.prepare('SELECT * FROM medical_history WHERE patient_id = ? ORDER BY created_at DESC').all(patient.id);
    const caseHistories = db.prepare(`
      SELECT ch.*, u.name as doctor_name
      FROM case_histories ch
      LEFT JOIN users u ON ch.doctor_id = u.id
      WHERE ch.patient_id = ?
      ORDER BY ch.consultation_date DESC
    `).all(patient.id);
    
    const consultations = db.prepare(`
      SELECT c.*, u.name as doctor_name, u.specialization
      FROM consultations c
      LEFT JOIN users u ON c.doctor_id = u.id
      WHERE c.patient_id = ?
      ORDER BY c.consultation_date DESC
    `).all(patient.id);

    const medications = db.prepare(`
      SELECT m.*, u.name as doctor_name
      FROM medications m
      LEFT JOIN users u ON m.doctor_id = u.id
      WHERE m.patient_id = ?
      ORDER BY m.start_date DESC
    `).all(patient.id);

    const followUps = db.prepare(`
      SELECT f.*, u.name as doctor_name
      FROM follow_ups f
      LEFT JOIN users u ON f.doctor_id = u.id
      WHERE f.patient_id = ?
      ORDER BY f.follow_up_date ASC
    `).all(patient.id);

    res.json({
      patient,
      allergies,
      medicalHistory,
      caseHistories,
      consultations,
      medications,
      followUps
    });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({ message: 'Error retrieving patient details.' });
  }
});

// POST /api/patients - Register new patient
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const {
      full_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      emergency_contact,
      blood_group,
      known_allergies,
      existing_conditions,
      current_medications
    } = req.body;

    if (!full_name || !date_of_birth || !gender || !phone) {
      return res.status(400).json({ message: 'Full name, Date of Birth, Gender, and Phone are required.' });
    }

    const calculatedAge = calculateAge(date_of_birth);
    const patientCode = generatePatientId();

    const insertStmt = db.prepare(`
      INSERT INTO patients (
        patient_id, full_name, date_of_birth, age, gender, phone, email, address, emergency_contact, blood_group, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    `);

    const result = insertStmt.run(
      patientCode,
      full_name.trim(),
      date_of_birth,
      calculatedAge,
      gender,
      phone.trim(),
      email ? email.trim() : null,
      address ? address.trim() : null,
      emergency_contact ? emergency_contact.trim() : null,
      blood_group || 'Unknown'
    );

    const newPatientId = result.lastInsertRowid;

    // Optional initial allergies record
    if (known_allergies && known_allergies.trim()) {
      db.prepare(`
        INSERT INTO allergies (patient_id, allergy_name, allergy_type, reaction, severity, notes)
        VALUES (?, ?, 'General', ?, 'Moderate', 'Recorded during registration')
      `).run(newPatientId, known_allergies.trim(), 'General allergic reaction');
    }

    // Optional initial medical condition
    if (existing_conditions && existing_conditions.trim()) {
      db.prepare(`
        INSERT INTO medical_history (patient_id, condition, diagnosed_date, status, notes)
        VALUES (?, ?, ?, 'Active', 'Recorded during registration')
      `).run(newPatientId, existing_conditions.trim(), new Date().toISOString().split('T')[0]);
    }

    // Optional initial medications
    if (current_medications && current_medications.trim()) {
      db.prepare(`
        INSERT INTO medications (patient_id, medicine_name, dosage, frequency, duration, start_date, status, instructions)
        VALUES (?, ?, 'As prescribed', 'Daily', 'Ongoing', ?, 'Active', 'Recorded during registration')
      `).run(newPatientId, current_medications.trim(), new Date().toISOString().split('T')[0]);
    }

    const createdPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(newPatientId);

    res.status(201).json({
      message: 'Patient registered successfully.',
      patient: createdPatient
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ message: 'Failed to register patient.' });
  }
});

// PUT /api/patients/:id - Edit patient details
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor']), (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      emergency_contact,
      blood_group,
      status
    } = req.body;

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const calculatedAge = date_of_birth ? calculateAge(date_of_birth) : patient.age;

    db.prepare(`
      UPDATE patients SET
        full_name = ?,
        date_of_birth = ?,
        age = ?,
        gender = ?,
        phone = ?,
        email = ?,
        address = ?,
        emergency_contact = ?,
        blood_group = ?,
        status = ?
      WHERE id = ?
    `).run(
      full_name || patient.full_name,
      date_of_birth || patient.date_of_birth,
      calculatedAge,
      gender || patient.gender,
      phone || patient.phone,
      email !== undefined ? email : patient.email,
      address !== undefined ? address : patient.address,
      emergency_contact !== undefined ? emergency_contact : patient.emergency_contact,
      blood_group || patient.blood_group,
      status || patient.status,
      id
    );

    const updatedPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    res.json({ message: 'Patient profile updated successfully.', patient: updatedPatient });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Failed to update patient profile.' });
  }
});

// DELETE /api/patients/:id - Delete patient record
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    db.prepare('DELETE FROM patients WHERE id = ?').run(id);
    res.json({ message: `Patient ${patient.full_name} (${patient.patient_id}) deleted successfully.` });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Failed to delete patient record.' });
  }
});

module.exports = router;
