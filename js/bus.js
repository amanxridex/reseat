// Global state
let citiesData = [];
let currentPickerType = '';
let selectedFromCity = null;
let selectedToCity = null;
let selectedDate = null;
let currentMonth = new Date();

// Bus operators and types for generating results
const busOperators = [
    'Orange Travels', 'SRS Travels', 'VRL Travels', 'KSRTC', 'MSRTC',
    'Kerala RTC', 'APSRTC', 'TSRTC', 'RSRTC', 'HRTC', 'GSRTC', 'UPSRTC'
];

const busTypes = ['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Non-AC Seater', 'Volvo AC', 'Mercedes AC'];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadCities();
    initDatePicker();
    setDefaultDate();
    
    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
});

// Load cities from JSON
async function loadCities() {
    try {
        const response = await fetch('data/cities.json');
        if (!response.ok) {
            throw new Error('Failed to load cities');
        }
        citiesData = await response.json();
        console.log(`Loaded ${citiesData.length} cities`);
    } catch (error) {
        console.error('Error loading cities:', error);
        // Fallback cities if fetch fails
        citiesData = [
            { id: '1', name: 'Mumbai', state: 'Maharashtra' },
            { id: '2', name: 'Delhi', state: 'Delhi' },
            { id: '3', name: 'Bengaluru', state: 'Karnataka' },
            { id: '4', name: 'Chennai', state: 'Tamil Nadu' },
            { id: '5', name: 'Hyderabad', state: 'Telangana' },
            { id: '6', name: 'Kolkata', state: 'West Bengal' },
            { id: '7', name: 'Pune', state: 'Maharashtra' },
            { id: '8', name: 'Jaipur', state: 'Rajasthan' },
            { id: '9', name: 'Surat', state: 'Gujarat' },
            { id: '10', name: 'Lucknow', state: 'Uttar Pradesh' }
        ];
    }
}

// Open city picker modal
function openCityPicker(type) {
    currentPickerType = type;
    const modalTitle = document.getElementById('modalTitle');
    const citySearch = document.getElementById('citySearch');
    
    modalTitle.textContent = type === 'from' ? 'Select Departure City' : 'Select Destination City';
    citySearch.value = '';
    
    renderCitiesList(citiesData);
    
    const modal = document.getElementById('cityModal');
    modal.classList.remove('hidden');
    
    // Focus search input after animation
    setTimeout(() => citySearch.focus(), 100);
}

// Render cities list
function renderCitiesList(cities) {
    const citiesList = document.getElementById('citiesList');
    citiesList.innerHTML = '';
    
    if (cities.length === 0) {
        citiesList.innerHTML = '<div class="no-results">No cities found</div>';
        return;
    }
    
    // Sort cities alphabetically by name
    const sortedCities = [...cities].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedCities.forEach(city => {
        const cityItem = document.createElement('div');
        cityItem.className = 'city-item';
        
        // Check if this city is already selected
        const isSelected = (currentPickerType === 'from' && selectedFromCity?.id === city.id) ||
                          (currentPickerType === 'to' && selectedToCity?.id === city.id);
        
        if (isSelected) {
            cityItem.classList.add('selected');
        }
        
        cityItem.innerHTML = `
            <div class="city-info">
                <span class="city-name">${city.name}</span>
                <span class="city-state">${city.state}</span>
            </div>
            <i class="fas fa-check"></i>
        `;
        
        cityItem.onclick = () => selectCity(city);
        citiesList.appendChild(cityItem);
    });
}

// Filter cities based on search
function filterCities(query) {
    if (!query) {
        renderCitiesList(citiesData);
        return;
    }
    
    const filtered = citiesData.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.state.toLowerCase().includes(query.toLowerCase())
    );
    renderCitiesList(filtered);
}

// Select a city
function selectCity(city) {
    if (currentPickerType === 'from') {
        // Check if same as destination
        if (selectedToCity && selectedToCity.id === city.id) {
            alert('Departure and destination cannot be the same');
            return;
        }
        selectedFromCity = city;
        document.getElementById('fromCity').textContent = city.name;
        document.getElementById('fromCode').value = city.id;
    } else {
        // Check if same as departure
        if (selectedFromCity && selectedFromCity.id === city.id) {
            alert('Departure and destination cannot be the same');
            return;
        }
        selectedToCity = city;
        document.getElementById('toCity').textContent = city.name;
        document.getElementById('toCode').value = city.id;
    }
    
    closeModal('cityModal');
}

