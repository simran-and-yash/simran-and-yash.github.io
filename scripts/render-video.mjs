#!/usr/bin/env node
/**
 * DETERMINISTIC 36-SECOND 1080x1920 FULL HD VIDEO INVITATION RENDERER
 * - Connects to Headless Chrome via native CDP WebSocket (zero npm deps)
 * - Steps video-invite.html?capture=1 across 1,080 exact frames (30 fps)
 * - Synthesizes the synchronized 44.1 kHz Stereo Harp, Celesta & Silk Pad WAV
 * - Encodes WhatsApp/Instagram-ready H.264 (yuv420p) + AAC MP4 via FFmpeg
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const distDir = resolve(rootDir, "dist");
mkdirSync(distDir, { recursive: true });

const DURATION_SEC = 36;
const FPS = 30;
const TOTAL_FRAMES = DURATION_SEC * FPS;

const chromeCandidates = [
  process.env.CHROME_BIN,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome"
].filter(Boolean);

const chromeBin = chromeCandidates.find((p) => existsSync(p));
if (!chromeBin) {
  throw new Error("Chrome/Edge binary not found.");
}

function findFfmpeg() {
  if (process.env.FFMPEG_BIN && existsSync(process.env.FFMPEG_BIN)) {
    return process.env.FFMPEG_BIN;
  }
  const wingetBase = resolve(
    process.env.LOCALAPPDATA || "",
    "Microsoft/WinGet/Packages"
  );
  const directAlias = resolve(
    process.env.LOCALAPPDATA || "",
    "Microsoft/WinGet/Links/ffmpeg.exe"
  );
  if (existsSync(directAlias)) return directAlias;
  return "ffmpeg";
}

/* --------------------------------------------------------------------------
   1. SYNTHESIZE 36s STEREO HARP, CELESTA CHIME & WARM PAD SOUNDTRACK (.WAV)
   -------------------------------------------------------------------------- */
