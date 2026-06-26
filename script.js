// Audio Control
const audio = document.getElementById('bgAudio');
const audioToggle = document.getElementById('audioToggle');

// Background music sources (Montagem Elder variations)
const playlists = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
];

let isAudioPlaying = false;
let currentTrackIndex = 0;

// Initialize audio
function initAudio() {
    audio.volume = 0.3;
    audio.src = playlists[0];
    
    // Auto-play attempt
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                isAudioPlaying = true;
                updateAudioButton();
            })
            .catch(() => {
                isAudioPlaying = false;
                updateAudioButton();
            });
    }
}

// Audio Toggle
audioToggle.addEventListener('click', () => {
    if (isAudioPlaying) {
        audio.pause();
        isAudioPlaying = false;
    } else {
        audio.play();
        isAudioPlaying = true;
    }
    updateAudioButton();
});

function updateAudioButton() {
    const icon = audioToggle.querySelector('i');
    if (isAudioPlaying) {
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
        audioToggle.style.background = 'linear-gradient(135deg, #00d4ff, #ff006e)';
    } else {
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
        audioToggle.style.background = 'linear-gradient(135deg, #666, #444)';
    }
}

// Play next track on end
audio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlists.length;
    audio.src = playlists[currentTrackIndex];
    audio.play();
});

// Smooth scroll navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact Form Handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #00d4ff, #ff006e);
            color: #0a0e27;
            padding: 2rem 3rem;
            border-radius: 15px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 0 40px rgba(0, 212, 255, 0.5);
            animation: slideInDown 0.5s ease-out;
        `;
        successMsg.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
        document.body.appendChild(successMsg);
        
        // Clear form
        contactForm.reset();
        
        // Remove message after 3 seconds
        setTimeout(() => {
            successMsg.style.animation = 'slideInUp 0.5s ease-out';
            setTimeout(() => successMsg.remove(), 500);
        }, 3000);
    });
}

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 14, 39, 0.98)';
        navbar.style.boxShadow = '0 5px 30px rgba(0, 212, 255, 0.1)';
    } else {
        navbar.style.background = 'rgba(10, 14, 39, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.animation = 'fadeInUp 0.6s ease-out';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.skill-card, .stat, .timeline-item, .contact-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Parallax effect on hero
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    if (hero) {
        hero.style.backgroundPosition = `center ${scrolled * 0.5}px`;
    }
});

// Profile image 3D effect
const profileImg = document.querySelector('.profile-img');
if (profileImg) {
    profileImg.addEventListener('mousemove', (e) => {
        const rect = profileImg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        profileImg.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    
    profileImg.addEventListener('mouseleave', () => {
        profileImg.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
}

// Animated background stars
function createStars() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;
    
    // Stars are handled in CSS, but we can add twinkling effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initAudio();
    createStars();
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                left: ${x}px;
                top: ${y}px;
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            `;
            
            if (!this.style.position || this.style.position === 'static') {
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
            }
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Ripple animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Print current time for inspiration
console.log('%cWelcome to ONUORAH ONYEKA\'s Portfolio!', 'font-size: 20px; font-weight: bold; color: #00d4ff; text-shadow: 0 0 20px #00d4ff;');
console.log('%cFull Stack Developer | Tech Innovator | Problem Solver', 'font-size: 14px; color: #ff006e;');
console.log('%cGet in touch: onyi1610@gmail.com | +2349133523689', 'font-size: 12px; color: #ffd700;');