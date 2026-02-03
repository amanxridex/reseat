// Airport Data from JSON
const AIRPORT_DATA = {
    airports: []
};

// Load airports from JSON file
async function loadAirports() {
    try {
        const response = await fetch('data/airports.json');
        const data = await response.json();
        AIRPORT_DATA.airports = data.airports;
        console.log(`Loaded ${data.airports.length} airports`);
    } catch (error) {
        console.error('Error loading airports:', error);
        // Fallback data
        AIRPORT_DATA.airports = [
            { IATA_code: 'DEL', ICAO_code: 'VIDP', airport_name: 'Indira Gandhi International Airport', city_name: 'New Delhi' },
            { IATA_code: 'BOM', ICAO_code: 'VABB', airport_name: 'Chhatrapati Shivaji International Airport', city_name: 'Mumbai' },
            { IATA_code: 'BLR', ICAO_code: 'VOBL', airport_name: 'Bengaluru International Airport', city_name: 'Bangalore' },
            { IATA_code: 'HYD', ICAO_code: 'VOHS', airport_name: 'Hyderabad International Airport', city_name: 'Hyderabad' },
            { IATA_code: 'MAA', ICAO_code: 'VOMM', airport_name: 'Chennai International Airport', city_name: 'Chennai' }
        ];
    }
}

// State
let tripType = 'oneway';
let fromAirport = null;
let toAirport = null;
let departDate = null;
let returnDate = null;
let datePickerMode = 'depart'; // 'depart' or 'return'
let adults = 1;
let children = 0;
let infants = 0;
let travelClass = 'economy';
let currentAirportField = 'from';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAirports();
    renderCalendar();
    
    // Set default dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    departDate = tomorrow;
    updateDepartDisplay();
});

// Trip type
function setTripType(radio) {
    tripType = radio.value;
    document.querySelectorAll('.radio-label').forEach(l => l.classList.remove('active'));
    radio.parentElement.classList.add('active');
    
    const returnField = document.getElementById('returnField');
    if (tripType === 'oneway') {
        returnField.classList.add('disabled');
        document.getElementById('returnDate').textContent = 'Add Return';
    } else {
        returnField.classList.remove('disabled');
        if (!returnDate) {
            const twoDaysAfter = new Date(departDate);
            twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);
            returnDate = twoDaysAfter;
            updateReturnDisplay();
        }
    }
}

// Airport picker
function openAirportPicker(field) {
    currentAirportField = field;
    document.getElementById('airportModalTitle').textContent = field === 'from' ? 'Select Origin' : 'Select Destination';
    document.getElementById('airportModal').classList.remove('hidden');
    document.getElementById('airportSearch').value = '';
    document.getElementById('searchStatus').textContent = `Type to search ${AIRPORT_DATA.airports.length || 132} airports`;
    renderAirportList();
}

function renderAirportList(filter = '') {
    const list = document.getElementById('airportList');
    const statusEl = document.getElementById('searchStatus');
    
    let filtered = AIRPORT_DATA.airports;
    
    if (filter) {
        const filterLower = filter.toLowerCase();
        filtered = AIRPORT_DATA.airports.filter(airport => 
            airport.city_name.toLowerCase().includes(filterLower) || 
            airport.IATA_code.toLowerCase().includes(filterLower) ||
            airport.airport_name.toLowerCase().includes(filterLower)
        );
    }
    
    // Limit to 20 results for performance
    filtered = filtered.slice(0, 20);
    
    statusEl.textContent = `${filtered.length} airports found`;
    
    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No airports found</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = filtered.map(airport => `
        <div class="city-item" onclick="selectAirport('${airport.IATA_code}')">
            <i class="fas fa-plane"></i>
            <div class="city-info">
                <span class="city-name">${airport.city_name}</span>
                <span class="city-airport">${airport.airport_name}</span>
            </div>
            <span class="city-code">${airport.IATA_code}</span>
        </div>
    `).join('');
}

function filterAirports(query) {
    renderAirportList(query);
}

function selectAirport(code) {
    const airport = AIRPORT_DATA.airports.find(a => a.IATA_code === code);
    if (!airport) return;
    
    if (currentAirportField === 'from') {
        fromAirport = airport;
        document.getElementById('fromAirport').innerHTML = `${airport.city_name} <span class="code">(${airport.IATA_code})</span>`;
    } else {
        toAirport = airport;
        document.getElementById('toAirport').innerHTML = `${airport.city_name} <span class="code">(${airport.IATA_code})</span>`;
    }
    closeModal('airportModal');
}

function swapAirports() {
    if (!fromAirport && !toAirport) return;
    
    const temp = fromAirport;
    fromAirport = toAirport;
    toAirport = temp;
    
    if (fromAirport) {
        document.getElementById('fromAirport').innerHTML = `${fromAirport.city_name} <span class="code">(${fromAirport.IATA_code})</span>`;
    } else {
        document.getElementById('fromAirport').innerHTML = `Select <span class="code">(---)</span>`;
    }
    
    if (toAirport) {
        document.getElementById('toAirport').innerHTML = `${toAirport.city_name} <span class="code">(${toAirport.IATA_code})</span>`;
    } else {
        document.getElementById('toAirport').innerHTML = `Select <span class="code">(---)</span>`;
    }
}

