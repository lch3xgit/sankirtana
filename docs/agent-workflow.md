# Agent Workflow

Use this workflow when creating a new visual sankirtana preset.

1. Create or update a palette only.
   - Browser presets live in `src/render/presets.js`.
   - Reference JSON presets may live in `presets/`.
2. Do not edit sacred geometry.
   - Do not change `viewBox`, circle radii, text coordinates, font sizes, or
     Devanagari text in `templates/sri-radha.svg` or `templates/sri-krsna.svg`.
3. Name outputs clearly.
   - Use `sri-radha-{preset}-{size}.png` or `sri-krsna-{preset}-{size}.png`.
4. Validate before finishing.
   - Sri Radha text remains `श्री` and `राधा`.
   - Sri Krsna text remains `श्री` and `कृष्ण`.
   - The circle is centered and not stretched.
   - Preset colors match the preview and exported PNG.
   - Generated output files stay in `output/` unless intentionally preserved.
