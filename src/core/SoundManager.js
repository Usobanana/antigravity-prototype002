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

        this.tension = 0;
        this.noiseBuffer = this.createNoiseBuffer();
    }

    // Create noise buffer for Snare
    createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    setTension(ratio) {
        // ratio: 0.0 to 1.0 (0m to 10m)
        // Clamp ratio
        const r = Math.max(0, Math.min(1, ratio));
        this.tension = r;

        // Linear interpolation from Base to Min
        this.currentInterval = this.baseInterval - (this.baseInterval - this.minInterval) * r;
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
        this.beatCount = 0;

        this.scheduleNextBeat(this.ctx.currentTime);
    }

    scheduleNextBeat(time) {
        if (!this.isPlayingBGM) return;

        // 1. Kick (Every beat)
        this.playKick(time);

        // 2. Snare (Off-beat, starts appearing at tension > 0.2)
        // beatCount % 2 !== 0 means off-beat if we consider 4/4 time
        if (this.beatCount % 2 !== 0 && this.tension > 0.2) {
            // Volume scales with tension: 
            // 0.2 -> 0 volume
            // 1.0 -> Max volume
            const snareVol = Math.min(1, (this.tension - 0.2) * 1.5);
            if (snareVol > 0) {
                this.playSnare(time, snareVol);
            }
        }

        // Schedule next beat based on current dynamic interval
        const nextTime = time + this.currentInterval;
        this.beatCount++;

        const delay = (nextTime - this.ctx.currentTime) * 1000;

        if (delay > 0) {
            this.bgmTimer = setTimeout(() => this.scheduleNextBeat(nextTime), delay);
        } else {
            this.scheduleNextBeat(this.ctx.currentTime + 0.1);
        }
    }

    playKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Heavy Kick
        osc.frequency.setValueAtTime(100, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.start(time);
        osc.stop(time + 0.5);
    }

    playSnare(time, volume) {
        // Noise
        const bufferSource = this.ctx.createBufferSource();
        bufferSource.buffer = this.noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "highpass";
        noiseFilter.frequency.value = 1000;

        const noiseGain = this.ctx.createGain();

        bufferSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        // Envelope
        noiseGain.gain.setValueAtTime(volume * 0.5, time); // Scale max volume
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        bufferSource.start(time);
        bufferSource.stop(time + 0.2);

        // Tone (to give body)
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        const oscGain = this.ctx.createGain();

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        osc.frequency.setValueAtTime(250, time);
        oscGain.gain.setValueAtTime(volume * 0.3, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.start(time);
        osc.stop(time + 0.1);
    }

    stopBGM(internal = false) {
        if (!internal) {
            // console.log('SoundManager: stopBGM called');
        }

        this.isPlayingBGM = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}
