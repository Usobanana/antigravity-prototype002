import { State } from './core/State.js';
import { SoundManager } from './core/SoundManager.js';
import { CounterDisplay } from './ui/CounterDisplay.js';

// Initialize App
const app = document.querySelector('#app');
const state = new State();
const soundManager = new SoundManager();
new CounterDisplay(state, app, soundManager);

console.log('Antigravity Prototype 002 initialized.');
