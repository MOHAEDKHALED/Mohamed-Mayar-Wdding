// ==========================================
// ENVELOPE OPEN & AUDIO PLAY
// ==========================================
const envScreen   = document.getElementById('envelope-screen');
const env         = document.getElementById('env');
const openBtn     = document.getElementById('open-btn');
const site        = document.getElementById('site');
const audio       = document.getElementById('wedding-audio');
const musicToggle = document.getElementById('music-toggle');

// Play audio on envelope open
openBtn.addEventListener('click', () => {
    openBtn.disabled = true;
    openBtn.style.opacity = '.5';
    env.classList.add('open');

    // Start background music
    if (audio) {
        audio.volume = 0.55;
        audio.play().then(() => {
            if (musicToggle) {
                musicToggle.classList.add('playing');
                musicToggle.classList.remove('muted');
            }
        }).catch(err => {
            console.log('Audio autoplay prevented:', err);
        });
    }

    setTimeout(() => {
        envScreen.classList.add('out');
        site.style.display = 'block';
        site.classList.remove('site-hidden');

        setTimeout(() => {
            envScreen.style.display = 'none';
            initParticles();
            initReveal();
            initScrollUX();
            spawnPetals();
        }, 1200);
    }, 2000);
});

// Music toggle button
if (musicToggle && audio) {
    musicToggle.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            musicToggle.classList.add('playing');
            musicToggle.classList.remove('muted');
        } else {
            audio.pause();
            musicToggle.classList.remove('playing');
            musicToggle.classList.add('muted');
        }
    });
}

// ==========================================
// SCROLL REVEAL
// ==========================================
function initReveal() {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('on'), i * 80);
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
}

// ==========================================
// SCROLL UX (progress + back-top + side dots + parallax)
// ==========================================
function initScrollUX() {
    const bar     = document.getElementById('progress-bar');
    const backTop = document.getElementById('back-top');
    const dots    = document.getElementById('side-dots');
    const sdots   = document.querySelectorAll('.sdot');
    const heroInner = document.querySelector('.hero-inner');
    const sections = [
        document.getElementById('s-hero'),
        document.getElementById('s-verse'),
        document.getElementById('s-countdown'),
        document.getElementById('s-invite'),
        document.getElementById('s-details'),
    ];

    dots.classList.add('show');

    function onScroll() {
        const st  = window.scrollY;
        const max = document.body.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (st / max) * 100 : 0) + '%';

        // back to top
        backTop.classList.toggle('show', st > 350);

        // parallax hero
        if (heroInner && st < window.innerHeight) {
            heroInner.style.transform = `translateY(${st * 0.28}px)`;
            heroInner.style.opacity   = 1 - (st / window.innerHeight) * 1.1;
        }

        // active dot
        let cur = 0;
        sections.forEach((s, i) => {
            if (s && s.getBoundingClientRect().top <= window.innerHeight * 0.5) cur = i;
        });
        sdots.forEach((d, i) => d.classList.toggle('active', i === cur));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // back to top click
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // dot clicks → smooth scroll
    sdots.forEach((d, i) => {
        d.addEventListener('click', e => {
            e.preventDefault();
            sections[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ==========================================
// COUNTDOWN
// ==========================================
const WEDDING = new Date('2026-09-04T18:00:00').getTime();

function setRing(id, val, max) {
    const el = document.getElementById(id);
    if (!el) return;
    const c = 2 * Math.PI * 44; // r=44
    el.style.strokeDashoffset = c - (val / max) * c;
}

function tick() {
    const diff = WEDDING - Date.now();
    if (diff <= 0) {
        ['days','hours','mins','secs'].forEach(id => document.getElementById(id).textContent = '00');
        return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    function set(elId, ringId, val, max) {
        const el = document.getElementById(elId);
        const str = String(val).padStart(2, '0');
        if (el.textContent !== str) {
            el.classList.remove('flip');
            void el.offsetWidth;
            el.classList.add('flip');
            el.textContent = str;
        }
        setRing(ringId, val, max);
    }

    set('days',  'r-days',  d, 365);
    set('hours', 'r-hours', h, 24);
    set('mins',  'r-mins',  m, 60);
    set('secs',  'r-secs',  s, 60);
}
setInterval(tick, 1000);
tick();

// ==========================================
// LIGHTBOX
// ==========================================
function openLB(src) {
    document.getElementById('lb-img').src = src;
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeLB() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });

// ==========================================
// TILT on cards
// ==========================================
document.querySelectorAll('.d-card, .g-item').forEach(el => {
    el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width  / 2) / r.width;
        const y = (e.clientY - r.top  - r.height / 2) / r.height;
        el.style.transform = `translateY(-12px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// ==========================================
// PETALS
// ==========================================
function spawnPetals() {
    const box = document.getElementById('petals');
    setInterval(() => {
        const p = document.createElement('div');
        p.className = 'petal';
        const sz = 7 + Math.random() * 9;
        p.style.cssText = `
            left:${Math.random()*100}vw;
            width:${sz}px; height:${sz}px;
            animation-duration:${7 + Math.random() * 8}s;
            animation-delay:${Math.random() * 2}s;
            opacity:${0.4 + Math.random() * 0.5};
        `;
        box.appendChild(p);
        setTimeout(() => p.remove(), 16000);
    }, 500);
}

// ==========================================
// PARTICLES
// ==========================================
function initParticles() {
    // particles.js targets #particles-js but we don't have that element
    // so we skip or just do a lightweight manual version
}
