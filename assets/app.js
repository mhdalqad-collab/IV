/* SELK — Premium shared interactions (v2) */

/* ---------- Sparkline renderer ---------- */
function sparkline(el) {
  const data = el.dataset.points.split(',').map(Number);
  const w = +el.getAttribute('width') || 80;
  const h = +el.getAttribute('height') || 22;
  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (h - pad * 2) * (1 - (v - min) / range);
    return [x, y];
  });
  const toPath = (p, close) => {
    let d = `M ${p[0][0]} ${p[0][1]}`;
    for (let i = 1; i < p.length; i++) {
      const [x1, y1] = p[i - 1];
      const [x2, y2] = p[i];
      const cx = (x1 + x2) / 2;
      d += ` Q ${cx} ${y1}, ${cx} ${(y1 + y2) / 2} T ${x2} ${y2}`;
    }
    if (close) d += ` L ${p[p.length - 1][0]} ${h} L ${p[0][0]} ${h} Z`;
    return d;
  };
  const color = el.classList.contains('up') ? '#CC0000'
              : el.classList.contains('dn') ? '#008009'
              : '#0071C2';
  el.innerHTML = `
    <defs>
      <linearGradient id="sg-${Math.random().toString(36).slice(2, 8)}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${toPath(pts, true)}" fill="${color}" fill-opacity="0.18"/>
    <path d="${toPath(pts, false)}" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  `;
}

