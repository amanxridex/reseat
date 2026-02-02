const App = {
    init() {
        this.setupNavigation();
        this.setupCommandPalette();
        this.setupResaleTicker();
        
        // Initialize modules
        TravelModule.init();
        EntertainmentModule.init();
        ResaleModule.init();
        
        // Global click handlers
        document.addEventListener('click', (e) => {
            if(e.target.closest('.modal') && !e.target.closest('.modal-content')) {
                this.closeModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleCommandPalette();
            }
            if(e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // Setup mobile nav
        this.setupMobileNav();
    },
    
    setupNavigation() {
        // Mode switcher
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.closest('.mode-btn').dataset.mode;
                this.switchMode(mode);
            });
        });
        
        // Nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href').substring(1);
                this.switchMode(target);
            });
        });
    },
    
    setupMobileNav() {
        // Setup mobile bottom nav clicks
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const href = item.getAttribute('href');
                if(href.startsWith('#')) {
                    e.preventDefault();
                    const mode = href.substring(1);
                    this.switchMode(mode);
                }
            });
        });
    },
    
    switchMode(mode) {
        // Update buttons
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.mode-btn[data-mode="${mode}"]`)?.classList.add('active');
        
        // Update sections
        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        document.getElementById(mode)?.classList.remove('hidden');
        
        // Update desktop nav
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector(`a[href="#${mode}"]`)?.classList.add('active');
        
        // Update mobile nav active state
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
            if(item.getAttribute('href') === '#' + mode) {
                item.classList.add('active');
            }
        });
        
        // Special handling
        if(mode === 'travel') {
            document.getElementById('travelTabs')?.classList.remove('hidden');
        } else {
            document.getElementById('travelTabs')?.classList.add('hidden');
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    toggleMobileMenu() {
        // Create mobile menu overlay
        const existingMenu = document.getElementById('mobileMenu');
        if(existingMenu) {
            existingMenu.remove();
            return;
        }
        
        const menu = document.createElement('div');
        menu.id = 'mobileMenu';
        menu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.95);
            backdrop-filter: blur(20px);
            z-index: 2000;
            display: flex;
            flex-direction: column;
            padding: 2rem;
            animation: slideIn 0.3s ease;
        `;
        
        menu.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="font-size: 1.5rem; font-weight: 700;">Menu</h2>
                <button onclick="App.toggleMobileMenu()" style="background: none; border: none; color: #fff; font-size: 1.5rem; width: 44px; height: 44px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <nav style="display: flex; flex-direction: column; gap: 1rem;">
                <a href="#travel" onclick="App.switchMode('travel'); App.toggleMobileMenu();" style="color: #fff; text-decoration: none; font-size: 1.25rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-plane" style="color: #10b981;"></i> Travel
                </a>
                <a href="#entertainment" onclick="App.switchMode('entertainment'); App.toggleMobileMenu();" style="color: #fff; text-decoration: none; font-size: 1.25rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-film" style="color: #10b981;"></i> Entertainment
                </a>
                <a href="#resale" onclick="App.switchMode('resale'); App.toggleMobileMenu();" style="color: #fff; text-decoration: none; font-size: 1.25rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-exchange-alt" style="color: #10b981;"></i> Resale Market
                </a>
                <a href="#dashboard" onclick="App.switchMode('dashboard'); App.toggleMobileMenu();" style="color: #fff; text-decoration: none; font-size: 1.25rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-ticket-alt" style="color: #10b981;"></i> My Tickets
                </a>
                <a href="profile.html" style="color: #fff; text-decoration: none; font-size: 1.25rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-user" style="color: #10b981;"></i> Profile
                </a>
            </nav>
        `;
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }
        `;
        menu.appendChild(style);
        
        document.body.appendChild(menu);
    },
    
    setupCommandPalette() {
        const input = document.getElementById('commandInput');
        const list = document.getElementById('commandList');
        
        if(!input) return;
        
        input.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const commands = [
                { name: 'Search Flights to Mumbai', action: () => this.switchMode('travel') },
                { name: 'IPL Tickets', action: () => { this.switchMode('entertainment'); EntertainmentModule.currentTab = 'ipl'; EntertainmentModule.loadContent(); } },
                { name: 'My Wallet', action: () => this.switchMode('dashboard') },
                { name: 'Resale Market', action: () => this.switchMode('resale') }
            ];
            
            const filtered = commands.filter(c => c.name.toLowerCase().includes(val));
            list.innerHTML = filtered.map(c => `
                <div class="command-item" onclick="(${c.action})(); App.toggleCommandPalette()">
                    ${c.name}
                </div>
            `).join('');
        });
    },
    
    toggleCommandPalette() {
        const modal = document.getElementById('commandPalette');
        modal?.classList.toggle('hidden');
        if(!modal?.classList.contains('hidden')) {
            document.getElementById('commandInput')?.focus();
        }
    },
    
    setupResaleTicker() {
        const ticker = document.getElementById('tickerItems');
        if(!ticker) return;
        
        const items = [
            'MI vs CSK ticket resold for ₹2,200 (12% off)',
            'Delhi-Mumbai Flight resale just listed!',
            'Dune IMAX ticket available - 30% off',
            'Rajdhani Express 3A ticket resold',
            'IPL Final Corporate box resale - 15% discount'
        ];
        
        ticker.innerHTML = items.map(item => `<span class="ticker-item">${item} <span class="neon-green">●</span></span>`).join('');
    },
    
    handleBook(id, type, isResale) {
        if(type === 'flights' || type === 'trains' || type === 'buses') {
            TravelModule.openSeatMap(type);
        } else if(type === 'ipl' || type === 'movie') {
            EntertainmentModule.openSeatSelection(id);
        }
    },
    
    selectSeat(element) {
        if(element.classList.contains('occupied')) return;
        
        element.classList.toggle('selected');
        const seatId = `${element.dataset.row}-${element.dataset.col}`;
        
        if(element.classList.contains('selected')) {
            TravelModule.selectedSeats.push(seatId);
        } else {
            TravelModule.selectedSeats = TravelModule.selectedSeats.filter(s => s !== seatId);
        }
        
        // Update UI with selected count
        Utils.showToast(`${TravelModule.selectedSeats.length} seats selected`, 'success');
    },
    
    selectStand(stand) {
        document.querySelectorAll('.stand-section').forEach(s => s.classList.remove('selected'));
        event.target.closest('.stand-section')?.classList.add('selected');
        Utils.showToast(`${stand} Stand selected`);
    },
    
    confirmResale(ticketId) {
        ResaleModule.confirmListing(ticketId);
    },
    
    closeModal() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        document.body.style.overflow = ''; // Restore scrolling
        TravelModule.selectedSeats = [];
    },
    
    proceedToPay(id) {
        Utils.showToast('Redirecting to payment...');
        setTimeout(() => this.closeModal(), 1000);
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => App.init());