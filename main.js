/* ═══════════════════════════════════════════════
   SABLE — main.js
   Handles: load animations · nav scroll · typewriter ·
            AI search · scroll reveal · booking modal ·
            calendar · time slots · form
═══════════════════════════════════════════════ */

'use strict';

/* ───────────────────────────
   STAGGERED LOAD ANIMATIONS
─────────────────────────── */
function initLoadAnimations() {
  const elems = [
    '.anim-nav',
    '.anim-headline',
    '.anim-chip-tl',
    '.anim-chip-tr',
    '.anim-chip-bl',
    '.anim-chip-br',
  ];
  // small rAF delay so CSS transitions are ready
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      elems.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('loaded');
      });
    });
  });
}

/* ───────────────────────────
   NAV SCROLL BEHAVIOR
─────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  let last = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    last = y;
  }, { passive: true });
}

/* ───────────────────────────
   SCROLL REVEAL
─────────────────────────── */
function initScrollReveal() {
  // add reveal class to section children
  const targets = document.querySelectorAll(
    '.service-card, .work-card, .process-step, .section-header, .contact-left, .contact-form'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    const mod = i % 4;
    if (mod > 0) el.classList.add(`reveal-delay-${mod}`);
  });

  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ───────────────────────────
   TYPEWRITER — AI SEARCH CHIP
─────────────────────────── */
const SEARCH_QUERIES = [
  'Show me your brand identity work',
  'What does a discovery call involve?',
  'Do you work with startups?',
  'How long does a web project take?',
  'Tell me about your film capabilities',
  'What\'s your process for a rebrand?',
];

const SEARCH_ANSWERS = {
  brand:  'We\'ve built identities for 240+ brands across luxury, tech, and FMCG. Check out Volta Energy or Nocturne Spirits in our portfolio.',
  discovery: 'A 60-minute video call to audit your brand, unpack your goals, and figure out whether we\'re the right fit. No charge, no obligation.',
  startup: 'Absolutely. About 40% of our work is with early-stage companies — we offer founder-first packages for pre-Series A teams.',
  web: 'Typical web projects run 8–12 weeks from kickoff to launch, depending on scope. Rush slots occasionally available.',
  film: 'We handle everything in-house: concept, scripting, production, and post. Cannes Lions x3 in branded content.',
  rebrand: 'Discovery → Strategy → Visual Identity → Guidelines → Rollout. Usually 12–16 weeks for a full rebrand.',
  default: 'Ask us anything about our services, process, or past work — we\'re an open book.',
};

function getAnswer(query) {
  const q = query.toLowerCase();
  if (q.includes('brand') || q.includes('identity')) return SEARCH_ANSWERS.brand;
  if (q.includes('discovery') || q.includes('call') || q.includes('meeting')) return SEARCH_ANSWERS.discovery;
  if (q.includes('startup') || q.includes('early')) return SEARCH_ANSWERS.startup;
  if (q.includes('web') || q.includes('long') || q.includes('time')) return SEARCH_ANSWERS.web;
  if (q.includes('film') || q.includes('motion') || q.includes('video')) return SEARCH_ANSWERS.film;
  if (q.includes('rebrand') || q.includes('process') || q.includes('how')) return SEARCH_ANSWERS.rebrand;
  return SEARCH_ANSWERS.default;
}

