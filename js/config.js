/* ===== CONFIG ===== */

/* ── Moneda: actualiza el seg y el select oculto ─── */
function setCurrencyUI(cur, btnId) {
  /* Actualizar select oculto (leído por saveConfig) */
  var sel = document.getElementById('cfg-currency');
  if (sel) sel.value = cur;
  /* Actualizar estado activo de los botones del seg */
  ['cur-mxn','cur-usd','cur-eur'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) btn.classList.toggle('active', id === btnId);
  });
}

function loadConfig() {
  document.getElementById('cfg-kwh').value = config.kwhCost;
  document.getElementById('cfg-labor').value = config.laborCostPerHour;
  document.getElementById('cfg-currency').value = config.currency;
  document.getElementById('cfg-fixed-monthly').value = config.fixedMonthlyCost || 0;
  document.getElementById('cfg-monthly-hours').value = config.monthlyPrintHours || 0;
  var wasteEl = document.getElementById('cfg-waste');
  if (wasteEl) wasteEl.value = config.wastePercent || 0;
  var wasteDisplayEl = document.getElementById('cfg-waste-display');
  if (wasteDisplayEl) wasteDisplayEl.textContent = (config.wastePercent || 0) + '%';
  var maintEl = document.getElementById('cfg-maint');
  if (maintEl) maintEl.value = config.maintenancePercent || 0;
  var maintDisplayEl = document.getElementById('cfg-maint-display');
  if (maintDisplayEl) maintDisplayEl.textContent = (config.maintenancePercent || 0);
  /* Información de la cuenta activa */
  var cuentaEl = document.getElementById('cfg-cuenta-info');
  if (cuentaEl && typeof getCurrentUser === 'function') {
    var u = getCurrentUser();
    cuentaEl.textContent = !u
      ? 'Sin sesión'
      : (u.email || u.displayName) + (u.simulado ? ' · sesión simulada' : '');
  }

  var indirectMonthlyEl = document.getElementById('cfg-indirect-monthly');
  if (indirectMonthlyEl) indirectMonthlyEl.value = config.indirectMonthlyCost || 0;
  renderIndirectCostItems();
  _updateIndirectPerHourDisplay();
  renderFixedCostItems();
  /* Costo fijo por hora display */
  _updateFixedPerHourDisplay();
  document.getElementById('cfg-biz-name').value = config.bizName || '';
  document.getElementById('cfg-biz-phone').value = config.bizPhone || '';
  document.getElementById('cfg-biz-email').value = config.bizEmail || '';
  document.getElementById('cfg-biz-social').value = config.bizSocial || '';
  document.getElementById('cfg-biz-qr').value = config.bizQrUrl || '';
  var amsPurgeEl = document.getElementById('cfg-ams-purge');
  if (amsPurgeEl) amsPurgeEl.value = (config.amsPurgeGrams != null ? config.amsPurgeGrams : 0.7);
  var cfgBank   = document.getElementById('cfg-biz-bank');   if (cfgBank)   cfgBank.value   = config.bizBank   || '';
  var cfgHolder = document.getElementById('cfg-biz-holder'); if (cfgHolder) cfgHolder.value = config.bizAccountHolder || '';
  var cfgAccNum = document.getElementById('cfg-biz-account');if (cfgAccNum) cfgAccNum.value = config.bizAccountNumber  || '';
  var showBankEl = document.getElementById('cfg-show-bank-info');
  if (showBankEl) showBankEl.checked = config.showBankInfo !== false;
  /* Resina */
  var cfgIpaLiter   = document.getElementById('cfg-ipa-liter-cost');
  var cfgIpaMl      = document.getElementById('cfg-ipa-ml');
  var cfgSupportPct = document.getElementById('cfg-resin-support-pct');
  if (cfgIpaLiter)   cfgIpaLiter.value   = config.ipaLiterCost   || 80;
  if (cfgIpaMl)      cfgIpaMl.value      = config.ipaMlPerPrint  || 150;
  if (cfgSupportPct) cfgSupportPct.value = config.resinSupportPct || 20;
  /* Sincronizar seg de moneda */
  var curMap = { '$': 'cur-mxn', 'US$': 'cur-usd', '€': 'cur-eur' };
  var activeCurBtn = curMap[config.currency] || 'cur-mxn';
  ['cur-mxn','cur-usd','cur-eur'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) btn.classList.toggle('active', id === activeCurBtn);
  });
  applyTheme();
}

