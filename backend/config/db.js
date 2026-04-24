const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const path = require('path');

// Support Turso for persistent cloud storage
let connectionString = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

// Ensure absolute path for Windows compatibility if using local file
if (connectionString.startsWith('file:') && !connectionString.includes(':') || connectionString.startsWith('file:./')) {
  const relativePath = connectionString.replace('file:', '');
  const absolutePath = path.resolve(__dirname, '..', relativePath);
  // Forward slashes for URI compatibility
  const sanitizedPath = absolutePath.split(path.sep).join('/');
  connectionString = `file:${sanitizedPath}`;
}

// Initialize LibSQL client
console.log('Connecting to LibSQL with URL:', connectionString);
const client = createClient({
  url: connectionString,
  authToken: authToken,
});

// Initialize Prisma with the adapter
console.log('Initializing Prisma Client with adapter...');
const adapter = new PrismaLibSql(client);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
