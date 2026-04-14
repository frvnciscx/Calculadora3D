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
    /* Actualizar estados valid en tiempo real */
    _setFieldState('field-weight', 'helper-weight', weight > 0 ? 'valid' : 'neutral', weight > 0 ? '' : 'Ej: 15g para un topper');
    _setFieldState('field-time',   'helper-time',   timeH  > 0 ? 'valid' : 'neutral', timeH  > 0 ? '' : 'Ej: 1.5 hrs');
  } else {
    /* Modo explícito — muestra errores */
    var hasError = false;
    if (weight <= 0) { _setFieldState('field-weight', 'helper-weight', 'error', 'Ingresa el peso de la pieza'); hasError = true; }
    else { _setFieldState('field-weight', 'helper-weight', 'valid', ''); }
    if (timeH <= 0)  { _setFieldState('field-time', 'helper-time', 'error', 'Ingresa el tiempo de impresión'); hasError = true; }
    else { _setFieldState('field-time', 'helper-time', 'valid', ''); }
    if (hasError) { snack('Ingresa peso y tiempo de impresión'); return; }
    if (!printer || !material) { snack('Selecciona impresora y material'); return; }
  }

  var cur = config.currency;

  /* ── ¿Impresora de resina? ── */
  var isResin = (printer.type === 'Resina');

  /* Peso efectivo: si es resina se agrega % de soportes */
  var supportPct = isResin ? (config.resinSupportPct || 20) : 0;
  var effectiveWeight = weight * (1 + supportPct / 100);

  var matCost    = (effectiveWeight / 1000) * material.costPerKg;
  var energyCost = (printer.power / 1000) * timeH * config.kwhCost;
  var laborCost  = designH * config.laborCostPerHour;
  var deprecCost = (printer.lifeHours > 0) ? (printer.cost / printer.lifeHours) * timeH : 0;
  var fixedCost  = (config.monthlyPrintHours > 0) ? (config.fixedMonthlyCost / config.monthlyPrintHours) * timeH : 0;

  /* ── Post-proceso resina (IPA + UV) ── */
  var ipaCost  = 0;
  var uvCost   = 0;
  if (isResin) {
    /* IPA: ml × ($/L ÷ 1000) */
    var mlPerPrint   = config.ipaMlPerPrint  || 150;
    var ipaLiterCost = config.ipaLiterCost   || 80;
    ipaCost = mlPerPrint * (ipaLiterCost / 1000);

    /* Elegoo Mercury Plus: ~24W×5min lavado + ~36W×3min curado = 0.0038 kWh */
    var washKwh  = (24 / 1000) * (5 / 60);   /* ≈ 0.002 kWh */
    var cureKwh  = (36 / 1000) * (3 / 60);   /* ≈ 0.0018 kWh */
    uvCost = (washKwh + cureKwh) * config.kwhCost;
  }

  /* ── Post-procesado (pintura, primer, barniz, tiempo pintado) ── */
  var pp = _getPostProcData();
  var postProcCost = pp ? pp.totalPostCost : 0;

  var subtotal   = matCost + energyCost + laborCost + deprecCost + fixedCost + ipaCost + uvCost + postProcCost;
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

  /* ── Bloque de post-procesado (pintura) ── */
  _renderPostProcBlock(pp, cur);

  /* ── Bloque de post-proceso resina ── */
  var resinBlock = document.getElementById('r-resin-block');
  if (resinBlock) {
    if (isResin) {
      document.getElementById('r-resin-weight').textContent =
        effectiveWeight.toFixed(1) + 'g (' + weight.toFixed(1) + 'g + ' + supportPct + '% soportes)';
      document.getElementById('r-ipa').textContent   = cur + ipaCost.toFixed(2);
      document.getElementById('r-uv').textContent    = cur + uvCost.toFixed(2);
      resinBlock.classList.remove('hidden');
    } else {
      resinBlock.classList.add('hidden');
    }
  }

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
    desc:           document.getElementById('calc-desc').value || 'Sin descripción',
    weight, timeH, designH, margin,
    printer:        printer.name,
    material:       material.name,
    printerId:      printer.id,
    materialId:     material.id,
    isResin:        isResin,
    effectiveWeight: isResin ? effectiveWeight : weight,
    supportPct:     supportPct,
    matCost, energyCost, laborCost, deprecCost, fixedCost,
    ipaCost:        ipaCost,
    uvCost:         uvCost,
    postProc:       pp,
    postProcCost:   postProcCost,
    wasteCost,
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
      el.addEventListener('change', function() {
        if (id === 'calc-printer') {
          _filterMaterials();
          _updateResinParamsBlock();
        }
        calculate(true);
      });
      el._liveCalc = true;
    }
  });

  /* Sincronización bidireccional: slider ↔ input numérico de margen */
  var rangeEl  = document.getElementById('calc-margin');
  var numEl    = document.getElementById('calc-margin-num');
  if (rangeEl && numEl && !rangeEl._marginSync) {
    rangeEl.addEventListener('input', function() {
      numEl.value = rangeEl.value;
    });
    numEl.addEventListener('input', function() {
      var v = Math.min(200, Math.max(0, parseFloat(numEl.value) || 0));
      rangeEl.value = v;
      calculate(true);
    });
    rangeEl._marginSync = true;
  }
}

