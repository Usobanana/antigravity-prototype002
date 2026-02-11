export class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.isMuted = false;
    }

    // Call this on first user interaction to unlock AudioContext on mobile
    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTap() {
        if (this.isMuted) return;
        this.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Connect nodes
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Sound synthesis: A pleasant "Pop" sound
        // Pitch envelope: Drop quickly from high to low
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

        // Volume envelope: Attack fast, decay fast
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(1, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.start(t);
        osc.stop(t + 0.1);
    }
}
