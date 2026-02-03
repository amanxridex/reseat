document.addEventListener('DOMContentLoaded', () => {
    // Touch feedback for mobile
    const cards = document.querySelectorAll('.action-card');
    
    cards.forEach(card => {
        card.addEventListener('touchstart', () => {
            card.style.transform = 'scale(0.96)';
        }, { passive: true });
        
        card.addEventListener('touchend', () => {
            card.style.transform = '';
        }, { passive: true });
    });
});