// State Management
let state = {
    group: {
        id: 'grp_123',
        event: {
            name: 'Neon Nights Music Festival',
            date: 'Feb 15, 2025 • 8:00 PM',
            venue: 'Cyber Arena, Downtown',
            type: 'VIP Access',
            image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600',
            totalCost: 4100
        },
        organizer: {
            name: 'Alex Chen',
            avatar: 'https://i.pravatar.cc/150?u=2'
        },
        members: [
            { id: 'u1', name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=2', isAdmin: true, status: 'paid' },
            { id: 'u2', name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=3', status: 'paid' },
            { id: 'u3', name: 'Mike', avatar: 'https://i.pravatar.cc/150?u=4', status: 'pending' }
        ],
        splitType: 'equal',
        yourShare: 1367,
        timeLeft: 899 // seconds (14:59)
    },
    selectedPayment: 'nexus',
    user: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    renderEvent();
    renderSquad();
    startTimer();
    updatePaymentButton();
});

// Load from sessionStorage
function loadFromStorage() {
    const groupData = sessionStorage.getItem('nexus_group_draft');
    if (groupData) {
        const data = JSON.parse(groupData);
        state.group = { ...state.group, ...data };
    }
    
    const user = sessionStorage.getItem('nexus_user');
    if (user) {
        state.user = JSON.parse(user);
    }
}

// Render Event Details
function renderEvent() {
    document.getElementById('eventName').textContent = state.group.event.name;
    document.getElementById('eventDate').textContent = state.group.event.date;
    document.getElementById('eventVenue').textContent = state.group.event.venue;
    document.getElementById('eventType').textContent = state.group.event.type;
    document.getElementById('eventImage').src = state.group.event.image;
    document.getElementById('organizerName').textContent = state.group.organizer.name;
    
    document.getElementById('totalCost').textContent = `₹${state.group.event.totalCost.toLocaleString()}`;
    document.getElementById('yourShare').textContent = `₹${state.group.yourShare.toLocaleString()}`;
    
    const splitLabels = {
        'equal': 'Equal Split',
        'custom': 'Custom Split'
    };
    document.getElementById('splitType').textContent = splitLabels[state.group.splitType] || 'Equal Split';
}

// Render Squad Members
function renderSquad() {
    const container = document.getElementById('squadMembers');
    document.getElementById('squadCount').textContent = state.group.members.length + 1;
    
    let html = '';
    
    // Organizer first
    html += `
        <div class="squad-avatar admin" title="${state.group.organizer.name} (Organizer)">
            <img src="${state.group.organizer.avatar}" alt="${state.group.organizer.name}">
        </div>
    `;
    
    // Other members
    state.group.members.forEach(member => {
        const statusClass = member.status === 'paid' ? '' : '';
        const statusIcon = member.status === 'paid' ? '✓' : '⏳';
        html += `
            <div class="squad-avatar ${member.isYou ? 'you' : ''}" title="${member.name} ${member.status === 'paid' ? '(Paid)' : '(Pending)'}">
                <img src="${member.avatar}" alt="${member.name}">
            </div>
        `;
    });
    
    // Add "You" placeholder
    html += `
        <div class="squad-avatar you" title="You (Joining)">
            <img src="https://i.pravatar.cc/150?u=999" alt="You">
        </div>
    `;
    
    // Add more slot
    html += `
        <div class="add-more" title="More spots available">
            <i class="fas fa-plus"></i>
        </div>
    `;
    
    container.innerHTML = html;
}

// Select Payment Method
function selectPayment(method) {
    state.selectedPayment = method;
    
    // Update UI
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Show/hide UPI input
    const upiInput = document.getElementById('upiInput');
    if (method === 'upi') {
        upiInput.style.display = 'block';
        setTimeout(() => {
            document.getElementById('upiId').focus();
        }, 100);
    } else {
        upiInput.style.display = 'none';
    }
    
    updatePaymentButton();
}

// Update Payment Button
function updatePaymentButton() {
    const btn = document.getElementById('payBtn');
    btn.innerHTML = `<i class="fas fa-check-circle"></i> Pay ₹${state.group.yourShare.toLocaleString()} & Join`;
}

// Start Countdown Timer
function startTimer() {
    const timerEl = document.getElementById('timer');
    
    const interval = setInterval(() => {
        state.group.timeLeft--;
        
        if (state.group.timeLeft <= 0) {
            clearInterval(interval);
            timerEl.textContent = '00:00';
            showToast('Your reservation has expired!', true);
            document.getElementById('payBtn').disabled = true;
            return;
        }
        
        const mins = Math.floor(state.group.timeLeft / 60);
        const secs = state.group.timeLeft % 60;
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

// Accept and Pay
function acceptAndPay() {
    if (!state.user) {
        showToast('Please login first', true);
        setTimeout(() => {
            showLogin();
        }, 1000);
        return;
    }
    
    if (state.selectedPayment === 'upi') {
        const upiId = document.getElementById('upiId').value;
        if (!upiId || !upiId.includes('@')) {
            showToast('Please enter a valid UPI ID', true);
            return;
        }
    }
    
    // Show processing
    document.getElementById('processingModal').classList.add('active');
    
    // Simulate payment processing
    setTimeout(() => {
        document.getElementById('processingModal').classList.remove('active');
        
        // Show success
        document.getElementById('successAmount').textContent = `₹${state.group.yourShare.toLocaleString()}`;
        document.getElementById('successEvent').textContent = state.group.event.name;
        document.getElementById('successModal').classList.add('active');
        
        // Save to storage
        const paymentData = {
            groupId: state.group.id,
            amount: state.group.yourShare,
            method: state.selectedPayment,
            paidAt: new Date().toISOString(),
            status: 'confirmed'
        };
        sessionStorage.setItem('nexus_payment_confirmed', JSON.stringify(paymentData));
        
    }, 2500);
}

// Decline Invite
function declineInvite() {
    document.getElementById('declineModal').classList.add('active');
}

// Close Decline Modal
function closeDeclineModal() {
    document.getElementById('declineModal').classList.remove('active');
}

// Confirm Decline
function confirmDecline() {
    document.getElementById('declineModal').classList.remove('active');
    showToast('You declined the invitation');
    setTimeout(() => {
        window.location.href = 'chat.html';
    }, 1500);
}

// Open Chat
function openChat() {
    window.location.href = 'chat-room.html';
}

// View Ticket
function viewTicket() {
    window.location.href = 'my-ticket.html';
}

// Show Login
function showLogin() {
    showToast('Redirecting to login...');
    sessionStorage.setItem('nexus_redirect_after_login', 'group-join.html');
    setTimeout(() => {
        window.location.href = 'auth.html';
    }, 1000);
}

// Toast Notification
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    
    if (isError) {
        toast.classList.add('error');
        toast.querySelector('.toast-icon').style.background = 'var(--danger)';
    } else {
        toast.classList.remove('error');
        toast.querySelector('.toast-icon').style.background = 'var(--accent-purple)';
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modals on outside click
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === e.currentTarget && !e.target.querySelector('.processing-animation')) {
            e.target.classList.remove('active');
        }
    });
});