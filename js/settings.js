const Settings = {
    user: null,
    settings: {},
    
    init() {
        this.checkAuth();
        this.loadUserData();
        this.loadSettings();
        this.setupToggles();
        this.setupEventListeners();
    },
    
    checkAuth() {
        const auth = localStorage.getItem('nexus_auth');
        const session = sessionStorage.getItem('nexus_session');
        
        if (!auth && !session) {
            window.location.replace('auth.html');
            return false;
        }
        return true;
    },
    
    loadUserData() {
        // Get auth and profile data
        const authData = JSON.parse(localStorage.getItem('nexus_auth') || '{}');
        const profileData = JSON.parse(localStorage.getItem('nexus_profile') || '{}');
        
        this.user = {
            name: profileData.full_name || authData.name || 'User',
            phone: profileData.phone || '+91 00000 00000',
            email: authData.email || profileData.email || 'user@email.com',
            avatar: authData.photoURL || profileData.avatar_url || 'https://via.placeholder.com/150',
            kycVerified: profileData.kyc_verified || false,
            points: 12450,
            spendingLimit: 50000
        };
        
        // Update UI with user data
        this.updateUserUI();
    },
    
    updateUserUI() {
        // Personal info preview
        const preview = document.getElementById('personalInfoPreview');
        if (preview) {
            preview.textContent = this.user.name;
        }
        
        // KYC status
        const kycStatus = document.getElementById('kycStatus');
        if (kycStatus) {
            if (this.user.kycVerified) {
                kycStatus.textContent = 'Verified';
                kycStatus.className = 'status-badge verified';
            } else {
                kycStatus.textContent = 'Pending';
                kycStatus.className = 'status-badge pending';
            }
        }
        
        // Points balance
        const pointsBalance = document.getElementById('pointsBalance');
        if (pointsBalance) {
            pointsBalance.textContent = `${this.user.points.toLocaleString()} pts`;
        }
        
        // Spending limit
        const spendingLimit = document.getElementById('spendingLimit');
        if (spendingLimit) {
            spendingLimit.textContent = `₹${this.user.spendingLimit.toLocaleString()}`;
        }
    },
    
    loadSettings() {
        this.settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
        
        // Apply saved settings to toggles
        Object.keys(this.settings).forEach(key => {
            const toggle = document.getElementById(key);
            if (toggle) toggle.checked = this.settings[key];
        });
        
        // Load language preference
        const savedLang = localStorage.getItem('nexus_language') || 'English';
        const langPreview = document.getElementById('currentLanguage');
        if (langPreview) langPreview.textContent = savedLang;
    },
    
    setupToggles() {
        const toggles = document.querySelectorAll('.toggle-switch input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.saveSetting(e.target.id, e.target.checked);
                const label = e.target.closest('.setting-item').querySelector('.setting-label').textContent;
                this.showToast(`${label} ${e.target.checked ? 'enabled' : 'disabled'}`);
            });
        });
    },
    
    setupEventListeners() {
        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                    modal.classList.add('hidden');
                });
            }
        });
        
        // Update conversion result in real-time
        const convertInput = document.getElementById('convertAmount');
        if (convertInput) {
            convertInput.addEventListener('input', (e) => {
                const points = parseInt(e.target.value) || 0;
                document.getElementById('conversionResult').textContent = `₹${points.toLocaleString()}`;
            });
        }
    },
    
    saveSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem('nexus_settings', JSON.stringify(this.settings));
    },
    
    saveAll() {
        this.showToast('All settings saved successfully');
    },
    
    // Profile Functions
    editProfile() {
        // Pre-fill modal with current data
        document.getElementById('editName').value = this.user.name;
        document.getElementById('editPhone').value = this.user.phone;
        document.getElementById('editEmail').value = this.user.email;
        
        this.openModal('editModal');
    },
    
    saveProfile() {
        const name = document.getElementById('editName').value.trim();
        const phone = document.getElementById('editPhone').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        
        if (!name || !phone || !email) {
            this.showToast('Please fill all fields');
            return;
        }
        
        // Update local data
        this.user.name = name;
        this.user.phone = phone;
        this.user.email = email;
        
        // Update localStorage
        const authData = JSON.parse(localStorage.getItem('nexus_auth') || '{}');
        const profileData = JSON.parse(localStorage.getItem('nexus_profile') || '{}');
        
        authData.name = name;
        authData.email = email;
        profileData.full_name = name;
        profileData.phone = phone;
        profileData.email = email;
        
        localStorage.setItem('nexus_auth', JSON.stringify(authData));
        localStorage.setItem('nexus_profile', JSON.stringify(profileData));
        
        // Update UI
        this.updateUserUI();
        this.closeModal('editModal');
        this.showToast('Profile updated successfully');
    },
    
    // KYC Functions
    openKYC() {
        if (this.user.kycVerified) {
            this.showToast('Your KYC is already verified');
            return;
        }
        this.openModal('kycModal');
    },
    
    linkDigiLocker() {
        // Simulate DigiLocker linking
        const step1 = document.getElementById('kycStep1');
        const step2 = document.getElementById('kycStep2');
        
        step1.classList.add('completed');
        step2.classList.remove('disabled');
        
        this.showToast('DigiLocker linked successfully');
    },
    
    verifyKYC() {
        const statusDiv = document.getElementById('kycVerificationStatus');
        const verifyBtn = document.getElementById('verifyKycBtn');
        
        statusDiv.classList.remove('hidden');
        verifyBtn.disabled = true;
        
        // Simulate verification process
        setTimeout(() => {
            this.user.kycVerified = true;
            
            // Update profile in localStorage
            const profileData = JSON.parse(localStorage.getItem('nexus_profile') || '{}');
            profileData.kyc_verified = true;
            localStorage.setItem('nexus_profile', JSON.stringify(profileData));
            
            this.updateUserUI();
            this.closeModal('kycModal');
            this.showToast('KYC verification completed!');
            
            statusDiv.classList.add('hidden');
            verifyBtn.disabled = false;
        }, 3000);
    },
    
    // Password Functions
    changePassword() {
        this.openModal('passwordModal');
    },
    
    savePassword() {
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;
        
        if (!current || !newPass || !confirm) {
            this.showToast('Please fill all fields');
            return;
        }
        
        if (newPass !== confirm) {
            this.showToast('New passwords do not match');
            return;
        }
        
        if (newPass.length < 6) {
            this.showToast('Password must be at least 6 characters');
            return;
        }
        
        // Clear inputs
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        this.closeModal('passwordModal');
        this.showToast('Password changed successfully');
    },
    
    // Language Functions
    changeLanguage() {
        this.openModal('languageModal');
    },
    
    selectLanguage(lang) {
        // Update UI
        document.querySelectorAll('.language-option').forEach(opt => {
            opt.classList.remove('active');
            opt.querySelector('i').classList.add('hidden');
        });
        
        event.currentTarget.classList.add('active');
        event.currentTarget.querySelector('i').classList.remove('hidden');
        
        // Save preference
        localStorage.setItem('nexus_language', lang);
        
        // Update preview
        const preview = document.getElementById('currentLanguage');
        if (preview) preview.textContent = lang;
        
        this.closeModal('languageModal');
        this.showToast(`Language changed to ${lang}`);
    },
    
    // Payment Functions
    managePayments() {
        this.renderPaymentMethods();
        this.openModal('paymentModal');
    },
    
    renderPaymentMethods() {
        const container = document.getElementById('paymentMethodsList');
        const methods = [
            { type: 'upi', name: 'Google Pay', detail: 'rahul@oksbi', icon: 'G' },
            { type: 'card', name: 'HDFC Credit Card', detail: '•••• 4242', icon: '💳' }
        ];
        
        container.innerHTML = methods.map(m => `
            <div class="payment-method-item">
                <div class="payment-method-icon">${m.icon}</div>
                <div class="payment-method-info">
                    <span class="payment-method-name">${m.name}</span>
                    <span class="payment-method-detail">${m.detail}</span>
                </div>
                <button class="payment-method-action" onclick="Settings.removePayment('${m.detail}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    },
    
    addPaymentMethod() {
        this.showToast('Add payment method - Coming soon');
    },
    
    removePayment(detail) {
        if (confirm('Remove this payment method?')) {
            this.showToast('Payment method removed');
            this.renderPaymentMethods();
        }
    },
    
    // Spending Limit Functions
    setSpendingLimit() {
        document.getElementById('limitAmount').value = this.user.spendingLimit;
        this.openModal('limitModal');
    },
    
    setLimitPreset(amount) {
        document.getElementById('limitAmount').value = amount;
    },
    
    saveSpendingLimit() {
        const amount = parseInt(document.getElementById('limitAmount').value);
        
        if (!amount || amount < 1000) {
            this.showToast('Minimum limit is ₹1,000');
            return;
        }
        
        this.user.spendingLimit = amount;
        localStorage.setItem('nexus_spending_limit', amount);
        
        this.updateUserUI();
        this.closeModal('limitModal');
        this.showToast(`Spending limit set to ₹${amount.toLocaleString()}`);
    },
    
    // Points Functions
    convertPoints() {
        document.getElementById('convertPointsBalance').textContent = this.user.points.toLocaleString();
        document.getElementById('convertAmount').value = '';
        document.getElementById('conversionResult').textContent = '₹0';
        this.openModal('convertModal');
    },
    
    confirmConvertPoints() {
        const points = parseInt(document.getElementById('convertAmount').value) || 0;
        
        if (points < 1000) {
            this.showToast('Minimum conversion is 1,000 points');
            return;
        }
        
        if (points > this.user.points) {
            this.showToast('Insufficient points balance');
            return;
        }
        
        if (confirm(`Convert ${points.toLocaleString()} points to ₹${points.toLocaleString()}?`)) {
            this.user.points -= points;
            this.updateUserUI();
            this.closeModal('convertModal');
            this.showToast(`${points.toLocaleString()} points converted successfully!`);
        }
    },
    
    // Privacy Functions
    downloadData() {
        this.showToast('Preparing your data download...');
        
        setTimeout(() => {
            // Create and download JSON file
            const data = {
                profile: JSON.parse(localStorage.getItem('nexus_profile') || '{}'),
                settings: this.settings,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nexus-data-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('Data downloaded successfully');
        }, 1500);
    },
    
    // Support Functions
    contactSupport() {
        window.location.href = 'helpnexus.html';
    },
    
    reportBug() {
        const bug = prompt('Describe the issue you are facing:');
        if (bug && bug.trim()) {
            // Store bug report
            const reports = JSON.parse(localStorage.getItem('nexus_bug_reports') || '[]');
            reports.push({
                description: bug,
                timestamp: new Date().toISOString(),
                user: this.user.email
            });
            localStorage.setItem('nexus_bug_reports', JSON.stringify(reports));
            this.showToast('Thank you! Our team will look into it.');
        }
    },
    
    rateApp() {
        // Open Play Store/App Store
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const storeUrl = isIOS 
            ? 'https://apps.apple.com/app/nexus'
            : 'https://play.google.com/store/apps/details?id=com.nexus.app';
        window.open(storeUrl, '_blank');
    },
    
    // Danger Zone Functions
    logout() {
        if (confirm('Are you sure you want to log out?')) {
            // Clear auth data
            localStorage.removeItem('nexus_auth');
            localStorage.removeItem('nexus_session');
            sessionStorage.removeItem('nexus_session');
            
            this.showToast('Logged out successfully');
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 1000);
        }
    },
    
    deleteAccount() {
        if (confirm('⚠️ WARNING: This will permanently delete your account and all data. This action cannot be undone. Continue?')) {
            const confirmation = prompt('Type "DELETE" to confirm account deletion:');
            if (confirmation === 'DELETE') {
                // Clear all data
                localStorage.clear();
                sessionStorage.clear();
                
                alert('Your account has been deleted. You will be redirected to the home page.');
                window.location.href = 'splash.html';
            } else {
                this.showToast('Account deletion cancelled');
            }
        }
    },
    
    // Modal Utilities
    openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        document.body.style.overflow = '';
    },
    
    // Toast Notification
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => Settings.init());