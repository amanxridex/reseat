// State Management
let state = {
    group: {
        id: 'grp_123',
        event: {
            name: 'Neon Nights Music Festival',
            date: 'Feb 15, 2025 • 8:00 PM',
            venue: 'Cyber Arena, Downtown',
            image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600',
            totalCost: 5467,
            collected: 4100
        },
        members: [
            { id: 'u1', name: 'You (Alex)', email: 'alex@nexus.com', avatar: 'https://i.pravatar.cc/150?u=2', isAdmin: true, amount: 1367, status: 'paid', paidAt: '2025-02-06T10:30:00' },
            { id: 'u2', name: 'Sarah Kim', email: 'sarah@nexus.com', avatar: 'https://i.pravatar.cc/150?u=3', amount: 1367, status: 'paid', paidAt: '2025-02-06T11:15:00' },
            { id: 'u3', name: 'Mike Ross', email: 'mike@nexus.com', avatar: 'https://i.pravatar.cc/150?u=4', amount: 1367, status: 'pending', paidAt: null },
            { id: 'u4', name: 'Emma Watson', email: 'emma@nexus.com', avatar: 'https://i.pravatar.cc/150?u=5', amount: 1366, status: 'pending', paidAt: null }
        ],
        transactions: [
            { id: 't1', user: 'Sarah Kim', amount: 1367, type: 'payment', time: '2 hours ago' },
            { id: 't2', user: 'You', amount: 1367, type: 'payment', time: '3 hours ago' },
            { id: 't3', user: 'Mike Ross', amount: 0, type: 'invite', time: '5 hours ago' }
        ],
        chatPreview: [
            { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=3', text: 'Can\'t wait for the show! 🎉', time: '10m ago' },
            { name: 'Mike', avatar: 'https://i.pravatar.cc/150?u=4', text: 'Is anyone driving from downtown?', time: '1h ago' }
        ]
    },
    selectedMember: null,
    confirmAction: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    renderStats();
    renderEvent();
    renderMembers();
    renderTransactions();
    renderChatPreview();
    updateProgress();
});

// Load from storage
function loadFromStorage() {
    const groupData = sessionStorage.getItem('nexus_group_draft');
    if (groupData) {
        const data = JSON.parse(groupData);
        state.group = { ...state.group, ...data };
    }
}

// Render Stats
function renderStats() {
    const total = state.group.members.length;
    const paid = state.group.members.filter(m => m.status === 'paid').length;
    const pending = total - paid;
    const collected = state.group.members.reduce((sum, m) => sum + (m.status === 'paid' ? m.amount : 0), 0);
    
    document.getElementById('statMembers').textContent = `${paid}/${total}`;
    document.getElementById('statPaid').textContent = paid;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statCollected').textContent = `₹${(collected/1000).toFixed(1)}k`;
}

// Update Progress
function updateProgress() {
    const total = state.group.event.totalCost;
    const collected = state.group.event.collected;
    const percent = Math.round((collected / total) * 100);
    const remaining = total - collected;
    
    document.getElementById('progressPercent').textContent = `${percent}%`;
    document.getElementById('progressBar').style.width = `${percent}%`;
    document.getElementById('progressRemaining').textContent = `₹${remaining.toLocaleString()} remaining`;
    
    // Update status line
    if (percent === 100) {
        document.getElementById('statusLine2').classList.add('completed');
        document.getElementById('statusConfirmed').classList.add('active');
    }
}

// Render Event
function renderEvent() {
    document.getElementById('eventName').textContent = state.group.event.name;
    document.getElementById('eventDate').textContent = state.group.event.date;
    document.getElementById('eventVenue').textContent = state.group.event.venue;
    document.getElementById('eventImage').src = state.group.event.image;
}

