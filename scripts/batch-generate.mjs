#!/usr/bin/env node
// batch-generate.mjs — generate all platform formats for all sessions
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const FORMATS = {
  square: { label: '1:1 Square', w: 1080, h: 1080, short: 1080 },
  story:  { label: '9:16 Story', w: 1080, h: 1920, short: 1080 },
  wide:   { label: '16:9 Wide',  w: 1920, h: 1080, short: 1080 },
  pin:    { label: '2:3 Pin',    w: 1000, h: 1500, short: 1000 },
};

const sessionsDir = path.join(ROOT, 'sessions');
const outputDir = path.join(ROOT, 'output');

fs.readdirSync(sessionsDir).forEach(file => {
  if (!file.endsWith('.json')) return;

  console.log(`\\n🔷 Session: ${file}`);

  try {
    const result = require('child_process').execSync(
      `node ${path.join(ROOT, 'scripts', 'generate.mjs')} ${path.join(sessionsDir, file)}`,
      { cwd: ROOT, encoding: 'utf8' }
    );
    console.log(result.trim());
  } catch (e) {
    console.error(`  ❌ Failed: ${e.message}`);
  }
});

console.log('\\n✅ Batch complete. Check output/ directory.');