function _updateFixedPerHourDisplay() {
  /* Lee del input en vivo para feedback inmediato */
  var hoursEl = document.getElementById('cfg-monthly-hours');
  var fixedEl = document.getElementById('cfg-fixed-monthly');
  var hours   = hoursEl  ? (parseFloat(hoursEl.value)  || 0) : (config.monthlyPrintHours  || 0);
  var fixed   = fixedEl  ? (parseFloat(fixedEl.value)  || 0) : (config.fixedMonthlyCost   || 0);
  var cur     = (config && config.currency) ? config.currency : '$';
  var dispEl  = document.getElementById('cfg-fixed-per-hour-display');
  if (!dispEl) return;
  if (hours > 0 && fixed > 0) {
    var perH = (fixed / hours).toFixed(2);
    dispEl.innerHTML = cur + perH + ' / hr';
  } else {
    dispEl.innerHTML = '—';
  }
}

function saveConfig() {
  var kwh    = parseFloat(document.getElementById('cfg-kwh').value);
  var labor  = parseFloat(document.getElementById('cfg-labor').value);
  var fixed  = parseFloat(document.getElementById('cfg-fixed-monthly').value);
  var hours  = parseFloat(document.getElementById('cfg-monthly-hours').value);
  var waste  = parseFloat(document.getElementById('cfg-waste').value);
  var maint    = parseFloat((document.getElementById('cfg-maint') || {}).value);
  var indirect = parseFloat((document.getElementById('cfg-indirect-monthly') || {}).value);

  /* Validación */
  if (isNaN(kwh) || kwh < 0)    { snack('Costo kWh inválido'); document.getElementById('cfg-kwh').focus(); return; }
  if (isNaN(labor) || labor < 0) { snack('Costo hora de diseño inválido'); document.getElementById('cfg-labor').focus(); return; }
  if (!isNaN(waste) && (waste < 0 || waste > 100)) { snack('Desperdicio debe ser entre 0 y 100%'); document.getElementById('cfg-waste').focus(); return; }
  if (!isNaN(maint) && (maint < 0 || maint > 100)) { snack('Mantenimiento debe ser entre 0 y 100%'); document.getElementById('cfg-maint').focus(); return; }
  if (!isNaN(indirect) && indirect < 0) { snack('Gastos indirectos no puede ser negativo'); document.getElementById('cfg-indirect-monthly').focus(); return; }
  if (!isNaN(indirect) && indirect > 0 && (isNaN(hours) || hours <= 0)) {
    snack('Ingresa horas de impresión/mes para prorratear los gastos indirectos'); document.getElementById('cfg-monthly-hours').focus(); return;
  }
  if (!isNaN(fixed) && fixed > 0 && (isNaN(hours) || hours <= 0)) {
    snack('Ingresa horas de impresión/mes para calcular costos fijos'); document.getElementById('cfg-monthly-hours').focus(); return;
  }

  /* Leer ítems del desglose. Si hay ítems, el total es su suma — pero si esa
     suma es MENOR que el total que el usuario tenía capturado a mano, la
     diferencia se conserva en una fila "Otros" en vez de desaparecer.

     Antes: total manual de $2 000 + un ítem de $500 = $500. Se perdían $1 500
     sin aviso y todas las piezas quedaban subcotizadas. */
  function _conciliar(items, totalPrevio) {
    if (items.length === 0) return { items: items, total: null };
    var suma = items.reduce(function(s, it) { return s + it.amount; }, 0);
    var dif  = (totalPrevio || 0) - suma;
    if (dif > 0.5) {
      items = items.concat([{ name: 'Otros (sin desglosar)', amount: +dif.toFixed(2) }]);
      suma  = totalPrevio;
    }
    return { items: items, total: suma };
  }

  var fci = _conciliar(_readCostItems('fci'), config.fixedMonthlyCost);
  if (fci.total !== null) fixed = fci.total;
  config.fixedCostItems = fci.items;

  var ici = _conciliar(_readCostItems('ici'), config.indirectMonthlyCost);
  if (ici.total !== null) indirect = ici.total;
  config.indirectCostItems = ici.items;

  config.kwhCost = kwh || 0;
  config.laborCostPerHour = labor || 0;
  config.currency = document.getElementById('cfg-currency').value;
  config.fixedMonthlyCost = fixed || 0;
  config.monthlyPrintHours = hours || 0;
  config.wastePercent = isNaN(waste) ? 0 : waste;
  if (!isNaN(maint))    config.maintenancePercent  = maint;
  if (!isNaN(indirect)) config.indirectMonthlyCost = indirect;
  config.bizName = document.getElementById('cfg-biz-name').value.trim();
  config.bizPhone = document.getElementById('cfg-biz-phone').value.trim();
  config.bizEmail = document.getElementById('cfg-biz-email').value.trim();
  config.bizSocial = document.getElementById('cfg-biz-social').value.trim();
  config.bizQrUrl  = document.getElementById('cfg-biz-qr').value.trim();
  config.bizBank            = ((document.getElementById('cfg-biz-bank')    || {}).value || '').trim();
  config.bizAccountHolder   = ((document.getElementById('cfg-biz-holder')  || {}).value || '').trim();
  config.bizAccountNumber   = ((document.getElementById('cfg-biz-account') || {}).value || '').trim();
  var showBankSave = document.getElementById('cfg-show-bank-info');
  if (showBankSave) config.showBankInfo = showBankSave.checked;
  /* AMS */
  var amsPurgeEl = document.getElementById('cfg-ams-purge');
  if (amsPurgeEl) {
    var amsPurge = parseFloat(amsPurgeEl.value);
    if (!isNaN(amsPurge) && amsPurge >= 0) config.amsPurgeGrams = amsPurge;
  }
  /* Resina */
  var ipaLiter    = parseFloat((document.getElementById('cfg-ipa-liter-cost') || {}).value);
  var ipaMl       = parseFloat((document.getElementById('cfg-ipa-ml') || {}).value);
  var supportPct  = parseFloat((document.getElementById('cfg-resin-support-pct') || {}).value);
  if (!isNaN(ipaLiter)   && ipaLiter   >= 0) config.ipaLiterCost    = ipaLiter;
  if (!isNaN(ipaMl)      && ipaMl      >= 0) config.ipaMlPerPrint   = ipaMl;
  if (!isNaN(supportPct) && supportPct >= 0 && supportPct <= 100) config.resinSupportPct = supportPct;
  sv('config', config);
  updateTopBar();
  snack('Configuración guardada ✓');
}