// Swap cities
function swapCities() {
    // Animate the button
    const swapBtn = document.querySelector('.swap-btn');
    swapBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => {
        swapBtn.style.transform = '';
    }, 300);
    
    // Swap data
    const temp = selectedFromCity;
    selectedFromCity = selectedToCity;
    selectedToCity = temp;
    
    // Update UI
    document.getElementById('fromCity').textContent = selectedFromCity ? selectedFromCity.name : 'Select City';
    document.getElementById('toCity').textContent = selectedToCity ? selectedToCity.name : 'Select City';
    document.getElementById('fromCode').value = selectedFromCity ? selectedFromCity.id : '';
    document.getElementById('toCode').value = selectedToCity ? selectedToCity.id : '';
}

// Open date picker modal
function openDatePicker() {
    const modal = document.getElementById('dateModal');
    modal.classList.remove('hidden');
    renderCalendar();
}

// Initialize date picker
function initDatePicker() {
    const today = new Date();
    currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
}

// Set default date (tomorrow)
function setDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    selectedDate = tomorrow;
    updateDateDisplay();
}

// Update date display
function updateDateDisplay() {
    if (selectedDate) {
        const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
        document.getElementById('travelDate').textContent = selectedDate.toLocaleDateString('en-IN', options);
    }
}

// Render calendar
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    let html = `
        <div class="calendar-header">
            <button onclick="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
            <span>${monthNames[month]} ${year}</span>
            <button onclick="changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day-header">Su</div>
            <div class="calendar-day-header">Mo</div>
            <div class="calendar-day-header">Tu</div>
            <div class="calendar-day-header">We</div>
            <div class="calendar-day-header">Th</div>
            <div class="calendar-day-header">Fr</div>
            <div class="calendar-day-header">Sa</div>
    `;
    
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.getTime() === today.getTime();
        const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
        const isPast = date < today;
        const isFuture = date > new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days limit
        
        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        if (isPast || isFuture) classes += ' disabled';
        
        html += `<div class="${classes}" onclick="selectDate(${year}, ${month}, ${day})">${day}</div>`;
    }
    
    html += '</div>';
    calendar.innerHTML = html;
}

// Change month
function changeMonth(direction) {
    currentMonth.setMonth(currentMonth.getMonth() + direction);
    renderCalendar();
}

// Select date
function selectDate(year, month, day) {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Don't allow past dates or dates > 90 days
    if (date < today || date > new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) {
        return;
    }
    
    selectedDate = date;
    updateDateDisplay();
    closeModal('dateModal');
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
}

