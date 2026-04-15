/* SELK — shared interactions (Booking.com style) */

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
  const dur = 1400;
  const start = performance.now();
  const from = 0;
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
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
  const startDay = +el.dataset.startDay || 3;  // 0=Sun, 1=Mon, etc (actually we'll use Mon-first, so 0=Mon)
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

  // smooth cardinal-ish
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

  // gridlines
  const gridY = [0, 0.25, 0.5, 0.75, 1].map(p => {
    const y = padT + (h - padT - padB) * p;
    const val = Math.round(max - (max - min) * p);
    return { y, val };
  });

  let html = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0071C2" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#0071C2" stop-opacity="0"/>
        </linearGradient>
      </defs>
  `;

  // gridlines
  gridY.forEach(g => {
    html += `<line x1="${padL}" y1="${g.y}" x2="${w - padR}" y2="${g.y}" stroke="#E0E0E0" stroke-width="1" stroke-dasharray="2 3"/>`;
    html += `<text x="${padL - 8}" y="${g.y + 4}" font-size="10" fill="#6B6B6B" text-anchor="end" font-family="-apple-system, sans-serif">€${g.val.toLocaleString('en-US')}</text>`;
  });

  // area + line
  html += `<path d="${line(true)}" fill="url(#chart-grad)"/>`;
  html += `<path d="${line(false)}" stroke="#0071C2" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

  // last point
  const [lx, ly] = pts[pts.length - 1];
  html += `<circle cx="${lx}" cy="${ly}" r="5" fill="#fff" stroke="#0071C2" stroke-width="2.5"/>`;
  html += `<circle cx="${lx}" cy="${ly}" r="12" fill="#0071C2" fill-opacity="0.12"/>`;

  // x labels
  labels.forEach((lab, i) => {
    if (!lab) return;
    if (i % 2 !== 0 && labels.length > 8) return;
    const x = padL + i * stepX;
    html += `<text x="${x}" y="${h - 10}" font-size="10" fill="#6B6B6B" text-anchor="middle" font-family="-apple-system, sans-serif">${lab}</text>`;
  });

  html += `</svg>`;
  el.innerHTML = html;
}

/* ---------- Heart (wishlist) toggle ---------- */
function initHearts() {
  document.querySelectorAll('.heart').forEach(h => {
    h.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      h.classList.toggle('on');
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
});
