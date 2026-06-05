# Ikigaro OS — Launching Soon Page

## Overview
Replace the blank placeholder on the homepage with an elegant "launching soon" landing page for Ikigaro OS. The page communicates the brand's mission — performance, recovery, and longevity rooted in *ikigai* — and invites the community to stay connected.

## Design Direction (Locked)
- **Palette**: Warm Sand — `#faf8f5` (background), `#f0ebe3` (surface), `#c9b99a` (accent), `#8b7355` (primary/foreground)
- **Typography**: Outfit (display/headings), Figtree (body)
- **Layout**: Split-screen hero — left imagery, right statement

## Page Structure

### 1. Hero Section (Split Screen)
- **Left side**: A single evocative, atmospheric image representing the Ikigaro retreat experience (wellness, nature, performance, recovery).
- **Right side**: 
  - Brand mark: "Ikigaro OS"
  - Tagline: "The Operating System for Performance, Recovery & Longevity"
  - Sub-line: Rooted in *ikigai* — purpose, community, and long-term fulfillment.
  - "Launching Soon" indicator (subtle, elegant — not a countdown timer)
  - Brief mention of the Superhuman Protocol as the flagship curriculum housed within Ikigaro Club

### 2. Offerings Teaser (Minimal)
- A restrained list or visual row hinting at what's coming:
  - Performance Training · Biomarkers & Diagnostics · Ice Bath · Sauna · Steam Room · Deep Tissue Massage · Red Light Therapy · Yoga · Pilates
- Kept minimal so it doesn't compete with the "launching soon" message.

### 3. Contact Footer
- Centered, minimal footer at the bottom of the viewport or just below the fold.
- Copy: "Questions? Reach out to us."
- Email link: `hello@ikigaro.com`

## Technical Details
- Update `src/styles.css` with Warm Sand tokens mapped to semantic variables (background, foreground, primary, accent, muted, border) in `oklch` format.
- Load Outfit and Figtree via `<link>` in `__root.tsx` head.
- Build the page in `src/routes/index.tsx` as a single scrollable page.
- Responsive: split-screen stacks vertically on mobile (image on top, text below).
- Head meta updated: title "Ikigaro OS — Coming Soon", description referencing performance, recovery, and longevity.

## Deliverable
A single, polished landing page ready to share with the community. No backend, no auth, no additional routes.