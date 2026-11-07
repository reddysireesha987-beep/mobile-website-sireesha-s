/**
 * Sireesha Mobile Store - Animations & Interactive Engine
 * Founder & Owner: Sireesha Reddy
 */

document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => document.body.classList.add('hero-ready'));
  initScrollAnimations();
  initCounters();
  initCountdownTimers();
  initFaqAccordion();
});

// Scroll Reveal with IntersectionObserver
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal, .product-card, .why-card, .brand-card, .review-card, .team-card');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });
  } else {
    revealElements.forEach(el => el.style.opacity = '1');
  }
}

// Add CSS rule for revealed elements dynamically
const style = document.createElement('style');
style.textContent = `
  .revealed {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// Animated Counters for Stats
function initCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 1800;
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            counter.textContent = prefix + target.toLocaleString() + suffix;
            clearInterval(timer);
          } else {
            counter.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
          }
        }, stepTime);

        obs.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

// Real-Time Countdown Timer for Flash Offers
function initCountdownTimers() {
  const timerElements = document.querySelectorAll('.countdown-timer');
  if (timerElements.length === 0) return;

  // Set target to midnight + 3 days from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 2);
  targetDate.setHours(23, 59, 59, 0);

  function updateTimers() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      timerElements.forEach(t => t.innerHTML = '<span style="color:var(--accent-emerald);">Deal Refreshed!</span>');
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.querySelectorAll('.timer-days').forEach(el => el.textContent = String(days).padStart(2, '0'));
    document.querySelectorAll('.timer-hours').forEach(el => el.textContent = String(hours).padStart(2, '0'));
    document.querySelectorAll('.timer-minutes').forEach(el => el.textContent = String(minutes).padStart(2, '0'));
    document.querySelectorAll('.timer-seconds').forEach(el => el.textContent = String(seconds).padStart(2, '0'));
  }

  updateTimers();
  setInterval(updateTimers, 1000);
}

// Interactive FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

// V6 cinematic founder interaction: subtle mouse-follow depth, not a rotating ring.
function initFounderDepth() {
  const frame = document.querySelector('.founder-card-frame');
  const hero = document.querySelector('.hero-section');
  if (!frame || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  let raf = null;
  let x = 0, y = 0;
  let tx = 0, ty = 0;

  const update = () => {
    raf = null;
    tx += (x - tx) * 0.08;
    ty += (y - ty) * 0.08;
    frame.style.setProperty('--mx', `${tx.toFixed(2)}deg`);
    frame.style.setProperty('--my', `${ty.toFixed(2)}deg`);
    frame.style.transform = `perspective(1200px) rotateY(${tx.toFixed(2)}deg) rotateX(${(-ty).toFixed(2)}deg) translateZ(0)`;
  };

  const move = (event) => {
    const rect = frame.getBoundingClientRect();
    const px = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const py = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    x = Math.max(-1, Math.min(1, px)) * 3.2;
    y = Math.max(-1, Math.min(1, py)) * 2.4;
    hero.style.setProperty('--hero-mx', `${50 + px * 14}%`);
    hero.style.setProperty('--hero-my', `${50 + py * 14}%`);
    if (!raf) raf = requestAnimationFrame(update);
  };

  const reset = () => {
    x = y = 0;
    if (!raf) raf = requestAnimationFrame(update);
    hero.style.setProperty('--hero-mx', '50%');
    hero.style.setProperty('--hero-my', '50%');
  };

  frame.addEventListener('mousemove', move, { passive: true });
  frame.addEventListener('mouseleave', reset, { passive: true });
}

document.addEventListener('DOMContentLoaded', initFounderDepth);

function initTeamExperience(){const items=document.querySelectorAll('[data-team-reveal]');if(!items.length)return;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){items.forEach(el=>el.classList.add('team-visible'));return;}const observer=new IntersectionObserver((entries,obs)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('team-visible');obs.unobserve(entry.target);}})},{threshold:.12,rootMargin:'0px 0px -60px 0px'});items.forEach(el=>observer.observe(el));}document.addEventListener('DOMContentLoaded',initTeamExperience);
