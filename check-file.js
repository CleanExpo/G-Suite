import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const urls = [
  'https://suitepilot-88265946823.australia-southeast1.run.app/google32fbf8aabf7d6302.html',
  'https://g-pilot.app/google32fbf8aabf7d6302.html',
];

async function check() {
  for (const url of urls) {
    try {
      console.log(`Checking ${url}...`);
      const res = await fetch(url, { agent });
      console.log(`Status: ${res.status} ${res.statusText}`);
      if (res.status === 200) {
        const text = await res.text();
        // Check if it's the actual file content and not a fallback HTML page
        if (text.includes('google-site-verification: google32fbf8aabf7d6302.html')) {
          console.log('✅ SUCCESS: File content verified.');
        } else {
          console.log('❌ FAILURE: Received 200 OK but content does not match.');
          console.log('Preview:', text.substring(0, 100));
        }
      }
    } catch (err) {
      console.error(`❌ ERROR: ${err.message}`);
    }
    console.log('---');
  }
}

check();
