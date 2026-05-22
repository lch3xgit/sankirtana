# Sankirtana

Visual sankirtan for the Holy Dhams. Concentric circle chakras with Śrī Rādhā and Śrī Kṛṣṇa — in configurable color schemes for topical events.

## Structure

```
sankirtana/
├── templates/          # Base SVG templates
│   ├── sri-radhe.svg
│   └── sri-krsna.svg
├── output/             # Generated images (gitignored)
├── sessions/           # Color configs per event
├── scripts/            # Generation utilities
├── index.html          # Gallery preview
└── package.json
```

## Usage

```bash
# 1. Add color config to sessions/IPL-2026.json
# 2. Run: node scripts/generate.mjs sessions/IPL-2026.json
# 3. Output appears in output/ directory
```

## License

CC-BY-4.0 — free to share, adapt, and distribute. Hare Kṛṣṇa.