function initTypewriter() {
  const input = document.getElementById('ai-search-input');
  if (!input) return;

  // inject typewriter cursor span after input
  const cursor = document.createElement('span');
  cursor.className = 'tw-cursor';
  input.parentNode.insertBefore(cursor, input.nextSibling);

  let qIndex = 0;
  let charIndex = 0;
  let typing = true;
  let paused = false;
  let userFocused = false;
  let raf;

  input.addEventListener('focus', () => { userFocused = true; cancelAnimationFrame(raf); cursor.style.display = 'none'; });
  input.addEventListener('blur', () => {
    if (!input.value) {
      userFocused = false;
      cursor.style.display = '';
      charIndex = 0; typing = true; paused = false;
      typeLoop();
    }
  });

  function typeLoop() {
    if (userFocused) return;
    const query = SEARCH_QUERIES[qIndex];

    if (typing) {
      input.placeholder = query.slice(0, charIndex) + '|';
      charIndex++;
      if (charIndex > query.length) {
        typing = false;
        paused = true;
        raf = setTimeout(() => { paused = false; typeLoop(); }, 1800);
        return;
      }
      raf = setTimeout(typeLoop, 52 + Math.random() * 30);
    } else {
      input.placeholder = query.slice(0, charIndex);
      charIndex--;
      if (charIndex < 0) {
        charIndex = 0;
        typing = true;
        qIndex = (qIndex + 1) % SEARCH_QUERIES.length;
        raf = setTimeout(typeLoop, 400);
        return;
      }
      raf = setTimeout(typeLoop, 28);
    }
  }
  typeLoop();

  // search submit
  function doSearch() {
    const q = input.value.trim();
    const answer = document.getElementById('search-answer');
    if (!answer) return;
    if (!q) return;
    answer.style.opacity = '0';
    setTimeout(() => {
      answer.textContent = getAnswer(q);
      answer.style.opacity = '1';
    }, 200);
  }

  document.getElementById('search-submit')?.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

/* ───────────────────────────
   BOOKING MODAL
─────────────────────────── */
const modal = {
  overlay:   null,
  currentStep: 1,
  selection: { service: null, date: null, time: null },
  cal: { year: 0, month: 0 },

  init() {
    this.overlay = document.getElementById('booking-modal');
    if (!this.overlay) return;

    // open triggers
    document.querySelectorAll('.js-open-booking').forEach(btn =>
      btn.addEventListener('click', () => this.open())
    );
    // close triggers
    document.querySelectorAll('.js-close-booking').forEach(btn =>
      btn.addEventListener('click', () => this.close())
    );
    // close on backdrop click
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close();
    });
    // close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.overlay.classList.contains('open')) this.close();
    });

    // next / prev
    document.querySelectorAll('.js-next-step').forEach(btn =>
      btn.addEventListener('click', () => this.nextStep())
    );
    document.querySelectorAll('.js-prev-step').forEach(btn =>
      btn.addEventListener('click', () => this.prevStep())
    );

    // service radio change
    document.querySelectorAll('input[name="service"]').forEach(radio =>
      radio.addEventListener('change', () => {
        this.selection.service = radio.value;
        document.querySelector('#step-1 .modal-next').disabled = false;
      })
    );

    // confirm
    document.querySelector('.js-confirm-booking')?.addEventListener('click', () => this.confirm());

    // calendar nav
    document.getElementById('cal-prev')?.addEventListener('click', () => {
      this.cal.month--;
      if (this.cal.month < 0) { this.cal.month = 11; this.cal.year--; }
      this.renderCalendar();
    });
    document.getElementById('cal-next')?.addEventListener('click', () => {
      this.cal.month++;
      if (this.cal.month > 11) { this.cal.month = 0; this.cal.year++; }
      this.renderCalendar();
    });
  },

  open() {
    this.overlay.classList.add('open');
    this.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // init calendar to current month on open
    const now = new Date();
    this.cal.year = now.getFullYear();
    this.cal.month = now.getMonth();
    this.renderCalendar();
  },

  close() {
    this.overlay.classList.remove('open');
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // reset after transition
    setTimeout(() => this.reset(), 400);
  },

  reset() {
    this.selection = { service: null, date: null, time: null };
    this.currentStep = 1;
    this.goToStep(1);
    // uncheck radios
    document.querySelectorAll('input[name="service"]').forEach(r => r.checked = false);
    document.querySelector('#step-1 .modal-next').disabled = true;
    document.getElementById('step2-next').disabled = true;
    document.getElementById('booking-success').classList.remove('visible');
    document.getElementById('step-3').querySelector('.booking-fields').style.display = '';
    document.getElementById('step-3').querySelector('.step-nav').style.display = '';
  },

  goToStep(n) {
    // panels
    document.querySelectorAll('.step-panel').forEach((p, i) => {
      p.classList.toggle('active', i + 1 === n);
    });
    // indicators
    document.querySelectorAll('.modal-step').forEach(s => {
      const sn = +s.dataset.step;
      s.classList.toggle('active', sn === n);
      s.classList.toggle('done', sn < n);
    });
    this.currentStep = n;
  },

  nextStep() {
    if (this.currentStep < 3) this.goToStep(this.currentStep + 1);
    if (this.currentStep === 3) this.updateSummary();
  },

  prevStep() {
    if (this.currentStep > 1) this.goToStep(this.currentStep - 1);
  },

  renderCalendar() {
    const grid = document.getElementById('cal-grid');
    const lbl  = document.getElementById('cal-month-lbl');
    if (!grid || !lbl) return;

    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    lbl.textContent = `${months[this.cal.month]} ${this.cal.year}`;

    const now    = new Date();
    const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const first  = new Date(this.cal.year, this.cal.month, 1);
    // Mon=0 ... Sun=6
    let startDow = first.getDay() - 1;
    if (startDow < 0) startDow = 6;
    const daysInMonth = new Date(this.cal.year, this.cal.month + 1, 0).getDate();

    grid.innerHTML = '';

    // empty cells
    for (let i = 0; i < startDow; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day empty';
      grid.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayEl = document.createElement('button');
      dayEl.className = 'cal-day';
      dayEl.textContent = d;

      const thisDay = new Date(this.cal.year, this.cal.month, d);
      if (thisDay < today) {
        dayEl.classList.add('past');
      } else if (thisDay.getTime() === today.getTime()) {
        dayEl.classList.add('today');
      }

      // if this day matches selection
      if (
        this.selection.date &&
        this.selection.date.getFullYear() === this.cal.year &&
        this.selection.date.getMonth()    === this.cal.month &&
        this.selection.date.getDate()     === d
      ) {
        dayEl.classList.add('selected');
      }

      dayEl.addEventListener('click', () => {
        this.selection.date = new Date(this.cal.year, this.cal.month, d);
        this.selection.time = null;
        // re-render so selected state updates
        this.renderCalendar();
        this.renderTimeSlots();
        document.getElementById('step2-next').disabled = true;
      });

      grid.appendChild(dayEl);
    }
  },

  renderTimeSlots() {
    const wrap = document.getElementById('time-wrap');
    if (!wrap) return;
    if (!this.selection.date) {
      wrap.innerHTML = '<p class="time-prompt">Select a date first</p>';
      return;
    }

    const slots = [
      '9:00 AM','9:30 AM','10:00 AM','10:30 AM',
      '11:00 AM','11:30 AM','2:00 PM','2:30 PM',
      '3:00 PM','3:30 PM','4:00 PM','4:30 PM',
    ];
    // pseudo-random unavailability seeded by date
    const seed = this.selection.date.getDate() + this.selection.date.getMonth() * 31;
    const unavail = new Set(slots.filter((_, i) => ((i + seed) * 7919 % 11) < 3));

    wrap.innerHTML = '<div class="time-slots"></div>';
    const container = wrap.querySelector('.time-slots');

    slots.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'time-slot';
      btn.textContent = t;
      if (unavail.has(t)) btn.classList.add('unavail');
      if (this.selection.time === t) btn.classList.add('selected');

      btn.addEventListener('click', () => {
        this.selection.time = t;
        wrap.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('step2-next').disabled = false;
      });

      container.appendChild(btn);
    });
  },

  updateSummary() {
    const el = document.getElementById('booking-summary');
    if (!el || !this.selection.date) return;
    const serviceLabels = {
      'brand-identity': 'Brand Identity',
      'web-digital':    'Web & Digital',
      'film-motion':    'Film & Motion',
      'full-campaign':  'Full Campaign',
    };
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const d = this.selection.date;
    el.innerHTML = `
      <strong>${serviceLabels[this.selection.service] || 'Discovery Call'}</strong><br/>
      ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} &nbsp;·&nbsp; ${this.selection.time}
    `;
  },

  confirm() {
    const name  = document.getElementById('b-name')?.value.trim();
    const email = document.getElementById('b-email')?.value.trim();
    if (!name || !email) {
      // simple shake highlight
      [document.getElementById('b-name'), document.getElementById('b-email')].forEach(f => {
        if (f && !f.value.trim()) {
          f.style.borderColor = 'rgba(255,56,0,.7)';
          setTimeout(() => { f.style.borderColor = ''; }, 1400);
        }
      });
      return;
    }
    // show success
    const panel = document.getElementById('step-3');
    panel.querySelector('.booking-fields').style.display = 'none';
    panel.querySelector('.step-nav').style.display = 'none';
    document.getElementById('booking-success').classList.add('visible');
  },
};

/* ───────────────────────────
   CONTACT FORM
─────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Sent ✓';
    btn.style.background = '#1a7a3f';
    btn.style.boxShadow = '0 0 24px rgba(26,122,63,.3)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send it →';
      btn.style.background = '';
      btn.style.boxShadow = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
}

/* ───────────────────────────
   HERO VIDEO FALLBACK
─────────────────────────── */
function initVideo() {
  const video = document.getElementById('hero-video');
  if (!video) return;
  // if video fails to load, hero still looks good via CSS bg
  video.addEventListener('error', () => {
    const hero = document.getElementById('hero');
    hero.style.background = 'radial-gradient(ellipse at 60% 40%, #1a0a00 0%, #080810 60%)';
  });
}

/* ───────────────────────────
   SMOOTH ANCHOR SCROLL
─────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ───────────────────────────
   WORK CARD HOVER TILT
─────────────────────────── */
function initWorkTilt() {
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale(1.025)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ───────────────────────────
   INIT ALL
─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLoadAnimations();
  initNav();
  initScrollReveal();
  initTypewriter();
  modal.init();
  initContactForm();
  initVideo();
  initSmoothScroll();
  initWorkTilt();
});
