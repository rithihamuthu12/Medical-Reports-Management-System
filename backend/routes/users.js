const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/users - List users (Admin only or for select doctor dropdowns)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, name, email, role, phone, specialization, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY name ASC';
    const users = db.prepare(query).all(...params);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error retrieving users.' });
  }
});

// POST /api/users - Create new user (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { name, email, password, role, phone, specialization } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, specialization)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash,
      role,
      phone || null,
      specialization || null
    );

    const newUser = db.prepare('SELECT id, name, email, role, phone, specialization, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'User created successfully.', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user.' });
  }
});

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

module.exports = router;