/* ═══════════════════════════════════════════════════════════════
   COSTOS FIJOS — desglose por categoría
   ═══════════════════════════════════════════════════════════════ */

var _fciCounter = 0;

/* Los dos grupos de categorías comparten la misma UI y lógica.
   'fci' = gastos fijos · 'ici' = gastos indirectos */
var _COST_GROUPS = {
  fci: { listId: 'fixed-cost-items-list',    totalId: 'cfg-fixed-monthly',    onInput: 'updateFixedCostTotal' },
  ici: { listId: 'indirect-cost-items-list', totalId: 'cfg-indirect-monthly', onInput: 'updateIndirectCostTotal' }
};

/* Genera el HTML de una fila — 2 líneas para evitar overflow en pantallas pequeñas */
function _costItemRow(prefix, name, amount) {
  var g  = _COST_GROUPS[prefix];
  var id = ++_fciCounter;
  return '<div class="' + prefix + '-row" data-' + prefix + '="' + id + '" style="padding:12px 0;border-bottom:0.5px solid var(--line)">' +
    /* Línea 1: nombre de categoría */
    '<input type="text" placeholder="Nombre de la categoría" class="' + prefix + '-name" value="' + esc(name || '') + '"' +
      ' style="width:100%;box-sizing:border-box;background:transparent;border:none;outline:none;' +
             'font-size:14px;color:var(--ink);font-family:var(--font-sans);margin-bottom:8px">' +
    /* Línea 2: monto + botón eliminar */
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">' +
      '<div style="display:flex;align-items:baseline;gap:4px">' +
        '<span style="font-family:var(--font-mono);font-size:12px;color:var(--ink-3)">$</span>' +
        '<input type="number" placeholder="0" min="0" step="1" inputmode="decimal"' +
          ' class="' + prefix + '-amount" value="' + (amount || '') + '"' +
          ' oninput="' + g.onInput + '()"' +
          ' style="background:transparent;border:none;outline:none;font-family:var(--font-mono);' +
            'font-size:16px;font-weight:600;color:var(--ink);text-align:left;width:100px">' +
        '<span style="font-family:var(--font-mono);font-size:12px;color:var(--ink-3)">/mes</span>' +
      '</div>' +
      '<button onclick="removeCostItemRow(this,\'' + prefix + '\')"' +
        ' style="display:flex;align-items:center;background:none;border:none;cursor:pointer;padding:4px;flex-shrink:0">' +
        '<span class="material-symbols-rounded" style="font-size:18px;color:var(--md-error)">delete</span>' +
      '</button>' +
    '</div>' +
  '</div>';
}

