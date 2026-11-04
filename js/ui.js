/* ===== UI HELPERS ===== */
function snack(msg) {
  const old = document.querySelector('.m3-snackbar');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'm3-snackbar';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function closeModal() {
  document.getElementById('modal-container').innerHTML = '';
}

/* M3 Confirm Dialog — reemplaza al confirm() del navegador.
   opts (opcional): { confirmLabel, icon, detail }
     confirmLabel — texto del botón de acción (default 'Eliminar')
     icon         — símbolo de Material (default 'warning')
     detail       — línea secundaria con el detalle de lo que va a pasar */
function m3Confirm(message, onConfirm, opts) {
  opts = opts || {};
  var label  = opts.confirmLabel || 'Eliminar';
  var icon   = opts.icon         || 'warning';
  var detail = opts.detail       || '';

  document.getElementById('modal-container').innerHTML =
    '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-dialog">' +
      '<span class="material-symbols-rounded" style="font-size:24px;color:var(--md-error);margin-bottom:16px">' + icon + '</span>' +
      '<h3 style="font-size:24px;font-weight:400;margin-bottom:' + (detail ? '12px' : '16px') + '">' + message + '</h3>' +
      (detail
        ? '<div style="font-size:13px;color:var(--ink-3);line-height:1.6;margin-bottom:16px;text-align:left">' + detail + '</div>'
        : '') +
      '<div class="m3-dialog-actions">' +
        '<button class="m3-btn-text" onclick="closeModal()">Cancelar</button>' +
        '<button class="m3-btn-filled" style="background:var(--md-error);color:var(--md-on-error);width:auto;padding:0 24px" id="m3-confirm-btn">' + label + '</button>' +
      '</div>' +
    '</div>';
  document.getElementById('m3-confirm-btn').onclick = function() { closeModal(); onConfirm(); };
}

/* Sub-páginas de config + quote-editor como sub-página virtual */
var _CFG_SUBPAGES = ['negocio','banco','electrico','gastos','indirectos','otros'];

/* Resuelve el ID del elemento en el DOM para cada sub-página */
function _cfgSubPageId(name) {
  return name === 'quote-editor' ? 'page-quote-editor' : 'page-config-' + name;
}

/* Devuelve al <body> cualquier sub-página movida al container */
function _cleanConfigDesktop() {
  var container = document.getElementById('cfg-subpage-container');
  if (container) {
    Array.from(container.children).forEach(function(child) {
      if (child.id && (child.id.indexOf('page-config-') === 0 || child.id === 'page-quote-editor')) {
        child.style.display = '';
        document.body.appendChild(child);
      }
    });
    container.style.display = 'none';
  }
  var cfgEl = document.getElementById('page-config');
  if (cfgEl) {
    /* Limpiar TODOS los inline styles de posicionamiento */
    cfgEl.style.display       = '';
    cfgEl.style.position      = '';
    cfgEl.style.top           = '';
    cfgEl.style.left          = '';
    cfgEl.style.right         = '';
    cfgEl.style.bottom        = '';
    cfgEl.style.flexDirection = '';
    cfgEl.style.background    = '';
    cfgEl.style.zIndex        = '';
    cfgEl.style.overflow      = '';
    cfgEl.style.padding       = '';
    cfgEl.style.margin        = '';
    cfgEl.classList.remove('active');
  }
}

/* ── De dónde venimos ──────────────────────────────────────────────
   El botón de atrás de la calculadora decía "Cotizaciones" y siempre
   llevaba ahí, aunque hubieras entrado desde Inicio o desde el catálogo.
   Ahora recuerda la página anterior y regresa a esa.
   El historial se excluye a propósito: tiene su propio botón de regreso
   que apunta a la calculadora, y guardarlo aquí haría un ciclo. */
var _paginaAnterior = 'quotes';

function regresarDeCalculadora() {
  showPage(_paginaAnterior || 'quotes');
}

function showPage(name) {
  /* ── Al salir de config en desktop: resetear inline styles ─────── */
  if (window.innerWidth >= 900) _cleanConfigDesktop();

  if (name === 'calc') {
    var _desde = document.body.dataset.page;
    if (_desde && _desde !== 'calc' && _desde !== 'history') _paginaAnterior = _desde;
  }

  /* ── Catálogo: sub-páginas antiguas → catálogo unificado ───────── */
  if (name === 'printers' || name === 'materials' || name === 'inventory') {
    var catTab = name === 'printers' ? 'printers' : name === 'materials' ? 'materials' : 'inventory';
    showPage('catalog');
    showCatalogTab(catTab);
    return;
  }

  /* ── Clientes: muestra page-quotes con tab clientes ────────────── */
  if (name === 'clients') {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav-item,.sidebar-item').forEach(function(b) { b.classList.remove('active'); });
    var qPage = document.getElementById('page-quotes');
    if (qPage) qPage.classList.add('active');
    document.body.dataset.page = 'clients';
    document.querySelectorAll('[data-page="clients"]').forEach(function(b) { b.classList.add('active'); });
    document.querySelectorAll('.m3-fab').forEach(function(f) { f.style.display = 'none'; });
    _showActionBtn('clients');
    showQuotesTab('clients');
    return;
  }

  /* ── Config en desktop: ir directo a primer sub-página ─────────── */
  if (name === 'config' && window.innerWidth >= 900) {
    showConfigPage('negocio');
    return;
  }

  /* ── Quote editor en desktop: integrar en panel de config ───────── */
  if (name === 'quote-editor' && window.innerWidth >= 900) {
    showConfigPage('quote-editor');
    return;
  }

  /* ── Flujo genérico ────────────────────────────────────────────── */
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));

  const pageEl = document.getElementById('page-' + name);
  if (!pageEl) { console.warn('Page not found:', name); return; }
  pageEl.classList.add('active');

  document.body.dataset.page = name;

  const navMap = {
    'quote-editor':    'quotes',
    'catalog':         'catalog',
    'config-negocio':  'config',
    'config-banco':    'config',
    'config-electrico':'config',
    'config-gastos':   'config',
    'config-otros':    'config',
  };
  const navPage = navMap[name] || name;
  document.querySelectorAll(`[data-page="${navPage}"]`).forEach(b => b.classList.add('active'));

  document.querySelectorAll('.m3-fab').forEach(f => f.style.display = 'none');

  _showActionBtn(name === 'quotes' ? (_activeQuotesTab || 'quotes') : name === 'catalog' ? 'catalog' : null);

  if (name === 'dashboard')    renderDashboard();
  if (name === 'catalog')      { showCatalogTab(_activeCatalogTab || 'printers'); }
  if (name === 'quotes')       { renderQuotes(); showQuotesTab('quotes'); }
  if (name === 'config' || name.indexOf('config-') === 0) loadConfig();
  /* setCalcMode('calc'): la calculadora siempre abre en modo calcular; la
     revisión de la cotización (escritorio) solo se abre con «Generar». */
  if (name === 'calc')         { setCalcMode('calc'); populateSelects(); restoreCalcResult(); refreshDraftIndicator(); initCalcLive(); renderPresets(); _updateResinParamsBlock(); _updateAMSBlock(); _updateSpoolSelector(); }
  if (name === 'history')      renderHistory();
  if (name === 'quote-editor') loadQuoteEditor();
}

