const Splash = {
    progress: 0,
    targetProgress: 100,
    isLoggedIn: false,
    
    init() {
        this.checkAuthStatus();
        this.startLoading();
        this.animateLoadingText();
    },
    
    checkAuthStatus() {
        // Check localStorage for auth token (simulated)
        const authToken = localStorage.getItem('nexus_auth');
        const userSession = sessionStorage.getItem('nexus_session');
        
        this.isLoggedIn = !!(authToken || userSession);
        
        // Debug: Uncomment to test logged in state
        // this.isLoggedIn = true;
    },
    
    startLoading() {
        const bar = document.getElementById('progressBar');
        const interval = setInterval(() => {
            // Non-linear loading for realism
            const increment = Math.random() * 15 + 5;
            this.progress = Math.min(this.progress + increment, this.targetProgress);
            bar.style.width = this.progress + '%';
            
            if(this.progress >= 100) {
                clearInterval(interval);
                setTimeout(() => this.redirect(), 300);
            }
        }, 150);
    },
    
    animateLoadingText() {
        const texts = [
            'Initializing',
            'Checking session',
            'Loading assets',
            'Almost there'
        ];
        
        let index = 0;
        const statusEl = document.getElementById('loadingStatus');
        
        setInterval(() => {
            if(this.progress < 100) {
                index = (index + 1) % texts.length;
                statusEl.style.opacity = '0';
                setTimeout(() => {
                    statusEl.textContent = texts[index];
                    statusEl.style.opacity = '1';
                }, 200);
            }
        }, 600);
    },
    
    redirect() {
        const container = document.querySelector('.splash-container');
        container.style.opacity = '0';
        container.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            if(this.isLoggedIn) {
                window.location.href = 'index.html';
            } else {
                window.location.href = 'auth.html';
            }
        }, 500);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => Splash.init());