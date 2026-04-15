(function () {
  async function initBooking() {
    const form = document.getElementById('booking-form');
    if (!form) return;
    if (!window.selkApi.requireLogin()) return;

    const params = new URLSearchParams(window.location.search);
    const listingId = params.get('listing');
    if (!listingId) { document.getElementById('booking-summary').textContent = 'No listing selected.'; return; }

    // Load listing info
    try {
      const data = await window.selkApi.fetch('/listings/' + listingId);
      const l = data.listing;
      const summaryEl = document.getElementById('booking-summary');
      if (summaryEl) {
        summaryEl.innerHTML = `
          <h3 style="margin-bottom:8px;">${l.title}</h3>
          <p style="color:var(--muted);font-size:14px;margin-bottom:4px;">${l.city}, ${l.country}</p>
          <p style="font-weight:700;font-size:18px;">€${parseFloat(l.price_sqm).toFixed(2)} <span style="font-size:13px;font-weight:400;color:var(--muted);">per m² / month</span></p>
        `;
      }

      // Set max size
      const sizeInput = form.querySelector('[name="size_sqm"]');
      if (sizeInput) sizeInput.max = l.size_sqm;

      // Calculate price on input change
      function updatePrice() {
        const size = parseFloat(form.querySelector('[name="size_sqm"]').value) || 0;
        const start = new Date(form.querySelector('[name="start_date"]').value);
        const end = new Date(form.querySelector('[name="end_date"]').value);
        const priceEl = document.getElementById('booking-price');
        if (!priceEl || isNaN(start) || isNaN(end) || end <= start) {
          if (priceEl) priceEl.textContent = '';
          return;
        }
        const months = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30)));
        const total = (parseFloat(l.price_sqm) * size * months).toFixed(2);
        priceEl.innerHTML = `<strong>Estimated total: €${total}</strong> <span style="color:var(--muted);font-size:13px;">(${months} month${months > 1 ? 's' : ''} × ${size} m²)</span>`;
      }
      form.addEventListener('input', updatePrice);

      // Submit
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Please wait...';

        try {
          const body = {
            listing_id: parseInt(listingId),
            start_date: form.querySelector('[name="start_date"]').value,
            end_date: form.querySelector('[name="end_date"]').value,
            size_sqm: parseFloat(form.querySelector('[name="size_sqm"]').value),
            notes: form.querySelector('[name="notes"]')?.value || '',
          };
          const result = await window.selkApi.fetch('/bookings', {
            method: 'POST',
            body: JSON.stringify(body),
          });

          form.innerHTML = `
            <div style="text-align:center;padding:32px 0;">
              <div style="font-size:48px;margin-bottom:12px;">&#10003;</div>
              <h2 style="margin-bottom:8px;">Booking confirmed!</h2>
              <p style="color:var(--muted);margin-bottom:20px;">Booking #${result.booking.id} has been submitted. The space owner will confirm shortly.</p>
              <a href="index.html" class="btn btn-primary">Back to homepage</a>
            </div>`;
        } catch (err) {
          const errMap = {
            listing_not_found: 'This listing is no longer available.',
            cannot_book_own: 'You cannot book your own listing.',
            invalid_dates: 'Please select valid dates.',
            invalid_size: 'Please enter a valid size.',
          };
          let errEl = form.querySelector('.booking-err');
          if (!errEl) {
            errEl = document.createElement('div');
            errEl.className = 'booking-err';
            errEl.style.cssText = 'background:var(--bk-red-soft);color:var(--bk-red);padding:10px 12px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:12px;';
            form.prepend(errEl);
          }
          errEl.textContent = errMap[err.message] || 'Something went wrong. Please try again.';
          btn.disabled = false;
          btn.textContent = 'Confirm booking';
        }
      });
    } catch (e) {
      document.getElementById('booking-summary').textContent = 'Failed to load listing.';
      console.error(e);
    }
  }

  document.addEventListener('DOMContentLoaded', initBooking);
})();
