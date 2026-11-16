#!/usr/bin/env node
/**
 * AUTOMATED 1-PAGE INTERACTIVE ENGAGEMENT PDF GENERATOR
 * Renders invite-card.html via headless Chromium into dist/Simran_and_Yash_Engagement_Invite.pdf,
 * preserving self-hosted fonts, watercolor caricature, and clickable website & Google Maps URIs.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const config = require(resolve(rootDir, "config/engagement-config.js"));

const distDir = resolve(rootDir, "dist");
mkdirSync(distDir, { recursive: true });

const outputPdf = resolve(distDir, config.meta.pdfFileName);
const cardHtmlUrl = pathToFileURL(resolve(rootDir, "invite-card.html")).href;

const candidates = [
  process.env.CHROME_BIN,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser"
].filter(Boolean);

const chromeBin = candidates.find((p) => existsSync(p));
if (!chromeBin) {
  console.error("Error: Could not find Chromium/Chrome binary to render PDF.");
  process.exit(1);
}

const tempProfile = mkdtempSync(join(tmpdir(), "simran-yash-pdf-"));

try {
  console.log(`Rendering 1-page Engagement PDF using ${chromeBin}...`);
  execFileSync(
    chromeBin,
    [
      "--headless=new",
      `--user-data-dir=${tempProfile}`,
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-proxy-server",
      "--run-all-compositor-stages-after-draw",
      "--virtual-time-budget=5000",
      "--no-pdf-header-footer",
      `--print-to-pdf=${outputPdf}`,
      cardHtmlUrl
    ],
    { stdio: "inherit" }
  );
} finally {
  rmSync(tempProfile, { recursive: true, force: true });
}

const pdfBytes = readFileSync(outputPdf);
const hasSiteUri = pdfBytes.includes(Buffer.from(config.meta.websiteUrl, "utf8"));
const hasMapUri = pdfBytes.includes(Buffer.from(config.venue.mapUrl, "utf8"));

console.log(`\n✓ Generated: ${outputPdf} (${(pdfBytes.length / 1024).toFixed(1)} KB)`);
console.log(
  `✓ Embedded clickable Website URI (${config.meta.websiteUrl}): ${hasSiteUri ? "VERIFIED" : "CHECK LINK"}`
);
console.log(
  `✓ Embedded clickable Venue Map URI (${config.venue.mapUrl}): ${hasMapUri ? "VERIFIED" : "CHECK LINK"}`
);
