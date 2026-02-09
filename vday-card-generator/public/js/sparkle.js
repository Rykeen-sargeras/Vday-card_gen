// Sparkle Effect on Cursor Movement
// Creates sparkles that follow the cursor

class SparkleEffect {
    constructor() {
        this.canvas = document.getElementById('sparkleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.sparkles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.colors = ['#ff006e', '#8338ec', '#3a86ff', '#fb5607', '#06ffa5', '#ffbe0b'];
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.createSparkle(e.clientX, e.clientY);
        });

        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createSparkle(x, y) {
        // Only create sparkles occasionally to avoid performance issues
        if (Math.random() > 0.7) {
            const sparkle = {
                x: x,
                y: y,
                size: Math.random() * 3 + 2,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                life: 1,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            };
            this.sparkles.push(sparkle);
        }
    }

    animate() {
        // Clear with transparency for fade effect
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw sparkles
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            const sparkle = this.sparkles[i];
            
            // Update position
            sparkle.x += sparkle.speedX;
            sparkle.y += sparkle.speedY;
            sparkle.life -= 0.02;
            sparkle.size *= 0.97;

            // Remove dead sparkles
            if (sparkle.life <= 0 || sparkle.size < 0.5) {
                this.sparkles.splice(i, 1);
                continue;
            }

            // Draw sparkle
            this.ctx.save();
            this.ctx.globalAlpha = sparkle.life;
            this.ctx.fillStyle = sparkle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = sparkle.color;
            
            // Draw star shape
            this.drawStar(sparkle.x, sparkle.y, 5, sparkle.size, sparkle.size / 2);
            
            this.ctx.restore();
        }

        requestAnimationFrame(() => this.animate());
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }

    burst(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 3 + Math.random() * 3;
            const sparkle = {
                x: x,
                y: y,
                size: Math.random() * 4 + 3,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                life: 1,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            };
            this.sparkles.push(sparkle);
        }
    }
}

// Initialize sparkle effect when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sparkleEffect = new SparkleEffect();
});
