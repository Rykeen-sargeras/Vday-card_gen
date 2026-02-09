// Hearts Animation System
// Creates random floating hearts on user interactions

class HeartsManager {
    constructor() {
        this.container = document.getElementById('heartsContainer');
        this.heartEmojis = ['💕', '💖', '💗', '💓', '💝', '💘', '❤️', '🧡', '💛', '💚', '💙', '💜'];
        this.init();
    }

    init() {
        // Create hearts on button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.groovy-button, .host-option, .screenshot-btn')) {
                this.createHeartBurst(e.clientX, e.clientY, 5);
            }
        });

        // Random ambient hearts
        this.startAmbientHearts();
    }

    createHeart(x, y, delay = 0) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = this.getRandomHeart();
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.animationDelay = `${delay}s`;
        
        // Random slight variations
        const randomX = (Math.random() - 0.5) * 100;
        heart.style.setProperty('--random-x', `${randomX}px`);
        
        this.container.appendChild(heart);

        // Remove heart after animation
        setTimeout(() => {
            heart.remove();
        }, 8000);
    }

    createHeartBurst(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 80;
            const offsetY = (Math.random() - 0.5) * 80;
            this.createHeart(x + offsetX, y + offsetY, i * 0.1);
        }
    }

    getRandomHeart() {
        return this.heartEmojis[Math.floor(Math.random() * this.heartEmojis.length)];
    }

    startAmbientHearts() {
        setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight + 50;
            this.createHeart(x, y);
        }, 2000); // Create a heart every 2 seconds
    }

    // Create hearts when card is generated
    celebrateCardGeneration() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Create a big burst of hearts
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const radius = 100 + Math.random() * 100;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            this.createHeart(x, y, i * 0.05);
        }
    }
}

// Initialize hearts manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.heartsManager = new HeartsManager();
});
