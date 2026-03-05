# Pokemon Card Component Reference

## Scope

This document covers **card anatomy only** (what is printed/visible on cards), not gameplay flow.

It is intended as a build spec for the Trading Card Wizard so every card-facing component can be edited and rendered.

---

## Canonical Card Families

The Pokemon TCG uses 3 high-level card families:

1. **Pokemon cards**
2. **Trainer cards**
3. **Energy cards**

---

## Universal Components (Seen Across Most Card Types)

These are common structural parts you should support as configurable fields/layers:

1. **Card name/title line**
2. **Card family/type marker** (Pokemon / Trainer / Energy)
3. **Primary frame and border treatment**
4. **Art region or graphic focal area**
5. **Primary text box region** (attacks/effects/rules depending on card type)
6. **Set identity markers**
7. **Collector number line**
8. **Expansion/set symbol**
9. **Rarity indicator**
10. **Regulation/legal mark (era dependent)**
11. **Illustrator credit**
12. **Copyright/legal text**
13. **Optional variant labels** (example: Ancient/Future, ex/V era labels, etc.)

---

## Pokemon Card: Full Anatomy

### Top/Header Zone

1. **Stage badge** (Basic / Stage 1 / Stage 2 / special stage label)
2. **Evolves from line** (when applicable)
3. **Pokemon name**
4. **HP value**
5. **HP label ("HP")**
6. **Pokemon type symbol near HP**
7. **Optional top rule/tag box** (era dependent, e.g., ex rule box contexts)

### Art + Identity Zone

1. **Main artwork frame**
2. **Artwork image**
3. **Pokedex-style identity strip** (modern templates often include):
   - National/card number identifier
   - Species classification
   - Height
   - Weight
4. **Optional override info line**

### Ability/Attack Text Zone

1. **Ability block (optional)**:
   - Ability label (e.g., "Ability")
   - Ability name
   - Ability effect text
2. **Attack row 1**
   - Energy cost symbols
   - Attack name
   - Attack effect text
   - Damage value (if present)
   - Damage modifier symbols (+, x, etc., when present)
3. **Attack row 2** (same structure)
4. **Additional attacks (template dependent)**

### Bottom/Battle Footer Zone

1. **Weakness label**
2. **Weakness value/symbol**
3. **Resistance label**
4. **Resistance value/symbol**
5. **Retreat label**
6. **Retreat cost symbols**
7. **Flavor/Pokedex ribbon text** (template dependent)

### Metadata/Footer Line

1. **Illustrator label**
2. **Illustrator name**
3. **Collector number**
4. **Expansion symbol**
5. **Rarity**
6. **Copyright/legal line**
7. **Set/print metadata microtext (template dependent)**

---

## Trainer Card: Full Anatomy

Trainer cards are text-forward and subtype-driven.

### Header Zone

1. **Card name**
2. **Trainer supertype banner** ("Trainer")
3. **Trainer subtype label** (Item / Supporter / Stadium / Pokemon Tool / etc.)
4. **Optional special markers** (e.g., ACE SPEC style indicators in applicable eras)

### Body/Text Zone

1. **Main effect text box**
2. **Rule reminder text line(s)** (template and subtype dependent)
3. **Subtype-specific micro labels** (when applicable)

### Visual/Art Treatment

1. **May include full art, partial art, or framed art depending on template**
2. **Text box geometry and density are primary design drivers**

### Metadata/Footer

1. **Illustrator**
2. **Collector number**
3. **Expansion symbol**
4. **Rarity**
5. **Copyright/legal text**
6. **Regulation/legal mark**

---

## Energy Card: Full Anatomy

Energy cards split into Basic and Special layouts.

### Basic Energy

1. **Large centered energy symbol/focal glyph**
2. **Card name**
3. **Energy family styling with minimal text**
4. **Metadata/footer line** (set, collector no., etc. in modern printings)

### Special Energy

1. **"Special Energy" subtype identification**
2. **Card name**
3. **Energy symbol(s)**
4. **Effect/rule text box**
5. **Metadata/footer line**

---

## Set/Printing Metadata Components (Detailed)

These are often tiny but should still be configurable:

1. **Collector number format** (e.g., `115/114`, set-specific patterns)
2. **Set abbreviation/code**
3. **Expansion icon**
4. **Rarity symbol**
5. **Language-specific legal/copyright line**
6. **Regulation mark (era dependent)**
7. **Print variant markers when present** (promo stamp, special foil marks, etc.)

---

## Geometry + Layer Checklist for Generator Implementation

For a complete editor, each of these should be an independent layer/field:

### Global Layers

1. Outer border/frame
2. Inner panel
3. Header bar
4. Art mask/frame
5. Main text panel
6. Footer strip
7. Symbol layers (type, cost, set icons)
8. Metadata text group
9. Optional texture/noise/foil overlays

### Pokemon Mode Fields

1. Stage
2. Evolves from
3. Name
4. HP + label
5. Type symbol
6. Card number/species/height/weight/info line
7. Ability label/name/text (optional)
8. Attack N: cost/name/text/damage/modifiers
9. Weakness/resistance/retreat + labels
10. Flavor ribbon text
11. Illustrator/set/copyright/collector no./set symbol/rarity

### Trainer Mode Fields

1. Name
2. Trainer banner text
3. Trainer subtype
4. Main effect text
5. Optional rule reminder text
6. Illustrator/set/copyright/collector no./set symbol/rarity

### Energy Mode Fields

1. Name
2. Energy subtype (Basic/Special)
3. Type symbol
4. Effect text (Special energy support)
5. Illustrator/set/copyright/collector no./set symbol/rarity

---

## Notes About Template Variance

A "typical" card has stable component groups, but exact geometry and labels vary by era:

1. Legacy templates vs modern templates move/rename some zones.
2. Some cards include extra rule boxes or special labels.
3. Promo and full-art variants may move metadata and art masks.

For tooling, model **stable semantic fields** first, then attach per-template geometry presets.

---

## Source References

Official references used for extraction:

1. Pokemon TCG Rulebook (Scarlet & Violet era, includes "Parts of a Pokemon Card"):
   - https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf
2. Pokemon TCG Rulebook (Sword & Shield era, includes the same anatomy overview):
   - https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/swsh7_rulebook_en.pdf
3. Pokemon Card Game Advanced Player's Rulebook (EN, 2025, includes card category terminology and card-type references):
   - Local file: `documentation/sources/EN_advanced_manual_2025.pdf`

