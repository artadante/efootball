// Web Audio API Synthesized Sound Effects Engine
// Completely self-contained: no external audio files, zero 404s, works offline, instant response.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Load mute preference from localStorage
    try {
      this.isMuted = localStorage.getItem('efootball_sound_muted') === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  private initCtx(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('efootball_sound_muted', muted ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // 1. Tactile UI Click
  public playClick(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  // 2. Wheel Tick (Click when wheel passes a peg)
  public playWheelTick(pitchMultiplier: number = 1): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const baseFreq = 520 * Math.max(0.6, Math.min(1.6, pitchMultiplier));
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  }

  // 3. Wheel Win / Selection Confirmed
  public playWheelWin(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
    });
  }

  // 4. Referee Whistle (Double chirp)
  public playWhistle(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const chirp = (startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600, startTime);
      osc.frequency.linearRampToValueAtTime(2900, startTime + duration * 0.5);
      osc.frequency.linearRampToValueAtTime(2700, startTime + duration);

      // Add slight tremolo
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 35;
      lfoGain.gain.value = 150;
      lfo.connect(osc.frequency);
      lfo.start(startTime);
      lfo.stop(startTime + duration);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    chirp(ctx.currentTime, 0.15);
    chirp(ctx.currentTime + 0.2, 0.45);
  }

  // 5. Stadium Crowd Cheer (Synthesized band-passed noise burst)
  public playStadiumCheer(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 1.8;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(1100, ctx.currentTime + 0.8);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
    whiteNoise.stop(ctx.currentTime + 1.8);
  }

  // 6. Fanfare / Celebration Anthem
  public playFanfare(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    // Brass fanfare arpeggio
    const melody = [
      { f: 523.25, d: 0.15, t: 0 },
      { f: 659.25, d: 0.15, t: 0.16 },
      { f: 783.99, d: 0.18, t: 0.32 },
      { f: 1046.5, d: 0.55, t: 0.52 },
    ];

    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, ctx.currentTime + note.t);

      // Low pass to soften sawtooth like a brass horn
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2400;

      gain.gain.setValueAtTime(0.18, ctx.currentTime + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.t + note.d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + note.t);
      osc.stop(ctx.currentTime + note.t + note.d);
    });

    // Also trigger crowd cheer alongside fanfare
    setTimeout(() => {
      this.playStadiumCheer();
    }, 400);
  }
}

export const soundEngine = new SoundEngine();
