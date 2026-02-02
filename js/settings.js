const Settings = {
    init() {
        this.loadSettings();
        this.setupToggles();
    },
    
    loadSettings() {
        // Load saved preferences from localStorage
        const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
        
        // Apply saved toggle states
        Object.keys(settings).forEach(key => {
            const toggle = document.getElementById(key);
            if(toggle) toggle.checked = settings[key];
        });
    },
    
    setupToggles() {
        const toggles = document.querySelectorAll('.toggle-switch input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.saveSetting(e.target.id, e.target.checked);
                this.showToast(`${e.target.id} ${e.target.checked ? 'enabled' : 'disabled'}`);
            });
        });
    },
    
    saveSetting(key, value) {
        const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
        settings[key] = value;
        localStorage.setItem('nexus_settings', JSON.stringify(settings));
    },
    
    saveAll() {
        this.showToast('All settings saved');
    },
    
    editProfile() {
        document.getElementById('editModal').classList.remove('hidden');
    },
    
    saveProfile() {
        const name = document.getElementById('editName').value;
        const email = document.getElementById('editEmail').value;
        
        // Update user data
        const user = JSON.parse(localStorage.getItem('nexus_user') || '{}');
        user.name = name;
        user.email = email;
        localStorage.setItem('nexus_user', JSON.stringify(user));
        
        this.closeModal();
        this.showToast('Profile updated successfully');
        
        // Update UI if on same page
        setTimeout(() => window.location.reload(), 500);
    },
    
    changePassword() {
        const current = prompt('Enter current password:');
        if(current) {
            const newPass = prompt('Enter new password:');
            if(newPass) {
                this.showToast('Password changed successfully');
            }
        }
    },
    
    changeLanguage() {
        const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi'];
        const choice = prompt(`Select language:\n${languages.join('\n')}`);
        if(choice && languages.includes(choice)) {
            this.showToast(`Language changed to ${choice}`);
        }
    },
    
    setSpendingLimit() {
        const current = "50000";
        const limit = prompt('Set monthly spending limit (₹):', current);
        if(limit && !isNaN(limit)) {
            this.showToast(`Spending limit set to ₹${parseInt(limit).toLocaleString()}`);
        }
    },
    
    convertPoints() {
        if(confirm('Convert 12,450 points to ₹12,450 UPI cashback?')) {
            this.showToast('Points conversion initiated. Money will be credited in 24 hours.');
        }
    },
    
    downloadData() {
        this.showToast('Preparing your data download...');
        setTimeout(() => {
            alert('Your data has been emailed to you.');
        }, 1500);
    },
    
    contactSupport() {
        window.open('https://help.nexus.com', '_blank');
    },
    
    reportBug() {
        const bug = prompt('Describe the issue:');
        if(bug) {
            this.showToast('Thank you! Our team will look into it.');
        }
    },
    
    rateApp() {
        alert('Redirecting to Play Store...');
    },
    
    logout() {
        if(confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('nexus_auth');
            localStorage.removeItem('nexus_session');
            localStorage.removeItem('nexus_user');
            window.location.href = 'splash.html';
        }
    },
    
    deleteAccount() {
        const confirm1 = confirm('WARNING: This will permanently delete your account and all data. Continue?');
        if(confirm1) {
            const confirm2 = prompt('Type "DELETE" to confirm:');
            if(confirm2 === 'DELETE') {
                localStorage.clear();
                sessionStorage.clear();
                alert('Account deleted. Redirecting...');
                window.location.href = 'splash.html';
            }
        }
    },
    
    closeModal() {
        document.getElementById('editModal').classList.add('hidden');
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
            border: 1px solid var(--accent);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 3000;
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

// Add animation styles
const style = document.createElement('style');
style.textContent = `
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

document.addEventListener('DOMContentLoaded', () => Settings.init());