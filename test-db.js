const { Client } = require('pg');

async function testConnection(connectionString, label) {
    console.log(`--- Testing ${label} ---`);
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log(`✅ Success: ${label}`);
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Result:', res.rows[0]);
        await client.end();
        return true;
    } catch (err) {
        console.error(`❌ Failed: ${label}`);
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        return false;
    }
}

async function main() {
    const password = 'jgWIDHSZU59em4R1';
    const projectRef = 'birowapasetrpnmwezfy';

    // 1. Pooled IP (User: postgres.project-ref)
    await testConnection(
        `postgresql://postgres.${projectRef}:${password}@3.106.102.114:5432/postgres`,
        'Sydney Pooler IP (Port 5432)'
    );

    // 2. Pooled IP (User: postgres)
    await testConnection(
        `postgresql://postgres:${password}@3.106.102.114:5432/postgres`,
        'Sydney Pooler IP - Simple User (Port 5432)'
    );

    // 3. Pooled IP (Port 6543)
    await testConnection(
        `postgresql://postgres.${projectRef}:${password}@3.106.102.114:6543/postgres`,
        'Sydney Pooler IP (Port 6543)'
    );
}

main();
