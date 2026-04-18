import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 5,              // max 5 connections (free tier limit)
  min: 1,              // keep 1 connection alive
  idleTimeoutMillis: 30000,    // close idle after 30s
  connectionTimeoutMillis: 10000,  // timeout after 10s
  allowExitOnIdle: false
})

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('Database pool error:', err)
})

export default pool;
