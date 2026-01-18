const net = require('net');

const targets = [
    { host: '3.106.102.114', port: 6543, label: 'Sydney Pooler 1 (6543)' },
    { host: '13.237.241.81', port: 6543, label: 'Sydney Pooler 2 (6543)' },
    { host: '13.238.183.126', port: 6543, label: 'Sydney Pooler 3 (6543)' },
    { host: '3.106.102.114', port: 5432, label: 'Sydney Pooler 1 (5432)' }
];

async function checkTarget(target) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(3000);
        console.log(`Checking ${target.label}...`);

        socket.on('connect', () => {
            console.log(`✅ ${target.label} is REACHABLE`);
            socket.destroy();
            resolve(true);
        });

        socket.on('error', (err) => {
            console.log(`❌ ${target.label} error: ${err.message}`);
            resolve(false);
        });

        socket.on('timeout', () => {
            console.log(`❌ ${target.label} TIMEOUT`);
            socket.destroy();
            resolve(false);
        });

        socket.connect(target.port, target.host);
    });
}

async function main() {
    for (const target of targets) {
        await checkTarget(target);
    }
}

main();
