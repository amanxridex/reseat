// ============================================
// NEXUS AI - EXTRAORDINARY EDITION
// ============================================

// Chat State
let isProcessing = false;
let conversationHistory = [];
let conversationContext = null;
let userPreferences = {
    preferredAirline: null,
    preferredSeat: null,
    budget: null,
    frequentRoutes: []
};
let isListening = false;
let recognition = null;

// Initialize conversation context
if (typeof ConversationContext !== 'undefined') {
    conversationContext = new ConversationContext();
}

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

// Advanced Intent Detection with NER (Named Entity Recognition)
function detectIntent(text) {
    const intents = {
        flight: ['flight', 'plane', 'fly', 'flying', 'air travel', 'airplane', 'airline'],
        movie: ['movie', 'film', 'cinema', 'show', 'theater', 'pvr', 'inox'],
        train: ['train', 'rail', 'railway', 'rajdhani', 'shatabdi', 'duronto'],
        bus: ['bus', 'coach', 'road', 'volvo', 'redbus', 'sleeper'],
        metro: ['metro', 'subway', 'namma metro', 'rapid transit'],
        concert: ['concert', 'music', 'band', 'artist', 'live music', 'coldplay', 'dua lipa', 'gig'],
        sports: ['cricket', 'football', 'ipl', 'match', 'stadium', 'sports'],
        collegeEvent: ['college', 'fest', 'tech fest', 'cultural', 'mood indigo', 'iit', 'bits'],
        event: ['event', 'show', 'performance', 'festival'],
        sell: ['sell', 'resale', 'resell', 'list ticket', 'list my'],
        buy: ['buy', 'purchase', 'looking for', 'need', 'want'],
        compare: ['compare', 'comparison', 'vs', 'versus', 'difference', 'which is better'],
        price: ['price', 'cost', 'cheap', 'expensive', 'discount', 'deal', 'offer'],
        route: ['from', 'to', 'between', 'delhi', 'mumbai', 'bangalore', 'chennai'],
        date: ['tomorrow', 'today', 'weekend', 'next week', 'next month', 'friday', 'saturday', 'sunday'],
        greeting: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
        help: ['help', 'assist', 'support', 'how', 'what can you'],
        track: ['track', 'booking', 'status', 'order', 'pnr', 'ticket number'],
        about: ['about', 'what is nexus', 'who are you', 'features', 'services']
    };
    
    // Check for multiple intents
    let detectedIntents = [];
    for (const [intent, keywords] of Object.entries(intents)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            detectedIntents.push(intent);
        }
    }
    
    // Priority system
    if (detectedIntents.includes('flight')) return 'flight';
    if (detectedIntents.includes('train')) return 'train';
    if (detectedIntents.includes('bus')) return 'bus';
    if (detectedIntents.includes('metro')) return 'metro';
    if (detectedIntents.includes('movie')) return 'movie';
    if (detectedIntents.includes('concert')) return 'concert';
    if (detectedIntents.includes('sports')) return 'sports';
    if (detectedIntents.includes('collegeEvent')) return 'collegeEvent';
    if (detectedIntents.includes('sell')) return 'sell';
    if (detectedIntents.includes('compare')) return 'compare';
    if (detectedIntents.includes('greeting')) return 'greeting';
    if (detectedIntents.includes('help')) return 'help';
    if (detectedIntents.includes('about')) return 'about';
    if (detectedIntents.includes('track')) return 'track';
    
    return 'general';
}

// Extract entities from text (cities, dates, numbers)
function extractEntities(text) {
    const entities = {
        cities: [],
        dates: [],
        numbers: []
    };
    
    // Common Indian cities
    const cities = ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 
                   'pune', 'ahmedabad', 'jaipur', 'lucknow', 'goa', 'kochi', 'chandigarh'];
    
    cities.forEach(city => {
        if (text.includes(city)) {
            entities.cities.push(city.charAt(0).toUpperCase() + city.slice(1));
        }
    });
    
    // Extract numbers
    const numbers = text.match(/\d+/g);
    if (numbers) {
        entities.numbers = numbers;
    }
    
    // Date keywords
    const dateKeywords = ['tomorrow', 'today', 'tonight', 'weekend', 'next week', 'next month'];
    dateKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
            entities.dates.push(keyword);
        }
    });
    
    return entities;
}