/* ── Estado vacío: un solo botón, no dos ───────────────────────────
   Cuando una lista está vacía, su estado vacío ya trae el botón debajo
   de la explicación. El del encabezado (escritorio) y el de la barra
   inferior (móvil) apuntan a la misma acción, así que ahí sobran: la
   pantalla mostraba el mismo "Nueva cotización" dos veces sin que uno
   pesara más que el otro. Vuelven en cuanto hay registros.

   Las listas se registran solas al renderizarse, con marcarListaVacia(). */
var _listasVacias  = {};
var _contextoAccion = null;

function marcarListaVacia(lista, vacia) {
  _listasVacias[lista] = !!vacia;
  _showActionBtn(_contextoAccion);
}

/* El catálogo tiene un solo botón para tres listas: la que manda es la
   pestaña abierta. */
function _listaDelContexto(context) {
  return context === 'catalog' ? (_activeCatalogTab || 'printers') : context;
}

/* ── Barra de acción: muestra el botón correcto según contexto ─── */
function _showActionBtn(context) {
  _contextoAccion = context;
  var vacia = context ? !!_listasVacias[_listaDelContexto(context)] : false;
  /* [barra inferior en móvil, botón del encabezado en escritorio] */
  var btns = {
    quotes:  ['qa-btn-quotes',  'phdr-btn-quotes'],
    clients: ['qa-btn-clients', 'phdr-btn-clients'],
    catalog: ['qa-btn-catalog', 'phdr-btn-catalog'],
  };
  Object.keys(btns).forEach(function(k) {
    var visible = (k === context) && !vacia;
    btns[k].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = visible ? '' : 'none';
    });
  });
  /* La barra es un bloque con fondo y borde: sin botón adentro deja una
     franja flotando encima del contenido. */
  var bar = document.getElementById('page-action-bar');
  if (bar) bar.style.display = (context && !vacia) ? '' : 'none';
}