/* Renderiza las filas de un grupo desde el array de config */
function _renderCostItems(prefix, items) {
  var list = document.getElementById(_COST_GROUPS[prefix].listId);
  if (!list) return;
  items = items || [];
  if (items.length === 0) { list.innerHTML = ''; return; }
  list.innerHTML = items.map(function(item) {
    return _costItemRow(prefix, item.name, item.amount);
  }).join('');
  _updateCostTotal(prefix);
}

/* Agrega una fila vacía y enfoca el nombre */
function _addCostItem(prefix) {
  var list = document.getElementById(_COST_GROUPS[prefix].listId);
  if (!list) return;
  var div = document.createElement('div');
  div.innerHTML = _costItemRow(prefix, '', '');
  list.appendChild(div.firstChild);
  var nameEl = list.lastElementChild && list.lastElementChild.querySelector('.' + prefix + '-name');
  if (nameEl) nameEl.focus();
}

/* Elimina una fila */
function removeCostItemRow(btn, prefix) {
  var row = btn.closest('.' + prefix + '-row');
  if (!row) return;
  row.remove();
  _updateCostTotal(prefix);
}

/* Lee las filas de un grupo → [{name, amount}] */
function _readCostItems(prefix) {
  var items = [];
  document.querySelectorAll('#' + _COST_GROUPS[prefix].listId + ' .' + prefix + '-row').forEach(function(row) {
    var nameEl   = row.querySelector('.' + prefix + '-name');
    var amountEl = row.querySelector('.' + prefix + '-amount');
    var name   = (nameEl   && nameEl.value.trim())   || '';
    var amount = parseFloat((amountEl && amountEl.value) || 0) || 0;
    if (name || amount > 0) items.push({ name: name || 'Sin nombre', amount: amount });
  });
  return items;
}

/* Suma todos los montos y actualiza el campo total.
   manualEdit=true: el usuario está editando el total directamente → no sobreescribir */
function _updateCostTotal(prefix, manualEdit) {
  if (manualEdit) return; /* el usuario escribe directo en el total */
  var g     = _COST_GROUPS[prefix];
  var rows  = document.querySelectorAll('#' + g.listId + ' .' + prefix + '-row');
  var total = 0;
  rows.forEach(function(row) {
    var amEl = row.querySelector('.' + prefix + '-amount');
    total += parseFloat((amEl && amEl.value) || 0) || 0;
  });
  var totalEl = document.getElementById(g.totalId);
  if (totalEl && rows.length > 0) totalEl.value = total.toFixed(0);
}

