# Simran & Yash — Ring Ceremony & Engagement Invitation Suite

A bespoke two-part digital engagement invitation suite for **Simran** & **Yash Goyal** (`Friday, 27th November 2026 · 7:00 PM Onwards · Park Royal, Faridabad`):

1. **Interactive Engagement Website (`index.html`)** — Features a 3D Blush-Champagne Velvet Ring Box opening reveal, custom watercolor caricature portrait, Web Audio romantic harp & chime soundtrack, live countdown timer, evening programme, venue showcase with Google Maps integration, `.ics` calendar export, and instant WhatsApp RSVP & blessings dispatch.
2. **1-Page Clickable Smartphone PDF Invite (`dist/Simran_and_Yash_Engagement_Invite.pdf`)** — Rendered at `9:16` mobile portrait aspect ratio (`540 × 960 pt`) for effortless WhatsApp sharing, featuring an embedded clickable button linking directly to `https://simran-and-yash.github.io/`.

## Customizing Details

Edit [`config/engagement-config.js`](./config/engagement-config.js) to update text, phone numbers, timings, or URLs in one place. Then regenerate the PDF:

```bash
npm run build:pdf
```

## Hosting on GitHub Pages

1. Push all files and folders (`assets/`, `config/`, `dist/`, `scripts/`, `styles/`, `index.html`, `invite-card.html`, `package.json`) to the root of `main` in `simran-and-yash/simran-and-yash.github.io`.
2. In **Settings → Pages**, set **Source** to **Deploy from a branch** → `main` / `/ (root)`.
3. Your live website publishes at `https://simran-and-yash.github.io/`.
