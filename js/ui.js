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

/* M3 Confirm Dialog — replaces browser confirm() */
function m3Confirm(message, onConfirm) {
  document.getElementById('modal-container').innerHTML =
    '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-dialog">' +
      '<span class="material-symbols-rounded" style="font-size:24px;color:var(--md-error);margin-bottom:16px">warning</span>' +
      '<h3 style="font-size:24px;font-weight:400;margin-bottom:16px">' + message + '</h3>' +
      '<div class="m3-dialog-actions">' +
        '<button class="m3-btn-text" onclick="closeModal()">Cancelar</button>' +
        '<button class="m3-btn-filled" style="background:var(--md-error);color:var(--md-on-error);width:auto;padding:0 24px" id="m3-confirm-btn">Eliminar</button>' +
      '</div>' +
    '</div>';
  document.getElementById('m3-confirm-btn').onclick = function() { closeModal(); onConfirm(); };
}

function showPage(name) {
  // Catálogo: sub-páginas antiguas se redirigen al catálogo unificado
  if (name === 'printers' || name === 'materials' || name === 'inventory') {
    var catTab = name === 'printers' ? 'printers' : name === 'materials' ? 'materials' : 'inventory';
    showPage('catalog');
    showCatalogTab(catTab);
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

  const pageEl = document.getElementById('page-' + name);
  if (!pageEl) { console.warn('Page not found:', name); return; }
  pageEl.classList.add('active');

  // Exponer página actual en body para CSS
  document.body.dataset.page = name;

  // Map sub-pages to their parent nav item
  const navMap = {
    'quote-editor':    'quotes',
    'clients':         'quotes',
    'catalog':         'catalog',
    'config-negocio':  'config',
    'config-banco':    'config',
    'config-electrico':'config',
    'config-gastos':   'config',
    'config-otros':    'config',
  };
  const navPage = navMap[name] || name;
  const navBtn = document.querySelector(`[data-page="${navPage}"]`);
  if (navBtn) navBtn.classList.add('active');

  document.querySelectorAll('.m3-fab').forEach(f => f.style.display = 'none');

  /* Barra de acción fija — visible en cotizaciones y catálogo */
  var qaBar = document.getElementById('page-action-bar');
  if (qaBar) qaBar.style.display = (name === 'quotes' || name === 'catalog') ? '' : 'none';
  /* Mostrar el botón correcto según página */
  _showActionBtn(name === 'quotes' ? (_activeQuotesTab || 'quotes') : name === 'catalog' ? 'catalog' : null);

  if (name === 'dashboard')    renderDashboard();
  if (name === 'catalog')      { showCatalogTab(_activeCatalogTab || 'printers'); }
  if (name === 'quotes')       { renderQuotes(); showQuotesTab(_activeQuotesTab || 'quotes'); }
  if (name === 'clients')      { showQuotesTab('clients'); showPage('quotes'); return; }
  if (name === 'config' || name.indexOf('config-') === 0) loadConfig();
  if (name === 'calc')         { populateSelects(); restoreCalcResult(); refreshDraftIndicator(); initCalcLive(); renderPresets(); _updateResinParamsBlock(); _updateAMSBlock(); _updateSpoolSelector(); }
  if (name === 'history')      renderHistory();
  if (name === 'quote-editor') loadQuoteEditor();
}

/* ── Barra de acción: muestra el botón correcto según contexto ─── */
function _showActionBtn(context) {
  var btns = { quotes: 'qa-btn-quotes', clients: 'qa-btn-clients', catalog: 'qa-btn-catalog' };
  Object.keys(btns).forEach(function(k) {
    var el = document.getElementById(btns[k]);
    if (el) el.style.display = (k === context) ? '' : 'none';
  });
}

/* ── Tabs del header de calculadora ─── */
function showCalcTab(tab) {
  var tabCotizar   = document.getElementById('calc-tab-cotizar');
  var tabHistorial = document.getElementById('calc-tab-historial');
  if (tabCotizar)   tabCotizar.classList.toggle('active',   tab === 'cotizar');
  if (tabHistorial) tabHistorial.classList.toggle('active', tab === 'historial');
  if (tab === 'historial') showPage('history');
}

/* ── Catálogo — tab entre Impresoras / Materiales / Inventario ─── */
var _activeCatalogTab = 'printers';
var _catalogAddLabels = { printers: 'Impresora', materials: 'Material', inventory: 'Filamento' };
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
  var labelEl = document.getElementById('catalog-add-label');
  if (labelEl) labelEl.textContent = _catalogAddLabels[tab] || 'Agregar';
  _showActionBtn('catalog');
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
  /* Barra de acción fija */
  var qaBar          = document.getElementById('quotes-action-bar');
  var qaBtnQuotes    = document.getElementById('qa-btn-quotes');
  var qaBtnClients   = document.getElementById('qa-btn-clients');

  var isQuotes = tab === 'quotes';
  if (quotesPanel)    quotesPanel.style.display    = isQuotes ? '' : 'none';
  if (filterChips)    filterChips.style.display    = isQuotes ? '' : 'none';
  if (searchWrap)     searchWrap.style.display     = isQuotes ? '' : 'none';
  if (clientsContent) clientsContent.style.display = isQuotes ? 'none' : '';
  if (qtQuotes)       qtQuotes.classList.toggle('active',  isQuotes);
  if (qtClients)      qtClients.classList.toggle('active', !isQuotes);
  _showActionBtn(isQuotes ? 'quotes' : 'clients');

  if (tab === 'clients') renderClients();
}

function populateSelects() {
  const ps = document.getElementById('calc-printer');
  const ms = document.getElementById('calc-material');
  const pv = ps.value, mv = ms.value;

  ps.innerHTML = printers.map(p => `<option value="${p.id}">${p.name} (${p.power}W)</option>`).join('');
  if (pv) ps.value = pv;

  /* Filtrar materiales según tipo de impresora seleccionada */
  _filterMaterials(mv);
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
  showPage('config-' + name);
}

/* ── Top-bar: nombre e imagen del negocio ───────────────────────── */
function updateTopBar() {
  var nameEl = document.getElementById('top-bar-biz-name');
  if (nameEl && config && config.bizName) nameEl.textContent = config.bizName;

  var img = document.getElementById('top-bar-logo-img');
  var svg = document.getElementById('top-bar-logo-svg');
  var logoUrl = (typeof quoteStyle !== 'undefined' && quoteStyle && quoteStyle.logoDataUrl) ? quoteStyle.logoDataUrl : '';
  if (img && svg) {
    if (logoUrl) {
      img.src = logoUrl;
      img.style.display = '';
      svg.style.display = 'none';
    } else {
      img.style.display = 'none';
      svg.style.display = '';
    }
  }
}
