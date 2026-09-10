class PhysicsParticleWave {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.isQuoteCanvas = canvasId === 'quote-waves';
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        const parent = this.canvas.parentElement;
        const width = parent ? parent.offsetWidth : window.innerWidth;
        const height = parent ? parent.offsetHeight : window.innerHeight;
        const scale = window.devicePixelRatio || 1;

        this.canvas.width = width * scale;
        this.canvas.height = height * scale;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
        this.width = width;
        this.height = height;
    }

    waveY(x, lane, amplitude, phaseOffset = 0) {
        const center = this.height * (0.34 + lane * 0.16);
        const frequency = this.isQuoteCanvas ? 0.012 : 0.007;
        const phase = this.time * (1.6 + lane * 0.2) + phaseOffset;
        return center
            + Math.sin(x * frequency + phase) * amplitude
            + Math.sin(x * frequency * 0.42 - phase * 0.7) * amplitude * 0.32;
    }

    drawGlow() {
        const gradient = this.ctx.createRadialGradient(
            this.width * 0.48,
            this.height * 0.52,
            0,
            this.width * 0.48,
            this.height * 0.52,
            Math.max(this.width, this.height) * 0.76
        );

        gradient.addColorStop(0, 'rgba(0, 217, 255, 0.08)');
        gradient.addColorStop(0.48, 'rgba(16, 185, 129, 0.04)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawWaveLane(lane, amplitude, alpha) {
        const hue = lane % 2 === 0 ? '0, 217, 255' : '16, 185, 129';
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, `rgba(${hue}, 0)`);
        gradient.addColorStop(0.18, `rgba(${hue}, ${alpha * 0.55})`);
        gradient.addColorStop(0.5, `rgba(220, 252, 255, ${alpha})`);
        gradient.addColorStop(0.82, `rgba(${hue}, ${alpha * 0.55})`);
        gradient.addColorStop(1, `rgba(${hue}, 0)`);

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = this.isQuoteCanvas ? 1.35 : 0.9;
        this.ctx.beginPath();

        for (let x = -20; x <= this.width + 20; x += 8) {
            const y = this.waveY(x, lane, amplitude);
            if (x === -20) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
    }

    drawCarrier(x, y, radius, alpha, accent = '0, 217, 255') {
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(${accent}, ${alpha * 0.14})`;
        this.ctx.arc(x, y, radius * 3.8, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(238, 253, 255, ${alpha * 0.52})`;
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawAtomNode(x, y, size, alpha) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(this.time * 0.85 + x * 0.002);
        this.ctx.strokeStyle = `rgba(125, 249, 255, ${alpha * 0.24})`;
        this.ctx.lineWidth = 1;

        for (let orbit = 0; orbit < 3; orbit++) {
            this.ctx.save();
            this.ctx.rotate((Math.PI / 3) * orbit);
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, size * 2.2, size * 0.72, 0, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }

        this.drawCarrier(0, 0, size * 0.42, alpha, '16, 185, 129');
        this.ctx.restore();
    }

    drawParticles() {
        const lanes = this.isQuoteCanvas ? 4 : 6;
        const particlesPerLane = this.isQuoteCanvas ? 11 : 18;

        for (let lane = 0; lane < lanes; lane++) {
            const amplitude = (this.isQuoteCanvas ? 26 : 42) + lane * 3;
            this.drawWaveLane(lane, amplitude, this.isQuoteCanvas ? 0.26 : 0.14);

            let previous = null;
            for (let i = 0; i < particlesPerLane; i++) {
                const progress = (i / particlesPerLane + this.time * (0.045 + lane * 0.006)) % 1;
                const x = progress * (this.width + 80) - 40;
                const y = this.waveY(x, lane, amplitude, lane * 0.45);
                const depth = 0.62 + Math.sin(progress * Math.PI * 2 + this.time * 2) * 0.22;
                const alpha = this.isQuoteCanvas ? depth * 0.38 : depth * 0.25;
                const radius = this.isQuoteCanvas ? 2.1 + depth * 0.6 : 1.2 + depth * 0.5;
                const accent = lane % 2 === 0 ? '0, 217, 255' : '16, 185, 129';

                if (previous) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(148, 220, 235, ${alpha * 0.08})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(previous.x, previous.y);
                    this.ctx.lineTo(x, y);
                    this.ctx.stroke();
                }

                if (i % 5 === 0 && this.isQuoteCanvas) {
                    this.drawAtomNode(x, y, radius * 2.2, alpha * 0.46);
                } else {
                    this.drawCarrier(x, y, radius, alpha, accent);
                }

                previous = { x, y };
            }
        }
    }

    animate() {
        this.time += 0.016;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawGlow();
        this.ctx.globalCompositeOperation = 'lighter';
        this.drawParticles();
        this.ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(() => this.animate());
    }
}

function startHeroWaves() {
    if (window.__physicsParticleWaveStarted) return;
    window.__physicsParticleWaveStarted = true;
    new PhysicsParticleWave('hero-waves');
    new PhysicsParticleWave('quote-waves');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startHeroWaves);
} else {
    startHeroWaves();
}
