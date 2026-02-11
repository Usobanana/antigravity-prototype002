import Matter from 'matter-js';

export class Game {
    constructor(rootElement, ui, soundManager) {
        this.root = rootElement;
        this.ui = ui;
        this.soundManager = soundManager;

        this.engine = null;
        this.render = null;
        this.runner = null;

        this.blocks = [];
        this.lastSpawnTime = 0;
        this.spawnCooldown = 250; // ms

        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;

        this.highestBlockY = this.viewportHeight;
        this.maxScore = '0.00';

        this.isGameOver = false;

        // Camera & Shake
        this.cameraY = 0;
        this.shakeIntensity = 0;

        this.init();
    }

    init() {
        this.showTitle();
    }

    showTitle() {
        this.soundManager.stopBGM(); // Stop if coming from game
        this.ui.showTitleScreen(() => this.startGame());
    }

    startGame() {
        this.soundManager.playBGM(); // Start heavy beat
        if (this.engine) {
            this.cleanup();
        }

        // Module aliases
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Events = Matter.Events;

        // Create engine
        this.engine = Engine.create();

        // Create renderer
        this.render = Render.create({
            element: this.root,
            engine: this.engine,
            options: {
                width: this.viewportWidth,
                height: this.viewportHeight,
                background: '#0d0d0d',
                wireframes: false,
                showAngleIndicator: false,
                hasBounds: true
            }
        });

        this.initWorld();

        // Input handling
        this.handlePointerDownBound = (e) => this.handlePointerDown(e);
        this.handlePointerMoveBound = (e) => this.handlePointerMove(e);
        this.handlePointerUpBound = (e) => this.handlePointerUp(e);

        this.root.addEventListener('pointerdown', this.handlePointerDownBound);
        this.root.addEventListener('pointermove', this.handlePointerMoveBound);
        this.root.addEventListener('pointerup', this.handlePointerUpBound);
        this.root.addEventListener('pointerleave', this.handlePointerUpBound);

        // Window resize handling
        window.addEventListener('resize', () => this.handleResize());

        // Collision Event
        Events.on(this.engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                // Shake on impact
                this.shakeIntensity = 5;

                // Mark blocks as landed
                if (pair.bodyA.label === 'block') pair.bodyA.hasLanded = true;
                if (pair.bodyB.label === 'block') pair.bodyB.hasLanded = true;
            }
        });

        // Create runner
        this.runner = Runner.create();

        // Update loop extension for camera & game logic
        Events.on(this.runner, 'afterUpdate', () => this.update());

        // Run physics and renderer
        Render.run(this.render);
        Runner.run(this.runner, this.engine);

        // Custom rendering
        Events.on(this.render, 'afterRender', () => {
            if (this.drawHeightLine) this.drawHeightLine();
            if (this.drawGuideLine) this.drawGuideLine();
        });

        // Start first block
        this.createNewBlock();

        // Game loop
        this.gameLoop();
    }

    initWorld() {
        const Bodies = Matter.Bodies;
        const Composite = Matter.Composite;

        // Add bodies
        const platformWidth = 200;
        const ground = Bodies.rectangle(
            this.viewportWidth / 2,
            this.viewportHeight - 20,
            platformWidth,
            40,
            { isStatic: true, label: 'ground', render: { fillStyle: '#4a4a4a' } }
        );

        // Walls (none, allow falling off)

        Composite.add(this.engine.world, [ground]);
    }

    createNewBlock() {
        if (this.isGameOver) return;

        const Bodies = Matter.Bodies;
        const Composite = Matter.Composite;

        // Randomize size
        const width = 30 + Math.random() * 70;
        const height = 30 + Math.random() * 30;

        const hue = Math.random() * 360;
        const color = `hsl(${hue}, 80%, 60%)`;

        const viewTop = this.render.bounds.min.y;
        const startX = this.viewportWidth / 2;
        const startY = viewTop + 100; // 100px from top

        this.currentBlock = Bodies.rectangle(startX, startY, width, height, {
            isStatic: true, // Initially static (floating)
            isSensor: true, // Don't collide yet
            label: 'block',
            render: {
                fillStyle: color,
                strokeStyle: '#ffffff',
                lineWidth: 2
            }
        });

        Composite.add(this.engine.world, this.currentBlock);
    }

    handlePointerDown(e) {
        if (this.isGameOver || !this.currentBlock) return;
        this.isDragging = true;
        this.updateBlockPosition(e.clientX);
    }

    handlePointerMove(e) {
        if (this.isGameOver || !this.currentBlock || !this.isDragging) return;
        this.updateBlockPosition(e.clientX);
    }

    handlePointerUp(e) {
        if (this.isGameOver || !this.currentBlock || !this.isDragging) return;

        this.isDragging = false;
        this.releaseBlock();
    }

    updateBlockPosition(clientX) {
        if (!this.currentBlock) return;

        // Clamp X to screen bounds
        let x = clientX;
        const halfWidth = (this.currentBlock.bounds.max.x - this.currentBlock.bounds.min.x) / 2;

        if (x < halfWidth) x = halfWidth;
        if (x > this.viewportWidth - halfWidth) x = this.viewportWidth - halfWidth;

        const viewTop = this.render.bounds.min.y;
        const y = viewTop + 100; // Keep at top

        Matter.Body.setPosition(this.currentBlock, { x, y });
    }

    releaseBlock() {
        if (!this.currentBlock) return;

        console.log('Releasing block at:', this.currentBlock.position);

        // Capture properties from current block
        const { x, y } = this.currentBlock.position;
        // width/height are calculated from bounds because render.sprite might not exist
        const width = this.currentBlock.bounds.max.x - this.currentBlock.bounds.min.x;
        const height = this.currentBlock.bounds.max.y - this.currentBlock.bounds.min.y;
        const color = this.currentBlock.render.fillStyle;

        // Remove the static dragging block
        Matter.Composite.remove(this.engine.world, this.currentBlock);
        this.currentBlock = null;

        // Create a FRESH dynamic block at the same position
        // This ensures NO velocity/force history exists
        const Bodies = Matter.Bodies;
        const newBlock = Bodies.rectangle(x, y, width, height, {
            isStatic: false,
            isSensor: false,
            density: 0.001,
            friction: 0.5,
            restitution: 0.1,
            label: 'block',
            render: {
                fillStyle: color,
                strokeStyle: '#ffffff',
                lineWidth: 2
            }
        });

        // Add new block to world and logic
        Matter.Composite.add(this.engine.world, newBlock);
        this.blocks.push(newBlock);

        console.log('Spawned fresh block in world');

        if (this.soundManager) this.soundManager.playTap();

        // Spawn next block after delay
        setTimeout(() => this.createNewBlock(), 500);
    }

    update() {
        if (this.isGameOver) return;

        // Sync Pre-spawn block position with camera
        if (this.currentBlock && !this.blocks.includes(this.currentBlock)) {
            const viewTop = this.render.bounds.min.y;
            const y = viewTop + 100;
            Matter.Body.setPosition(this.currentBlock, { x: this.currentBlock.position.x, y });
            // Also need to stop velocity if it has any (shouldn't if static)
        }

        // 1. Check Game Over
        // Death line should be below the absolute ground level, regardless of camera
        const deathLine = this.viewportHeight + 100;

        for (const block of this.blocks) {
            if (block.position.y > deathLine) {
                console.log('Game Over triggered by block at', block.position.y);
                this.triggerGameOver();
                break;
            }
        }

        if (this.blocks.length === 0) return;

        // 2. Camera Logic & Score
        let minY = this.viewportHeight; // Reset to ground level for check
        if (this.highestBlockY !== undefined && this.highestBlockY < minY) {
            minY = this.highestBlockY;
        }

        // Check all blocks
        // Only track blocks that have settled (low speed) AND have landed to prevent camera from following falling blocks
        for (const block of this.blocks) {
            if (block.hasLanded && block.speed < 0.5 && block.position.y < minY) {
                minY = block.position.y;
            }
        }

        this.highestBlockY = minY;

        // Calculate Score (Height in "meters")
        // Ground top is initial viewportHeight - 40
        // We need a fixed ground reference.
        const groundTop = this.viewportHeight - 40;
        const pixelsPerMeter = 100;

        let heightPixels = groundTop - (minY - 25); // Approximate top
        if (heightPixels < 0) heightPixels = 0;

        const currentScore = (heightPixels / pixelsPerMeter).toFixed(2);
        const scoreNum = parseFloat(currentScore);

        // Update Max Score
        if (scoreNum > parseFloat(this.maxScore)) {
            this.maxScore = currentScore;
        }

        this.ui.updateScore(this.maxScore + 'm');

        // Update BGM Tension
        // Calculate ratio: 0 at 0m, 1.0 at 10m (Max tension)
        const tensionRatio = Math.min(1.0, scoreNum / 10);
        this.soundManager.setTension(tensionRatio);

        // Camera logic: Follow the highest block
        const currentTop = this.render.bounds.min.y;

        // Desired top: Keep highest block at 50% of screen height (more lenient)
        // User requested "wait until 2/3 stacked", so 50% is a safer start than 40% (higher up).
        const targetBlockScreenY = minY - currentTop; // Block Y relative to screen top
        const desiredScreenY = this.viewportHeight * 0.5;

        // If block is below desired line (targetBlockScreenY > desiredScreenY), we don't scroll down
        // If block is above (targetBlockScreenY < desiredScreenY), we scroll up (decrease currentTop)

        let newTop = currentTop;
        if (targetBlockScreenY < desiredScreenY) {
            newTop = currentTop + (targetBlockScreenY - desiredScreenY) * 0.1; // Smooth scroll
        }

        // Limit camera to ground level at bottom
        if (newTop > 0) newTop = 0;

        // Update bounds
        Matter.Bounds.shift(this.render.bounds, {
            x: 0,
            y: newTop
        });

        // 3. Screen Shake Logic
        let shakeX = 0;
        let shakeY = 0;
        if (this.shakeIntensity > 0) {
            shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= 0.9; // Decay
            if (this.shakeIntensity < 0.5) this.shakeIntensity = 0;
        }

        // Apply shake on top of camera position
        Matter.Bounds.shift(this.render.bounds, {
            x: shakeX,
            y: newTop + shakeY
        });
    }

    drawHeightLine() {
        if (!this.highestBlockY) return;

        const ctx = this.render.context;
        const y = this.highestBlockY - 25; // Render top of block assumption

        // Ensure line is within view
        // Note: ctx is already transformed by Render, so we draw in World Coordinates?
        // Yes, Matter.Render transforms the context.

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.viewportWidth, y);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // Draw text near the line
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Current Height', 10, y - 5);
    }

    drawGuideLine() {
        if (!this.currentBlock) return;

        const ctx = this.render.context;
        const x = this.currentBlock.position.x;
        const y = this.currentBlock.position.y;
        const bottomY = this.render.bounds.max.y; // To bottom of screen

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, bottomY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    triggerGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.ui.showGameOver(
            this.maxScore + 'm',
            () => this.restart(),
            () => this.backToTitle()
        );
    }

    restart() {
        this.cleanup();
        this.resetState();
        this.startGame();
    }

    backToTitle() {
        this.cleanup();
        this.resetState();
        this.showTitle();
    }

    resetState() {
        this.blocks = [];
        this.isGameOver = false;
        this.lastSpawnTime = 0;
        this.cameraY = 0;
        this.shakeIntensity = 0;
        this.highestBlockY = this.viewportHeight;
        this.maxScore = '0.00';
        this.ui.updateScore('0.00m');
        this.soundManager.setTension(0); // Reset tempo
    }

    cleanup() {
        this.soundManager.stopBGM(); // Silence
        if (this.runner) Matter.Runner.stop(this.runner);
        if (this.render) {
            Matter.Render.stop(this.render);
            this.render.canvas.remove();
            this.render.canvas = null;
            this.render.context = null;
            this.render.textures = {};
        }
        if (this.engine) Matter.Engine.clear(this.engine);

        // Remove listeners if bound
        if (this.handlePointerDownBound) {
            this.root.removeEventListener('pointerdown', this.handlePointerDownBound);
            this.root.removeEventListener('pointermove', this.handlePointerMoveBound);
            this.root.removeEventListener('pointerup', this.handlePointerUpBound);
            this.root.removeEventListener('pointerleave', this.handlePointerUpBound);
        }

        this.render = null;
        this.runner = null;
        this.engine = null;
        this.blocks = [];
        this.currentBlock = null;
    }

    handleResize() {
        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;
        if (this.render) {
            this.render.canvas.width = this.viewportWidth;
            this.render.canvas.height = this.viewportHeight;
        }
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        // update() is called by physics runner
    }
}
