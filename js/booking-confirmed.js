// ✅ FIXED: Removed trailing space
const API_BASE_URL = 'https://nexus-api-hkfu.onrender.com/api';

// Get auth token
async function getAuthToken() {
    return new Promise((resolve, reject) => {
        const authData = localStorage.getItem('nexus_auth');
        if (!authData) {
            reject(new Error('NOT_LOGGED_IN'));
            return;
        }
        const parsed = JSON.parse(authData);
        resolve(parsed.idToken);
    });
}

function handleAuthError(error) {
    alert('Please login to continue');
    localStorage.removeItem('nexus_auth');
    window.location.href = 'auth.html';
}

let bookingData = null;
let qrCode = null;

document.addEventListener('DOMContentLoaded', () => {
    loadBookingData();
    generateConfetti();
});

// Load booking data
async function loadBookingData() {
    const sessionData = sessionStorage.getItem('bookingComplete');
    
    if (sessionData) {
        const parsed = JSON.parse(sessionData);
        await fetchTicketDetails(parsed.bookingId);
    } else {
        await fetchLatestTicket();
    }
}

// Fetch ticket details
async function fetchTicketDetails(bookingId) {
    let token;
    try {
        token = await getAuthToken();
    } catch (error) {
        handleAuthError(error);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/booking/my-tickets`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!data.success) throw new Error(data.error);

        // Find ticket by booking ID
        const ticket = data.tickets.find(t => 
            t.bookings?.booking_id === bookingId || 
            t.booking_id === bookingId
        );
        
        console.log('Found ticket:', ticket); // Debug log
        
        if (ticket) {
            populateTicketFromBackend(ticket);
        } else {
            throw new Error('Ticket not found');
        }

    } catch (error) {
        console.error('Error:', error);
        const sessionData = JSON.parse(sessionStorage.getItem('bookingComplete') || '{}');
        if (sessionData.bookingId) {
            populateTicketFromSession(sessionData);
        } else {
            alert('Ticket not found');
            window.location.href = 'index.html';
        }
    }
}

// Fetch latest ticket
async function fetchLatestTicket() {
    let token;
    try {
        token = await getAuthToken();
    } catch (error) {
        handleAuthError(error);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/booking/my-tickets`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!data.success || !data.tickets?.length) {
            throw new Error('No tickets');
        }

        populateTicketFromBackend(data.tickets[0]);

    } catch (error) {
        alert('Failed to load tickets');
        window.location.href = 'index.html';
    }
}

// ✅ FIXED: Proper name extraction with debug logs
function populateTicketFromBackend(ticket) {
    const booking = ticket.bookings || {};
    
    console.log('Ticket data:', ticket);
    console.log('Booking data:', booking);
    console.log('Ticket attendee_name:', ticket.attendee_name);
    console.log('Booking attendee_name:', booking.attendee_name);
    
    // ✅ PRIORITY: ticket.attendee_name first (comes from tickets table)
    const finalAttendeeName = ticket.attendee_name || booking.attendee_name;
    
    console.log('Final attendee name:', finalAttendeeName);
    
    bookingData = {
        eventId: ticket.fest_id,
        eventName: booking.event_name || 'Event',
        college: { 
            name: booking.college_name || 'College',
        },
        date: formatDate(booking.created_at),
        time: '10:00 AM',
        venue: 'Main Venue',
        tickets: 1,
        // ✅ FIXED: Use extracted name, empty string if null (not 'Guest')
        attendeeName: finalAttendeeName || '',
        attendeeEmail: booking.attendee_email || '',
        attendeePhone: booking.attendee_phone || '',
        bookingId: booking.booking_id || ticket.booking_id,
        ticketId: ticket.ticket_id,
        qrCode: ticket.qr_code,
        bookedAt: booking.created_at || ticket.created_at
    };

    updateUI();
}

// Populate from session (fallback)
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
        // ✅ FIXED: No hardcoded 'Guest'
        attendeeName: data.attendee?.name || '',
        bookingId: data.bookingId,
        ticketId: data.tickets?.[0]?.ticketId,
        qrCode: data.tickets?.[0]?.qrCode,
        bookedAt: new Date().toISOString()
    };

    updateUI();
}

// ✅ FIXED: Update UI
function updateUI() {
    document.getElementById('eventName').textContent = bookingData.eventName;
    document.getElementById('collegeName').textContent = bookingData.college.name;
    document.getElementById('ticketDate').textContent = bookingData.date;
    document.getElementById('ticketTime').textContent = bookingData.time;
    document.getElementById('ticketVenue').textContent = bookingData.venue;
    document.getElementById('ticketQty').textContent = bookingData.tickets;
    
    // ✅ FIXED: Show name or empty, not 'Guest'
    const nameElement = document.getElementById('attendeeName');
    nameElement.textContent = bookingData.attendeeName || '---';
    
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

// Generate QR Code
function generateQR() {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    if (bookingData.qrCode) {
        try {
            const qrData = atob(bookingData.qrCode);
            const parsed = JSON.parse(qrData);
            
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

// Format date
function formatDate(dateString) {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Generate confetti
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

// Download ticket
async function downloadTicket() {
    const btn = document.querySelector('.action-btn.primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;
    
    try {
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