/* ── Wrappers por grupo (los usan los oninput del HTML) ── */
function renderFixedCostItems()             { _renderCostItems('fci', config.fixedCostItems); }
function addFixedCostItem()                 { _addCostItem('fci'); }
function updateFixedCostTotal(manualEdit)   { _updateCostTotal('fci', manualEdit); _updateFixedPerHourDisplay(); }

function renderIndirectCostItems()          { _renderCostItems('ici', config.indirectCostItems); }
function addIndirectCostItem()              { _addCostItem('ici'); }
function updateIndirectCostTotal(manualEdit){ _updateCostTotal('ici', manualEdit); _updateIndirectPerHourDisplay(); }

/* Costo indirecto por hora — usa las mismas horas/mes que los gastos fijos */
function _updateIndirectPerHourDisplay() {
  var dispEl = document.getElementById('cfg-indirect-per-hour-display');
  var refEl  = document.getElementById('cfg-indirect-hours-ref');
  if (!dispEl && !refEl) return;

  var totalEl = document.getElementById('cfg-indirect-monthly');
  var hoursEl = document.getElementById('cfg-monthly-hours');
  var total   = totalEl ? (parseFloat(totalEl.value) || 0) : (config.indirectMonthlyCost || 0);
  var hours   = hoursEl ? (parseFloat(hoursEl.value) || 0) : (config.monthlyPrintHours  || 0);
  var cur     = (config && config.currency) ? config.currency : '$';

  if (dispEl) dispEl.textContent = (hours > 0 && total > 0) ? cur + (total / hours).toFixed(2) : '—';
  if (refEl)  refEl.textContent  = hours > 0 ? hours + ' hrs/mes' : 'sin definir';
}

/* ===== EXPORT / IMPORT ===== */
function exportData() {
  /* v6: se agregaron clients e inventory. Hasta la v5 el respaldo los omitía,
     así que "Exportar" generaba un archivo que al restaurarse dejaba al usuario
     sin clientes y sin rollos de filamento, sin ningún aviso. */
  const data = {
    printers, materials, config, quoteStyle, history, quotes,
    quoteCounter: quoteCounter,
    clients:   (typeof clients   !== 'undefined' ? clients   : []),
    inventory: (typeof inventory !== 'undefined' ? inventory : []),
    presets:   (typeof presets   !== 'undefined' ? presets   : []),
    v: 6,
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'calc3d_backup_' + new Date().toISOString().slice(0, 10) + '.json';
  a.click(); URL.revokeObjectURL(url);
  snack('Datos exportados');
}

/* Required fields for validation */
var PRINTER_FIELDS = ['id', 'name', 'power', 'type', 'cost', 'lifeHours'];
var MATERIAL_FIELDS = ['id', 'name', 'type', 'costPerKg', 'density'];

function hasRequiredFields(obj, fields) {
  return fields.every(function(f) { return obj.hasOwnProperty(f) && obj[f] !== undefined && obj[f] !== ''; });
}

/* Compara lo que hay ahora con lo que trae el archivo y arma el detalle
   del diálogo. Lo importante es señalar las PÉRDIDAS: importar reemplaza
   los arrays completos, así que una colección que hoy tiene datos y en el
   archivo viene vacía o ausente se pierde. */
function _resumenImportacion(data) {
  var grupos = [
    { k: 'quotes',    label: 'Cotizaciones', actual: (typeof quotes    !== 'undefined' ? quotes    : []).length },
    { k: 'clients',   label: 'Clientes',     actual: (typeof clients   !== 'undefined' ? clients   : []).length },
    { k: 'inventory', label: 'Inventario',   actual: (typeof inventory !== 'undefined' ? inventory : []).length },
    { k: 'printers',  label: 'Impresoras',   actual: (typeof printers  !== 'undefined' ? printers  : []).length },
    { k: 'materials', label: 'Materiales',   actual: (typeof materials !== 'undefined' ? materials : []).length }
  ];
  var filas = '', hayPerdida = false;

  grupos.forEach(function(g) {
    var entra     = Array.isArray(data[g.k]) ? data[g.k].length : null;
    var seAplica  = entra !== null && (g.k === 'printers' || g.k === 'materials' ? entra > 0 : true);
    var resultado = seAplica ? entra : g.actual;
    var pierde    = resultado < g.actual;
    if (pierde) hayPerdida = true;

    filas += '<div style="display:flex;justify-content:space-between;gap:12px;padding:3px 0">' +
      '<span>' + g.label + '</span>' +
      '<span style="font-family:var(--font-mono);color:' + (pierde ? 'var(--md-error)' : 'var(--ink-2)') + '">' +
        g.actual + ' → ' + resultado + (pierde ? '  ⚠' : '') +
      '</span>' +
    '</div>';
  });

  if (hayPerdida) {
    filas += '<div style="margin-top:10px;color:var(--md-error)">' +
      'Las filas marcadas van a perder registros. Importar <strong>reemplaza</strong>, no combina.' +
    '</div>';
  }
  return filas;
}

function importData(event) {
  var file = event.target.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    var data;
    try { data = JSON.parse(e.target.result); }
    catch (err) { snack('Error al importar: archivo inválido'); return; }

    m3Confirm('¿Reemplazar tus datos?', function() { _aplicarImportacion(data); }, {
      confirmLabel: 'Reemplazar',
      icon: 'sync_alt',
      detail: _resumenImportacion(data)
    });
  };
  reader.readAsText(file); event.target.value = '';
}

