// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCtADU0CC6S0y7yk4zp0DZ2HXWxi-INyBU",
    authDomain: "nexus-user-c7579.firebaseapp.com",
    projectId: "nexus-user-c7579",
    storageBucket: "nexus-user-c7579.firebasestorage.app",
    messagingSenderId: "622138563060",
    appId: "1:622138563060:web:8329098be5c5c0f0a741a1",
    measurementId: "G-WKB1BPY3NM"
};

// Supabase Config
const SUPABASE_URL = 'https://qoqyghkdxfnmkqtlypfo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcXlnaGtkeGZubWtxdGx5cGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTU2MjMsImV4cCI6MjA4NjAzMTYyM30.z6QGNCtsCuWocPFe4ybdTSuIYlHfLE61EZ5L7A3TKgY';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Initialize Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Backend API URL
const API_BASE = 'https://nexus-api-hkfu.onrender.com';

const Auth = {
    mode: 'login',
    step: 'phone',
    confirmationResult: null,
    resendTimer: null,
    
    init() {
        this.setupOTPInputs();
        this.setupPhoneInput();
        this.setupRecaptcha();
        this.checkAuthState();
        // ❌ REMOVED: startTokenRefresh - no longer needed with cookies
    },
    
    // ✅ UPDATED: Check session cookie instead of Firebase token
    async checkAuthState() {
        try {
            const res = await fetch(`${API_BASE}/api/auth/check`, {
                credentials: 'include', // ✅ Cookie sent
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.exists) {
                    // Session valid, redirect to app
                    window.location.href = 'index.html';
                }
            }
        } catch (err) {
            console.log('No active session');
        }
    },
    
    // ❌ REMOVED: getFreshToken() - no longer needed
    
    // ❌ REMOVED: startTokenRefresh() - no longer needed
    
    setupRecaptcha() {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {}
        });
    },
    
    setupPhoneInput() {
        const input = document.getElementById('phoneInput');
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
            
            if(e.target.value.length === 10) {
                e.target.parentElement.style.borderColor = 'var(--accent)';
            } else {
                e.target.parentElement.style.borderColor = 'var(--border)';
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') this.handleAction();
        });
    },
    
    setupOTPInputs() {
        const inputs = document.querySelectorAll('.otp-digit');
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if(e.target.value) {
                    if(index < 5) inputs[index + 1].focus();
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if(e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
                if(e.key === 'Enter') this.handleAction();
            });
            
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                for(let i = 0; i < paste.length; i++) {
                    if(inputs[i]) inputs[i].value = paste[i];
                }
                if(inputs[paste.length - 1]) inputs[paste.length - 1].focus();
            });
        });
    },
    
    // GOOGLE SIGN IN
    async signInWithGoogle() {
        this.setLoading(true);
        const provider = new firebase.auth.GoogleAuthProvider();
        
        try {
            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            
            const idToken = await user.getIdToken();
            
            // ✅ NEW: Create session cookie first
            await this.createSession(idToken);
            
            await this.completeAuth(user, 'google');
            
        } catch (error) {
            this.setLoading(false);
            this.showToast(this.getErrorMessage(error));
            console.error('Google sign in error:', error);
        }
    },
    
    // ✅ NEW: Create session cookie
    async createSession(idToken) {
        const res = await fetch(`${API_BASE}/api/auth/session`, {
            method: 'POST',
            credentials: 'include', // ✅ Receive cookie
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        });
        
        if (!res.ok) {
            throw new Error('Failed to create session');
        }
        
        return await res.json();
    },
    
    toggleMode() {
        this.mode = this.mode === 'login' ? 'signup' : 'login';
        const isLogin = this.mode === 'login';
        
        document.getElementById('formTitle').textContent = isLogin ? 'Welcome back' : 'Create account';
        document.getElementById('formSubtitle').textContent = isLogin ? 'Sign in to continue your journey' : 'Start your journey with Nexus';
        document.getElementById('toggleText').textContent = isLogin ? "Don't have an account?" : "Already have an account?";
        document.getElementById('toggleBtn').textContent = isLogin ? 'Sign up' : 'Sign in';
        document.getElementById('actionBtn').querySelector('.btn-text').textContent = 'Continue';
        
        this.step = 'phone';
        this.showPhoneStep();
        
        const nameGroup = document.getElementById('nameGroup');
        if(!isLogin) {
            nameGroup.classList.remove('hidden');
            const phoneGroup = document.getElementById('phoneGroup');
            phoneGroup.parentNode.insertBefore(nameGroup, phoneGroup);
        } else {
            nameGroup.classList.add('hidden');
        }
    },
    
    handleAction() {
        if(this.step === 'phone') {
            const phone = document.getElementById('phoneInput').value;
            if(phone.length !== 10) {
                this.shakeInput(document.getElementById('phoneInput'));
                return;
            }
            this.sendOTP();
        } else {
            this.verifyOTP();
        }
    },
    
    async sendOTP() {
        this.setLoading(true);
        const phoneNumber = '+91' + document.getElementById('phoneInput').value;
        
        try {
            this.confirmationResult = await auth.signInWithPhoneNumber(
                phoneNumber, 
                window.recaptchaVerifier
            );
            
            this.setLoading(false);
            this.step = 'otp';
            this.showOTPStep();
            
            setTimeout(() => {
                document.querySelector('.otp-digit').focus();
            }, 100);
            
            this.showToast('Verification code sent!');
            this.startResendTimer();
            
        } catch (error) {
            this.setLoading(false);
            this.showToast(this.getErrorMessage(error));
            console.error('SMS send error:', error);
            
            if (error.code === 'auth/invalid-app-credential') {
                window.recaptchaVerifier.render().then(function(widgetId) {
                    grecaptcha.reset(widgetId);
                });
            }
        }
    },
    
    showOTPStep() {
        document.getElementById('phoneGroup').classList.add('hidden');
        document.getElementById('nameGroup')?.classList.add('hidden');
        document.getElementById('otpGroup').classList.remove('hidden');
        document.getElementById('actionBtn').querySelector('.btn-text').textContent = 'Verify';
        document.getElementById('formSubtitle').textContent = 'Enter the 6-digit code sent to your phone';
    },
    
    showPhoneStep() {
        document.getElementById('phoneGroup').classList.remove('hidden');
        if(this.mode === 'signup') document.getElementById('nameGroup').classList.remove('hidden');
        document.getElementById('otpGroup').classList.add('hidden');
        document.getElementById('actionBtn').querySelector('.btn-text').textContent = 'Continue';
        document.getElementById('formSubtitle').textContent = this.mode === 'login' ? 'Sign in to continue your journey' : 'Start your journey with Nexus';
        document.getElementById('phoneInput').value = '';
        
        document.querySelectorAll('.otp-digit').forEach(input => input.value = '');
    },
    
    async verifyOTP() {
        const inputs = document.querySelectorAll('.otp-digit');
        const code = Array.from(inputs).map(i => i.value).join('');
        
        if(code.length !== 6) {
            this.shakeInput(document.querySelector('.otp-container'));
            return;
        }
        
        this.setLoading(true);
        
        try {
            const result = await this.confirmationResult.confirm(code);
            const user = result.user;
            
            if(this.mode === 'signup') {
                const name = document.getElementById('nameInput').value;
                if(name) {
                    await user.updateProfile({ displayName: name });
                }
            }
            
            const idToken = await user.getIdToken();
            
            // ✅ NEW: Create session cookie
            await this.createSession(idToken);
            
            inputs.forEach(input => {
                input.style.borderColor = 'var(--accent)';
                input.style.background = 'rgba(16, 185, 129, 0.1)';
            });
            
            setTimeout(() => {
                this.completeAuth(user, 'phone');
            }, 500);
            
        } catch (error) {
            this.setLoading(false);
            inputs.forEach(input => {
                input.style.borderColor = '#ef4444';
                input.style.animation = 'shake 0.4s';
            });
            setTimeout(() => {
                inputs.forEach(input => {
                    input.style.borderColor = '';
                    input.style.animation = '';
                });
            }, 400);
            
            this.showToast('Invalid code. Please try again.');
        }
    },
    
    async completeAuth(user, method) {
        const authData = {
            uid: user.uid,
            phone: user.phoneNumber || null,
            email: user.email || null,
            name: user.displayName || document.getElementById('nameInput')?.value || 'User',
            photoURL: user.photoURL || null,
            method: method,
            // ❌ REMOVED: idToken - no longer stored
            timestamp: Date.now()
        };
        
        localStorage.setItem('nexus_auth', JSON.stringify(authData));
        sessionStorage.setItem('nexus_session', 'active');
        
        try {
            // ✅ UPDATED: Sync with backend using cookie
            await this.syncWithBackend();
        } catch (e) {
            console.log('Backend sync optional');
        }
        
        document.body.style.transition = 'opacity 0.4s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            this.checkProfileAndRedirect(user);
        }, 400);
    },
    
    async checkProfileAndRedirect(user) {
        try {
            // ✅ UPDATED: Use cookie instead of token
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('firebase_uid', user.uid)
                .single();
            
            if (data) {
                localStorage.setItem('nexus_profile', JSON.stringify(data));
                window.location.href = 'index.html';
            } else {
                window.location.href = 'complete-profile.html';
            }
        } catch (e) {
            console.log('No profile found, redirecting to complete profile');
            window.location.href = 'complete-profile.html';
        }
    },
    
    // ✅ UPDATED: Sync with backend using cookie
    async syncWithBackend() {
        const response = await fetch(`${API_BASE}/api/auth/verify`, {
            method: 'POST',
            credentials: 'include', // ✅ Cookie sent automatically
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: Date.now() })
        });
        
        if (!response.ok) throw new Error('Backend sync failed');
        return await response.json();
    },
    
    redirectToApp(user) {
        if (window.location.pathname.includes('auth.html')) {
            this.checkProfileAndRedirect(user);
        }
    },
    
    startResendTimer() {
        let timeLeft = 60;
        const timerEl = document.getElementById('otpTimer');
        const resendBtn = document.getElementById('resendBtn');
        
        resendBtn.classList.add('hidden');
        timerEl.classList.remove('hidden');
        
        this.resendTimer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = `Resend code in ${timeLeft}s`;
            
            if(timeLeft <= 0) {
                clearInterval(this.resendTimer);
                timerEl.classList.add('hidden');
                resendBtn.classList.remove('hidden');
            }
        }, 1000);
    },
    
    resendOTP() {
        this.sendOTP();
    },
    
    setLoading(isLoading) {
        const btn = document.getElementById('actionBtn');
        const text = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.btn-loader');
        
        if(isLoading) {
            text.classList.add('hidden');
            loader.classList.remove('hidden');
            btn.disabled = true;
            btn.style.opacity = '0.8';
        } else {
            text.classList.remove('hidden');
            loader.classList.add('hidden');
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    },
    
    shakeInput(input) {
        input.parentElement.style.animation = 'shake 0.4s';
        setTimeout(() => {
            input.parentElement.style.animation = '';
        }, 400);
    },
    
    showToast(message) {
        const existing = document.querySelector('.toast-notification');
        if(existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-elevated);
            color: var(--text-primary);
            padding: 1rem 2rem;
            border-radius: 100px;
            font-size: 0.875rem;
            font-weight: 500;
            border: 1px solid var(--border);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 1000;
            animation: slideUp 0.3s ease-out;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    getErrorMessage(error) {
        const errorMessages = {
            'auth/invalid-phone-number': 'Invalid phone number format',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/captcha-check-failed': 'Verification failed. Please try again.',
            'auth/popup-closed-by-user': 'Sign in cancelled',
            'auth/popup-blocked': 'Popup blocked. Please allow popups for this site.',
            'auth/account-exists-with-different-credential': 'Account exists with different sign-in method',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/invalid-verification-code': 'Invalid verification code',
            'auth/code-expired': 'Code expired. Please request a new one.'
        };
        return errorMessages[error.code] || 'Something went wrong. Please try again.';
    },
    
    // ✅ UPDATED: Logout with backend call
    async logout() {
        try {
            // Call backend to clear cookie
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include', // ✅ Cookie sent
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err) {
            console.error('Logout error:', err);
        }
        
        auth.signOut().then(() => {
            localStorage.removeItem('nexus_auth');
            localStorage.removeItem('nexus_profile');
            sessionStorage.removeItem('nexus_session');
            window.location.href = 'auth.html';
        });
    }
};

const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    @keyframes slideUp {
        from { opacity: 0; transform: translate(-50%, 20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes slideDown {
        from { opacity: 1; transform: translate(-50%, 0); }
        to { opacity: 0; transform: translate(-50%, 20px); }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => Auth.init());