// Railway Data Configuration - Using Local JSON
const RAILWAY_DATA = {
    stations: [] // Will be loaded from railwayStationsList.json
};

// Load stations data from JSON file
async function loadStationsData() {
    try {
        const response = await fetch('data/railwayStationsList.json');
        const data = await response.json();
        RAILWAY_DATA.stations = data.stations;
        showStatus('Loaded ' + data.stations.length + ' stations', 'success');
    } catch (error) {
        console.error('Error loading stations:', error);
        // Fallback to embedded data if fetch fails
        showStatus('Using offline station data', 'warning');
        RAILWAY_DATA.stations = getCommonStations();
    }
}

let currentPickerType = '';
let selectedDate = null;
let currentMonth = new Date();
let fromStation = null;
let toStation = null;
let debounceTimer = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Load stations data
    loadStationsData();
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Close calendar when clicking outside
    document.addEventListener('click', function(e) {
        const dateSection = document.querySelector('.date-section');
        if (!dateSection.contains(e.target)) {
            document.getElementById('calendarPopup').classList.add('hidden');
        }
    });
});

// Show status banner
function showStatus(message, type = 'info') {
    const banner = document.getElementById('apiStatus');
    banner.textContent = message;
    banner.className = `api-status ${type}`;
    banner.classList.remove('hidden');
    
    setTimeout(() => {
        banner.classList.add('hidden');
    }, 3000);
}

