// Booking Data
let bookingData = null;
let selectedSeats = [];
let basePrice = 0;
let discount = 0;
const CONVENIENCE_FEE = 49;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // ✅ Check session first
    checkSession().then(valid => {
        if (valid) {
            loadBookingData();
            renderPassengerForms();
            updatePricing();
            
            document.querySelectorAll('input[name="payment"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    document.querySelectorAll('.payment-card').forEach(card => {
                        card.classList.remove('active');
                    });
                    e.target.closest('.payment-card').classList.add('active');
                });
            });
        }
    });
});

// ✅ NEW: Check session cookie
async function checkSession() {
    try {
        const res = await fetch(`${API_BASE}/api/auth/check`, {
            credentials: 'include', // ✅ Cookie sent
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!res.ok) {
            throw new Error('No session');
        }
        
        const data = await res.json();
        if (!data.exists) {
            throw new Error('User not found');
        }
        
        return true;
    } catch (err) {
        console.error('Auth error:', err);
        window.location.href = 'auth.html';
        return false;
    }
}

// Load booking data from sessionStorage
function loadBookingData() {
    const data = sessionStorage.getItem('bookingData');
    if (!data) {
        window.location.href = 'bus-details.html';
        return;
    }
    
    bookingData = JSON.parse(data);
    selectedSeats = bookingData.selectedSeats || [];
    basePrice = bookingData.price * selectedSeats.length;
    
    document.getElementById('fromCity').textContent = bookingData.from;
    document.getElementById('toCity').textContent = bookingData.to;
    document.getElementById('depTime').textContent = bookingData.depTime;
    document.getElementById('arrTime').textContent = bookingData.arrTime;
    document.getElementById('duration').textContent = bookingData.duration;
    document.getElementById('operatorName').textContent = bookingData.operator;
    document.getElementById('busType').textContent = bookingData.type;
    document.getElementById('travelDate').textContent = bookingData.date;
    document.getElementById('selectedSeats').textContent = selectedSeats.join(', ');
    document.getElementById('seatCount').textContent = selectedSeats.length;
}

// Render passenger forms based on seat count
function renderPassengerForms() {
    const container = document.getElementById('additionalPassengers');
    
    // Clear existing
    container.innerHTML = '';
    
    // Add forms for additional passengers (skip first, it's already in HTML)
    for (let i = 1; i < selectedSeats.length; i++) {
        const passengerDiv = document.createElement('div');
        passengerDiv.className = 'passenger-card';
        passengerDiv.style.animationDelay = `${i * 0.1}s`;
        passengerDiv.innerHTML = `
            <div class="passenger-header">
                <span class="passenger-num">Passenger ${i + 1}</span>
                <span class="seat-label">Seat ${selectedSeats[i]}</span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Full Name</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user"></i>
                        <input type="text" name="p${i+1}name" placeholder="As per ID proof" required>
                    </div>
                </div>
                <div class="form-group age-group">
                    <label>Age</label>
                    <div class="input-wrapper">
                        <input type="number" name="p${i+1}age" placeholder="25" min="1" max="120" required>
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Gender</label>
                    <div class="gender-options">
                        <label class="gender-radio">
                            <input type="radio" name="p${i+1}gender" value="male" checked>
                            <span>Male</span>
                        </label>
                        <label class="gender-radio">
                            <input type="radio" name="p${i+1}gender" value="female">
                            <span>Female</span>
                        </label>
                        <label class="gender-radio">
                            <input type="radio" name="p${i+1}gender" value="other">
                            <span>Other</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(passengerDiv);
    }
    
    // Update seat label for first passenger
    document.getElementById('seatLabel1').textContent = `Seat ${selectedSeats[0]}`;
}

// Update pricing display
function updatePricing() {
    const gst = Math.round((basePrice - discount) * 0.05);
    const total = basePrice - discount + CONVENIENCE_FEE + gst;
    
    document.getElementById('baseFare').textContent = `₹${basePrice}`;
    document.getElementById('gstAmount').textContent = `₹${gst}`;
    document.getElementById('totalAmount').textContent = `₹${total}`;
    
    // Show/hide discount row
    const discountRow = document.getElementById('discountRow');
    if (discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('discountAmount').textContent = `-₹${discount}`;
    } else {
        discountRow.style.display = 'none';
    }
}

// Apply coupon code
function applyCoupon() {
    const code = document.getElementById('couponCode').value.trim().toUpperCase();
    if (!code) return;
    
    // Coupon logic
    const coupons = {
        'BUS20': { type: 'percent', value: 20, max: 200 },
        'FIRST50': { type: 'flat', value: 50 },
        'NEXUS100': { type: 'flat', value: 100 }
    };
    
    const coupon = coupons[code];
    if (!coupon) {
        showToast('Invalid coupon code');
        return;
    }
    
    if (coupon.type === 'percent') {
        discount = Math.min(Math.round(basePrice * coupon.value / 100), coupon.max);
    } else {
        discount = coupon.value;
    }
    
    // Show applied coupon
    const container = document.getElementById('appliedCoupons');
    container.innerHTML = `
        <div class="applied-tag">
            <span>${code} Applied</span>
            <button onclick="removeCoupon()"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    updatePricing();
    showToast(`Coupon applied! You saved ₹${discount}`);
}

// Apply quick offer
function applyQuickOffer(code) {
    document.getElementById('couponCode').value = code;
    applyCoupon();
}

// Remove coupon
function removeCoupon() {
    discount = 0;
    document.getElementById('appliedCoupons').innerHTML = '';
    document.getElementById('couponCode').value = '';
    updatePricing();
}

// Proceed to payment
// ✅ UPDATED: proceedToPayment should use cookie
async function proceedToPayment() {
    const form = document.getElementById('passengerForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const passengers = [];
    for (let i = 0; i < selectedSeats.length; i++) {
        const suffix = i === 0 ? '1' : (i + 1).toString();
        const genderEl = document.querySelector(`input[name="p${suffix}gender"]:checked`);
        
        passengers.push({
            name: document.querySelector(`[name="p${suffix}name"]`).value,
            age: document.querySelector(`[name="p${suffix}age"]`).value,
            gender: genderEl ? genderEl.value : 'male',
            seat: selectedSeats[i]
        });
    }
    
    const contact = {
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        altPhone: document.getElementById('altPhone').value
    };
    
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    const finalBooking = {
        ...bookingData,
        passengers,
        contact,
        paymentMethod,
        discount,
        convenienceFee: CONVENIENCE_FEE,
        totalAmount: document.getElementById('totalAmount').textContent,
        bookingTime: new Date().toISOString()
    };
    
    sessionStorage.setItem('finalBooking', JSON.stringify(finalBooking));
    
    document.getElementById('processingModal').classList.remove('hidden');
    
    // Simulate payment processing
    setTimeout(() => {
        const bookingId = 'NEX' + Date.now().toString(36).toUpperCase();
        sessionStorage.setItem('bookingId', bookingId);
        
        window.location.href = 'confirmation.html';
    }, 3000);
}

// Toast notification
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--surface);
        color: var(--text);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border: 1px solid var(--border);
        z-index: 1000;
        animation: fadeIn 0.3s ease;
        font-size: 0.9rem;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Add input validation for phone numbers
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
});