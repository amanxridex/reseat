const API_BASE_URL = 'https://nexus-api-hkfu.onrender.com/api';

// Helper function to get auth token
function getAuthToken() {
    try {
        const authData = localStorage.getItem('nexus_auth');
        if (authData) {
            const parsed = JSON.parse(authData);
            return parsed.idToken || null;
        }
    } catch (e) {
        console.error('Error parsing auth data:', e);
    }
    return null;
}

let bookingData = null;
let qrCode = null;

document.addEventListener('DOMContentLoaded', () => {
    loadBookingData();
    generateConfetti();
});

// Load booking from sessionStorage (from payment flow) OR fetch from backend
async function loadBookingData() {
    // Try to get from sessionStorage first (passed from payment flow)
    const sessionData = sessionStorage.getItem('bookingComplete');
    
    if (sessionData) {
        const parsed = JSON.parse(sessionData);
        console.log('Session data:', parsed);
        
        // Fetch full ticket details from backend to get real QR codes
        await fetchTicketDetails(parsed.bookingId);
    } else {
        // No session data - fetch all tickets and show the most recent one
        await fetchLatestTicket();
    }
}

// Fetch specific ticket details from backend
async function fetchTicketDetails(bookingId) {
    const token = getAuthToken();
    if (!token) {
        alert('Please login first');
        window.location.href = 'auth.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/booking/my-tickets`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch tickets');
        }

        // Find the ticket for this booking
        const ticket = data.tickets.find(t => t.bookings?.booking_id === bookingId || t.booking_id === bookingId);
        
        if (ticket) {
            populateTicketFromBackend(ticket);
        } else {
            // Fallback to session data if API doesn't return ticket yet
            const sessionData = JSON.parse(sessionStorage.getItem('bookingComplete') || '{}');
            populateTicketFromSession(sessionData);
        }

    } catch (error) {
        console.error('Error fetching ticket:', error);
        // Fallback to session data
        const sessionData = JSON.parse(sessionStorage.getItem('bookingComplete') || '{}');
        if (sessionData.bookingId) {
            populateTicketFromSession(sessionData);
        } else {
            alert('Ticket not found');
            window.location.href = 'index.html';
        }
    }
}

// Fetch latest ticket when no session data
async function fetchLatestTicket() {
    const token = getAuthToken();
    if (!token) {
        alert('Please login first');
        window.location.href = 'auth.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/booking/my-tickets`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!data.success || !data.tickets || data.tickets.length === 0) {
            alert('No tickets found');
            window.location.href = 'index.html';
            return;
        }

        // Get the most recent ticket
        const latestTicket = data.tickets[0];
        populateTicketFromBackend(latestTicket);

    } catch (error) {
        console.error('Error fetching tickets:', error);
        alert('Failed to load tickets');
        window.location.href = 'index.html';
    }
}

// Populate ticket from backend data (REAL DATA)
function populateTicketFromBackend(ticket) {
    const booking = ticket.bookings || {};
    
    bookingData = {
        eventId: ticket.fest_id,
        eventName: booking.event_name || 'Event',
        college: { 
            name: booking.college_name || 'College',
            location: booking.college_name || ''
        },
        date: formatDate(booking.created_at),
        time: '10:00 AM', // You may need to add time to your database
        venue: 'Main Venue', // You may need to add venue to your database
        tickets: 1, // This ticket represents one entry
        attendee: {
            name: ticket.attendee_name || 'Guest',
            email: booking.attendee_email || '',
            phone: booking.attendee_phone || ''
        },
        bookingId: booking.booking_id || ticket.booking_id,
        ticketId: ticket.ticket_id,
        qrCode: ticket.qr_code, // REAL QR from database!
        bookedAt: booking.created_at || ticket.created_at
    };

    updateUI();
}

// Populate from session data (fallback)
function populateTicketFromSession(data) {
    const sessionEvent = data.event || {};
    
    bookingData = {
        eventId: sessionEvent.id,
        eventName: sessionEvent.name || 'Event',
        college: sessionEvent.college || { name: 'College' },
        date: sessionEvent.date || 'TBA',
        time: sessionEvent.time || 'TBA',
        venue: sessionEvent.venue || 'TBA',
        tickets: data.tickets?.length || 1,
        attendee: data.attendee || { name: 'Guest' },
        bookingId: data.bookingId,
        ticketId: data.tickets?.[0]?.ticketId,
        qrCode: data.tickets?.[0]?.qrCode, // Base64 QR from backend
        bookedAt: new Date().toISOString()
    };

    updateUI();
}

