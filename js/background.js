// ===================================
// Optoelectronics Lab - Vacuum Chamber Background
// Atoms, Molecules, and Plasma Visualization
// ===================================

class VacuumChamberBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.atoms = [];
        this.molecules = [];
        this.plasmaParticles = [];
        this.electrons = [];
        this.resize();

        window.addEventListener('resize', () => this.resize());
        this.init();
        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    init() {
        // Create chamber walls (visual boundary)
        this.chamberBounds = {
            left: this.canvas.width * 0.1,
            right: this.canvas.width * 0.9,
            top: this.canvas.height * 0.1,
            bottom: this.canvas.height * 0.9
        };

        // Create atoms (individual particles)
        for (let i = 0; i < 40; i++) {
            this.atoms.push(this.createAtom());
        }

        // Create molecules (bonded atoms)
        for (let i = 0; i < 15; i++) {
            this.molecules.push(this.createMolecule());
        }

        // Create plasma particles (ionized gas)
        for (let i = 0; i < 60; i++) {
            this.plasmaParticles.push(this.createPlasmaParticle());
        }

        // Create free electrons
        for (let i = 0; i < 30; i++) {
            this.electrons.push(this.createElectron());
        }
    }

    createAtom() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: 4 + Math.random() * 3,
            color: this.getAtomColor(),
            glow: Math.random() * 0.5 + 0.5
        };
    }

    createMolecule() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const angle = Math.random() * Math.PI * 2;
        const bondLength = 20 + Math.random() * 15;

        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            angle: angle,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            bondLength: bondLength,
            atom1Color: this.getAtomColor(),
            atom2Color: this.getAtomColor(),
            radius: 3 + Math.random() * 2
        };
    }

    createPlasmaParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            radius: 1 + Math.random() * 2,
            life: Math.random(),
            maxLife: 0.5 + Math.random() * 0.5,
            color: Math.random() > 0.5 ? '#00D9FF' : '#7C3AED'
        };
    }

    createElectron() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 2,
            trail: []
        };
    }

    getAtomColor() {
        const colors = [
            '#00D9FF', // Cyan - Oxygen
            '#7C3AED', // Purple - Nitrogen
            '#10B981', // Green - Zinc
            '#F59E0B', // Amber - Copper
            '#EC4899'  // Magenta - Tin
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    drawChamberWalls() {
        // Draw subtle chamber boundary
        this.ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]);
        this.ctx.strokeRect(
            this.chamberBounds.left,
            this.chamberBounds.top,
            this.chamberBounds.right - this.chamberBounds.left,
            this.chamberBounds.bottom - this.chamberBounds.top
        );
        this.ctx.setLineDash([]);

        // Add corner markers
        const cornerSize = 15;
        this.ctx.strokeStyle = 'rgba(0, 217, 255, 0.4)';
        this.ctx.lineWidth = 2;

        // Top-left
        this.ctx.beginPath();
        this.ctx.moveTo(this.chamberBounds.left, this.chamberBounds.top + cornerSize);
        this.ctx.lineTo(this.chamberBounds.left, this.chamberBounds.top);
        this.ctx.lineTo(this.chamberBounds.left + cornerSize, this.chamberBounds.top);
        this.ctx.stroke();

        // Top-right
        this.ctx.beginPath();
        this.ctx.moveTo(this.chamberBounds.right - cornerSize, this.chamberBounds.top);
        this.ctx.lineTo(this.chamberBounds.right, this.chamberBounds.top);
        this.ctx.lineTo(this.chamberBounds.right, this.chamberBounds.top + cornerSize);
        this.ctx.stroke();

        // Bottom-left
        this.ctx.beginPath();
        this.ctx.moveTo(this.chamberBounds.left, this.chamberBounds.bottom - cornerSize);
        this.ctx.lineTo(this.chamberBounds.left, this.chamberBounds.bottom);
        this.ctx.lineTo(this.chamberBounds.left + cornerSize, this.chamberBounds.bottom);
        this.ctx.stroke();

        // Bottom-right
        this.ctx.beginPath();
        this.ctx.moveTo(this.chamberBounds.right - cornerSize, this.chamberBounds.bottom);
        this.ctx.lineTo(this.chamberBounds.right, this.chamberBounds.bottom);
        this.ctx.lineTo(this.chamberBounds.right, this.chamberBounds.bottom - cornerSize);
        this.ctx.stroke();
    }

    updateAndDrawAtoms() {
        this.atoms.forEach(atom => {
            // Update position
            atom.x += atom.vx;
            atom.y += atom.vy;

            // Bounce off chamber walls
            if (atom.x - atom.radius < this.chamberBounds.left || atom.x + atom.radius > this.chamberBounds.right) {
                atom.vx *= -1;
                atom.x = Math.max(this.chamberBounds.left + atom.radius, Math.min(this.chamberBounds.right - atom.radius, atom.x));
            }
            if (atom.y - atom.radius < this.chamberBounds.top || atom.y + atom.radius > this.chamberBounds.bottom) {
                atom.vy *= -1;
                atom.y = Math.max(this.chamberBounds.top + atom.radius, Math.min(this.chamberBounds.bottom - atom.radius, atom.y));
            }

            // Pulsing glow effect
            atom.glow = 0.5 + Math.sin(Date.now() * 0.002 + atom.x) * 0.3;

            // Draw atom with glow
            const gradient = this.ctx.createRadialGradient(
                atom.x, atom.y, 0,
                atom.x, atom.y, atom.radius * 3
            );
            gradient.addColorStop(0, atom.color);
            gradient.addColorStop(0.5, atom.color + '80');
            gradient.addColorStop(1, atom.color + '00');

            this.ctx.beginPath();
            this.ctx.arc(atom.x, atom.y, atom.radius * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Draw atom core
            this.ctx.beginPath();
            this.ctx.arc(atom.x, atom.y, atom.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = atom.color;
            this.ctx.fill();

            // Draw nucleus
            this.ctx.beginPath();
            this.ctx.arc(atom.x, atom.y, atom.radius * 0.4, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fill();
        });
    }

    updateAndDrawMolecules() {
        this.molecules.forEach(mol => {
            // Update position
            mol.x += mol.vx;
            mol.y += mol.vy;
            mol.angle += mol.rotationSpeed;

            // Bounce off chamber walls
            if (mol.x < this.chamberBounds.left || mol.x > this.chamberBounds.right) {
                mol.vx *= -1;
                mol.x = Math.max(this.chamberBounds.left, Math.min(this.chamberBounds.right, mol.x));
            }
            if (mol.y < this.chamberBounds.top || mol.y > this.chamberBounds.bottom) {
                mol.vy *= -1;
                mol.y = Math.max(this.chamberBounds.top, Math.min(this.chamberBounds.bottom, mol.y));
            }

            // Calculate atom positions
            const atom1X = mol.x + Math.cos(mol.angle) * mol.bondLength / 2;
            const atom1Y = mol.y + Math.sin(mol.angle) * mol.bondLength / 2;
            const atom2X = mol.x - Math.cos(mol.angle) * mol.bondLength / 2;
            const atom2Y = mol.y - Math.sin(mol.angle) * mol.bondLength / 2;

            // Draw bond
            this.ctx.beginPath();
            this.ctx.moveTo(atom1X, atom1Y);
            this.ctx.lineTo(atom2X, atom2Y);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw atoms
            [
                { x: atom1X, y: atom1Y, color: mol.atom1Color },
                { x: atom2X, y: atom2Y, color: mol.atom2Color }
            ].forEach(atom => {
                // Glow
                const gradient = this.ctx.createRadialGradient(
                    atom.x, atom.y, 0,
                    atom.x, atom.y, mol.radius * 2.5
                );
                gradient.addColorStop(0, atom.color);
                gradient.addColorStop(0.5, atom.color + '60');
                gradient.addColorStop(1, atom.color + '00');

                this.ctx.beginPath();
                this.ctx.arc(atom.x, atom.y, mol.radius * 2.5, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();

                // Core
                this.ctx.beginPath();
                this.ctx.arc(atom.x, atom.y, mol.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = atom.color;
                this.ctx.fill();
            });
        });
    }

    updateAndDrawPlasma() {
        this.plasmaParticles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life += 0.01;

            // Wrap around chamber
            if (particle.x < this.chamberBounds.left) particle.x = this.chamberBounds.right;
            if (particle.x > this.chamberBounds.right) particle.x = this.chamberBounds.left;
            if (particle.y < this.chamberBounds.top) particle.y = this.chamberBounds.bottom;
            if (particle.y > this.chamberBounds.bottom) particle.y = this.chamberBounds.top;

            // Reset if life exceeded
            if (particle.life > particle.maxLife) {
                particle.life = 0;
                particle.x = Math.random() * this.canvas.width;
                particle.y = Math.random() * this.canvas.height;
            }

            // Draw plasma particle with pulsing effect
            const opacity = Math.sin(particle.life * Math.PI / particle.maxLife) * 0.6;
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * 4
            );
            gradient.addColorStop(0, particle.color + 'FF');
            gradient.addColorStop(0.5, particle.color + Math.floor(opacity * 128).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, particle.color + '00');

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }

    updateAndDrawElectrons() {
        this.electrons.forEach(electron => {
            // Update position
            electron.x += electron.vx;
            electron.y += electron.vy;

            // Wrap around chamber
            if (electron.x < this.chamberBounds.left) electron.x = this.chamberBounds.right;
            if (electron.x > this.chamberBounds.right) electron.x = this.chamberBounds.left;
            if (electron.y < this.chamberBounds.top) electron.y = this.chamberBounds.bottom;
            if (electron.y > this.chamberBounds.bottom) electron.y = this.chamberBounds.top;

            // Add to trail
            electron.trail.push({ x: electron.x, y: electron.y });
            if (electron.trail.length > 10) electron.trail.shift();

            // Draw trail
            electron.trail.forEach((point, i) => {
                const opacity = (i / electron.trail.length) * 0.3;
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, electron.radius * (i / electron.trail.length), 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                this.ctx.fill();
            });

            // Draw electron
            this.ctx.beginPath();
            this.ctx.arc(electron.x, electron.y, electron.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#00D9FF';
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw chamber walls
        this.drawChamberWalls();

        // Draw plasma (background layer)
        this.updateAndDrawPlasma();

        // Draw molecules
        this.updateAndDrawMolecules();

        // Draw atoms
        this.updateAndDrawAtoms();

        // Draw electrons (foreground layer)
        this.updateAndDrawElectrons();

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new VacuumChamberBackground('hero-background');
    });
} else {
    new VacuumChamberBackground('hero-background');
}
