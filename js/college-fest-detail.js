// Sample events database - 1 event per college for now, expandable
const eventsDatabase = {
    1: [ // Christ University
        {
            id: 'christ-1',
            name: 'InBloom 2026',
            category: 'Cultural Fest',
            date: 'Feb 15-17, 2026',
            time: '10:00 AM',
            venue: 'Central Campus Ground',
            price: 499,
            image: 'assets/events/inbloom.jpg',
            description: 'Annual cultural festival featuring music, dance, and art competitions.',
            lineup: ['Local Artists', 'DJ Night', 'Battle of Bands']
        }
    ],
    2: [ // Delhi NCR
        {
            id: 'delhi-1',
            name: 'Crossroads 2026',
            category: 'Cultural Fest',
            date: 'Mar 20-22, 2026',
            time: '11:00 AM',
            venue: 'Main Auditorium',
            price: 299,
            image: 'assets/events/crossroads.jpg',
            description: 'The biggest college fest in Delhi NCR with celebrity performances.',
            lineup: ['Bollywood Night', 'EDM Night', 'Comedy Show']
        }
    ],
    3: [ // Symbiosis Noida
        {
            id: 'symbiosis-1',
            name: 'Symphony 2026',
            category: 'Music Fest',
            date: 'Jan 25-27, 2026',
            time: '2:00 PM',
            venue: 'University Ground',
            price: 399,
            image: 'assets/events/symphony.jpg',
            description: 'Three days of musical extravaganza and cultural celebrations.',
            lineup: ['Sunburn Campus', 'Rock Night', 'Classical Evening']
        }
    ],
    4: [ // LPU Jalandhar
        {
            id: 'lpu-1',
            name: 'YouthVibe 2026',
            category: 'Youth Fest',
            date: 'Apr 5-8, 2026',
            time: '9:00 AM',
            venue: 'LPU Campus',
            price: 199,
            image: 'assets/events/youthvibe.jpg',
            description: 'Asia\'s largest youth festival with 500+ events and competitions.',
            lineup: ['Parikrama', 'Nucleya', 'Stand-up Comedy']
        }
    ],
    5: [ // IIT Bombay
        {
            id: 'iitb-1',
            name: 'Mood Indigo 2026',
            category: 'Cultural Fest',
            date: 'Dec 26-29, 2025',
            time: '10:00 AM',
            venue: 'IIT Campus',
            price: 599,
            image: 'assets/events/mood-indigo.jpg',
            description: 'Asia\'s largest college cultural festival since 1971.',
            lineup: ['Arijit Singh Live', 'Amit Trivedi', 'International Artists']
        }
    ],
    6: [ // IIT Delhi
        {
            id: 'iitd-1',
            name: 'Rendezvous 2026',
            category: 'Cultural Fest',
            date: 'Oct 10-14, 2025',
            time: '11:00 AM',
            venue: 'IIT Delhi Campus',
            price: 499,
            image: 'assets/events/rendezvous.jpg',
            description: 'The annual cultural festival of IIT Delhi.',
            lineup: ['Nucleya', 'Vishal-Shekhar', 'Comedy Night']
        }
    ],
    7: [ // BITS Pilani
        {
            id: 'bits-1',
            name: 'OASIS 2026',
            category: 'Cultural Fest',
            date: 'Nov 2-6, 2025',
            time: '10:00 AM',
            venue: 'BITS Campus',
            price: 449,
            image: 'assets/events/oasis.jpg',
            description: 'The magical fest of BITS Pilani with 96 hours of non-stop fun.',
            lineup: ['Salim-Sulaiman', 'The Local Train', 'DJ Chetas']
        }
    ],
    8: [ // VIT Vellore
        {
            id: 'vit-1',
            name: 'Riviera 2026',
            category: 'Sports & Cultural',
            date: 'Feb 20-24, 2026',
            time: '9:00 AM',
            venue: 'VIT Grounds',
            price: 349,
            image: 'assets/events/riviera.jpg',
            description: 'International sports and cultural carnival of VIT.',
            lineup: ['Sunidhi Chauhan', 'Sport Events', 'Pro Nights']
        }
    ],
    9: [ // SRM University
        {
            id: 'srm-1',
            name: 'Milan 2026',
            category: 'Cultural Fest',
            date: 'Mar 10-13, 2026',
            time: '10:00 AM',
            venue: 'SRM Campus',
            price: 299,
            image: 'assets/events/milan.jpg',
            description: 'The national level cultural festival of SRM University.',
            lineup: ['Benny Dayal', 'DJ Snake', 'Fashion Show']
        }
    ],
    10: [ // Manipal University
        {
            id: 'manipal-1',
            name: 'Revels 2026',
            category: 'Cultural Fest',
            date: 'Mar 25-29, 2026',
            time: '10:00 AM',
            venue: 'Manipal Campus',
            price: 399,
            image: 'assets/events/revels.jpg',
            description: 'The annual cultural fest of Manipal Academy of Higher Education.',
            lineup: ['Pentagram', 'Divine', 'Dance Competitions']
        }
    ],
    11: [ // NMIMS Mumbai
        {
            id: 'nmims-1',
            name: 'NMMUN 2026',
            category: 'MUN Conference',
            date: 'Jan 15-18, 2026',
            time: '9:00 AM',
            venue: 'NMIMS Campus',
            price: 2499,
            image: 'assets/events/nmmun.jpg',
            description: 'Premier Model United Nations conference in India.',
            lineup: ['Committee Sessions', 'Guest Lectures', 'Gala Night']
        }
    ],
    12: [ // Ashoka University
        {
            id: 'ashoka-1',
            name: 'Breeze 2026',
            category: 'Cultural Fest',
            date: 'Feb 8-10, 2026',
            time: '11:00 AM',
            venue: 'Ashoka Campus',
            price: 599,
            image: 'assets/events/breeze.jpg',
            description: 'A celebration of art, music, and culture at Ashoka.',
            lineup: ['Prateek Kuhad', 'Poetry Slam', 'Art Exhibition']
        }
    ],
    13: [ // FLAME University
        {
            id: 'flame-1',
            name: 'FLAME Fest 2026',
            category: 'Cultural Fest',
            date: 'Jan 30 - Feb 2, 2026',
            time: '10:00 AM',
            venue: 'FLAME Campus',
            price: 449,
            image: 'assets/events/flame-fest.jpg',
            description: 'The annual cultural festival of FLAME University.',
            lineup: ['Indian Ocean', 'Theatre Plays', 'Dance Battles']
        }
    ],
    14: [ // Jadavpur University
        {
            id: 'jadavpur-1',
            name: 'Sanskriti 2026',
            category: 'Cultural Fest',
            date: 'Apr 15-18, 2026',
            time: '10:00 AM',
            venue: 'Jadavpur Campus',
            price: 199,
            image: 'assets/events/sanskriti.jpg',
            description: 'The biggest cultural fest in Eastern India.',
            lineup: ['Anupam Roy', 'Underground Authority', 'Band Competition']
        }
    ],
    15: [ // NIT Trichy
        {
            id: 'nit-1',
            name: 'Festember 2026',
            category: 'Cultural Fest',
            date: 'Sep 23-27, 2025',
            time: '10:00 AM',
            venue: 'NIT Campus',
            price: 349,
            image: 'assets/events/festember.jpg',
            description: 'The annual cultural festival of NIT Trichy since 1975.',
            lineup: ['Karthik', 'Masala Coffee', 'Pro Show Nights']
        }
    ]
};