// Debounced search function
function debouncedSearch(query) {
    clearTimeout(debounceTimer);
    const statusEl = document.getElementById('searchStatus');
    
    if (query.length < 2) {
        statusEl.textContent = 'Type at least 2 characters';
        statusEl.className = 'search-status';
        document.getElementById('stationList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>Type at least 2 characters to search</p>
            </div>
        `;
        return;
    }
    
    statusEl.textContent = 'Searching...';
    statusEl.className = 'search-status loading';
    
    debounceTimer = setTimeout(() => {
        searchStationsLocal(query);
    }, 300);
}

// Search stations using local data
function searchStationsLocal(query) {
    const statusEl = document.getElementById('searchStatus');
    const queryLower = query.toLowerCase();
    
    // Filter stations from local data
    const results = RAILWAY_DATA.stations.filter(station => {
        return station.stnName.toLowerCase().includes(queryLower) ||
               station.stnCode.toLowerCase().includes(queryLower) ||
               station.stnCity.toLowerCase().includes(queryLower);
    }).slice(0, 20); // Limit to 20 results
    
    renderStations(results);
    statusEl.textContent = `${results.length} stations found`;
    statusEl.className = 'search-status';
}

// Fallback common stations if JSON fails to load
function getCommonStations() {
    return [
        { stnName: "New Delhi", stnCode: "NDLS", stnCity: "Delhi" },
        { stnName: "Mumbai Central", stnCode: "MMCT", stnCity: "Mumbai" },
        { stnName: "Mumbai CST", stnCode: "CSTM", stnCity: "Mumbai" },
        { stnName: "Howrah Junction", stnCode: "HWH", stnCity: "Kolkata" },
        { stnName: "Chennai Central", stnCode: "MAS", stnCity: "Chennai" },
        { stnName: "Bangalore City", stnCode: "SBC", stnCity: "Bangalore" },
        { stnName: "Pune Junction", stnCode: "PUNE", stnCity: "Pune" },
        { stnName: "Ahmedabad Junction", stnCode: "ADI", stnCity: "Ahmedabad" },
        { stnName: "Hyderabad Deccan", stnCode: "HYB", stnCity: "Hyderabad" },
        { stnName: "Secunderabad Junction", stnCode: "SC", stnCity: "Hyderabad" },
        { stnName: "Jaipur Junction", stnCode: "JP", stnCity: "Jaipur" },
        { stnName: "Lucknow Charbagh", stnCode: "LKO", stnCity: "Lucknow" },
        { stnName: "Kanpur Central", stnCode: "CNB", stnCity: "Kanpur" },
        { stnName: "Patna Junction", stnCode: "PNBE", stnCity: "Patna" },
        { stnName: "Bhopal Junction", stnCode: "BPL", stnCity: "Bhopal" },
        { stnName: "Indore Junction", stnCode: "INDB", stnCity: "Indore" },
        { stnName: "Nagpur Junction", stnCode: "NGP", stnCity: "Nagpur" },
        { stnName: "Visakhapatnam", stnCode: "VSKP", stnCity: "Visakhapatnam" },
        { stnName: "Vijayawada Junction", stnCode: "BZA", stnCity: "Vijayawada" },
        { stnName: "Guwahati", stnCode: "GHY", stnCity: "Guwahati" }
    ];
}

// Open Station Picker
function openStationPicker(type) {
    currentPickerType = type;
    document.getElementById('stationModalTitle').textContent = type === 'from' ? 'Select From Station' : 'Select To Station';
    document.getElementById('stationSearch').value = '';
    document.getElementById('searchStatus').textContent = 'Type at least 2 characters';
    document.getElementById('searchStatus').className = 'search-status';
    document.getElementById('stationList').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-search"></i>
            <p>Start typing to search all Indian railway stations</p>
        </div>
    `;
    document.getElementById('stationModal').classList.remove('hidden');
    document.getElementById('stationSearch').focus();
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Render Stations
function renderStations(stationList) {
    const container = document.getElementById('stationList');
    
    if (stationList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-times-circle"></i>
                <p>No stations found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = stationList.map(station => `
        <div class="station-item" onclick="selectStation('${station.stnCode}', '${station.stnName.replace(/'/g, "\\'")}', '${station.stnCity.replace(/'/g, "\\'")}')">
            <div class="station-info">
                <div class="station-name-item">${station.stnName}</div>
                <div class="station-city">${station.stnCity}</div>
            </div>
            <div class="station-code-item">${station.stnCode}</div>
        </div>
    `).join('');
}

// Select Station
function selectStation(code, name, city) {
    if (currentPickerType === 'from') {
        fromStation = { code, name, city };
        document.getElementById('fromStation').textContent = name;
        document.getElementById('fromStation').dataset.empty = "false";
        document.getElementById('fromCode').textContent = code;
    } else {
        toStation = { code, name, city };
        document.getElementById('toStation').textContent = name;
        document.getElementById('toStation').dataset.empty = "false";
        document.getElementById('toCode').textContent = code;
    }
    closeModal('stationModal');
}

// Swap Stations
function swapStations() {
    const temp = fromStation;
    fromStation = toStation;
    toStation = temp;

    if (fromStation) {
        document.getElementById('fromStation').textContent = fromStation.name;
        document.getElementById('fromCode').textContent = fromStation.code;
    } else {
        document.getElementById('fromStation').textContent = 'Select Station';
        document.getElementById('fromCode').textContent = '';
    }

    if (toStation) {
        document.getElementById('toStation').textContent = toStation.name;
        document.getElementById('toCode').textContent = toStation.code;
    } else {
        document.getElementById('toStation').textContent = 'Select Station';
        document.getElementById('toCode').textContent = '';
    }
}

// Calendar Functions
function openCalendar() {
    const popup = document.getElementById('calendarPopup');
    popup.classList.toggle('hidden');
    if (!popup.classList.contains('hidden')) {
        renderCalendar();
    }
}

function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    document.getElementById('monthYear').textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    let html = '<div class="calendar-day-header">Sun</div>';
    html += '<div class="calendar-day-header">Mon</div>';
    html += '<div class="calendar-day-header">Tue</div>';
    html += '<div class="calendar-day-header">Wed</div>';
    html += '<div class="calendar-day-header">Thu</div>';
    html += '<div class="calendar-day-header">Fri</div>';
    html += '<div class="calendar-day-header">Sat</div>';
    
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
        const isPast = date < new Date(today.setHours(0,0,0,0));
        
        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        if (isPast) classes += ' disabled';
        
        html += `<div class="${classes}" onclick="${isPast ? '' : `selectDate(${year}, ${month}, ${day})`}">${day}</div>`;
    }
    
    document.getElementById('calendarGrid').innerHTML = html;
}

function changeMonth(delta) {
    currentMonth.setMonth(currentMonth.getMonth() + delta);
    renderCalendar();
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    document.getElementById('selectedDate').textContent = selectedDate.toLocaleDateString('en-IN', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
    });
    document.querySelector('.date-display').classList.add('active');
    document.getElementById('calendarPopup').classList.add('hidden');
}

// Search Trains - Using Mock Data
async function searchTrains() {
    if (!fromStation || !toStation) {
        showStatus('Please select both From and To stations', 'error');
        return;
    }
    if (!selectedDate) {
        showStatus('Please select a departure date', 'error');
        return;
    }
    
    if (fromStation.code === toStation.code) {
        showStatus('From and To stations cannot be the same', 'error');
        return;
    }
    
    const btn = document.querySelector('.search-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show mock results
    showMockTrainResults();
    
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search"></i> Search Trains';
}

// Show train results in modal
function showTrainResults(trains) {
    const container = document.getElementById('trainsList');
    
    if (!trains || trains.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-train"></i>
                <p>No trains found for this route and date</p>
            </div>
        `;
    } else {
        container.innerHTML = trains.map(train => `
            <div class="train-card" onclick="selectTrain('${train.trainNumber}')">
                <div class="train-header">
                    <div>
                        <div class="train-name">${train.trainName}</div>
                        <div class="train-number">#${train.trainNumber}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="status-success">${train.trainType || 'Express'}</div>
                    </div>
                </div>
                <div class="train-route">
                    <span>${fromStation.name}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span>${toStation.name}</span>
                </div>
                <div class="train-time">
                    <div class="time-block">
                        <div class="time-label">Departure</div>
                        <div class="time-value">${train.departureTime || '08:00'}</div>
                    </div>
                    <div class="duration">
                        <i class="fas fa-clock"></i>
                        ${train.duration || '12h 30m'}
                    </div>
                    <div class="time-block">
                        <div class="time-label">Arrival</div>
                        <div class="time-value">${train.arrivalTime || '20:30'}</div>
                    </div>
                </div>
                <div class="train-classes">
                    ${(train.classTypes || ['SL', '3A', '2A', '1A']).map(c => 
                        `<span class="class-tag available">${c}</span>`
                    ).join('')}
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('trainResultsModal').classList.remove('hidden');
}

// Mock results for demo
function showMockTrainResults() {
    const mockTrains = [
        {
            trainName: "Rajdhani Express",
            trainNumber: "12951",
            departureTime: "16:35",
            arrivalTime: "08:35",
            duration: "16h 00m",
            classTypes: ["1A", "2A", "3A"]
        },
        {
            trainName: "Duronto Express",
            trainNumber: "12213",
            departureTime: "18:45",
            arrivalTime: "10:30",
            duration: "15h 45m",
            classTypes: ["1A", "2A", "3A", "SL"]
        },
        {
            trainName: "Garib Rath",
            trainNumber: "12203",
            departureTime: "13:10",
            arrivalTime: "06:20",
            duration: "17h 10m",
            classTypes: ["3A", "CC"]
        }
    ];
    showTrainResults(mockTrains);
}

function selectTrain(trainNumber) {
    showStatus(`Train ${trainNumber} selected - Proceeding to booking...`, 'success');
    // Here you would navigate to booking page
}

// Service functions
function openPNRStatus() {
    document.getElementById('pnrModal').classList.remove('hidden');
}

function openTrainStatus() {
    document.getElementById('trainStatusModal').classList.remove('hidden');
}

function openSeatMap() {
    showStatus('Seat map feature coming soon!', 'info');
}

// Check PNR Status - Mock
async function checkPNR() {
    const pnr = document.getElementById('pnrInput').value.trim();
    if (pnr.length !== 10 || !/^\d{10}$/.test(pnr)) {
        showStatus('Please enter a valid 10-digit PNR number', 'error');
        return;
    }
    
    const btn = document.querySelector('#pnrModal .check-btn');
    btn.disabled = true;
    btn.textContent = 'Checking...';
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    document.getElementById('pnrResult').classList.remove('hidden');
    document.getElementById('pnrResult').innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <i class="fas fa-check-circle" style="color: var(--accent); font-size: 2rem; margin-bottom: 0.5rem;"></i>
            <p><strong>PNR: ${pnr}</strong></p>
            <p style="color: var(--accent); margin-top: 0.5rem;">STATUS: CONFIRMED</p>
            <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.5rem;">Coach: B3, Berth: 45 (Lower)</p>
        </div>
    `;
    
    btn.disabled = false;
    btn.textContent = 'Check Status';
}

// Check Train Running Status - Mock
async function checkTrainStatus() {
    const trainNo = document.getElementById('trainNumberInput').value.trim();
    if (!trainNo || !/^\d{5}$/.test(trainNo)) {
        showStatus('Please enter a valid 5-digit train number', 'error');
        return;
    }
    
    const btn = document.querySelector('#trainStatusModal .check-btn');
    btn.disabled = true;
    btn.textContent = 'Checking...';
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    document.getElementById('trainStatusResult').classList.remove('hidden');
    document.getElementById('trainStatusResult').innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <i class="fas fa-train" style="color: var(--accent); font-size: 2rem; margin-bottom: 0.5rem;"></i>
            <p><strong>Train #${trainNo}</strong></p>
            <p style="color: var(--accent); margin-top: 0.5rem;">Running On Time</p>
            <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.5rem;">
                Current: Surat<br>
                Next: Vadodara (in 45 mins)
            </p>
        </div>
    `;
    
    btn.disabled = false;
    btn.textContent = 'Check Status';
}

// Close modals on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });
});