const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

let connectionString = process.env.DATABASE_URL || 'file:./dev.db';

// Ensure absolute path for Windows compatibility in LibSQL
if (connectionString.startsWith('file:')) {
  const relativePath = connectionString.replace('file:', '');
  const absolutePath = path.resolve(__dirname, '..', relativePath);
  // Forward slashes for URI compatibility
  const sanitizedPath = absolutePath.split(path.sep).join('/');
  connectionString = `file:${sanitizedPath}`;
}

// In Prisma 7, the adapter is instantiated directly with the config object
const adapter = new PrismaLibSql({
  url: connectionString,
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
