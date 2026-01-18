import fetch from 'node-fetch';

const url = 'https://suitepilot-88265946823.australia-southeast1.run.app'; // Live Cloud Run URL
const verificationCode = 'qT9cqRLF13aUxXjfp_YzMPZFUibKtynaUXOnyKm5mkY';

async function check() {
  console.log(`Checking ${url}...`);
  try {
    const res = await fetch(url);
    const text = await res.text();

    if (text.includes(verificationCode)) {
      console.log('✅ SUCCESS: Verification tag FOUND in HTML.');
      console.log('Snippet:');
      const start = text.indexOf(verificationCode) - 50;
      const end = text.indexOf(verificationCode) + 50;
      console.log(text.substring(start, end));
    } else {
      console.log('❌ FAILURE: Verification tag NOT found.');
      console.log('Partial content preview:');
      console.log(text.substring(0, 500));
    }
  } catch (e) {
    console.error('Error fetching URL:', e);
  }
}

check();
