# Sri Radha Digital Visual Sankirtana

A simple static GitHub Pages site for rendering sacred-name graphics for digital
sharing. The public MVP includes a terminal-grid themed landing page, Sri Radha
and Sri Krsna examples, preset palettes, custom colors, simple effects, export
sizes, and browser PNG download.

## Local Usage

Serve the folder with any static file server, then open `index.html`.

```bash
npm run serve
```

Then visit:

```text
http://localhost:8080/
```

Opening the file directly may block template loading in some browsers, so a
local server is recommended.

## File Structure

```text
index.html                 Static landing page and generator shell
src/app.js                 Browser UI logic
src/styles.css             Terminal-grid page styling
src/render/templates.js    Template loading
src/render/svg-renderer.js Shared SVG and PNG rendering path
src/render/presets.js      Browser preset palettes
src/render/sizes.js        Export sizes
templates/                 Canonical sacred-name SVG templates
presets/                   Reference preset JSON files
docs/                      Template rules and agent workflow notes
scripts/                   Existing and pending local render utilities
archive/prototype/         Preserved prototype playgrounds
output/                    Generated files, gitignored
```

## Sacred Template Rules

Do not change the sacred-name text:

- Sri Radha: `श्री` and `राधा`
- Sri Krsna: `श्री` and `कृष्ण`

Do not change the circle proportions, text placement, viewBox, or tuned geometry
in the SVG templates without explicit review. Public controls may change colors,
simple effects, background, and export size only.

## GitHub Pages

This is a static-only site. Publish the repository root with GitHub Pages and
use `index.html` as the entry point. No backend, database, login, or build step
is required for the MVP.

## Agent Workflow

Agents should create new visual variants by adding palettes, not by editing
sacred geometry. See `docs/agent-workflow.md` and
`docs/sacred-template-notes.md` before changing templates or presets.
