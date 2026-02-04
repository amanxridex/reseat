let eventData = null;

document.addEventListener('DOMContentLoaded', () => {
    loadEventData();
});

function loadEventData() {
    const data = sessionStorage.getItem('selectedEvent');
    if (!data) {
        window.location.href = 'college-fests.html';
        return;
    }
    
    eventData = JSON.parse(data);
    
    // Populate page
    document.getElementById('eventImage').src = eventData.image;
    document.getElementById('eventImage').onerror = function() {
        this.src = 'assets/college-fest.jpg';
    };
    document.getElementById('eventCategory').textContent = eventData.category;
    document.getElementById('eventName').textContent = eventData.name;
    document.getElementById('collegeName').textContent = eventData.college.name;
    document.getElementById('eventDate').textContent = eventData.date;
    document.getElementById('eventTime').textContent = eventData.time;
    document.getElementById('eventVenue').textContent = eventData.venue;
    document.getElementById('eventDescription').textContent = eventData.description;
    document.getElementById('ticketPrice').textContent = `₹${eventData.price}`;
    document.getElementById('footerPrice').textContent = `₹${eventData.price}`;
    
    // Lineup tags
    const lineupContainer = document.getElementById('lineupTags');
    lineupContainer.innerHTML = eventData.lineup.map(item => 
        `<span class="lineup-tag">${item}</span>`
    ).join('');
}

function goBack() {
    const collegeId = eventData?.college ? Object.keys(collegeData).find(key => collegeData[key].name === eventData.college.name) : null;
    if (collegeId) {
        window.location.href = `college-fest-detail.html?id=${collegeId}`;
    } else {
        window.location.href = 'college-fests.html';
    }
}

function shareEvent() {
    if (navigator.share) {
        navigator.share({
            title: eventData.name,
            text: `Check out ${eventData.name} at ${eventData.college.name}!`,
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

function bookTickets() {
    // Store booking data
    const bookingData = {
        type: 'event',
        eventId: eventData.id,
        eventName: eventData.name,
        college: eventData.college,
        date: eventData.date,
        time: eventData.time,
        venue: eventData.venue,
        price: eventData.price,
        image: eventData.image,
        quantity: 1,
        timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem('selectedEvent', JSON.stringify(bookingData));
    
    // Redirect to booking page
    window.location.href = 'college-event-booking.html';
}
    
    sessionStorage.setItem('eventBooking', JSON.stringify(bookingData));
    
    // For now show alert, later redirect to payment
    const confirmed = confirm(
        `🎉 ${eventData.name}\n` +
        `🎓 ${eventData.college.name}\n` +
        `📅 ${eventData.date} • ${eventData.time}\n` +
        `📍 ${eventData.venue}\n` +
        `💰 ₹${eventData.price}\n\n` +
        `Proceed to book?`
    );
    
    if (confirmed) {
        // window.location.href = 'event-booking.html';
        console.log('Booking:', bookingData);
    }
}