function _aplicarImportacion(data) {
    try {

      /* Printers — validate each entry has required fields */
      if (Array.isArray(data.printers)) {
        var validPrinters = data.printers.filter(function(p) { return hasRequiredFields(p, PRINTER_FIELDS); });
        if (validPrinters.length > 0) { printers = validPrinters; sv('printers', printers); }
      }

      /* Materials — validate each entry has required fields */
      if (Array.isArray(data.materials)) {
        var validMaterials = data.materials.filter(function(m) { return hasRequiredFields(m, MATERIAL_FIELDS); });
        if (validMaterials.length > 0) { materials = validMaterials; sv('materials', materials); }
      }

      if (data.config && typeof data.config === 'object') {
        config = { ...DEF_CONFIG, ...data.config };
        sv('config', config);
      }
      if (data.quoteStyle && typeof data.quoteStyle === 'object') {
        quoteStyle = { ...DEF_QUOTE_STYLE, ...data.quoteStyle };
        sv('quoteStyle', quoteStyle);
      }
      if (Array.isArray(data.history)) { history = data.history; sv('history', history); }
      if (Array.isArray(data.quotes))  { quotes = data.quotes; sv('quotes', quotes); }

      /* Restore quote counter — take max of imported vs existing */
      if (typeof data.quoteCounter === 'number' && data.quoteCounter > quoteCounter) {
        quoteCounter = data.quoteCounter;
      }
      /* Re-sync counter with imported quotes to be safe */
      quotes.forEach(function(q) {
        if (q.quoteNum) {
          var n = parseInt(q.quoteNum.replace(/\D/g, '')) || 0;
          if (n > quoteCounter) quoteCounter = n;
        }
      });
      sv('quoteCounter', quoteCounter);

      /* Clientes e inventario — faltaban en la versión anterior de esta función,
         así que un respaldo con clientes nunca los restauraba. */
      if (Array.isArray(data.clients))   { clients   = data.clients;   sv('clients',   clients);   }
      if (Array.isArray(data.inventory)) { inventory = data.inventory; sv('inventory', inventory); }
      if (Array.isArray(data.presets))   { presets   = data.presets;   sv('presets',   presets);   }

      snack('Datos importados');
      populateSelects();
      if (typeof renderClients   === 'function') renderClients();
      if (typeof renderInventory === 'function') renderInventory();
      showPage('calc');
    } catch(err) { snack('Error al importar: archivo inválido'); }
}
