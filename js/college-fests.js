const API_BASE_URL = 'https://nexus-host-backend.onrender.com/api';

let colleges = []; // Will be populated from backend

// Fetch colleges from backend
async function fetchColleges() {
    try {
        const response = await fetch(`${API_BASE_URL}/colleges/public/all`);
        const result = await response.json();
        
        if (result.success) {
            colleges = result.data;
            renderColleges(colleges);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Failed to fetch colleges:', error);
        document.getElementById('collegesGrid').innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load colleges. Please try again later.</p>
            </div>
        `;
    }
}

function renderColleges(collegesToRender = colleges) {
    const grid = document.getElementById('collegesGrid');
    
    if (collegesToRender.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No colleges found. If your university is not in the list, mail us at: collegefest@nexus.in</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = collegesToRender.map(college => `
        <div class="college-card" onclick="openCollege('${college.id}')">
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
        c.location.toLowerCase().includes(query.toLowerCase())
    );
    renderColleges(filtered);
}

function openCollege(id) {
    const college = colleges.find(c => c.id === id);
    sessionStorage.setItem('selectedCollege', JSON.stringify(college));
    window.location.href = `college-fest-detail.html?id=${id}`;
}

// Initial fetch instead of hardcoded render
fetchColleges();