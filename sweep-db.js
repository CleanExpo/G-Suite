const { execSync } = require('child_process');

const password = 'jgWIDHSZU59em4R1';
const projectRef = 'birowapasetrpnmwezfy';
const regions = [
  { name: 'Sydney (ap-se-2)', ip: '3.106.102.114' },
  { name: 'Singapore (ap-se-1)', ip: '54.255.219.82' },
  { name: 'Virginia (us-east-1)', ip: '44.216.29.125' },
  { name: 'California (us-west-1)', ip: '52.8.172.168' },
  { name: 'Frankfurt (eu-ce-1)', ip: '52.59.152.35' },
  { name: 'Oregon (us-west-2)', ip: '44.226.241.22' },
  { name: 'Ohio (us-east-2)', ip: '3.13.125.109' },
  { name: 'Ireland (eu-west-1)', ip: '52.19.141.206' },
  { name: 'Tokyo (ap-ne-1)', ip: '54.238.31.22' },
  { name: 'Sao Paulo (sa-east-1)', ip: '18.231.187.218' },
  { name: 'London (eu-west-2)', ip: '18.130.158.109' },
  { name: 'Mumbai (ap-south-1)', ip: '15.206.155.101' },
  { name: 'Canada (ca-central-1)', ip: '3.98.59.125' },
];

async function runSweep() {
  for (const region of regions) {
    console.log(`\n--- Testing ${region.name} ---`);
    const url = `postgresql://postgres.${projectRef}:${password}@${region.ip}:6543/postgres?pgbouncer=true&connect_timeout=3`;
    try {
      console.log(`Pinging: ${region.ip}...`);
      // Set env var for this specific call
      const output = execSync(
        'npx prisma db push --schema=prisma/schema.prisma --accept-data-loss --skip-generate',
        {
          stdio: 'pipe',
          env: { ...process.env, DATABASE_URL: url },
        },
      ).toString();
      console.log(output);
      console.log(`✅ SUCCESS! Found region: ${region.name}`);
      process.exit(0);
    } catch (err) {
      const msg =
        (err.stdout ? err.stdout.toString() : '') +
        (err.stderr ? err.stderr.toString() : err.message);
      if (msg.includes('Tenant or user not found')) {
        console.log('❌ Incorrect Region.');
      } else if (msg.includes("Can't reach database server")) {
        console.log('❌ Unreachable.');
      } else {
        console.log(`⚠️ Error: ${msg.substring(0, 150)}...`);
      }
    }
  }
  console.log('\n❌ Failed to find a working regional pooler.');
}

runSweep();
