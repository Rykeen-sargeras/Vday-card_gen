// Main Application Logic
// Handles card generation, sounds, and user interactions

// Configuration
const HOSTS_URL = '/hosts.json';
const CARDS_URL = '/cards.json';

let hosts = [];
let cards = [];

// Sound Management
class SoundManager {
    constructor() {
        this.sounds = {
            click: document.getElementById('clickSound'),
            generate: document.getElementById('generateSound'),
            screenshot: document.getElementById('screenshotSound')
        };
        this.enabled = true;
    }

    play(soundName) {
        if (this.enabled && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(e => {
                console.log('Sound play prevented:', e);
            });
        }
    }

    toggle() {
        this.enabled = !this.enabled;
    }
}

const soundManager = new SoundManager();

// Load data from GitHub
async function loadData() {
    try {
        const hostsResponse = await fetch(HOSTS_URL);
        hosts = await hostsResponse.json();
        
        const cardsResponse = await fetch(CARDS_URL);
        cards = await cardsResponse.json();

        populateDropdown();
        console.log('✅ Data loaded successfully!');
    } catch (error) {
        console.error('❌ Error loading data:', error);
        
        // Show friendly error message
        const display = document.getElementById('cardDisplay');
        display.innerHTML = `
            <div class="placeholder">
                <div class="placeholder-heart">😢</div>
                <p>Oops! Couldn't load data.</p>
                <p style="font-size: 0.8em; margin-top: 20px;">Make sure your GitHub URLs are correct!</p>
            </div>
        `;
    }
}

function populateDropdown() {
    const dropdown = document.getElementById('hostDropdown');
    dropdown.innerHTML = '';
    
    hosts.forEach(host => {
        const option = document.createElement('div');
        option.className = 'host-option';
        option.textContent = host.name;
        option.onclick = () => {
            soundManager.play('click');
            generateWithHost(host);
        };
        dropdown.appendChild(option);
    });
}