function buildSoundtrackWav(wavPath) {
  const sampleRate = 44100;
  const numSamples = DURATION_SEC * sampleRate;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  function addPluck(freq, startSec, durSec, amp, pan = 0) {
    const startIdx = Math.max(0, Math.floor(startSec * sampleRate));
    const endIdx = Math.min(numSamples, Math.floor((startSec + durSec) * sampleRate));
    const gainL = amp * Math.cos(((pan + 1) * Math.PI) / 4);
    const gainR = amp * Math.sin(((pan + 1) * Math.PI) / 4);
    const twoPiF = 2 * Math.PI * freq;

    for (let i = startIdx; i < endIdx; i += 1) {
      const dt = (i - startIdx) / sampleRate;
      const attack = dt < 0.028 ? dt / 0.028 : 1.0;
      const decay = Math.exp(-dt * (2.6 / Math.max(0.6, durSec * 0.55)));
      const env = attack * decay;

      // Concert harp fundamental + warm 2nd & delicate 3rd harmonics
      const sig =
        Math.sin(twoPiF * dt) * 0.76 +
        Math.sin(twoPiF * 2 * dt) * 0.19 * Math.exp(-dt * 2.2) +
        Math.sin(twoPiF * 3 * dt) * 0.05 * Math.exp(-dt * 3.8);

      left[i] += sig * env * gainL;
      right[i] += sig * env * gainR;
    }
  }

  function addWarmPad(freq, startSec, durSec, amp) {
    const startIdx = Math.max(0, Math.floor(startSec * sampleRate));
    const endIdx = Math.min(numSamples, Math.floor((startSec + durSec) * sampleRate));
    const twoPiF = 2 * Math.PI * freq;

    for (let i = startIdx; i < endIdx; i += 1) {
      const dt = (i - startIdx) / sampleRate;
      const fadeIn = Math.min(1, dt / 0.85);
      const fadeOut = Math.min(1, (durSec - dt) / 1.1);
      const env = Math.max(0, fadeIn * fadeOut);
      // Slightly detuned stereo silk pad
      const sigL = Math.sin(twoPiF * 0.999 * dt) * 0.7 + Math.sin(twoPiF * 1.5 * dt) * 0.3;
      const sigR = Math.sin(twoPiF * 1.001 * dt) * 0.7 + Math.sin(twoPiF * 1.501 * dt) * 0.3;
      left[i] += sigL * env * amp;
      right[i] += sigR * env * amp;
    }
  }

  // Romantic Fmaj7 -> Dm9 -> Bbmaj7 -> C6 progression (3.6s per bar = 10 bars across 36s)
  const progression = [
    [349.23, 440.0, 523.25, 659.25], // Fmaj7
    [293.66, 349.23, 440.0, 659.25], // Dm9
    [233.08, 293.66, 349.23, 440.0], // Bbmaj7
    [261.63, 329.63, 392.0, 440.0]   // C6
  ];

  for (let bar = 0; bar < 9; bar += 1) {
    const t0 = bar * 3.6;
    const chord = progression[bar % progression.length];

    // Warm low root silk pad
    addWarmPad(chord[0] * 0.5, t0, 3.8, 0.085);

    // Gentle ascending & response harp arpeggio
    const pans = [-0.28, -0.1, 0.12, 0.28];
    chord.forEach((hz, idx) => {
      addPluck(hz, t0 + idx * 0.52, 2.7, 0.135, pans[idx]);
    });
    addPluck(chord[2] * 2, t0 + 2.35, 2.3, 0.075, 0.22);
    addPluck(chord[1], t0 + 2.95, 2.0, 0.085, -0.18);
  }

  // Final Bar (32.4s – 36.0s): Warm resolving Fmaj9 chord (F3, C4, F4, A4, C5, E5, G5)
  addWarmPad(174.61, 32.4, 3.5, 0.1);
  const finaleChord = [349.23, 440.0, 523.25, 659.25, 783.99, 1046.5];
  finaleChord.forEach((hz, idx) => {
    addPluck(hz, 32.4 + idx * 0.16, 3.4 - idx * 0.12, 0.115, (idx - 2.5) * 0.12);
  });

  // Synchronized Sparkling Celesta Chime at t = 2.10s (Ring Box Lid Opens!)
  const revealSparkle = [523.25, 659.25, 783.99, 880.0, 1046.5, 1318.51, 1567.98];
  revealSparkle.forEach((hz, idx) => {
    addPluck(hz, 2.1 + idx * 0.105, 2.3, 0.11, (idx % 2 === 0 ? -1 : 1) * 0.32);
  });

  // Subtle crystalline transition chimes on Scene changes (7.4s, 16.0s, 23.6s, 30.4s)
  [7.4, 16.0, 23.6, 30.4].forEach((tMark) => {
    addPluck(1046.5, tMark, 1.9, 0.055, -0.2);
    addPluck(1318.51, tMark + 0.14, 2.0, 0.05, 0.2);
  });

  // Master gentle fade-in (0..0.6s), fade-out (34.4..36.0s), and soft limiter
  const pcmData = Buffer.alloc(numSamples * 4);
  for (let i = 0; i < numSamples; i += 1) {
    const sec = i / sampleRate;
    const masterEnv =
      Math.min(1, sec / 0.6) * Math.min(1, Math.max(0, (DURATION_SEC - sec) / 1.5));
    const l = Math.tanh(left[i] * masterEnv * 1.25) * 0.88;
    const r = Math.tanh(right[i] * masterEnv * 1.25) * 0.88;
    pcmData.writeInt16LE(Math.round(l * 32767), i * 4);
    pcmData.writeInt16LE(Math.round(r * 32767), i * 4 + 2);
  }

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmData.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(2, 22); // Stereo
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmData.length, 40);

  writeFileSync(wavPath, Buffer.concat([header, pcmData]));
}

/* --------------------------------------------------------------------------
   2. MINIMAL CDP CLIENT USING BUILT-IN NODE WEBSOCKET
   -------------------------------------------------------------------------- */
