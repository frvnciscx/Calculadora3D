/* ===== CALCULATOR ===== */

/* ── Cálculo (modo silencioso para live, modo explícito para validación) ── */
function calculate(silent) {
  var weight   = parseFloat(document.getElementById('calc-weight').value) || 0;
  var timeH    = parseFloat(document.getElementById('calc-time').value) || 0;
  var designH  = parseFloat(document.getElementById('calc-design-time').value) || 0;
  var margin   = parseFloat(document.getElementById('calc-margin').value) || 0;
  var printer  = printers.find(function(p) { return p.id === document.getElementById('calc-printer').value; });
  var material = materials.find(function(m) { return m.id === document.getElementById('calc-material').value; });

  if (silent) {
    /* Modo live — solo calcula si hay datos válidos, sin errores visuales */
    if (weight <= 0 || timeH <= 0 || !printer || !material) return;
  } else {
    /* Modo explícito — muestra errores */
    var hasError = false;
    var wField = document.getElementById('calc-weight').closest('.m3-field');
    var tField = document.getElementById('calc-time').closest('.m3-field');
    if (weight <= 0) { wField.classList.add('m3-field-error'); hasError = true; }
    else { wField.classList.remove('m3-field-error'); }
    if (timeH <= 0)  { tField.classList.add('m3-field-error'); hasError = true; }
    else { tField.classList.remove('m3-field-error'); }
    if (hasError) { snack('Ingresa peso y tiempo de impresión'); return; }
    if (!printer || !material) { snack('Selecciona impresora y material'); return; }
  }

  var cur = config.currency;
  var matCost    = (weight / 1000) * material.costPerKg;
  var energyCost = (printer.power / 1000) * timeH * config.kwhCost;
  var laborCost  = designH * config.laborCostPerHour;
  var deprecCost = (printer.lifeHours > 0) ? (printer.cost / printer.lifeHours) * timeH : 0;
  var fixedCost  = (config.monthlyPrintHours > 0) ? (config.fixedMonthlyCost / config.monthlyPrintHours) * timeH : 0;
  var subtotal   = matCost + energyCost + laborCost + deprecCost + fixedCost;
  var wasteCost  = subtotal * (config.wastePercent / 100);
  var baseCost   = subtotal + wasteCost;
  var totalCost  = baseCost * (1 + margin / 100);

  document.getElementById('r-mat').textContent     = cur + matCost.toFixed(2);
  document.getElementById('r-energy').textContent   = cur + energyCost.toFixed(2);
  document.getElementById('r-labor').textContent    = cur + laborCost.toFixed(2);
  document.getElementById('r-deprec').textContent   = cur + deprecCost.toFixed(2);
  document.getElementById('r-fixed').textContent    = cur + fixedCost.toFixed(2);
  document.getElementById('r-waste').textContent    = cur + wasteCost.toFixed(2);
  document.getElementById('result-base').textContent = cur +baseCost.toFixed(2);
  document.getElementById('result-total').textContent = cur + totalCost.toFixed(2);
  document.getElementById('calc-result').classList.remove('hidden');

  /* Resetear botón "Agregar a orden" si estaba en estado "agregado" */
  var btnAdd = document.getElementById('btn-add-item');
  if (btnAdd && btnAdd.classList.contains('item-added')) {
    btnAdd.classList.remove('item-added');
    btnAdd.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px">add_shopping_cart</span> Agregar a orden';
    btnAdd.disabled = false;
  }

  /* Recordar última impresora y material usados */
  config.lastPrinterId  = printer.id;
  config.lastMaterialId = material.id;
  sv('config', config);

  saveLastCalc({
    desc:      document.getElementById('calc-desc').value || 'Sin descripción',
    weight, timeH, designH, margin,
    printer:   printer.name,
    material:  material.name,
    printerId: printer.id,
    materialId: material.id,
    matCost, energyCost, laborCost, deprecCost, fixedCost, wasteCost,
    baseCost, totalCost,
    date: new Date().toISOString()
  });
}

/* ── Listeners de cálculo en vivo ─────────────────────────────── */
function initCalcLive() {
  var liveInputs   = ['calc-weight', 'calc-time', 'calc-design-time'];
  var liveSelects  = ['calc-printer', 'calc-material'];
  var liveRange    = ['calc-margin'];

  liveInputs.concat(liveRange).forEach(function(id) {
    var el = document.getElementById(id);
    if (el && !el._liveCalc) {
      el.addEventListener('input', function() { calculate(true); });
      el._liveCalc = true;
    }
  });
  liveSelects.forEach(function(id) {
    var el = document.getElementById(id);
    if (el && !el._liveCalc) {
      el.addEventListener('change', function() { calculate(true); });
      el._liveCalc = true;
    }
  });
}

