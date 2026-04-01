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
      document.querySelectorAll('.about-img-frame img, #hero-portrait-img')
        .forEach(img => { if(img) img.src = row.value; });
    }
    if (row.key==='hero_bg' && row.value) {
      const bg = document.querySelector('.hero-bg');
      if (bg) bg.style.backgroundImage =
        `linear-gradient(135deg,rgba(107,90,142,.80) 0%,rgba(42,31,61,.88) 60%), url('${row.value}')`;
    }
  });
}).catch(()=>{});

/* ===========================
   HORIZONTAL SLIDE NAVIGATION
=========================== */
const SLIDE_IDS = ['home', 'services'];
const track     = document.getElementById('slide-track');
const header    = document.getElementById('header');
let   current   = 0;

function slideTo(id) {
  const idx = SLIDE_IDS.indexOf(id);
  if (idx === -1) return;
  current = idx;
  track.style.transform = `translateX(-${idx * 100}vw)`;

  // scroll current panel to top
  const panels = document.querySelectorAll('.slide-panel');
  if (panels[idx]) panels[idx].scrollTop = 0;

  // active nav link
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const active = document.querySelector(`.nav-link[href="#${id}"]`);
  if (active) active.classList.add('active');

  // header style: only home panel has transparent header
  header.classList.toggle('scrolled', idx !== 0);

  // animate cards in the new panel
  animatePanel(idx);
}

// intercept ALL #hash links on the page
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  if (SLIDE_IDS.includes(id)) {
    e.preventDefault();
    slideTo(id);
  }
});

// header scrolled style when panel content is scrolled
document.querySelectorAll('.slide-panel').forEach((panel, idx) => {
  panel.addEventListener('scroll', () => {
    if (idx === current) {
      header.classList.toggle('scrolled', idx !== 0 || panel.scrollTop > 60);
    }
  });
});

/* ===========================
   CARD ANIMATIONS PER PANEL
=========================== */
const ANIM_SELECTORS = '.service-card, .testimonial-card, .stat-item, .about-content, .about-image, .contact-info, .contact-form, .cred-card';
const animatedEls = new WeakSet();

function animatePanel(idx) {
  const panels = document.querySelectorAll('.slide-panel');
  const panel  = panels[idx];
  if (!panel) return;
  panel.querySelectorAll(ANIM_SELECTORS).forEach((el, i) => {
    if (animatedEls.has(el)) return;
    animatedEls.add(el);
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition= `opacity .5s ease ${i * 0.07}s, transform .5s ease ${i * 0.07}s`;
    setTimeout(() => {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    }, 60);
  });
}

// Copy phone number
function copyPhone(btn) {
  navigator.clipboard.writeText('050-3138877').then(() => {
    const lbl = btn.querySelector('.cs-btn-sub');
    lbl.textContent = '✓ הועתק!';
    setTimeout(() => { lbl.textContent = 'לחצו להעתקה'; }, 2000);
  });
}

// Fix RTL bug: force scroll to start + show panel 0
document.addEventListener('DOMContentLoaded', () => {
  // reset any RTL-caused scroll offset
  document.documentElement.scrollLeft = 0;
  document.body.scrollLeft = 0;
  track.style.transform = 'translateX(0)';
  animatePanel(0);
});

/* ===========================
   CONTACT FORM
=========================== */
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

form.addEventListener('submit', e => {
  e.preventDefault();
  const name    = document.getElementById('name').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const service = document.getElementById('service').value;
  const message = document.getElementById('message').value.trim();

  // build WhatsApp message
  let text = `שלום עדנה, אני ${name}`;
  if (service) text += `\nמעוניין/ת בטיפול: ${service}`;
  if (message) text += `\n${message}`;
  text += `\nטלפון חזרה: ${phone}`;

  // open WhatsApp with the message
  const waUrl = `https://wa.me/972503138877?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');

  success.classList.add('show');
  form.reset();
  setTimeout(() => success.classList.remove('show'), 6000);
});

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

// run counters when home panel is visible (always panel 0, triggered on load)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.stat-number').forEach(el => {
    const raw    = el.textContent.trim();
    const suffix = raw.replace(/[0-9]/g, '');
    const num    = parseInt(raw, 10);
    if (!isNaN(num)) animateCounter(el, num, suffix);
  });
});
