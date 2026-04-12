/* ===== THEME MANAGEMENT ===== */
function setTheme(mode) {
  config.theme = mode;
  sv('config', config);
  applyTheme();
}

function toggleTheme() {
  const cur = document.body.getAttribute('data-theme');
  setTheme(cur === 'dark' ? 'light' : 'dark');
}

function applyTheme() {
  let effective = config.theme;
  if (effective === 'auto') {
    effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.body.setAttribute('data-theme', effective);
  document.getElementById('theme-icon').textContent = effective === 'dark' ? 'light_mode' : 'dark_mode';
  document.getElementById('meta-theme').content = effective === 'dark' ? '#0E0C1A' : '#EAEAF4';
  document.querySelectorAll('.theme-segment button').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('theme-' + config.theme + '-btn');
  if (btn) btn.classList.add('active');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (config.theme === 'auto') applyTheme();
});
