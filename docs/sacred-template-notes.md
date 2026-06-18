# Sacred Template Notes

The canonical sacred-name SVG templates are:

- `templates/sri-radha.svg`
- `templates/sri-krsna.svg`

## Sacred text

Do not change the Devanagari text:

- Sri Radha: `श्री` and `राधा`
- Sri Krsna: `श्री` and `कृष्ण`

## Fixed geometry

The circle radii, text placement, font sizes, viewBox, and tuned proportions in
the SVG templates should remain fixed. The public generator must not expose
controls that change this geometry.

## Allowed customization

- Background color
- Circle colors
- Text colors
- Aura/glow color
- Preset palettes
- Simple effects: flat, soft glow, radial aura
- Export size/layout with centered, unstretched sacred-name graphic

## Forbidden customization

- Editing the sacred-name text
- Moving or resizing the text
- Changing circle radii
- Stretching the circle for non-square exports
- Adding logos, team marks, copyrighted graphics, or trademark imagery

## Font and rendering caution

The templates use live SVG text with Devanagari shaping. Browser and PNG export
quality depends on available font shaping and the preferred `Hind` font loading
successfully. If exact cross-machine output becomes critical, consider vendoring
the font or approving path-converted reference templates in a future pass.
