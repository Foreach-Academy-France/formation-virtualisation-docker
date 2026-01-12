const { Pool } = require('pg');

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://dbuser:dbpass@localhost:5432/usersdb',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Tester la connexion
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialiser le schéma de base
async function initDatabase() {
  const client = await pool.connect();
  try {
    // Créer la table users si elle n'existe pas
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        age INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database schema initialized');

    // Vérifier si la table est vide et insérer des données de démo
    const { rows } = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO users (name, email, age) VALUES
          ('Admin User', 'admin@example.com', 30),
          ('Demo User', 'demo@example.com', 25)
      `);
      console.log('✅ Demo data inserted');
    }
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Tester la connexion à la base
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { connected: true, timestamp: result.rows[0].now };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

module.exports = {
  pool,
  initDatabase,
  testConnection
};
