const header=document.getElementById('header');
const navToggle=document.getElementById('nav-toggle');
const navMenu=document.getElementById('nav-menu');

window.addEventListener('scroll',()=>{
  header.classList.toggle('scrolled',window.scrollY>60);
});

navToggle.addEventListener('click',()=>{
  navMenu.classList.toggle('open');
});

navMenu.querySelectorAll('.nav-link').forEach(l=>{
  l.addEventListener('click',()=>navMenu.classList.remove('open'));
});

// Scroll animations
const els=document.querySelectorAll('.service-card,.contact-card,.about-content,.about-visual');
const s=document.createElement('style');
s.textContent='.fade-in{opacity:1 !important;transform:none !important}';
document.head.appendChild(s);

const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('fade-in');obs.unobserve(e.target);}});
},{threshold:.12});

els.forEach((el,i)=>{
  el.style.cssText=`opacity:0;transform:translateY(24px);transition:opacity .5s ease ${i*.07}s,transform .5s ease ${i*.07}s`;
  obs.observe(el);
});
