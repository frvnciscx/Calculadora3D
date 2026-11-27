/* ===== UI HELPERS ===== */
function snack(msg) {
  const old = document.querySelector('.m3-snackbar');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'm3-snackbar';
  el.setAttribute('role', 'status');      /* que el lector de pantalla lo anuncie */
  el.setAttribute('aria-live', 'polite');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* Aviso con una acción, como «Deshacer» o «Actualizar». Dura más que el aviso
   normal para dar tiempo de tocarla. */
function snackAccion(msg, etiqueta, alTocar, duracion) {
  const old = document.querySelector('.m3-snackbar');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'm3-snackbar m3-snackbar-accion';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  const texto = document.createElement('span');
  texto.textContent = msg;
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = etiqueta;
  boton.onclick = function() { el.remove(); alTocar(); };
  el.appendChild(texto);
  el.appendChild(boton);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duracion || 6000);
}

/* La versión que está corriendo, del nombre de la caché del service worker
   («calc3d-v112» → «Versión 112»). Sirve para saber si ya llegó un cambio. */
function mostrarVersion() {
  if (!window.caches) return;
  caches.keys().then(function(nombres) {
    var v = nombres.map(function(n) { var m = /^calc3d-v(\d+)$/.exec(n); return m ? +m[1] : 0; })
      .sort(function(a, b) { return b - a; })[0];
    if (!v) return;
    document.querySelectorAll('.app-version').forEach(function(el) { el.textContent = 'Versión ' + v; });
  }).catch(function() {});
}

function closeModal() {
  document.getElementById('modal-container').innerHTML = '';
}

