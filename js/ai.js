// ============================================
// NEXUS AI - EXTRAORDINARY EDITION
// ============================================

// Chat State
let isProcessing = false;
let conversationHistory = [];
let userPreferences = {
    preferredAirline: null,
    preferredSeat: null,
    budget: null,
    frequentRoutes: []
};
let isListening = false;
let recognition = null;

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const messagesContainer = document.getElementById('messages');
const welcomeState = document.getElementById('welcomeState');
const userInput = document.getElementById('userInput');
const micBtn = document.getElementById('micBtn');
const inputContainer = document.getElementById('inputContainer');
const voiceViz = document.getElementById('voiceViz');
const statusText = document.getElementById('statusText');

// ============================================
// INITIALIZATION
// ============================================

// Initialize Speech Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
            inputContainer.classList.add('listening');
            voiceViz.classList.add('active');
            userInput.placeholder = 'Listening...';
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            userInput.value = transcript;
        };

        recognition.onend = () => {
            isListening = false;
            micBtn.classList.remove('listening');
            inputContainer.classList.remove('listening');
            voiceViz.classList.remove('active');
            userInput.placeholder = 'Ask me anything...';
            
            if (userInput.value.trim()) {
                sendMessage();
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            micBtn.classList.remove('listening');
            inputContainer.classList.remove('listening');
            voiceViz.classList.remove('active');
            showToast('Voice recognition failed. Please try again.', 'error');
        };
    }
}

// Event Listeners
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

micBtn.addEventListener('click', () => {
    if (recognition) {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    } else {
        showToast('Voice recognition not supported in your browser', 'error');
    }
});

// Auto-focus input on load
userInput.focus();
initSpeechRecognition();
createParticles();

// ============================================
// PARTICLE EFFECTS
// ============================================

function createParticles() {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
            particle.style.setProperty('--ty', (Math.random() - 0.5) * 200 + 'px');
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.animationDuration = (10 + Math.random() * 10) + 's';
            document.body.appendChild(particle);
        }, i * 100);
    }
}

// ============================================
// MESSAGE HANDLING
// ============================================

function sendMessage() {
    const text = userInput.value.trim();
    if (!text || isProcessing) return;
    
    addUserMessage(text);
    conversationHistory.push({ role: 'user', content: text });
    userInput.value = '';
    processAIResponse(text);
}

function sendQuickMessage(text) {
    if (isProcessing) return;
    addUserMessage(text);
    conversationHistory.push({ role: 'user', content: text });
    processAIResponse(text);
}

