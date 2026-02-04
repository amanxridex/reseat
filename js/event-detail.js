let eventData = null;

document.addEventListener('DOMContentLoaded', () => {
    loadEventData();
});

function loadEventData() {
    // Read from sessionStorage (set by college-fest-detail.js)
    const data = sessionStorage.getItem('selectedEvent');
    
    if (!data) {
        // No data found - redirect back to college fests
        window.location.href = 'college-fests.html';
        return;
    }
    
    try {
        eventData = JSON.parse(data);
        
        // Validate required fields
        if (!eventData.name || !eventData.college) {
            throw new Error('Invalid event data');
        }
        
        // Populate the page
        populatePage();
        
    } catch (error) {
        console.error('Error loading event:', error);
        window.location.href = 'college-fests.html';
    }
}

function populatePage() {
    // Hero section
    document.getElementById('eventImage').src = eventData.image || 'assets/college-fest.jpg';
    document.getElementById('eventImage').onerror = function() {
        this.src = 'assets/college-fest.jpg';
    };
    document.getElementById('eventCategory').textContent = eventData.category || 'Event';
    document.getElementById('eventName').textContent = eventData.name;
    document.getElementById('collegeName').textContent = eventData.college.name || eventData.college;
    
    // Stats
    document.getElementById('eventDate').textContent = eventData.date || 'TBA';
    document.getElementById('eventTime').textContent = eventData.time || 'TBA';
    document.getElementById('eventVenue').textContent = eventData.venue || 'TBA';
    
    // About
    document.getElementById('eventDescription').textContent = eventData.description || 'No description available.';
    
    // Lineup
    const lineupContainer = document.getElementById('lineupTags');
    if (eventData.lineup && eventData.lineup.length > 0) {
        lineupContainer.innerHTML = eventData.lineup.map(item => 
            `<span class="lineup-tag">${item}</span>`
        ).join('');
    } else {
        lineupContainer.innerHTML = '<span class="lineup-tag">Coming Soon</span>';
    }
    
    // Ticket price
    document.getElementById('ticketPrice').textContent = `₹${eventData.price || 0}`;
    document.getElementById('footerPrice').textContent = `₹${eventData.price || 0}`;
}

function goBack() {
    window.history.back();
}

function shareEvent() {
    if (navigator.share) {
        navigator.share({
            title: eventData.name,
            text: `Check out ${eventData.name} at ${eventData.college.name || eventData.college}!`,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

function bookTickets() {
    // Store data for booking page (reuse same key, update if needed)
    const bookingData = {
        id: eventData.id,
        name: eventData.name,
        category: eventData.category,
        date: eventData.date,
        time: eventData.time,
        venue: eventData.venue,
        price: eventData.price,
        image: eventData.image,
        description: eventData.description,
        lineup: eventData.lineup,
        college: eventData.college
    };
    
    sessionStorage.setItem('selectedEvent', JSON.stringify(bookingData));
    
    // Redirect to booking page
    window.location.href = 'college-event-booking.html';
}