// Intent Handlers
function handleIntent(intent, lowerText, originalText) {
    // Extract entities for smart responses
    const entities = extractEntities(lowerText);
    
    switch (intent) {
        case 'flight':
            handleFlightIntent(lowerText, entities);
            break;
        case 'movie':
            handleMovieIntent(lowerText, entities);
            break;
        case 'train':
            handleTrainIntent(lowerText, entities);
            break;
        case 'bus':
            handleBusIntent(lowerText, entities);
            break;
        case 'metro':
            handleMetroIntent(lowerText, entities);
            break;
        case 'concert':
            handleConcertIntent(lowerText, entities);
            break;
        case 'sports':
            handleSportsIntent(lowerText, entities);
            break;
        case 'collegeEvent':
            handleCollegeEventIntent(lowerText, entities);
            break;
        case 'sell':
            handleSellIntent(lowerText, entities);
            break;
        case 'compare':
            handleCompareIntent(lowerText, entities);
            break;
        case 'price':
            handlePriceIntent(lowerText, entities);
            break;
        case 'greeting':
            handleGreetingIntent();
            break;
        case 'help':
            handleHelpIntent();
            break;
        case 'about':
            handleAboutIntent();
            break;
        case 'track':
            handleTrackIntent();
            break;
        default:
            handleGeneralIntent(originalText, entities);
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

function handleMetroIntent(text, entities) {
    const response = "🚇 Let me help you with metro booking!";
    
    // Check if city is mentioned
    if (entities.cities.length > 0) {
        const city = entities.cities[0];
        addAIMessage(`${response} I see you're in ${city}.`, [
            { label: 'Quick Recharge', action: `Book metro card for ${city}`, icon: 'fas fa-bolt' },
            { label: 'Route Map', action: `Show ${city} metro map`, icon: 'fas fa-map' },
            { label: 'Station Info', action: 'Find nearest station', icon: 'fas fa-map-marker-alt' }
        ]);
    } else {
        addAIMessage(response, [
            { label: 'Delhi Metro', action: 'Book Delhi metro', icon: 'fas fa-subway' },
            { label: 'Mumbai Metro', action: 'Book Mumbai metro', icon: 'fas fa-subway' },
            { label: 'Bangalore Metro', action: 'Book Bangalore metro', icon: 'fas fa-subway' },
            { label: 'Chennai Metro', action: 'Book Chennai metro', icon: 'fas fa-subway' }
        ]);
    }
}

function handleSportsIntent(text, entities) {
    const response = "🏏 Let me find exciting sports events for you!";
    addAIMessage(response, [
        { label: 'Cricket', action: 'Show cricket matches', icon: 'fas fa-baseball-ball' },
        { label: 'Football', action: 'Show football matches', icon: 'fas fa-football-ball' },
        { label: 'IPL Tickets', action: 'Show IPL matches', icon: 'fas fa-ticket-alt' },
        { label: 'All Sports', action: 'Show all sports events', icon: 'fas fa-trophy' }
    ]);
    
    setTimeout(() => addSportsResults(), 1500);
}

function handleCollegeEventIntent(text, entities) {
    const response = "🎓 Awesome! Let me show you the hottest college fests!";
    addAIMessage(response, [
        { label: 'Cultural Fests', action: 'Show cultural fests', icon: 'fas fa-music' },
        { label: 'Tech Fests', action: 'Show tech fests', icon: 'fas fa-laptop-code' },
        { label: 'IIT Fests', action: 'Show IIT fests', icon: 'fas fa-graduation-cap' },
        { label: 'All Events', action: 'Show all college events', icon: 'fas fa-calendar' }
    ]);
    
    setTimeout(() => addCollegeEventResults(), 1500);
}

function handleHelpIntent() {
    const helpText = `
        <div style="line-height: 1.8;">
            <p style="margin-bottom: 1rem;">I can help you with:</p>
            <div style="display: grid; gap: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-plane" style="color: var(--ai-primary); width: 20px;"></i>
                    <span><strong>Travel:</strong> Flights, Trains, Buses, Metro</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-film" style="color: var(--ai-primary); width: 20px;"></i>
                    <span><strong>Entertainment:</strong> Movies, Concerts, Events</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-football-ball" style="color: var(--ai-primary); width: 20px;"></i>
                    <span><strong>Sports:</strong> Cricket, Football, IPL</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-graduation-cap" style="color: var(--ai-primary); width: 20px;"></i>
                    <span><strong>College:</strong> Fests, Events, Competitions</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-ticket-alt" style="color: var(--ai-primary); width: 20px;"></i>
                    <span><strong>Resale:</strong> Buy & Sell Tickets</span>
                </div>
            </div>
        </div>
    `;
    
    addAIMessage(helpText, [
        { label: 'Book Travel', action: 'I need travel tickets', icon: 'fas fa-plane' },
        { label: 'Entertainment', action: 'Show entertainment options', icon: 'fas fa-film' },
        { label: 'Sell Tickets', action: 'I want to sell tickets', icon: 'fas fa-tags' }
    ]);
}

function handleAboutIntent() {
    const aboutText = `
        <div style="line-height: 1.8;">
            <p style="margin-bottom: 1rem;"><strong>NEXUS</strong> is India's most intelligent ticketing platform! 🚀</p>
            <div style="background: var(--surface-light); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Active Users</span>
                    <strong style="color: var(--accent);">50,000+</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Total Bookings</span>
                    <strong style="color: var(--accent);">12,500+</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Avg. Savings</span>
                    <strong style="color: var(--accent);">₹2,450</strong>
                </div>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-muted);">
                We're revolutionizing ticketing with AI-powered search, real-time pricing, and exclusive deals!
            </p>
        </div>
    `;
    
    addAIMessage(aboutText, [
        { label: 'Start Booking', action: 'I want to book tickets', icon: 'fas fa-rocket' },
        { label: 'View Features', action: 'Tell me about features', icon: 'fas fa-star' }
    ]);
}
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

function addSportsResults() {
    const sports = [
        {
            title: 'IPL 2025 - MI vs CSK',
            subtitle: 'Wankhede Stadium • March 22, 2025',
            price: '₹800',
            originalPrice: '₹1,200',
            seats: 'Available'
        },
        {
            title: 'ISL Final - Kerala vs Goa',
            subtitle: 'Jawaharlal Nehru Stadium • April 10, 2025',
            price: '₹500',
            seats: 'Hot Selling'
        }
    ];
    
    addAIMessage("🏏 Upcoming matches:");
    
    sports.forEach((sport, index) => {
        setTimeout(() => {
            const card = document.createElement('div');
            card.className = 'message ai';
            card.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content" style="padding: 0; background: transparent; border: none;">
                    <div class="result-card" onclick="selectResult('${sport.title}', '${sport.price}')">
                        <div class="result-icon"><i class="fas fa-football-ball"></i></div>
                        <div class="result-info">
                            <h4>${sport.title}</h4>
                            <p>${sport.subtitle}</p>
                            <div class="result-badge">
                                <i class="fas fa-fire"></i> ${sport.seats}
                            </div>
                        </div>
                        <div class="result-price">
                            <div class="price">${sport.price}</div>
                            ${sport.originalPrice ? `<div class="original-price">${sport.originalPrice}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(card);
            scrollToBottom();
        }, index * 300);
    });
}

function addCollegeEventResults() {
    const events = [
        {
            title: 'IIT Bombay - Mood Indigo',
            subtitle: 'Dec 20-23, 2024 • Cultural Fest',
            price: '₹299',
            originalPrice: '₹499',
            badge: 'Asia\'s Largest'
        },
        {
            title: 'IIT Delhi - Rendezvous',
            subtitle: 'Oct 15-17, 2024 • Cultural Fest',
            price: '₹199',
            originalPrice: '₹399',
            badge: 'Pronites'
        },
        {
            title: 'BITS Pilani - Oasis',
            subtitle: 'Nov 2-4, 2024 • Cultural Fest',
            price: '₹249',
            badge: 'Popular'
        }
    ];
    
    addAIMessage("🎓 Top college fests:");
    
    events.forEach((event, index) => {
        setTimeout(() => {
            const card = document.createElement('div');
            card.className = 'message ai';
            card.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content" style="padding: 0; background: transparent; border: none;">
                    <div class="result-card" onclick="selectResult('${event.title}', '${event.price}')">
                        <div class="result-icon"><i class="fas fa-graduation-cap"></i></div>
                        <div class="result-info">
                            <h4>${event.title}</h4>
                            <p>${event.subtitle}</p>
                            <div class="result-badge">
                                <i class="fas fa-star"></i> ${event.badge}
                            </div>
                        </div>
                        <div class="result-price">
                            <div class="price">${event.price}</div>
                            ${event.originalPrice ? `<div class="original-price">${event.originalPrice}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(card);
            scrollToBottom();
        }, index * 300);
    });
}

function handleGeneralIntent(text, entities) {
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