/* ── Catálogo — tab entre Impresoras / Materiales / Inventario ─── */
var _activeCatalogTab = 'printers';
var _catalogAddLabels  = { printers: 'Impresora',  materials: 'Material',   inventory: 'Filamento'  };
var _catalogHeadings   = { printers: 'Impresoras', materials: 'Materiales', inventory: 'Inventario' };
function showCatalogTab(tab) {
  _activeCatalogTab = tab;
  var panels = { printers: 'printer-list', materials: 'material-list', inventory: 'inventory-list' };
  var tabs   = { printers: 'cat-tab-printers', materials: 'cat-tab-materials', inventory: 'cat-tab-inventory' };
  Object.keys(panels).forEach(function(key) {
    var panelEl = document.getElementById(panels[key]);
    var tabEl   = document.getElementById(tabs[key]);
    if (panelEl) panelEl.style.display = key === tab ? '' : 'none';
    if (tabEl)   tabEl.classList.toggle('active', key === tab);
  });
  /* Etiqueta del botón agregar (móvil bottom-bar + desktop header) */
  var addLabel = _catalogAddLabels[tab] || 'Agregar';
  var mobileEl = document.getElementById('catalog-add-label');
  if (mobileEl) mobileEl.textContent = addLabel;
  var desktopEl = document.getElementById('catalog-header-label');
  if (desktopEl) desktopEl.textContent = addLabel;
  /* h1 en desktop: muestra la sección activa */
  var headingEl = document.getElementById('catalog-heading');
  if (headingEl) headingEl.textContent = _catalogHeadings[tab] || 'Catálogo';
  _showActionBtn('catalog');
  /* ── Sidebar: resaltar solo el ítem del tab activo ─── */
  document.querySelectorAll('.sidebar-item[data-tab],.sidebar-item[data-page="inventory"]')
    .forEach(function(b) { b.classList.remove('active'); });
  var sidebarTabMap = { printers: '[data-tab="printers"]', materials: '[data-tab="materials"]', inventory: '[data-page="inventory"]' };
  var activeBtn = document.querySelector('.sidebar-item' + (sidebarTabMap[tab] || ''));
  if (activeBtn) activeBtn.classList.add('active');
  /* ── Render ─── */
  if (tab === 'printers')  renderPrinters();
  if (tab === 'materials') renderMaterials();
  if (tab === 'inventory') renderInventory();
}

/* ── Catálogo — botón + del encabezado ─── */
function catalogAdd() {
  if (_activeCatalogTab === 'printers')  { showPrinterModal(); return; }
  if (_activeCatalogTab === 'materials') { showMaterialModal(); return; }
  if (_activeCatalogTab === 'inventory') { showInventoryModal(); return; }
}

