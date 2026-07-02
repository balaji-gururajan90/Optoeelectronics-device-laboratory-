/**
 * 3D Particle Wave Animation
 * Renders a grid of particles with perspective projection to create a depth wave effect.
 * Dynamically scales to fill the viewport.
 * Features separate "flow" movement and "wave" undulation.
 */

class WaveAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        // Default parameters (will be updated in resize)
        this.fov = 600;
        this.spacing = 80; // Nice wide spacing
        this.time = 0;

        this.resize();

        // Bind resize event
        window.addEventListener('resize', () => this.resize());

        // Start animation loop
        this.animate();
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent ? parent.offsetWidth : window.innerWidth;
        this.canvas.height = parent ? parent.offsetHeight : window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;

        // Dynamic Grid Calculation
        // Calculate how many particles we need to cover the screen width at the "back" of the grid
        const maxDepth = 2000;
        const scaleAtDepth = this.fov / (this.fov + maxDepth);
        const requiredWorldWidth = this.canvas.width / scaleAtDepth;

        this.countX = Math.ceil(requiredWorldWidth / this.spacing) + 10;
        this.countZ = 50; // Enough depth for the flow effect

        // Center the grid's X origin
        this.startX = -(this.countX * this.spacing) / 2;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Additive blending for "glow" effect
        this.ctx.globalCompositeOperation = 'screen';

        // Update time - Faster for visibility
        this.time += 0.1;

        const waveHeight = 300; // Taller waves
        const speed = this.time * 0.1; // Wave oscillation speed
        const flowSpeed = this.time * 3; // Forward flight speed

        // Center point for grid depth
        const centerZ = 1200;

        for (let z = 0; z < this.countZ; z++) {
            // Calculate base Z position
            // We add flowSpeed to make it move forward
            // The % (modulo) creates the endless loop effect
            // We subtract from a large number to keep the modulo positive/consistent
            // or just modulo the spacing.

            // Raw Z without flow
            let rawZ = (z - this.countZ / 2) * this.spacing;

            // Add flow. We want particles to move towards camera (negative Z direction relative to grid, or decrease Z distance)
            // Let's say particles exist at Z: 0, 100, 200...
            // We want them to become -10, 90, 190...

            let flowOffset = flowSpeed % (this.countZ * this.spacing);

            // We want the grid to move towards us, so we subtract offset
            let pz = rawZ - flowOffset;

            // Wrap around: if point gets too close (or behind), move it to back
            // Actually simpler: just offset the Z index
            // But let's stick to the physical offset logic loop
            // Infinite scroll logic:
            // position = (base_index * spacing + time_offset) % total_length

            // Let's restart Z calculation for infinite flow
            // range of grid z: from approx -1000 to +1000 relative to centerZ
            // Total depth length
            const totalDepth = this.countZ * this.spacing;

            // Current Z relative to start
            let currentZ = (z * this.spacing + flowSpeed) % totalDepth;

            // Shift to be centered
            // Start from back (max Z) and come forward
            // We want range [centerZ - depth/2, centerZ + depth/2]
            // Let's make particles flow from back (positive Z) to front (negative Z)

            // Z position relative to camera
            let finalZ = (centerZ + totalDepth / 2) - currentZ;


            let scale = this.fov / (this.fov + finalZ);
            if (scale < 0) continue;

            // Fade out distant particles AND very close particles
            // Simple linear fog
            let startFog = 1500;
            let endFog = centerZ + totalDepth / 2;

            let opacity = 1 - (finalZ - startFog) / (endFog - startFog);

            // Also fade out very close particles so they don't just "pop" out
            if (finalZ < 300) {
                opacity *= (finalZ / 300);
            }

            if (opacity < 0) opacity = 0;
            if (opacity > 1) opacity = 1;

            if (opacity < 0.05) continue; // Skip invisible

            for (let x = 0; x < this.countX; x++) {
                let px = this.startX + (x * this.spacing);

                // Wave Calculation
                // Use stable coordinates for wave phase so the wave moves *through* the particles
                // or moves *with* them. 
                // Using (px, finalZ) makes the wave stay in world space while particles fly through it -> nice effect

                let distance = Math.sqrt((px * 0.01) ** 2 + (finalZ * 0.01) ** 2);

                let py = Math.sin(distance * 3 - speed) * waveHeight;
                // Secondary detail wave
                py += Math.cos(px * 0.02 + speed) * 30;

                let screenX = px * scale + this.centerX;
                let screenY = py * scale + this.centerY;

                // Culling
                if (screenX < -20 || screenX > this.canvas.width + 20) continue;
                if (screenY < -20 || screenY > this.canvas.height + 20) continue;

                let size = scale * 5.0;
                if (size < 0.5) size = 0.5;

                // Electron vs Hole logic
                // Checkerboard pattern
                let isElectron = (x + z) % 2 === 0;

                if (isElectron) {
                    // Electrons: Cyan/Blue
                    this.ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
                } else {
                    // Holes: Red/Orange
                    this.ctx.fillStyle = `rgba(255, 50, 50, ${opacity})`;
                }
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WaveAnimation('hero-waves');
    });
} else {
    new WaveAnimation('hero-waves');
}
