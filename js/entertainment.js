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