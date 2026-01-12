const express = require('express');
const { pool, initDatabase, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(express.json());

// ROUTES

// Health check avec status DB
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();

  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus.connected ? 'connected' : 'disconnected',
    dbTimestamp: dbStatus.timestamp,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  });
});

// GET /users - Liste tous les utilisateurs
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, age, created_at FROM users ORDER BY id'
    );

    res.json({
      count: result.rows.length,
      users: result.rows
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// GET /users/:id - Récupère un utilisateur
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, age, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// POST /users - Crée un utilisateur
app.post('/users', async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    if (age && (age < 0 || age > 150)) {
      return res.status(400).json({ error: 'Age must be between 0 and 150' });
    }

    const result = await pool.query(
      'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *',
      [name, email, age || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);

    // Email unique constraint violation
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// PUT /users/:id - Met à jour un utilisateur
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    // Vérifier que l'utilisateur existe
    const checkResult = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }

    if (age !== undefined) {
      if (age < 0 || age > 150) {
        return res.status(400).json({ error: 'Age must be between 0 and 150' });
      }
      updates.push(`age = $${paramCount++}`);
      values.push(age);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);

    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// DELETE /users/:id - Supprime un utilisateur
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'Users API 👥',
    version: '1.0.0',
    database: 'PostgreSQL',
    endpoints: {
      health: 'GET /health',
      listUsers: 'GET /users',
      getUser: 'GET /users/:id',
      createUser: 'POST /users',
      updateUser: 'PUT /users/:id',
      deleteUser: 'DELETE /users/:id'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Initialisation et démarrage
async function start() {
  try {
    console.log('🔄 Initializing database...');
    await initDatabase();

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Users API running on http://${HOST}:${PORT}`);
      console.log(`   - Health check: http://${HOST}:${PORT}/health`);
      console.log(`   - Users: http://${HOST}:${PORT}/users`);
      console.log(`   - Database: PostgreSQL`);
      console.log(`   - Node version: ${process.version}`);
      console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

// Démarrer le serveur
start();
