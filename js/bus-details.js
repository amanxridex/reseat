// Bus data from sessionStorage
let busData = null;
let selectedSeats = [];
const SEAT_PRICE = 0; // Will be set from bus data

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBusData();
    renderAmenities();
    renderPhotos();
    renderSeatMap('lower');
    renderReviews();
});

// Load bus data from sessionStorage
function loadBusData() {
    const data = sessionStorage.getItem('selectedBus');
    if (!data) {
        // Fallback data for testing
        busData = {
            operator: 'RSRTC',
            type: 'Non-AC Seater',
            from: 'Achnhera',
            to: 'Adilabad',
            depTime: '12:30 AM',
            arrTime: '7:30 AM',
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            duration: '7h',
            price: 656,
            amenities: ['wifi', 'charging', 'blanket', 'water', 'entertainment', 'gps'],
            photos: ['Interior', 'Seats', 'Exterior']
        };
    } else {
        busData = JSON.parse(data);
    }
    
    SEAT_PRICE = busData.price;
    updateUI();
}

// Update UI with bus data
function updateUI() {
    document.getElementById('operatorName').textContent = busData.operator;
    document.getElementById('busType').textContent = busData.type;
    document.getElementById('depTime').textContent = busData.depTime;
    document.getElementById('arrTime').textContent = busData.arrTime;
    document.getElementById('fromCity').textContent = busData.from;
    document.getElementById('toCity').textContent = busData.to;
    document.getElementById('travelDate').textContent = busData.date;
    document.getElementById('duration').textContent = busData.duration;
    
    // Calculate arrival date (next day if overnight)
    const arrDate = new Date();
    arrDate.setDate(arrDate.getDate() + 1);
    document.getElementById('arrDate').textContent = arrDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    
    updateFare();
}

// Render amenities
function renderAmenities() {
    const amenities = [
        { icon: 'fa-wifi', label: 'Free WiFi' },
        { icon: 'fa-plug', label: 'Charging Point' },
        { icon: 'fa-bed', label: 'Blanket' },
        { icon: 'fa-tint', label: 'Water Bottle' },
        { icon: 'fa-tv', label: 'Entertainment' },
        { icon: 'fa-map-marker-alt', label: 'Live Tracking' },
        { icon: 'fa-snowflake', label: 'AC' },
        { icon: 'fa-toilet', label: 'Washroom' }
    ];
    
    const grid = document.getElementById('amenitiesGrid');
    grid.innerHTML = amenities.map(a => `
        <div class="amenity-item">
            <i class="fas ${a.icon}"></i>
            <span>${a.label}</span>
        </div>
    `).join('');
}

// Render photos
function renderPhotos() {
    const photos = [
        { label: 'Bus Interior', color: '#1a1a2e' },
        { label: 'Seating View', color: '#16213e' },
        { label: 'Exterior', color: '#0f3460' }
    ];
    
    const scroll = document.getElementById('photosScroll');
    scroll.innerHTML = photos.map(p => `
        <div class="photo-card" style="background: ${p.color};">
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                <i class="fas fa-image" style="font-size: 2rem; opacity: 0.3;"></i>
            </div>
            <div class="photo-label">${p.label}</div>
        </div>
    `).join('');
}

// Render seat map
function renderSeatMap(deck) {
    const seatMap = document.getElementById('seatMap');
    const rows = deck === 'lower' ? 6 : 8;
    const cols = 3; // 2 left + 1 right (aisle)
    
    let html = '';
    
    // Driver seat indicator
    html += `
        <div class="seat-row">
            <div class="seat-cluster">
                <div class="seat-driver"><i class="fas fa-steering-wheel"></i></div>
            </div>
            <div class="seat-cluster right">
                <div class="seat available" onclick="toggleSeat(this, 'D')">
                    <span class="seat-number">D</span>
                    <span class="seat-price">₹${SEAT_PRICE}</span>
                </div>
            </div>
        </div>
    `;
    
    // Generate seats
    for (let row = 1; row <= rows; row++) {
        const leftSeats = [1, 2].map(s => {
            const seatNum = `${deck === 'upper' ? 'U' : 'L'}${row}${s}`;
            const isOccupied = Math.random() > 0.7;
            return createSeat(seatNum, isOccupied);
        }).join('');
        
        const rightSeats = [3].map(s => {
            const seatNum = `${deck === 'upper' ? 'U' : 'L'}${row}${s}`;
            const isOccupied = Math.random() > 0.7;
            return createSeat(seatNum, isOccupied);
        }).join('');
        
        html += `
            <div class="seat-row">
                <div class="seat-cluster">${leftSeats}</div>
                <div class="seat-cluster right">${rightSeats}</div>
            </div>
        `;
    }
    
    seatMap.innerHTML = html;
}

