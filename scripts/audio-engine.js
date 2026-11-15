/**
 * BESPOKE ROMANTIC HARP & CELESTA AUDIO ENGINE (Web Audio API)
 * Zero external MP3 dependencies — synthesizes a warm celesta ring-box chime
 * on reveal followed by a gentle Fmaj7–Dm9–Bbmaj7–C6 harp & silk pad progression.
 */
(function (root) {
  class EngagementAudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.isPlaying = false;
      this.loopTimer = null;
      this.stepIndex = 0;

      // Warm F-major romantic harp arpeggio sequence (frequencies in Hz)
      this.progression = [
        // Fmaj7: F4, A4, C5, E5
        [349.23, 440.0, 523.25, 659.25],
        // Dm9: D4, F4, A4, E5
        [293.66, 349.23, 440.0, 659.25],
        // Bbmaj7: Bb3, D4, F4, A4
        [233.08, 293.66, 349.23, 440.0],
        // C6: C4, E4, G4, A4
        [261.63, 329.63, 392.0, 440.0]
      ];
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.0001;
      this.masterGain.connect(this.ctx.destination);
    }

    playPluck(freq, startTime, duration = 2.1, peakGain = 0.14) {
      if (!this.ctx || !this.masterGain) return;

      const oscMain = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      oscMain.type = "sine";
      oscMain.frequency.setValueAtTime(freq, startTime);

      oscHarmonic.type = "triangle";
      oscHarmonic.frequency.setValueAtTime(freq * 2, startTime);

      const harmonicGain = this.ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.18, startTime);

      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.035);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      oscMain.connect(noteGain);
      oscHarmonic.connect(harmonicGain);
      harmonicGain.connect(noteGain);
      noteGain.connect(this.masterGain);

      oscMain.start(startTime);
      oscHarmonic.start(startTime);
      oscMain.stop(startTime + duration + 0.05);
      oscHarmonic.stop(startTime + duration + 0.05);
    }

    playRevealChime() {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.12, now);

      // Sparkling music-box / celesta flourish as the velvet lid opens
      const sparkleNotes = [523.25, 659.25, 783.99, 880.0, 1046.5, 1318.51];
      sparkleNotes.forEach((hz, idx) => {
        this.playPluck(hz, now + idx * 0.11, 2.2, 0.12);
      });
    }

    start() {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      if (this.isPlaying) return;

      this.isPlaying = true;
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.001), now);
      this.masterGain.gain.linearRampToValueAtTime(0.11, now + 0.8);

      const scheduleBar = () => {
        if (!this.isPlaying || !this.ctx) return;
        const chord = this.progression[this.stepIndex % this.progression.length];
        this.stepIndex += 1;
        const base = this.ctx.currentTime + 0.05;

        // Warm low root pad
        this.playPluck(chord[0] * 0.5, base, 3.6, 0.1);
        // Gentle harp arpeggio notes
        chord.forEach((noteHz, i) => {
          this.playPluck(noteHz, base + i * 0.55, 2.6, 0.11);
        });
        // Delicate upper response note
        this.playPluck(chord[2] * 2, base + 2.55, 2.2, 0.065);
      };

      scheduleBar();
      this.loopTimer = window.setInterval(scheduleBar, 3600);
    }

    stop() {
      if (!this.isPlaying) return;
      this.isPlaying = false;
      if (this.loopTimer) {
        clearInterval(this.loopTimer);
        this.loopTimer = null;
      }
      if (this.ctx && this.masterGain) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.35);
      }
    }

    toggle() {
      if (this.isPlaying) {
        this.stop();
        return false;
      }
      this.start();
      return true;
    }
  }

  root.engagementAudio = new EngagementAudioEngine();
})(typeof globalThis !== "undefined" ? globalThis : window);
