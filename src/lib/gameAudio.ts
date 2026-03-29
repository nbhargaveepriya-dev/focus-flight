import type { SeatClass } from '@/lib/miles';

class CabinAudio {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private pianoNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isPlaying = false;
  private normalGain = 0.15;
  private turbulenceGain = 0.45;
  private currentClass: SeatClass = 'economy';

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  setClass(cls: SeatClass) {
    this.currentClass = cls;
    if (this.isPlaying) {
      this.stop();
      setTimeout(() => this.start(), 600);
    }
  }

  start() {
    if (this.isPlaying) return;
    try {
      const ctx = this.getCtx();
      this.oscillator = ctx.createOscillator();
      this.gainNode = ctx.createGain();

      // Base hum frequency shifts up slightly for higher classes
      const baseFreq = this.currentClass === 'first' ? 55 : this.currentClass === 'business' ? 60 : 65;
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      this.oscillator.detune.setValueAtTime(5, ctx.currentTime);

      this.gainNode.gain.setValueAtTime(0, ctx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(this.normalGain, ctx.currentTime + 2);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(ctx.destination);
      this.oscillator.start();
      this.isPlaying = true;

      // First class: add soft lo-fi piano tones
      if (this.currentClass === 'first') {
        this.startPianoLayer(ctx);
      }
    } catch {}
  }

  private startPianoLayer(ctx: AudioContext) {
    // Gentle repeating piano-like notes (pentatonic scale) — G4, A4, C5, D5, E5
    const notes = [392, 440, 523, 587, 659];
    const playNote = (freq: number, when: number, dur: number) => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, when);
        gain.gain.setValueAtTime(0, when);
        gain.gain.linearRampToValueAtTime(0.06, when + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(when);
        osc.stop(when + dur + 0.1);
        this.pianoNodes.push({ osc, gain });
      } catch {}
    };

    // Schedule a repeating gentle arpeggio
    const scheduleLoop = (startTime: number) => {
      if (!this.isPlaying || this.currentClass !== 'first') return;
      const pattern = [0, 2, 4, 1, 3]; // indexes into notes
      pattern.forEach((idx, i) => {
        playNote(notes[idx], startTime + i * 0.8, 1.2);
      });
      setTimeout(() => scheduleLoop(ctx.currentTime), 4500);
    };
    setTimeout(() => scheduleLoop(ctx.currentTime + 3), 3000);
  }

  stop() {
    if (!this.isPlaying || !this.gainNode || !this.oscillator || !this.ctx) return;
    this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
    setTimeout(() => {
      if (this.oscillator) { this.oscillator.stop(); this.oscillator.disconnect(); }
      if (this.gainNode) { this.gainNode.disconnect(); }
      this.oscillator = null;
      this.gainNode = null;
      this.pianoNodes = [];
      this.isPlaying = false;
    }, 1000);
  }

  toggle() {
    if (this.isPlaying) { this.stop(); } else { this.start(); }
    return !this.isPlaying;
  }

  getStatus() { return this.isPlaying; }

  setTurbulence(active: boolean) {
    if (!this.gainNode || !this.ctx) return;
    const target = active ? this.turbulenceGain : this.normalGain;
    this.gainNode.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.5);
  }

  playChime() {
    try {
      const ctx = this.getCtx();
      const schedule = [
        { freq: 783.99, start: 0,   dur: 0.3 },
        { freq: 987.77, start: 0.3, dur: 0.3 },
        { freq: 783.99, start: 0.7, dur: 0.3 },
        { freq: 987.77, start: 1.0, dur: 0.3 },
      ];
      schedule.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.05);
      });
    } catch {}
  }

  playPriorityLanding() {
    try {
      const ctx = this.getCtx();
      // Richer chord landing tone for first class
      const chords = [
        [523.25, 659.25, 783.99],
        [587.33, 739.99, 880.00],
      ];
      chords.forEach((freqs, ci) => {
        freqs.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + ci * 0.6);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + ci * 0.6);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ci * 0.6 + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + ci * 0.6);
          osc.stop(ctx.currentTime + ci * 0.6 + 0.9);
        });
      });
    } catch {}
  }

  playWindGust() {
    try {
      const ctx = this.getCtx();
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch {}
  }
}

export const cabinAudio = new CabinAudio();

export function speakCaptainAnnouncement(destination: string) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(
      `Welcome aboard, Student. This is your Captain speaking. We are cleared for takeoff to ${destination}. Please stay focused until we reach cruising altitude.`
    );
    msg.rate = 0.88;
    msg.pitch = 0.9;
    msg.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang === 'en-GB' || v.name.includes('Daniel') || v.name.includes('Google UK'));
    if (preferred) msg.voice = preferred;
    window.speechSynthesis.speak(msg);
  } catch {}
}