class CdpSession {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    await new Promise((res, rej) => {
      this.ws.addEventListener("open", res, { once: true });
      this.ws.addEventListener("error", rej, { once: true });
    });
    this.ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve: ok, reject: fail } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) fail(new Error(msg.error.message));
        else ok(msg.result);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((ok, fail) => {
      this.pending.set(id, { resolve: ok, reject: fail });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function waitForDebuggerUrl(port) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const resp = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (resp.ok) {
        const targets = await resp.json();
        const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
        if (page) return page.webSocketDebuggerUrl;
      }
    } catch {
      // wait until Chrome opens debug port
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("Timed out waiting for Chrome DevTools endpoint.");
}

async function main() {
  const sampleOnly = process.argv.includes("--sample-frames");
  const debugPort = 9345;
  const tmpProfile = resolve(distDir, ".tmp-video-chrome-profile");
  mkdirSync(tmpProfile, { recursive: true });

  const pageUrl = `${pathToFileURL(resolve(rootDir, "video-invite.html")).href}?capture=1`;
  const chromeProc = spawn(
    chromeBin,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${tmpProfile}`,
      "--window-size=1080,1920",
      "--hide-scrollbars",
      "--mute-audio",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu-vsync",
      pageUrl
    ],
    { stdio: "ignore" }
  );

  try {
    const wsUrl = await waitForDebuggerUrl(debugPort);
    const cdp = new CdpSession(wsUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1080,
      height: 1920,
      deviceScaleFactor: 1,
      mobile: false
    });

    await cdp.send("Page.navigate", { url: pageUrl });

    // Wait until fonts & all images finish decoding
    await cdp.send("Runtime.evaluate", {
      expression: `
        (async () => {
          await document.fonts.ready;
          const imgs = Array.from(document.images);
          await Promise.all(imgs.map((img) => img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r; })));
          return true;
        })()
      `,
      awaitPromise: true
    });

    if (sampleOnly) {
      const sampleDir = resolve(distDir, ".sample-frames");
      mkdirSync(sampleDir, { recursive: true });
      const sampleTimes = [1.2, 4.2, 11.5, 20.5, 27.0, 33.0];
      for (const sec of sampleTimes) {
        await cdp.send("Runtime.evaluate", {
          expression: `window.renderAtTime(${sec});`
        });
        const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
        const outPng = resolve(sampleDir, `scene_${sec.toFixed(1)}s.png`);
        writeFileSync(outPng, Buffer.from(shot.data, "base64"));
        console.log(`Saved sample frame: ${outPng}`);
      }
      cdp.close();
      return;
    }

    const wavPath = resolve(distDir, ".tmp-soundtrack.wav");
    console.log("Synthesizing 36s romantic harp & celesta soundtrack...");
    buildSoundtrackWav(wavPath);

    const outputMp4 = resolve(distDir, "Simran_and_Yash_Engagement_Video_Invite.mp4");
    const ffmpegBin = findFfmpeg();
    console.log(`Starting FFmpeg encode (${ffmpegBin}) -> ${outputMp4}`);

    const ff = spawn(
      ffmpegBin,
      [
        "-y",
        "-f", "image2pipe",
        "-framerate", String(FPS),
        "-vcodec", "mjpeg",
        "-i", "-",
        "-i", wavPath,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-profile:v", "high",
        "-level", "4.1",
        "-movflags", "+faststart",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        outputMp4
      ],
      { stdio: ["pipe", "ignore", "pipe"] }
    );

    let ffStderr = "";
    ff.stderr.on("data", (chunk) => {
      ffStderr += chunk.toString();
    });

    for (let f = 0; f < TOTAL_FRAMES; f += 1) {
      const t = f / FPS;
      await cdp.send("Runtime.evaluate", {
        expression: `window.renderAtTime(${t.toFixed(5)});`
      });
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 92
      });
      const buf = Buffer.from(shot.data, "base64");
      if (!ff.stdin.write(buf)) {
        await new Promise((r) => ff.stdin.once("drain", r));
      }
      if ((f + 1) % 180 === 0 || f === TOTAL_FRAMES - 1) {
        console.log(`Rendered frame ${f + 1}/${TOTAL_FRAMES} (${((f + 1) / FPS).toFixed(1)}s)`);
      }
    }

    ff.stdin.end();
    const exitCode = await new Promise((r) => ff.on("close", r));
    rmSync(wavPath, { force: true });
    cdp.close();

    if (exitCode !== 0) {
      throw new Error(`FFmpeg failed with exit code ${exitCode}:\n${ffStderr.slice(-1200)}`);
    }
    console.log(`✓ Video Invitation generated: ${outputMp4}`);
  } finally {
    chromeProc.kill();
    setTimeout(() => {
      try {
        rmSync(tmpProfile, { recursive: true, force: true });
      } catch {}
    }, 600);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
