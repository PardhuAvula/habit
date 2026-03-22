const { createClient } = require('@libsql/client');
try {
    const client = createClient({ url: 'file:./dev.db' });
    console.log('Client created with file:./dev.db');
    client.execute('SELECT 1').then(r => console.log('Query success')).catch(e => console.error('Query failed:', e));
} catch (e) {
    console.error('Creation failed:', e);
}
