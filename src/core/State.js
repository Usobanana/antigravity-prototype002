export class State {
    constructor() {
        this.count = 0;
        this.listeners = [];
    }

    increment() {
        this.count++;
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.count));
    }
}
