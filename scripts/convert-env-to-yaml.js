const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const yamlPath = path.join(__dirname, '../env.yaml');

const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

let yamlContent = '';

lines.forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const firstEqual = trimmed.indexOf('=');
    if (firstEqual > -1) {
      const key = trimmed.substring(0, firstEqual);
      let value = trimmed.substring(firstEqual + 1);

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.substring(1, value.length - 1);
      }

      // Basic escaping for YAML
      // If value contains special chars, quote it?
      // Simple approach: just key: "value"

      yamlContent += `${key}: "${value.replace(/"/g, '\\"')}"\n`;
    }
  }
});

fs.writeFileSync(yamlPath, yamlContent);
console.log('Converted .env to env.yaml');
