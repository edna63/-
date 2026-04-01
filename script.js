/* ===========================
   LOAD IMAGES FROM SUPABASE
=========================== */
const _SB_URL = 'https://tymebfuhemhadtyqyntr.supabase.co';
const _SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bWViZnVoZW1oYWR0eXF5bnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzMyNzYsImV4cCI6MjA5MDU0OTI3Nn0.BURDVP3mZNgaTcXZyjRtubSpl2Ne3I9I4gA9BpiK2oA';

fetch(`${_SB_URL}/rest/v1/settings?select=key,value`, {
  headers: { apikey: _SB_KEY, Authorization: `Bearer ${_SB_KEY}` }
}).then(r=>r.json()).then(rows=>{
  rows.forEach(row=>{
    if (row.key==='about_photo' && row.value) {
      const img = document.querySelector('.about-img-frame img');
      if (img) img.src = row.value;
    }
    if (row.key==='hero_bg' && row.value) {
      const bg = document.querySelector('.hero-bg');
      if (bg) bg.style.backgroundImage =
        `linear-gradient(135deg,rgba(107,90,142,.80) 0%,rgba(42,31,61,.88) 60%), url('${row.value}')`;
    }
  });
}).catch(()=>{});

/* ===========================
   NAVBAR – scroll & mobile
=========================== */
const header    = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
});

// Close menu when a link is clicked
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navMenu.classList.remove('open'));
});

/* ===========================
   ACTIVE NAV LINK on scroll
=========================== */
const sections = document.querySelectorAll('section[id]');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));

/* ===========================
   CONTACT FORM
=========================== */
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

form.addEventListener('submit', e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'שולח...';

  // Simulate async submission (replace with real fetch to your backend)
  setTimeout(() => {
    success.classList.add('show');
    form.reset();
    btn.disabled = false;
    btn.textContent = 'שלח הודעה';
    setTimeout(() => success.classList.remove('show'), 6000);
  }, 900);
});

/* ===========================
   SCROLL-IN ANIMATIONS
=========================== */
const animEls = document.querySelectorAll(
  '.service-card, .testimonial-card, .stat-item, .about-content, .about-image, .contact-info, .contact-form'
);

const anim = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      anim.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

animEls.forEach((el, i) => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(28px)';
  el.style.transition = `opacity .55s ease ${i * 0.06}s, transform .55s ease ${i * 0.06}s`;
  anim.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.visible').forEach(el => {
    el.style.opacity   = '1';
    el.style.transform = 'none';
  });
});

// Inject .visible rule via JS so CSS doesn't need it
const style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: none !important; }';
document.head.appendChild(style);

/* ===========================
   COUNTER ANIMATION (stats)
=========================== */
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step  = Math.ceil(target / 50);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current + suffix;
  }, 30);
}

const statsSection = document.querySelector('.stats');
let countersStarted = false;

const statsObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    document.querySelectorAll('.stat-number').forEach(el => {
      const raw    = el.textContent.trim();
      const suffix = raw.replace(/[0-9]/g, '');
      const num    = parseInt(raw, 10);
      animateCounter(el, num, suffix);
    });
  }
}, { threshold: 0.5 });

if (statsSection) statsObs.observe(statsSection);
