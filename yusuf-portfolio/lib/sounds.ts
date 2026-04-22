"use client";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.enabled = localStorage.getItem("sounds_enabled") === "true";
    }
  }

  private getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (typeof window !== "undefined") {
      localStorage.setItem("sounds_enabled", on ? "true" : "false");
    }
    if (on) this.success();
  }

  isEnabled() {
    return this.enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.08) {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  }

  click() {
    this.playTone(800, "sine", 0.05, 0.08);
  }

  hover() {
    this.playTone(600, "sine", 0.02, 0.04);
  }

  success() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    this.playTone(600, "sine", 0.1, 0.08);
    setTimeout(() => this.playTone(900, "sine", 0.1, 0.08), 100);
  }

  open() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }
}

export const sounds = new SoundEngine();
