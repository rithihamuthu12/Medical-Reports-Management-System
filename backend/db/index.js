const Database = require('better-sqlite3');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');

const isPostgres = !!process.env.DATABASE_URL;

let sqliteDb = null;
let pgPool = null;

if (isPostgres) {
  console.log('Using PostgreSQL Database (DATABASE_URL configured)');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  console.log('Using Local SQLite Database (embedded zero-config)');
  const dbPath = path.join(__dirname, 'database.sqlite');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('foreign_keys = ON');
}

// Convert ? to $1, $2 for PostgreSQL
function formatSql(sql) {
  if (!isPostgres) return sql;
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

// Dual-mode DB object supporting both SQLite and PostgreSQL
const db = {
  get: (sql, params = []) => {
    if (isPostgres) {
      return pgPool.query(formatSql(sql), params).then(res => res.rows[0] || null);
    }
    return sqliteDb.prepare(sql).get(...params);
  },
  all: (sql, params = []) => {
    if (isPostgres) {
      return pgPool.query(formatSql(sql), params).then(res => res.rows);
    }
    return sqliteDb.prepare(sql).all(...params);
  },
  run: (sql, params = []) => {
    if (isPostgres) {
      let pgSql = formatSql(sql);
      // Append RETURNING id for insert statements if not present
      if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
        pgSql += ' RETURNING id';
      }
      return pgPool.query(pgSql, params).then(res => ({
        lastInsertRowid: res.rows[0] ? res.rows[0].id : null,
        changes: res.rowCount
      }));
    }
    const info = sqliteDb.prepare(sql).run(...params);
    return {
      lastInsertRowid: info.lastInsertRowid,
      changes: info.changes
    };
  },
  prepare: (sql) => {
    if (!isPostgres) {
      return sqliteDb.prepare(sql);
    }
    return {
      get: (...params) => db.get(sql, params),
      all: (...params) => db.all(sql, params),
      run: (...params) => db.run(sql, params)
    };
  },
  exec: (sql) => {
    if (isPostgres) {
      return pgPool.query(sql);
    }
    return sqliteDb.exec(sql);
  }
};

