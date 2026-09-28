const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./db');

const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const patientRoutes = require('./routes/patients');
const caseHistoryRoutes = require('./routes/caseHistory');
const medicalHistoryRoutes = require('./routes/medicalHistory');
const allergyRoutes = require('./routes/allergies');
const medicationRoutes = require('./routes/medications');
const consultationRoutes = require('./routes/consultations');
const followUpRoutes = require('./routes/followUps');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database schema and seed data
initDatabase();

// Configurable CORS handling for production security
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Request origin blocked by server rules.'));
  },
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/case-history', caseHistoryRoutes);
app.use('/api/medical-history', medicalHistoryRoutes);
app.use('/api/allergies', allergyRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/users', userRoutes);

// Root health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Patient Case-Taking and Medical Record Management System',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export Express app for Vercel Serverless Functions if deployed on Vercel
module.exports = app;

if (process.env.NODE_ENV !== 'test' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`Healthcare Server running on http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}
