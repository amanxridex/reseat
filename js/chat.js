const Chat = {
    data: {
        trending: [
            {
                id: 'trend1',
                title: 'MI vs CSK - IPL 2024',
                subtitle: 'Wankhede Stadium • 847 chatting',
                image: 'ipl',
                members: ['https://i.pravatar.cc/150?img=1', 'https://i.pravatar.cc/150?img=2', 'https://i.pravatar.cc/150?img=3'],
                live: true,
                hot: true
            },
            {
                id: 'trend2',
                title: 'Coldplay Mumbai',
                subtitle: 'D.Y. Patil Stadium • 1.2k waiting',
                image: 'concert',
                members: ['https://i.pravatar.cc/150?img=4', 'https://i.pravatar.cc/150?img=5'],
                live: false,
                hot: true
            },
            {
                id: 'trend3',
                title: 'Sunburn Goa 2024',
                subtitle: 'Vagator Beach • 2.3k interested',
                image: 'concert',
                members: ['https://i.pravatar.cc/150?img=6', 'https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=8'],
                live: false,
                hot: false
            }
        ],
        
        yourRooms: [
            {
                id: 'room1',
                name: 'Delhi Trip Squad 🚌',
                preview: 'Rahul: Bus booked for 6AM tomorrow',
                time: '2m',
                unread: 3,
                icon: '🚌',
                color: 'purple',
                type: 'travel'
            },
            {
                id: 'room2',
                name: 'IPL Mumbai Gang',
                preview: 'You: Tickets confirmed guys!',
                time: '1h',
                unread: 0,
                icon: '🏏',
                color: 'orange',
                type: 'event'
            },
            {
                id: 'room3',
                name: 'College Fest Coordination',
                preview: 'Priya: Stage setup starts at 4',
                time: '3h',
                unread: 0,
                icon: '🎓',
                color: 'blue',
                type: 'event'
            }
        ],
        
        channels: [
            { id: 'ch1', name: '#general', members: '45.2k', icon: '💬', color: '#8b5cf6' },
            { id: 'ch2', name: '#resale-alerts', members: '12.8k', icon: '💰', color: '#10b981' },
            { id: 'ch3', name: '#travel-buddies', members: '8.4k', icon: '🚌', color: '#3b82f6' },
            { id: 'ch4', name: '#help-support', members: '3.2k', icon: '🆘', color: '#ef4444' }
        ],
        
        nearby: [
            {
                id: 'near1',
                title: 'KKR vs RCB',
                venue: 'Wankhede Stadium',
                distance: '2.5km away',
                chatting: 234,
                icon: '🏏',
                type: 'ipl'
            },
            {
                id: 'near2',
                title: 'Arijit Singh Live',
                venue: 'Jio World Garden',
                distance: '5.1km away',
                chatting: 567,
                icon: '🎤',
                type: 'concert'
            }
        ],
        
        squads: [
            {
                id: 'squad1',
                title: '3 spots left for Goa trip',
                subtitle: '4 people planning • Bus + Stay',
                avatars: ['https://i.pravatar.cc/150?img=11', 'https://i.pravatar.cc/150?img=12', 'https://i.pravatar.cc/150?img=13'],
                extra: 2
            },
            {
                id: 'squad2',
                title: 'Concert group from Andheri',
                subtitle: 'Need 2 more for car pool',
                avatars: ['https://i.pravatar.cc/150?img=14', 'https://i.pravatar.cc/150?img=15'],
                extra: 0
            }
        ]
    },
    
    init() {
        this.renderTrending();
        this.renderYourRooms();
        this.renderChannels();
        this.renderNearby();
        this.renderSquads();
        this.setupEventListeners();
    },
    
    renderTrending() {
        const container = document.getElementById('trendingList');
        container.innerHTML = this.data.trending.map(item => `
            <div class="trending-card" onclick="Chat.enterRoom('${item.id}')">
                <div class="trending-image ${item.image}">
                    ${item.hot ? '<span class="hot-badge">🔥 HOT</span>' : ''}
                    ${item.live ? '<span class="live-indicator"><span class="live-dot"></span>LIVE</span>' : ''}
                </div>
                <div class="trending-info">
                    <h3>${item.title}</h3>
                    <p>${item.subtitle}</p>
                    <div class="trending-meta">
                        <span class="chatting-now">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                            </svg>
                            ${item.members.length * 84} chatting
                        </span>
                        <div class="member-avatars">
                            ${item.members.map(m => `<img src="${m}" alt="">`).join('')}
                        </div>
                        <button class="join-btn">Join</button>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    renderYourRooms() {
        const container = document.getElementById('yourRoomsList');
        container.innerHTML = this.data.yourRooms.map(room => `
            <a href="chat-room.html?id=${room.id}" class="room-item ${room.unread ? 'unread' : ''}">
                <div class="room-icon ${room.color}">${room.icon}</div>
                <div class="room-details">
                    <div class="room-header">
                        <span class="room-name">${room.name}</span>
                        <span class="room-time">${room.time}</span>
                    </div>
                    <div class="room-preview ${room.unread ? 'unread' : ''}">${room.preview}</div>
                </div>
                ${room.unread ? `<span class="unread-badge">${room.unread}</span>` : ''}
            </a>
        `).join('');
    },
    
    renderChannels() {
        const container = document.getElementById('channelGrid');
        container.innerHTML = this.data.channels.map(ch => `
            <div class="channel-card" onclick="Chat.enterChannel('${ch.id}')">
                <div class="channel-icon" style="background: ${ch.color}20; color: ${ch.color}">
                    ${ch.icon}
                </div>
                <div class="channel-info">
                    <div class="channel-name">${ch.name}</div>
                    <div class="channel-members">${ch.members} members</div>
                </div>
                <svg class="channel-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                </svg>
            </div>
        `).join('');
    },
    
    renderNearby() {
        const container = document.getElementById('nearbyList');
        container.innerHTML = this.data.nearby.map(event => `
            <div class="event-room-card" onclick="Chat.enterRoom('${event.id}')">
                <div class="event-thumb ${event.type}">${event.icon}</div>
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-venue">${event.venue} • ${event.distance}</div>
                    <div class="event-stats">
                        <span class="stat-item fire">
                            🔥 ${event.chatting} chatting
                        </span>
                        <span class="stat-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            12 groups
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    renderSquads() {
        const container = document.getElementById('squadList');
        container.innerHTML = this.data.squads.map(squad => `
            <div class="squad-card">
                <div class="squad-avatars">
                    ${squad.avatars.map(a => `<img src="${a}" alt="">`).join('')}
                    ${squad.extra > 0 ? `<div class="squad-more">+${squad.extra}</div>` : ''}
                </div>
                <div class="squad-info">
                    <div class="squad-title">${squad.title}</div>
                    <div class="squad-subtitle">${squad.subtitle}</div>
                </div>
                <button class="join-squad-btn" onclick="Chat.joinSquad('${squad.id}')">Join</button>
            </div>
        `).join('');
    },
    
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        // Room type selection in modal
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    },
    
    handleSearch(query) {
        if (!query) {
            this.renderTrending();
            this.renderYourRooms();
            return;
        }
        
        // Filter rooms based on search
        const filteredRooms = this.data.yourRooms.filter(r => 
            r.name.toLowerCase().includes(query.toLowerCase()) ||
            r.preview.toLowerCase().includes(query.toLowerCase())
        );
        
        const container = document.getElementById('yourRoomsList');
        if (filteredRooms.length === 0) {
            container.innerHTML = '<div class="no-results">No rooms found</div>';
        } else {
            container.innerHTML = filteredRooms.map(room => `
                <a href="chat-room.html?id=${room.id}" class="room-item ${room.unread ? 'unread' : ''}">
                    <div class="room-icon ${room.color}">${room.icon}</div>
                    <div class="room-details">
                        <div class="room-header">
                            <span class="room-name">${room.name}</span>
                            <span class="room-time">${room.time}</span>
                        </div>
                        <div class="room-preview ${room.unread ? 'unread' : ''}">${room.preview}</div>
                    </div>
                    ${room.unread ? `<span class="unread-badge">${room.unread}</span>` : ''}
                </a>
            `).join('');
        }
    },
    
    enterRoom(roomId) {
        // Navigate to chat room
        window.location.href = `chat-room.html?id=${roomId}`;
    },
    
    enterChannel(channelId) {
        // Navigate to global channel
        window.location.href = `chat-room.html?channel=${channelId}&global=true`;
    },
    
    joinSquad(squadId) {
        const squad = this.data.squads.find(s => s.id === squadId);
        if (squad) {
            this.showToast(`Request sent to join squad!`);
            // In real app: API call to join group
            setTimeout(() => {
                window.location.href = `group-join.html?squad=${squadId}`;
            }, 1000);
        }
    },
    
    showNewRoom() {
        document.getElementById('newRoomModal').classList.remove('hidden');
    },
    
    closeModal() {
        document.getElementById('newRoomModal').classList.add('hidden');
    },
    
    createRoom() {
        const name = document.getElementById('roomName').value;
        const link = document.getElementById('roomLink').value;
        const type = document.querySelector('.type-btn.active').dataset.type;
        
        if (!name) {
            this.showToast('Please enter a room name');
            return;
        }
        
        // Simulate room creation
        const newRoom = {
            id: 'new_' + Date.now(),
            name: name,
            preview: 'Room created just now',
            time: 'now',
            unread: 0,
            icon: type === 'event' ? '🎉' : type === 'travel' ? '🚌' : '💬',
            color: 'purple',
            type: type
        };
        
        this.data.yourRooms.unshift(newRoom);
        this.renderYourRooms();
        this.closeModal();
        this.showToast('Room created successfully!');
        
        // Clear form
        document.getElementById('roomName').value = '';
        document.getElementById('roomLink').value = '';
        
        // Navigate to new room after short delay
        setTimeout(() => {
            window.location.href = `chat-room.html?id=${newRoom.id}&new=true`;
        }, 800);
    },
    
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => Chat.init());