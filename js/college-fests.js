const colleges = [
    {
        id: 1,
        name: "Christ University",
        location: "Bangalore",
        image: "assets/colleges/christ.jpg",
        festName: "InBloom"
    },
    {
        id: 2,
        name: "Christ University",
        location: "Delhi NCR",
        image: "assets/colleges/delhi-ncr.jpg",
        festName: "Crossroads"
    },
    {
        id: 3,
        name: "Symbiosis Noida",
        location: "Noida, UP",
        image: "assets/colleges/symbiosis.jpg",
        festName: "Symphony"
    },
    {
        id: 4,
        name: "LPU Jalandhar",
        location: "Jalandhar, Punjab",
        image: "assets/colleges/lpu.jpg",
        festName: "YouthVibe"
    },
    {
        id: 5,
        name: "IIT Bombay",
        location: "Mumbai, Maharashtra",
        image: "assets/colleges/iit-bombay.jpg",
        festName: "Mood Indigo"
    },
    {
        id: 6,
        name: "IIT Delhi",
        location: "New Delhi",
        image: "assets/colleges/iit-delhi.jpg",
        festName: "Rendezvous"
    },
    {
        id: 7,
        name: "BITS Pilani",
        location: "Pilani, Rajasthan",
        image: "assets/colleges/bits.jpg",
        festName: "OASIS"
    },
    {
        id: 8,
        name: "VIT Vellore",
        location: "Vellore, Tamil Nadu",
        image: "assets/colleges/vit.jpg",
        festName: "Riviera"
    },
    {
        id: 9,
        name: "SRM University",
        location: "Chennai, Tamil Nadu",
        image: "assets/colleges/srm.jpg",
        festName: "Milan"
    },
    {
        id: 10,
        name: "Manipal University",
        location: "Manipal, Karnataka",
        image: "assets/colleges/manipal.jpg",
        festName: "Revels"
    },
    {
        id: 11,
        name: "NMIMS Mumbai",
        location: "Mumbai, Maharashtra",
        image: "assets/colleges/nmims.jpg",
        festName: "NMMUN"
    },
    {
        id: 12,
        name: "Ashoka University",
        location: "Sonipat, Haryana",
        image: "assets/colleges/ashoka.jpg",
        festName: "Breeze"
    },
    {
        id: 13,
        name: "FLAME University",
        location: "Pune, Maharashtra",
        image: "assets/colleges/flame.jpg",
        festName: "FLAME Fest"
    },
    {
        id: 14,
        name: "Jadavpur University",
        location: "Kolkata, West Bengal",
        image: "assets/colleges/jadavpur.jpg",
        festName: "Sanskriti"
    },
    {
        id: 15,
        name: "NIT Trichy",
        location: "Tiruchirappalli",
        image: "assets/colleges/nit-trichy.jpg",
        festName: "Festember"
    }
];

function renderColleges(collegesToRender = colleges) {
    const grid = document.getElementById('collegesGrid');
    
    if (collegesToRender.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>If your university is not in the list mail us at: collegefest@nexus.in</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = collegesToRender.map(college => `
        <div class="college-card" onclick="openCollege(${college.id})">
            <img src="${college.image}" alt="${college.name}" class="college-image" onerror="this.src='assets/college-fest.jpg'">
            <div class="college-info">
                <div class="college-name">${college.name}</div>
                <div class="college-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${college.location}
                </div>
            </div>
        </div>
    `).join('');
}

function filterColleges(query) {
    const filtered = colleges.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.location.toLowerCase().includes(query.toLowerCase()) ||
        c.festName.toLowerCase().includes(query.toLowerCase())
    );
    renderColleges(filtered);
}

function openCollege(id) {
    const college = colleges.find(c => c.id === id);
    sessionStorage.setItem('selectedCollege', JSON.stringify(college));
    window.location.href = `college-fest-detail.html?id=${id}`;
}

// Initial render
renderColleges();