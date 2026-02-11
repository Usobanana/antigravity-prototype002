export class CounterDisplay {
    constructor(state, rootElement) {
        this.state = state;
        this.root = rootElement;
        this.element = document.createElement('div');
        this.init();
    }

    init() {
        // Styling for the container to take full screen and center content
        this.element.style.display = 'flex';
        this.element.style.flexDirection = 'column';
        this.element.style.justifyContent = 'center';
        this.element.style.alignItems = 'center';
        this.element.style.width = '100vw';
        this.element.style.height = '100vh';
        this.element.style.cursor = 'pointer';

        // Count display
        this.countText = document.createElement('h1');
        this.countText.style.fontSize = '4rem';
        this.countText.style.userSelect = 'none'; // Prevent text selection on rapid taps
        this.countText.textContent = this.state.count;

        // Instruction text
        this.instruction = document.createElement('p');
        this.instruction.textContent = 'Tap anywhere to increment';
        this.instruction.style.opacity = '0.7';
        this.instruction.style.marginTop = '1rem';

        this.element.appendChild(this.countText);
        this.element.appendChild(this.instruction);
        this.root.appendChild(this.element);

        // Bind events
        this.element.addEventListener('pointerdown', () => {
            // Use pointerdown for faster response than click on mobile
            this.handleTap();
        });

        // Subscribe to state changes
        this.state.subscribe((newCount) => {
            this.updateDisplay(newCount);
        });
    }

    handleTap() {
        this.state.increment();

        // Simple scale effect
        this.countText.style.transform = 'scale(1.2)';
        this.countText.style.transition = 'transform 0.05s ease-out';

        setTimeout(() => {
            this.countText.style.transform = 'scale(1)';
        }, 50);
    }

    updateDisplay(count) {
        this.countText.textContent = count;
    }
}
