const EntertainmentModule = {
    currentTab: 'ipl',
    
    init() {
        this.attachListeners();
        this.loadContent();
    },
    
    attachListeners() {
        document.querySelectorAll('.ent-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.ent-tab').forEach(t => t.classList.remove('active'));
                e.target.closest('.ent-tab').classList.add('active');
                this.currentTab = e.target.closest('.ent-tab').dataset.ent;
                this.loadContent();
            });
        });
    },
    
    loadContent() {
        const container = document.getElementById('entContent');
        
        if(this.currentTab === 'ipl') {
            container.innerHTML = `
                <div class="ipl-hero">
                    <div class="ipl-stats glass">
                        <span>IPL 2024 Season</span>
                        <span class="neon-green">74 Matches</span>
                    </div>
                </div>
                <div class="results-grid">
                    ${mockData.ipl.map(match => Components.ticketCard(match, 'ipl', match.resale)).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="movies-grid">
                    ${mockData.movies.map(movie => Components.ticketCard(movie, 'movie', movie.resale)).join('')}
                </div>
            `;
        }
    },
    
openSeatSelection(matchId) {
    const match = mockData.ipl.find(m => m.id === matchId);
    const modal = document.getElementById('seatModal');
    const container = document.getElementById('seatMapContainer');
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create proper modal structure
    container.innerHTML = `
        <button class="close-modal" onclick="App.closeModal()">
            <i class="fas fa-times"></i>
        </button>
        
        <div class="seat-map-wrapper">
            <div class="modal-header">
                <h3 class="modal-title">${match.match}</h3>
                <p class="modal-subtitle">${match.venue} • ${match.date}</p>
            </div>
            
            <div class="stadium-container">
                ${Components.seatMap.ipl()}
            </div>
            
            <div class="price-summary">
                <div class="price-row">
                    <span>Base Price (${match.category})</span>
                    <span>₹${match.price}</span>
                </div>
                <div class="price-row">
                    <span>Platform Fee</span>
                    <span>₹50</span>
                </div>
                <div class="price-row">
                    <span>Nexus Points Discount</span>
                    <span style="color: var(--neon-green);">-₹${Math.floor(match.price * 0.05)}</span>
                </div>
                <div class="price-row total">
                    <span>Total Amount</span>
                    <span>₹${match.price + 50 - Math.floor(match.price * 0.05)}</span>
                </div>
            </div>
            
            <button class="btn-proceed" onclick="EntertainmentModule.proceedToPay('${matchId}')">
                Proceed to Payment
            </button>
        </div>
    `;
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}
};