// State Management
let state = {
    event: {
        id: 'evt_001',
        name: 'Neon Nights Music Festival',
        date: 'Feb 15, 2025 • 8:00 PM',
        venue: 'Cyber Arena, Downtown',
        type: 'VIP Access',
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
        basePrice: 4500,
        discount: 450,
        fee: 50,
        total: 4100
    },
    members: [
        { id: 'u1', name: 'You (Admin)', avatar: 'https://i.pravatar.cc/150?u=1', selected: true, isAdmin: true },
        { id: 'u2', name: 'Alex Chen', avatar: 'https://i.pravatar.cc/150?u=2', selected: true },
        { id: 'u3', name: 'Sarah Kim', avatar: 'https://i.pravatar.cc/150?u=3', selected: true },
        { id: 'u4', name: 'Mike Ross', avatar: 'https://i.pravatar.cc/150?u=4', selected: false },
        { id: 'u5', name: 'Emma Watson', avatar: 'https://i.pravatar.cc/150?u=5', selected: false },
        { id: 'u6', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=6', selected: false },
    ],
    splitType: 'equal',
    paymentMethod: 'nexus',
    customAmounts: {}
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    renderMembers();
    renderSplitDetails();
    updateCalculations();
    updateEventPreview();
});

// Load from sessionStorage
function loadFromStorage() {
    const booking = sessionStorage.getItem('nexus_booking');
    const roomMembers = sessionStorage.getItem('nexus_room_members');
    
    if (booking) {
        const data = JSON.parse(booking);
        state.event = { ...state.event, ...data };
    }
    
    if (roomMembers) {
        const members = JSON.parse(roomMembers);
        state.members = members.map((m, idx) => ({
            ...m,
            selected: idx < 3,
            isAdmin: idx === 0
        }));
    }
}