function addUserMessage(text) {
    hideWelcome();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-user"></i></div>
        <div class="message-content">${escapeHtml(text)}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addAIMessage(content, quickActions = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    
    let quickActionsHtml = '';
    if (quickActions.length > 0) {
        quickActionsHtml = `
            <div class="quick-actions">
                ${quickActions.map(btn => `
                    <button class="quick-btn" onclick="sendQuickMessage('${btn.action}')">
                        ${btn.icon ? `<i class="${btn.icon}"></i>` : ''}
                        ${btn.label}
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            ${content}
            ${quickActionsHtml}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    conversationHistory.push({ role: 'ai', content: content });
    scrollToBottom();
}

// ============================================
// TYPING INDICATOR
// ============================================

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

// ============================================
// ADVANCED AI RESPONSE PROCESSING
// ============================================

function processAIResponse(userText) {
    isProcessing = true;
    showTyping();
    statusText.textContent = 'AI Thinking...';
    
    setTimeout(() => {
        hideTyping();
        statusText.textContent = 'AI Online';
        
        const lowerText = userText.toLowerCase();
        const intent = detectIntent(lowerText);
        
        handleIntent(intent, lowerText, userText);
        
        isProcessing = false;
    }, 1500 + Math.random() * 1000);
}

// Advanced Intent Detection
function detectIntent(text) {
    const intents = {
        flight: ['flight', 'plane', 'fly', 'flying', 'air travel', 'airplane'],
        movie: ['movie', 'film', 'cinema', 'show', 'theater'],
        train: ['train', 'rail', 'railway', 'metro'],
        bus: ['bus', 'coach', 'road'],
        concert: ['concert', 'music', 'band', 'artist', 'live music'],
        event: ['event', 'show', 'performance', 'festival'],
        sell: ['sell', 'resale', 'resell', 'list ticket'],
        compare: ['compare', 'comparison', 'vs', 'versus', 'difference'],
        price: ['price', 'cost', 'cheap', 'expensive', 'discount', 'deal'],
        date: ['tomorrow', 'today', 'weekend', 'next week', 'next month', 'friday', 'saturday', 'sunday'],
        greeting: ['hello', 'hi', 'hey', 'greetings'],
        help: ['help', 'assist', 'support', 'how'],
        track: ['track', 'booking', 'status', 'order']
    };
    
    for (const [intent, keywords] of Object.entries(intents)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return intent;
        }
    }
    
    return 'general';
}

// Intent Handlers
function handleIntent(intent, lowerText, originalText) {
    switch (intent) {
        case 'flight':
            handleFlightIntent(lowerText);
            break;
        case 'movie':
            handleMovieIntent(lowerText);
            break;
        case 'train':
            handleTrainIntent(lowerText);
            break;
        case 'bus':
            handleBusIntent(lowerText);
            break;
        case 'concert':
            handleConcertIntent(lowerText);
            break;
        case 'sell':
            handleSellIntent(lowerText);
            break;
        case 'compare':
            handleCompareIntent(lowerText);
            break;
        case 'price':
            handlePriceIntent(lowerText);
            break;
        case 'greeting':
            handleGreetingIntent();
            break;
        case 'track':
            handleTrackIntent();
            break;
        default:
            handleGeneralIntent(originalText);
    }
}

function handleFlightIntent(text) {
    const response = "✈️ I'm searching for the best flight options for you...";
    addAIMessage(response);
    
    setTimeout(() => {
        showSearchProgress();
    }, 500);
    
    setTimeout(() => {
        addFlightResults();
        addPriceAlert();
        addCalendarWidget();
    }, 3000);
}

function handleMovieIntent(text) {
    const response = "🎬 Let me find the best movies and shows for you!";
    addAIMessage(response, [
        { label: 'Now Showing', action: 'Show movies now showing', icon: 'fas fa-play' },
        { label: 'IMAX', action: 'Show IMAX movies', icon: 'fas fa-film' },
        { label: 'By Genre', action: 'Browse by genre', icon: 'fas fa-list' }
    ]);
    
    setTimeout(() => addMovieResults(), 1500);
}

function handleTrainIntent(text) {
    const response = "🚂 Finding train options with the best availability...";
    addAIMessage(response);
    
    setTimeout(() => {
        addTrainResults();
        addComparisonTable();
    }, 2000);
}

function handleBusIntent(text) {
    const response = "🚌 Searching for comfortable bus journeys...";
    addAIMessage(response);
    
    setTimeout(() => addBusResults(), 1500);
}

function handleConcertIntent(text) {
    const response = "🎵 Awesome! Let me find the hottest concerts and events for you!";
    addAIMessage(response, [
        { label: 'This Week', action: 'Concerts this week', icon: 'fas fa-calendar' },
        { label: 'Popular', action: 'Most popular concerts', icon: 'fas fa-fire' },
        { label: 'Near Me', action: 'Concerts near me', icon: 'fas fa-map-marker-alt' }
    ]);
    
    setTimeout(() => addConcertResults(), 1500);
}

function handleSellIntent(text) {
    const response = "💰 Great! I can help you sell your ticket. Let me guide you through the process.";
    addAIMessage(response, [
        { label: 'Concert Ticket', action: 'Sell concert ticket', icon: 'fas fa-music' },
        { label: 'Movie Ticket', action: 'Sell movie ticket', icon: 'fas fa-film' },
        { label: 'Travel Ticket', action: 'Sell travel ticket', icon: 'fas fa-plane' },
        { label: 'Sports Event', action: 'Sell sports ticket', icon: 'fas fa-football-ball' }
    ]);
}

function handleCompareIntent(text) {
    const response = "📊 Let me compare the best options for you...";
    addAIMessage(response);
    
    setTimeout(() => {
        addComparisonTable();
        addPriceChart();
    }, 1500);
}

function handlePriceIntent(text) {
    const response = "💸 I'll find you the best deals and savings!";
    addAIMessage(response);
    
    setTimeout(() => {
        addPriceChart();
        addPriceAlert();
    }, 1500);
}

function handleGreetingIntent() {
    const greetings = [
        "Hello! 👋 I'm your NEXUS AI assistant. I can help you book flights, trains, buses, movies, concerts, or sell your tickets. What would you like to do today?",
        "Hey there! 😊 Ready to find some amazing deals? I can help with travel, entertainment, or ticket resale. What's on your mind?",
        "Hi! 🚀 I'm here to make your booking experience extraordinary! Looking for flights, movies, or something else?"
    ];
    
    const response = greetings[Math.floor(Math.random() * greetings.length)];
    
    addAIMessage(response, [
        { label: 'Book Travel', action: 'Book a flight', icon: 'fas fa-plane' },
        { label: 'Entertainment', action: 'Find movie tickets', icon: 'fas fa-film' },
        { label: 'Sell Ticket', action: 'Sell my ticket', icon: 'fas fa-ticket-alt' },
        { label: 'Best Deals', action: 'Show me best deals', icon: 'fas fa-tags' }
    ]);
}

function handleTrackIntent() {
    const response = "📦 Let me check your booking status...";
    addAIMessage(response);
    
    setTimeout(() => {
        const trackingInfo = `
            <div class="alert-box" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3);">
                <div class="alert-icon" style="background: rgba(16, 185, 129, 0.2); color: var(--accent);">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="alert-content">
                    <h4 style="color: var(--accent);">Booking Confirmed</h4>
                    <p>Flight DEL → BOM • IndiGo 6E-234 • Tomorrow 8:30 AM<br>
                    Booking ID: <strong>NXS-2024-${Math.random().toString(36).substr(2, 9).toUpperCase()}</strong></p>
                </div>
            </div>
        `;
        addAIMessage(trackingInfo, [
            { label: 'View Details', action: 'Show booking details', icon: 'fas fa-info-circle' },
            { label: 'Download Ticket', action: 'Download ticket', icon: 'fas fa-download' },
            { label: 'Cancel', action: 'Cancel booking', icon: 'fas fa-times' }
        ]);
    }, 1500);
}

function handleGeneralIntent(text) {
    const responses = [
        "I can help you with that! Could you tell me more about what you're looking for?",
        "Interesting! Are you looking to book travel, entertainment, or manage your tickets?",
        "I'd be happy to assist! What type of tickets are you interested in?"
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    addAIMessage(response, [
        { label: 'Travel Options', action: 'Show travel options', icon: 'fas fa-plane' },
        { label: 'Entertainment', action: 'Show entertainment options', icon: 'fas fa-film' },
        { label: 'Resale Market', action: 'Browse resale tickets', icon: 'fas fa-ticket-alt' }
    ]);
}

// ============================================
// ENHANCED WIDGETS & COMPONENTS
// ============================================

function showSearchProgress() {
    const progressHtml = `
        <div class="progress-bar">
            <div class="progress-fill" id="searchProgress" style="width: 0%"></div>
        </div>
        <div class="progress-label">
            <span id="progressText">Searching databases...</span>
            <span id="progressPercent">0%</span>
        </div>
    `;
    
    addAIMessage(progressHtml);
    
    const progressBar = document.getElementById('searchProgress');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    
    const steps = [
        { percent: 30, text: 'Checking 150+ airlines...' },
        { percent: 60, text: 'Comparing 500+ flights...' },
        { percent: 90, text: 'Finding best prices...' },
        { percent: 100, text: 'Complete!' }
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            progressBar.style.width = steps[currentStep].percent + '%';
            progressText.textContent = steps[currentStep].text;
            progressPercent.textContent = steps[currentStep].percent + '%';
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 500);
}

function addFlightResults() {
    const flights = [
        {
            icon: 'fa-plane',
            title: 'IndiGo 6E-234',
            subtitle: 'Delhi → Mumbai • 2h 15m • Non-stop',
            price: '₹4,299',
            originalPrice: '₹5,999',
            discount: '28% OFF',
            badge: 'Fastest',
            type: 'flight',
            departure: '08:30',
            arrival: '10:45'
        },
        {
            icon: 'fa-plane',
            title: 'Air India AI-856',
            subtitle: 'Delhi → Mumbai • 2h 30m • Direct',
            price: '₹4,850',
            originalPrice: '₹6,500',
            discount: '25% OFF',
            badge: 'Best Value',
            type: 'flight',
            departure: '14:20',
            arrival: '16:50'
        },
        {
            icon: 'fa-plane',
            title: 'Vistara UK-995',
            subtitle: 'Delhi → Mumbai • 2h 20m • Premium',
            price: '₹5,999',
            originalPrice: '₹8,500',
            discount: '30% OFF',
            badge: 'Luxury',
            type: 'flight',
            departure: '18:15',
            arrival: '20:35'
        }
    ];
    
    addAIMessage("🎯 Found amazing deals! Here are the top 3 flights:");
    
    flights.forEach((flight, index) => {
        setTimeout(() => {
            const card = document.createElement('div');
            card.className = 'message ai';
            card.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content" style="padding: 0; background: transparent; border: none;">
                    <div class="result-card" onclick="selectResult('${flight.title}', '${flight.price}')">
                        <div class="result-icon"><i class="fas ${flight.icon}"></i></div>
                        <div class="result-info">
                            <h4>${flight.title}</h4>
                            <p>
                                <i class="fas fa-plane-departure" style="font-size: 0.75rem;"></i> ${flight.departure} 
                                → 
                                <i class="fas fa-plane-arrival" style="font-size: 0.75rem;"></i> ${flight.arrival}
                            </p>
                            <p>${flight.subtitle}</p>
                            <div class="result-badge">
                                <i class="fas fa-star"></i> ${flight.badge}
                            </div>
                        </div>
                        <div class="result-price">
                            <div class="price">${flight.price}</div>
                            <div class="original-price">${flight.originalPrice}</div>
                            <div class="discount">${flight.discount}</div>
                        </div>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(card);
            scrollToBottom();
        }, index * 300);
    });
}

function addMovieResults() {
    const movies = [
        {
            title: 'Avengers: Secret Wars',
            subtitle: 'PVR Inox • 7:30 PM • IMAX',
            price: '₹450',
            rating: '9.2/10',
            seats: '24 seats left'
        },
        {
            title: 'Dune: Part Three',
            subtitle: 'Cinepolis • 8:00 PM • Dolby Atmos',
            price: '₹380',
            rating: '8.9/10',
            seats: '18 seats left'
        },
        {
            title: 'Oppenheimer Re-release',
            subtitle: 'INOX • 9:30 PM • 70mm',
            price: '₹320',
            rating: '9.5/10',
            seats: 'Filling Fast'
        }
    ];
    
    addAIMessage("🎬 Here are tonight's hottest shows:");
    
    movies.forEach((movie, index) => {
        setTimeout(() => {
            const card = document.createElement('div');
            card.className = 'message ai';
            card.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content" style="padding: 0; background: transparent; border: none;">
                    <div class="result-card" onclick="selectResult('${movie.title}', '${movie.price}')">
                        <div class="result-icon"><i class="fas fa-film"></i></div>
                        <div class="result-info">
                            <h4>${movie.title}</h4>
                            <p>${movie.subtitle}</p>
                            <div class="result-badge">
                                <i class="fas fa-star"></i> ${movie.rating} • ${movie.seats}
                            </div>
                        </div>
                        <div class="result-price">
                            <div class="price">${movie.price}</div>
                        </div>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(card);
            scrollToBottom();
        }, index * 300);
    });
}

function addTrainResults() {
    const trains = [
        {
            title: 'Rajdhani Express 12951',
            subtitle: 'Delhi → Mumbai • 15h 30m • AC 2-Tier',
            price: '₹2,850',
            departure: '16:55',
            arrival: '08:25'
        },
        {
            title: 'August Kranti Rajdhani 12953',
            subtitle: 'Delhi → Mumbai • 16h 35m • AC 3-Tier',
            price: '₹1,920',
            departure: '17:00',
            arrival: '09:35'
        }
    ];
    
    addAIMessage("🚂 Premium train options available:");
    
    trains.forEach((train, index) => {
        setTimeout(() => {
            const card = document.createElement('div');
            card.className = 'message ai';
            card.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content" style="padding: 0; background: transparent; border: none;">
                    <div class="result-card" onclick="selectResult('${train.title}', '${train.price}')">
                        <div class="result-icon"><i class="fas fa-train"></i></div>
                        <div class="result-info">
                            <h4>${train.title}</h4>
                            <p>${train.departure} → ${train.arrival}</p>
                            <p>${train.subtitle}</p>
                        </div>
                        <div class="result-price">
                            <div class="price">${train.price}</div>
                        </div>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(card);
            scrollToBottom();
        }, index * 300);
    });
}

function addBusResults() {
    const buses = [
        {
            title: 'VRL Travels Volvo AC',
            subtitle: 'Bangalore → Chennai • 6h 30m',
            price: '₹950',
            rating: '4.5/5'
        },
        {
            title: 'RedBus Sleeper',
            subtitle: 'Bangalore → Chennai • 7h 15m',
            price: '₹750',
            rating: '4.2/5'
        }
    ];
    
    addAIMessage("🚌 Comfortable bus options:");
    
    buses.forEach((bus, index) => {
        setTimeout(() => {
            const card = document.createElement('div');
            card.className = 'message ai';
            card.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content" style="padding: 0; background: transparent; border: none;">
                    <div class="result-card" onclick="selectResult('${bus.title}', '${bus.price}')">
                        <div class="result-icon"><i class="fas fa-bus"></i></div>
                        <div class="result-info">
                            <h4>${bus.title}</h4>
                            <p>${bus.subtitle}</p>
                            <div class="result-badge">
                                <i class="fas fa-star"></i> ${bus.rating}
                            </div>
                        </div>
                        <div class="result-price">
                            <div class="price">${bus.price}</div>
                        </div>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(card);
            scrollToBottom();
        }, index * 300);
    });
}

function addConcertResults() {
    const concerts = [
        {
            title: 'Coldplay - Mumbai',
            subtitle: 'DY Patil Stadium • Jan 21, 2025',
            price: '₹4,500',
            originalPrice: '₹6,000',
            seats: 'Few left!'
        },
        {
            title: 'Dua Lipa India Tour',
            subtitle: 'Jawaharlal Nehru Stadium • Feb 15, 2025',
            price: '₹5,999',
            originalPrice: '₹8,000',
            seats: 'Hot!'
        }
    ];
    
    addAIMessage("🎵 Amazing concerts coming up:");
    
    concerts.forEach((concert, index) => {
        setTimeout(() => {
            const card = document.createElement('div');
            card.className = 'message ai';
            card.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content" style="padding: 0; background: transparent; border: none;">
                    <div class="result-card" onclick="selectResult('${concert.title}', '${concert.price}')">
                        <div class="result-icon"><i class="fas fa-music"></i></div>
                        <div class="result-info">
                            <h4>${concert.title}</h4>
                            <p>${concert.subtitle}</p>
                            <div class="result-badge">
                                <i class="fas fa-fire"></i> ${concert.seats}
                            </div>
                        </div>
                        <div class="result-price">
                            <div class="price">${concert.price}</div>
                            ${concert.originalPrice ? `<div class="original-price">${concert.originalPrice}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(card);
            scrollToBottom();
        }, index * 300);
    });
}

function addPriceAlert() {
    const alertHtml = `
        <div class="alert-box">
            <div class="alert-icon">
                <i class="fas fa-bolt"></i>
            </div>
            <div class="alert-content">
                <h4>Price Drop Alert!</h4>
                <p>Prices on this route dropped by ₹1,200 in the last 24 hours. Book now to save!</p>
            </div>
        </div>
    `;
    
    addAIMessage(alertHtml, [
        { label: 'Set Alert', action: 'Set price alert', icon: 'fas fa-bell' },
        { label: 'Price History', action: 'Show price history', icon: 'fas fa-chart-line' }
    ]);
}

function addPriceChart() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const prices = [4200, 3800, 4100, 3900, 4500, 5200, 4800];
    const maxPrice = Math.max(...prices);
    
    const barsHtml = days.map((day, i) => {
        const height = (prices[i] / maxPrice) * 100;
        return `
            <div class="chart-bar" style="height: ${height}%">
                <div class="chart-bar-value">₹${prices[i]}</div>
                <div class="chart-bar-label">${day}</div>
            </div>
        `;
    }).join('');
    
    const chartHtml = `
        <div class="price-chart">
            <div class="chart-header">
                <h4>📈 Price Trends (Next 7 Days)</h4>
                <div class="chart-legend">
                    <div class="legend-item">
                        <div class="legend-dot" style="background: var(--accent);"></div>
                        <span>Cheapest</span>
                    </div>
                </div>
            </div>
            <div class="chart-canvas">
                <div class="chart-bars">${barsHtml}</div>
            </div>
        </div>
    `;
    
    addAIMessage(chartHtml, [
        { label: 'Book Tue', action: 'Book for Tuesday', icon: 'fas fa-calendar-check' },
        { label: 'Flexible Dates', action: 'Show flexible dates', icon: 'fas fa-calendar-alt' }
    ]);
}

function addCalendarWidget() {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    
    let daysHtml = '';
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        daysHtml += '<div class="calendar-day disabled"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isPast = day < today.getDate();
        const isToday = day === today.getDate();
        const isCheap = [5, 12, 19, 26].includes(day); // Random cheap days
        
        let classes = 'calendar-day';
        if (isPast) classes += ' disabled';
        if (isToday) classes += ' selected';
        if (isCheap && !isPast) classes += ' cheap';
        
        daysHtml += `<div class="${classes}" onclick="selectDate(${day})">${day}</div>`;
    }
    
    const calendarHtml = `
        <div class="calendar-widget">
            <div class="calendar-header">
                <h4>${currentMonth} ${today.getFullYear()}</h4>
                <div class="calendar-nav">
                    <button><i class="fas fa-chevron-left"></i></button>
                    <button><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="calendar-grid">
                ${daysHtml}
            </div>
        </div>
    `;
    
    addAIMessage("📅 Select your preferred date (Green = Cheapest):", [
        { label: 'Flexible', action: 'Show flexible dates', icon: 'fas fa-calendar-alt' },
        { label: 'Weekend', action: 'Only weekends', icon: 'fas fa-calendar-week' }
    ]);
}

function addComparisonTable() {
    const tableHtml = `
        <div class="comparison-table">
            <div class="table-row header">
                <div class="table-cell">Option</div>
                <div class="table-cell">Duration</div>
                <div class="table-cell">Price</div>
                <div class="table-cell">Rating</div>
            </div>
            <div class="table-row">
                <div class="table-cell"><i class="fas fa-plane"></i> Flight</div>
                <div class="table-cell">2h 15m</div>
                <div class="table-cell" style="color: var(--accent); font-weight: 600;">₹4,299</div>
                <div class="table-cell">⭐ 4.8</div>
            </div>
            <div class="table-row">
                <div class="table-cell"><i class="fas fa-train"></i> Train</div>
                <div class="table-cell">15h 30m</div>
                <div class="table-cell" style="color: var(--accent); font-weight: 600;">₹2,850</div>
                <div class="table-cell">⭐ 4.5</div>
            </div>
            <div class="table-row">
                <div class="table-cell"><i class="fas fa-bus"></i> Bus</div>
                <div class="table-cell">18h 45m</div>
                <div class="table-cell" style="color: var(--accent); font-weight: 600;">₹1,450</div>
                <div class="table-cell">⭐ 4.2</div>
            </div>
        </div>
    `;
    
    addAIMessage("📊 Here's a quick comparison:", [
        { label: 'Filter by Price', action: 'Sort by price', icon: 'fas fa-sort-amount-down' },
        { label: 'Filter by Time', action: 'Sort by time', icon: 'fas fa-clock' }
    ]);
}

// ============================================
// RESULT SELECTION
// ============================================

function selectResult(title, price) {
    addUserMessage(`Book ${title} for ${price}`);
    
    setTimeout(() => {
        const confirmHtml = `
            <div style="padding: 0.5rem 0;">
                <p style="margin-bottom: 1rem;">🎉 Great choice! <strong>${title}</strong> selected.</p>
                <div style="background: var(--surface-light); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Base Fare</span>
                        <span>${price}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">
                        <span>Taxes & Fees</span>
                        <span>₹${Math.floor(parseInt(price.replace(/[^0-9]/g, '')) * 0.08)}</span>
                    </div>
                    <div style="border-top: 1px solid var(--border); padding-top: 0.5rem; margin-top: 0.5rem; display: flex; justify-content: space-between; font-weight: 600; font-size: 1.1rem;">
                        <span>Total</span>
                        <span style="color: var(--accent);">₹${Math.floor(parseInt(price.replace(/[^0-9]/g, '')) * 1.08)}</span>
                    </div>
                </div>
            </div>
        `;
        
        addAIMessage(confirmHtml, [
            { label: 'Proceed to Payment', action: 'Proceed to payment', icon: 'fas fa-credit-card' },
            { label: 'Add Insurance', action: 'Add travel insurance', icon: 'fas fa-shield-alt' },
            { label: 'View Details', action: 'View booking details', icon: 'fas fa-info-circle' },
            { label: 'Change Selection', action: 'Show other options', icon: 'fas fa-exchange-alt' }
        ]);
    }, 500);
}

function selectDate(day) {
    showToast(`Selected date: ${day}`, 'success');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function hideWelcome() {
    if (!welcomeState.classList.contains('hidden')) {
        welcomeState.classList.add('hidden');
    }
}

function clearChat() {
    messagesContainer.innerHTML = '';
    welcomeState.classList.remove('hidden');
    conversationHistory = [];
    userInput.focus();
    showToast('Chat cleared', 'success');
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlide 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to clear chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearChat();
    }
    
    // Ctrl/Cmd + L to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        userInput.focus();
    }
});

// ============================================
// CONSOLE EASTER EGG
// ============================================

console.log('%c🚀 NEXUS AI - Extraordinary Edition', 'font-size: 20px; font-weight: bold; color: #8b5cf6;');
console.log('%cPowered by advanced algorithms & incredible design', 'font-size: 12px; color: #10b981;');
console.log('%c\nKeyboard Shortcuts:', 'font-size: 14px; font-weight: bold; margin-top: 10px;');
console.log('%cCtrl/Cmd + K: Clear chat', 'font-size: 12px;');
console.log('%cCtrl/Cmd + L: Focus input', 'font-size: 12px;');