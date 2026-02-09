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
    
    // Create card after brief delay for effect
    setTimeout(() => {
        display.innerHTML = `
            <div class="card-content">
                <div class="card-banner">
                    <div class="banner-left">
                        <img src="${host.image}" 
                             alt="${host.name}" 
                             class="banner-host-image" 
                             crossorigin="anonymous"
                             onerror="this.src='https://via.placeholder.com/80?text=${host.name}'">
                    </div>
                    <div class="banner-right">
                        <div class="banner-to">TO:</div>
                        <div class="banner-name">${host.name}</div>
                    </div>
                </div>
                <div class="card-with-banner">
                    <img src="${cardUrl}" 
                         alt="Valentine Card" 
                         class="card-image" 
                         crossorigin="anonymous"
                         onerror="this.src='https://via.placeholder.com/700x500?text=Card'">
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
    
    const cardElement = document.querySelector('.card-with-banner');
    const bannerElement = document.querySelector('.card-banner');
    
    if (!cardElement || !bannerElement) {
        alert('Please generate a card first!');
        return;
    }
    
    const button = document.querySelector('.screenshot-btn');
    
    // Change button text
    const originalText = button.innerHTML;
    button.innerHTML = '📸 Saving...';
    button.disabled = true;
    
    // Create a wrapper div with both banner and card
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-block; background: white;';
    wrapper.appendChild(bannerElement.cloneNode(true));
    wrapper.appendChild(cardElement.cloneNode(true));
    
    // Temporarily add to document
    document.body.appendChild(wrapper);
    
    try {
        const canvas = await html2canvas(wrapper, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
        });
        
        // Remove temporary wrapper
        document.body.removeChild(wrapper);
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            link.download = `groovy-vday-card-${timestamp}.png`;
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
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
        });
    } catch (error) {
        console.error('Screenshot error:', error);
        
        // Remove temporary wrapper if it exists
        if (document.body.contains(wrapper)) {
            document.body.removeChild(wrapper);
        }
        
        alert('Error taking screenshot. Make sure images are loaded!');
        button.innerHTML = originalText;
        button.disabled = false;
    }
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
