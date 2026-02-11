import { Game } from './core/Game.js';
import { GameUI } from './ui/GameUI.js';
import { SoundManager } from './core/SoundManager.js';

// Initialize App
const app = document.querySelector('#app');
const soundManager = new SoundManager();
const ui = new GameUI(app);
new Game(app, ui, soundManager);

console.log('Balance Stack Prototype initialized.');
