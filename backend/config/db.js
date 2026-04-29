const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL: PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const path = require('path');

// Support Turso for persistent cloud storage
let connectionString = process.env.TURSO_DATABASE_URL;
let authToken = process.env.TURSO_AUTH_TOKEN;

if (!connectionString) {
  if (process.env.NODE_ENV === 'development') {
    connectionString = process.env.DATABASE_URL || 'file:./dev.db';
  } else {
    // Force Turso cloud database in production if not explicitly provided
    connectionString = 'libsql://habit-tracker-db-pardhu.aws-ap-south-1.turso.io';
    authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzcwMzQyNDYsImlkIjoiMDE5ZGJmN2QtYjUwMS03NzBjLTkzZGItY2Y2MGYzNzNiZGRlIiwicmlkIjoiZGI3ZDMzMWYtOWY5NC00ZTYzLWE3MmEtOWRjNmJjM2UyMWMzIn0.9nQtgN05DESEQzaOAAtqAfbuPneOuMRcllBi0cS20xaLoWrRSBMM4wz3GtwgojBLEJVlPJFcfqotK1T4iTDLDg';
  }
}

// Ensure Prisma doesn't crash on initialization if DATABASE_URL is missing locally
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:../dev.db';
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
