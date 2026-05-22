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
const variant = config.template || 'radhe'; // radhe | krsna

// Platform dimensions
const PLATFORMS = {
  square:    { w: 1080, h: 1080, label: 'square' },
  instagram: { w: 1080, h: 1350, label: 'instagram' },
  twitter:   { w: 1200, h: 675,  label: 'twitter' },
  stories:   { w: 1080, h: 1920, label: 'stories' },
  pinterest: { w: 1000, h: 1500, label: 'pinterest' },
  web:       { w: 512,  h: 512,  label: 'web' },
};

// Load template
const templateFile = variant === 'krsna' ? 'sri-krsna.svg' : 'sri-radhe.svg';
const template = fs.readFileSync(path.join(ROOT, 'templates', templateFile), 'utf8');

// Colorize template — replace {{placeholder}} with hex values
function colorize(tmpl, colors) {
  return tmpl
    .replace(/\{\{background\}\}/g, colors.background)
    .replace(/\{\{circle1\}\}/g, colors.circle1)
    .replace(/\{\{circle2\}\}/g, colors.circle2)
    .replace(/\{\{circle3\}\}/g, colors.circle3)
    .replace(/\{\{srColor\}\}/g, colors.srColor)
    .replace(/\{\{nameColor\}\}/g, colors.nameColor);
}

// Scale SVG to platform dimensions
function scaleSVG(svg, w, h) {
  // Update viewBox, width, height
  return svg
    .replace(/viewBox="0 0 1000 1000"/, `viewBox="0 0 ${w} ${h}"`)
    .replace(/width="1000"/, `width="${w}"`)
    .replace(/height="1000"/, `height="${h}"`);
}

// Generate for each platform
const platforms = config.platforms || ['square'];
const outputDir = path.join(ROOT, 'output');
fs.mkdirSync(outputDir, { recursive: true });

for (const platformName of platforms) {
  const platform = PLATFORMS[platformName];
  if (!platform) {
    console.warn(`Unknown platform: ${platformName}`);
    continue;
  }

  const svg = scaleSVG(colorize(template, colors), platform.w, platform.h);
  const outFile = path.join(outputDir, `${event}-${variant}-${platform.label}.svg`);
  fs.writeFileSync(outFile, svg);
  console.log(`Generated: output/${event}-${variant}-${platform.label}.svg`);
}

console.log(`\nDone! Generated ${platforms.length} variants for ${event} (${variant}).`);
console.log('Next: Run python3 scripts/render.py output/<file>.svg');
