const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://bloguser:blogpass@db:5432/blogdb'
});

// Redis
let redisClient;
(async () => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  redisClient.on('connect', () => console.log('✅ Connected to Redis'));

  await redisClient.connect();
})();

// Initialize database
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) DEFAULT 'Anonymous',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Database initialized');

    // Insert demo data if empty
    const { rows } = await pool.query('SELECT COUNT(*) FROM articles');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO articles (title, content, author) VALUES
          ('Bienvenue sur le Blog', 'Premier article de démonstration avec Docker Compose', 'Admin'),
          ('Docker Compose c''est génial', 'Orchestrer plusieurs services en un seul fichier YAML', 'DevOps Team')
      `);
      console.log('✅ Demo articles inserted');
    }
  } catch (err) {
    console.error('❌ Database init error:', err.message);
    process.exit(1);
  }
}

// ROUTES

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW()');
    const redisCheck = await redisClient.ping();

    res.json({
      status: 'healthy',
      database: 'connected',
      redis: redisCheck === 'PONG' ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message
    });
  }
});

// GET /articles - Liste avec cache
app.get('/articles', async (req, res) => {
  try {
    // Check cache first
    const cached = await redisClient.get('articles:all');
    if (cached) {
      console.log('📦 Cache hit');
      return res.json({
        source: 'cache',
        articles: JSON.parse(cached)
      });
    }

    // Query database
    console.log('🔍 Cache miss - querying database');
    const result = await pool.query(
      'SELECT * FROM articles ORDER BY created_at DESC'
    );

    // Store in cache (60s TTL)
    await redisClient.setEx('articles:all', 60, JSON.stringify(result.rows));

    res.json({
      source: 'database',
      articles: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /articles/:id
app.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM articles WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /articles
app.post('/articles', async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const result = await pool.query(
      'INSERT INTO articles (title, content, author) VALUES ($1, $2, $3) RETURNING *',
      [title, content, author || 'Anonymous']
    );

    // Invalidate cache
    await redisClient.del('articles:all');

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /articles/:id
app.delete('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM articles WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Invalidate cache
    await redisClient.del('articles:all');

    res.json({ message: 'Article deleted', article: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
async function start() {
  await initDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Blog API running on port ${PORT}`);
    console.log(`   - Health: http://localhost:${PORT}/health`);
    console.log(`   - Articles: http://localhost:${PORT}/articles`);
  });
}

start();
