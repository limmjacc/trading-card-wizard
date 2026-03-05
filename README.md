# Trading Card Wizard

A browser-based trading card generator inspired by the reference image in this repo: `example-card.jpeg`.

## Project Intent

Build a personal card creator so I can generate custom cards for my friends with consistent quality and style.

## Current Prototype

This first pass includes:
- Editable text fields (name, stats, flavor text, etc.)
- Sliders and controls for HP, damage, image zoom/offset, and visual tuning
- Image upload for custom art, plus default reference artwork
- Save/load preset data (local storage + JSON import/export)
- High-resolution export (PNG/JPEG) at 2x-5x scale
- Canvas rendering tuned to the style and proportions of `example-card.jpeg`

## Run Locally

```bash
cd "/Users/liamjack/Library/Mobile Documents/com~apple~CloudDocs/Projects/Code Projects/trading-card-wizard"
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/index.html` in Safari, Chrome, Firefox, or Edge.

## Main Files

- `index.html` - editor layout and control panel
- `styles.css` - app styling and responsive layout
- `app.js` - card renderer, state management, preset handling, and export logic

## End Goal

Given a friend profile, I can quickly fill in fields, tweak visuals, and export polished high-resolution cards with repeatable structure for distribution.
