/**
 * PostgreSQL connection pool
 * 
 * Singleton pool instance for database connections.
 * Configured via environment variables.
 */

import { Pool } from 'pg';
import { logger } from '../utils/logger';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'neurowealth',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection available
});

// Log pool errors
pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
});

// Test connection on module load
pool.query('SELECT NOW()')
  .then(() => {
    logger.info('PostgreSQL connection pool initialized successfully');
  })
  .catch((err) => {
    logger.error({ err }, 'Failed to initialize PostgreSQL connection pool');
  });

export default pool;
