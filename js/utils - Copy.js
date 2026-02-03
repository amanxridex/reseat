const Utils = {
    formatPrice: (price) => `₹${price.toLocaleString('en-IN')}`,
    
    formatDate: (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    },
    
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    generateId: () => Math.random().toString(36).substr(2, 9),
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    animateValue: (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    },
    
    showToast: (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'success' ? 'var(--neon-green)' : 'var(--accent-red)'};
            color: ${type === 'success' ? 'var(--bg-primary)' : 'white'};
            padding: 1rem 2rem;
            border-radius: var(--radius);
            z-index: 3000;
            animation: slideIn 0.3s ease;
            font-weight: 600;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};