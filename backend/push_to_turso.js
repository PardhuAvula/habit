const fs = require('fs');
const { createClient } = require('@libsql/client');

async function main() {
    const rawSql = fs.readFileSync('setup.sql', 'utf16le');
    // Remove comments
    let sql = rawSql.replace(/--.*$/gm, '');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    // The provided connection info
    const url = "libsql://habit-tracker-db-pardhu.aws-ap-south-1.turso.io";
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzcwMzQyNDYsImlkIjoiMDE5ZGJmN2QtYjUwMS03NzBjLTkzZGItY2Y2MGYzNzNiZGRlIiwicmlkIjoiZGI3ZDMzMWYtOWY5NC00ZTYzLWE3MmEtOWRjNmJjM2UyMWMzIn0.9nQtgN05DESEQzaOAAtqAfbuPneOuMRcllBi0cS20xaLoWrRSBMM4wz3GtwgojBLEJVlPJFcfqotK1T4iTDLDg";
    
    const client = createClient({ url, authToken });
    
    console.log(`Pushing ${statements.length} schema statements to Turso...`);
    
    for (const stmt of statements) {
        try {
            await client.execute(stmt);
        } catch (e) {
            // Ignore "already exists" errors if we've partially applied
            if (e.message && e.message.includes("already exists")) {
                 console.log("Skipping (already exists)");
            } else {
                 console.error("Error pushing schema statement:", stmt);
                 console.error(e);
            }
        }
    }
    console.log("Finished pushing schema!");
}

main();
