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

// Download ticket as PDF
async function downloadTicket() {
    const btn = document.querySelector('.action-btn.primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;
    
    try {
        const { jsPDF } = window.jspdf;
        const ticketElement = document.getElementById('ticketWrapper');
        
        // Capture ticket as image
        const canvas = await html2canvas(ticketElement, {
            scale: 2,
            backgroundColor: '#050508',
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`NEXUS-Ticket-${bookingData.bookingId}.pdf`);
        
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Share ticket
async function shareTicket() {
    const shareData = {
        title: `NEXUS Ticket - ${bookingData.eventName}`,
        text: `I've booked ${bookingData.tickets} ticket(s) for ${bookingData.eventName} at ${bookingData.college.name} on ${bookingData.date}!`,
        url: window.location.href
    };
    
    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Share cancelled');
        }
    } else {
        // Fallback - copy to clipboard
        const text = `${shareData.title}\n${shareData.text}\nBooking ID: ${bookingData.bookingId}`;
        navigator.clipboard.writeText(text);
        alert('Ticket info copied to clipboard!');
    }
}