const API_BASE_URL = 'https://nexus-host-backend.onrender.com/api';

let currentCollegeId = null;
let currentCollege = null;

document.addEventListener('DOMContentLoaded', () => {
    // Get college ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentCollegeId = urlParams.get('id');
    
    if (!currentCollegeId) {
        window.location.href = 'college-fests.html';
        return;
    }
    
    // Load college from sessionStorage (set in previous page)
    const storedCollege = sessionStorage.getItem('selectedCollege');
    if (storedCollege) {
        currentCollege = JSON.parse(storedCollege);
        loadCollegeData();
    }
    
    // Fetch fests from backend
    fetchFests();
});

function loadCollegeData() {
    if (!currentCollege) return;
    
    document.getElementById('collegeName').textContent = currentCollege.name;
    document.getElementById('festName').textContent = currentCollege.name + ' Events';
    document.getElementById('collegeLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${currentCollege.location}`;
    document.getElementById('collegeImage').src = currentCollege.image;
    document.getElementById('collegeImage').onerror = function() {
        this.src = 'assets/college-fest.jpg';
    };
}

async function fetchFests() {
    try {
        const response = await fetch(`${API_BASE_URL}/fest/by-college/${currentCollegeId}`);
        const result = await response.json();
        
        if (result.success) {
            renderEvents(result.fests);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to fetch fests:', error);
        document.getElementById('eventsGrid').innerHTML = `
            <div class="no-events">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load events. Please try again later.</p>
            </div>
        `;
    }
}

function renderEvents(events) {
    const grid = document.getElementById('eventsGrid');
    
    document.getElementById('eventCount').textContent = `${events.length} event${events.length !== 1 ? 's' : ''}`;
    
    if (events.length === 0) {
        grid.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-times"></i>
                <p>No events announced yet</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = events.map(event => `
        <div class="event-card" onclick="openEvent('${event.id}')">
            <img src="${event.image}" alt="${event.name}" class="event-image" onerror="this.src='assets/college-fest.jpg'">
            <div class="event-content">
                <span class="event-category">${event.category}</span>
                <h4 class="event-name">${event.name}</h4>
                <div class="event-meta">
                    <span><i class="fas fa-calendar"></i> ${event.date}</span>
                    <span><i class="fas fa-clock"></i> ${event.time}</span>
                    <span><i class="fas fa-map-pin"></i> ${event.venue}</span>
                </div>
            </div>
            <div class="event-price">
                <span>₹${event.price}</span>
            </div>
        </div>
    `).join('');
}

function openEvent(eventId) {
    window.location.href = `event-detail.html?id=${eventId}&college=${currentCollegeId}`;
}