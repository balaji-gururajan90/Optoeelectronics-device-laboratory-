// ===================================
// TFT Lab Website - Sputtering Process Animation
// Narrative: Plasma -> Sputtering -> Film Growth -> Devices -> Energy
// ===================================

class SputteringAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.particles = [];
        this.films = [];
        this.devices = [];
        this.energyBeams = [];

        // Animation State
        this.phase = 'ignition'; // ignition, plume, deposition, patterning, operation
        this.phaseTimer = 0;
        this.cycleDuration = 800; // frames per full cycle

        // Configuration
        this.colors = {
            plasma: ['#00D9FF', '#7C3AED', '#FFFFFF'], // Cyan, Purple, White
            film: '#10B981', // Greenish teal for film
            device: '#F59E0B', // Amber for devices
            energy: '#FFFF00' // Yellow for energy
        };

        window.addEventListener('resize', () => this.resize());
        this.init();
        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.targetY = this.height * 0.2; // Target position (top)
        this.substrateY = this.height * 0.8; // Substrate position (bottom)
    }

    init() {
        this.resetCycle();
    }

    resetCycle() {
        this.phase = 'ignition';
        this.phaseTimer = 0;
        this.particles = [];
        this.films = [];
        this.devices = [];
        this.energyBeams = [];
    }

    // --- HELPER FUNCTIONS ---

    randomColor(palette) {
        return palette[Math.floor(Math.random() * palette.length)];
    }

    // --- PHASE MANAGEMENT ---

    updatePhase() {
        this.phaseTimer++;

        // Phase transitions based on timer
        if (this.phase === 'ignition' && this.phaseTimer > 100) {
            this.phase = 'plume';
        } else if (this.phase === 'plume' && this.phaseTimer > 300) {
            this.phase = 'deposition';
        } else if (this.phase === 'deposition' && this.phaseTimer > 500) {
            this.phase = 'patterning';
        } else if (this.phase === 'patterning' && this.phaseTimer > 650) {
            this.phase = 'operation';
        } else if (this.phase === 'operation' && this.phaseTimer > this.cycleDuration) {
            // Fade out and restart
            if (this.phaseTimer > this.cycleDuration + 60) {
                this.resetCycle();
            }
        }
    }

    // --- PARTICLE SYSTEMS ---

    spawnPlasmaParticle() {
        // High energy ions striking target at top
        const x = this.width * 0.4 + Math.random() * this.width * 0.2;
        const y = this.targetY + (Math.random() - 0.5) * 20;

        this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            type: 'ion',
            color: this.randomColor(this.colors.plasma),
            size: Math.random() * 3 + 1
        });
    }

    spawnSputteredAtom() {
        // Atoms ejected from target moving down to substrate
        const x = this.width * 0.45 + Math.random() * this.width * 0.1;
        const y = this.targetY + 10;

        // Spread out as they go down
        const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        const speed = 3 + Math.random() * 2;

        this.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed * (Math.random() - 0.5) * 1.5, // Spread X
            vy: Math.abs(Math.sin(angle) * speed), // Always down
            life: 1.0,
            type: 'atom',
            color: this.colors.plasma[0], // Cyan
            size: 2
        });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.01;

            // Behavior based on type
            if (p.type === 'atom') {
                // If hits substrate
                if (p.y >= this.substrateY) {
                    // Create film deposit at this X
                    if (this.phase === 'deposition' || this.phase === 'plume') {
                        this.addFilmDeposit(p.x);
                    }
                    this.particles.splice(i, 1);
                    continue;
                }
            } else if (p.type === 'ion') {
                // Friction
                p.vx *= 0.95;
                p.vy *= 0.95;
            }

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Glow
            if (p.type === 'ion' || p.type === 'device_active') {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = p.color;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
            this.ctx.globalAlpha = 1.0;
        });
    }

    // --- FILM & DEVICE LOGIC ---

    addFilmDeposit(x) {
        // Simple height map or just particles sticking? 
        // Let's settle particles on a grid.
        const gridX = Math.round(x / 5) * 5;
        // Don't overfill
        const existing = this.films.find(f => Math.abs(f.x - gridX) < 1);

        if (existing) {
            existing.height = Math.min(existing.height + 2, 10);
            existing.alpha = Math.min(existing.alpha + 0.1, 1.0);
        } else {
            this.films.push({
                x: gridX,
                y: this.substrateY,
                height: 2,
                alpha: 0.5,
                color: this.colors.film
            });
        }
    }

    morphToDevices() {
        // Transform film chunks into device shapes (rectangles)
        // This is a one-time visual transition effect
        if (this.devices.length === 0) {
            // Create ideal device positions
            const deviceCount = 5;
            const spacing = this.width / (deviceCount + 1);

            for (let i = 1; i <= deviceCount; i++) {
                this.devices.push({
                    x: spacing * i,
                    y: this.substrateY - 10,
                    w: 40,
                    h: 10, // Starts flat
                    targetH: 30, // Grows up
                    progress: 0,
                    active: false
                });
            }

            // Clear raw film data to "consume" it
            this.films = [];
        }

        // Animate device growth
        this.devices.forEach(d => {
            if (d.progress < 1) {
                d.progress += 0.02;
                d.h = 10 + (d.targetH - 10) * d.progress;
            }
        });
    }

    generateEnergy() {
        // Emit particles/beams from active devices
        if (Math.random() < 0.2) {
            this.devices.forEach(d => {
                this.energyBeams.push({
                    x: d.x,
                    y: d.y - d.h,
                    vy: -2 - Math.random() * 2, // Upwards
                    life: 1.0,
                    size: Math.random() * 2 + 1
                });
            });
        }
    }

    updateAndDrawAndEnergy() {
        for (let i = this.energyBeams.length - 1; i >= 0; i--) {
            let b = this.energyBeams[i];
            b.y += b.vy;
            b.life -= 0.015;

            if (b.life <= 0) {
                this.energyBeams.splice(i, 1);
                continue;
            }

            this.ctx.globalAlpha = b.life;
            this.ctx.fillStyle = this.colors.energy;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.colors.energy;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            this.ctx.globalAlpha = 1.0;
        }
    }

    drawFilmAndDevices() {
        // Draw raw film
        this.films.forEach(f => {
            this.ctx.fillStyle = f.color;
            this.ctx.globalAlpha = f.alpha;
            this.ctx.fillRect(f.x - 2, f.y - f.height, 5, f.height);
            this.ctx.globalAlpha = 1.0;
        });

        // Draw devices
        this.devices.forEach(d => {
            const opacity = d.progress;
            this.ctx.fillStyle = this.colors.device;
            this.ctx.globalAlpha = opacity;

            // Device body
            this.ctx.fillRect(d.x - d.w / 2, d.y - d.h, d.w, d.h);

            // Circuit lines details
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(d.x - d.w / 4, d.y - d.h + 5, 2, d.h - 10);
            this.ctx.fillRect(d.x + d.w / 4, d.y - d.h + 5, 2, d.h - 10);

            this.ctx.globalAlpha = 1.0;
        });
    }

    drawUI() {
        // Optional: Draw text indicating phase
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.fillText(`PHASE: ${this.phase.toUpperCase()}`, 20, this.height - 20);
    }

    // --- MAIN LOOP ---

    animate() {
        // Clear with fade effect for trails
        this.ctx.fillStyle = 'rgba(10, 15, 30, 0.2)'; // Dark blue background fade
        // Actually, we want a transparent clear to let the CSS background show through, 
        // BUT we want trails. 
        // Since the CSS handles the gradient background, we should use clearRect but maybe simulate trails?
        // Let's just use clearRect for clean look suitable for "sleek scientific".
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.updatePhase();

        // 1. IGNITION: Plasma sparkles at top
        if (this.phase === 'ignition') {
            if (Math.random() > 0.5) this.spawnPlasmaParticle();
        }

        // 2. PLUME: Atoms flow down
        if (this.phase === 'plume' || this.phase === 'deposition') {
            for (let i = 0; i < 3; i++) this.spawnSputteredAtom(); // Heavy flow
        }

        // 3. DEPOSITION: already handled by atom impact logic in updateParticles

        // 4. PATTERNING: Morph film to devices
        if (this.phase === 'patterning' || this.phase === 'operation') {
            this.morphToDevices();
        }

        // 5. OPERATION: Devices emit energy
        if (this.phase === 'operation') {
            this.generateEnergy();
        }

        this.updateParticles();

        // Draw everything
        this.drawFilmAndDevices();
        this.drawParticles();
        this.updateAndDrawAndEnergy();

        // Draw Target and Substrate Lines (Visual anchors)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        // Target
        this.ctx.beginPath();
        this.ctx.moveTo(this.width * 0.2, this.targetY);
        this.ctx.lineTo(this.width * 0.8, this.targetY);
        this.ctx.stroke();

        // Substrate
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.substrateY);
        this.ctx.lineTo(this.width, this.substrateY);
        this.ctx.stroke();

        // this.drawUI(); // Debug only

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SputteringAnimation('hero-background');
    });
} else {
    new SputteringAnimation('hero-background');
}