// College data mapping
const collegeData = {
    1: { name: 'Christ University', fest: 'InBloom', location: 'Bangalore', image: 'assets/colleges/christ.jpg' },
    2: { name: 'Delhi NCR', fest: 'Crossroads', location: 'Noida, Delhi', image: 'assets/colleges/delhi-ncr.jpg' },
    3: { name: 'Symbiosis Noida', fest: 'Symphony', location: 'Noida, UP', image: 'assets/colleges/symbiosis.jpg' },
    4: { name: 'LPU Jalandhar', fest: 'YouthVibe', location: 'Jalandhar, Punjab', image: 'assets/colleges/lpu.jpg' },
    5: { name: 'IIT Bombay', fest: 'Mood Indigo', location: 'Mumbai, Maharashtra', image: 'assets/colleges/iit-bombay.jpg' },
    6: { name: 'IIT Delhi', fest: 'Rendezvous', location: 'New Delhi', image: 'assets/colleges/iit-delhi.jpg' },
    7: { name: 'BITS Pilani', fest: 'OASIS', location: 'Pilani, Rajasthan', image: 'assets/colleges/bits.jpg' },
    8: { name: 'VIT Vellore', fest: 'Riviera', location: 'Vellore, Tamil Nadu', image: 'assets/colleges/vit.jpg' },
    9: { name: 'SRM University', fest: 'Milan', location: 'Chennai, Tamil Nadu', image: 'assets/colleges/srm.jpg' },
    10: { name: 'Manipal University', fest: 'Revels', location: 'Manipal, Karnataka', image: 'assets/colleges/manipal.jpg' },
    11: { name: 'NMIMS Mumbai', fest: 'NMMUN', location: 'Mumbai, Maharashtra', image: 'assets/colleges/nmims.jpg' },
    12: { name: 'Ashoka University', fest: 'Breeze', location: 'Sonipat, Haryana', image: 'assets/colleges/ashoka.jpg' },
    13: { name: 'FLAME University', fest: 'FLAME Fest', location: 'Pune, Maharashtra', image: 'assets/colleges/flame.jpg' },
    14: { name: 'Jadavpur University', fest: 'Sanskriti', location: 'Kolkata, West Bengal', image: 'assets/colleges/jadavpur.jpg' },
    15: { name: 'NIT Trichy', fest: 'Festember', location: 'Tiruchirappalli', image: 'assets/colleges/nit-trichy.jpg' }
};

