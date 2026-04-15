(function () {
  async function initDashboard() {
    if (!document.getElementById('dash-stats')) return;
    if (!window.selkApi.requireLogin()) return;

    // Load stats
    try {
      const stats = await window.selkApi.fetch('/dashboard/stats');
      const el = document.getElementById('dash-stats');
      el.innerHTML = `
        <div class="kpi"><div class="label">Active listings</div><div class="value">${stats.listings.active}</div></div>
        <div class="kpi"><div class="label">Total bookings</div><div class="value">${stats.bookings.total}</div></div>
        <div class="kpi"><div class="label">Pending</div><div class="value">${stats.bookings.pending}</div></div>
        <div class="kpi"><div class="label">Revenue</div><div class="value">€${Number(stats.revenue).toLocaleString()}</div></div>
      `;
    } catch (e) { console.error(e); }

    // Load my listings
    try {
      const data = await window.selkApi.fetch('/dashboard/listings');
      const el = document.getElementById('dash-listings');
      if (!el) return;
      if (!data.listings.length) {
        el.innerHTML = '<p style="color:var(--muted);padding:20px 0;">You have no listings yet. Create one below.</p>';
      } else {
        el.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead><tr style="text-align:left;border-bottom:2px solid var(--bk-100);">
            <th style="padding:10px 8px;">Title</th><th>City</th><th>Type</th><th>Size</th><th>Price/m²</th><th>Bookings</th><th>Status</th>
          </tr></thead>
          <tbody>${data.listings.map(l => `
            <tr style="border-bottom:1px solid var(--bk-50);">
              <td style="padding:10px 8px;font-weight:600;"><a href="listing.html?id=${l.id}">${l.title}</a></td>
              <td>${l.city}</td>
              <td>${l.type}</td>
              <td>${parseFloat(l.size_sqm).toLocaleString()} m²</td>
              <td>€${parseFloat(l.price_sqm).toFixed(2)}</td>
              <td>${l.booking_count}</td>
              <td><span style="color:${l.is_active ? 'var(--bk-green)' : 'var(--muted)'};">${l.is_active ? 'Active' : 'Inactive'}</span></td>
            </tr>`).join('')}
          </tbody></table>`;
      }
    } catch (e) { console.error(e); }

    // Load reservations
    try {
      const data = await window.selkApi.fetch('/dashboard/reservations');
      const el = document.getElementById('dash-reservations');
      if (!el) return;
      if (!data.reservations.length) {
        el.innerHTML = '<p style="color:var(--muted);padding:20px 0;">No reservations yet.</p>';
      } else {
        el.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead><tr style="text-align:left;border-bottom:2px solid var(--bk-100);">
            <th style="padding:10px 8px;">Listing</th><th>Renter</th><th>Dates</th><th>Size</th><th>Total</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>${data.reservations.map(r => `
            <tr style="border-bottom:1px solid var(--bk-50);">
              <td style="padding:10px 8px;font-weight:600;">${r.listing_title}</td>
              <td>${r.renter_email}</td>
              <td>${r.start_date.slice(0, 10)} → ${r.end_date.slice(0, 10)}</td>
              <td>${parseFloat(r.size_sqm).toLocaleString()} m²</td>
              <td>€${parseFloat(r.total_price).toLocaleString()}</td>
              <td><span style="text-transform:capitalize;font-weight:600;color:${r.status === 'confirmed' ? 'var(--bk-green)' : r.status === 'cancelled' ? 'var(--bk-red)' : 'var(--bk-amber)'};">${r.status}</span></td>
              <td>${r.status === 'pending' ? `<button onclick="confirmBooking(${r.id})" class="btn btn-primary" style="font-size:12px;padding:4px 12px;">Confirm</button>` : ''}</td>
            </tr>`).join('')}
          </tbody></table>`;
      }
    } catch (e) { console.error(e); }

    // Create listing form
    const form = document.getElementById('create-listing-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Creating...';
        try {
          const body = {
            title: form.querySelector('[name="title"]').value,
            description: form.querySelector('[name="description"]').value,
            type: form.querySelector('[name="type"]').value,
            city: form.querySelector('[name="city"]').value,
            country: form.querySelector('[name="country"]').value || 'OM',
            size_sqm: parseFloat(form.querySelector('[name="size_sqm"]').value),
            price_sqm: parseFloat(form.querySelector('[name="price_sqm"]').value),
            amenities: form.querySelector('[name="amenities"]').value.split(',').map(s => s.trim()).filter(Boolean),
            free_cancel: form.querySelector('[name="free_cancel"]')?.checked || false,
            insurance: form.querySelector('[name="insurance"]')?.checked || false,
          };
          await window.selkApi.fetch('/listings', { method: 'POST', body: JSON.stringify(body) });
          window.location.reload();
        } catch (err) {
          alert(err.message || 'Failed to create listing');
          btn.disabled = false;
          btn.textContent = 'Create listing';
        }
      });
    }
  }

  window.confirmBooking = async function (id) {
    try {
      await window.selkApi.fetch('/bookings/' + id + '/confirm', { method: 'PATCH' });
      window.location.reload();
    } catch (e) { alert(e.message || 'Failed to confirm'); }
  };

  document.addEventListener('DOMContentLoaded', initDashboard);
})();
