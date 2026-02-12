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
    
    // Load event data from API
    loadEventData();
});

async function loadEventData() {
    try {
        console.log('Fetching event:', eventId);
        
        const response = await fetch(`${API_BASE_URL}/fest/public/${eventId}`);
        const result = await response.json();
        
        console.log('API Response:', result);
        
        if (result.success) {
            eventData = result.fest;
            sessionStorage.setItem('selectedEvent', JSON.stringify(eventData));
            populatePage();
        } else {
            throw new Error(result.error || 'Failed to load event');
        }
        
    } catch (error) {
        console.error('Error loading event:', error);
        alert('Failed to load event details. Please try again.');
        window.location.href = 'college-fests.html';
    }
}

function populatePage() {
    if (!eventData) return;
    
    console.log('Populating page with:', eventData);
    
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
    
    // Coordinator Info
    if (eventData.college?.hostName) {
        document.getElementById('coordinatorSection').style.display = 'block';
        document.getElementById('coordinatorName').textContent = eventData.college.hostName;
        document.getElementById('coordinatorPhone').textContent = eventData.college.hostPhone || 'Contact via app';
        
        if (eventData.college.hostPhone) {
            document.getElementById('contactBtn').href = `tel:${eventData.college.hostPhone}`;
        }
    }
    
    // ID Requirements
    if (eventData.idRequired) {
        document.getElementById('idSection').style.display = 'block';
        const idFields = eventData.idFields?.join(', ') || 'ID Card';
        document.getElementById('idRequirements').textContent = 
            `Please carry your ${idFields} for verification at entry.`;
    }
    
    // Audience Info
    const audienceTags = document.getElementById('audienceTags');
    const audiences = [];
    if (eventData.allowOtherColleges) audiences.push('Other Colleges');
    if (eventData.allowOutside) audiences.push('Outside Students');
    if (eventData.allowGeneralPublic) audiences.push('General Public');
    if (audiences.length === 0) audiences.push('Same College Only');
    
    audienceTags.innerHTML = audiences.map(audience => 
        `<span class="audience-tag">${audience}</span>`
    ).join('');
    
    // Lineup
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