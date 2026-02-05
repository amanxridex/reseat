const ChatRoom = {
    currentUser: {
        id: 'user_me',
        name: 'You',
        avatar: 'https://i.pravatar.cc/150?img=11'
    },
    
    room: {
        id: 'room_123',
        name: 'Delhi Trip Squad 🚌',
        avatar: '🚌',
        type: 'travel',
        members: 24,
        online: 12
    },
    
    messages: [
        {
            id: 1,
            sender: { id: 'user_1', name: 'Rahul', avatar: 'https://i.pravatar.cc/150?img=1' },
            text: 'Hey everyone! Bus is booked for 6AM sharp tomorrow',
            time: '10:30 AM',
            type: 'text',
            outgoing: false
        },
        {
            id: 2,
            sender: { id: 'user_2', name: 'Alex', avatar: 'https://i.pravatar.cc/150?img=2' },
            text: 'Perfect! I\'ll reach pickup point by 5:45',
            time: '10:32 AM',
            type: 'text',
            outgoing: false
        },
        {
            id: 3,
            sender: { id: 'user_me', name: 'You', avatar: 'https://i.pravatar.cc/150?img=11' },
            text: 'Got it. See you all there! 🚌',
            time: '10:35 AM',
            type: 'text',
            outgoing: true
        },
        {
            id: 4,
            sender: { id: 'system', name: 'System', avatar: '' },
            type: 'booking',
            booking: {
                title: 'Delhi → Mumbai Bus',
                total: 2000,
                collected: 1500,
                contributors: 3,
                totalNeeded: 4
            },
            time: '10:40 AM'
        },
        {
            id: 5,
            sender: { id: 'user_3', name: 'Priya', avatar: 'https://i.pravatar.cc/150?img=5' },
            text: 'Just paid my share! 💰',
            time: '10:42 AM',
            type: 'text',
            outgoing: false
        }
    ],
    
    members: [
        { id: 'user_1', name: 'Rahul', avatar: 'https://i.pravatar.cc/150?img=1', status: 'online', role: 'admin' },
        { id: 'user_2', name: 'Alex', avatar: 'https://i.pravatar.cc/150?img=2', status: 'online', role: 'member' },
        { id: 'user_3', name: 'Priya', avatar: 'https://i.pravatar.cc/150?img=5', status: 'offline', role: 'member' },
        { id: 'user_4', name: 'Sam', avatar: 'https://i.pravatar.cc/150?img=8', status: 'online', role: 'member' },
        { id: 'user_me', name: 'You', avatar: 'https://i.pravatar.cc/150?img=11', status: 'online', role: 'member', isMe: true }
    ],
    
    init() {
        this.loadRoomData();
        this.renderMessages();
        this.setupEventListeners();
        this.scrollToBottom();
        this.simulateIncoming();
    },
    
    loadRoomData() {
        // Parse URL params for room info
        const params = new URLSearchParams(window.location.search);
        const roomId = params.get('id') || 'room_123';
        const isNew = params.get('new') === 'true';
        
        if (isNew) {
            this.showToast('Room created! Invite friends to join.');
        }
        
        // Update header
        document.getElementById('roomName').textContent = this.room.name;
        document.getElementById('roomAvatar').textContent = this.room.avatar;
        document.getElementById('detailsAvatar').textContent = this.room.avatar;
        document.getElementById('detailsName').textContent = this.room.name;
        document.getElementById('detailsMeta').textContent = 
            `Created by Rahul • ${this.room.members} members`;
    },
    
    renderMessages() {
        const container = document.getElementById('messagesWrap');
        
        // Keep date divider, render messages after
        const messagesHtml = this.messages.map(msg => {
            if (msg.type === 'booking') {
                return this.renderBookingMessage(msg);
            }
            return this.renderTextMessage(msg);
        }).join('');
        
        container.innerHTML = `
            <div class="date-divider"><span>Today</span></div>
            <div class="system-message"><span>Rahul created this group for Delhi Trip</span></div>
            ${messagesHtml}
        `;
    },
    
    renderTextMessage(msg) {
        const isMe = msg.outgoing;
        return `
            <div class="message ${isMe ? 'outgoing' : 'incoming'}">
                ${!isMe ? `<img src="${msg.sender.avatar}" alt="" class="message-avatar">` : ''}
                <div class="message-content">
                    ${!isMe ? `<span class="message-sender">${msg.sender.name}</span>` : ''}
                    <div class="message-bubble">${this.escapeHtml(msg.text)}</div>
                    <span class="message-time">${msg.time}</span>
                </div>
            </div>
        `;
    },
    
    renderBookingMessage(msg) {
        const progress = (msg.booking.collected / msg.booking.total) * 100;
        return `
            <div class="message incoming">
                <div class="message-content" style="max-width: 100%;">
                    <div class="message-booking">
                        <div class="booking-header">
                            <div class="booking-icon">🚌</div>
                            <div>
                                <div class="booking-title">Group Booking</div>
                                <div class="booking-desc">${msg.booking.title}</div>
                            </div>
                        </div>
                        <div class="booking-progress">
                            <div class="progress-text">
                                <span>₹${msg.booking.collected} of ₹${msg.booking.total}</span>
                                <span>${msg.booking.contributors}/${msg.booking.totalNeeded} paid</span>
                            </div>
                            <div class="progress-track">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        <div class="booking-actions">
                            <button class="btn-small primary" onclick="ChatRoom.payShare()">Pay ₹500</button>
                            <button class="btn-small secondary" onclick="ChatRoom.viewSplit()">View Split</button>
                        </div>
                    </div>
                    <span class="message-time">${msg.time}</span>
                </div>
            </div>
        `;
    },
    
    setupEventListeners() {
        // Send message on Enter
        const input = document.getElementById('messageInput');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize input
        input.addEventListener('input', () => {
            const btn = document.getElementById('sendBtn');
            btn.disabled = input.value.trim() === '';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('menuDropdown');
            const menuBtn = e.target.closest('.icon-btn');
            if (!dropdown.contains(e.target) && !menuBtn) {
                dropdown.classList.add('hidden');
            }
        });
    },
    
    sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        
        if (!text) return;
        
        const newMessage = {
            id: Date.now(),
            sender: this.currentUser,
            text: text,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
            outgoing: true
        };
        
        this.messages.push(newMessage);
        this.renderMessages();
        this.scrollToBottom();
        
        input.value = '';
        document.getElementById('sendBtn').disabled = true;
        
        // Hide quick actions after first message
        document.getElementById('quickActions').style.display = 'none';
    },
    
    sendQuick(text) {
        document.getElementById('messageInput').value = text;
        this.sendMessage();
    },
    
    simulateIncoming() {
        // Simulate typing and incoming message
        setTimeout(() => {
            document.getElementById('typingIndicator').classList.remove('hidden');
            this.scrollToBottom();
            
            setTimeout(() => {
                document.getElementById('typingIndicator').classList.add('hidden');
                
                const responses = [
                    'Anyone bringing snacks? 🍕',
                    'What time do we reach?',
                    'I\'ll share location pin at pickup',
                    'Don\'t forget your ID proof!'
                ];
                
                const randomMsg = responses[Math.floor(Math.random() * responses.length)];
                
                const newMessage = {
                    id: Date.now(),
                    sender: { id: 'user_4', name: 'Sam', avatar: 'https://i.pravatar.cc/150?img=8' },
                    text: randomMsg,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    type: 'text',
                    outgoing: false
                };
                
                this.messages.push(newMessage);
                this.renderMessages();
                this.scrollToBottom();
                this.showToast('New message from Sam');
            }, 2000);
        }, 5000);
    },
    
    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    },
    
    toggleSearch() {
        const searchBar = document.getElementById('searchBar');
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden')) {
            document.getElementById('searchMessages').focus();
        }
    },
    
    showRoomDetails() {
        this.renderMembers();
        document.getElementById('roomDetailsModal').classList.remove('hidden');
    },
    
    renderMembers() {
        const container = document.getElementById('membersList');
        container.innerHTML = this.members.map(m => `
            <div class="member-item">
                <img src="${m.avatar}" alt="" class="member-avatar">
                <div class="member-info">
                    <div class="member-name">
                        ${m.name}
                        ${m.role === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}
                        ${m.isMe ? '<span class="you-badge">You</span>' : ''}
                    </div>
                    <div class="member-status">${m.status === 'online' ? 'Online' : 'Last seen recently'}</div>
                </div>
            </div>
        `).join('');
    },
    
    showMenu() {
        document.getElementById('menuDropdown').classList.toggle('hidden');
    },
    
    closeModal() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    },
    
    createGroupBooking() {
        document.getElementById('groupBookingModal').classList.remove('hidden');
    },
    
    confirmGroupBooking() {
        this.closeModal();
        this.showToast('Group booking created and shared!');
        
        // Add booking message
        const bookingMsg = {
            id: Date.now(),
            sender: { id: 'system', name: 'System', avatar: '' },
            type: 'booking',
            booking: {
                title: 'Delhi → Mumbai Bus',
                total: 2000,
                collected: 500,
                contributors: 1,
                totalNeeded: 4
            },
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        
        this.messages.push(bookingMsg);
        this.renderMessages();
        this.scrollToBottom();
    },
    
    payShare() {
        this.showToast('Redirecting to payment...');
        setTimeout(() => {
            window.location.href = 'group-manage.html?pay=true';
        }, 1000);
    },
    
    viewSplit() {
        this.showToast('Opening split details...');
    },
    
    viewEvent() {
        window.location.href = 'bus-details.html?id=bus_123';
    },
    
    muteNotifications() {
        this.closeModal();
        this.showToast('Notifications muted for 8 hours');
    },
    
    exitGroup() {
        if (confirm('Exit this group?')) {
            this.showToast('You left the group');
            setTimeout(() => {
                window.location.href = 'chat.html';
            }, 1000);
        }
    },
    
    clearChat() {
        document.getElementById('menuDropdown').classList.add('hidden');
        if (confirm('Clear all messages?')) {
            this.messages = [];
            this.renderMessages();
            this.showToast('Chat cleared');
        }
    },
    
    reportGroup() {
        document.getElementById('menuDropdown').classList.add('hidden');
        this.showToast('Report submitted. We\'ll review shortly.');
    },
    
    attachFile() {
        this.showToast('File upload coming soon');
    },
    
    openCamera() {
        this.showToast('Camera access required');
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => ChatRoom.init());