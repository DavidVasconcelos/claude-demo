(() => {
  'use strict';

  const STORAGE_KEY = 'futureMe.capsules.v1';
  const THEME_KEY = 'futureMe.theme';

  const QUOTES = [
    ['The best way to predict the future is to create it.', 'Peter Drucker'],
    ['A year from now you may wish you had started today.', 'Karen Lamb'],
    ['The future depends on what you do today.', 'Mahatma Gandhi'],
    ['Do something today that your future self will thank you for.', 'Sean Patrick Flanery'],
    ['It always seems impossible until it’s done.', 'Nelson Mandela'],
    ['You are never too old to set another goal or to dream a new dream.', 'C.S. Lewis'],
    ['Small steps every day lead to big changes.', 'Unknown'],
    ['Believe you can and you’re halfway there.', 'Theodore Roosevelt'],
    ['The only way to do great work is to love what you do.', 'Steve Jobs'],
    ['Dream big. Start small. Act now.', 'Robin Sharma'],
    ['The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt'],
    ['Whatever you are, be a good one.', 'Abraham Lincoln'],
    ['The secret of getting ahead is getting started.', 'Mark Twain'],
    ['Don’t watch the clock; do what it does. Keep going.', 'Sam Levenson'],
    ['The journey of a thousand miles begins with a single step.', 'Lao Tzu'],
    ['What you do today can improve all your tomorrows.', 'Ralph Marston'],
    ['Act as if what you do makes a difference. It does.', 'William James'],
    ['The best time to plant a tree was twenty years ago. The second best time is now.', 'Chinese Proverb'],
    ['Your future is created by what you do today, not tomorrow.', 'Robert Kiyosaki'],
    ['Success is the sum of small efforts, repeated day in and day out.', 'Robert Collier'],
    ['Life can only be understood backwards; but it must be lived forwards.', 'Søren Kierkegaard'],
    ['We are what we repeatedly do. Excellence, then, is not an act, but a habit.', 'Will Durant'],
    ['Courage is not the absence of fear, but the triumph over it.', 'Nelson Mandela'],
    ['Do what you can, with what you have, where you are.', 'Theodore Roosevelt'],
    ['Tomorrow belongs to those who prepare for it today.', 'Malcolm X'],
    ['In the middle of difficulty lies opportunity.', 'Albert Einstein'],
    ['Write it on your heart that every day is the best day in the year.', 'Ralph Waldo Emerson'],
    ['The only limit to our realization of tomorrow is our doubts of today.', 'Franklin D. Roosevelt'],
    ['Patience is bitter, but its fruit is sweet.', 'Aristotle'],
    ['Well done is better than well said.', 'Benjamin Franklin'],
  ];

  const $ = (id) => document.getElementById(id);
  const form = $('capsuleForm');
  const nameEl = $('name');
  const msgEl = $('message');
  const unlockEl = $('unlock');
  const listEl = $('list');
  const emptyEl = $('empty');
  const statsEl = $('stats');

  let capsules = load();
  const opened = new Set(); // ids already rendered as open this session

  /* ---------- storage ---------- */
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules)); }
    catch { toast('Could not save — storage may be full or disabled.'); }
  }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    $('themeToggle').textContent = t === 'dark' ? '🌙' : '☀️';
  }
  const savedTheme = localStorage.getItem(THEME_KEY) ||
    (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(savedTheme);
  $('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ---------- quotes ---------- */
  let quoteIdx = Math.floor(Math.random() * QUOTES.length);
  function showQuote(animate) {
    const fig = $('quote');
    const set = () => {
      const [q, a] = QUOTES[quoteIdx];
      $('quoteText').textContent = `“${q}”`;
      $('quoteAuthor').textContent = `— ${a}`;
      fig.classList.remove('swap');
    };
    if (!animate) return set();
    fig.classList.add('swap');
    setTimeout(set, 350);
  }
  $('newQuote').addEventListener('click', () => {
    quoteIdx = (quoteIdx + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length;
    showQuote(true);
  });
  showQuote(false);

  /* ---------- form ---------- */
  function toLocalInput(d) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function refreshMin() { unlockEl.min = toLocalInput(new Date(Date.now() + 60000)); }
  refreshMin();

  document.querySelectorAll('.presets button').forEach((b) =>
    b.addEventListener('click', () => {
      const d = new Date();
      d.setDate(d.getDate() + Number(b.dataset.days));
      unlockEl.value = toLocalInput(d);
      setError('unlock', '');
    }));

  msgEl.addEventListener('input', () => { $('charCount').textContent = msgEl.value.length; });
  [nameEl, msgEl, unlockEl].forEach((el) => el.addEventListener('input', () => setError(el.id, '')));

  function setError(field, text) {
    document.querySelector(`.error[data-for="${field}"]`).textContent = text;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    refreshMin();
    const name = nameEl.value.trim();
    const message = msgEl.value.trim();
    const unlockAt = new Date(unlockEl.value).getTime();
    let ok = true;

    if (!name) { setError('name', 'Please enter your name.'); ok = false; }
    if (!message) { setError('message', 'Write something for your future self.'); ok = false; }
    if (!unlockEl.value || isNaN(unlockAt)) { setError('unlock', 'Pick a date and time.'); ok = false; }
    else if (unlockAt <= Date.now()) { setError('unlock', 'The date must be in the future.'); ok = false; }
    if (!ok) return;

    capsules.push({
      id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now() + Math.random()),
      name, message, unlockAt, createdAt: Date.now(),
    });
    save();
    form.reset();
    $('charCount').textContent = '0';
    toast('Sealed! See you in the future 🚀');
    render();
    listEl.firstElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- rendering ---------- */
  const fmtDate = (t) => new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  function parts(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return {
      d: Math.floor(s / 86400),
      h: Math.floor((s % 86400) / 3600),
      m: Math.floor((s % 3600) / 60),
      s: s % 60,
    };
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function buildCard(c) {
    const card = el('article', 'capsule');
    card.dataset.id = c.id;

    const head = el('div', 'capsule-head');
    const info = el('div');
    info.append(
      el('div', 'capsule-title', `Letter from ${c.name}`),
      el('div', 'capsule-meta', `Written ${fmtDate(c.createdAt)} · Opens ${fmtDate(c.unlockAt)}`),
    );
    const right = el('div');
    right.style.cssText = 'display:flex;gap:6px;align-items:center';
    const badge = el('span', 'badge');
    badge.dataset.role = 'badge';
    const del = el('button', 'del', '✕');
    del.title = 'Delete';
    del.setAttribute('aria-label', 'Delete letter');
    del.addEventListener('click', () => remove(c.id, card));
    right.append(badge, del);
    head.append(info, right);

    const body = el('div');
    body.dataset.role = 'body';
    card.append(head, body);
    return card;
  }

  function fillLocked(card, c) {
    const body = card.querySelector('[data-role=body]');
    body.replaceChildren();

    const cd = el('div', 'countdown');
    ['d', 'h', 'm', 's'].forEach((k, i) => {
      const box = el('div');
      const b = el('b', '', '0');
      b.dataset.unit = k;
      box.append(b, el('span', '', ['days', 'hrs', 'min', 'sec'][i]));
      cd.append(box);
    });

    const bar = el('div', 'progress');
    bar.append(el('i'));
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');

    const label = el('div', 'progress-label');
    label.append(el('span', '', 'Journey to unlock'), el('span'));
    label.lastChild.dataset.role = 'pct';

    const sealed = el('div', 'sealed');
    const lock = el('span', 'lock', '🔒');
    sealed.append(lock, ' Your message is sealed until the countdown ends.');

    body.append(cd, bar, label, sealed);
    const badge = card.querySelector('[data-role=badge]');
    badge.className = 'badge locked';
    badge.textContent = 'Locked';
  }

  function fillOpen(card, c, animate) {
    const body = card.querySelector('[data-role=body]');
    body.replaceChildren();
    const box = el('div', 'revealed' + (animate ? ' reveal-anim' : ''));
    box.append(document.createTextNode(c.message), el('span', 'from', `— ${c.name}, past you`));
    body.append(box);
    const badge = card.querySelector('[data-role=badge]');
    badge.className = 'badge open';
    badge.textContent = 'Unlocked';
    if (animate) {
      card.classList.add('just-opened');
      confetti();
    }
  }

  function updateCard(card, c, now) {
    const isOpen = now >= c.unlockAt;
    const wasOpen = opened.has(c.id);
    const state = card.dataset.state;

    if (isOpen) {
      if (state !== 'open') {
        // animate only when it flips live while the page is open
        const live = state === 'locked';
        card.dataset.state = 'open';
        opened.add(c.id);
        fillOpen(card, c, live || !wasOpen);
      }
      return;
    }

    if (state !== 'locked') {
      card.dataset.state = 'locked';
      fillLocked(card, c);
    }
    const p = parts(c.unlockAt - now);
    card.querySelector('[data-unit=d]').textContent = p.d;
    card.querySelector('[data-unit=h]').textContent = String(p.h).padStart(2, '0');
    card.querySelector('[data-unit=m]').textContent = String(p.m).padStart(2, '0');
    card.querySelector('[data-unit=s]').textContent = String(p.s).padStart(2, '0');

    const pct = Math.min(100, Math.max(0, ((now - c.createdAt) / (c.unlockAt - c.createdAt)) * 100));
    card.querySelector('.progress i').style.width = pct + '%';
    card.querySelector('.progress').setAttribute('aria-valuenow', pct.toFixed(0));
    card.querySelector('[data-role=pct]').textContent = pct.toFixed(1) + '%';
  }

  function render() {
    const existing = new Map([...listEl.children].map((n) => [n.dataset.id, n]));
    // Locked first (soonest first), then opened (most recent first)
    const now = Date.now();
    const sorted = [...capsules].sort((a, b) => {
      const ao = a.unlockAt <= now, bo = b.unlockAt <= now;
      if (ao !== bo) return ao ? 1 : -1;
      return ao ? b.unlockAt - a.unlockAt : a.unlockAt - b.unlockAt;
    });

    sorted.forEach((c, i) => {
      let card = existing.get(c.id);
      if (!card) card = buildCard(c);
      existing.delete(c.id);
      if (listEl.children[i] !== card) listEl.insertBefore(card, listEl.children[i] || null);
    });
    existing.forEach((n) => n.remove());

    // opened-on-load cards shouldn't replay the animation
    sorted.forEach((c) => {
      const card = listEl.querySelector(`[data-id="${CSS.escape(c.id)}"]`);
      if (card && !card.dataset.state && c.unlockAt <= now) opened.add(c.id), card.dataset.state = 'open', fillOpen(card, c, false);
    });

    tick();
    emptyEl.hidden = capsules.length > 0;
  }

  function tick() {
    const now = Date.now();
    let locked = 0, open = 0;
    capsules.forEach((c) => {
      const card = listEl.querySelector(`[data-id="${CSS.escape(c.id)}"]`);
      if (card) updateCard(card, c, now);
      c.unlockAt > now ? locked++ : open++;
    });
    statsEl.replaceChildren(
      el('span', 'pill', `🔒 ${locked} locked`),
      el('span', 'pill', `🔓 ${open} unlocked`),
    );
    refreshMin();
  }

  function remove(id, card) {
    if (!confirm('Delete this letter forever?')) return;
    capsules = capsules.filter((c) => c.id !== id);
    save();
    card.classList.add('removing');
    setTimeout(render, 350);
  }

  /* ---------- effects ---------- */
  function confetti() {
    const wrap = $('confetti');
    const colors = ['#8b7bff', '#38d6c4', '#ff7ac3', '#ffd166', '#6ab0ff'];
    for (let i = 0; i < 70; i++) {
      const b = el('span', 'bit');
      b.style.left = Math.random() * 100 + 'vw';
      b.style.background = colors[i % colors.length];
      b.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
      b.style.animationDuration = 2 + Math.random() * 2.5 + 's';
      b.style.animationDelay = Math.random() * 0.5 + 's';
      wrap.append(b);
      setTimeout(() => b.remove(), 5500);
    }
  }

  let toastTimer;
  function toast(text) {
    const t = $('toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  // keep multiple tabs in sync
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) { capsules = load(); render(); }
  });

  render();
  setInterval(tick, 1000);
})();
