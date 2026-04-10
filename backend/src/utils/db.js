import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle client', err);
});

/**
 * Execute a query with optional parameters.
 * @param {string} text
 * @param {any[]} [params]
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Get a client from the pool for transactions.
 */
export const getClient = () => pool.connect();

export default pool;