// Render Members
function renderMembers() {
    const container = document.getElementById('membersList');
    
    let html = '';
    state.group.members.forEach(member => {
        const statusClass = member.status === 'paid' ? 'status-paid' : 'status-pending';
        const statusText = member.status === 'paid' ? 'Paid' : 'Pending';
        const adminBadge = member.isAdmin ? '<span class="admin-badge">ORGANIZER</span>' : '';
        
        html += `
            <div class="member-item" onclick="openMemberModal('${member.id}')">
                <img src="${member.avatar}" alt="${member.name}" class="member-avatar ${member.isAdmin ? 'admin' : ''}">
                <div class="member-info">
                    <div class="member-name">${member.name} ${adminBadge}</div>
                    <div class="member-email">${member.email}</div>
                </div>
                <div class="member-amount">
                    <div class="amount-value">₹${member.amount.toLocaleString()}</div>
                    <div class="amount-label">share</div>
                </div>
                <div class="member-status ${statusClass}">
                    <i class="fas fa-${member.status === 'paid' ? 'check-circle' : 'clock'}"></i>
                    ${statusText}
                </div>
                <button class="member-menu" onclick="event.stopPropagation(); openMemberModal('${member.id}')">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Render Transactions
function renderTransactions() {
    const container = document.getElementById('transactionsList');
    
    let html = '';
    state.group.transactions.slice(0, 3).forEach(tx => {
        const iconClass = tx.type === 'payment' ? '' : 'pending';
        const icon = tx.type === 'payment' ? 'fa-arrow-down' : 'fa-user-plus';
        const amount = tx.type === 'payment' ? `+₹${tx.amount.toLocaleString()}` : 'Invited';
        const amountClass = tx.type === 'payment' ? '' : 'pending';
        
        html += `
            <div class="transaction-item">
                <div class="transaction-icon ${iconClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="transaction-info">
                    <div class="transaction-title">${tx.user}</div>
                    <div class="transaction-time">${tx.time}</div>
                </div>
                <div class="transaction-amount ${amountClass}">${amount}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Render Chat Preview
function renderChatPreview() {
    const container = document.getElementById('chatPreview');
    
    let html = '';
    state.group.chatPreview.forEach(msg => {
        html += `
            <div class="chat-message">
                <img src="${msg.avatar}" alt="${msg.name}" class="chat-avatar">
                <div class="chat-content">
                    <div class="chat-name">${msg.name}</div>
                    <div class="chat-text">${msg.text}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Open Member Modal
function openMemberModal(memberId) {
    state.selectedMember = state.group.members.find(m => m.id === memberId);
    if (!state.selectedMember) return;
    
    const profile = document.getElementById('modalMemberProfile');
    profile.innerHTML = `
        <img src="${state.selectedMember.avatar}" alt="${state.selectedMember.name}" class="profile-avatar">
        <div class="profile-info">
            <h4>${state.selectedMember.name}</h4>
            <p>${state.selectedMember.email}</p>
            <p style="margin-top: 0.5rem; color: ${state.selectedMember.status === 'paid' ? 'var(--success)' : 'var(--warning)'}">
                <i class="fas fa-${state.selectedMember.status === 'paid' ? 'check-circle' : 'clock'}"></i>
                ${state.selectedMember.status === 'paid' ? 'Paid ₹' + state.selectedMember.amount.toLocaleString() : 'Payment Pending'}
            </p>
        </div>
    `;
    
    document.getElementById('memberModal').classList.add('active');
}

// Close Member Modal
function closeMemberModal() {
    document.getElementById('memberModal').classList.remove('active');
    state.selectedMember = null;
}

// Send Reminder
function sendReminder() {
    closeMemberModal();
    showToast(`Reminder sent to ${state.selectedMember.name}!`);
    
    // Add to transactions
    state.group.transactions.unshift({
        id: 't' + Date.now(),
        user: state.selectedMember.name,
        amount: 0,
        type: 'reminder',
        time: 'Just now'
    });
    renderTransactions();
}

// Remind All
function remindAll() {
    const pending = state.group.members.filter(m => m.status === 'pending');
    pending.forEach(m => {
        // Send reminder logic here
    });
    showToast(`Reminders sent to ${pending.length} members!`);
}

// Waive Payment
function waivePayment() {
    closeMemberModal();
    showConfirm(
        'Waive Payment?',
        `Mark ${state.selectedMember.name} as paid without collecting money?`,
        'warning',
        () => {
            state.selectedMember.status = 'paid';
            state.group.event.collected += state.selectedMember.amount;
            renderMembers();
            renderStats();
            updateProgress();
            showToast(`${state.selectedMember.name} marked as paid!`);
        }
    );
}

// Change Amount
function changeAmount() {
    closeMemberModal();
    const newAmount = prompt(`Enter new amount for ${state.selectedMember.name}:`, state.selectedMember.amount);
    if (newAmount && !isNaN(newAmount)) {
        state.selectedMember.amount = parseInt(newAmount);
        renderMembers();
        showToast('Amount updated!');
    }
}

// Make Admin
function makeAdmin() {
    closeMemberModal();
    showConfirm(
        'Make Co-Organizer?',
        `${state.selectedMember.name} will be able to manage this group.`,
        'warning',
        () => {
            state.selectedMember.isAdmin = true;
            renderMembers();
            showToast(`${state.selectedMember.name} is now a co-organizer!`);
        }
    );
}

// Remove Member
function removeMember() {
    closeMemberModal();
    showConfirm(
        'Remove Member?',
        `${state.selectedMember.name} will be removed from the squad and refunded if paid.`,
        'danger',
        () => {
            state.group.members = state.group.members.filter(m => m.id !== state.selectedMember.id);
            renderMembers();
            renderStats();
            showToast(`${state.selectedMember.name} removed from squad!`);
        }
    );
}

// Add Member
function addMember() {
    document.getElementById('addMemberModal').classList.add('active');
}

// Close Add Member Modal
function closeAddMemberModal() {
    document.getElementById('addMemberModal').classList.remove('active');
}

// Add Methods
function addFromContacts() {
    closeAddMemberModal();
    showToast('Opening contacts... (integrate contacts API)');
}

function shareLink() {
    closeAddMemberModal();
    const link = `nexus.app/join/${state.group.id}`;
    navigator.clipboard.writeText(link);
    showToast('Invite link copied to clipboard!');
}

function addByUsername() {
    closeAddMemberModal();
    const username = prompt('Enter username:');
    if (username) {
        showToast(`Invitation sent to @${username}!`);
    }
}

// Show Confirmation
function showConfirm(title, text, type, action) {
    state.confirmAction = action;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmText').textContent = text;
    
    const icon = document.getElementById('confirmIcon');
    icon.className = 'confirm-icon ' + (type === 'danger' ? 'danger' : '');
    icon.innerHTML = `<i class="fas fa-${type === 'danger' ? 'exclamation-triangle' : 'question-circle'}"></i>`;
    
    document.getElementById('confirmBtn').className = type === 'danger' ? 'btn-danger' : 'btn-primary';
    
    document.getElementById('confirmModal').classList.add('active');
}

// Close Confirm Modal
function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    state.confirmAction = null;
}

// Execute Confirm
function executeConfirm() {
    if (state.confirmAction) {
        state.confirmAction();
    }
    closeConfirmModal();
}

// Quick Actions
function editSplit() {
    window.location.href = 'group-create.html';
}

function changeEvent() {
    showToast('Feature coming soon!');
}

function cancelGroup() {
    showConfirm(
        'Cancel Group?',
        'All members will be refunded. This action cannot be undone.',
        'danger',
        () => {
            showToast('Group cancelled. Processing refunds...');
            setTimeout(() => {
                window.location.href = 'chat.html';
            }, 2000);
        }
    );
}

function downloadTickets() {
    showToast('Downloading tickets...');
    setTimeout(() => {
        showToast('Tickets saved to Downloads!');
    }, 1500);
}

function dissolveGroup() {
    showConfirm(
        'Dissolve Group?',
        'This will permanently delete the group and refund all payments.',
        'danger',
        () => {
            showToast('Group dissolved. All refunds processed.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    );
}

// Navigation
function goBack() {
    window.location.href = 'group-create.html';
}

function openProfile() {
    window.location.href = 'profile.html';
}

function openChat() {
    window.location.href = 'chat-room.html';
}

function viewEventDetails() {
    showToast('Opening event details...');
}

function shareGroup() {
    const link = `nexus.app/join/${state.group.id}`;
    navigator.clipboard.writeText(link);
    showToast('Group link copied!');
}

function viewAllTransactions() {
    showToast('Opening full transaction history...');
}

function showSettings() {
    showToast('Opening settings...');
}

function refreshData() {
    const icon = document.getElementById('refreshIcon');
    icon.classList.add('fa-spin');
    setTimeout(() => {
        icon.classList.remove('fa-spin');
        showToast('Data refreshed!');
    }, 1000);
}

// Toast
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    
    toast.querySelector('.toast-icon').style.background = isError ? 'var(--danger)' : 'var(--accent-purple)';
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modals on outside click
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            modal.classList.remove('active');
        }
    });
});