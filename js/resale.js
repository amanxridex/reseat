// Animate numbers on load
function animateNumber(elementId, target, suffix = '') {
    const element = document.getElementById(elementId);
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 30);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Animate stats
    animateNumber('activeListings', 1247);
    animateNumber('avgSavings', 32, '%');
    animateNumber('successRate', 98.5, '%');
});

// Touch feedback
document.querySelectorAll('.action-card, .deal-card, .step-card').forEach(el => {
    el.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    el.addEventListener('touchend', function() {
        this.style.transform = '';
    });
});