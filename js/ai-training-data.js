// Sample ticket data - In real app, fetch from API
const ticketsData = [
    {
        id: 1,
        type: 'resale',
        from: 'DEL',
        to: 'BOM',
        airline: 'IndiGo',
        departure: '08:30',
        arrival: '10:45',
        duration: '2h 15m',
        originalPrice: 4500,
        price: 3200,
        discount: 29,
        seats: 4,
        seller: 'Trusted Seller',
        stops: 'nonstop'
    },
    {
        id: 2,
        type: 'regular',
        from: 'BLR',
        to: 'DEL',
        airline: 'Air India',
        departure: '14:00',
        arrival: '16:30',
        duration: '2h 30m',
        price: 6200,
        seats: 2,
        stops: 'nonstop'
    },
    {
        id: 3,
        type: 'resale',
        from: 'HYD',
        to: 'MAA',
        airline: 'Vistara',
        departure: '19:15',
        arrival: '21:00',
        duration: '1h 45m',
        originalPrice: 5100,
        price: 4000,
        discount: 22,
        seats: 12,
        seller: 'Trusted Seller',
        stops: 'nonstop'
    },
    {
        id: 4,
        type: 'regular',
        from: 'DEL',
        to: 'BOM',
        airline: 'SpiceJet',
        departure: '06:00',
        arrival: '08:15',
        duration: '2h 15m',
        price: 2800,
        seats: 8,
        stops: 'nonstop'
    },
    {
        id: 5,
        type: 'resale',
        from: 'MAA',
        to: 'BLR',
        airline: 'IndiGo',
        departure: '11:30',
        arrival: '12:45',
        duration: '1h 15m',
        originalPrice: 3500,
        price: 2100,
        discount: 40,
        seats: 3,
        seller: 'Verified User',
        stops: 'nonstop'
    }
];

let filteredTickets = [...ticketsData];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTickets(filteredTickets);
    updateResultsCount(filteredTickets.length);
});

// Render tickets
function renderTickets(tickets) {
    const container = document.getElementById('ticketsContainer');
    
    if (tickets.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-plane-slash"></i>
                <p>No flights found for your criteria</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tickets.map(ticket => createTicketCard(ticket)).join('');
}

// Create ticket card HTML
function createTicketCard(ticket) {
    const isResale = ticket.type === 'resale';
    const savings = isResale ? ticket.originalPrice - ticket.price : 0;
    
    return `
        <div class="ticket-card ${isResale ? 'resale' : ''}">
            <div class="card-header">
                <div class="price-section">
                    ${isResale ? `<span class="original-price">₹${ticket.originalPrice}</span>` : ''}
                    <span class="current-price">₹${ticket.price}</span>
                </div>
                ${isResale ? `<span class="discount-badge">${ticket.discount}% OFF</span>` : ''}
            </div>
            
            <div class="route-display">
                <span>${ticket.from}</span>
                <i class="fas fa-arrow-right"></i>
                <span>${ticket.to}</span>
            </div>
            
            <div class="flight-info">
                <span><i class="fas fa-plane"></i> ${ticket.airline}</span>
                <span><i class="fas fa-clock"></i> ${ticket.departure}</span>
            </div>
            
            <div class="seats-info">
                <i class="fas fa-circle"></i>
                <span>${ticket.seats} seats available</span>
            </div>
            
            <button class="book-btn ${isResale ? 'resale' : 'primary'}" onclick="bookTicket(${ticket.id})">
                ${isResale ? 'Buy Resale' : 'Book Now'}
            </button>
            
            ${isResale ? `
                <div class="seller-info">
                    <i class="fas fa-check-circle"></i>
                    <span>Sold by ${ticket.seller}</span>
                </div>
            ` : ''}
        </div>
    `;
}

// Apply filters
function applyFilters() {
    const sortValue = document.getElementById('sortFilter').value;
    const maxPrice = parseInt(document.getElementById('priceRange').value);
    
    let filtered = ticketsData.filter(ticket => ticket.price <= maxPrice);
    
    // Sort
    switch(sortValue) {
        case 'price_low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price_high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'departure_early':
            filtered.sort((a, b) => timeToMinutes(a.departure) - timeToMinutes(b.departure));
            break;
        case 'departure_late':
            filtered.sort((a, b) => timeToMinutes(b.departure) - timeToMinutes(a.departure));
            break;
        case 'duration':
            filtered.sort((a, b) => durationToMinutes(a.duration) - durationToMinutes(b.duration));
            break;
    }
    
    filteredTickets = filtered;
    renderTickets(filtered);
    updateResultsCount(filtered.length);
}

// Toggle chip filter
function toggleChip(btn, value) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    
    // Filter by stops
    if (value === 'all') {
        filteredTickets = ticketsData;
    } else {
        filteredTickets = ticketsData.filter(t => t.stops === value);
    }
    
    renderTickets(filteredTickets);
    updateResultsCount(filteredTickets.length);
}

// Update price label
function updatePriceLabel(value) {
    document.getElementById('priceValue').textContent = `₹${parseInt(value).toLocaleString()}`;
    applyFilters();
}

// Reset filters
function resetFilters() {
    document.getElementById('sortFilter').value = 'recommended';
    document.getElementById('priceRange').value = 10000;
    document.getElementById('priceValue').textContent = '₹10,000';
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.chip').classList.add('active');
    
    filteredTickets = [...ticketsData];
    renderTickets(filteredTickets);
    updateResultsCount(filteredTickets.length);
}

// Update results count
function updateResultsCount(count) {
    document.getElementById('resultsCount').textContent = `${count} flight${count !== 1 ? 's' : ''} found`;
}

// Book ticket
function bookTicket(id) {
    const ticket = ticketsData.find(t => t.id === id);
    alert(`Booking ${ticket.from} → ${ticket.to} for ₹${ticket.price}`);
}

// Helper: Convert time to minutes
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Helper: Convert duration to minutes
function durationToMinutes(duration) {
    const match = duration.match(/(\d+)h\s*(\d+)m/);
    if (match) {
        return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return 0;
}

// Show search modal (placeholder)
function showSearchModal() {
    alert('Edit search - would open search form');
}