// Update UI with bookingData
function updateUI() {
    document.getElementById('eventName').textContent = bookingData.eventName;
    document.getElementById('collegeName').textContent = bookingData.college.name;
    document.getElementById('ticketDate').textContent = bookingData.date;
    document.getElementById('ticketTime').textContent = bookingData.time;
    document.getElementById('ticketVenue').textContent = bookingData.venue;
    document.getElementById('ticketQty').textContent = bookingData.tickets;
    document.getElementById('attendeeName').textContent = bookingData.attendee.name;
    document.getElementById('bookingId').textContent = bookingData.bookingId;
    document.getElementById('ticketId').textContent = bookingData.ticketId || bookingData.bookingId;
    
    const bookedDate = new Date(bookingData.bookedAt);
    document.getElementById('bookingTime').textContent = 
        'Booked on ' + bookedDate.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

    generateQR();
}

// Generate QR Code - uses REAL QR from backend if available
function generateQR() {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = ''; // Clear existing
    
    if (bookingData.qrCode) {
        // Use REAL QR code from backend (it's base64 encoded JSON)
        // Display as image or generate from the data
        try {
            // The QR code in DB is base64 of the ticket data
            // Let's display it properly
            const qrData = atob(bookingData.qrCode); // Decode base64
            const parsed = JSON.parse(qrData);
            
            // Generate visual QR with the ticket data
            qrCode = new QRCode(qrContainer, {
                text: JSON.stringify({
                    ticketId: parsed.ticketId,
                    bookingId: parsed.bookingId,
                    valid: true,
                    timestamp: Date.now()
                }),
                width: 128,
                height: 128,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            // Fallback: generate QR with ticket ID
            qrCode = new QRCode(qrContainer, {
                text: bookingData.ticketId || bookingData.bookingId,
                width: 128,
                height: 128,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    } else {
        // Fallback: generate QR with booking data
        const qrData = JSON.stringify({
            bookingId: bookingData.bookingId,
            event: bookingData.eventName,
            tickets: bookingData.tickets,
            valid: true
        });
        
        qrCode = new QRCode(qrContainer, {
            text: qrData,
            width: 128,
            height: 128,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// Helper: Format date
function formatDate(dateString) {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Generate confetti animation
function generateConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#00d4ff'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
    }
}

// Download ticket as JPG image
async function downloadTicket() {
    const btn = document.querySelector('.action-btn.primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;
    
    try {
        if (typeof html2canvas === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        
        const ticketElement = document.getElementById('ticketWrapper');
        
        const canvas = await html2canvas(ticketElement, {
            scale: 2,
            backgroundColor: '#050508',
            useCORS: true,
            allowTaint: true,
            logging: false
        });
        
        const link = document.createElement('a');
        link.download = `NEXUS-Ticket-${bookingData.bookingId}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Image generation failed:', error);
        alert('Failed to generate image. Please try again.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Helper: Load script dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Share ticket
async function shareTicket() {
    try {
        const ticketElement = document.getElementById('ticketWrapper');
        const canvas = await html2canvas(ticketElement, {
            scale: 2,
            backgroundColor: '#050508',
            useCORS: true,
            logging: false
        });
        
        canvas.toBlob(async (blob) => {
            const file = new File([blob], `ticket-${bookingData.bookingId}.jpg`, { type: 'image/jpeg' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `NEXUS Ticket - ${bookingData.eventName}`,
                    text: `I've booked ${bookingData.tickets} ticket(s) for ${bookingData.eventName}!`
                });
            } else {
                shareText();
            }
        }, 'image/jpeg');
        
    } catch (err) {
        shareText();
    }
}

// Fallback text share
function shareText() {
    const text = `🎫 NEXUS TICKET\n\nEvent: ${bookingData.eventName}\nCollege: ${bookingData.college.name}\nDate: ${bookingData.date}\nTickets: ${bookingData.tickets}\nBooking ID: ${bookingData.bookingId}\n\nDownload the NEXUS app for your tickets!`;
    
    if (navigator.share) {
        navigator.share({
            title: `NEXUS Ticket - ${bookingData.eventName}`,
            text: text
        });
    } else {
        navigator.clipboard.writeText(text);
        alert('Ticket info copied to clipboard!');
    }
}