/* M3 Confirm Dialog — reemplaza al confirm() del navegador.
   opts (opcional): { confirmLabel, icon, detail }
     confirmLabel — texto del botón de acción (default 'Eliminar')
     icon         — símbolo de Material (default 'warning')
     detail       — línea secundaria con el detalle de lo que va a pasar
     cancelLabel  — texto del botón de no confirmar (default 'Cancelar')
     alCancelar   — qué hacer si no se confirma */
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
        '<button class="m3-btn-text" onclick="closeModal()">' + (opts.cancelLabel || 'Cancelar') + '</button>' +
        '<button class="m3-btn-filled" style="background:var(--md-error);color:var(--md-on-error);width:auto;padding:0 24px" id="m3-confirm-btn">' + label + '</button>' +
      '</div>' +
    '</div>';
  document.getElementById('m3-confirm-btn').onclick = function() { closeModal(); onConfirm(); };
  /* opts.alCancelar: qué hacer si no se confirma (por ejemplo, volver al panel de antes) */
  if (opts.alCancelar) {
    var mc = document.getElementById('modal-container');
    var noConfirmar = function() { closeModal(); opts.alCancelar(); };
    mc.querySelector('.m3-scrim').onclick = noConfirmar;
    mc.querySelector('.m3-dialog-actions .m3-btn-text').onclick = noConfirmar;
  }
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
  /* Salir de Ajustes con cambios sin guardar pregunta qué hacer (D238, D240).
     Pasar de una pestaña de Ajustes a otra no, ni en el teléfono regresar de
     una sección a la lista de Ajustes: lo escrito se conserva (D175). */
  if (typeof _ajustesSinGuardar !== 'undefined' && _ajustesSinGuardar &&
      /^(config|quote-editor)/.test(document.body.dataset.page || '') &&
      String(name).indexOf('config') !== 0 && typeof avisarAjustesSinGuardar === 'function') {
    avisarAjustesSinGuardar(function() { showPage(name); });
    return;
  }
  /* Cambiar de página cierra el editor que estaba abierto a un lado (D177) */
  if (document.body.classList.contains('panel-abierto')) closeModal();
  /* El panel de la cotización es de Cotizaciones y Clientes: al ir a otra
     página se cierra (D183). Antes se quedaba abierto, también en la Calculadora. */
  if (name !== 'quotes' && name !== 'clients' && document.body.classList.contains('dock-open') &&
      typeof closeQuoteDock === 'function') closeQuoteDock();
  /* ── Al salir de config: resetear inline styles ──────────────────
     Siempre, no solo en escritorio: si la ventana se angostaba con Ajustes
     abierto, el panel de escritorio se quedaba armado y la página salía
     corrida 240 px en el teléfono. */
  _cleanConfigDesktop();

  if (name === 'calc') {
    var _desde = document.body.dataset.page;
    if (_desde && _desde !== 'calc' && _desde !== 'history') _paginaAnterior = _desde;
  }

  /* ── Catálogo: sub-páginas antiguas → catálogo unificado ───────── */
  /* Materiales vive en Ajustes (D179) */
  if (name === 'materials') { showConfigPage('materiales'); return; }
  if (name === 'printers' || name === 'inventory') {
    var catTab = name === 'printers' ? 'printers' : 'inventory';
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
    if (document.body.dataset.page !== 'clients') _irArriba();
    document.body.dataset.page = 'clients';
    _ponerTitulo('clients');
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

  /* Otra página empieza arriba, no donde se quedó la anterior (D215) */
  if (document.body.dataset.page !== name) _irArriba();
  document.body.dataset.page = name;
  _ponerTitulo(name);

  const navMap = {
    'quote-editor':    'quotes',
    'catalog':         'catalog',
    'config-negocio':  'config',
    'config-banco':    'config',
    'config-electrico':'config',
    'config-materiales':'config',
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
  if (name === 'config-materiales') renderMaterials();
  /* setCalcMode('calc'): la calculadora siempre abre en modo calcular; la
     revisión de la cotización (escritorio) solo se abre con «Revisar orden». */
  if (name === 'calc')         { setCalcMode('calc'); populateSelects(); if (typeof renderQueCotizas === 'function') renderQueCotizas(); restoreCalcResult(); refreshDraftIndicator(); initCalcLive(); renderPresets(); _updateResinParamsBlock(); _updateAMSBlock(); _updateSpoolSelector(); }
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
  /* Materiales salió del catálogo a Ajustes (D179) */
  if (tab === 'materials') { showConfigPage('materiales'); return; }
  _activeCatalogTab = tab;
  var panels = { printers: 'printer-list', inventory: 'inventory-list' };
  var tabs   = { printers: 'cat-tab-printers', inventory: 'cat-tab-inventory' };
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
  var sidebarTabMap = { printers: '[data-tab="printers"]', inventory: '[data-page="inventory"]' };
  var activeBtn = document.querySelector('.sidebar-item' + (sidebarTabMap[tab] || ''));
  if (activeBtn) activeBtn.classList.add('active');
  /* ── Render ─── */
  if (tab === 'printers')  renderPrinters();
  if (tab === 'inventory') renderInventory();
}

/* ── Catálogo — botón + del encabezado ─── */
function catalogAdd() {
  if (_activeCatalogTab === 'printers')  { showPrinterModal(); return; }
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
  var resumenEl  = document.getElementById('quotes-resumen');
  var btnQuotes  = document.getElementById('phdr-btn-quotes');
  var btnClients = document.getElementById('phdr-btn-clients');
  if (headingEl)  headingEl.textContent  = isQuotes ? 'Cotizaciones' : 'Clientes';
  if (resumenEl)  resumenEl.style.display = isQuotes ? '' : 'none';
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

  ps.innerHTML = printers.length
    ? printers.map(p => `<option value="${p.id}">${p.name} (${p.power}W)</option>`).join('')
    : '<option value="">Sin impresoras</option>';

  /* Preselección: lo que había en pantalla, o la última impresora usada.
     config.lastPrinterId se venía guardando desde siempre y nadie lo leía:
     la app volvía a la primera impresora de la lista en cada carga, aunque
     imprimieras el 90% en otra. */
  const pDeseada = pv || config.lastPrinterId;
  if (pDeseada && printers.some(p => p.id === pDeseada)) ps.value = pDeseada;

  /* Filtrar materiales según tipo de impresora seleccionada */
  const mDeseado = mv || config.lastMaterialId;
  _filterMaterials(mDeseado);
  _avisoSinEquipo();
}

/* Sin impresoras o sin materiales no se puede cotizar (D194): la calculadora
   lo dice arriba de los selectores, con el botón para agregar lo que falta */
function _avisoSinEquipo() {
  var aviso = document.getElementById('calc-sin-equipo');
  if (!aviso) return;
  var sinImp = !printers.length, sinMat = !materials.length;
  aviso.classList.toggle('hidden', !sinImp && !sinMat);
  var texto = document.getElementById('calc-sin-equipo-texto');
  if (texto) texto.textContent = 'Para cotizar, agrega ' +
    (sinImp && sinMat ? 'una impresora y un material.' : sinImp ? 'una impresora.' : 'un material.');
  var bi = document.getElementById('calc-sin-impresora');
  var bm = document.getElementById('calc-sin-material');
  if (bi) bi.classList.toggle('hidden', !sinImp);
  if (bm) bm.classList.toggle('hidden', !sinMat);
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
    : `<option value="">${printerType ? 'Sin materiales para ' + esc(printerType) : 'Sin materiales'}</option>`;

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
    /* La pestaña elegida se anuncia como la página actual (D214) */
    document.querySelectorAll('.cfg-tab').forEach(function(t) {
      if (t.id === 'cfg-nav-' + name) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
    _ponerTitulo('config');

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
    if (name === 'materiales') renderMaterials();
  } else {
    /* ── Mobile: flujo genérico ── */
    if (name === 'quote-editor') showPage('quote-editor'); else showPage('config-' + name);
  }
}

/* ── Top-bar: nombre e imagen del negocio ───────────────────────── */
function updateTopBar() {
  /* El logo de Ajustes › Diseño se guarda en quoteStyle.logo. Antes se buscaba
     en logoDataUrl, que nadie llena, y por eso nunca aparecía aquí (D123). */
  var logoUrl = (typeof quoteStyle !== 'undefined' && quoteStyle)
    ? (quoteStyle.logo || quoteStyle.logoDataUrl || '') : '';
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

/* ── Paneles: Esc cierra, y el foco entra y regresa (D151) ───────────
   Todo lo que se abre en #modal-container (hojas y diálogos) se anuncia como
   diálogo, recibe el foco al abrirse y se lo devuelve al botón que lo abrió
   al cerrarse. Esc hace lo mismo que tocar fuera del panel; si el panel no se
   cierra al tocar fuera, Esc tampoco lo cierra. */
(function() {
  var mc = document.getElementById('modal-container');
  if (!mc || !('MutationObserver' in window)) return;
  var ultimoFoco = null, regresarA = null, n = 0;

  document.addEventListener('focusin', function(e) {
    if (!mc.contains(e.target)) ultimoFoco = e.target;
  });

  function panelAbierto() { return mc.querySelector('.m3-bottom-sheet, .m3-dialog'); }

  new MutationObserver(function() {
    /* Escritorio (D177): un editor abierto es un panel a la derecha, sin velo;
       la página se angosta y se sigue viendo (desktop.css, body.panel-abierto) */
    document.body.classList.toggle('panel-abierto', window.innerWidth >= 900 && !!mc.querySelector('.m3-bottom-sheet:not(.help-sheet)'));
    var p = panelAbierto();
    if (!p) {
      var foco = document.activeElement;
      if (regresarA && document.contains(regresarA) && (!foco || foco === document.body)) {
        regresarA.focus({ preventScroll: true });
      }
      regresarA = null;
      return;
    }
    if (!regresarA) regresarA = ultimoFoco;
    if (!p.hasAttribute('role')) p.setAttribute('role', 'dialog');
    p.setAttribute('aria-modal', 'true');
    if (!p.hasAttribute('aria-labelledby') && !p.hasAttribute('aria-label')) {
      var t = p.querySelector('h2, h3');
      if (t) { if (!t.id) t.id = 'panel-titulo-' + (++n); p.setAttribute('aria-labelledby', t.id); }
    }
    /* Al panel mismo, no al primer campo: en el teléfono no abre el teclado */
    if (!p.contains(document.activeElement)) {
      p.setAttribute('tabindex', '-1');
      p.focus({ preventScroll: true });
    }
  }).observe(mc, { childList: true });

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (!panelAbierto() || document.querySelector('.capa-encima')) return;
    var scrim = mc.querySelector('.m3-scrim');
    if (scrim && scrim.onclick) { e.preventDefault(); scrim.click(); }
  });
})();

/* ── Ayudas detrás de un «?» (D171) ──────────────────────────────────
   Lo que antes era un párrafo fijo en pantalla y solo sirve la primera vez.
   La de la purga del AMS ya tenía la suya (showPurgeHelp). */
var AYUDAS = {
  indirectos: {
    titulo: 'Gastos indirectos',
    texto: 'Consumibles que no son parte de la pieza pero se gastan al producirla: guantes, lijas, ' +
           'alcohol, cinta, adhesivo, bolsas y empaque. Se reparten por hora de impresión, con las ' +
           'mismas horas al mes de Gastos fijos.'
  },
  mantenimiento: {
    titulo: 'Mantenimiento y refacciones',
    texto: 'Boquillas, bandas, PEI/FEP y refacciones. El porcentaje se suma sobre material, energía, ' +
           'depreciación y gastos fijos.'
  }
};

function mostrarAyuda(clave) {
  var a = AYUDAS[clave];
  if (!a) return;
  document.getElementById('modal-container').innerHTML =
    '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet help-sheet" role="dialog" aria-modal="true" aria-labelledby="ayuda-titulo">' +
      '<div class="m3-drag-handle"></div>' +
      '<div class="sheet-header-row">' +
        '<h2 id="ayuda-titulo">' + a.titulo + '</h2>' +
        '<button type="button" class="sheet-close-btn" onclick="closeModal()" aria-label="Cerrar">' +
          '<span class="material-symbols-rounded" aria-hidden="true" style="font-size:20px">close</span>' +
        '</button>' +
      '</div>' +
      '<p class="ayuda-texto">' + a.texto + '</p>' +
    '</div>';
}

/* ── Al cambiar de página: arriba y con su nombre en la pestaña (D214, D215) ── */
function _irArriba() {
  try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
  catch (e) { window.scrollTo(0, 0); }
}
var TITULOS_PAGINA = {
  dashboard: 'Inicio', calc: 'Calculadora', quotes: 'Cotizaciones', clients: 'Clientes',
  catalog: 'Catálogo', config: 'Ajustes', ayuda: 'Ayuda', history: 'Historial',
  'quote-editor': 'Diseño de cotización'
};
function _ponerTitulo(name) {
  var t = TITULOS_PAGINA[name] || (String(name).indexOf('config') === 0 ? 'Ajustes' : '');
  document.title = (t ? t + ' · ' : '') + 'Calculadora de Costos 3D';
}

/* ── Lector de pantalla: íconos, nombres, campos y segmentos (D214) ───
   Los íconos son letras de una fuente (Material Symbols): el lector de
   pantalla leía «edit», «delete»… Aquí se le ocultan, los botones que solo
   tienen ícono reciben un nombre, los campos de Ajustes se ligan a su texto
   y los segmentos dicen cuál está elegido. Corre al cargar y con cada cosa
   que la app dibuja después (MutationObserver avisa cuando cambia la página). */
(function() {
  var ICONO = '.material-symbols-rounded';
  var NOMBRES = {
    edit: 'Editar', delete: 'Borrar', delete_outline: 'Borrar', close: 'Cerrar',
    more_vert: 'Más opciones', more_horiz: 'Más opciones', add: 'Agregar',
    content_copy: 'Duplicar', share: 'Compartir', search: 'Buscar', help: 'Ayuda',
    arrow_back: 'Atrás', arrow_back_ios: 'Atrás', chevron_left: 'Atrás',
    history: 'Historial', download: 'Descargar', upload: 'Subir', remove: 'Quitar',
    visibility: 'Ver', visibility_off: 'Ocultar', settings: 'Ajustes', menu: 'Menú',
    light_mode: 'Tema claro', dark_mode: 'Tema oscuro', logout: 'Salir', info: 'Información'
  };
  var n = 0;

  /* El texto que se ve, sin los nombres de los íconos */
  function textoVisible(el) {
    var t = '';
    el.childNodes.forEach(function(h) {
      if (h.nodeType === 3) t += h.textContent;
      else if (h.nodeType === 1 && !h.matches(ICONO) && h.getAttribute('aria-hidden') !== 'true') t += textoVisible(h);
    });
    return t.trim();
  }
  function nombrarBoton(b) {
    if (b.hasAttribute('aria-label') || b.hasAttribute('aria-labelledby') || textoVisible(b)) return;
    var icono = b.querySelector(ICONO);
    var nombre = b.getAttribute('title') || (icono && NOMBRES[icono.textContent.trim()]);
    if (nombre) b.setAttribute('aria-label', nombre);
  }
  /* Ajustes: «Nombre del estudio» es un texto al lado del campo, no su etiqueta */
  function ligarCampos(raiz) {
    var filas = Array.prototype.slice.call(raiz.querySelectorAll('.row'));
    if (raiz.matches('.row')) filas.push(raiz);
    filas.forEach(function(fila) {
      var txt = fila.querySelector(':scope > .row-label');
      if (!txt || txt.tagName === 'LABEL') return;
      var campos = fila.querySelectorAll('input:not([type=hidden]):not([type=checkbox]), select, textarea');
      if (campos.length !== 1) return;
      var c = campos[0];
      if ((c.labels && c.labels.length) || c.hasAttribute('aria-label') || c.hasAttribute('aria-labelledby')) return;
      if (!txt.id) txt.id = 'etiqueta-' + (++n);
      c.setAttribute('aria-labelledby', txt.id);
    });
  }
  function segmento(b) {
    if (!b.hasAttribute('role')) b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false');
  }
  function arreglar(raiz) {
    if (!raiz || raiz.nodeType !== 1) return;
    if (raiz.matches(ICONO)) {
      raiz.setAttribute('aria-hidden', 'true');
      var b = raiz.closest('button');
      if (b) nombrarBoton(b);
      return;
    }
    raiz.querySelectorAll(ICONO + ':not([aria-hidden])').forEach(function(i) { i.setAttribute('aria-hidden', 'true'); });
    if (raiz.matches('button')) nombrarBoton(raiz);
    raiz.querySelectorAll('button').forEach(nombrarBoton);
    ligarCampos(raiz);
    raiz.querySelectorAll('.seg > button').forEach(segmento);
  }
  function iniciar() {
    arreglar(document.body);
    new MutationObserver(function(cambios) {
      cambios.forEach(function(c) {
        if (c.type === 'attributes') {
          if (c.target.matches && c.target.matches('.seg > button')) segmento(c.target);
          return;
        }
        c.addedNodes.forEach(arreglar);
      });
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
