// ============================================
// SaiKet Systems Internship - Task 4
// REST API with Node.js + Express
// Built by: IYIZIRE Annick
// ============================================

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ── IN-MEMORY DATABASE (replace with PostgreSQL in Task 5) ──
let users = [
  { id: 1, name: "IYIZIRE Annick", email: "iyizireanique16@gmail.com", age: 20, createdAt: new Date().toISOString() },
  { id: 2, name: "Rwema Amiable",  email: "rwema@africlouds.rw",       age: 30, createdAt: new Date().toISOString() },
  { id: 3, name: "Alain Kajangwe", email: "alain@wiredin.rw",          age: 35, createdAt: new Date().toISOString() },
];
let nextId = 4;

// ── HELPER ──────────────────────────────────
const validateUser = (body) => {
  const errors = [];
  if (!body.name || body.name.trim().length < 2) errors.push("name must be at least 2 characters");
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push("valid email is required");
  if (!body.age || isNaN(body.age) || body.age < 1 || body.age > 120) errors.push("age must be between 1 and 120");
  return errors;
};

// ── ROUTES ──────────────────────────────────

// GET /api/users — Get all users
app.get('/api/users', (req, res) => {
  const { search, minAge, maxAge } = req.query;
  let result = [...users];
  if (search) result = result.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  if (minAge) result = result.filter(u => u.age >= parseInt(minAge));
  if (maxAge) result = result.filter(u => u.age <= parseInt(maxAge));
  res.json({ success: true, count: result.length, data: result });
});

// GET /api/users/:id — Get single user
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: `User with id ${req.params.id} not found` });
  res.json({ success: true, data: user });
});

// POST /api/users — Create user
app.post('/api/users', (req, res) => {
  const errors = validateUser(req.body);
  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  if (users.find(u => u.email === req.body.email)) return res.status(409).json({ success: false, message: "Email already exists" });
  const user = { id: nextId++, name: req.body.name.trim(), email: req.body.email.trim(), age: parseInt(req.body.age), createdAt: new Date().toISOString() };
  users.push(user);
  res.status(201).json({ success: true, message: "User created successfully", data: user });
});

// PUT /api/users/:id — Update user
app.put('/api/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: `User with id ${req.params.id} not found` });
  const errors = validateUser(req.body);
  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  const emailExists = users.find(u => u.email === req.body.email && u.id !== parseInt(req.params.id));
  if (emailExists) return res.status(409).json({ success: false, message: "Email already in use" });
  users[idx] = { ...users[idx], name: req.body.name.trim(), email: req.body.email.trim(), age: parseInt(req.body.age), updatedAt: new Date().toISOString() };
  res.json({ success: true, message: "User updated successfully", data: users[idx] });
});

// PATCH /api/users/:id — Partial update
app.patch('/api/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: `User with id ${req.params.id} not found` });
  users[idx] = { ...users[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, message: "User partially updated", data: users[idx] });
});

// DELETE /api/users/:id — Delete user
app.delete('/api/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: `User with id ${req.params.id} not found` });
  const deleted = users.splice(idx, 1)[0];
  res.json({ success: true, message: `User "${deleted.name}" deleted successfully` });
});

// GET /api/stats — Stats
app.get('/api/stats', (req, res) => {
  const avgAge = users.length ? Math.round(users.reduce((s,u) => s+u.age, 0)/users.length) : 0;
  res.json({ success: true, data: { totalUsers: users.length, averageAge: avgAge, youngest: users.reduce((a,b) => a.age<b.age?a:b, users[0] || {}), oldest: users.reduce((a,b) => a.age>b.age?a:b, users[0] || {}) } });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/api/users`);
  console.log(`\nEndpoints:`);
  console.log(`  GET    /api/users         - Get all users`);
  console.log(`  GET    /api/users/:id     - Get user by ID`);
  console.log(`  POST   /api/users         - Create user`);
  console.log(`  PUT    /api/users/:id     - Update user`);
  console.log(`  PATCH  /api/users/:id     - Partial update`);
  console.log(`  DELETE /api/users/:id     - Delete user`);
  console.log(`  GET    /api/stats         - Get statistics\n`);
});

module.exports = app;
