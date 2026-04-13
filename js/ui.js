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
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

  const pageEl = document.getElementById('page-' + name);
  if (!pageEl) { console.warn('Page not found:', name); return; }
  pageEl.classList.add('active');

  // Map sub-pages to their parent nav item
  const navMap = {
    'quote-editor': 'quotes',
    'clients':      'quotes',
    'materials':    'printers',
    'inventory':    'printers',
    'history':      'calc'
  };
  const navPage = navMap[name] || name;
  const navBtn = document.querySelector(`[data-page="${navPage}"]`);
  if (navBtn) navBtn.classList.add('active');

  document.querySelectorAll('.m3-fab').forEach(f => f.style.display = 'none');

  if (name === 'dashboard')    renderDashboard();
  if (name === 'printers')     { renderPrinters();   document.getElementById('fab-printer').style.display = 'flex'; }
  if (name === 'materials')    { renderMaterials();  document.getElementById('fab-material').style.display = 'flex'; }
  if (name === 'inventory')    { renderInventory();  document.getElementById('fab-inventory').style.display = 'flex'; }
  if (name === 'quotes')       renderQuotes();
  if (name === 'clients')      { renderClients();    document.getElementById('fab-clients').style.display = 'flex'; }
  if (name === 'config')       loadConfig();
  if (name === 'calc')         { populateSelects(); restoreCalcResult(); refreshDraftIndicator(); initCalcLive(); renderPresets(); _updateResinParamsBlock(); }
  if (name === 'history')      renderHistory();
  if (name === 'quote-editor') loadQuoteEditor();
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