// Date picker
function openDatePicker(mode = 'depart') {
    datePickerMode = mode;
    document.getElementById('dateModal').classList.remove('hidden');
    renderCalendar();
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let html = '';
    // Show 2 months
    for (let m = 0; m < 2; m++) {
        const monthIdx = (currentMonth + m) % 12;
        const year = currentYear + Math.floor((currentMonth + m) / 12);
        
        html += `
            <div class="month">
                <h4>${months[monthIdx]} ${year}</h4>
                <div class="weekdays">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
                <div class="days">
                    ${renderDays(monthIdx, year)}
                </div>
            </div>
        `;
    }
    calendar.innerHTML = html;
}

function renderDays(month, year) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let html = '';
    
    // Empty slots for days before month starts
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
        html += '<span class="empty"></span>';
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const isToday = date.getTime() === today.getTime();
        const isPast = date < today;
        const isDepartSelected = departDate && date.getTime() === departDate.getTime();
        const isReturnSelected = returnDate && date.getTime() === returnDate.getTime();
        
        let classes = 'day';
        if (isToday) classes += ' today';
        if (isDepartSelected) classes += ' selected';
        if (isReturnSelected) classes += ' selected-return';
        if (isPast) classes += ' disabled';
        
        const price = Math.floor(Math.random() * 3000) + 3500;
        
        html += `
            <span class="${classes}" ${!isPast ? `onclick="selectDate(${year}, ${month}, ${d})"` : ''}>
                <span class="day-num">${d}</span>
                ${!isPast ? `<span class="day-price">₹${price}</span>` : ''}
            </span>
        `;
    }
    return html;
}

function selectDate(year, month, day) {
    const selectedDate = new Date(year, month, day);
    
    if (datePickerMode === 'depart') {
        departDate = selectedDate;
        updateDepartDisplay();
        
        // If return date is before new depart date, update it
        if (tripType === 'roundtrip' && returnDate && returnDate <= departDate) {
            const nextDay = new Date(departDate);
            nextDay.setDate(nextDay.getDate() + 1);
            returnDate = nextDay;
            updateReturnDisplay();
        }
    } else {
        if (selectedDate <= departDate) {
            alert('Return date must be after departure date');
            return;
        }
        returnDate = selectedDate;
        updateReturnDisplay();
    }
    
    closeModal('dateModal');
}

function updateDepartDisplay() {
    if (departDate) {
        document.getElementById('departDate').textContent = formatDate(departDate);
    }
}

function updateReturnDisplay() {
    if (returnDate) {
        document.getElementById('returnDate').textContent = formatDate(returnDate);
        document.getElementById('returnDate').classList.remove('return-text');
    }
}

function formatDate(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
}

// Passenger picker
function openPassengerPicker() {
    document.getElementById('passengerModal').classList.remove('hidden');
}

function updateCount(type, change) {
    if (type === 'adults') {
        adults = Math.max(1, Math.min(9, adults + change));
        document.getElementById('adultsCount').textContent = adults;
    } else if (type === 'children') {
        children = Math.max(0, Math.min(6, children + change));
        document.getElementById('childrenCount').textContent = children;
    } else if (type === 'infants') {
        infants = Math.max(0, Math.min(adults, infants + change)); // Infants <= adults
        document.getElementById('infantsCount').textContent = infants;
    }
}

function setClass(radio) {
    travelClass = radio.value;
}

function applyPassengers() {
    const className = travelClass === 'economy' ? 'Economy' : travelClass === 'premium' ? 'Premium Economy' : 'Business';
    const total = adults + children + infants;
    document.getElementById('passengerClass').innerHTML = `${total} Traveller${total > 1 ? 's' : ''}, ${className} <i class="fas fa-chevron-down"></i>`;
    closeModal('passengerModal');
}

// Modal close
function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') && !e.target.classList.contains('hidden')) {
        e.target.classList.add('hidden');
    }
});

// Search
function searchFlights() {
    if (!fromAirport) {
        alert('Please select departure airport');
        return;
    }
    if (!toAirport) {
        alert('Please select destination airport');
        return;
    }
    if (fromAirport.IATA_code === toAirport.IATA_code) {
        alert('Departure and destination cannot be the same');
        return;
    }
    if (!departDate) {
        alert('Please select departure date');
        return;
    }
    
    const params = new URLSearchParams({
        from: fromAirport.IATA_code,
        fromCity: fromAirport.city_name,
        to: toAirport.IATA_code,
        toCity: toAirport.city_name,
        depart: departDate.toISOString().split('T')[0],
        return: tripType === 'roundtrip' && returnDate ? returnDate.toISOString().split('T')[0] : '',
        adults: adults,
        children: children,
        infants: infants,
        class: travelClass,
        tripType: tripType
    });
    
    window.location.href = `flight-results.html?${params.toString()}`;
}