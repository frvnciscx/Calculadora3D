/* ===== TEMA =====
   Cada navegador guarda su propio tema en c3d_tema, fuera de los ajustes de la
   cuenta (D122). Mientras la persona no elige, sigue al navegador: claro u
   oscuro según el sistema. El interruptor de la barra lateral lo fija en claro
   u oscuro; en Ajustes › Otros se puede volver a «Auto».
   Antes vivía en config.theme: se subía a la nube con cada cambio y empezaba
   en oscuro. */
var CLAVE_TEMA = 'c3d_tema';

function _temaElegido() {
  try {
    var t = localStorage.getItem(CLAVE_TEMA);
    if (t === 'light' || t === 'dark') return t;
  } catch (e) {}
  return 'auto';
}

/* Una sola vez: antes el tema empezaba en oscuro, así que «Claro» solo pudo
   elegirlo la persona y se respeta; «Oscuro» pudo ser el de inicio y pasa a
   automático. */
(function _migrarTema() {
  try {
    if (localStorage.getItem('c3d_temaMigrado')) return;
    localStorage.setItem('c3d_temaMigrado', '1');
    if (typeof config !== 'undefined' && config && config.theme === 'light' && !localStorage.getItem(CLAVE_TEMA)) {
      localStorage.setItem(CLAVE_TEMA, 'light');
    }
  } catch (e) {}
})();

function setTheme(mode) {
  try {
    if (mode === 'light' || mode === 'dark') localStorage.setItem(CLAVE_TEMA, mode);
    else localStorage.removeItem(CLAVE_TEMA);
  } catch (e) {}
  applyTheme();
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  setTheme(cur === 'dark' ? 'light' : 'dark');
}

function applyTheme() {
  const elegido = _temaElegido();
  const efectivo = elegido === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : elegido;
  document.documentElement.setAttribute('data-theme', efectivo);
  document.body.setAttribute('data-theme', efectivo); /* compat legacy selectors */

  /* Ícono del botón de tema de la barra superior (teléfono) */
  const el = document.getElementById('theme-icon-topbar');
  if (el) el.textContent = efectivo === 'dark' ? 'light_mode' : 'dark_mode';

  const metaEl = document.getElementById('meta-theme');
  if (metaEl) metaEl.content = efectivo === 'dark' ? '#0a0a0a' : '#fafafa';

  /* Ajustes › Otros: Claro, Oscuro o Auto */
  document.querySelectorAll('.theme-segment button').forEach(function(b) {
    const activo = b.dataset.tema === elegido;
    b.classList.toggle('active', activo);
    b.setAttribute('aria-pressed', activo ? 'true' : 'false');
  });

  /* Barra lateral: el interruptor está encendido con el tema oscuro */
  document.querySelectorAll('.tema-switch-fila').forEach(function(b) {
    b.setAttribute('aria-checked', efectivo === 'dark' ? 'true' : 'false');
  });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (_temaElegido() === 'auto') applyTheme();
});
