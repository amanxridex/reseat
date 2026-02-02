const TravelModule = {
    currentMode: 'flights',
    selectedSeats: [],
    
    init() {
        this.renderSearchForm();
        this.attachListeners();
        this.loadResults('flights');
    },
    
    attachListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.tab-btn').classList.add('active');
                this.currentMode = e.target.closest('.tab-btn').dataset.tab;
                this.renderSearchForm();
                this.loadResults(this.currentMode);
            });
        });
    },
    
    renderSearchForm() {
        const form = document.getElementById('searchForm');
        const isFlight = this.currentMode === 'flights';
        const isTrain = this.currentMode === 'trains';
        
        form.innerHTML = `
            <div class="form-group">
                <label>From</label>
                <input type="text" placeholder="${isFlight ? 'DEL' : isTrain ? 'NDLS' : 'Mumbai'}" id="fromInput">
            </div>
            <div class="form-group">
                <label>To</label>
                <input type="text" placeholder="${isFlight ? 'BOM' : isTrain ? 'MMCT' : 'Pune'}" id="toInput">
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="dateInput">
            </div>
            <div class="form-group">
                <label>Passengers</label>
                <select id="passengers">
                    <option>1 Passenger</option>
                    <option>2 Passengers</option>
                    <option>3+ Passengers</option>
                </select>
            </div>
            <button class="btn-primary" onclick="TravelModule.search()">
                <i class="fas fa-search"></i> Search
            </button>
        `;
    },
    
    loadResults(type) {
        const grid = document.getElementById('travelResults');
        const data = mockData[type];
        
        grid.innerHTML = data.map(item => Components.ticketCard(item, type, item.resale)).join('');
        
        // Animate cards
        grid.querySelectorAll('.ticket-card').forEach((card, i) => {
            card.style.animation = `slideIn 0.5s ease ${i * 0.1}s both`;
        });
    },
    
    search() {
        const from = document.getElementById('fromInput').value;
        const to = document.getElementById('toInput').value;
        
        // Filter logic here
        Utils.showToast(`Searching ${this.currentMode} from ${from} to ${to}...`);
        
        // Show loading shimmer
        const grid = document.getElementById('travelResults');
        grid.innerHTML = Array(3).fill('<div class="shimmer" style="height: 200px; border-radius: 12px;"></div>').join('');
        
        setTimeout(() => this.loadResults(this.currentMode), 800);
    },
    
    openSeatMap(type) {
        const modal = document.getElementById('seatModal');
        const container = document.getElementById('seatMapContainer');
        
        container.innerHTML = `
            <h3>Select Seats</h3>
            ${Components.seatMap[type]()}
            <div class="seat-legend">
                <span><div class="seat available"></div> Available</span>
                <span><div class="seat selected"></div> Selected</span>
                <span><div class="seat occupied"></div> Occupied</span>
            </div>
            <button class="btn-primary" onclick="TravelModule.confirmBooking()">
                Confirm Selection
            </button>
        `;
        
        modal.classList.remove('hidden');
    }
};