/* ── Cotizaciones — tab entre Cotizaciones / Clientes ─── */
var _activeQuotesTab = 'quotes';
function showQuotesTab(tab) {
  _activeQuotesTab = tab;
  var quotesPanel    = document.getElementById('quotes-list');
  var clientsContent = document.getElementById('clients-tab-content');
  var filterChips    = document.getElementById('quotes-filter-chips');
  var searchWrap     = document.getElementById('quotes-search-wrap');
  var qtQuotes       = document.getElementById('qt-tab-quotes');
  var qtClients      = document.getElementById('qt-tab-clients');

  var isQuotes = tab === 'quotes';
  if (quotesPanel)    quotesPanel.style.display    = isQuotes ? '' : 'none';
  if (filterChips)    filterChips.style.display    = isQuotes ? '' : 'none';
  if (searchWrap)     searchWrap.style.display     = isQuotes ? '' : 'none';
  if (clientsContent) clientsContent.style.display = isQuotes ? 'none' : '';
  if (qtQuotes)       qtQuotes.classList.toggle('active',  isQuotes);
  if (qtClients)      qtClients.classList.toggle('active', !isQuotes);

  /* Actualizar título y botón de acción del header */
  var headingEl  = document.getElementById('quotes-heading');
  var eyebrowEl  = document.getElementById('quotes-eyebrow');
  var btnQuotes  = document.getElementById('phdr-btn-quotes');
  var btnClients = document.getElementById('phdr-btn-clients');
  if (headingEl)  headingEl.textContent  = isQuotes ? 'Cotizaciones' : 'Clientes';
  if (eyebrowEl)  eyebrowEl.textContent  = isQuotes ? 'Cotizaciones' : 'Directorio';
  if (btnQuotes)  btnQuotes.style.display  = isQuotes ? '' : 'none';
  if (btnClients) btnClients.style.display = isQuotes ? 'none' : '';

  /* Barra móvil */
  _showActionBtn(isQuotes ? 'quotes' : 'clients');

  if (tab === 'clients') renderClients();
}

function populateSelects() {
  const ps = document.getElementById('calc-printer');
  const ms = document.getElementById('calc-material');
  const pv = ps.value, mv = ms.value;

  ps.innerHTML = printers.map(p => `<option value="${p.id}">${p.name} (${p.power}W)</option>`).join('');

  /* Preselección: lo que había en pantalla, o la última impresora usada.
     config.lastPrinterId se venía guardando desde siempre y nadie lo leía:
     la app volvía a la primera impresora de la lista en cada carga, aunque
     imprimieras el 90% en otra. */
  const pDeseada = pv || config.lastPrinterId;
  if (pDeseada && printers.some(p => p.id === pDeseada)) ps.value = pDeseada;

  /* Filtrar materiales según tipo de impresora seleccionada */
  const mDeseado = mv || config.lastMaterialId;
  _filterMaterials(mDeseado);
}

/* Filtra el select de materiales según el tipo de la impresora activa */
function _filterMaterials(keepMaterialId) {
  const ps = document.getElementById('calc-printer');
  const ms = document.getElementById('calc-material');
  if (!ps || !ms) return;

  const printer     = printers.find(p => p.id === ps.value);
  const printerType = printer ? printer.type : null;

  /* Si la impresora tiene tipo definido, mostrar solo materiales compatibles */
  const filtered = printerType
    ? materials.filter(m => m.type === printerType)
    : materials;

  ms.innerHTML = filtered.length
    ? filtered.map(m => `<option value="${m.id}">${m.name} (${config.currency}${m.costPerKg}/kg)</option>`).join('')
    : `<option value="">Sin materiales para ${printerType}</option>`;

  /* Intentar conservar la selección previa si sigue siendo compatible */
  if (keepMaterialId && filtered.some(m => m.id === keepMaterialId)) {
    ms.value = keepMaterialId;
  }
}

