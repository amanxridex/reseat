const MetroModule = {
    selectedMetro: null,
    
    init() {
        // Check if metro was previously selected
        const savedMetro = localStorage.getItem('selected_metro');
        if (savedMetro) {
            this.selectedMetro = savedMetro;
        }
    },
    
    selectMetro(metroId) {
        this.selectedMetro = metroId;
        localStorage.setItem('selected_metro', metroId);
        
        // Add selection animation
        const cards = document.querySelectorAll('.metro-card');
        cards.forEach(card => {
            card.style.opacity = '0.5';
            card.style.transform = 'scale(0.98)';
        });
        
        event.currentTarget.style.opacity = '1';
        event.currentTarget.style.transform = 'scale(1.02)';
        event.currentTarget.style.borderColor = 'var(--accent)';
        
        // Navigate to metro booking page after brief delay
        setTimeout(() => {
            window.location.href = `metro-booking.html?metro=${metroId}`;
        }, 300);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    MetroModule.init();
});

// Make selectMetro globally accessible for onclick handlers
function selectMetro(metroId) {
    MetroModule.selectMetro(metroId);
}