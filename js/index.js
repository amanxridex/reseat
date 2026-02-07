// index.js - Main app functionality

// Load user data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
});

// Load user from localStorage
function loadUserData() {
    const auth = localStorage.getItem('nexus_auth');
    const profile = localStorage.getItem('nexus_profile');
    
    if (!auth) {
        window.location.href = 'splash.html';
        return;
    }
    
    const authData = JSON.parse(auth);
    
    // Set user info
    document.getElementById('userName').textContent = authData.name || 'User';
    document.getElementById('userEmail').textContent = authData.email || '';
    document.getElementById('userAvatar').src = authData.photoURL || 'https://via.placeholder.com/40';
    
    // If profile exists, use that data
    if (profile) {
        const profileData = JSON.parse(profile);
        if (profileData.full_name) {
            document.getElementById('userName').textContent = profileData.full_name;
        }
        if (profileData.avatar_url) {
            document.getElementById('userAvatar').src = profileData.avatar_url;
        }
    }
}

// Logout function
function logout() {
    // Clear all storage
    localStorage.removeItem('nexus_auth');
    localStorage.removeItem('nexus_profile');
    sessionStorage.removeItem('nexus_session');
    
    // Redirect to auth page
    window.location.href = 'auth.html';
}

// Optional: Fetch fresh user data from Supabase
async function fetchUserProfile() {
    const auth = JSON.parse(localStorage.getItem('nexus_auth'));
    if (!auth) return;
    
    try {
        const response = await fetch('https://nexus-api-hkfu.onrender.com/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${auth.idToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('nexus_profile', JSON.stringify(data.profile));
            loadUserData(); // Refresh UI
        }
    } catch (error) {
        console.error('Failed to fetch profile:', error);
    }
}