import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Load session config
const configPath = process.argv[2] || path.join(ROOT, 'sessions', 'ipl-2026-rcb.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const colors = config.colors;
const event = config.event || 'untitled';
const rawVariant = config.template || 'radha';
const variant = rawVariant === 'radhe' ? 'radha' : rawVariant; // radha | krsna

// Load template
const templateFile = variant === 'krsna' ? 'sri-krsna.svg' : 'sri-radha.svg';
const template = fs.readFileSync(path.join(ROOT, 'templates', templateFile), 'utf8');

// Colorize template — replace {{placeholder}} with hex values
function colorize(tmpl, colors) {
  return tmpl
    .replace(/\{\{bgColor\}\}/g, colors.background)
    .replace(/\{\{circle1Color\}\}/g, colors.circle1)
    .replace(/\{\{circle2Color\}\}/g, colors.circle2)
    .replace(/\{\{circle3Color\}\}/g, colors.circle3)
    .replace(/\{\{srColor\}\}/g, colors.srColor)
    .replace(/\{\{nameColor\}\}/g, colors.nameColor);
}

// Generate square SVG (1000×1000 base)
const outputDir = path.join(ROOT, 'output');
fs.mkdirSync(outputDir, { recursive: true });

const svg = colorize(template, colors);
const outFile = path.join(outputDir, `${event}-${variant}-square.svg`);
fs.writeFileSync(outFile, svg);
console.log(`Generated: output/${event}-${variant}-square.svg`);

console.log(`\nDone! Run: python3 scripts/render.py output/${event}-${variant}-square.svg`);
