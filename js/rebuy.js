// Sample Data - In real app, fetch from backend
const TRAVEL_TICKETS = [
    { id: 1, type: 'flights', from: 'Delhi', to: 'Mumbai', date: '2026-02-15', airline: 'IndiGo', original: 5000, selling: 3500, image: 'flight.jpg', class: 'Economy' },
    { id: 2, type: 'flights', from: 'Mumbai', to: 'Bangalore', date: '2026-02-18', airline: 'Air India', original: 4500, selling: 3200, image: 'flight.jpg', class: 'Business' },
    { id: 3, type: 'trains', from: 'Delhi', to: 'Mumbai', date: '2026-02-20', train: 'Rajdhani', original: 3500, selling: 2500, image: 'train.jpg', class: '3A' },
    { id: 4, type: 'buses', from: 'Pune', to: 'Mumbai', date: '2026-02-16', operator: 'Volvo', original: 800, selling: 500, image: 'bus.jpg', class: 'AC Sleeper' },
    { id: 5, type: 'flights', from: 'Chennai', to: 'Delhi', date: '2026-02-22', airline: 'Vistara', original: 6000, selling: 4200, image: 'flight.jpg', class: 'Economy' },
    { id: 6, type: 'trains', from: 'Mumbai', to: 'Goa', date: '2026-02-25', train: 'Konkan Kanya', original: 1200, selling: 800, image: 'train.jpg', class: 'Sleeper' }
];

const ENT_TICKETS = [
    { id: 101, category: 'concerts', name: 'Coldplay Mumbai', venue: 'DY Patil Stadium', date: '2026-01-15', original: 5000, selling: 3500, image: 'concert.jpg', badge: 'HOT' },
    { id: 102, category: 'movies', name: 'Pushpa 2 IMAX', venue: 'PVR Phoenix', date: '2026-02-10', original: 800, selling: 500, image: 'movie.jpg', badge: '' },
    { id: 103, category: 'sports', name: 'IPL Final 2026', venue: 'Narendra Modi Stadium', date: '2026-05-25', original: 15000, selling: 12000, image: 'sports.jpg', badge: 'POPULAR' },
    { id: 104, category: 'clubs', name: 'Sunburn Goa Pass', venue: 'Vagator Beach', date: '2026-12-28', original: 8000, selling: 6000, image: 'club.jpg', badge: 'LIMITED' },
    { id: 105, category: 'concerts', name: 'Ed Sheeran Delhi', venue: 'JLN Stadium', date: '2026-03-20', original: 4000, selling: 2800, image: 'concert.jpg', badge: '' },
    { id: 106, category: 'movies', name: 'Avatar 3 3D', venue: 'IMAX Wadala', date: '2026-12-18', original: 600, selling: 400, image: 'movie.jpg', badge: 'NEW' }
];

let currentMode = 'travel';
let currentTravelFilter = 'all';
let currentEntFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTravelTickets();
    renderEntertainmentTickets();
    setMinDate();
});

// Set min date for travel search
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('travelDate').min = today;
}

// Switch Mode
function switchMode(mode) {
    currentMode = mode;
    
    // Update buttons
    document.getElementById('travelMode').classList.toggle('active', mode === 'travel');
    document.getElementById('entertainmentMode').classList.toggle('active', mode === 'entertainment');
    
    // Update sections
    document.getElementById('travelSection').classList.toggle('hidden', mode !== 'travel');
    document.getElementById('entertainmentSection').classList.toggle('hidden', mode !== 'entertainment');
    
    // Update search visibility
    document.getElementById('entertainmentSearch').style.display = mode === 'entertainment' ? 'flex' : 'none';
    document.getElementById('travelSearchBtn').style.display = mode === 'travel' ? 'flex' : 'none';
}

// Travel Search Modal
function openTravelSearch() {
    document.getElementById('travelSearchModal').classList.remove('hidden');
}

function closeTravelSearch() {
    document.getElementById('travelSearchModal').classList.add('hidden');
}

function swapCities() {
    const from = document.getElementById('fromCity').value;
    const to = document.getElementById('toCity').value;
    document.getElementById('fromCity').value = to;
    document.getElementById('toCity').value = from;
}

function searchTravelTickets() {
    const from = document.getElementById('fromCity').value;
    const to = document.getElementById('toCity').value;
    const date = document.getElementById('travelDate').value;
    
    if (!from || !to) {
        alert('Please enter both cities');
        return;
    }
    
    // Filter logic here
    closeTravelSearch();
    filterTravel('all');
    
    // Scroll to results
    document.getElementById('travelFullList').scrollIntoView({ behavior: 'smooth' });
}

// Filter Functions
function filterTravel(category) {
    currentTravelFilter = category;
    
    // Update buttons
    document.querySelectorAll('.travel-cat').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === category);
    });
    
    renderTravelTickets();
}

function filterEntertainment(category) {
    currentEntFilter = category;
    
    // Update buttons
    document.querySelectorAll('.ent-cat').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === category);
    });
    
    renderEntertainmentTickets();
}

// Render Travel
function renderTravelTickets() {
    let tickets = TRAVEL_TICKETS;
    if (currentTravelFilter !== 'all') {
        tickets = tickets.filter(t => t.type === currentTravelFilter);
    }
    
    // Hot deals (best savings)
    const hotDeals = [...TRAVEL_TICKETS].sort((a, b) => (b.original - b.selling) - (a.original - a.selling)).slice(0, 3);
    
    document.getElementById('travelDealsSlider').innerHTML = hotDeals.map(t => createTravelCard(t, true)).join('');
    document.getElementById('flightsSlider').innerHTML = TRAVEL_TICKETS.filter(t => t.type === 'flights').map(t => createTravelCard(t)).join('');
    document.getElementById('trainsSlider').innerHTML = TRAVEL_TICKETS.filter(t => t.type === 'trains').map(t => createTravelCard(t)).join('');
    document.getElementById('busesSlider').innerHTML = TRAVEL_TICKETS.filter(t => t.type === 'buses').map(t => createTravelCard(t)).join('');
    
    document.getElementById('travelListGrid').innerHTML = tickets.map(t => createTravelCard(t)).join('');
    document.getElementById('travelCount').textContent = `${tickets.length} tickets`;
}

