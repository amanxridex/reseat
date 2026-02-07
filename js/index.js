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