/* ── Config sub-pages navigation ────────────────────────────────── */
function showConfigPage(name) {
  if (window.innerWidth >= 900) {
    /* ── Desktop: #page-config es el panel completo (top:0→bottom:0).
       La sub-página seleccionada se MUEVE físicamente al container interno.
       Sin CSS battles — todo via DOM + inline styles. ── */

    /* 1. Ocultar todas las .page */
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });

    /* 2. Posicionar #page-config como panel full-width via inline styles
          (no depende del CSS cacheado — 100% JS-driven) */
    var cfgPanel = document.getElementById('page-config');
    if (cfgPanel) {
      cfgPanel.style.display       = 'flex';
      cfgPanel.style.position      = 'fixed';
      cfgPanel.style.top           = '0';
      cfgPanel.style.left          = '240px';
      cfgPanel.style.right         = '0';
      cfgPanel.style.bottom        = '0';
      cfgPanel.style.flexDirection = 'column';
      cfgPanel.style.background    = 'var(--bg)';
      cfgPanel.style.zIndex        = '15';
      cfgPanel.style.overflow      = 'hidden';
      cfgPanel.style.padding       = '0';
      cfgPanel.style.margin        = '0';
      cfgPanel.classList.add('active');
    }

    /* 3. Actualizar body.dataset para CSS (highlight de tab activo) */
    document.body.dataset.page = (name === 'quote-editor') ? 'quote-editor' : 'config-' + name;

    /* 4. Mover sub-páginas previas de vuelta al body */
    var container = document.getElementById('cfg-subpage-container');
    if (container) {
      Array.from(container.children).forEach(function(child) {
        if (child.id && (child.id.indexOf('page-config-') === 0 || child.id === 'page-quote-editor')) {
          child.style.display = '';   /* limpiar inline al devolver */
          document.body.appendChild(child);
        }
      });

      /* 5. Mover la sub-página seleccionada al container */
      var subPage = document.getElementById(_cfgSubPageId(name));
      if (subPage) {
        subPage.style.display = 'block';  /* forzar visible con inline */
        container.appendChild(subPage);
      }
      container.style.display = 'block';
    }

    /* 6. Sidebar: resaltar "Ajustes" */
    document.querySelectorAll('.nav-item,.sidebar-item').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('[data-page="config"]').forEach(function(b) { b.classList.add('active'); });

    /* 7. FAB y barra de acción */
    document.querySelectorAll('.m3-fab').forEach(function(f) { f.style.display = 'none'; });
    var qaBar = document.getElementById('page-action-bar');
    if (qaBar) qaBar.style.display = 'none';

    if (name === 'quote-editor') loadQuoteEditor(); else loadConfig();
  } else {
    /* ── Mobile: flujo genérico ── */
    if (name === 'quote-editor') showPage('quote-editor'); else showPage('config-' + name);
  }
}

/* ── Top-bar: nombre e imagen del negocio ───────────────────────── */
function updateTopBar() {
  var logoUrl = (typeof quoteStyle !== 'undefined' && quoteStyle && quoteStyle.logoDataUrl) ? quoteStyle.logoDataUrl : '';
  var bizName = (config && config.bizName) ? config.bizName : '';

  /* Top bar (móvil) */
  var nameEl = document.getElementById('top-bar-biz-name');
  if (nameEl && bizName) nameEl.textContent = bizName;
  var img = document.getElementById('top-bar-logo-img');
  var svg = document.getElementById('top-bar-logo-svg');
  if (img && svg) {
    if (logoUrl) { img.src = logoUrl; img.style.display = ''; svg.style.display = 'none'; }
    else         { img.style.display = 'none'; svg.style.display = ''; }
  }

  /* Sidebar (desktop) */
  var sNameEl = document.getElementById('sidebar-biz-name');
  if (sNameEl && bizName) sNameEl.textContent = bizName;
  var sImg = document.getElementById('sidebar-logo-img');
  var sSvg = document.getElementById('sidebar-logo-svg');
  if (sImg && sSvg) {
    if (logoUrl) { sImg.src = logoUrl; sImg.style.display = ''; sSvg.style.display = 'none'; }
    else         { sImg.style.display = 'none'; sSvg.style.display = ''; }
  }
}
