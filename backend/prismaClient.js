const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

// Properly handle Aiven's self-signed certificates with the Postgres Pool
const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
