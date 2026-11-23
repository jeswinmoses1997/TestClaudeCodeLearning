# Loop checklist (tier-ranker)

Run each iteration: `npm run build && npx playwright test`, then the visual diff:
`node tests/visual/capture.mjs shots/current.png && node tests/visual/diff.mjs <reference.png>`

## Behaviour (e2e/tierlist.spec.ts) — all green
- [x] 5 tiers S/A/B/C/D, 20 chips in the tray
- [x] drag tray → tier, tier → tier, tier → tray, reorder within a tier
- [x] Reset returns every chip to Unranked; state persists across reload
- [x] Click chip opens panel (What / When / Tools); Escape and × close it
- [x] Download PNG (no gate) → valid 5200px-wide PNG, `system-design-tier-list.png`
- [x] 20 icons served from /logos/*.svg, none from external hosts
- [x] token spot-checks (h1 56/800, bg #f7f7f8, label 96px, button radius 10px, S = #ef4444)
- [x] 390px viewport: no horizontal overflow

## Visual (reference: 2000x1499 screen-recording frame, app region cropped at y=187)
- [x] Capture at 1525px viewport, DPR 1985/1525 (matches the frame's scale)
- [x] Header, eyebrow, hint (arrow glyph via Menlo), tier rows, sticky tray, buttons, chips align
- [x] Mismatch ≈ 2.0% with overlays masked
- Known, accepted deviations: reference frame is color-shifted by the capture (S #ef4444 renders 219,74,67);
  cursor/hand-drawn arrow overlays; overlay scrollbar thumb under the tray (headless hides scrollbars).
- Deviation from reference page: no top nav (the user's image shows none); neutral PNG footer text
  instead of the original author's domain; state persists in localStorage (reference does not).

## Renovation (Nov 2026)
- New identity: Big Shoulders + Hanken Grotesk, concrete/ink palette, signage-style tier blocks, live distribution strip.
- The pixel-diff checks against `ref/` no longer apply (the design intentionally departs from the reference).
- e2e token checks updated to the new design. Run on another port with `PORT=3100 npx playwright test`.
