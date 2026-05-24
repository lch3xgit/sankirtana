import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const FORMATS = {
  square: { label: '1:1 Square', w: 1080, h: 1080 },
  story:  { label: '9:16 Story', w: 1080, h: 1920 },
  wide:   { label: '16:9 Wide',  w: 1920, h: 1080 },
  pin:    { label: '2:3 Pin',    w: 1000, h: 1500 },
};

const configPath = process.argv[2] || path.join(ROOT, 'sessions', 'ipl-2026-rcb.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const colors = config.colors;
const event = config.event || 'untitled';
const variant = config.template || 'radhe';

const templateFile = variant === 'krsna' ? 'sri-krsna.svg' : 'sri-radhe.svg';
let template = fs.readFileSync(path.join(ROOT, 'templates', templateFile), 'utf8');

// Replace placeholders with actual colors from the session JSON
function applyColors(tmpl) {
  return tmpl
    .replace(/\{\{bgColor\}\}/g, colors.background)
    .replace(/\{\{circle1Color\}\}/g, colors.circle1)
    .replace(/\{\{circle2Color\}\}/g, colors.circle2)
    .replace(/\{\{circle3Color\}\}/g, colors.circle3)
    .replace(/\{\{srColor\}\}/g, colors.srColor)
    .replace(/\{\{nameColor\}\}/g, colors.nameColor);
}

const coloredTemplate = applyColors(template);

const outputDir = path.join(ROOT, 'output');
fs.mkdirSync(outputDir, { recursive: true });

// Extract just the inner content (circles + text) without the outer SVG wrapper
const innerMatch = coloredTemplate.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
let rawContent = '';
if (innerMatch) {
  rawContent = innerMatch[1];
  // Strip XML declaration if present
  rawContent = rawContent.replace(/<\?xml[^>]*\?>/g, '');
  // Strip the background rect (we'll add our own per format)
  // Use line-by-line filtering to avoid regex complexity
  rawContent = rawContent.split('\n')
    .filter(line => !line.trim().startsWith('<rect width="1000"'))
    .join('\n')
    .trim();
} else {
  rawContent = coloredTemplate; // fallback
}

for (const [key, fmt] of Object.entries(FORMATS)) {
  const shortestDim = Math.min(fmt.w, fmt.h);
  const targetCircleSize = shortestDim * 0.80;
  const scale = targetCircleSize / 972;
  const offsetX = (fmt.w - 1000) / 2;
  const offsetY = (fmt.h - 1000) / 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt.w} ${fmt.h}" width="${fmt.w}" height="${fmt.h}">\n`;
  svg += `  <rect width="${fmt.w}" height="${fmt.h}" fill="${colors.background}"/>\n`;
  svg += `  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">\n`;

  for (const line of rawContent.split('\n')) {
    if (line.trim()) {
      svg += `    ${line.trim()}\n`;
    }
  }

  svg += `  </g>\n`;
  svg += `</svg>`;

  const outFile = path.join(outputDir, `${event}-${variant}-${key}.svg`);
  fs.writeFileSync(outFile, svg);
  console.log(`Generated: ${outFile}`);
}

console.log(`\nDone! Render with: python3 scripts/render.py output/${event}-<variant>-<format>.svg <out.png>`);
console.log(`Supported formats: ${Object.keys(FORMATS).join(', ')}`);