function createSeat(number, occupied) {
    if (occupied) {
        return `<div class="seat occupied" data-seat="${number}"><span class="seat-number">${number}</span></div>`;
    }
    return `
        <div class="seat available" onclick="toggleSeat(this, '${number}')" data-seat="${number}">
            <span class="seat-number">${number}</span>
            <span class="seat-price">₹${SEAT_PRICE}</span>
        </div>
    `;
}

// Switch deck
function switchDeck(deck) {
    document.querySelectorAll('.deck-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    renderSeatMap(deck);
}

// Toggle seat selection
function toggleSeat(element, seatNum) {
    if (element.classList.contains('occupied')) return;
    
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
        selectedSeats = selectedSeats.filter(s => s !== seatNum);
    } else {
        if (selectedSeats.length >= 6) {
            showToast('Maximum 6 seats allowed');
            return;
        }
        element.classList.add('selected');
        selectedSeats.push(seatNum);
    }
    
    updateSelectedSeats();
    updateFare();
}

// Update selected seats display
function updateSelectedSeats() {
    const list = document.getElementById('selectedSeatsList');
    list.textContent = selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None';
}

// Update fare calculation
function updateFare() {
    const baseFare = selectedSeats.length * SEAT_PRICE;
    const gst = Math.round(baseFare * 0.05);
    const total = baseFare + gst;
    
    document.getElementById('baseFare').textContent = `₹${baseFare}`;
    document.getElementById('gstFare').textContent = `₹${gst}`;
    document.getElementById('totalFare').textContent = `₹${total}`;
    
    const proceedBtn = document.getElementById('proceedBtn');
    proceedBtn.disabled = selectedSeats.length === 0;
    proceedBtn.textContent = selectedSeats.length > 0 
        ? `Proceed to Book (${selectedSeats.length} seats)` 
        : 'Select Seats to Continue';
}

// Render reviews
function renderReviews() {
    const reviews = [
        { name: 'Rahul Sharma', rating: 5, text: 'Very comfortable journey. Bus was on time and clean.', date: '2 days ago' },
        { name: 'Priya Patel', rating: 4, text: 'Good service but charging point was not working.', date: '1 week ago' },
        { name: 'Amit Kumar', rating: 5, text: 'Excellent experience! Will definitely book again.', date: '2 weeks ago' }
    ];
    
    const list = document.getElementById('reviewsList');
    list.innerHTML = reviews.map(r => `
        <div class="review-item">
            <div class="review-header">
                <span class="reviewer-name">${r.name}</span>
                <span class="review-rating">${'★'.repeat(r.rating)}</span>
            </div>
            <p class="review-text">${r.text}</p>
            <div class="review-date">${r.date}</div>
        </div>
    `).join('');
}

// Proceed to booking
function proceedToBooking() {
    if (selectedSeats.length === 0) return;
    
    const bookingData = {
        ...busData,
        selectedSeats: selectedSeats,
        totalFare: document.getElementById('totalFare').textContent,
        timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Show confirmation modal or redirect
    const confirmed = confirm(
        `🚌 ${busData.operator}\n` +
        `📍 ${busData.from} → ${busData.to}\n` +
        `🎫 Seats: ${selectedSeats.join(', ')}\n` +
        `💰 Total: ${bookingData.totalFare}\n\n` +
        `Proceed to payment?`
    );
    
    if (confirmed) {
        window.location.href = 'booking.html';
    }
}

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--card-bg);
        color: var(--text);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border: 1px solid var(--border);
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}