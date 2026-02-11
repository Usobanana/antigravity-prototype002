export class GameUI {
    constructor(rootElement) {
        this.root = rootElement;
        this.score = 0;
        this.element = document.createElement('div');
        this.init();
    }

    init() {
        this.element.style.position = 'absolute';
        this.element.style.top = '20px';
        this.element.style.left = '20px';
        this.element.style.color = 'white';
        this.element.style.fontFamily = 'monospace';
        this.element.style.fontSize = '24px';
        this.element.style.pointerEvents = 'none'; // Click through to game
        this.element.style.userSelect = 'none';

        this.scoreText = document.createElement('div');
        this.scoreText.textContent = '0.00m';

        this.element.appendChild(this.scoreText);
        this.root.appendChild(this.element);
    }

    updateScore(text) {
        this.scoreText.textContent = text;
    }

    showTitleScreen(onStart) {
        if (this.titleScreen) return;

        this.titleScreen = document.createElement('div');
        this.titleScreen.style.position = 'absolute';
        this.titleScreen.style.top = '0';
        this.titleScreen.style.left = '0';
        this.titleScreen.style.width = '100%';
        this.titleScreen.style.height = '100%';
        this.titleScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.titleScreen.style.display = 'flex';
        this.titleScreen.style.flexDirection = 'column';
        this.titleScreen.style.justifyContent = 'center';
        this.titleScreen.style.alignItems = 'center';
        this.titleScreen.style.zIndex = '100';
        this.titleScreen.style.pointerEvents = 'auto';

        const title = document.createElement('h1');
        title.style.color = 'white';
        title.style.fontSize = '4rem';
        title.style.margin = '0 0 40px 0';
        title.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
        title.textContent = 'BALANCE STACK';

        const startBtn = this.createButton('GAME START', () => {
            onStart();
            this.hideTitleScreen();
        });

        this.titleScreen.appendChild(title);
        this.titleScreen.appendChild(startBtn);
        this.root.appendChild(this.titleScreen);

        // Hide score during title
        this.scoreText.style.display = 'none';
    }

    hideTitleScreen() {
        if (this.titleScreen) {
            this.root.removeChild(this.titleScreen);
            this.titleScreen = null;
        }
        this.scoreText.style.display = 'block';
    }

    showGameOver(finalScore, onRetry, onBack) {
        if (this.gameOverScreen) return;

        this.gameOverScreen = document.createElement('div');
        this.gameOverScreen.style.position = 'absolute';
        this.gameOverScreen.style.top = '0';
        this.gameOverScreen.style.left = '0';
        this.gameOverScreen.style.width = '100%';
        this.gameOverScreen.style.height = '100%';
        this.gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.gameOverScreen.style.display = 'flex';
        this.gameOverScreen.style.flexDirection = 'column';
        this.gameOverScreen.style.justifyContent = 'center';
        this.gameOverScreen.style.alignItems = 'center';
        this.gameOverScreen.style.zIndex = '100';
        this.gameOverScreen.style.pointerEvents = 'auto';

        const title = document.createElement('h2');
        title.style.color = '#ff4444';
        title.style.fontSize = '3rem';
        title.style.margin = '0 0 20px 0';
        title.textContent = 'GAME OVER';

        const score = document.createElement('h3');
        score.style.color = 'white';
        score.style.fontSize = '2rem';
        score.style.margin = '0 0 40px 0';
        score.textContent = `Height: ${finalScore}`;

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '20px';

        const retryBtn = this.createButton('RETRY', () => {
            onRetry();
            this.hideGameOver();
        });

        const backBtn = this.createButton('BACK', () => {
            onBack();
            this.hideGameOver();
        });

        btnContainer.appendChild(retryBtn);
        btnContainer.appendChild(backBtn);

        this.gameOverScreen.appendChild(title);
        this.gameOverScreen.appendChild(score);
        this.gameOverScreen.appendChild(btnContainer);
        this.root.appendChild(this.gameOverScreen);
    }

    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.padding = '15px 40px';
        button.style.fontSize = '1.5rem';
        button.style.border = 'none';
        button.style.borderRadius = '30px';
        button.style.backgroundColor = 'white';
        button.style.color = 'black';
        button.style.cursor = 'pointer';
        button.style.fontWeight = 'bold';
        button.style.transition = 'transform 0.1s';

        button.addEventListener('mousedown', () => button.style.transform = 'scale(0.95)');
        button.addEventListener('mouseup', () => button.style.transform = 'scale(1)');
        button.addEventListener('click', onClick);

        return button;
    }

    hideGameOver() {
        if (this.gameOverScreen) {
            this.root.removeChild(this.gameOverScreen);
            this.gameOverScreen = null;
        }
    }
}
