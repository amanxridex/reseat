// Location State
let currentCity = null;
let isDetecting = false;

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];

// IP Geolocation as fallback (no HTTPS needed)
const IP_GEOLOCATION_API = 'https://ipapi.co/json/';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkLocation();
    
    // Filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', function() {
            document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// Check if location is already set
function checkLocation() {
    const savedCity = localStorage.getItem('nexus_movie_city');
    if (savedCity) {
        currentCity = savedCity;
        updateLocationDisplay(savedCity);
        hideLocationModal();
    } else {
        showLocationModal();
        // Auto-detect using IP first (more reliable)
        detectLocationViaIP();
    }
}

// PRIMARY METHOD: IP-based geolocation (works without HTTPS/permissions)
async function detectLocationViaIP() {
    if (isDetecting) return;
    isDetecting = true;
    
    updateDetectButton('Detecting via network...', true);
    
    try {
        const response = await fetch(IP_GEOLOCATION_API, { timeout: 5000 });
        const data = await response.json();
        
        console.log('IP Location:', data);
        
        if (data.city) {
            // Find closest matching city from our list
            const matchedCity = findClosestCity(data.city, data.region);
            
            // Auto-select the city
            selectCity(matchedCity, true, `Located via network: ${data.city}`);
        } else {
            throw new Error('City not found in IP data');
        }
    } catch (error) {
        console.log('IP detection failed:', error);
        // Fallback to GPS
        updateDetectButton('GPS detecting...', true);
        setTimeout(() => detectLocationViaGPS(), 500);
    }
}

// SECONDARY METHOD: GPS-based geolocation
function detectLocationViaGPS() {
    if (!navigator.geolocation) {
        updateDetectButton('GPS not supported', false, true);
        return;
    }
    
    // Check if we're on HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        updateDetectButton('Use HTTPS for GPS', false, true);
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`GPS Coordinates: ${latitude}, ${longitude}`);
            
            try {
                // Use BigDataCloud free reverse geocoding (no key needed)
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await response.json();
                
                console.log('GPS Location Data:', data);
                
                const city = data.city || data.locality || data.principalSubdivision;
                if (city) {
                    const matchedCity = findClosestCity(city, data.principalSubdivision);
                    selectCity(matchedCity, true, `GPS Location: ${city}`);
                } else {
                    throw new Error('City not found');
                }
            } catch (error) {
                console.log('GPS reverse geocoding failed:', error);
                updateDetectButton('Detection failed', false, true);
            }
        },
        (error) => {
            console.log('GPS Error:', error);
            let message = 'Location denied';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Enable location permission';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'GPS signal weak';
                    break;
                case error.TIMEOUT:
                    message = 'GPS timeout';
                    break;
            }
            updateDetectButton(message, false, true);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

// Find closest matching city from our supported list
function findClosestCity(detectedCity, region) {
    const detected = detectedCity.toLowerCase();
    const regionLower = (region || '').toLowerCase();
    
    // Direct match
    const exactMatch = CITIES.find(c => c.toLowerCase() === detected);
    if (exactMatch) return exactMatch;
    
    // Partial match
    const partialMatch = CITIES.find(c => 
        detected.includes(c.toLowerCase()) || 
        c.toLowerCase().includes(detected)
    );
    if (partialMatch) return partialMatch;
    
    // Match by region/state
    if (regionLower.includes('maharashtra')) return 'Mumbai';
    if (regionLower.includes('delhi')) return 'Delhi';
    if (regionLower.includes('karnataka')) return 'Bangalore';
    if (regionLower.includes('telangana')) return 'Hyderabad';
    if (regionLower.includes('tamil nadu')) return 'Chennai';
    if (regionLower.includes('west bengal')) return 'Kolkata';
    if (regionLower.includes('gujarat')) return 'Ahmedabad';
    if (regionLower.includes('rajasthan')) return 'Jaipur';
    if (regionLower.includes('uttar pradesh')) return 'Lucknow';
    
    // Default based on common regions
    return 'Mumbai'; // Default fallback
}

// Update detect button UI
function updateDetectButton(text, loading, error = false) {
    const btn = document.querySelector('.detect-location-btn');
    if (!btn) return;
    
    const icon = loading ? '<i class="fas fa-spinner fa-spin"></i>' : 
                 error ? '<i class="fas fa-exclamation-circle"></i>' : 
                 '<i class="fas fa-crosshairs"></i>';
    
    btn.innerHTML = `
        ${icon}
        <span>
            <strong>${text}</strong>
            <small>${loading ? 'Please wait' : error ? 'Tap to retry' : 'Using GPS & WiFi'}</small>
        </span>
    `;
    
    btn.disabled = loading;
    
    if (error) {
        btn.style.borderColor = '#ff4444';
        btn.onclick = () => {
            btn.style.borderColor = '';
            detectLocationViaIP();
        };
    } else {
        btn.style.borderColor = '';
        btn.onclick = detectLocationViaIP;
    }
}

// Main detect function (entry point)
function detectLocation() {
    if (isDetecting) return;
    
    // Clear any error state
    updateDetectButton('Detecting...', true);
    
    // Try IP first, then GPS
    detectLocationViaIP();
}

// Show/Hide Modal
function showLocationModal() {
    const modal = document.getElementById('locationModal');
    if (modal) modal.classList.remove('hidden');
}

function hideLocationModal() {
    const modal = document.getElementById('locationModal');
    if (modal) modal.classList.add('hidden');
}

function openLocationModal() {
    // Reset button state
    isDetecting = false;
    updateDetectButton('Detect my location', false);
    showLocationModal();
}

// Select City
function selectCity(city, autoDetected = false, message = null) {
    currentCity = city;
    localStorage.setItem('nexus_movie_city', city);
    updateLocationDisplay(city);
    hideLocationModal();
    isDetecting = false;
    
    if (autoDetected && message) {
        showToast(message);
    }
}

// Update UI
function updateLocationDisplay(city) {
    const el = document.getElementById('currentLocation');
    if (el) el.textContent = city;
}

// Filter Cities in Modal
function filterCities(query) {
    const buttons = document.querySelectorAll('.city-btn');
    const lowerQuery = query.toLowerCase();
    
    buttons.forEach(btn => {
        const cityName = btn.querySelector('span')?.textContent.toLowerCase() || '';
        btn.style.display = cityName.includes(lowerQuery) ? 'flex' : 'none';
    });
}

// Toast Notification
function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.location-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'location-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: linear-gradient(135deg, var(--primary), #ff4757);
        color: #fff;
        padding: 14px 28px;
        border-radius: 30px;
        font-size: 0.95rem;
        font-weight: 500;
        z-index: 10001;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px var(--primary-glow);
    `;
    toast.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i>${message}`;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Navigation
function openMovie(movieId) {
    window.location.href = `movie-details.html?id=${movieId}`;
}

function openExperience(type) {
    window.location.href = `${type}-experience.html`;
}

function openCinema(cinemaId) {
    window.location.href = `cinema-details.html?id=${cinemaId}`;
}

// Touch feedback
document.querySelectorAll('.movie-card, .experience-card, .cinema-card').forEach(el => {
    el.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    el.addEventListener('touchend', function() {
        this.style.transform = '';
    });
});