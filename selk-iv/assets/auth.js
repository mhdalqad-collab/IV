(function () {
  const API = '/api/auth';

  async function post(path, body) {
    const r = await fetch(API + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'request_failed');
    return data;
  }

  function setAuth(data) {
    localStorage.setItem('selk_token', data.token);
    localStorage.setItem('selk_user', JSON.stringify(data.user));
  }

  function showError(form, msg) {
    let el = form.querySelector('.auth-err');
    if (!el) {
      el = document.createElement('div');
      el.className = 'auth-err';
      el.style.cssText = 'background:var(--bk-red-soft);color:var(--bk-red);padding:10px 12px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:12px;';
      form.prepend(el);
    }
    const map = {
      email_taken: 'That email is already registered.',
      invalid_credentials: 'Email or password is incorrect.',
      invalid_email: 'Please enter a valid email.',
      password_min_8: 'Password must be at least 8 characters.',
    };
    el.textContent = map[msg] || 'Something went wrong. Please try again.';
  }

  function bind(formId, path) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value;
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      const orig = btn.textContent;
      btn.textContent = 'Please wait…';
      try {
        const data = await post(path, { email, password });
        setAuth(data);
        window.location.href = 'index.html';
      } catch (err) {
        showError(form, err.message);
        btn.disabled = false;
        btn.textContent = orig;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind('signup-form', '/signup');
    bind('login-form', '/login');
  });
})();