/* ── Guardar en historial ─────────────────────────────────────── */
function saveToHistory() {
  if (!lastCalc) return;
  history.unshift(lastCalc);
  if (history.length > 100) history.pop();
  sv('history', history);
  clearLastCalc();
  document.getElementById('calc-result').classList.add('hidden');
  snack('Guardado en historial');
}

/* ── Restaurar resultado al volver a la calculadora ──────────── */
function restoreCalcResult() {
  if (!lastCalc) return;
  var cur = config.currency;
  document.getElementById('calc-desc').value              = lastCalc.desc !== 'Sin descripción' ? lastCalc.desc : '';
  document.getElementById('calc-weight').value            = lastCalc.weight || '';
  document.getElementById('calc-time').value              = lastCalc.timeH || '';
  document.getElementById('calc-design-time').value       = lastCalc.designH || 0;
  document.getElementById('calc-margin').value            = lastCalc.margin || 50;
  document.getElementById('calc-margin-display').textContent = (lastCalc.margin || 50) + '%';
  var ps = document.getElementById('calc-printer');
  var ms = document.getElementById('calc-material');
  if (lastCalc.printerId)  ps.value = lastCalc.printerId;
  if (lastCalc.materialId) ms.value = lastCalc.materialId;
  document.getElementById('r-mat').textContent            = cur + lastCalc.matCost.toFixed(2);
  document.getElementById('r-energy').textContent         = cur + lastCalc.energyCost.toFixed(2);
  document.getElementById('r-labor').textContent          = cur + lastCalc.laborCost.toFixed(2);
  document.getElementById('r-deprec').textContent         = cur + lastCalc.deprecCost.toFixed(2);
  document.getElementById('r-fixed').textContent          = cur + lastCalc.fixedCost.toFixed(2);
  document.getElementById('r-waste').textContent          = cur + lastCalc.wasteCost.toFixed(2);
  document.getElementById('result-base').textContent      = cur +lastCalc.baseCost.toFixed(2);
  document.getElementById('result-total').textContent     = cur + lastCalc.totalCost.toFixed(2);
  document.getElementById('calc-result').classList.remove('hidden');
}

/* ── Presets de configuración rápida ─────────────────────────── */
function renderPresets() {
  var el = document.getElementById('calc-presets');
  if (!el) return;
  if (!presets.length) { el.innerHTML = ''; return; }

  el.innerHTML = '<div class="preset-row">' +
    presets.map(function(p, i) {
      return '<button class="preset-chip" onclick="applyPreset(' + i + ')">' +
        '<span class="material-symbols-rounded" style="font-size:14px;margin-right:4px">bolt</span>' +
        esc(p.name) +
        '<span class="preset-chip-del" onclick="event.stopPropagation();deletePreset(' + i + ')" title="Eliminar">&#10005;</span>' +
      '</button>';
    }).join('') +
  '</div>';
}

function applyPreset(i) {
  var p = presets[i]; if (!p) return;
  var ps = document.getElementById('calc-printer');
  var ms = document.getElementById('calc-material');
  var mr = document.getElementById('calc-margin');
  var md = document.getElementById('calc-margin-display');
  if (ps) ps.value = p.printerId;
  if (ms) ms.value = p.materialId;
  if (mr) mr.value = p.margin;
  if (md) md.textContent = p.margin + '%';
  calculate(true);
  snack('Config aplicada: ' + p.name);
}

function saveCurrentPreset() {
  var printer  = lastCalc && printers.find(function(p) { return p.id === lastCalc.printerId; });
  var material = lastCalc && materials.find(function(m) { return m.id === lastCalc.materialId; });
  if (!printer || !material) { snack('Calcula primero para guardar una config'); return; }

  var margin = lastCalc.margin || 0;
  /* Nombre corto: Material + Impresora abreviada + margen */
  var pName  = printer.name.length > 10 ? printer.name.slice(0, 10) + '\u2026' : printer.name;
  var name   = material.name + ' \u00b7 ' + pName;

  /* Evitar duplicados exactos */
  var dupe = presets.some(function(p) {
    return p.printerId === printer.id && p.materialId === material.id && p.margin === margin;
  });
  if (dupe) { snack('Esta configuración ya está guardada'); return; }

  presets.push({ name: name, printerId: printer.id, materialId: material.id, margin: margin });
  sv('presets', presets);
  renderPresets();
  snack('\u2605 Preset guardado: ' + name);
}

function deletePreset(i) {
  presets.splice(i, 1);
  sv('presets', presets);
  renderPresets();
}