function initDatabase() {
  if (isPostgres) {
    console.log('PostgreSQL mode active. Ensure database schema is migrated using database/schema.sql.');
    return;
  }

  console.log('Initializing SQLite Database schema...');

  // Create Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'doctor', 'patient')),
      phone TEXT,
      specialization TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Patients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      full_name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      emergency_contact TEXT,
      blood_group TEXT,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Case History table
  db.exec(`
    CREATE TABLE IF NOT EXISTS case_histories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      consultation_date TEXT NOT NULL,
      chief_complaint TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      duration TEXT,
      severity TEXT,
      previous_history TEXT,
      family_history TEXT,
      lifestyle TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Medical History table
  db.exec(`
    CREATE TABLE IF NOT EXISTS medical_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      condition TEXT NOT NULL,
      diagnosed_date TEXT,
      status TEXT DEFAULT 'Active',
      treatment TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Allergies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS allergies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      allergy_name TEXT NOT NULL,
      allergy_type TEXT,
      reaction TEXT NOT NULL,
      severity TEXT NOT NULL CHECK(severity IN ('High', 'Moderate', 'Low')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Medications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      medicine_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      duration TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      instructions TEXT,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Consultations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      consultation_date TEXT NOT NULL,
      chief_complaint TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      temperature TEXT,
      blood_pressure TEXT,
      heart_rate TEXT,
      spo2 TEXT,
      weight TEXT,
      clinical_notes TEXT,
      diagnosis_primary TEXT NOT NULL,
      diagnosis_additional TEXT,
      treatment_plan TEXT NOT NULL,
      doctor_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Follow-ups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      follow_up_date TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'Scheduled' CHECK(status IN ('Scheduled', 'Completed', 'Missed', 'Cancelled')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData();
}

function seedData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('Database already populated.');
    return;
  }

  console.log('Seeding initial demo data...');

  const adminPass = bcrypt.hashSync('admin123', 10);
  const doctorPass = bcrypt.hashSync('doctor123', 10);
  const patientPass = bcrypt.hashSync('patient123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, phone, specialization)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const adminResult = insertUser.run('System Administrator', 'admin@medrecord.com', adminPass, 'admin', '+1-555-0100', 'Hospital Administration');
  const drSmithResult = insertUser.run('Dr. Sarah Smith', 'dr.smith@medrecord.com', doctorPass, 'doctor', '+1-555-0101', 'Cardiology');
  const drJohnsonResult = insertUser.run('Dr. Robert Johnson', 'dr.johnson@medrecord.com', doctorPass, 'doctor', '+1-555-0102', 'Internal Medicine');
  const drChenResult = insertUser.run('Dr. Emily Chen', 'dr.chen@medrecord.com', doctorPass, 'doctor', '+1-555-0103', 'Pediatrics');

  const patient1User = insertUser.run('John Doe', 'john.doe@gmail.com', patientPass, 'patient', '+1-555-0199', null);
  const patient2User = insertUser.run('Jane Smith', 'jane.smith@gmail.com', patientPass, 'patient', '+1-555-0198', null);

  const insertPatient = db.prepare(`
    INSERT INTO patients (patient_id, user_id, full_name, date_of_birth, age, gender, phone, email, address, emergency_contact, blood_group, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const todayStr = new Date().toISOString().split('T')[0];

  const p1 = insertPatient.run('PAT-2026-001', patient1User.lastInsertRowid, 'John Doe', '1985-06-15', 41, 'Male', '+1-555-0199', 'john.doe@gmail.com', '742 Evergreen Terrace, Springfield', 'Mary Doe (Wife) - +1-555-0190', 'O+', 'Active');
  const p2 = insertPatient.run('PAT-2026-002', patient2User.lastInsertRowid, 'Jane Smith', '1992-11-20', 33, 'Female', '+1-555-0198', 'jane.smith@gmail.com', '123 Main Street, Apt 4B, New York', 'David Smith (Brother) - +1-555-0191', 'A+', 'Active');
  const p3 = insertPatient.run('PAT-2026-003', null, 'Michael Brown', '1970-03-10', 56, 'Male', '+1-555-0188', 'mbrown@example.com', '456 Oak Avenue, Chicago', 'Sarah Brown (Daughter) - +1-555-0192', 'B+', 'Active');
  const p4 = insertPatient.run('PAT-2026-004', null, 'Emma Davis', '1998-08-05', 28, 'Female', '+1-555-0177', 'edavis@example.com', '789 Pine Road, Seattle', 'Tom Davis (Father) - +1-555-0193', 'AB-', 'Active');
  const p5 = insertPatient.run('PAT-2026-005', null, 'David Wilson', '1962-01-25', 64, 'Male', '+1-555-0166', 'dwilson@example.com', '321 Maple Lane, Houston', 'Linda Wilson (Wife) - +1-555-0194', 'O-', 'Active');
  const p6 = insertPatient.run('PAT-2026-006', null, 'Sophia Martinez', '2005-04-12', 21, 'Female', '+1-555-0155', 'smartinez@example.com', '654 Elm Street, Miami', 'Carlos Martinez (Father) - +1-555-0195', 'A-', 'Active');

  const insertAllergy = db.prepare(`
    INSERT INTO allergies (patient_id, allergy_name, allergy_type, reaction, severity, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertAllergy.run(p1.lastInsertRowid, 'Penicillin', 'Drug', 'Skin rash, Hives, Facial swelling', 'High', 'Strictly avoid all Beta-Lactam antibiotics');
  insertAllergy.run(p1.lastInsertRowid, 'Peanuts', 'Food', 'Anaphylaxis, Respiratory Distress', 'High', 'Carries EpiPen');
  insertAllergy.run(p2.lastInsertRowid, 'Latex', 'Environmental', 'Contact dermatitis, redness', 'Moderate', 'Use latex-free gloves during examination');
  insertAllergy.run(p3.lastInsertRowid, 'Aspirin / NSAIDs', 'Drug', 'Gastric upset, wheezing', 'High', 'Alternative analgesics required (Paracetamol)');
  insertAllergy.run(p5.lastInsertRowid, 'Sulfa Drugs', 'Drug', 'Severe skin rash', 'Moderate', 'Avoid Trimethoprim-Sulfamethoxazole');

  const insertMedHistory = db.prepare(`
    INSERT INTO medical_history (patient_id, condition, diagnosed_date, status, treatment, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertMedHistory.run(p1.lastInsertRowid, 'Essential Hypertension', '2020-03-15', 'Active', 'Antihypertensive therapy (Amlodipine 5mg)', 'BP monitored weekly');
  insertMedHistory.run(p1.lastInsertRowid, 'Type 2 Diabetes Mellitus', '2022-09-10', 'Active', 'Diet control & Metformin 500mg BID', 'HbA1c last recorded 6.8%');
  insertMedHistory.run(p2.lastInsertRowid, 'Bronchial Asthma', '2015-05-20', 'Chronic', 'Salbutamol inhaler PRN', 'Triggers include cold air and pollen');
  insertMedHistory.run(p3.lastInsertRowid, 'Coronary Artery Disease', '2019-11-04', 'Active', 'Stent placed in LAD, Aspirin alternative', 'Regular cardiac checkup');
  insertMedHistory.run(p5.lastInsertRowid, 'Osteoarthritis - Right Knee', '2021-02-14', 'Active', 'Physiotherapy & Intra-articular injections', 'Surgical consult considered');

  const insertCaseHistory = db.prepare(`
    INSERT INTO case_histories (patient_id, doctor_id, consultation_date, chief_complaint, symptoms, duration, severity, previous_history, family_history, lifestyle, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCaseHistory.run(
    p1.lastInsertRowid,
    drSmithResult.lastInsertRowid,
    '2026-09-20',
    'Frequent headache and fatigue in the mornings',
    'Dizziness, blurred vision intermittently, mild chest tightness',
    '3 Weeks',
    'Moderate',
    'Known Hypertension for 6 years, Type 2 Diabetes for 4 years',
    'Father had MI at age 55; Mother has Hypertension',
    'Sedentary lifestyle, high sodium intake, non-smoker',
    'Patient requested routine cardiovascular review.'
  );

  insertCaseHistory.run(
    p2.lastInsertRowid,
    drJohnsonResult.lastInsertRowid,
    '2026-09-22',
    'Shortness of breath and persistent night cough',
    'Wheezing, chest tightness after moderate exercise',
    '10 Days',
    'Moderate',
    'Asthma since childhood; appendectomy in 2018',
    'Mother has Asthma and Seasonal Allergies',
    'Moderate activity, nonsmoker, home with indoor pets',
    'Exacerbation following recent viral upper respiratory tract infection.'
  );

  const insertConsultation = db.prepare(`
    INSERT INTO consultations (patient_id, doctor_id, consultation_date, chief_complaint, symptoms, temperature, blood_pressure, heart_rate, spo2, weight, clinical_notes, diagnosis_primary, diagnosis_additional, treatment_plan, doctor_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertConsultation.run(
    p1.lastInsertRowid,
    drSmithResult.lastInsertRowid,
    '2026-09-20',
    'Morning headaches & fatigue',
    'Elevated blood pressure, dizziness',
    '98.6 °F',
    '145/92 mmHg',
    '78 bpm',
    '98%',
    '82 kg',
    'Patient presents with uncontrolled stage 1 hypertension. S1/S2 heard, no murmurs.',
    'Stage 1 Essential Hypertension (Uncontrolled)',
    'Type 2 Diabetes Mellitus',
    '1. Increase Amlodipine to 10mg daily.\n2. Low sodium diet (<2g/day).\n3. Daily 30 mins moderate walk.\n4. Re-check BP in 2 weeks.',
    'Advised home blood pressure log chart.'
  );

  insertConsultation.run(
    p2.lastInsertRowid,
    drJohnsonResult.lastInsertRowid,
    '2026-09-22',
    'Shortness of breath and wheezing',
    'Bilateral polyphonic expiratory wheeze on auscultation',
    '99.1 °F',
    '120/78 mmHg',
    '84 bpm',
    '96%',
    '61 kg',
    'Acute moderate asthma exacerbation. Clear chest sounds except mild wheezing.',
    'Acute Asthma Exacerbation',
    'Allergic Rhinitis',
    '1. Fluticasone/Salmeterol 250/50 mcg inhaler 1 puff BID.\n2. Albuterol inhaler 2 puffs q4-6h PRN.\n3. 5-day course of Oral Prednisolone 20mg daily.',
    'Review inhalation technique with patient.'
  );

  insertConsultation.run(
    p3.lastInsertRowid,
    drSmithResult.lastInsertRowid,
    '2026-09-25',
    'Routine Cardiac Follow-up & Chest Discomfort',
    'Occasional exertional angina, fatigue',
    '98.4 °F',
    '130/82 mmHg',
    '72 bpm',
    '99%',
    '76 kg',
    'ECG shows sinus rhythm with old inferior wall changes. Echo EF 55%.',
    'Stable Ischemic Heart Disease',
    'Hyperlipidemia',
    '1. Continue Clopidogrel 75mg daily.\n2. Atorvastatin 40mg at bedtime.\n3. Isosorbide Mononitrate 30mg QD.',
    'Schedule stress thallium test if symptoms worsen.'
  );

  const insertMedication = db.prepare(`
    INSERT INTO medications (patient_id, doctor_id, medicine_name, dosage, frequency, duration, start_date, end_date, instructions, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMedication.run(p1.lastInsertRowid, drSmithResult.lastInsertRowid, 'Amlodipine Besylate', '10 mg', 'Once daily (Morning)', '30 Days', '2026-09-20', '2026-10-20', 'Take after breakfast with water', 'Active');
  insertMedication.run(p1.lastInsertRowid, drJohnsonResult.lastInsertRowid, 'Metformin HCl', '500 mg', 'Twice daily (Meal times)', '90 Days', '2026-08-01', '2026-11-01', 'Take with meals to reduce stomach upset', 'Active');
  insertMedication.run(p2.lastInsertRowid, drJohnsonResult.lastInsertRowid, 'Seretide Accuhaler', '250/50 mcg', 'Twice daily', '60 Days', '2026-09-22', '2026-11-22', 'Rinse mouth thoroughly with water after use', 'Active');
  insertMedication.run(p2.lastInsertRowid, drJohnsonResult.lastInsertRowid, 'Prednisolone', '20 mg', 'Once daily', '5 Days', '2026-09-22', '2026-09-27', 'Take in morning with food', 'Completed');
  insertMedication.run(p3.lastInsertRowid, drSmithResult.lastInsertRowid, 'Atorvastatin Calcium', '40 mg', 'Once daily at bedtime', '90 Days', '2026-09-25', '2026-12-25', 'Take before sleeping', 'Active');

  const insertFollowUp = db.prepare(`
    INSERT INTO follow_ups (patient_id, doctor_id, follow_up_date, reason, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  insertFollowUp.run(p1.lastInsertRowid, drSmithResult.lastInsertRowid, tomorrowStr, 'Blood Pressure Re-evaluation & Dosage Check', 'Scheduled', 'Patient to bring 7-day BP log sheet.');
  insertFollowUp.run(p2.lastInsertRowid, drJohnsonResult.lastInsertRowid, nextWeekStr, 'Post-Asthma Exacerbation Spirometry & Symptom Review', 'Scheduled', 'Check lung sounds and peak flow reading.');
  insertFollowUp.run(p3.lastInsertRowid, drSmithResult.lastInsertRowid, '2026-10-15', 'Lipid Panel & Cardiac Consultation', 'Scheduled', 'Fasting lipid profile required prior to visit.');
  insertFollowUp.run(p4.lastInsertRowid, drChenResult.lastInsertRowid, todayStr, 'Pediatric Allergy & Immunization Check', 'Scheduled', 'Routine checkup.');
  insertFollowUp.run(p5.lastInsertRowid, drJohnsonResult.lastInsertRowid, '2026-09-15', 'Knee Joint Pain Progress Assessment', 'Completed', 'Injections well tolerated. Patient reported 50% pain reduction.');

  console.log('Demo data successfully seeded!');
}

module.exports = {
  db,
  initDatabase
};
