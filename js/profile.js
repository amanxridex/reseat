const Profile = {
    user: null,
    userTickets: [], // Add this to store fetched tickets
    API_BASE_URL: 'https://nexus-api-hkfu.onrender.com/api', // Add API URL
    
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
        if (!this.checkAuth()) return;
        
        this.loadUserData();
        this.renderNotifications();
        this.renderActivity();
        this.fetchAndRenderTickets(); // Changed from renderTickets()
        this.renderInsights();
        this.renderWishlist();
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
    
    // ✅ UPDATED: Async helper function to get FRESH auth token
    async getAuthToken() {
        return new Promise((resolve, reject) => {
            // Check if Firebase is available
            if (typeof firebase === 'undefined' || !firebase.auth) {
                // Fallback to localStorage
                const authData = localStorage.getItem('nexus_auth');
                if (!authData) {
                    reject(new Error('NOT_LOGGED_IN'));
                    return;
                }
                const parsed = JSON.parse(authData);
                resolve(parsed.idToken);
                return;
            }

            const user = firebase.auth().currentUser;
            
            if (!user) {
                // Check localStorage as fallback
                const authData = localStorage.getItem('nexus_auth');
                if (!authData) {
                    reject(new Error('NOT_LOGGED_IN'));
                    return;
                }
                
                const parsed = JSON.parse(authData);
                
                // Check if token is expired
                try {
                    const tokenData = JSON.parse(atob(parsed.idToken.split('.')[1]));
                    const expiry = tokenData.exp * 1000;
                    
                    if (Date.now() > expiry - 60000) {
                        reject(new Error('TOKEN_EXPIRED'));
                        return;
                    }
                    
                    resolve(parsed.idToken);
                } catch (e) {
                    reject(new Error('INVALID_TOKEN'));
                }
                return;
            }

            // User is logged in Firebase - get fresh token
            user.getIdToken(false) // false = use cached if still valid
                .then((token) => {
                    // Update localStorage
                    const authData = JSON.parse(localStorage.getItem('nexus_auth') || '{}');
                    authData.idToken = token;
                    authData.lastRefresh = Date.now();
                    localStorage.setItem('nexus_auth', JSON.stringify(authData));
                    resolve(token);
                })
                .catch((error) => {
                    console.error('Token fetch error:', error);
                    reject(new Error('TOKEN_FETCH_FAILED'));
                });
        });
    },
    
    // ✅ NEW: Handle auth errors with user-friendly messages
    handleAuthError(error) {
        const errorMessages = {
            'NOT_LOGGED_IN': 'Please login to continue',
            'TOKEN_EXPIRED': 'Your session has expired. Please login again.',
            'INVALID_TOKEN': 'Invalid session. Please login again.',
            'TOKEN_FETCH_FAILED': 'Session error. Please try logging in again.'
        };
        
        const errorType = error.message || 'NOT_LOGGED_IN';
        const message = errorMessages[errorType] || errorMessages['NOT_LOGGED_IN'];
        
        alert(message);
        localStorage.removeItem('nexus_auth');
        window.location.href = 'auth.html';
    },
    
    loadUserData() {
        const authData = JSON.parse(localStorage.getItem('nexus_auth') || '{}');
        const profileData = JSON.parse(localStorage.getItem('nexus_profile') || '{}');
        
        this.user = {
            name: profileData.full_name || authData.name || 'User',
            phone: profileData.phone || '+91 00000 00000',
            email: authData.email || profileData.email || 'user@email.com',
            avatar: authData.photoURL || profileData.avatar_url || 'https://via.placeholder.com/150',
            wallet: 2450,
            points: 12450,
            tier: 'gold',
            referralCode: this.generateReferralCode(authData.name || 'USER'),
            memberSince: this.getMemberSince()
        };
        
        document.getElementById('userName').textContent = this.user.name;
        document.getElementById('userContact').textContent = `${this.user.phone} • ${this.user.email}`;
        document.getElementById('userAvatar').src = this.user.avatar;
        document.getElementById('walletBalance').textContent = this.user.wallet.toLocaleString();
        document.getElementById('referralCode').textContent = this.user.referralCode;
        document.getElementById('totalSavings').textContent = '₹24,500';
        document.getElementById('ticketsBooked').textContent = '47';
        document.getElementById('resaleDeals').textContent = '12';
        document.getElementById('nexusPoints').textContent = (this.user.points / 1000).toFixed(1) + 'k';
        
        const memberSinceEl = document.getElementById('memberSinceText');
        if (memberSinceEl) {
            memberSinceEl.textContent = `Nexus Member since ${this.user.memberSince}`;
        }
    },
    
    generateReferralCode(name) {
        const cleanName = name.replace(/\s+/g, '').toUpperCase().substring(0, 6);
        const randomNum = Math.floor(100 + Math.random() * 900);
        return cleanName + randomNum;
    },
    
    getMemberSince() {
        const profile = JSON.parse(localStorage.getItem('nexus_profile') || '{}');
        if (profile.created_at) {
            const date = new Date(profile.created_at);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
    
    // ✅ UPDATED: Fetch tickets from backend with async token
    async fetchAndRenderTickets() {
        let token;
        try {
            token = await this.getAuthToken();
        } catch (error) {
            this.handleAuthError(error);
            return;
        }

        const container = document.getElementById('ticketsGrid');
        container.innerHTML = '<div class="loading-state">Loading tickets...</div>';

        try {
            const response = await fetch(`${this.API_BASE_URL}/booking/my-tickets`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
        
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch tickets');
            }

            this.userTickets = data.tickets || [];
            this.renderTicketsList(this.userTickets);

        } catch (error) {
            console.error('Error fetching tickets:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <p>Failed to load tickets</p>
                    <button onclick="Profile.fetchAndRenderTickets()" class="retry-btn">Retry</button>
                </div>
            `;
        }
    },

    // NEW: Render tickets list
    renderTicketsList(tickets) {
        const container = document.getElementById('ticketsGrid');
    
        if (!tickets || tickets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎫</div>
                    <p>No tickets found</p>
                    <a href="college-fests.html" class="browse-btn">Browse Events</a>
                </div>
            `;
            return;
        }

        container.innerHTML = tickets.map(ticket => {
            const booking = ticket.bookings || {};
            const eventName = booking.event_name || 'Event';
            const collegeName = booking.college_name || 'College';
            const bookingDate = new Date(booking.created_at || ticket.created_at);
            const formattedDate = bookingDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        
            const isPast = new Date(bookingDate) < new Date();
            const status = isPast ? 'past' : 'active';
        
            return `
                <div class="ticket-card" onclick="Profile.viewTicketDetail('${ticket.ticket_id}')">
                    <div class="ticket-header">
                        <div>
                            <div class="ticket-type">🎫 College Fest</div>
                            <div class="ticket-title">${eventName}</div>
                            <div class="ticket-subtitle">${collegeName}</div>
                        </div>
                        <span class="ticket-status ${status}">${status}</span>
                    </div>
                    <div class="ticket-body">
                        <div class="ticket-qr-preview">
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
                                ${formattedDate}
                            </div>
                            <div class="info-row">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                </svg>
                                ${ticket.attendee_name || 'Attendee'}
                            </div>
                            <div class="info-row">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                                    <line x1="2" y1="10" x2="22" y2="10"/>
                                </svg>
                                Ticket ID: ${ticket.ticket_id}
                            </div>
                        </div>
                    </div>
                    <div class="ticket-footer">
                        <span class="ticket-booking-id">Booking: ${booking.booking_id || '-'}</span>
                        <span class="view-ticket-btn">View →</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    // NEW: View ticket detail
    viewTicketDetail(ticketId) {
        const ticket = this.userTickets.find(t => t.ticket_id === ticketId);
        if (!ticket) return;

        const booking = ticket.bookings || {};
        const ticketData = {
            bookingId: booking.booking_id,
            ticketId: ticket.ticket_id,
            event: {
                name: booking.event_name,
                college: { name: booking.college_name },
                date: new Date(booking.created_at).toLocaleDateString('en-IN'),
                venue: 'Main Auditorium'
            },
            attendee: {
                name: ticket.attendee_name,
                email: booking.attendee_email,
                phone: booking.attendee_phone
            },
            tickets: [{ ticketId: ticket.ticket_id, qrCode: ticket.qr_code }],
            qrCode: ticket.qr_code
        };

        sessionStorage.setItem('selectedTicket', JSON.stringify(ticketData));
        window.location.href = 'booking-confirmed.html';
    },

    // UPDATED: Filter tickets
    filterTickets(filter) {
        document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
        event.target.classList.add('active');
    
        if (!this.userTickets) return;
    
        let filtered = this.userTickets;
        if (filter !== 'all') {
            filtered = this.userTickets.filter(t => {
                const bookingDate = new Date(t.bookings?.created_at || t.created_at);
                const isPast = bookingDate < new Date();
                if (filter === 'active') return !isPast;
                if (filter === 'past') return isPast;
                return true;
            });
        }
        this.renderTicketsList(filtered);
    },
    
    renderInsights() {
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
        
        const maxVal = Math.max(...this.monthlyData);
        const monthlyContainer = document.getElementById('monthlyBars');
        monthlyContainer.innerHTML = this.monthlyData.map((val, idx) => {
            const height = (val / maxVal * 100).toFixed(0);
            const isActive = idx === this.monthlyData.length - 1;
            return `<div class="month-bar ${isActive ? 'active' : ''}" style="height: ${height}%" title="₹${val},000"></div>`;
        }).join('');
        
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