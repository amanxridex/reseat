// Filter chips
document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', function() {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        
        // Filter animation
        const concerts = document.querySelectorAll('.concert-card');
        concerts.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
        });
        
        setTimeout(() => {
            concerts.forEach((card, index) => {
                setTimeout(() => {
                    card.style.transition = 'all 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 200);
    });
});

// Navigation
function openEvent(eventId) {
    pulseEffect(event.currentTarget);
    setTimeout(() => {
        window.location.href = `event-details.html?id=${eventId}`;
    }, 200);
}

function openArtist(artistId) {
    pulseEffect(event.currentTarget);
    setTimeout(() => {
        window.location.href = `artist-profile.html?id=${artistId}`;
    }, 200);
}

function openConcert(concertId) {
    pulseEffect(event.currentTarget);
    setTimeout(() => {
        window.location.href = `concert-booking.html?id=${concertId}`;
    }, 200);
}

function openVenue(venueId) {
    pulseEffect(event.currentTarget);
    setTimeout(() => {
        window.location.href = `venue-details.html?id=${venueId}`;
    }, 200);
}

// Pulse click effect
function pulseEffect(element) {
    element.style.transform = 'scale(0.95)';
    element.style.opacity = '0.8';
    setTimeout(() => {
        element.style.transform = '';
        element.style.opacity = '';
    }, 200);
}

// Parallax on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-bg img');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px) scale(${1 + scrolled * 0.0002})`;
    }
});

// Touch feedback
document.querySelectorAll('.concert-card, .artist-circle, .venue-card, .filter-chip').forEach(el => {
    el.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });
    el.addEventListener('touchend', function() {
        this.style.transform = '';
    });
});