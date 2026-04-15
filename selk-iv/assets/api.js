(function () {
  window.selkApi = {
    async fetch(path, opts = {}) {
      const token = localStorage.getItem('selk_token');
      const headers = { 'Content-Type': 'application/json', ...opts.headers };
      if (token) headers['Authorization'] = 'Bearer ' + token;
      const r = await fetch('/api' + path, { ...opts, headers });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'request_failed');
      return data;
    },

    isLoggedIn() {
      return !!localStorage.getItem('selk_token');
    },

    getUser() {
      try { return JSON.parse(localStorage.getItem('selk_user')); } catch { return null; }
    },

    logout() {
      localStorage.removeItem('selk_token');
      localStorage.removeItem('selk_user');
      window.location.href = 'index.html';
    },

    requireLogin() {
      if (!this.isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
      }
      return true;
    }
  };
})();
