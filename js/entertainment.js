// Category click handler
function openCategory(category) {
    // Add click animation
    const card = event.currentTarget;
    card.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        card.style.transform = '';
        // Navigate to category page
        window.location.href = `${category}.html`;
    }, 150);
}

// Featured event click handler
function openEvent(eventId) {
    const card = event.currentTarget;
    card.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        card.style.transform = '';
        window.location.href = `event-details.html?id=${eventId}`;
    }, 150);
}

// Add parallax effect on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelectorAll('.ambient-glow');
    
    parallax.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Add touch feedback for mobile
document.querySelectorAll('.ent-card, .featured-card').forEach(card => {
    card.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    
    card.addEventListener('touchend', function() {
        this.style.transform = '';
    });
});

// Add this to your existing entertainment.js

// Magnetic effect on cards
document.querySelectorAll('.ent-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
});

// Parallax scroll effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.ambient-glow');
    
    parallaxElements.forEach((el, index) => {
        const speed = 0.5 + (index * 0.2);
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
    
    // Stagger animation restart on scroll
    const cards = document.querySelectorAll('.ent-card');
    cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && !card.classList.contains('animated')) {
            card.classList.add('animated');
            card.style.animation = `none`;
            setTimeout(() => {
                card.style.animation = `cardFlip 0.8s ease forwards`;
                card.style.animationDelay = `${index * 0.1}s`;
            }, 10);
        }
    });
});

// Sound wave effect on concerts card
const concertsCard = document.querySelector('.concerts-card');
if (concertsCard) {
    setInterval(() => {
        const icon = concertsCard.querySelector('.card-icon');
        icon.style.transform = 'scale(1.1)';
        setTimeout(() => {
            icon.style.transform = '';
        }, 200);
    }, 3000);
}

// Click ripple effect
document.querySelectorAll('.ent-card, .featured-card').forEach(card => {
    card.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
            z-index: 100;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple keyframe dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);