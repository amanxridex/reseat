let currentStep = 1;
const totalSteps = 4;
let uploadedFile = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    setMinDate();
});

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').min = today;
}

// Update Progress Bar
function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('currentStep').textContent = currentStep;
}

// Next Step Navigation
function nextStep() {
    if (currentStep < totalSteps) {
        document.getElementById(`step${currentStep}`).classList.add('hidden');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.remove('hidden');
        updateProgress();
        
        // Update preview on last step
        if (currentStep === 4) {
            updatePreview();
        }
    }
}

// Previous Step (optional, via back button)
function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.add('hidden');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.remove('hidden');
        updateProgress();
    }
}

// Validate Step 2
function validateStep2() {
    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const venue = document.getElementById('venue').value;
    const city = document.getElementById('city').value;
    
    if (!eventName || !eventDate || !eventTime || !venue || !city) {
        showError('Please fill all fields');
        return;
    }
    
    nextStep();
}

// Handle File Upload
function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB');
        return;
    }
    
    uploadedFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('uploadPlaceholder').classList.add('hidden');
        document.getElementById('uploadPreview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// Remove File
function removeFile(e) {
    e.stopPropagation();
    uploadedFile = null;
    document.getElementById('ticketFile').value = '';
    document.getElementById('uploadPlaceholder').classList.remove('hidden');
    document.getElementById('uploadPreview').classList.add('hidden');
}

// Calculate Max Price (20% cap)
function calculateMaxPrice() {
    const original = parseFloat(document.getElementById('originalPrice').value) || 0;
    const maxPrice = Math.round(original * 1.2);
    document.getElementById('maxPrice').textContent = maxPrice;
    validatePrice();
}

// Validate Price
function validatePrice() {
    const original = parseFloat(document.getElementById('originalPrice').value) || 0;
    const selling = parseFloat(document.getElementById('sellingPrice').value) || 0;
    const maxPrice = original * 1.2;
    
    const priceError = document.getElementById('priceError');
    const step3Btn = document.getElementById('step3Btn');
    
    if (selling > maxPrice) {
        priceError.classList.remove('hidden');
        step3Btn.disabled = true;
        document.getElementById('sellingPrice').style.borderColor = '#ff4444';
    } else {
        priceError.classList.add('hidden');
        step3Btn.disabled = false;
        document.getElementById('sellingPrice').style.borderColor = '';
        updatePriceBreakdown(original, selling);
    }
}

// Update Price Breakdown
function updatePriceBreakdown(original, selling) {
    if (!original || !selling) return;
    
    const platformFee = Math.round(selling * 0.05);
    const netAmount = selling - platformFee;
    const savings = Math.round(((original - selling) / original) * 100);
    
    document.getElementById('displayPrice').textContent = selling;
    document.getElementById('platformFee').textContent = platformFee;
    document.getElementById('netAmount').textContent = netAmount;
    document.getElementById('savingsPercent').textContent = savings + '%';
    
    document.getElementById('priceBreakdown').style.display = 'block';
}

// Validate Step 3
function validateStep3() {
    const platform = document.getElementById('platform').value;
    const seatInfo = document.getElementById('seatInfo').value;
    const originalPrice = document.getElementById('originalPrice').value;
    const sellingPrice = document.getElementById('sellingPrice').value;
    
    if (!platform || !seatInfo || !originalPrice || !sellingPrice) {
        showError('Please fill all fields');
        return;
    }
    
    if (!uploadedFile) {
        showError('Please upload your ticket');
        return;
    }
    
    const maxPrice = parseFloat(originalPrice) * 1.2;
    if (parseFloat(sellingPrice) > maxPrice) {
        showError('Selling price cannot exceed 20% of original price');
        return;
    }
    
    nextStep();
}

// Update Preview on Step 4
function updatePreview() {
    const category = document.querySelector('input[name="category"]:checked')?.value || '';
    const eventName = document.getElementById('eventName').value;
    const sellingPrice = document.getElementById('sellingPrice').value;
    const originalPrice = document.getElementById('originalPrice').value;
    const savings = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
    
    document.getElementById('previewContent').innerHTML = `
        <p><strong>Event:</strong> ${eventName}</p>
        <p><strong>Category:</strong> ${category.charAt(0).toUpperCase() + category.slice(1)}</p>
        <p><strong>Original Price:</strong> ₹${originalPrice}</p>
        <p><strong>Selling Price:</strong> ₹${sellingPrice}</p>
        <p><strong>Buyer Saves:</strong> ${savings}%</p>
        <p><strong>You Receive:</strong> ₹${Math.round(sellingPrice * 0.95)}</p>
    `;
}

// Submit Listing
function submitListing() {
    const sellerName = document.getElementById('sellerName').value;
    const phone = document.getElementById('phone').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!sellerName || !phone || !agreeTerms) {
        showError('Please fill all fields and agree to terms');
        return;
    }
    
    if (phone.length !== 10) {
        showError('Please enter valid 10-digit phone number');
        return;
    }
    
    const listingData = {
        category: document.querySelector('input[name="category"]:checked').value,
        eventName: document.getElementById('eventName').value,
        eventDate: document.getElementById('eventDate').value,
        eventTime: document.getElementById('eventTime').value,
        venue: document.getElementById('venue').value,
        city: document.getElementById('city').value,
        platform: document.getElementById('platform').value,
        seatInfo: document.getElementById('seatInfo').value,
        originalPrice: document.getElementById('originalPrice').value,
        sellingPrice: document.getElementById('sellingPrice').value,
        sellerName: sellerName,
        phone: phone,
        whatsapp: document.getElementById('whatsapp').value || phone,
        listedAt: new Date().toISOString()
    };
    
    const listings = JSON.parse(localStorage.getItem('nexus_resale_listings') || '[]');
    listings.push({ ...listingData, id: Date.now(), status: 'active' });
    localStorage.setItem('nexus_resale_listings', JSON.stringify(listings));
    
    showSuccess(listingData);
}

// Show Success Screen
function showSuccess(data) {
    document.getElementById('sellForm').classList.add('hidden');
    document.querySelector('.progress-bar').style.display = 'none';
    
    const savings = Math.round(((data.originalPrice - data.sellingPrice) / data.originalPrice) * 100);
    
    document.getElementById('successDetails').innerHTML = `
        <p><strong>${data.eventName}</strong></p>
        <p>Listed at ₹${data.sellingPrice} (${savings}% off)</p>
        <p>You'll receive ₹${Math.round(data.sellingPrice * 0.95)} after sale</p>
    `;
    
    document.getElementById('successScreen').classList.remove('hidden');
}

// Error Handler
function showError(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 0.9rem;
        z-index: 10000;
        animation: slideDown 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add error animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Touch feedback
document.querySelectorAll('.category-card, .btn-next, .btn-submit').forEach(el => {
    el.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    el.addEventListener('touchend', function() {
        this.style.transform = '';
    });
});

// Back button handler
document.querySelector('.back-btn').addEventListener('click', (e) => {
    if (currentStep > 1 && !document.getElementById('successScreen').classList.contains('hidden') === false) {
        e.preventDefault();
        prevStep();
    }
});