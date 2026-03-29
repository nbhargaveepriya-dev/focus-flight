class CabinAudio {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  start() {
    if (this.isPlaying) return;
    
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.oscillator = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();
      
      // Low frequency hum
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(65, this.ctx.currentTime);
      
      // Add a slight variance for realism
      this.oscillator.detune.setValueAtTime(5, this.ctx.currentTime);
      
      // Volume control (very soft background drone)
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 2); // fade in
      
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
      
      this.oscillator.start();
      this.isPlaying = true;
    } catch (err) {
      console.error("Audio API not supported", err);
    }
  }

  stop() {
    if (!this.isPlaying || !this.gainNode || !this.oscillator || !this.ctx) return;
    
    // Fade out
    this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
    
    setTimeout(() => {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
      }
      this.isPlaying = false;
    }, 1000);
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return !this.isPlaying;
  }

  getStatus() {
    return this.isPlaying;
  }
}

export const cabinAudio = new CabinAudio();
