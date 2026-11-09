/* ROBOT FACTORY · Tiny Web Audio sound engine (no audio files). */
(function () {
  "use strict";

  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.muted = false;
      this.hum = null;
    }

    ensure() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.62;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return true;
    }

    setMuted(muted) {
      this.muted = muted;
      if (this.ctx && this.master) {
        const now = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setTargetAtTime(muted ? 0 : 0.62, now, 0.015);
      }
    }

    tone(freq, opts = {}) {
      if (!this.ctx || this.muted) return;
      const {
        dur = 0.15,
        type = "sine",
        gain = 0.16,
        slideTo = null,
        delay = 0,
        attack = 0.006,
      } = opts;
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(30, freq), t0);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(25, slideTo), t0 + dur);
      }
      gainNode.gain.setValueAtTime(0.0001, t0);
      gainNode.gain.exponentialRampToValueAtTime(gain, t0 + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gainNode);
      gainNode.connect(this.master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.06);
    }

    noise(dur = 0.18, gain = 0.08, delay = 0) {
      if (!this.ctx || this.muted) return;
      const length = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1400;
      filter.Q.value = 0.8;
      const gainNode = this.ctx.createGain();
      gainNode.gain.value = gain;
      src.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.master);
      src.start(this.ctx.currentTime + delay);
    }

    correct(multiplier = 1) {
      if (!this.ensure()) return;
      const lift = Math.min(5, multiplier);
      const root = 523.25 * Math.pow(1.045, lift - 1);
      const notes = [1, 1.25, 1.5];
      notes.forEach((ratio, i) => {
        this.tone(root * ratio, {
          type: "triangle",
          dur: 0.14,
          gain: 0.16 - i * 0.02,
          delay: i * 0.055,
        });
      });
      if (multiplier >= 3) {
        this.tone(root * 2, { type: "sine", dur: 0.2, gain: 0.07, delay: 0.16 });
      }
    }

    wrong() {
      if (!this.ensure()) return;
      this.tone(200, { type: "sawtooth", dur: 0.28, gain: 0.15, slideTo: 62 });
      this.tone(146, { type: "square", dur: 0.22, gain: 0.08, slideTo: 48, delay: 0.02 });
      this.noise(0.16, 0.055);
    }

    miss() {
      if (!this.ensure()) return;
      this.tone(150, { type: "triangle", dur: 0.32, gain: 0.13, slideTo: 52 });
      this.noise(0.22, 0.05);
    }

    ruleChange(final = false) {
      if (!this.ensure()) return;
      this.tone(330, { type: "triangle", dur: 0.1, gain: 0.1, slideTo: 660 });
      this.tone(660, { type: "sine", dur: 0.16, gain: 0.1, delay: 0.1, slideTo: 990 });
      if (final) {
        this.tone(990, { type: "triangle", dur: 0.22, gain: 0.12, delay: 0.2, slideTo: 1320 });
      }
    }

    comboUp(multiplier = 2) {
      if (!this.ensure()) return;
      const base = 660 + multiplier * 65;
      this.tone(base, { type: "triangle", dur: 0.1, gain: 0.1 });
      this.tone(base * 1.5, { type: "sine", dur: 0.16, gain: 0.09, delay: 0.08 });
    }

    overdrive() {
      if (!this.ensure()) return;
      this.tone(130.81, { type: "sawtooth", dur: 0.5, gain: 0.12, slideTo: 1046.5 });
      this.tone(261.63, { type: "triangle", dur: 0.22, gain: 0.14, delay: 0.06, slideTo: 523.25 });
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        this.tone(freq, { type: "square", dur: 0.1, gain: 0.06, delay: 0.3 + i * 0.06 });
      });
      this.noise(0.3, 0.04, 0.02);
    }

    overdriveEnd() {
      if (!this.ensure()) return;
      this.tone(783.99, { type: "triangle", dur: 0.24, gain: 0.11, slideTo: 392 });
      this.tone(523.25, { type: "sine", dur: 0.3, gain: 0.08, delay: 0.06, slideTo: 261.63 });
      this.noise(0.2, 0.035, 0.04);
    }

    tick(urgent = false) {
      if (!this.ensure()) return;
      this.tone(urgent ? 1100 : 820, {
        type: "square",
        dur: 0.045,
        gain: urgent ? 0.06 : 0.035,
      });
    }

    start() {
      if (!this.ensure()) return;
      [392, 523.25, 659.25, 783.99].forEach((freq, i) => {
        this.tone(freq, { type: "triangle", dur: 0.16, gain: 0.13, delay: i * 0.07 });
      });
      this.startHum();
    }

    gameOver() {
      if (!this.ensure()) return;
      this.stopHum();
      [659.25, 523.25, 440, 329.63].forEach((freq, i) => {
        this.tone(freq, {
          type: "triangle",
          dur: 0.25,
          gain: 0.12,
          delay: i * 0.16,
          slideTo: freq * 0.94,
        });
      });
    }

    record() {
      if (!this.ensure()) return;
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
        this.tone(freq, {
          type: "triangle",
          dur: 0.22,
          gain: 0.1,
          delay: 0.45 + i * 0.085,
        });
      });
    }

    click() {
      if (!this.ensure()) return;
      this.tone(540, { type: "square", dur: 0.03, gain: 0.03 });
    }

    startHum() {
      if (!this.ensure() || this.hum) return;
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 54;
      osc2.type = "triangle";
      osc2.frequency.value = 108;
      filter.type = "lowpass";
      filter.frequency.value = 220;
      gain.gain.value = 0.0001;
      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      osc.start();
      osc2.start();
      gain.gain.setTargetAtTime(0.022, ctx.currentTime, 0.4);
      this.hum = { osc, osc2, gain };
    }

    stopHum() {
      if (!this.hum || !this.ctx) return;
      const { osc, osc2, gain } = this.hum;
      const now = this.ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0.0001, now, 0.05);
      osc.stop(now + 0.4);
      osc2.stop(now + 0.4);
      this.hum = null;
    }
  }

  window.SoundEngine = SoundEngine;
})();
