const Profile = {
    user: {
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        points: 12450,
        lifetimePoints: 24900,
        redeemedPoints: 12450,
        tier: 'gold',
        totalSpent: 245000
    },
    
    tickets: [
        {
            id: 'T1234',
            type: 'flight',
            title: 'Delhi → Mumbai',
            airline: 'IndiGo',
            date: '2024-03-15',
            time: '08:30 AM',
            price: 4500,
            status: 'active',
            pointsEarned: 225,
            qrData: 'FLIGHT-DEL-BOM-1234'
        },
        {
            id: 'T1235',
            type: 'ipl',
            title: 'MI vs CSK - IPL 2024',
            venue: 'Wankhede Stadium',
            date: '2024-04-12',
            time: '07:30 PM',
            price: 2500,
            status: 'active',
            pointsEarned: 125,
            qrData: 'IPL-MI-CSK-1235'
        },
        {
            id: 'T1236',
            type: 'movie',
            title: 'Dune: Part Two',
            cinema: 'PVR Phoenix',
            date: '2024-03-10',
            time: '07:00 PM',
            price: 400,
            status: 'used',
            pointsEarned: 20,
            qrData: 'MOVIE-DUNE-1236'
        },
        {
            id: 'T1237',
            type: 'train',
            title: 'Rajdhani Express',
            route: 'NDLS → MMCT',
            date: '2024-02-28',
            time: '04:25 PM',
            price: 2800,
            status: 'resale',
            resalePrice: 2200,
            pointsEarned: 140,
            qrData: 'TRAIN-RAJ-1237'
        }
    ],
    
    refunds: [
        {
            id: 'R001',
            item: 'Bus Ticket - Bangalore to Chennai',
            amount: 1200,
            date: '2024-03-01',
            status: 'processing',
            expectedDate: '2024-03-05'
        },
        {
            id: 'R002',
            item: 'Concert Ticket - Coldplay',
            amount: 5000,
            date: '2024-02-15',
            status: 'completed',
            completedDate: '2024-02-18'
        }
    ],
    
    activities: [
        { title: 'Earned points from Flight booking', points: '+225', time: '2 hours ago', type: 'earn' },
        { title: 'Redeemed points for UPI cashback', points: '-1000', time: '1 day ago', type: 'redeem' },
        { title: 'Resale bonus received', points: '+50', time: '2 days ago', type: 'bonus' },
        { title: 'Welcome bonus credited', points: '+500', time: '1 month ago', type: 'bonus' }
    ],
    
    init() {
        this.loadUserData();
        this.renderTickets();
        this.renderRefunds();
        this.renderActivity();
        this.calculateStats();
    },
    
    loadUserData() {
        const savedUser = localStorage.getItem('nexus_user');
        if(savedUser) {
            this.user = JSON.parse(savedUser);
        }
        
        document.getElementById('userName').textContent = this.user.name;
        document.getElementById('userPhone').textContent = this.user.phone;
        document.getElementById('pointsBalance').textContent = this.user.points.toLocaleString();
        document.getElementById('lifetimePoints').textContent = this.user.lifetimePoints.toLocaleString();
        document.getElementById('redeemedPoints').textContent = this.user.redeemedPoints.toLocaleString();
        
        const badge = document.getElementById('tierBadge');
        badge.textContent = this.user.tier.toUpperCase();
        badge.className = `tier-badge ${this.user.tier}`;
    },
    
    calculateStats() {
        const totalSpent = this.tickets.reduce((sum, t) => sum + t.price, 0);
        const savings = Math.floor(totalSpent * 0.05);
        const resaleEarnings = this.tickets
            .filter(t => t.status === 'resale')
            .reduce((sum, t) => sum + (t.resalePrice || 0), 0);
        const refundTotal = this.refunds
            .filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + r.amount, 0);
        
        document.getElementById('totalSavings').textContent = `₹${savings.toLocaleString()}`;
        document.getElementById('ticketsCount').textContent = this.tickets.length;
        document.getElementById('resaleEarnings').textContent = `₹${resaleEarnings.toLocaleString()}`;
        document.getElementById('refundAmount').textContent = `₹${refundTotal.toLocaleString()}`;
    },
    
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.dataset.tab === tabName) btn.classList.add('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName + 'Tab').classList.add('active');
    },
    
    filterTickets(filter) {
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
            if(chip.textContent.toLowerCase().includes(filter) || (filter === 'all' && chip.textContent === 'All')) {
                chip.classList.add('active');
            }
        });
        
        let filtered = this.tickets;
        if(filter !== 'all') {
            filtered = this.tickets.filter(t => t.status === filter);
        }
        
        this.renderTickets(filtered);
    },
    
    renderTickets(ticketList = this.tickets) {
        const container = document.getElementById('ticketsList');
        
        if(ticketList.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 3rem; color: var(--text-muted);">No tickets found</div>';
            return;
        }
        
        container.innerHTML = ticketList.map(ticket => `
            <div class="ticket-item" data-id="${ticket.id}">
                <div class="ticket-qr">
                    <svg viewBox="0 0 100 100" width="60" height="60">
                        <rect x="10" y="10" width="30" height="30" fill="#000"/>
                        <rect x="60" y="10" width="30" height="30" fill="#000"/>
                        <rect x="10" y="60" width="30" height="30" fill="#000"/>
                        <rect x="50" y="50" width="10" height="10" fill="#000"/>
                        <rect x="70" y="50" width="10" height="10" fill="#000"/>
                        <rect x="50" y="70" width="10" height="10" fill="#000"/>
                        <rect x="70" y="70" width="10" height="10" fill="#000"/>
                        <rect x="60" y="60" width="10" height="10" fill="#000"/>
                    </svg>
                </div>
                <div class="ticket-info">
                    <h4>${ticket.title}</h4>
                    <div class="ticket-meta">
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            ${ticket.date}
                        </span>
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            ${ticket.time}
                        </span>
                        ${ticket.airline ? `<span>${ticket.airline}</span>` : ''}
                        ${ticket.venue ? `<span>${ticket.venue}</span>` : ''}
                    </div>
                    <div style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--accent);">
                        +${ticket.pointsEarned} Nexus Points earned
                    </div>
                </div>
                <div class="ticket-status">
                    <span class="status-badge ${ticket.status}">${ticket.status}</span>
                    <div class="ticket-price">₹${ticket.price}</div>
                    ${ticket.status === 'active' ? `
                        <button class="btn-text" style="margin-top: 0.5rem;" onclick="Profile.resaleTicket('${ticket.id}')">
                            Resale
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },
    
    renderRefunds() {
        const container = document.getElementById('refundsList');
        
        container.innerHTML = this.refunds.map(refund => `
            <div class="refund-item">
                <div class="refund-info">
                    <h4>Refund #${refund.id}</h4>
                    <p>${refund.item}</p>
                    <div class="refund-date">
                        ${refund.status === 'processing' 
                            ? `Expected by ${refund.expectedDate}` 
                            : `Completed on ${refund.completedDate}`
                        }
                    </div>
                </div>
                <div class="refund-amount">₹${refund.amount}</div>
            </div>
        `).join('');
    },
    
    renderActivity() {
        const container = document.getElementById('activityTimeline');
        
        container.innerHTML = this.activities.map(activity => `
            <div class="activity-item">
                <div class="activity-content">
                    <div class="activity-title">
                        <span>${activity.title}</span>
                        <span class="activity-points">${activity.points}</span>
                    </div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    },
    
    showRedeemModal() {
        document.getElementById('redeemModal').classList.remove('hidden');
    },
    
    closeModal() {
        document.getElementById('redeemModal').classList.add('hidden');
    },
    
    redeem(type) {
        let message = '';
        switch(type) {
            case 'cashback':
                message = 'UPI Cashback initiated! Amount will be credited in 24 hours.';
                break;
            case 'travel':
                message = 'Travel voucher generated! Check your email.';
                break;
            case 'movie':
                message = 'Movie BOGO coupon added to your account!';
                break;
        }
        
        this.showToast(message);
        this.closeModal();
    },
    
    resaleTicket(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if(confirm(`List ${ticket.title} for resale at 80% price (₹${Math.floor(ticket.price * 0.8)})?`)) {
            ticket.status = 'resale';
            ticket.resalePrice = Math.floor(ticket.price * 0.8);
            this.renderTickets();
            this.calculateStats();
            this.showToast('Ticket listed for resale successfully!');
        }
    },
    
    addUPI() {
        const upi = prompt('Enter UPI ID (e.g., name@upi):');
        if(upi) {
            this.showToast('UPI ID added successfully!');
        }
    },
    
    addCard() {
        this.showToast('Card addition feature coming soon!');
    },
    
    showSettings() {
        window.location.href = 'settings.html';
    },
    
    showPointsHistory() {
        this.switchTab('activity');
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
            toast.remove();
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
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => Profile.init());