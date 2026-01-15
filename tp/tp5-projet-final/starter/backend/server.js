const express = require('express');
const { Pool } = require('pg');
const { createClient } = require('redis');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://ecommerce:ecommerce@localhost:5432/ecommerce'
});

// Redis connection
let redisClient;
const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection failed:', error.message);
    // Continue without Redis (cache disabled)
  }
};

// Initialize database
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
};

// Cache helper functions
const getCache = async (key) => {
  if (!redisClient?.isReady) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error.message);
    return null;
  }
};

const setCache = async (key, value, ttl = 60) => {
  if (!redisClient?.isReady) return;
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error.message);
  }
};

const invalidateCache = async (pattern) => {
  if (!redisClient?.isReady) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error.message);
  }
};

// Routes

// Health check
app.get('/health', async (req, res) => {
  const checks = {
    server: 'ok',
    database: 'unknown',
    cache: 'unknown'
  };

  try {
    await pool.query('SELECT 1');
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
  }

  try {
    if (redisClient?.isReady) {
      await redisClient.ping();
      checks.cache = 'ok';
    } else {
      checks.cache = 'disconnected';
    }
  } catch (error) {
    checks.cache = 'error';
  }

  const isHealthy = checks.database === 'ok';
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  });
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    // Try cache first
    const cached = await getCache('products:all');
    if (cached) {
      console.log('Cache hit: products:all');
      return res.json(cached);
    }

    console.log('Cache miss: products:all');
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');

    // Cache for 60 seconds
    await setCache('products:all', result.rows, 60);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Try cache first
    const cached = await getCache(`products:${id}`);
    if (cached) {
      console.log(`Cache hit: products:${id}`);
      return res.json(cached);
    }

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Cache for 60 seconds
    await setCache(`products:${id}`, result.rows[0], 60);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *',
      [name, price]
    );

    // Invalidate cache
    await invalidateCache('products:*');

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  try {
    const result = await pool.query(
      'UPDATE products SET name = COALESCE($1, name), price = COALESCE($2, price) WHERE id = $3 RETURNING *',
      [name, price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Invalidate cache
    await invalidateCache('products:*');

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Invalidate cache
    await invalidateCache('products:*');

    res.json({ message: 'Product deleted', product: result.rows[0] });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_products,
        COALESCE(SUM(price), 0) as total_value,
        COALESCE(AVG(price), 0) as avg_price
      FROM products
    `);

    res.json({
      ...stats.rows[0],
      cache_status: redisClient?.isReady ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const start = async () => {
  try {
    await connectRedis();
    await initDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API: http://localhost:${PORT}/api/products`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
