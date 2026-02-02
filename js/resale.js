const ResaleModule = {
    init() {
        this.loadResaleListings();
        this.updateStats();
        this.loadUserListings();
    },
    
    loadResaleListings() {
        const grid = document.getElementById('resaleGrid');
        
        grid.innerHTML = resaleListings.map(listing => {
            const item = listing.item;
            return Components.ticketCard(item, listing.type, true);
        }).join('');
    },
    
    updateStats() {
        // Animate stats
        Utils.animateValue(document.getElementById('activeListings'), 0, 142, 2000);
        Utils.animateValue(document.getElementById('avgDiscount'), 0, 24, 2000);
        Utils.animateValue(document.getElementById('resaleSavings'), 0, 125000, 2500);
    },
    
    loadUserListings() {
        const container = document.getElementById('myListings');
        const myTickets = mockData.userTickets.filter(t => !t.listed);
        
        container.innerHTML = myTickets.map(ticket => `
            <div class="listing-item" onclick="ResaleModule.openListModal('${ticket.id}')">
                <div class="listing-info">
                    <span class="listing-type">${ticket.type.toUpperCase()}</span>
                    <span class="listing-details">
                        ${ticket.details.match || ticket.details.from + ' → ' + ticket.details.to}
                    </span>
                </div>
                <div class="listing-price">₹${ticket.price}</div>
                <button class="btn-outline btn-sm">Resale</button>
            </div>
        `).join('');
    },
    
    openListModal(ticketId) {
        const ticket = mockData.userTickets.find(t => t.id === ticketId);
        const modal = document.getElementById('listModal');
        const form = document.getElementById('listForm');
        
        form.innerHTML = Components.resaleForm(ticket);
        modal.classList.remove('hidden');
    },
    
    confirmListing(ticketId) {
        const price = document.getElementById('resalePriceSlider').value;
        Utils.showToast(`Ticket listed for ₹${price}!`);
        App.closeModal();
        
        // Update UI
        setTimeout(() => this.loadUserListings(), 500);
    }
};