const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let hash = 'unknown';
let shortHash = 'dev';
const now = new Date();
const date = now.toISOString().slice(0, 10);
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const time = `${hours}:${minutes}`;
const dateTime = `${date} ${time}`;

try {
  hash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch (e) {
  console.warn('Kunde inte hämta Git SHA:', e.message);
}

const versionData = {
  hash,
  shortHash,
  date,
  time,
  dateTime
};

const targetPathPublic = path.join(__dirname, '..', 'public', 'version.json');
const targetPathSrc = path.join(__dirname, '..', 'src', 'assets', 'version.json');

fs.mkdirSync(path.dirname(targetPathPublic), { recursive: true });
fs.writeFileSync(targetPathPublic, JSON.stringify(versionData, null, 2), 'utf8');

fs.mkdirSync(path.dirname(targetPathSrc), { recursive: true });
fs.writeFileSync(targetPathSrc, JSON.stringify(versionData, null, 2), 'utf8');

console.log(`Genererade version.json (SHA: ${shortHash}, Datum & Tid: ${dateTime})`);
