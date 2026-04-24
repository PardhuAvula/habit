require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

async function test() {
    const connectionString = "libsql://habit-tracker-db-pardhu.aws-ap-south-1.turso.io";
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzcwMzQyNDYsImlkIjoiMDE5ZGJmN2QtYjUwMS03NzBjLTkzZGItY2Y2MGYzNzNiZGRlIiwicmlkIjoiZGI3ZDMzMWYtOWY5NC00ZTYzLWE3MmEtOWRjNmJjM2UyMWMzIn0.9nQtgN05DESEQzaOAAtqAfbuPneOuMRcllBi0cS20xaLoWrRSBMM4wz3GtwgojBLEJVlPJFcfqotK1T4iTDLDg";

    console.log("Connecting to:", connectionString);
    const client = createClient({
        url: connectionString,
        authToken: authToken,
    });

    const adapter = new PrismaLibSql(client);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log("Querying users...");
        const users = await prisma.user.findMany();
        console.log("Users:", users);
        console.log("Success!");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