// Render Members
function renderMembers() {
    const container = document.getElementById('membersScroll');
    const selectedCount = state.members.filter(m => m.selected).length;
    document.getElementById('memberCount').textContent = `${selectedCount} selected`;
    
    let html = '';
    state.members.forEach(member => {
        html += `
            <div class="member-avatar ${member.selected ? 'selected' : ''}" 
                 onclick="toggleMember('${member.id}')"
                 style="position: relative;">
                <div class="avatar-img">
                    <img src="${member.avatar}" alt="${member.name}">
                </div>
                <div class="member-name">${member.name}</div>
            </div>
        `;
    });
    
    html += `
        <div class="add-member" onclick="showAddMemberModal()">
            <div class="add-btn">
                <i class="fas fa-plus"></i>
            </div>
            <div class="member-name">Add New</div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Toggle Member Selection
function toggleMember(memberId) {
    const member = state.members.find(m => m.id === memberId);
    if (member && !member.isAdmin) {
        member.selected = !member.selected;
        renderMembers();
        renderSplitDetails();
        updateCalculations();
    }
}

// Update Event Preview
function updateEventPreview() {
    document.getElementById('eventName').textContent = state.event.name;
    document.getElementById('eventDate').textContent = state.event.date;
    document.getElementById('eventVenue').textContent = state.event.venue;
    document.getElementById('eventType').textContent = state.event.type;
    document.getElementById('eventImage').src = state.event.image;
    document.getElementById('totalPrice').textContent = `₹${state.event.basePrice.toLocaleString()}`;
    
    document.getElementById('summaryBase').textContent = `₹${state.event.basePrice.toLocaleString()}`;
    document.getElementById('summaryDiscount').textContent = `-₹${state.event.discount.toLocaleString()}`;
    document.getElementById('summaryTotal').textContent = `₹${state.event.total.toLocaleString()}`;
    
    const slug = state.event.name.toLowerCase().replace(/\s+/g, '-').substring(0, 20);
    document.getElementById('inviteLink').value = `nexus.app/join/${slug}-${Math.random().toString(36).substring(7)}`;
}

// Set Split Type
function setSplitType(type) {
    state.splitType = type;
    document.querySelectorAll('.split-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderSplitDetails();
    updateCalculations();
}

// Render Split Details
function renderSplitDetails() {
    const container = document.getElementById('splitDetails');
    const selectedMembers = state.members.filter(m => m.selected);
    
    if (selectedMembers.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">Select members to split payment</div>';
        return;
    }
    
    let html = '';
    selectedMembers.forEach(member => {
        const amount = state.customAmounts[member.id] || 0;
        const isEqual = state.splitType === 'equal';
        const displayAmount = isEqual ? 0 : amount;
        
        html += `
            <div class="person-split">
                <img src="${member.avatar}" alt="${member.name}" class="split-avatar">
                <div class="split-info">
                    <div class="split-name">${member.name} ${member.isAdmin ? '(You)' : ''}</div>
                    <div class="split-status">${member.isAdmin ? 'Organizer' : 'Pending acceptance'}</div>
                </div>
                <div class="split-input-group">
                    <span class="currency">₹</span>
                    <input type="number" 
                           class="split-input" 
                           value="${isEqual ? '' : displayAmount}"
                           ${isEqual ? 'readonly' : ''}
                           placeholder="${isEqual ? 'Auto' : '0'}"
                           onchange="updateCustomAmount('${member.id}', this.value)">
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update Custom Amount
function updateCustomAmount(memberId, value) {
    state.customAmounts[memberId] = parseFloat(value) || 0;
    updateCalculations();
}

// Update Calculations
function updateCalculations() {
    const selectedMembers = state.members.filter(m => m.selected);
    const count = selectedMembers.length;
    
    if (count === 0) {
        document.getElementById('displayTotal').textContent = '₹0';
        document.getElementById('displayPerPerson').textContent = '₹0';
        document.getElementById('displayYouPay').textContent = '₹0';
        document.getElementById('createBtn').disabled = true;
        return;
    }
    
    const total = state.event.total;
    let perPerson, youPay;
    
    if (state.splitType === 'equal') {
        perPerson = Math.round(total / count);
        youPay = perPerson;
        
        selectedMembers.forEach(m => {
            state.customAmounts[m.id] = perPerson;
        });
    } else {
        let customTotal = 0;
        selectedMembers.forEach(m => {
            customTotal += state.customAmounts[m.id] || 0;
        });
        perPerson = customTotal > 0 ? Math.round(customTotal / count) : 0;
        
        const admin = selectedMembers.find(m => m.isAdmin);
        youPay = state.customAmounts[admin?.id] || perPerson;
    }
    
    document.getElementById('displayTotal').textContent = `₹${total.toLocaleString()}`;
    document.getElementById('displayPerPerson').textContent = `₹${perPerson.toLocaleString()}`;
    document.getElementById('displayYouPay').textContent = `₹${youPay.toLocaleString()}`;
    document.getElementById('createBtn').disabled = count < 2;
    
    if (state.splitType === 'equal') {
        document.querySelectorAll('.split-input').forEach(input => {
            input.placeholder = perPerson.toLocaleString();
        });
    }
}

// Select Payment Method
function selectPayment(method) {
    state.paymentMethod = method;
    document.querySelectorAll('.payment-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
}

// Copy Link
function copyLink() {
    const input = document.getElementById('inviteLink');
    input.select();
    navigator.clipboard.writeText(input.value);
    showToast('Link copied to clipboard!');
}

// Share To
function shareTo(platform) {
    const link = document.getElementById('inviteLink').value;
    const text = `Join my squad for ${state.event.name}! Split the cost and let's go together: ${link}`;
    
    const urls = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        instagram: '#'
    };
    
    if (platform === 'instagram') {
        showToast('Link copied! Paste in Instagram DM');
        copyLink();
    } else {
        window.open(urls[platform], '_blank');
    }
}

// Save Draft
function saveDraft() {
    const draft = {
        event: state.event,
        members: state.members,
        splitType: state.splitType,
        paymentMethod: state.paymentMethod,
        customAmounts: state.customAmounts,
        savedAt: new Date().toISOString()
    };
    sessionStorage.setItem('nexus_group_draft', JSON.stringify(draft));
    showToast('Draft saved successfully!');
}

// Create Group Booking
function createGroupBooking() {
    const selectedMembers = state.members.filter(m => m.selected);
    if (selectedMembers.length < 2) {
        showToast('Select at least 2 members!', true);
        return;
    }
    
    const groupData = {
        id: 'grp_' + Date.now(),
        event: state.event,
        members: selectedMembers.map(m => ({
            ...m,
            amount: state.customAmounts[m.id] || 0,
            status: m.isAdmin ? 'paid' : 'pending'
        })),
        organizer: selectedMembers.find(m => m.isAdmin),
        splitType: state.splitType,
        paymentMethod: state.paymentMethod,
        totalAmount: state.event.total,
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    sessionStorage.setItem('nexus_group_draft', JSON.stringify(groupData));
    
    document.getElementById('modalEventName').textContent = state.event.name;
    document.getElementById('successModal').classList.add('active');
}

// Go To Manage
function goToManage() {
    window.location.href = 'group-manage.html';
}

// Show Add Member Modal (placeholder)
function showAddMemberModal() {
    showToast('Add member feature - integrate contacts API');
}

// Navigation
function goBack() {
    window.location.href = 'chat-room.html';
}

function openProfile() {
    window.location.href = 'profile.html';
}

// Toast Notification
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    
    if (isError) {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modal on outside click
document.getElementById('successModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        e.target.classList.remove('active');
    }
});