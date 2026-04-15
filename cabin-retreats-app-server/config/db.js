const { Pool, Connection } = require('pg')
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING     
});


pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;