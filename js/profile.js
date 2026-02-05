const Profile = {
    user: {
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        email: 'rahul@email.com',
        wallet: 2450,
        points: 12450,
        tier: 'gold',
        referralCode: 'RAHUL100',
        memberSince: 'Jan 2024'
    },
    
    notifications: [
        { id: 1, icon: 'purple', emoji: '🎉', title: 'Price Drop Alert', desc: 'Dune 2 tickets now 20% off!', time: '2 min ago', read: false },
        { id: 2, icon: 'pink', emoji: '💰', title: 'Cashback Received', desc: '₹125 added to your wallet', time: '1 hour ago', read: false },
        { id: 3, icon: 'orange', emoji: '📅', title: 'Event Reminder', desc: 'IPL match tomorrow at 7:30 PM', time: '3 hours ago', read: false }
    ],
    
    tickets: [
        { id: 'TKT001', type: 'flight', title: 'Delhi → Mumbai', subtitle: 'IndiGo 6E-234', date: 'Mar 15, 2024', time: '08:30 AM', price: 4500, status: 'active', points: 225, icon: '✈️' },
        { id: 'TKT002', type: 'event', title: 'MI vs CSK - IPL 2024', subtitle: 'Wankhede Stadium', date: 'Apr 12, 2024', time: '07:30 PM', price: 2500, status: 'active', points: 125, icon: '🏏' },
        { id: 'TKT003', type: 'movie', title: 'Dune: Part Two', subtitle: 'PVR Phoenix', date: 'Mar 10, 2024', time: '07:00 PM', price: 400, status: 'past', points: 20, icon: '🎬' },
        { id: 'TKT004', type: 'train', title: 'Rajdhani Express', subtitle: 'NDLS → MMCT', date: 'Feb 28, 2024', time: '04:25 PM', price: 2800, status: 'resale', resalePrice: 2200, points: 140, icon: '🚂' }
    ],
    
    activities: [
        { title: 'Booked Flight to Mumbai', subtitle: 'IndiGo • 2 hours ago', points: '+225', icon: '✈️', type: 'purple' },
        { title: 'Added ₹2,000 to Wallet', subtitle: 'UPI Payment • 5 hours ago', points: null, icon: '💳', type: 'green' },
        { title: 'Resale Bonus Received', subtitle: 'Train ticket sold • 1 day ago', points: '+50', icon: '🔄', type: 'orange' },
        { title: 'Redeemed Points', subtitle: 'Movie voucher • 2 days ago', points: '-500', icon: '🎬', type: 'purple', minus: true }
    ],
    
    categories: [
        { name: 'Travel', value: 45000, color: '#8b5cf6', icon: '✈️' },
        { name: 'Movies', value: 12000, color: '#ec4899', icon: '🎬' },
        { name: 'Events', value: 35000, color: '#ffaa00', icon: '🎵' },
        { name: 'Others', value: 32500, color: '#3b82f6', icon: '📦' }
    ],
    
    monthlyData: [45, 62, 38, 85, 55, 70],
    
    achievements: [
        { icon: '🚌', name: 'Bus Booker', unlocked: true },
        { icon: '✈️', name: 'Frequent Flyer', unlocked: true },
        { icon: '🎬', name: 'Movie Buff', unlocked: false },
        { icon: '🎵', name: 'Party Animal', unlocked: true }
    ],
    
    wishlist: [
        { id: 1, title: 'Coldplay - Music of the Spheres', date: 'Jan 18, 2025', price: 4500, originalPrice: 5500, image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', discount: 18 },
        { id: 2, title: 'KKR vs RCB - IPL 2024', date: 'Apr 21, 2024', price: 1800, originalPrice: 2500, image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=300&h=300&fit=crop', discount: 28 }
    ],
    
    init() {
        this.loadUserData();
        this.renderNotifications();
        this.renderActivity();
        this.renderTickets();
        this.renderInsights();
        this.renderWishlist();
        this.setupEventListeners();
    },
    
    loadUserData() {
        document.getElementById('userName').textContent = this.user.name;
        document.getElementById('userContact').textContent = `${this.user.phone} • ${this.user.email}`;
        document.getElementById('walletBalance').textContent = this.user.wallet.toLocaleString();
        document.getElementById('referralCode').textContent = this.user.referralCode;
        document.getElementById('totalSavings').textContent = '₹24,500';
        document.getElementById('ticketsBooked').textContent = '47';
        document.getElementById('resaleDeals').textContent = '12';
        document.getElementById('nexusPoints').textContent = (this.user.points / 1000).toFixed(1) + 'k';
    },
    
    toggleNotifications() {
        const panel = document.getElementById('notificationsPanel');
        panel.classList.toggle('hidden');
    },
    
    markAllRead() {
        this.notifications.forEach(n => n.read = true);
        document.querySelector('.notif-badge').style.display = 'none';
        this.showToast('All notifications marked as read');
    },
    
    renderNotifications() {
        const container = document.getElementById('notifList');
        container.innerHTML = this.notifications.map(n => `
            <div class="notif-item ${n.read ? 'read' : ''}">
                <div class="notif-icon ${n.icon}">${n.emoji}</div>
                <div class="notif-content">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-desc">${n.desc}</div>
                    <div class="notif-time">${n.time}</div>
                </div>
            </div>
        `).join('');
    },
    
    switchTab(tabName) {
        document.querySelectorAll('.tab-pill').forEach(pill => {
            pill.classList.remove('active');
            if(pill.dataset.tab === tabName) pill.classList.add('active');
        });
        
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(tabName + 'Tab').classList.add('active');
    },
    
    renderActivity() {
        const container = document.getElementById('recentActivity');
        container.innerHTML = this.activities.map(a => `
            <div class="activity-item">
                <div class="activity-icon ${a.type}">${a.icon}</div>
                <div class="activity-details">
                    <div class="activity-title">${a.title}</div>
                    <div class="activity-meta">${a.subtitle}</div>
                </div>
                ${a.points ? `<span class="activity-points ${a.minus ? 'minus' : ''}">${a.points}</span>` : ''}
            </div>
        `).join('');
    },
    
    filterTickets(filter) {
        document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
        event.target.classList.add('active');
        
        let filtered = this.tickets;
        if(filter !== 'all') filtered = this.tickets.filter(t => t.status === filter);
        this.renderTickets(filtered);
    },
    
    renderTickets(ticketList = this.tickets) {
        const container = document.getElementById('ticketsGrid');
        container.innerHTML = ticketList.map(t => `
            <div class="ticket-card">
                <div class="ticket-header">
                    <div>
                        <div class="ticket-type">${t.icon} ${t.type}</div>
                        <div class="ticket-title">${t.title}</div>
                    </div>
                    <span class="ticket-status ${t.status}">${t.status}</span>
                </div>
                <div class="ticket-body">
                    <div class="ticket-qr">
                        <svg viewBox="0 0 100 100">
                            <rect x="10" y="10" width="25" height="25" fill="#000"/>
                            <rect x="65" y="10" width="25" height="25" fill="#000"/>
                            <rect x="10" y="65" width="25" height="25" fill="#000"/>
                            <rect x="40" y="40" width="20" height="20" fill="#000"/>
                        </svg>
                    </div>
                    <div class="ticket-info">
                        <div class="info-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            ${t.date}
                        </div>
                        <div class="info-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            ${t.time}
                        </div>
                        <div class="info-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            ${t.subtitle}
                        </div>
                    </div>
                </div>
                <div class="ticket-footer">
                    <span class="ticket-points">+${t.points} pts</span>
                    <span class="ticket-price">₹${t.price.toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    },
    
    renderInsights() {
        // Category breakdown
        const total = this.categories.reduce((sum, c) => sum + c.value, 0);
        const barsContainer = document.getElementById('categoryBars');
        barsContainer.innerHTML = this.categories.map(c => {
            const percent = (c.value / total * 100).toFixed(0);
            return `
                <div class="cat-item">
                    <span class="cat-label">${c.icon} ${c.name}</span>
                    <div class="cat-bar-bg">
                        <div class="cat-bar-fill" style="width: ${percent}%; background: ${c.color}"></div>
                    </div>
                    <span class="cat-value">₹${(c.value / 1000).toFixed(1)}k</span>
                </div>
            `;
        }).join('');
        
        // Monthly bars
        const maxVal = Math.max(...this.monthlyData);
        const monthlyContainer = document.getElementById('monthlyBars');
        monthlyContainer.innerHTML = this.monthlyData.map((val, idx) => {
            const height = (val / maxVal * 100).toFixed(0);
            const isActive = idx === this.monthlyData.length - 1;
            return `<div class="month-bar ${isActive ? 'active' : ''}" style="height: ${height}%" title="₹${val},000"></div>`;
        }).join('');
        
        // Achievements
        const badgeContainer = document.getElementById('badgeGrid');
        badgeContainer.innerHTML = this.achievements.map(b => `
            <div class="badge-item ${b.unlocked ? 'unlocked' : ''}">
                <span class="badge-icon">${b.icon}</span>
                <span class="badge-name">${b.name}</span>
            </div>
        `).join('');
    },
    
    renderWishlist() {
        const container = document.getElementById('wishlistGrid');
        container.innerHTML = this.wishlist.map(w => `
            <div class="wish-item">
                <img src="${w.image}" alt="${w.title}" class="wish-image">
                <div class="wish-content">
                    <div class="wish-title">${w.title}</div>
                    <div class="wish-date">${w.date}</div>
                    <div class="wish-price">
                        <span class="current-price">₹${w.price.toLocaleString()}</span>
                        <span class="original-price">₹${w.originalPrice.toLocaleString()}</span>
                        <span class="price-drop">↓${w.discount}%</span>
                    </div>
                </div>
                <div class="wish-actions">
                    <button class="book-btn">Book Now</button>
                    <button class="remove-btn" onclick="Profile.removeFromWishlist(${w.id})">Remove</button>
                </div>
            </div>
        `).join('');
    },
    
    removeFromWishlist(id) {
        this.wishlist = this.wishlist.filter(w => w.id !== id);
        this.renderWishlist();
        this.showToast('Removed from wishlist');
    },
    
    showAddMoney() {
        document.getElementById('addMoneyModal').classList.remove('hidden');
    },
    
    closeModal() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    },
    
    selectAmount(amt) {
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        document.getElementById('customAmount').value = amt;
    },
    
    confirmAddMoney() {
        const amt = parseInt(document.getElementById('customAmount').value) || 0;
        if(amt > 0) {
            this.user.wallet += amt;
            document.getElementById('walletBalance').textContent = this.user.wallet.toLocaleString();
            this.showToast(`₹${amt.toLocaleString()} added to wallet!`);
            this.closeModal();
        }
    },
    
    copyReferral() {
        navigator.clipboard.writeText(this.user.referralCode);
        this.showToast('Referral code copied!');
    },
    
    quickAction(action) {
        const messages = {
            scan: 'Opening QR scanner...',
            transfer: 'Opening transfer...',
            history: 'Loading history...'
        };
        this.showToast(messages[action]);
    },
    
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    },
    
    setupEventListeners() {
        // Close notifications when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notificationsPanel');
            const btn = document.getElementById('notifBtn');
            if(!panel.contains(e.target) && !btn.contains(e.target)) {
                panel.classList.add('hidden');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Profile.init());