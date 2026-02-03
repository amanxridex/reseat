// All Indian Railway Stations with codes
const stations = [
    { name: "Mumbai CST", code: "CSTM", city: "Mumbai" },
    { name: "Mumbai Central", code: "MMCT", city: "Mumbai" },
    { name: "Bandra Terminus", code: "BDTS", city: "Mumbai" },
    { name: "Lokmanya Tilak Terminus", code: "LTT", city: "Mumbai" },
    { name: "Delhi Junction", code: "DLI", city: "Delhi" },
    { name: "New Delhi", code: "NDLS", city: "Delhi" },
    { name: "Hazrat Nizamuddin", code: "NZM", city: "Delhi" },
    { name: "Anand Vihar Terminal", code: "ANVT", city: "Delhi" },
    { name: "Chennai Central", code: "MAS", city: "Chennai" },
    { name: "Chennai Egmore", code: "MS", city: "Chennai" },
    { name: "Howrah Junction", code: "HWH", city: "Kolkata" },
    { name: "Sealdah", code: "SDAH", city: "Kolkata" },
    { name: "Kolkata Chitpur", code: "KOAA", city: "Kolkata" },
    { name: "Bangalore City", code: "SBC", city: "Bangalore" },
    { name: "Yesvantpur Junction", code: "YPR", city: "Bangalore" },
    { name: "Hyderabad Deccan", code: "HYB", city: "Hyderabad" },
    { name: "Secunderabad Junction", code: "SC", city: "Hyderabad" },
    { name: "Ahmedabad Junction", code: "ADI", city: "Ahmedabad" },
    { name: "Pune Junction", code: "PUNE", city: "Pune" },
    { name: "Jaipur Junction", code: "JP", city: "Jaipur" },
    { name: "Lucknow Charbagh", code: "LKO", city: "Lucknow" },
    { name: "Kanpur Central", code: "CNB", city: "Kanpur" },
    { name: "Patna Junction", code: "PNBE", city: "Patna" },
    { name: "Bhubaneswar", code: "BBS", city: "Bhubaneswar" },
    { name: "Bhopal Junction", code: "BPL", city: "Bhopal" },
    { name: "Indore Junction", code: "INDB", city: "Indore" },
    { name: "Nagpur Junction", code: "NGP", city: "Nagpur" },
    { name: "Visakhapatnam", code: "VSKP", city: "Visakhapatnam" },
    { name: "Vijayawada Junction", code: "BZA", city: "Vijayawada" },
    { name: "Coimbatore Junction", code: "CBE", city: "Coimbatore" },
    { name: "Thiruvananthapuram Central", code: "TVC", city: "Trivandrum" },
    { name: "Kochuveli", code: "KCVL", city: "Trivandrum" },
    { name: "Ernakulam Junction", code: "ERS", city: "Kochi" },
    { name: "Madurai Junction", code: "MDU", city: "Madurai" },
    { name: "Trichy Junction", code: "TPJ", city: "Trichy" },
    { name: "Varanasi Junction", code: "BSB", city: "Varanasi" },
    { name: "Allahabad Junction", code: "PRYJ", city: "Prayagraj" },
    { name: "Gorakhpur Junction", code: "GKP", city: "Gorakhpur" },
    { name: "Guwahati", code: "GHY", city: "Guwahati" },
    { name: "Amritsar Junction", code: "ASR", city: "Amritsar" },
    { name: "Chandigarh", code: "CDG", city: "Chandigarh" },
    { name: "Dehradun", code: "DDN", city: "Dehradun" },
    { name: "Jammu Tawi", code: "JAT", city: "Jammu" },
    { name: "Srinagar", code: "SINA", city: "Srinagar" },
    { name: "Ranchi", code: "RNC", city: "Ranchi" },
    { name: "Bhubaneswar", code: "BBS", city: "Bhubaneswar" },
    { name: "Raipur Junction", code: "R", city: "Raipur" },
    { name: "Bilaspur Junction", code: "BSP", city: "Bilaspur" },
    { name: "Surat", code: "ST", city: "Surat" },
    { name: "Vadodara Junction", code: "BRC", city: "Vadodara" },
    { name: "Rajkot Junction", code: "RJT", city: "Rajkot" },
    { name: "Thiruvananthapuram Central", code: "TVC", city: "Trivandrum" },
    { name: "Mangalore Central", code: "MAQ", city: "Mangalore" },
    { name: "Goa Madgaon", code: "MAO", city: "Goa" },
    { name: "Thane", code: "TNA", city: "Mumbai" },
    { name: "Kalyan Junction", code: "KYN", city: "Mumbai" },
    { name: "Vasai Road", code: "BSR", city: "Mumbai" },
    { name: "Panvel", code: "PNVL", city: "Mumbai" },
    { name: "Dadar", code: "DR", city: "Mumbai" },
    { name: "Borivali", code: "BVI", city: "Mumbai" },
    { name: "Andheri", code: "ADH", city: "Mumbai" },
    { name: "Ghatkopar", code: "GC", city: "Mumbai" },
    { name: "Thane", code: "TNA", city: "Mumbai" },
    { name: "Kurla", code: "CLA", city: "Mumbai" },
    { name: "Vikhroli", code: "VK", city: "Mumbai" },
    { name: "Bhandup", code: "BND", city: "Mumbai" },
    { name: "Nerul", code: "NEU", city: "Mumbai" },
    { name: "Belapur CBD", code: "BEPR", city: "Mumbai" },
    { name: "Vashi", code: "VSH", city: "Mumbai" },
    { name: "Ghansoli", code: "GNSL", city: "Mumbai" },
    { name: "Airoli", code: "AIRL", city: "Mumbai" },
    { name: "Rabale", code: "RABE", city: "Mumbai" }
];

