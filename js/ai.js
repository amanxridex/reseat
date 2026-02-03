// Chat State
let isProcessing = false;
const chatContainer = document.getElementById('chatContainer');
const messagesContainer = document.getElementById('messages');
const welcomeState = document.getElementById('welcomeState');
const userInput = document.getElementById('userInput');
const micBtn = document.getElementById('micBtn');

// Event Listeners
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-focus input on load
userInput.focus();

// Send message from input
function sendMessage() {
    const text = userInput.value.trim();
    if (!text || isProcessing) return;
    
    addUserMessage(text);
    userInput.value = '';
    processAIResponse(text);
}

// Send quick message from chips
function sendQuickMessage(text) {
    if (isProcessing) return;
    addUserMessage(text);
    processAIResponse(text);
}

// Add user message to chat
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

// Add AI message to chat
function addAIMessage(content, quickActions = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';
    
    let quickActionsHtml = '';
    if (quickActions.length > 0) {
        quickActionsHtml = `
            <div class="quick-actions">
                ${quickActions.map(btn => `<button class="quick-btn" onclick="sendQuickMessage('${btn.action}')">${btn.label}</button>`).join('')}
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
    scrollToBottom();
}

// Show typing indicator
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

// Remove typing indicator
function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

// Process AI Response (Simulated)
function processAIResponse(userText) {
    isProcessing = true;
    showTyping();
    
    // Simulate processing delay
    setTimeout(() => {
        hideTyping();
        
        const lowerText = userText.toLowerCase();
        let response = '';
        let quickActions = [];
        let showResults = false;
        
        // Intent detection
        if (lowerText.includes('flight') || lowerText.includes('plane') || lowerText.includes('fly')) {
            response = "I found some flights for you! Here are the best options:";
            showResults = true;
            quickActions = [
                { label: 'Cheapest', action: 'Show cheapest flights' },
                { label: 'Fastest', action: 'Show fastest flights' },
                { label: 'Change Date', action: 'Show flights for next week' }
            ];
        } else if (lowerText.includes('movie') || lowerText.includes('film') || lowerText.includes('cinema')) {
            response = "Here are the movies playing near you:";
            showResults = true;
            quickActions = [
                { label: 'Action', action: 'Show action movies' },
                { label: 'IMAX', action: 'Show IMAX movies' },
                { label: 'Tonight', action: 'Movies playing tonight' }
            ];
        } else if (lowerText.includes('train') || lowerText.includes('rail')) {
            response = "I found these train options:";
            showResults = true;
            quickActions = [
                { label: 'AC Sleeper', action: 'Show AC Sleeper trains' },
                { label: 'Chair Car', action: 'Show Chair Car trains' }
            ];
        } else if (lowerText.includes('bus')) {
            response = "Here are available bus options:";
            showResults = true;
            quickActions = [
                { label: 'AC', action: 'Show AC buses' },
                { label: 'Sleeper', action: 'Show Sleeper buses' }
            ];
        } else if (lowerText.includes('sell') || lowerText.includes('resale')) {
            response = "I can help you sell your ticket! What type of ticket would you like to sell?";
            quickActions = [
                { label: 'Concert', action: 'Sell concert ticket' },
                { label: 'Movie', action: 'Sell movie ticket' },
                { label: 'Travel', action: 'Sell travel ticket' }
            ];
        } else if (lowerText.includes('hello') || lowerText.includes('hi')) {
            response = "Hello! 👋 I'm your NEXUS AI assistant. I can help you book flights, trains, buses, movies, or sell your tickets. What would you like to do today?";
            quickActions = [
                { label: 'Book Travel', action: 'Book a flight' },
                { label: 'Book Movie', action: 'Find movie tickets' },
                { label: 'Sell Ticket', action: 'Sell my ticket' }
            ];
        } else {
            response = "I can help you with that! Would you like me to search for travel options, entertainment, or help you sell a ticket?";
            quickActions = [
                { label: 'Travel', action: 'Book travel tickets' },
                { label: 'Entertainment', action: 'Book entertainment tickets' },
                { label: 'Resale', action: 'Sell my ticket' }
            ];
        }
        
        addAIMessage(response, quickActions);
        
        if (showResults) {
            setTimeout(() => addResultCards(), 500);
        }
        
        isProcessing = false;
    }, 1500 + Math.random() * 1000);
}

// Add result cards (simulated results)
function addResultCards() {
    const results = [
        {
            icon: 'fa-plane',
            title: 'IndiGo 6E-234',
            subtitle: 'Delhi → Mumbai • 2h 15m',
            price: '₹4,299',
            type: 'flight'
        },
        {
            icon: 'fa-plane',
            title: 'Air India AI-856',
            subtitle: 'Delhi → Mumbai • 2h 30m',
            price: '₹5,150',
            type: 'flight'
        },
        {
            icon: 'fa-train',
            title: 'Rajdhani Express',
            subtitle: 'Delhi → Mumbai • 15h 30m',
            price: '₹2,850',
            type: 'train'
        }
    ];
    
    // Randomly select 2-3 results
    const numResults = Math.floor(Math.random() * 2) + 2;
    const selectedResults = results.slice(0, numResults);
    
    selectedResults.forEach((result, index) => {
        setTimeout(() => {
            const card = document.createElement('div');
            card.className = 'message ai';
            card.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content" style="padding: 0; background: transparent; border: none;">
                    <div class="result-card" onclick="selectResult('${result.title}')">
                        <div class="result-icon"><i class="fas ${result.icon}"></i></div>
                        <div class="result-info">
                            <h4>${result.title}</h4>
                            <p>${result.subtitle}</p>
                        </div>
                        <div class="result-price">${result.price}</div>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(card);
            scrollToBottom();
        }, index * 200);
    });
}

// Select a result
function selectResult(title) {
    addUserMessage(`Book ${title}`);
    setTimeout(() => {
        addAIMessage(`Great choice! I've selected ${title}. Would you like to proceed to payment?`, [
            { label: 'Proceed', action: 'Proceed to payment' },
            { label: 'Add Return', action: 'Add return ticket' },
            { label: 'Cancel', action: 'Cancel booking' }
        ]);
    }, 500);
}

// Hide welcome state
function hideWelcome() {
    if (!welcomeState.classList.contains('hidden')) {
        welcomeState.classList.add('hidden');
    }
}

// Clear chat
function clearChat() {
    messagesContainer.innerHTML = '';
    welcomeState.classList.remove('hidden');
    userInput.focus();
}

// Scroll to bottom
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Voice input (placeholder)
micBtn.addEventListener('click', () => {
    micBtn.style.color = 'var(--ai-primary)';
    setTimeout(() => {
        micBtn.style.color = '';
        userInput.value = 'Book me a flight to Mumbai tomorrow';
        sendMessage();
    }, 1000);
});