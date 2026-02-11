export class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.isMuted = false;
        this.isPlayingBGM = false;
        this.bgmTimer = null;

        // BGM Tempo settings
        this.baseInterval = 1.0; // Slow start (60 BPM)
        this.minInterval = 0.3;  // Max speed (200 BPM)
        this.currentInterval = this.baseInterval;
    }

    setTension(ratio) {
        // ratio: 0.0 to 1.0
        // Clamp ratio
        const r = Math.max(0, Math.min(1, ratio));

        // Linear interpolation from Base to Min
        this.currentInterval = this.baseInterval - (this.baseInterval - this.minInterval) * r;
    }

    // ... (resume, playTap unchanged) ...

    playBGM() {
        // console.log('SoundManager: playBGM called. isMuted:', this.isMuted, 'isPlayingBGM:', this.isPlayingBGM);

        if (this.isMuted) return;

        if (this.isPlayingBGM) {
            this.resume();
            return;
        }

        this.resume();
        this.stopBGM(true);

        // console.log('SoundManager: Starting BGM loop');
        this.isPlayingBGM = true;

        // Reset tempo on start?
        // this.currentInterval = this.baseInterval; 
        // No, let Game reset it via setTension(0)

        this.scheduleNextBeat(this.ctx.currentTime);
    }

    scheduleNextBeat(time) {
        if (!this.isPlayingBGM) return;

        // Play "Kick"
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.frequency.setValueAtTime(100, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.4);

        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

        osc.start(time);
        osc.stop(time + 0.4);

        // Schedule next beat based on current dynamic interval
        const nextTime = time + this.currentInterval;

        const delay = (nextTime - this.ctx.currentTime) * 1000;

        if (delay > 0) {
            this.bgmTimer = setTimeout(() => this.scheduleNextBeat(nextTime), delay);
        } else {
            this.scheduleNextBeat(this.ctx.currentTime + 0.1);
        }
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

    playBGM() {
        console.log('SoundManager: playBGM called. isMuted:', this.isMuted, 'isPlayingBGM:', this.isPlayingBGM);

        if (this.isMuted) return;

        // If already playing, just ensure we are resumed
        if (this.isPlayingBGM) {
            this.resume();
            return;
        }

        this.resume();

        // Ensure clean state before starting
        this.stopBGM(true);

        console.log('SoundManager: Starting BGM loop');
        this.isPlayingBGM = true;
        this.scheduleNextBeat(this.ctx.currentTime);
    }

    scheduleNextBeat(time) {
        if (!this.isPlayingBGM) return;

        // Play a "Kick" - heavy low thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Lower pitch for heavy feel
        osc.frequency.setValueAtTime(100, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.4);

        // Loud impact
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

        osc.start(time);
        osc.stop(time + 0.4);

        // Schedule next beat: ~100 BPM (0.6s)
        const nextTime = time + 0.6;

        const delay = (nextTime - this.ctx.currentTime) * 1000;

        // console.log('SoundManager: Scheduled beat. Next in', delay, 'ms');

        if (delay > 0) {
            this.bgmTimer = setTimeout(() => this.scheduleNextBeat(nextTime), delay);
        } else {
            // We are lagging, catch up immediately with a small offset
            this.scheduleNextBeat(this.ctx.currentTime + 0.1);
        }
    }

    stopBGM(internal = false) {
        if (!internal) console.log('SoundManager: stopBGM called');

        this.isPlayingBGM = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}