let currentPickerType = '';
let selectedDate = null;
let currentMonth = new Date();
let fromStation = null;
let toStation = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
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

// Open Station Picker
function openStationPicker(type) {
    currentPickerType = type;
    document.getElementById('stationModalTitle').textContent = type === 'from' ? 'Select From Station' : 'Select To Station';
    document.getElementById('stationSearch').value = '';
    document.getElementById('stationModal').classList.remove('hidden');
    renderStations(stations);
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Render Stations
function renderStations(stationList) {
    const container = document.getElementById('stationList');
    container.innerHTML = stationList.map(station => `
        <div class="station-item" onclick="selectStation('${station.code}', '${station.name}', '${station.city}')">
            <div class="station-info">
                <div class="station-name-item">${station.name}</div>
                <div class="station-city">${station.city}</div>
            </div>
            <div class="station-code-item">${station.code}</div>
        </div>
    `).join('');
}

// Filter Stations
function filterStations(query) {
    const filtered = stations.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.code.toLowerCase().includes(query.toLowerCase()) ||
        s.city.toLowerCase().includes(query.toLowerCase())
    );
    renderStations(filtered);
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
    
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days
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
        month: 'short' 
    });
    document.querySelector('.date-display').classList.add('active');
    document.getElementById('calendarPopup').classList.add('hidden');
}

// Search Trains
function searchTrains() {
    if (!fromStation || !toStation) {
        alert('Please select both From and To stations');
        return;
    }
    if (!selectedDate) {
        alert('Please select a departure date');
        return;
    }
    
    const filter = document.querySelector('.filter-btn.active').dataset.filter;
    console.log('Searching:', { from: fromStation, to: toStation, date: selectedDate, filter });
    alert(`Searching trains from ${fromStation.name} to ${toStation.name} on ${selectedDate.toDateString()}`);
}

// Service functions
function openPNRStatus() {
    document.getElementById('pnrModal').classList.remove('hidden');
}

function openTrainStatus() {
    document.getElementById('trainStatusModal').classList.remove('hidden');
}

function openSeatMap() {
    alert('Seat map feature coming soon!');
}

function checkPNR() {
    const pnr = document.getElementById('pnrInput').value;
    if (pnr.length !== 10) {
        alert('Please enter a valid 10-digit PNR number');
        return;
    }
    document.getElementById('pnrResult').classList.remove('hidden');
    document.getElementById('pnrResult').innerHTML = '<p class="text-center">Checking PNR status...</p>';
}

function checkTrainStatus() {
    const trainNo = document.getElementById('trainNumberInput').value;
    if (!trainNo) {
        alert('Please enter a train number');
        return;
    }
    document.getElementById('trainStatusResult').classList.remove('hidden');
    document.getElementById('trainStatusResult').innerHTML = '<p class="text-center">Fetching train status...</p>';
}

// Close modals on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });
});