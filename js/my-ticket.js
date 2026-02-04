// Booking data
let bookingData = null;
let qrCode = null;

document.addEventListener('DOMContentLoaded', () => {
    loadBookingData();
    generateConfetti();
});

// Load booking from sessionStorage
function loadBookingData() {
    const data = sessionStorage.getItem('eventBookingComplete');
    
    if (!data) {
        // Demo data for testing
        bookingData = {
            eventId: 'christ-1',
            eventName: 'InBloom 2026',
            college: { name: 'Christ University', location: 'Bangalore' },
            date: 'Feb 15-17, 2026',
            time: '10:00 AM',
            venue: 'Central Campus Ground',
            tickets: 2,
            attendee: {
                name: 'Rahul Sharma',
                email: 'rahul@email.com',
                phone: '9876543210'
            },
            pricing: {
                ticketPrice: 499,
                platformFee: 1,
                total: 999
            },
            bookingId: 'NEX-' + Date.now().toString(36).toUpperCase(),
            bookedAt: new Date().toISOString()
        };
    } else {
        bookingData = JSON.parse(data);
    }
    
    populateTicket();
    generateQR();
}

// Populate ticket with data
function populateTicket() {
    document.getElementById('eventName').textContent = bookingData.eventName;
    document.getElementById('collegeName').textContent = bookingData.college.name;
    document.getElementById('ticketDate').textContent = bookingData.date;
    document.getElementById('ticketTime').textContent = bookingData.time;
    document.getElementById('ticketVenue').textContent = bookingData.venue;
    document.getElementById('ticketQty').textContent = bookingData.tickets;
    document.getElementById('attendeeName').textContent = bookingData.attendee.name;
    document.getElementById('bookingId').textContent = bookingData.bookingId;
    document.getElementById('ticketId').textContent = bookingData.bookingId;
    
    const bookedDate = new Date(bookingData.bookedAt || Date.now());
    document.getElementById('bookingTime').textContent = 
        'Booked on ' + bookedDate.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
}

// Generate QR Code
function generateQR() {
    const qrData = JSON.stringify({
        bookingId: bookingData.bookingId,
        event: bookingData.eventName,
        tickets: bookingData.tickets,
        valid: true
    });
    
    qrCode = new QRCode(document.getElementById('qrcode'), {
        text: qrData,
        width: 128,
        height: 128,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
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
        // Check if html2canvas is loaded
        if (typeof html2canvas === 'undefined') {
            // Load html2canvas dynamically
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        
        const ticketElement = document.getElementById('ticketWrapper');
        
        // Capture ticket as canvas
        const canvas = await html2canvas(ticketElement, {
            scale: 2,
            backgroundColor: '#050508',
            useCORS: true,
            allowTaint: true,
            logging: false
        });
        
        // Convert to JPG and download
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
    // Try to share image if available
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
                // Fallback to text share
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