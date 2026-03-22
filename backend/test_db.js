require('dotenv').config();
try {
    const prisma = require('./config/db');
    console.log('Prisma initialized successfully');
    process.exit(0);
} catch (err) {
    console.error('Initialization failed:', err);
    process.exit(1);
}
