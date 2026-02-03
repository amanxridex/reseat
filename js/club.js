// Club Data - 12 clubs (4 per city)
const CLUBS_DATA = {
    Delhi: [
        {
            id: 1,
            name: "Privee",
            address: "Shangri-La Hotel, Connaught Place",
            image: "club-1.jpg",
            rating: 4.8,
            badge: "POPULAR",
            distance: "2.5 km"
        },
        {
            id: 2,
            name: "Keya",
            address: "Vasant Kunj, Ambience Mall",
            image: "club-2.jpg",
            rating: 4.6,
            badge: "",
            distance: "8.2 km"
        },
        {
            id: 3,
            name: "Toy Room",
            address: "Hotel Samrat, Chanakyapuri",
            image: "club-3.jpg",
            rating: 4.7,
            badge: "NEW",
            distance: "5.1 km"
        },
        {
            id: 4,
            name: "Kitty Su",
            address: "The Lalit, Barakhamba",
            image: "club-4.jpg",
            rating: 4.5,
            badge: "",
            distance: "3.8 km"
        }
    ],
    Mumbai: [
        {
            id: 5,
            name: "Tryst",
            address: "Lower Parel, Phoenix Mills",
            image: "club-5.jpg",
            rating: 4.9,
            badge: "POPULAR",
            distance: "4.2 km"
        },
        {
            id: 6,
            name: "Dragonfly",
            address: "Andheri West, Veera Desai",
            image: "club-6.jpg",
            rating: 4.7,
            badge: "",
            distance: "12.5 km"
        },
        {
            id: 7,
            name: "Iluminate",
            address: "Bandra West, Linking Road",
            image: "club-7.jpg",
            rating: 4.6,
            badge: "TRENDING",
            distance: "9.8 km"
        },
        {
            id: 8,
            name: "Arth",
            address: "Worli, Hard Rock Cafe",
            image: "club-8.jpg",
            rating: 4.4,
            badge: "",
            distance: "6.3 km"
        }
    ],
    Chandigarh: [
        {
            id: 9,
            name: "Paara",
            address: "Sector 26, Madhya Marg",
            image: "club-9.jpg",
            rating: 4.8,
            badge: "POPULAR",
            distance: "3.1 km"
        },
        {
            id: 10,
            name: "The Great Bear",
            address: "Sector 26, Main Market",
            image: "club-10.jpg",
            rating: 4.5,
            badge: "",
            distance: "3.5 km"
        },
        {
            id: 11,
            name: "Hops n Grains",
            address: "Sector 9, Inner Market",
            image: "club-11.jpg",
            rating: 4.6,
            badge: "NEW",
            distance: "5.2 km"
        },
        {
            id: 12,
            name: "Smaaash",
            address: "Elante Mall, Industrial Area",
            image: "club-12.jpg",
            rating: 4.4,
            badge: "",
            distance: "8.7 km"
        }
    ]
};

// State
let currentCity = null;
const SUPPORTED_CITIES = ['Delhi', 'Mumbai', 'Chandigarh'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkLocation();
});

// Check saved location
function checkLocation() {
    const savedCity = localStorage.getItem('nexus_club_city');
    if (savedCity && SUPPORTED_CITIES.includes(savedCity)) {
        currentCity = savedCity;
        loadClubs(savedCity);
        hideLocationModal();
    } else {
        showLocationModal();
        detectLocation(); // Auto-attempt detection
    }
}

// Show/Hide Modal
function showLocationModal() {
    document.getElementById('locationModal').classList.remove('hidden');
}

function hideLocationModal() {
    document.getElementById('locationModal').classList.add('hidden');
}

function openLocationModal() {
    showLocationModal();
}

