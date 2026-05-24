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
  document.documentElement.setAttribute('data-theme', effective);
  document.body.setAttribute('data-theme', effective); /* compat legacy selectors */

  /* Actualizar todos los iconos de toggle de tema */
  const iconLabel = effective === 'dark' ? 'light_mode' : 'dark_mode';
  ['theme-icon-topbar', 'theme-icon-sidebar'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = iconLabel;
  });

  const metaEl = document.getElementById('meta-theme');
  if (metaEl) metaEl.content = effective === 'dark' ? '#0a0a0a' : '#fafafa';

  /* Sincronizar seg de apariencia */
  document.querySelectorAll('.theme-segment button').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('theme-' + (config.theme || 'dark') + '-btn');
  if (btn) btn.classList.add('active');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (config.theme === 'auto') applyTheme();
});