/* ---------- Animated number ticker ---------- */
function tickNumber(el) {
  const target = +el.dataset.target;
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur = 1600;
  const start = performance.now();
  const from = 0;
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    // More dramatic easing: fast start, slow finish
    const eased = 1 - Math.pow(1 - p, 4);
    const val = Math.round(from + (target - from) * eased);
    el.textContent = prefix + val.toLocaleString('en-US') + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- Filter chip toggle ---------- */
function initChips() {
  document.querySelectorAll('.star-btn, .chip-toggle').forEach(b => {
    b.addEventListener('click', () => b.classList.toggle('on'));
  });
}

/* ---------- Range slider display ---------- */
function initRanges() {
  document.querySelectorAll('.range-wrap input[type="range"]').forEach(r => {
    const showEl = document.querySelector(r.dataset.show);
    const update = () => { if (showEl) showEl.textContent = r.value; };
    r.addEventListener('input', update);
    update();
  });
}

/* ---------- Stepper (quantity +/-) ---------- */
function initSteppers() {
  document.querySelectorAll('.stepper').forEach(s => {
    const valEl = s.querySelector('.value');
    const plus = s.querySelector('[data-act="plus"]');
    const minus = s.querySelector('[data-act="minus"]');
    const min = +s.dataset.min || 1;
    const step = +s.dataset.step || 1;
    const unit = s.dataset.unit || '';
    let v = +s.dataset.value || min;
    const render = () => valEl.textContent = v.toLocaleString('en-US') + unit;
    if (plus) plus.addEventListener('click', e => { e.preventDefault(); v += step; render(); });
    if (minus) minus.addEventListener('click', e => { e.preventDefault(); v = Math.max(min, v - step); render(); });
    render();
  });
}

/* ---------- City tab switcher ---------- */
function initCityTabs() {
  document.querySelectorAll('[data-city-tabs]').forEach(wrap => {
    const tabs = wrap.querySelectorAll('.city-tab');
    tabs.forEach(t => {
      t.addEventListener('click', e => {
        e.preventDefault();
        tabs.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
      });
    });
  });
}

/* ---------- Carousel for type cards ---------- */
function initCarousels() {
  document.querySelectorAll('.type-row').forEach(row => {
    const scroll = row.querySelector('.type-scroll');
    const prev = row.querySelector('.type-nav.prev');
    const next = row.querySelector('.type-nav.next');
    if (!scroll) return;
    const dist = 400;
    if (prev) prev.addEventListener('click', () => scroll.scrollBy({ left: -dist, behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => scroll.scrollBy({ left: dist, behavior: 'smooth' }));
  });
}

/* ---------- Calendar date picker ---------- */
function buildCalendar(el) {
  const monthName = el.dataset.month || 'OCTOBER 2026';
  const startDay = +el.dataset.startDay || 3;
  const daysInMonth = +el.dataset.days || 31;
  const selected = (el.dataset.selected || '').split(',').filter(Boolean).map(Number);
  const hot = (el.dataset.dots || '').split(',').filter(Boolean).map(Number);
  const today = +el.dataset.today || 0;

  const dows = ['MO','TU','WE','TH','FR','SA','SU'];
  const rangeMin = selected.length ? Math.min(...selected) : 0;
  const rangeMax = selected.length ? Math.max(...selected) : 0;

  let html = `
    <div class="cal-head">
      <button aria-label="Previous month">
        <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h4>${monthName}</h4>
      <button aria-label="Next month">
        <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
    <div class="cal-grid">
  `;
  dows.forEach(d => html += `<div class="cal-dow">${d}</div>`);
  for (let i = 0; i < startDay; i++) html += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    let cls = 'cal-day';
    if (d === rangeMin) cls += ' range-start';
    else if (d === rangeMax) cls += ' range-end';
    else if (d > rangeMin && d < rangeMax) cls += ' in-range';
    if (d === today) cls += ' today';
    if (hot.includes(d)) cls += ' hot';
    html += `<button class="${cls}">${d}</button>`;
  }
  html += `</div>`;
  el.innerHTML = html;
}

/* ---------- Earnings chart ---------- */
function buildEarningsChart(el) {
  const data = (el.dataset.points || '').split(',').map(Number);
  const labels = (el.dataset.labels || '').split(',');
  if (!data.length) return;

  const w = 720;
  const h = 240;
  const padL = 36, padR = 16, padT = 16, padB = 30;
  const min = 0;
  const max = Math.max(...data) * 1.15;
  const range = max - min || 1;

  const stepX = (w - padL - padR) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = padL + i * stepX;
    const y = padT + (h - padT - padB) * (1 - (v - min) / range);
    return [x, y];
  });

  const line = (close) => {
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1];
      const [x2, y2] = pts[i];
      const cx = (x1 + x2) / 2;
      d += ` C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
    }
    if (close) d += ` L ${pts[pts.length - 1][0]} ${h - padB} L ${pts[0][0]} ${h - padB} Z`;
    return d;
  };

  const gridY = [0, 0.25, 0.5, 0.75, 1].map(p => {
    const y = padT + (h - padT - padB) * p;
    const val = Math.round(max - (max - min) * p);
    return { y, val };
  });

  let html = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#4F46E5" stop-opacity="0"/>
        </linearGradient>
      </defs>
  `;

  gridY.forEach(g => {
    html += `<line x1="${padL}" y1="${g.y}" x2="${w - padR}" y2="${g.y}" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="2 3"/>`;
    html += `<text x="${padL - 8}" y="${g.y + 4}" font-size="10" fill="#64748B" text-anchor="end" font-family="-apple-system, sans-serif">€${g.val.toLocaleString('en-US')}</text>`;
  });

  html += `<path d="${line(true)}" fill="url(#chart-grad)"/>`;
  html += `<path d="${line(false)}" stroke="#4F46E5" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

  const [lx, ly] = pts[pts.length - 1];
  html += `<circle cx="${lx}" cy="${ly}" r="5" fill="#fff" stroke="#4F46E5" stroke-width="2.5"/>`;
  html += `<circle cx="${lx}" cy="${ly}" r="12" fill="#4F46E5" fill-opacity="0.12"/>`;

  labels.forEach((lab, i) => {
    if (!lab) return;
    if (i % 2 !== 0 && labels.length > 8) return;
    const x = padL + i * stepX;
    html += `<text x="${x}" y="${h - 10}" font-size="10" fill="#64748B" text-anchor="middle" font-family="-apple-system, sans-serif">${lab}</text>`;
  });

  html += `</svg>`;
  el.innerHTML = html;
}

/* ---------- Heart (wishlist) toggle with bounce ---------- */
function initHearts() {
  document.querySelectorAll('.heart').forEach(h => {
    h.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      h.classList.toggle('on');
      // Add bounce animation
      h.classList.add('animating');
      h.addEventListener('animationend', () => {
        h.classList.remove('animating');
      }, { once: true });
    });
  });
}

/* ---------- IntersectionObserver for tickers ---------- */
function initTickers() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tickNumber(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-target]').forEach(el => obs.observe(el));
}

/* ---------- Scroll-triggered reveal animations ---------- */
function initRevealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // If this element has children with reveal-delay-* classes, they'll auto-animate via CSS
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ---------- Back to top button ---------- */
function initBackToTop() {
  // Create the button
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="m18 15-6-6-6 6"/></svg>';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 600) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ---------- Review bar scroll animation ---------- */
function initReviewBars() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.bar-fill');
        fills.forEach((fill, i) => {
          const targetWidth = fill.dataset.width || '0%';
          setTimeout(() => {
            fill.style.width = targetWidth;
          }, i * 120); // stagger
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.review-bars').forEach(el => observer.observe(el));
}

/* ---------- Price lock countdown timer ---------- */
function initCountdown() {
  const countdownEls = document.querySelectorAll('[data-countdown]');
  countdownEls.forEach(el => {
    let seconds = parseInt(el.dataset.countdown) || 582; // 9 min 42 sec
    
    function update() {
      const min = Math.floor(seconds / 60);
      const sec = seconds % 60;
      el.textContent = `${min} min ${sec.toString().padStart(2, '0')} sec`;
      
      if (seconds <= 120) {
        el.classList.add('urgent');
      }
      
      if (seconds > 0) {
        seconds--;
        setTimeout(update, 1000);
      } else {
        el.textContent = 'Expired — refresh for new price';
        el.classList.add('urgent');
      }
    }
    update();
  });
}

/* ---------- Smooth anchor scroll for listing nav ---------- */
function initAnchorNav() {
  document.querySelectorAll('.anchor-nav a').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update active state
          document.querySelectorAll('.anchor-nav a').forEach(a => a.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  });
}

/* ---------- Search bar focus glow ---------- */
function initSearchBarFocus() {
  document.querySelectorAll('.search-bar .field input, .search-bar .field select').forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.field').style.background = '#FEFCE8';
    });
    input.addEventListener('blur', () => {
      input.closest('.field').style.background = '';
    });
  });
}

/* ---------- Footer link hover effects ---------- */
function initFooterLinks() {
  document.querySelectorAll('.footer-col ul li a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateX(4px)';
      link.style.transition = 'transform 0.2s ease, color 0.2s ease';
    });
    link.addEventListener('mouseleave', () => {
      link.style.transform = '';
    });
  });
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('svg.spark').forEach(sparkline);
  document.querySelectorAll('.calendar').forEach(buildCalendar);
  document.querySelectorAll('[data-earnings]').forEach(buildEarningsChart);
  initChips();
  initRanges();
  initSteppers();
  initCityTabs();
  initCarousels();
  initHearts();
  initTickers();
  
  // New v2 features
  initRevealOnScroll();
  initBackToTop();
  initReviewBars();
  initCountdown();
  initAnchorNav();
  initSearchBarFocus();
  initFooterLinks();
});
