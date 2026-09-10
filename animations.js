// ===================================
// TFT Lab Website - Animations
// ===================================

// Parallax Effect for Hero Section
function initParallax() {
    const heroContent = document.querySelector('.hero-content');

    if (!heroContent) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        heroContent.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    });
}

// Counter Animation for Statistics
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = Math.round(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// Initialize counters when they come into view
function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-counter'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// Stagger Animation for Lists
function initStaggerAnimation() {
    const staggerLists = document.querySelectorAll('[data-stagger]');

    staggerLists.forEach(list => {
        const items = list.children;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    Array.from(items).forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('animate-fade-in-up');
                        }, index * 100);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(list);
    });
}

// Card Tilt Effect on Mouse Move
function initCardTilt() {
    const cards = document.querySelectorAll('.research-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// Typing Effect for Hero Text
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Initialize typing effect
function initTypingEffect() {
    const typingElement = document.querySelector('[data-typing]');
    if (typingElement) {
        const text = typingElement.getAttribute('data-typing');
        typeWriter(typingElement, text);
    }
}

// Reveal Animation on Scroll
function initRevealOnScroll() {
    const reveals = document.querySelectorAll('[data-reveal]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const direction = entry.target.getAttribute('data-reveal');
                switch (direction) {
                    case 'left':
                        entry.target.classList.add('animate-slide-in-left');
                        break;
                    case 'right':
                        entry.target.classList.add('animate-slide-in-right');
                        break;
                    case 'up':
                        entry.target.classList.add('animate-fade-in-up');
                        break;
                    case 'down':
                        entry.target.classList.add('animate-fade-in-down');
                        break;
                    default:
                        entry.target.classList.add('animate-fade-in');
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(reveal => observer.observe(reveal));
}

// Image Lightbox
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img) return;

            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
        <div class="lightbox-content">
          <img src="${img.src}" alt="${img.alt}">
          <button class="lightbox-close">&times;</button>
        </div>
      `;

            document.body.appendChild(lightbox);
            document.body.style.overflow = 'hidden';

            // Close lightbox
            const close = () => {
                lightbox.remove();
                document.body.style.overflow = '';
            };

            lightbox.querySelector('.lightbox-close').addEventListener('click', close);
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) close();
            });
        });
    });

    // Add lightbox styles
    if (!document.getElementById('lightbox-styles')) {
        const style = document.createElement('style');
        style.id = 'lightbox-styles';
        style.textContent = `
      .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
      }
      .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
      }
      .lightbox-content img {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
      }
      .lightbox-close {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 40px;
        cursor: pointer;
        padding: 0;
        width: 40px;
        height: 40px;
        line-height: 1;
      }
    `;
        document.head.appendChild(style);
    }
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    initParallax();
    initCounters();
    initStaggerAnimation();
    initCardTilt();
    initTypingEffect();
    initRevealOnScroll();
    initLightbox();
});

export {
    initParallax,
    animateCounter,
    initCounters,
    initStaggerAnimation,
    initCardTilt,
    typeWriter,
    initTypingEffect,
    initRevealOnScroll,
    initLightbox
};
