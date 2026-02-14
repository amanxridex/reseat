// index.js - Main app functionality

// ✅ UPDATED: Check session cookie instead of localStorage
(async function() {
    try {
        const res = await fetch('https://nexus-api-hkfu.onrender.com/api/auth/check', {
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
        
        // Session valid, continue loading app
        console.log('✅ Session valid');
        
    } catch (err) {
        console.error('Auth error:', err);
        // Not logged in - go to auth page
        window.location.replace('auth.html');
    }
})();