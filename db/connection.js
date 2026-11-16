// Shared connection pool for the Neon Postgres database.
// DATABASE_URL comes from .env (copy it from the Neon dashboard).
require('dotenv').config({ quiet: true });
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to your .env file.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