// Location Detection
async function detectLocation() {
    const btn = document.querySelector('.detect-btn');
    const originalHTML = btn.innerHTML;
    
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span><strong>Detecting...</strong><small>Please wait</small></span>`;
    btn.disabled = true;
    
    // Try IP-based first
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.city) {
            const city = findSupportedCity(data.city);
            if (city) {
                selectCity(city);
                return;
            }
        }
    } catch (e) {
        console.log('IP detection failed');
    }
    
    // Try GPS as fallback
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await res.json();
                    const city = findSupportedCity(data.city || data.locality);
                    
                    if (city) {
                        selectCity(city);
                    } else {
                        showError('We only operate in Delhi, Mumbai & Chandigarh');
                    }
                } catch (e) {
                    showError('Detection failed. Please select manually.');
                }
            },
            () => {
                showError('Location access denied. Please select manually.');
            },
            { timeout: 8000 }
        );
    } else {
        showError('Geolocation not supported. Please select manually.');
    }
}

function findSupportedCity(detectedCity) {
    const detected = detectedCity.toLowerCase();
    
    for (let city of SUPPORTED_CITIES) {
        if (detected.includes(city.toLowerCase()) || 
            city.toLowerCase().includes(detected)) {
            return city;
        }
    }
    
    // Check nearby/region matches
    if (detected.includes('new delhi') || detected.includes('noida') || detected.includes('gurgaon')) return 'Delhi';
    if (detected.includes('bombay') || detected.includes('navi mumbai') || detected.includes('thane')) return 'Mumbai';
    if (detected.includes('mohali') || detected.includes('panchkula')) return 'Chandigarh';
    
    return null;
}

function selectCity(city) {
    currentCity = city;
    localStorage.setItem('nexus_club_city', city);
    loadClubs(city);
    hideLocationModal();
    updateHeader(city);
}

function updateHeader(city) {
    document.getElementById('currentCity').textContent = city;
    document.getElementById('cityTitle').textContent = `Top Clubs in ${city}`;
}

// Load Clubs
function loadClubs(city) {
    const grid = document.getElementById('clubsGrid');
    const clubs = CLUBS_DATA[city] || [];
    
    document.getElementById('clubCount').textContent = `${clubs.length} clubs`;
    
    grid.innerHTML = clubs.map((club, index) => `
        <div class="club-card" onclick="openClub(${club.id})" style="animation-delay: ${index * 0.1}s">
            <div class="club-image">
                <img src="assets/${club.image}" alt="${club.name}" loading="lazy">
                ${club.badge ? `<span class="club-badge ${club.badge.toLowerCase()}">${club.badge}</span>` : ''}
                <div class="club-rating">
                    <i class="fas fa-star"></i>
                    <span>${club.rating}</span>
                </div>
            </div>
            <div class="club-info">
                <h3>${club.name}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${club.address}</p>
            </div>
            <div class="club-footer">
                <span class="club-distance"><i class="fas fa-location-arrow"></i> ${club.distance}</span>
                <div class="club-arrow">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        </div>
    `).join('');
    
    // Empty state
    document.getElementById('emptyState').classList.toggle('hidden', clubs.length > 0);
}

// Search Filter
function filterClubs(query) {
    const cards = document.querySelectorAll('.club-card');
    const lowerQuery = query.toLowerCase();
    let visibleCount = 0;
    
    cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const address = card.querySelector('p').textContent.toLowerCase();
        
        if (name.includes(lowerQuery) || address.includes(lowerQuery)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    document.getElementById('emptyState').classList.toggle('hidden', visibleCount > 0);
}

// Open Club Detail
function openClub(clubId) {
    const club = Object.values(CLUBS_DATA).flat().find(c => c.id === clubId);
    if (club) {
        // Store selected club
        sessionStorage.setItem('selectedClub', JSON.stringify(club));
        window.location.href = `club-detail.html?id=${clubId}`;
    }
}

// Error Handler
function showError(message) {
    const btn = document.querySelector('.detect-btn');
    btn.innerHTML = `<i class="fas fa-exclamation-circle"></i><span><strong>${message}</strong><small>Tap to retry</small></span>`;
    btn.disabled = false;
    btn.style.borderColor = '#ff4444';
    
    setTimeout(() => {
        btn.style.borderColor = '';
        btn.innerHTML = `<i class="fas fa-crosshairs"></i><span><strong>Detect my location</strong><small>Using GPS & Network</small></span>`;
        btn.onclick = detectLocation;
    }, 3000);
}

// Touch feedback
document.addEventListener('click', (e) => {
    if (e.target.closest('.club-card')) {
        const card = e.target.closest('.club-card');
        card.style.transform = 'scale(0.98)';
        setTimeout(() => card.style.transform = '', 150);
    }
});