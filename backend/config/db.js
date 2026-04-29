const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL: PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const path = require('path');

// Support Turso for persistent cloud storage
let connectionString = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

// Ensure Prisma doesn't crash on initialization if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

if (connectionString.startsWith('file:')) {
  // Extract the path after 'file:'
  let dbPath = connectionString.replace('file:', '');
  
  // In Prisma, file paths are relative to the prisma/ directory.
  // Our prisma directory is backend/prisma/
  const prismaDir = path.resolve(__dirname, '../prisma');
  dbPath = path.resolve(prismaDir, dbPath);
  
  // Forward slashes for LibSQL URI compatibility
  const sanitizedPath = dbPath.split(path.sep).join('/');
  connectionString = `file:${sanitizedPath}`;
}

// Initialize LibSQL client
const client = createClient({
  url: connectionString,
  authToken: authToken,
});

// Initialize Prisma with the adapter
const adapter = new PrismaLibSql(client);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
