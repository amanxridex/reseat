// Constants
const MAX_TICKETS = 2;
const PLATFORM_FEE = 1;

// State
let eventData = null;
let ticketPrice = 0;
let currentQty = 1;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadEventData();
    updatePricing();
    
    // Phone input validation
    document.getElementById('attendeePhone').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
});

// Load event data from sessionStorage
function loadEventData() {
    const data = sessionStorage.getItem('selectedEvent');
    if (!data) {
        window.location.href = 'college-fests.html';
        return;
    }
    
    eventData = JSON.parse(data);
    ticketPrice = eventData.price;
    
    // Populate page
    document.getElementById('eventImage').src = eventData.image;
    document.getElementById('eventImage').onerror = function() {
        this.src = 'assets/college-fest.jpg';
    };
    document.getElementById('eventName').textContent = eventData.name;
    document.getElementById('collegeName').textContent = eventData.college.name;
    document.getElementById('eventDate').textContent = eventData.date;
    document.getElementById('eventVenue').textContent = eventData.venue;
    
    updatePricing();
}

// Change ticket quantity
function changeQty(delta) {
    const newQty = currentQty + delta;
    
    if (newQty < 1) return;
    if (newQty > MAX_TICKETS) {
        showMaxLimit();
        return;
    }
    
    currentQty = newQty;
    updateUI();
}

// Update UI elements
function updateUI() {
    document.getElementById('ticketQty').textContent = currentQty;
    document.getElementById('ticketQty').nextElementSibling.textContent = 
        currentQty === 1 ? 'ticket' : 'tickets';
    
    // Button states
    document.getElementById('minusBtn').disabled = currentQty === 1;
    document.getElementById('plusBtn').disabled = currentQty === MAX_TICKETS;
    
    // Max limit message
    const maxMsg = document.getElementById('maxMsg');
    if (currentQty === MAX_TICKETS) {
        maxMsg.classList.add('show');
    } else {
        maxMsg.classList.remove('show');
    }
    
    updatePricing();
}

// Update pricing display
function updatePricing() {
    const ticketTotal = currentQty * ticketPrice;
    const grandTotal = ticketTotal + PLATFORM_FEE;
    
    document.getElementById('ticketCount').textContent = 
        `${currentQty} × ₹${ticketPrice}`;
    document.getElementById('ticketTotal').textContent = `₹${ticketTotal}`;
    document.getElementById('platformFee').textContent = `₹${PLATFORM_FEE}`;
    document.getElementById('grandTotal').textContent = `₹${grandTotal}`;
    document.getElementById('footerTotal').textContent = `₹${grandTotal}`;
}

// Show max limit reached
function showMaxLimit() {
    const btn = document.getElementById('plusBtn');
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 200);
}

// Proceed to payment
function proceedToPayment() {
    // Validate form
    const name = document.getElementById('attendeeName').value.trim();
    const email = document.getElementById('attendeeEmail').value.trim();
    const phone = document.getElementById('attendeePhone').value.trim();
    
    if (!name || !email || !phone) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (phone.length !== 10) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    // Show payment modal
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('hidden');
    
    // Simulate payment processing
    setTimeout(() => {
        // Hide spinner, show success
        document.querySelector('.spinner-ring').style.display = 'none';
        document.getElementById('successIcon').classList.remove('hidden');
        document.getElementById('paymentStatus').textContent = 'Payment Successful!';
        document.getElementById('paymentSubtext').textContent = 'Redirecting to your tickets...';
        
        // Save booking data
        const bookingData = {
            eventId: eventData.id,
            eventName: eventData.name,
            college: eventData.college,
            date: eventData.date,
            venue: eventData.venue,
            tickets: currentQty,
            attendee: {
                name,
                email,
                phone,
                college: document.getElementById('attendeeCollege').value.trim()
            },
            pricing: {
                ticketPrice,
                platformFee: PLATFORM_FEE,
                total: currentQty * ticketPrice + PLATFORM_FEE
            },
            bookingId: 'NEX' + Date.now().toString(36).toUpperCase(),
            bookedAt: new Date().toISOString()
        };
        
        sessionStorage.setItem('eventBookingComplete', JSON.stringify(bookingData));
        
        // Redirect to ticket page after delay
        setTimeout(() => {
            window.location.href = 'my-ticket.html';
        }, 1500);
        
    }, 2500);
}