function toggleDropdown() {
    soundManager.play('click');
    const dropdown = document.getElementById('hostDropdown');
    dropdown.classList.toggle('show');
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateRandom10() {
    soundManager.play('generate');
    
    if (hosts.length === 0 || cards.length === 0) {
        alert('Please wait for data to load!');
        return;
    }
    
    const randomHost = getRandomItem(hosts);
    const randomCard = getRandomItem(cards);
    displayCard(randomHost, randomCard);
    document.getElementById('hostDropdown').classList.remove('show');
    
    // Trigger celebration effects
    if (window.heartsManager) {
        window.heartsManager.celebrateCardGeneration();
    }
    if (window.sparkleEffect) {
        window.sparkleEffect.burst(window.innerWidth / 2, window.innerHeight / 2, 30);
    }
}

function generateWithHost(host) {
    soundManager.play('generate');
    
    if (cards.length === 0) {
        alert('Please wait for cards to load!');
        return;
    }
    
    const randomCard = getRandomItem(cards);
    displayCard(host, randomCard);
    document.getElementById('hostDropdown').classList.remove('show');
    
    // Trigger celebration effects
    if (window.heartsManager) {
        window.heartsManager.celebrateCardGeneration();
    }
    if (window.sparkleEffect) {
        window.sparkleEffect.burst(window.innerWidth / 2, window.innerHeight / 2, 30);
    }
}

function displayCard(host, cardUrl) {
    const display = document.getElementById('cardDisplay');
    
    // Show loading state
    display.innerHTML = '<div class="loading">💕</div>';
    
    // Store current card data for screenshot
    window._currentCard = { host, cardUrl };
    
    // Create card after brief delay for effect
    setTimeout(() => {
        display.innerHTML = `
            <div class="card-content">
                <div class="card-capture-area" id="cardCaptureArea">
                    <div class="card-banner">
                        <div class="banner-left">
                            <img src="${host.image}" 
                                 alt="${host.name}" 
                                 class="banner-host-image"
                                 onerror="this.style.display='none'">
                        </div>
                        <div class="banner-right">
                            <div class="banner-to">TO:</div>
                            <div class="banner-name">${host.name}</div>
                        </div>
                    </div>
                    <div class="card-image-wrapper">
                        <img src="${cardUrl}" 
                             alt="Valentine Card" 
                             class="card-image"
                             onerror="this.alt='Card failed to load'">
                    </div>
                </div>
                <button class="screenshot-btn" onclick="takeScreenshot()">
                    📸 Screenshot & Download
                </button>
            </div>
        `;
    }, 300);
}

async function takeScreenshot() {
    soundManager.play('screenshot');
    
    const cardData = window._currentCard;
    if (!cardData) {
        alert('Please generate a card first!');
        return;
    }
    
    const button = document.querySelector('.screenshot-btn');
    const originalText = button.innerHTML;
    button.innerHTML = '📸 Saving...';
    button.disabled = true;
    
    try {
        // Load both images first
        const [hostImg, cardImg] = await Promise.all([
            loadImage(cardData.host.image),
            loadImage(cardData.cardUrl)
        ]);
        
        // Canvas dimensions — card width drives everything
        const CARD_WIDTH = cardImg.naturalWidth * 2; // 2x for quality
        const CARD_HEIGHT = cardImg.naturalHeight * 2;
        const BANNER_HEIGHT = 120; // matches the CSS banner height feel
        const TOTAL_WIDTH = CARD_WIDTH;
        const TOTAL_HEIGHT = BANNER_HEIGHT + CARD_HEIGHT;
        
        const canvas = document.createElement('canvas');
        canvas.width = TOTAL_WIDTH;
        canvas.height = TOTAL_HEIGHT;
        const ctx = canvas.getContext('2d');
        
        // --- Draw Banner ---
        const gradient = ctx.createLinearGradient(0, 0, TOTAL_WIDTH, BANNER_HEIGHT);
        gradient.addColorStop(0, '#ff006e');
        gradient.addColorStop(1, '#8338ec');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, TOTAL_WIDTH, BANNER_HEIGHT);
        
        // Draw host avatar (circular clipped)
        const avatarSize = 80;
        const avatarX = 24;
        const avatarY = (BANNER_HEIGHT - avatarSize) / 2;
        
        ctx.save();
        // White ring behind avatar
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        // Clip to circle and draw host image
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(hostImg, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
        
        // Draw "TO:" text
        const textX = avatarX + avatarSize + 20;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 22px "Fredoka One", "Comic Sans MS", cursive';
        ctx.fillText('TO:', textX, avatarY + 28);
        
        // Draw host name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px "Fredoka One", "Comic Sans MS", cursive';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(cardData.host.name, textX, avatarY + 76);
        ctx.shadowColor = 'transparent';
        
        // --- Draw Card Image ---
        ctx.drawImage(cardImg, 0, BANNER_HEIGHT, CARD_WIDTH, CARD_HEIGHT);
        
        // --- Export ---
        canvas.toBlob((blob) => {
            if (!blob) {
                throw new Error('Canvas toBlob returned null');
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            link.download = `groovy-vday-card-${cardData.host.name}-${timestamp}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
            // Sparkle burst on success
            if (window.sparkleEffect) {
                const rect = button.getBoundingClientRect();
                window.sparkleEffect.burst(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    40
                );
            }
            
            button.innerHTML = '✅ Saved!';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 1500);
        }, 'image/png');
        
    } catch (error) {
        console.error('Screenshot error:', error);
        alert('Error creating screenshot. Please try generating the card again.');
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Helper: load an image as a promise
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

// Button interaction effects
function addButtonEffects() {
    const buttons = document.querySelectorAll('.groovy-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            soundManager.play('click');
        });
        
        button.addEventListener('click', (e) => {
            // Create ripple effect
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            width: 20px;
            height: 20px;
            opacity: 1;
        }
        100% {
            width: 200px;
            height: 200px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.btn-20') && !e.target.closest('.host-dropdown')) {
        document.getElementById('hostDropdown').classList.remove('show');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === '1' && !e.ctrlKey && !e.metaKey) {
        generateRandom10();
    } else if (e.key === '2' && !e.ctrlKey && !e.metaKey) {
        toggleDropdown();
    } else if (e.key === 'Escape') {
        document.getElementById('hostDropdown').classList.remove('show');
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    addButtonEffects();
    
    console.log('🎉 Valentine Card Generator Ready!');
    console.log('💡 Keyboard shortcuts: Press 1 for $10, Press 2 for $20');
});

// Prevent accidental page refresh
window.addEventListener('beforeunload', (e) => {
    const cardDisplay = document.getElementById('cardDisplay');
    if (cardDisplay && cardDisplay.querySelector('.card-content')) {
        e.preventDefault();
        e.returnValue = '';
    }
});