/* ── Mostrar/ocultar bloque resina según impresora seleccionada ── */
function _updateResinParamsBlock() {
  var printerEl = document.getElementById('calc-printer');
  var block     = document.getElementById('calc-resin-params');
  if (!block || !printerEl) return;

  var printer = printers.find(function(p) { return p.id === printerEl.value; });
  var isResin = printer && printer.type === 'Resina';

  if (isResin) {
    /* Rellenar con valores actuales de config */
    var fldSupport = document.getElementById('cfg-resin-support-pct');
    var fldMl      = document.getElementById('cfg-ipa-ml');
    var fldLiter   = document.getElementById('cfg-ipa-liter-cost');
    if (fldSupport && !fldSupport.value) fldSupport.value = config.resinSupportPct || 20;
    if (fldMl      && !fldMl.value)      fldMl.value      = config.ipaMlPerPrint   || 150;
    if (fldLiter   && !fldLiter.value)   fldLiter.value   = config.ipaLiterCost    || 80;
    block.classList.remove('hidden');
  } else {
    block.classList.add('hidden');
  }
}

/* ── Guardar cambios de resina en config al vuelo ─────────────── */
function saveResinParams() {
  var fldSupport = parseFloat((document.getElementById('cfg-resin-support-pct') || {}).value);
  var fldMl      = parseFloat((document.getElementById('cfg-ipa-ml')            || {}).value);
  var fldLiter   = parseFloat((document.getElementById('cfg-ipa-liter-cost')    || {}).value);
  if (!isNaN(fldSupport) && fldSupport >= 0 && fldSupport <= 100) config.resinSupportPct = fldSupport;
  if (!isNaN(fldMl)      && fldMl >= 0)                           config.ipaMlPerPrint   = fldMl;
  if (!isNaN(fldLiter)   && fldLiter >= 0)                        config.ipaLiterCost    = fldLiter;
  sv('config', config);
  calculate(true);  /* recalcular en tiempo real */
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
  var mnEl = document.getElementById('calc-margin-num');
  if (mnEl) mnEl.value = lastCalc.margin || 50;
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
  document.getElementById('result-base').textContent      = cur + lastCalc.baseCost.toFixed(2);
  document.getElementById('result-total').textContent     = cur + lastCalc.totalCost.toFixed(2);

  /* Restaurar bloque resina si aplica */
  var resinBlock = document.getElementById('r-resin-block');
  if (resinBlock) {
    if (lastCalc.isResin) {
      var ew = lastCalc.effectiveWeight || lastCalc.weight;
      var sp = lastCalc.supportPct || 20;
      document.getElementById('r-resin-weight').textContent =
        ew.toFixed(1) + 'g (' + lastCalc.weight.toFixed(1) + 'g + ' + sp + '% soportes)';
      document.getElementById('r-ipa').textContent  = cur + (lastCalc.ipaCost || 0).toFixed(2);
      document.getElementById('r-uv').textContent   = cur + (lastCalc.uvCost  || 0).toFixed(2);
      resinBlock.classList.remove('hidden');
    } else {
      resinBlock.classList.add('hidden');
    }
  }

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
  var mnEl = document.getElementById('calc-margin-num');
  if (mnEl) mnEl.value = p.margin;
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

/* ═══════════════════════════════════════════════════════════════
   POST-PROCESADO — pintura, primer, barniz, tiempo de pintado
   ═══════════════════════════════════════════════════════════════ */

/* Toggle header de la tarjeta (clic en cualquier parte excepto el switch) */
function togglePostProc(event) {
  var cb = document.getElementById('postproc-enabled');
  if (!cb) return;
  cb.checked = !cb.checked;
  onPostProcToggle();
}

/* Mostrar/ocultar campos al activar el switch */
function onPostProcToggle() {
  var cb     = document.getElementById('postproc-enabled');
  var fields = document.getElementById('postproc-fields');
  if (!fields) return;
  if (cb && cb.checked) {
    fields.classList.remove('hidden');
    /* Si no hay colores todavía, agrega uno vacío por defecto */
    var list = document.getElementById('paint-colors-list');
    if (list && !list.children.length) addPaintColor();
  } else {
    fields.classList.add('hidden');
  }
  if (lastCalc) calculate(true);
}

/* Contador para IDs únicos de filas de color */
var _paintColorId = 0;

/* Agrega una fila de color de pintura */
function addPaintColor() {
  var list = document.getElementById('paint-colors-list');
  if (!list) return;
  var id = ++_paintColorId;
  var row = document.createElement('div');
  row.className = 'paint-color-row';
  row.dataset.colorId = id;
  row.innerHTML =
    '<div class="m3-field" style="flex:2;margin:0">' +
      '<input type="text" placeholder=" " class="paint-color-name">' +
      '<label>Color</label>' +
    '</div>' +
    '<div class="m3-field" style="flex:1.5;margin:0">' +
      '<input type="number" placeholder=" " min="0" step="0.01" inputmode="decimal" class="paint-color-cost" oninput="calculate(true)">' +
      '<label>Costo</label>' +
      '<span class="suffix">$</span>' +
    '</div>' +
    '<button class="paint-remove-btn" onclick="removePaintColor(this)" title="Quitar color">' +
      '<span class="material-symbols-rounded">close</span>' +
    '</button>';
  list.appendChild(row);
}

/* Elimina una fila de color */
function removePaintColor(btn) {
  var row = btn.closest('.paint-color-row');
  if (row) { row.remove(); calculate(true); }
}

/* Lee todos los datos de post-procesado del DOM */
function _getPostProcData() {
  var enabled = document.getElementById('postproc-enabled');
  if (!enabled || !enabled.checked) return null;

  var paints = [];
  var rows = document.querySelectorAll('#paint-colors-list .paint-color-row');
  rows.forEach(function(row) {
    var nameEl = row.querySelector('.paint-color-name');
    var costEl = row.querySelector('.paint-color-cost');
    var cost   = parseFloat((costEl && costEl.value) || 0) || 0;
    if (cost > 0 || (nameEl && nameEl.value.trim())) {
      paints.push({ name: (nameEl ? nameEl.value.trim() : '') || 'Sin nombre', cost: cost });
    }
  });

  var primerCost   = parseFloat((document.getElementById('postproc-primer')  || {}).value || 0) || 0;
  var varnishCost  = parseFloat((document.getElementById('postproc-varnish') || {}).value || 0) || 0;
  var paintingTimeH = parseFloat((document.getElementById('postproc-time')   || {}).value || 0) || 0;
  var paintingLaborCost = paintingTimeH * (config.laborCostPerHour || 0);
  var paintMatCost = paints.reduce(function(s, p) { return s + p.cost; }, 0);
  var totalPostCost = paintMatCost + primerCost + varnishCost + paintingLaborCost;

  return { paints, primerCost, varnishCost, paintingTimeH, paintingLaborCost, paintMatCost, totalPostCost };
}

/* Renderiza el bloque de post-procesado en resultados */
function _renderPostProcBlock(pp, cur) {
  var block = document.getElementById('r-postproc-block');
  if (!block) return;

  if (!pp || pp.totalPostCost === 0) {
    block.classList.add('hidden');
    return;
  }

  /* Filas de colores */
  var rowsEl = document.getElementById('r-postproc-rows');
  if (rowsEl) {
    var html = '';
    pp.paints.forEach(function(p) {
      html += '<div class="resin-detail-row">' +
        '<span class="resin-detail-lbl">🎨 ' + esc(p.name) + '</span>' +
        '<span class="resin-detail-val">' + cur + p.cost.toFixed(2) + '</span>' +
      '</div>';
    });
    if (pp.primerCost > 0) html +=
      '<div class="resin-detail-row"><span class="resin-detail-lbl">Primer</span>' +
      '<span class="resin-detail-val">' + cur + pp.primerCost.toFixed(2) + '</span></div>';
    if (pp.varnishCost > 0) html +=
      '<div class="resin-detail-row"><span class="resin-detail-lbl">Barniz</span>' +
      '<span class="resin-detail-val">' + cur + pp.varnishCost.toFixed(2) + '</span></div>';
    rowsEl.innerHTML = html;
  }

  var paintLaborEl  = document.getElementById('r-paint-labor');
  var ppTotalEl     = document.getElementById('r-postproc-total');
  if (paintLaborEl) paintLaborEl.textContent = cur + pp.paintingLaborCost.toFixed(2);
  if (ppTotalEl)    ppTotalEl.textContent    = cur + pp.totalPostCost.toFixed(2);

  block.classList.remove('hidden');
}

/* ── Helper: estado visual de un campo ───────────────────────────
   state: 'error' | 'valid' | 'neutral'
   ──────────────────────────────────────────────────────────────── */
function _setFieldState(fieldId, helperId, state, msg) {
  var field  = document.getElementById(fieldId);
  var helper = document.getElementById(helperId);
  if (!field) return;
  field.classList.remove('m3-field-error', 'm3-field-valid');
  if (state === 'error') field.classList.add('m3-field-error');
  if (state === 'valid') field.classList.add('m3-field-valid');
  if (helper && msg !== undefined) helper.textContent = msg;
}
