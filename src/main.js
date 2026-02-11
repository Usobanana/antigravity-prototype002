import { State } from './core/State.js';
import { CounterDisplay } from './ui/CounterDisplay.js';

// Initialize App
const app = document.querySelector('#app');
const state = new State();
new CounterDisplay(state, app);

console.log('Antigravity Prototype 002 initialized.');
