// index.js - Main app functionality

// Auth check - redirect to auth if not logged in
(function() {
    const auth = localStorage.getItem('nexus_auth');
    const session = sessionStorage.getItem('nexus_session');
    
    if (!auth && !session) {
        // Not logged in - go to auth page
        window.location.replace('auth.html');
        return;
    }
})();

// Only runs if authenticated
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
});

function loadUserData() {
    const auth = localStorage.getItem('nexus_auth');
    const profile = localStorage.getItem('nexus_profile');
    
    if (!auth) {
        window.location.replace('auth.html');
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

function logout() {
    localStorage.removeItem('nexus_auth');
    localStorage.removeItem('nexus_profile');
    sessionStorage.removeItem('nexus_session');
    window.location.replace('auth.html');
}