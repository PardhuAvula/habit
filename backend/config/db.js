const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL: PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const path = require('path');

let connectionString = process.env.TURSO_DATABASE_URL;
let authToken = process.env.TURSO_AUTH_TOKEN;

if (!connectionString) {
  connectionString = process.env.DATABASE_URL || 'file:./dev.db';
}

if (connectionString.startsWith('libsql://') && !authToken) {
  throw new Error(
    'TURSO_AUTH_TOKEN is required when using TURSO_DATABASE_URL. Set both in your environment.'
  );
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = connectionString.startsWith('file:')
    ? connectionString
    : 'file:./dev.db';
}

if (connectionString.startsWith('file:')) {
  let dbPath = connectionString.replace('file:', '');
  const prismaDir = path.resolve(__dirname, '../prisma');
  dbPath = path.resolve(prismaDir, dbPath);
  const sanitizedPath = dbPath.split(path.sep).join('/');
  connectionString = `file:${sanitizedPath}`;
}

const client = createClient({
  url: connectionString,
  authToken: authToken,
});

const adapter = new PrismaLibSql(client);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
