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
    
    switchMode(mode) {
        // Update buttons
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.mode-btn[data-mode="${mode}"]`)?.classList.add('active');
        
        // Update sections
        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        document.getElementById(mode)?.classList.remove('hidden');
        
        // Update nav
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector(`a[href="#${mode}"]`)?.classList.add('active');
        
        // Special handling
        if(mode === 'travel') {
            document.getElementById('travelTabs').classList.remove('hidden');
        } else {
            document.getElementById('travelTabs').classList.add('hidden');
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    setupCommandPalette() {
        const input = document.getElementById('commandInput');
        const list = document.getElementById('commandList');
        
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
        modal.classList.toggle('hidden');
        if(!modal.classList.contains('hidden')) {
            document.getElementById('commandInput').focus();
        }
    },
    
    setupResaleTicker() {
        const ticker = document.getElementById('tickerItems');
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
        event.target.closest('.stand-section').classList.add('selected');
        Utils.showToast(`${stand} Stand selected`);
    },
    
    confirmResale(ticketId) {
        ResaleModule.confirmListing(ticketId);
    },
    
    closeModal() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        TravelModule.selectedSeats = [];
    },
    
    proceedToPay(id) {
        Utils.showToast('Redirecting to payment...');
        setTimeout(() => this.closeModal(), 1000);
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => App.init());