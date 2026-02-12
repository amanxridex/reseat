const API_BASE_URL = 'https://nexus-api-hkfu.onrender.com/api';
const MAX_TICKETS = 2;
const PLATFORM_FEE = 1;

let eventData = null;
let ticketPrice = 0;
let currentQty = 1;
let currentBookingId = null;

// Helper function to get auth token from nexus_auth
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

// Load Razorpay script dynamically
function loadRazorpayScript() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        document.body.appendChild(script);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadRazorpayScript();
    loadEventData();
    updatePricing();
    
    // Phone input validation
    document.getElementById('attendeePhone').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
});

function loadEventData() {
    const data = sessionStorage.getItem('bookingEvent') || sessionStorage.getItem('selectedEvent');
    if (!data) {
        window.location.href = 'college-fests.html';
        return;
    }
    
    eventData = JSON.parse(data);
    ticketPrice = eventData.price || 0;
    
    // Populate page
    document.getElementById('eventImage').src = eventData.image || 'assets/college-fest.jpg';
    document.getElementById('eventImage').onerror = function() {
        this.src = 'assets/college-fest.jpg';
    };
    document.getElementById('eventName').textContent = eventData.name;
    document.getElementById('collegeName').textContent = eventData.college?.name || 'Unknown College';
    document.getElementById('eventDate').textContent = eventData.date || 'TBA';
    document.getElementById('eventVenue').textContent = eventData.venue || 'TBA';
    
    updatePricing();
}

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

function updateUI() {
    document.getElementById('ticketQty').textContent = currentQty;
    document.getElementById('ticketQty').nextElementSibling.textContent = 
        currentQty === 1 ? 'ticket' : 'tickets';
    
    document.getElementById('minusBtn').disabled = currentQty === 1;
    document.getElementById('plusBtn').disabled = currentQty === MAX_TICKETS;
    
    const maxMsg = document.getElementById('maxMsg');
    if (currentQty === MAX_TICKETS) {
        maxMsg.classList.add('show');
    } else {
        maxMsg.classList.remove('show');
    }
    
    updatePricing();
}

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

function showMaxLimit() {
    const btn = document.getElementById('plusBtn');
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 200);
}

async function proceedToPayment() {
    // Validate form
    const name = document.getElementById('attendeeName').value.trim();
    const email = document.getElementById('attendeeEmail').value.trim();
    const phone = document.getElementById('attendeePhone').value.trim();
    const college = document.getElementById('attendeeCollege').value.trim();
    
    if (!name || !email || !phone) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (phone.length !== 10) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }

    // Get Firebase token from nexus_auth
    const token = getAuthToken();
    if (!token) {
        alert('Please login first');
        return;
    }

    // Show processing modal
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('hidden');
    document.getElementById('paymentStatus').textContent = 'Creating order...';
    document.getElementById('paymentSubtext').textContent = 'Please wait...';

    try {
        // Step 1: Create order
        const orderResponse = await fetch(`${API_BASE_URL}/booking/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                festId: eventData.id,
                eventName: eventData.name,
                ticketQty: currentQty,
                ticketPrice: ticketPrice,
                attendee: {
                    name,
                    email,
                    phone,
                    college
                }
            })
        });

        const orderData = await orderResponse.json();
        
        if (!orderData.success) {
            throw new Error(orderData.error || 'Failed to create order');
        }

        currentBookingId = orderData.bookingId;

        // Step 2: Open Razorpay checkout
        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Nexus Tickets',
            description: `${eventData.name} - ${currentQty} ticket(s)`,
            order_id: orderData.orderId,
            handler: async function(response) {
                // Step 3: Verify payment
                await verifyPayment(response, token);
            },
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            theme: {
                color: '#8b5cf6'
            },
            modal: {
                ondismiss: function() {
                    modal.classList.add('hidden');
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (error) {
        console.error('Payment error:', error);
        document.getElementById('paymentStatus').textContent = 'Payment Failed';
        document.getElementById('paymentSubtext').textContent = error.message;
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 2000);
    }
}

async function verifyPayment(razorpayResponse, token) {
    const modal = document.getElementById('paymentModal');
    document.getElementById('paymentStatus').textContent = 'Verifying payment...';
    
    try {
        const verifyResponse = await fetch(`${API_BASE_URL}/booking/verify-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature
            })
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
            // Show success
            document.querySelector('.spinner-ring').style.display = 'none';
            document.getElementById('successIcon').classList.remove('hidden');
            document.getElementById('paymentStatus').textContent = 'Payment Successful!';
            document.getElementById('paymentSubtext').textContent = 'Redirecting to your tickets...';

            // Save to sessionStorage for ticket page
            sessionStorage.setItem('bookingComplete', JSON.stringify({
                bookingId: verifyData.bookingId,
                tickets: verifyData.tickets,
                event: eventData
            }));

            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'booking-confirmed.html';
            }, 1500);
        } else {
            throw new Error(verifyData.error || 'Verification failed');
        }

    } catch (error) {
        console.error('Verification error:', error);
        document.getElementById('paymentStatus').textContent = 'Verification Failed';
        document.getElementById('paymentSubtext').textContent = error.message;
    }
}