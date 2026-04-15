(function () {
  const PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&q=80',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=80',
    'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=900&q=80',
    'https://images.unsplash.com/photo-1565891741441-64926e441838?w=900&q=80',
    'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=900&q=80',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=900&q=80',
  ];

  function ratingLabel(r) {
    if (r >= 9) return 'Excellent';
    if (r >= 8) return 'Very good';
    if (r >= 7) return 'Good';
    return 'Pleasant';
  }

  function typeLabel(t) {
    const map = { warehouse: 'Warehouse', container: 'Container', climate: 'Climate-controlled', basement: 'Basement', garage: 'Garage', outdoor: 'Outdoor' };
    return map[t] || t;
  }

  function renderCard(listing, idx) {
    const img = (listing.images && listing.images.length) ? listing.images[0] : PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length];
    const rating = parseFloat(listing.rating) || 0;
    const price = parseFloat(listing.price_sqm) || 0;
    const size = parseFloat(listing.size_sqm) || 0;
    const monthlyEst = (price * Math.min(size, 120)).toFixed(0);
    const pills = (listing.amenities || []).slice(0, 3);
    const starCount = Math.min(5, Math.max(1, Math.round(rating / 2)));
    const starSvg = '<svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-1z"/></svg>';

    return `<a href="listing.html?id=${listing.id}" class="listing-card">
      <div class="lc-media">
        <img src="${img}" alt="${listing.title}" loading="lazy">
        <button class="heart" aria-label="Save">
          <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>
        </button>
      </div>
      <div class="lc-info">
        <div class="title-row">
          <div class="title">${listing.title}</div>
          <span class="stars">${starSvg.repeat(starCount)}</span>
        </div>
        <div class="meta">
          <a>${listing.city}, ${listing.country}</a><span>·</span><span class="distance">${typeLabel(listing.type)}</span>
        </div>
        <div class="tag-row">
          ${listing.free_cancel ? '<span class="badge-free"><svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg>Free cancellation</span>' : ''}
          ${listing.insurance ? '<span class="badge-free"><svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg>Insurance included</span>' : ''}
        </div>
        <p class="blurb">${listing.description || ''}</p>
        <div class="signals">
          <span class="pill">${size.toLocaleString()} m²</span>
          ${pills.map(p => '<span class="pill">' + p + '</span>').join('')}
        </div>
      </div>
      <div class="lc-price">
        <div class="score-row">
          <div class="score-text">
            <span class="label">${ratingLabel(rating)}</span>
            <span class="count">${listing.review_count || 0} reviews</span>
          </div>
          <span class="score-badge">${rating.toFixed(1)}</span>
        </div>
        <span class="price-note">per m² / month</span>
        <span class="price">€${price.toFixed(2)}<small>EUR</small></span>
        <span class="taxes">Est. €${monthlyEst}/mo for 120 m²</span>
        <button class="cta-btn">See availability →</button>
      </div>
    </a>`;
  }

  function renderPagination(data, container, loadFn) {
    if (data.pages <= 1) return;
    let html = '<div class="pagination" style="display:flex;justify-content:center;gap:8px;margin-top:24px;">';
    for (let i = 1; i <= data.pages && i <= 10; i++) {
      const active = i === data.page ? 'font-weight:800;background:var(--bk-cta);color:#fff;' : 'background:var(--bk-50);';
      html += `<button onclick="window._selkLoadPage(${i})" style="border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:14px;${active}">${i}</button>`;
    }
    html += '</div>';
    container.insertAdjacentHTML('afterend', html);
  }

  // Featured listings on index.html
  async function loadFeatured() {
    const el = document.getElementById('featured-listings');
    if (!el) return;
    try {
      const data = await window.selkApi.fetch('/listings?limit=6&sort=rating');
      el.innerHTML = data.listings.map((l, i) => renderCard(l, i)).join('');
      const countEl = document.getElementById('listing-count');
      if (countEl) countEl.textContent = data.total;
    } catch (e) {
      console.error('Failed to load listings:', e);
    }
  }

  // Search results on search.html
  async function loadSearch(page) {
    const el = document.getElementById('search-results');
    if (!el) return;

    const params = new URLSearchParams(window.location.search);
    if (page) params.set('page', page);

    const filterForm = document.getElementById('search-filters');
    if (filterForm) {
      const fd = new FormData(filterForm);
      for (const [k, v] of fd.entries()) {
        if (v) params.set(k, v);
      }
    }

    el.innerHTML = '<p style="text-align:center;padding:40px;color:var(--muted);">Loading...</p>';

    // Remove old pagination
    const oldPag = document.querySelector('.pagination');
    if (oldPag) oldPag.remove();

    try {
      const data = await window.selkApi.fetch('/listings?' + params.toString());
      if (!data.listings.length) {
        el.innerHTML = '<p style="text-align:center;padding:40px;color:var(--muted);">No listings found. Try adjusting your filters.</p>';
        return;
      }
      el.innerHTML = data.listings.map((l, i) => renderCard(l, i)).join('');
      renderPagination(data, el, loadSearch);

      const countEl = document.getElementById('result-count');
      if (countEl) countEl.textContent = data.total + ' spaces found';
    } catch (e) {
      el.innerHTML = '<p style="text-align:center;padding:40px;color:var(--bk-red);">Failed to load results.</p>';
      console.error(e);
    }
  }

  window._selkLoadPage = function (p) { loadSearch(p); };

  // Listing detail on listing.html
  async function loadDetail() {
    const el = document.getElementById('listing-detail');
    if (!el) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { el.innerHTML = '<p>Listing not found.</p>'; return; }

    try {
      const data = await window.selkApi.fetch('/listings/' + id);
      const l = data.listing;
      const img = (l.images && l.images.length) ? l.images[0] : PLACEHOLDER_IMAGES[0];
      const rating = parseFloat(l.rating) || 0;
      const price = parseFloat(l.price_sqm) || 0;
      const size = parseFloat(l.size_sqm) || 0;

      el.innerHTML = `
        <div class="listing-hero" style="position:relative;border-radius:16px;overflow:hidden;height:400px;margin-bottom:32px;">
          <img src="${img}" alt="${l.title}" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 360px;gap:32px;">
          <div>
            <h1 style="font-size:28px;margin-bottom:8px;">${l.title}</h1>
            <p style="color:var(--muted);margin-bottom:20px;">${l.city}, ${l.country} · ${typeLabel(l.type)} · ${size.toLocaleString()} m²</p>
            <div style="display:flex;gap:8px;margin-bottom:20px;">
              <span class="score-badge" style="font-size:16px;padding:6px 10px;">${rating.toFixed(1)}</span>
              <span style="font-weight:600;">${ratingLabel(rating)}</span>
              <span style="color:var(--muted);">· ${l.review_count || 0} reviews</span>
            </div>
            <p style="line-height:1.7;margin-bottom:24px;">${l.description || ''}</p>
            <h3 style="margin-bottom:12px;">Amenities</h3>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px;">
              ${(l.amenities || []).map(a => '<span class="pill">' + a + '</span>').join('')}
            </div>
            <div id="listing-reviews"></div>
          </div>
          <div>
            <div class="form-panel" style="position:sticky;top:24px;">
              <div style="font-size:28px;font-weight:800;margin-bottom:4px;">€${price.toFixed(2)} <small style="font-size:14px;font-weight:400;color:var(--muted);">per m² / month</small></div>
              ${l.free_cancel ? '<p style="color:var(--bk-green);font-size:13px;font-weight:600;margin-bottom:16px;">Free cancellation available</p>' : ''}
              <a href="booking.html?listing=${l.id}" class="btn btn-primary lg" style="width:100%;text-align:center;">Book this space</a>
            </div>
          </div>
        </div>`;

      // Load reviews
      try {
        const revData = await window.selkApi.fetch('/listings/' + id + '/reviews');
        const revEl = document.getElementById('listing-reviews');
        if (revEl && revData.reviews.length) {
          revEl.innerHTML = '<h3 style="margin-bottom:16px;">Reviews</h3>' +
            revData.reviews.map(r => `
              <div style="padding:16px 0;border-top:1px solid var(--bk-100);">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <strong>${r.reviewer}</strong>
                  <span class="score-badge" style="font-size:12px;padding:3px 8px;">${r.rating}/10</span>
                </div>
                <p style="color:var(--muted);font-size:14px;">${r.comment || ''}</p>
              </div>`).join('');
        }
      } catch (e) { console.error(e); }
    } catch (e) {
      el.innerHTML = '<p style="padding:40px;text-align:center;">Listing not found or unavailable.</p>';
      console.error(e);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadFeatured();
    loadSearch();
    loadDetail();
  });
})();