let currentCollegeId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Get college ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentCollegeId = urlParams.get('id') || '1';
    
    loadCollegeData();
    renderEvents();
});

function loadCollegeData() {
    const college = collegeData[currentCollegeId];
    if (!college) {
        window.location.href = 'college-fests.html';
        return;
    }
    
    document.getElementById('collegeName').textContent = college.name;
    document.getElementById('festName').textContent = college.fest + ' 2026';
    document.getElementById('collegeLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${college.location}`;
    document.getElementById('collegeImage').src = college.image;
    document.getElementById('collegeImage').onerror = function() {
        this.src = 'assets/college-fest.jpg';
    };
}

function renderEvents() {
    const events = eventsDatabase[currentCollegeId] || [];
    const grid = document.getElementById('eventsGrid');
    
    document.getElementById('eventCount').textContent = `${events.length} event${events.length !== 1 ? 's' : ''}`;
    
    if (events.length === 0) {
        grid.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-times"></i>
                <p>No events announced yet</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = events.map(event => `
        <div class="event-card" onclick="openEvent('${event.id}')">
            <img src="${event.image}" alt="${event.name}" class="event-image" onerror="this.src='assets/college-fest.jpg'">
            <div class="event-content">
                <span class="event-category">${event.category}</span>
                <h4 class="event-name">${event.name}</h4>
                <div class="event-meta">
                    <span><i class="fas fa-calendar"></i> ${event.date}</span>
                    <span><i class="fas fa-clock"></i> ${event.time}</span>
                    <span><i class="fas fa-map-pin"></i> ${event.venue}</span>
                </div>
            </div>
            <div class="event-price">
                <span>₹${event.price}</span>
            </div>
        </div>
    `).join('');
}

function openEvent(eventId) {
    const events = eventsDatabase[currentCollegeId] || [];
    const event = events.find(e => e.id === eventId);
    
    if (event) {
        sessionStorage.setItem('selectedEvent', JSON.stringify({
            ...event,
            college: collegeData[currentCollegeId]
        }));
        window.location.href = `event-detail.html?id=${eventId}`;
    }
}