function createTravelCard(t, isDeal = false) {
    const discount = Math.round(((t.original - t.selling) / t.original) * 100);
    return `
        <div class="ticket-card" onclick="openTicket('travel', ${t.id})">
            <div class="ticket-image">
                <img src="assets/${t.image}" alt="${t.type}">
                ${isDeal ? '<span class="ticket-badge badge-hot">HOT DEAL</span>' : ''}
                <span class="discount-tag">-${discount}%</span>
            </div>
            <div class="ticket-info">
                <div class="ticket-route">${t.from} → ${t.to}</div>
                <div class="ticket-meta">
                    <i class="fas fa-calendar"></i> ${formatDate(t.date)} • ${t.airline || t.train || t.operator}
                </div>
                <div class="ticket-footer">
                    <div class="ticket-price">
                        <span class="original-price">₹${t.original}</span>
                        <span class="selling-price">₹${t.selling}</span>
                    </div>
                    <div class="ticket-arrow"><i class="fas fa-chevron-right"></i></div>
                </div>
            </div>
        </div>
    `;
}

// Render Entertainment
function renderEntertainmentTickets() {
    let tickets = ENT_TICKETS;
    if (currentEntFilter !== 'all') {
        tickets = tickets.filter(t => t.category === currentEntFilter);
    }
    
    // Trending
    const trending = [...ENT_TICKETS].slice(0, 3);
    
    document.getElementById('entTrendingSlider').innerHTML = trending.map(t => createEntCard(t, true)).join('');
    document.getElementById('concertsSlider').innerHTML = ENT_TICKETS.filter(t => t.category === 'concerts').map(t => createEntCard(t)).join('');
    document.getElementById('moviesSlider').innerHTML = ENT_TICKETS.filter(t => t.category === 'movies').map(t => createEntCard(t)).join('');
    document.getElementById('sportsSlider').innerHTML = ENT_TICKETS.filter(t => t.category === 'sports').map(t => createEntCard(t)).join('');
    document.getElementById('clubsSlider').innerHTML = ENT_TICKETS.filter(t => t.category === 'clubs').map(t => createEntCard(t)).join('');
    
    document.getElementById('entListGrid').innerHTML = tickets.map(t => createEntCard(t)).join('');
    document.getElementById('entCount').textContent = `${tickets.length} tickets`;
}

function createEntCard(t, isTrending = false) {
    const discount = Math.round(((t.original - t.selling) / t.original) * 100);
    return `
        <div class="ticket-card" onclick="openTicket('ent', ${t.id})">
            <div class="ticket-image">
                <img src="assets/${t.image}" alt="${t.category}">
                ${t.badge ? `<span class="ticket-badge badge-hot">${t.badge}</span>` : ''}
                <span class="discount-tag">-${discount}%</span>
            </div>
            <div class="ticket-info">
                <div class="ticket-title">${t.name}</div>
                <div class="ticket-meta">
                    <i class="fas fa-map-marker-alt"></i> ${t.venue}
                </div>
                <div class="ticket-footer">
                    <div class="ticket-price">
                        <span class="original-price">₹${t.original}</span>
                        <span class="selling-price">₹${t.selling}</span>
                    </div>
                    <div class="ticket-arrow"><i class="fas fa-chevron-right"></i></div>
                </div>
            </div>
        </div>
    `;
}

// Search Entertainment
function searchEntertainment(query) {
    const lowerQuery = query.toLowerCase();
    const filtered = ENT_TICKETS.filter(t => 
        t.name.toLowerCase().includes(lowerQuery) ||
        t.venue.toLowerCase().includes(lowerQuery) ||
        t.category.toLowerCase().includes(lowerQuery)
    );
    
    // Update all sliders with search results or show "no results"
    if (query) {
        document.getElementById('entTrendingSlider').innerHTML = filtered.map(t => createEntCard(t)).join('');
        document.getElementById('concertsSlider').parentElement.style.display = 'none';
        document.getElementById('moviesSlider').parentElement.style.display = 'none';
        document.getElementById('sportsSlider').parentElement.style.display = 'none';
        document.getElementById('clubsSlider').parentElement.style.display = 'none';
    } else {
        renderEntertainmentTickets();
        document.getElementById('concertsSlider').parentElement.style.display = 'block';
        document.getElementById('moviesSlider').parentElement.style.display = 'block';
        document.getElementById('sportsSlider').parentElement.style.display = 'block';
        document.getElementById('clubsSlider').parentElement.style.display = 'block';
    }
}

// View All
function viewAllTravel(type) {
    document.getElementById('travelFullList').scrollIntoView({ behavior: 'smooth' });
}

function viewAllEntertainment(type) {
    document.getElementById('entFullList').scrollIntoView({ behavior: 'smooth' });
}

// Open Ticket
function openTicket(mode, id) {
    window.location.href = `ticket-detail.html?mode=${mode}&id=${id}`;
}

// Format Date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Touch feedback
document.querySelectorAll('.ticket-card, .mode-btn, .travel-cat, .ent-cat').forEach(el => {
    el.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    el.addEventListener('touchend', function() {
        this.style.transform = '';
    });
});