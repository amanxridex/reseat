const Components = {
    ticketCard: (item, type, isResale = false) => {
        const discount = isResale ? Math.round(((item.price - item.resalePrice) / item.price) * 100) : 0;
        
        return `
            <div class="ticket-card ${isResale ? 'resale' : ''}" data-id="${item.id}" data-type="${type}">
                <div class="card-header">
                    <div class="price-tag">
                        ${isResale ? `<span class="original-price">₹${item.price}</span>` : ''}
                        <span class="current-price">₹${isResale ? item.resalePrice : item.price}</span>
                    </div>
                    ${isResale ? `<span class="resale-badge">${discount}% OFF</span>` : ''}
                </div>
                
                <div class="card-body">
                    <h3 class="route-title">${item.from || item.match || item.title} <span>→</span> ${item.to || item.venue || ''}</h3>
                    <div class="flight-info">
                        <span class="info-item">
                            <i class="fas fa-plane"></i> ${item.airline || item.operator || 'IndiGo'}
                        </span>
                        <span class="info-item">
                            <i class="fas fa-clock"></i> ${item.time}
                        </span>
                    </div>
                    <span class="seats-left">${item.seatsAvailable} seats available</span>
                </div>
                
                <div class="card-footer">
                    <button class="book-btn ${isResale ? 'resale' : ''}" onclick="App.handleBook('${item.id}', '${type}', ${isResale})">
                        ${isResale ? 'Buy Resale' : 'Book Now'}
                    </button>
                    ${isResale ? '<span class="seller-info">Sold by Trusted Seller</span>' : ''}
                </div>
            </div>
        `;
    },

    seatMap: {
        flight: (rows = 8, cols = 6) => {
            let html = '<div class="seat-grid flight-grid">';
            for(let i = 1; i <= rows; i++) {
                html += `<div class="row-label">${i}</div>`;
                for(let j = 1; j <= cols; j++) {
                    const occupied = Math.random() > 0.7;
                    html += `
                        <div class="seat ${occupied ? 'occupied' : 'available'}" 
                             data-row="${i}" data-col="${j}"
                             ${!occupied ? 'onclick="App.selectSeat(this)"' : ''}>
                            ${String.fromCharCode(64 + j)}
                        </div>
                    `;
                }
            }
            return html + '</div>';
        },
        
        train: () => {
            const compartments = ['LB', 'MB', 'UB', 'SL', 'SU'];
            let html = '<div class="seat-grid train-grid">';
            compartments.forEach(comp => {
                html += `<div class="compartment-label">${comp}</div>`;
                for(let i = 1; i <= 8; i++) {
                    html += `<div class="seat available" onclick="App.selectSeat(this)">${i}</div>`;
                }
            });
            return html + '</div>';
        },
        
        bus: () => {
            let html = '<div class="seat-grid bus-grid">';
            for(let i = 1; i <= 12; i++) {
                html += `<div class="seat available" onclick="App.selectSeat(this)">L${i}</div>`;
                html += `<div class="seat available" onclick="App.selectSeat(this)">U${i}</div>`;
            }
            return html + '</div>';
        },
        
        ipl: () => {
            const stands = ['North', 'South', 'East', 'West'];
            let html = '<div class="stadium-map">';
            stands.forEach(stand => {
                html += `
                    <div class="stand-section" onclick="App.selectStand('${stand}')">
                        <span class="stand-name">${stand} Stand</span>
                        <div class="stand-availability" style="--fill: ${Utils.randomInt(30, 90)}%"></div>
                    </div>
                `;
            });
            return html + '</div>';
        }
    },
    
    resaleForm: (ticket) => `
        <div class="resale-form">
            <div class="ticket-preview">
                <h4>${ticket.details.match || ticket.details.from + ' to ' + ticket.details.to}</h4>
                <p>Original Price: ₹${ticket.price}</p>
            </div>
            <div class="price-slider-container">
                <label>Set Resale Price</label>
                <input type="range" min="${ticket.price * 0.5}" max="${ticket.price}" 
                       value="${ticket.price * 0.8}" id="resalePriceSlider" 
                       oninput="document.getElementById('priceDisplay').innerText = '₹' + this.value">
                <div class="price-display" id="priceDisplay">₹${ticket.price * 0.8}</div>
                <div class="suggested-price">Suggested: ₹${Math.round(ticket.price * 0.75)} (25% off)</div>
            </div>
            <div class="form-actions">
                <button class="btn-outline" onclick="App.closeModal()">Cancel</button>
                <button class="btn-primary" onclick="App.confirmResale('${ticket.id}')">List Ticket</button>
            </div>
        </div>
    `
};