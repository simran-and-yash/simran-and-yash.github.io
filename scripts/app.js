/**
 * INTERACTIVE APPLICATION CONTROLLER — SIMRAN & YASH ENGAGEMENT SUITE
 * Controls 3D Velvet Ring Box reveal, ambient blush petals, live countdown,
 * .ics calendar download, venue map link copy, and background audio pause
 * when the inline Video Invitation player starts playing.
 */
(function () {
  const cfg = window.ENGAGEMENT_CONFIG || {};

  /* ------------------------------------------------------------------------
     1. AMBIENT BLUSH ROSE PETALS & CHAMPAGNE SHIMMER CANVAS
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById("petal-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const petals = [];
  let burstBoost = 0;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createPetal(isBurst = false) {
    const w = window.innerWidth || 1024;
    const h = window.innerHeight || 768;
    const isSparkle = Math.random() < 0.38;
    return {
      x: isBurst ? w * 0.5 + (Math.random() - 0.5) * 180 : Math.random() * w,
      y: isBurst ? h * 0.46 + (Math.random() - 0.5) * 90 : -20 - Math.random() * h,
      vx: isBurst ? (Math.random() - 0.5) * 3.4 : (Math.random() - 0.5) * 0.55,
      vy: isBurst ? -1.8 - Math.random() * 2.4 : 0.45 + Math.random() * 0.75,
      gravity: isBurst ? 0.055 : 0,
      size: isSparkle ? 1.8 + Math.random() * 2.2 : 6 + Math.random() * 6.5,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.025,
      alpha: isSparkle ? 0.45 + Math.random() * 0.4 : 0.34 + Math.random() * 0.32,
      isSparkle,
      tone: Math.random() > 0.45 ? "#E8BDBA" : "#F3DFC8"
    };
  }

  function initPetals() {
    if (!ctx) return;
    resizeCanvas();
    const count = window.innerWidth < 640 ? 18 : 30;
    for (let i = 0; i < count; i += 1) {
      const p = createPetal(false);
      p.y = Math.random() * window.innerHeight;
      petals.push(p);
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = petals.length - 1; i >= 0; i -= 1) {
        const p = petals[i];
        p.vy += p.gravity;
        p.x += p.vx + Math.sin(p.y * 0.012) * 0.28;
        p.y += p.vy;
        p.rot += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;

        if (p.isSparkle) {
          ctx.fillStyle = "#D4A373";
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.tone;
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.6);
          ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.75, p.size * 0.6, 0, p.size * 0.8);
          ctx.bezierCurveTo(-p.size * 0.75, p.size * 0.6, -p.size * 0.8, -p.size * 0.5, 0, -p.size * 0.6);
          ctx.fill();
        }
        ctx.restore();

        if (p.y > canvas.height + 30) {
          if (p.gravity > 0 && petals.length > 32) {
            petals.splice(i, 1);
          } else {
            p.y = -18;
            p.x = Math.random() * canvas.width;
            p.vy = 0.45 + Math.random() * 0.75;
            p.gravity = 0;
          }
        }
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  function triggerCelebrationBurst() {
    if (!ctx || burstBoost > 0) return;
    burstBoost = 1;
    for (let i = 0; i < 28; i += 1) {
      petals.push(createPetal(true));
    }
  }

  window.addEventListener("resize", resizeCanvas);
  initPetals();

  /* ------------------------------------------------------------------------
     2. 3D VELVET RING BOX GATEKEEPER & AUDIO CONTROLS
     ------------------------------------------------------------------------ */
  const gate = document.getElementById("ring-box-gate");
  const boxStage = document.getElementById("ring-box-stage");
  const openBtn = document.getElementById("open-ring-box-btn");
  const audioBtn = document.getElementById("audio-toggle-btn");
  const audioLabel = document.getElementById("audio-toggle-label");

  function syncAudioUi(playing) {
    if (!audioBtn || !audioLabel) return;
    audioBtn.classList.toggle("is-playing", Boolean(playing));
    audioBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    audioLabel.textContent = playing ? "Music On" : "Music Off";
  }

  function revealScrollElementsImmediately() {
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      el.classList.add("is-visible");
    });
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("skipGate") === "1" && gate) {
    gate.classList.add("is-gone");
    document.body.classList.remove("gate-locked");
    document.body.classList.add("instant-reveal");
    revealScrollElementsImmediately();
  } else if (params.get("openBoxPreview") === "1" && gate) {
    gate.classList.add("is-instant-open", "is-opening");
    triggerCelebrationBurst();
  }

  let gateOpened = false;
  function openRingBox() {
    if (gateOpened || !gate) return;
    gateOpened = true;

    gate.classList.add("is-opening");
    triggerCelebrationBurst();

    if (window.engagementAudio) {
      window.engagementAudio.playRevealChime();
      window.setTimeout(() => {
        window.engagementAudio.start();
        syncAudioUi(true);
      }, 420);
    }

    window.setTimeout(() => {
      gate.classList.add("is-fading");
      document.body.classList.remove("gate-locked");
    }, 1250);

    window.setTimeout(() => {
      gate.classList.add("is-gone");
    }, 2200);
  }

  if (boxStage) {
    boxStage.addEventListener("click", openRingBox);
    boxStage.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openRingBox();
      }
    });
  }
  if (openBtn) {
    openBtn.addEventListener("click", openRingBox);
  }

  if (audioBtn) {
    audioBtn.addEventListener("click", () => {
      if (!window.engagementAudio) return;
      const nowPlaying = window.engagementAudio.toggle();
      syncAudioUi(nowPlaying);
    });
  }

  /* ------------------------------------------------------------------------
     3. SCROLL REVEAL OBSERVER
     ------------------------------------------------------------------------ */
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
  } else {
    revealScrollElementsImmediately();
  }

  /* ------------------------------------------------------------------------
     4. LIVE COUNTDOWN TO 27 NOVEMBER 2026, 7:00 PM IST
     ------------------------------------------------------------------------ */
  const targetIso = (cfg.event && cfg.event.isoStart) || "2026-11-27T19:00:00+05:30";
  const targetMs = new Date(targetIso).getTime();

  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMinutes = document.getElementById("cd-minutes");
  const elSeconds = document.getElementById("cd-seconds");

  function pad2(n) {
    return String(Math.max(0, n)).padStart(2, "0");
  }

  function updateCountdown() {
    if (!elDays || !elHours || !elMinutes || !elSeconds) return;
    const diff = Math.max(0, targetMs - Date.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    elDays.textContent = String(days).padStart(2, "0");
    elHours.textContent = pad2(hours);
    elMinutes.textContent = pad2(minutes);
    elSeconds.textContent = pad2(seconds);
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  /* ------------------------------------------------------------------------
     5. ADD TO CALENDAR (.ICS) GENERATOR
     ------------------------------------------------------------------------ */
  const calBtn = document.getElementById("add-calendar-btn");
  if (calBtn) {
    calBtn.addEventListener("click", () => {
      const startUtc = (cfg.event && cfg.event.icsStartUtc) || "20261127T133000Z";
      const endUtc = (cfg.event && cfg.event.icsEndUtc) || "20261127T180000Z";
      const mapUrl = (cfg.venue && cfg.venue.mapUrl) || "https://maps.app.goo.gl/xLdzunZ6RtFFszkr5?g_st=aw";
      const siteUrl = (cfg.meta && cfg.meta.websiteUrl) || window.location.href;

      const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//SimranAndYash//EngagementInvite//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "UID:simran-yash-engagement-20261127@simran-and-yash",
        `DTSTAMP:${startUtc}`,
        `DTSTART:${startUtc}`,
        `DTEND:${endUtc}`,
        "SUMMARY:Simran & Yash — Our Ring Ceremony & Engagement (Followed by Dinner)",
        `LOCATION:Park Royal\\, Faridabad (${mapUrl})`,
        `DESCRIPTION:Join us and our families (the Goyal & Upadhyay families) as we celebrate our Ring Ceremony & Engagement at 7:00 PM onwards\\, followed by Dinner.\\nVenue Map: ${mapUrl}\\nOur Invitation: ${siteUrl}`,
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsLines], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Simran_and_Yash_Engagement_27_Nov_2026.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  /* ------------------------------------------------------------------------
     6. VENUE MAP LINK COPY HELPER
     ------------------------------------------------------------------------ */
  const copyMapBtn = document.getElementById("copy-venue-link-btn");
  const copyFeedback = document.getElementById("copy-venue-feedback");
  if (copyMapBtn) {
    copyMapBtn.addEventListener("click", async () => {
      const url = (cfg.venue && cfg.venue.mapUrl) || "https://maps.app.goo.gl/xLdzunZ6RtFFszkr5?g_st=aw";
      try {
        await navigator.clipboard.writeText(url);
        if (copyFeedback) {
          copyFeedback.textContent = "Google Maps venue link copied to clipboard.";
        }
      } catch {
        if (copyFeedback) {
          copyFeedback.textContent = url;
        }
      }
    });
  }
})();
