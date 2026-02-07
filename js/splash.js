const Splash = {
    progress: 0,
    targetProgress: 100,
    
    init() {
        this.startLoading();
        this.animateLoadingText();
    },
    
    startLoading() {
        const bar = document.getElementById('progressBar');
        const interval = setInterval(() => {
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
        const texts = ['Initializing', 'Checking session', 'Loading assets', 'Almost there'];
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
        // Mark splash as shown for this session
        sessionStorage.setItem('splash_shown', 'true');
        
        // Check auth status
        const auth = localStorage.getItem('nexus_auth');
        const target = auth ? 'index.html' : 'auth.html';
        
        // Fade out
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            window.location.replace(target);
        }, 500);
    }
};

document.addEventListener('DOMContentLoaded', () => Splash.init());