// Search buses
function searchBuses() {
    const fromCity = document.getElementById('fromCity').textContent;
    const toCity = document.getElementById('toCity').textContent;
    
    if (fromCity === 'Select City' || toCity === 'Select City') {
        shakeElement(document.querySelector('.route-box'));
        return;
    }
    
    if (!selectedDate) {
        shakeElement(document.querySelector('.date-box'));
        return;
    }
    
    // Show loading state
    const searchBtn = document.querySelector('.search-btn');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    searchBtn.disabled = true;
    
    // Simulate search delay
    setTimeout(() => {
        // Hide empty state, show results
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('resultsSection').classList.remove('hidden');
        
        // Update route title
        const dateStr = selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        document.getElementById('routeTitle').textContent = `${fromCity} → ${toCity}`;
        
        // Generate and display results
        const buses = generateBusResults(fromCity, toCity);
        displayBuses(buses);
        
        // Reset button
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
        
        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 800);
}

// Shake animation for error
function shakeElement(element) {
    element.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// Generate bus results
function generateBusResults(from, to) {
    const buses = [];
    const numBuses = Math.floor(Math.random() * 8) + 5; // 5-12 buses
    
    // Generate seeds based on route for consistent results
    const routeSeed = from.length + to.length;
    
    for (let i = 0; i < numBuses; i++) {
        const operator = busOperators[(i + routeSeed) % busOperators.length];
        const type = busTypes[Math.floor(Math.random() * busTypes.length)];
        
        // Generate random departure time
        const depHour = Math.floor(Math.random() * 24);
        const depMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        const depTime = formatTime(depHour, depMinute);
        
        // Random duration 4-16 hours
        const durationHours = Math.floor(Math.random() * 12) + 4;
        const durationMins = Math.floor(Math.random() * 60);
        const arrTime = addHours(depHour, depMinute, durationHours);
        
        // Random price based on type
        let basePrice = 400;
        if (type.includes('Volvo') || type.includes('Mercedes')) basePrice = 1200;
        else if (type.includes('AC Sleeper')) basePrice = 800;
        else if (type.includes('AC Seater')) basePrice = 600;
        else if (type.includes('Non-AC Sleeper')) basePrice = 500;
        
        const price = basePrice + Math.floor(Math.random() * 300);
        const seats = Math.floor(Math.random() * 20) + 5;
        
        buses.push({
            id: i + 1,
            operator,
            type,
            depTime,
            arrTime,
            duration: `${durationHours}h ${durationMins}m`,
            price,
            seats
        });
    }
    
    // Sort by departure time
    buses.sort((a, b) => timeToMinutes(a.depTime) - timeToMinutes(b.depTime));
    
    return buses;
}

// Format time
function formatTime(hour, minute) {
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${h}:${m} ${ampm}`;
}

// Add hours to time
function addHours(hour, minute, hoursToAdd) {
    let newHour = (hour + hoursToAdd) % 24;
    return formatTime(newHour, minute);
}

// Convert time to minutes for sorting
function timeToMinutes(timeStr) {
    const [time, ampm] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
}

// Display buses
function displayBuses(buses) {
    const busesList = document.getElementById('busesList');
    busesList.innerHTML = '';
    
    document.getElementById('resultsCount').textContent = `${buses.length} buses found`;
    
    buses.forEach((bus, index) => {
        const busCard = document.createElement('div');
        busCard.className = 'bus-card';
        busCard.style.animationDelay = `${index * 0.05}s`;
        busCard.style.animation = 'slideIn 0.3s ease forwards';
        
        busCard.innerHTML = `
            <div class="bus-header">
                <span class="bus-name">${bus.operator}</span>
                <span class="bus-type">${bus.type}</span>
            </div>
            <div class="bus-route">
                <div class="route-time">
                    <span class="time">${bus.depTime}</span>
                    <span class="city">${selectedFromCity.name}</span>
                </div>
                <div class="route-line"></div>
                <div class="route-time">
                    <span class="time">${bus.arrTime}</span>
                    <span class="city">${selectedToCity.name}</span>
                </div>
            </div>
            <div class="bus-footer">
                <span class="bus-price">₹${bus.price}</span>
                <span class="bus-seats">${bus.seats} seats available</span>
            </div>
        `;
        
        busCard.onclick = () => selectBus(bus);
        busesList.appendChild(busCard);
    });
}

// Select bus - store data and redirect to details page
function selectBus(bus) {
    // Calculate arrival date (next day if overnight)
    const depDate = selectedDate;
    const arrDate = new Date(depDate);
    // Simple check - if arrival time is earlier than departure, it's next day
    if (timeToMinutes(bus.arrTime) < timeToMinutes(bus.depTime)) {
        arrDate.setDate(arrDate.getDate() + 1);
    }
    
    const busData = {
        id: bus.id,
        operator: bus.operator,
        type: bus.type,
        from: selectedFromCity.name,
        to: selectedToCity.name,
        depTime: bus.depTime,
        arrTime: bus.arrTime,
        duration: bus.duration,
        price: bus.price,
        availableSeats: bus.seats,
        date: depDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        arrDate: arrDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        amenities: getAmenitiesForType(bus.type)
    };
    
    // Store in sessionStorage
    sessionStorage.setItem('selectedBus', JSON.stringify(busData));
    
    // Redirect to bus details page
    window.location.href = 'bus-details.html';
}

// Get amenities based on bus type
function getAmenitiesForType(type) {
    const baseAmenities = ['gps', 'charging'];
    
    if (type.includes('Volvo') || type.includes('Mercedes')) {
        return [...baseAmenities, 'wifi', 'blanket', 'entertainment', 'water', 'snacks'];
    } else if (type.includes('AC')) {
        return [...baseAmenities, 'water', 'blanket'];
    } else {
        return baseAmenities;
    }
}

// Add animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
    
    // Enter to select first city when searching
    if (e.key === 'Enter' && !document.getElementById('cityModal').classList.contains('hidden')) {
        const firstCity = document.querySelector('.city-item:not(.selected)');
        if (firstCity && !firstCity.classList.contains('no-results')) {
            firstCity.click();
        }
    }
});