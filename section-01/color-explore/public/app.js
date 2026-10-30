const grid = document.getElementById('grid');
const recentEl = document.getElementById('recent');
const searchEl = document.getElementById('search');
const emptyEl = document.getElementById('empty');
const toastEl = document.getElementById('toast');
const themeBtn = document.getElementById('theme-toggle');

let colors = [];

// ---------- color helpers ----------
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function textColorFor({ r, g, b }) {
  const lin = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.179 ? '#14151f' : '#ffffff';
}

// ---------- rendering ----------
function render(list) {
  grid.innerHTML = '';
  list.forEach((c) => {
    const rgb = hexToRgb(c.hex);
    const hsl = rgbToHsl(rgb);
    const card = document.createElement('button');
    card.className = 'card';
    card.style.background = c.hex;
    card.style.color = textColorFor(rgb);
    card.innerHTML = `
      <div class="name"></div>
      <div class="value">${c.hex.toUpperCase()}</div>
      <div class="value">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</div>
      <div class="value">hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</div>`;
    card.querySelector('.name').textContent = c.name;
    card.addEventListener('click', () => selectColor(c));
    grid.appendChild(card);
  });
  emptyEl.hidden = list.length > 0;
}

function renderRecent(list) {
  recentEl.innerHTML = '';
  if (!list.length) {
    recentEl.innerHTML = '<span class="muted">Click a color to see it here.</span>';
    return;
  }
  list.forEach((c) => {
    const s = document.createElement('button');
    s.className = 'swatch';
    s.style.background = c.hex;
    s.title = `${c.name} ${c.hex}`;
    s.setAttribute('aria-label', `${c.name} ${c.hex}`);
    s.addEventListener('click', () => applyBackground(c.hex));
    recentEl.appendChild(s);
  });
}

// ---------- actions ----------
function applyBackground(hex) {
  document.body.style.backgroundColor = hex;
  document.body.style.color = textColorFor(hexToRgb(hex));
}

let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

async function selectColor(c) {
  applyBackground(c.hex);
  copyText(c.hex);
  showToast('Copied HEX to clipboard!');
  try {
    await fetch('/api/clicks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hex: c.hex }),
    });
    loadRecent();
  } catch (err) {
    console.error('Could not save click', err);
  }
}

async function loadRecent() {
  try {
    renderRecent(await (await fetch('/api/clicks/recent')).json());
  } catch (err) {
    console.error(err);
  }
}

// ---------- search ----------
searchEl.addEventListener('input', () => {
  const q = searchEl.value.trim().toLowerCase().replace(/^#/, '');
  render(colors.filter((c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().slice(1).includes(q)));
});

// ---------- theme ----------
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}
themeBtn.addEventListener('click', () => {
  // Reset any chosen color background so the theme change is visible.
  document.body.style.backgroundColor = '';
  document.body.style.color = '';
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
setTheme(localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

// ---------- init ----------
(async function init() {
  colors = await (await fetch('/api/colors')).json();
  render(colors);
  loadRecent();
})();
