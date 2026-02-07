// Firebase Configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const Auth = {
    mode: 'login', // 'login' or 'signup'
    step: 'phone', // 'phone' or 'otp'
    confirmationResult: null,
    resendTimer: null,
    
    init() {
        this.setupOTPInputs();
        this.setupPhoneInput();
        this.setupRecaptcha();
        this.checkAuthState();
    },
    
    // Check if user is already logged in
    checkAuthState() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in, redirect to app
                this.redirectToApp(user);
            }
        });
    },
    
    setupRecaptcha() {
        // Initialize invisible reCAPTCHA
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved
            }
        });
    },
    
    setupPhoneInput() {
        const input = document.getElementById('phoneInput');
        input.addEventListener('input', (e) => {
            // Only numbers
            e.target.value = e.target.value.replace(/\D/g, '');
            
            // Auto-advance visual feedback
            if(e.target.value.length === 10) {
                e.target.parentElement.style.borderColor = 'var(--accent)';
            } else {
                e.target.parentElement.style.borderColor = 'var(--border)';
            }
        });
        
        // Enter key support
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
            
            // Get ID token for backend verification
            const idToken = await user.getIdToken();
            
            // Store token and user data
            await this.completeAuth(user, idToken, 'google');
            
        } catch (error) {
            this.setLoading(false);
            this.showToast(this.getErrorMessage(error));
            console.error('Google sign in error:', error);
        }
    },
    
    toggleMode() {
        this.mode = this.mode === 'login' ? 'signup' : 'login';
        const isLogin = this.mode === 'login';
        
        // Update UI
        document.getElementById('formTitle').textContent = isLogin ? 'Welcome back' : 'Create account';
        document.getElementById('formSubtitle').textContent = isLogin ? 'Sign in to continue your journey' : 'Start your journey with Nexus';
        document.getElementById('toggleText').textContent = isLogin ? "Don't have an account?" : "Already have an account?";
        document.getElementById('toggleBtn').textContent = isLogin ? 'Sign up' : 'Sign in';
        document.getElementById('actionBtn').querySelector('.btn-text').textContent = 'Continue';
        
        // Reset form
        this.step = 'phone';
        this.showPhoneStep();
        
        // Show/hide name field for signup
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
    
    // SEND REAL OTP VIA FIREBASE
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
            
            // Focus first OTP
            setTimeout(() => {
                document.querySelector('.otp-digit').focus();
            }, 100);
            
            this.showToast('Verification code sent!');
            this.startResendTimer();
            
        } catch (error) {
            this.setLoading(false);
            this.showToast(this.getErrorMessage(error));
            console.error('SMS send error:', error);
            
            // Reset reCAPTCHA if needed
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
        
        // Clear OTP inputs
        document.querySelectorAll('.otp-digit').forEach(input => input.value = '');
    },
    
    // VERIFY REAL OTP
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
            
            // Update profile if signup mode
            if(this.mode === 'signup') {
                const name = document.getElementById('nameInput').value;
                if(name) {
                    await user.updateProfile({ displayName: name });
                }
            }
            
            // Get ID token for backend
            const idToken = await user.getIdToken();
            
            // Success animation
            inputs.forEach(input => {
                input.style.borderColor = 'var(--accent)';
                input.style.background = 'rgba(16, 185, 129, 0.1)';
            });
            
            setTimeout(() => {
                this.completeAuth(user, idToken, 'phone');
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
    
    // COMPLETE AUTHENTICATION
    async completeAuth(user, idToken, method) {
        // Store auth data
        const authData = {
            uid: user.uid,
            phone: user.phoneNumber || null,
            email: user.email || null,
            name: user.displayName || document.getElementById('nameInput')?.value || 'User',
            photoURL: user.photoURL || null,
            method: method,
            idToken: idToken,
            timestamp: Date.now()
        };
        
        localStorage.setItem('nexus_auth', JSON.stringify(authData));
        sessionStorage.setItem('nexus_session', 'active');
        
        // Optional: Send token to your backend for verification/session creation
        try {
            await this.syncWithBackend(idToken);
        } catch (e) {
            console.log('Backend sync optional');
        }
        
        // Redirect
        document.body.style.transition = 'opacity 0.4s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 400);
    },
    
    // SYNC WITH YOUR VERCEL BACKEND
    async syncWithBackend(idToken) {
        // Replace with your Vercel backend URL
        const response = await fetch('https://your-backend.vercel.app/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) throw new Error('Backend sync failed');
        return await response.json();
    },
    
    redirectToApp(user) {
        // If already logged in, redirect to main app
        if (window.location.pathname.includes('auth.html')) {
            window.location.href = 'index.html';
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
    
    // LOGOUT FUNCTION (call from other pages)
    logout() {
        auth.signOut().then(() => {
            localStorage.removeItem('nexus_auth');
            sessionStorage.removeItem('nexus_session');
            window.location.href = 'auth.html';
        });
    }
};

// Add shake animation
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