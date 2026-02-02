const Auth = {
    mode: 'login', // 'login' or 'signup'
    step: 'phone', // 'phone' or 'otp'
    hardcodedOTP: '9090',
    
    init() {
        this.setupOTPInputs();
        this.setupPhoneInput();
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
                    if(index < 3) inputs[index + 1].focus();
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
                const paste = e.clipboardData.getData('text').slice(0, 4);
                for(let i = 0; i < paste.length; i++) {
                    if(inputs[i]) inputs[i].value = paste[i];
                }
                if(inputs[paste.length - 1]) inputs[paste.length - 1].focus();
            });
        });
    },
    
    toggleMode() {
        this.mode = this.mode === 'login' ? 'signup' : 'login';
        const isLogin = this.mode === 'login';
        
        // Update UI
        document.getElementById('formTitle').textContent = isLogin ? 'Welcome back' : 'Create account';
        document.getElementById('formSubtitle').textContent = isLogin ? 'Enter your mobile number to continue' : 'Start your journey with Nexus';
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
            // Insert before phone
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
    
    sendOTP() {
        this.setLoading(true);
        
        // Simulate API
        setTimeout(() => {
            this.setLoading(false);
            this.step = 'otp';
            this.showOTPStep();
            
            // Focus first OTP
            setTimeout(() => {
                document.querySelector('.otp-digit').focus();
            }, 100);
            
            // Show toast
            this.showToast('Code sent: 9090');
        }, 1500);
    },
    
    showOTPStep() {
        document.getElementById('phoneGroup').classList.add('hidden');
        document.getElementById('nameGroup')?.classList.add('hidden');
        document.getElementById('otpGroup').classList.remove('hidden');
        document.getElementById('actionBtn').querySelector('.btn-text').textContent = 'Verify';
        document.getElementById('formSubtitle').textContent = 'Enter the 4-digit code sent to your phone';
    },
    
    showPhoneStep() {
        document.getElementById('phoneGroup').classList.remove('hidden');
        if(this.mode === 'signup') document.getElementById('nameGroup').classList.remove('hidden');
        document.getElementById('otpGroup').classList.add('hidden');
        document.getElementById('actionBtn').querySelector('.btn-text').textContent = 'Continue';
        document.getElementById('formSubtitle').textContent = this.mode === 'login' ? 'Enter your mobile number to continue' : 'Start your journey with Nexus';
        document.getElementById('phoneInput').value = '';
    },
    
    verifyOTP() {
        const inputs = document.querySelectorAll('.otp-digit');
        const entered = Array.from(inputs).map(i => i.value).join('');
        
        if(entered !== this.hardcodedOTP) {
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
            return;
        }
        
        // Success
        inputs.forEach(input => {
            input.style.borderColor = 'var(--accent)';
            input.style.background = 'rgba(16, 185, 129, 0.1)';
        });
        
        this.setLoading(true);
        
        // Complete authentication and redirect
        setTimeout(() => {
            this.completeAuth();
        }, 800);
    },
    
    completeAuth() {
        // Get user details
        const phone = document.getElementById('phoneInput').value;
        const name = document.getElementById('nameInput')?.value || 'User';
        
        // Set auth flag in localStorage (persists across sessions)
        localStorage.setItem('nexus_auth', JSON.stringify({
            timestamp: Date.now(),
            phone: phone,
            name: name,
            isLoggedIn: true
        }));
        
        // Also set session flag (cleared when browser closes)
        sessionStorage.setItem('nexus_session', 'active');
        
        // Smooth fade out before redirect
        document.body.style.transition = 'opacity 0.4s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 400);
    },
    
    resendOTP() {
        this.showToast('Code resent: 9090');
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
        const toast = document.createElement('div');
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