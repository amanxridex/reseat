const API_BASE_URL = 'https://nexus-host-backend.onrender.com/api';

let eventData = null;
let eventId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    eventId = urlParams.get('id');
    
    if (!eventId) {
        window.location.href = 'college-fests.html';
        return;
    }
    
    loadEventData();
});

async function loadEventData() {
    try {
        // Try to get from sessionStorage first (for faster loading)
        const cachedData = sessionStorage.getItem('selectedEvent');
        if (cachedData) {
            eventData = JSON.parse(cachedData);
            populatePage(); // Show cached data immediately
        }
        
        // Fetch fresh data from backend
        const response = await fetch(`${API_BASE_URL}/fest/public/${eventId}`);
        const result = await response.json();
        
        if (result.success) {
            eventData = result.fest;
            sessionStorage.setItem('selectedEvent', JSON.stringify(eventData));
            populatePage(); // Update with fresh data
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error loading event:', error);
        // If we have cached data, keep showing it
        if (!eventData) {
            alert('Failed to load event details');
            window.location.href = 'college-fests.html';
        }
    }
}

function populatePage() {
    if (!eventData) return;
    
    // Hero section
    document.getElementById('eventImage').src = eventData.image || 'assets/college-fest.jpg';
    document.getElementById('eventImage').onerror = function() {
        this.src = 'assets/college-fest.jpg';
    };
    document.getElementById('eventCategory').textContent = eventData.category || 'Event';
    document.getElementById('eventName').textContent = eventData.name;
    document.getElementById('collegeName').textContent = eventData.college?.name || 'Unknown College';
    
    // Stats
    document.getElementById('eventDate').textContent = eventData.date || 'TBA';
    document.getElementById('eventTime').textContent = eventData.time || 'TBA';
    document.getElementById('eventVenue').textContent = eventData.venue || 'TBA';
    
    // About
    document.getElementById('eventDescription').textContent = eventData.description || 'No description available.';
    
    // Lineup (if available) or show tags based on fest type
    const lineupContainer = document.getElementById('lineupTags');
    const lineupItems = eventData.lineup && eventData.lineup.length > 0 
        ? eventData.lineup 
        : generateLineupFromType(eventData.category);
    
    lineupContainer.innerHTML = lineupItems.map(item => 
        `<span class="lineup-tag">${item}</span>`
    ).join('');
    
    // Ticket price
    const price = eventData.price || 0;
    document.getElementById('ticketPrice').textContent = `₹${price}`;
    document.getElementById('footerPrice').textContent = `₹${price}`;
    
    // Update page title
    document.title = `${eventData.name} | Nexus`;
}

// Generate lineup tags based on fest type
function generateLineupFromType(category) {
    const lineups = {
        'Cultural Fest': ['Music', 'Dance', 'Art', 'Fashion Show'],
        'Technical Fest': ['Hackathon', 'Coding', 'Robotics', 'Workshops'],
        'Sports Fest': ['Tournaments', 'Matches', 'Competitions'],
        'Literary Fest': ['Debates', 'Poetry', 'Quizzes', 'Writing'],
        'Management Fest': ['B-Plan', 'Case Study', 'Marketing'],
        'Music Fest': ['Live Bands', 'DJ Night', 'Solo Performances'],
        'Youth Fest': ['Cultural', 'Sports', 'Fun Events']
    };
    return lineups[category] || ['Exciting Events', 'Competitions', 'Performances'];
}

function goBack() {
    window.history.back();
}

function shareEvent() {
    const shareData = {
        title: eventData?.name || 'Event',
        text: `Check out ${eventData?.name} at ${eventData?.college?.name || 'Nexus'}!`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

function bookTickets() {
    if (!eventData) return;
    
    // Store complete data for booking page
    sessionStorage.setItem('bookingEvent', JSON.stringify(eventData));
    
    // Redirect to booking page
    window.location.href = 'college-event-booking.html';
}