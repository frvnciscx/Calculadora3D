/* ===== CALCULATOR ===== */

/* ── Cálculo (modo silencioso para live, modo explícito para validación) ── */
function calculate(silent) {
  var weight   = parseFloat(document.getElementById('calc-weight').value) || 0;
  var timeH    = parseFloat(document.getElementById('calc-time').value) || 0;
  var designH  = parseFloat(document.getElementById('calc-design-time').value) || 0;
  var margin   = parseFloat(document.getElementById('calc-margin').value) || 0;
  /* Piezas de la placa. Lo capturado arriba es de la corrida completa. */
  var piecesEl = document.getElementById('calc-pieces');
  var pieces   = Math.max(1, Math.round(parseFloat(piecesEl && piecesEl.value) || 1));
  var printer  = printers.find(function(p) { return p.id === document.getElementById('calc-printer').value; });
  var material = materials.find(function(m) { return m.id === document.getElementById('calc-material').value; });

  if (silent) {
    /* Modo live — solo calcula si hay datos válidos, sin errores visuales */
    if (weight <= 0 || timeH <= 0 || !printer || !material) return;
    /* Actualizar estados valid en tiempo real */
    _setFieldState('field-weight', 'helper-weight', weight > 0 ? 'valid' : 'neutral', weight > 0 ? '' : 'De toda la placa');
    _setFieldState('field-time',   'helper-time',   timeH  > 0 ? 'valid' : 'neutral', timeH  > 0 ? '' : 'De toda la placa');
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

  /* ── ¿Modo AMS multicolor? ── */
  var amsData = _getAMSData();

  /* ── Post-procesado (pintura, primer, barniz, tiempo pintado) ── */
  var pp = _getPostProcData();

  /* ── El cálculo vive en js/costing.js ──────────────────────────
     Esta función solo lee la pantalla, delega la fórmula y pinta el
     resultado. Así el cálculo se puede probar sin navegador y se puede
     portar a Android sin arrastrar la interfaz. */
  var r = computeCost({
    weight:       weight,
    timeH:        timeH,
    designH:      designH,
    pieces:       pieces,
    margin:       margin,
    postProcCost: pp ? pp.totalPostCost : 0,
    amsMatCost:   amsData ? amsData.amsMatCost : null,
    amsPurgeCost: amsData ? amsData.purgeCost  : 0
  }, config, printer, material);

  var isResin         = r.isResin;
  var supportPct      = r.supportPct;
  var effectiveWeight = r.effectiveWeight;
  var matCost      = r.matCost,      energyCost   = r.energyCost;
  var laborCost    = r.laborCost,    deprecCost   = r.deprecCost;
  var fixedCost    = r.fixedCost,    indirectCost = r.indirectCost;
  var ipaCost      = r.ipaCost,      uvCost       = r.uvCost;
  var postProcCost = r.postProcCost, maintCost    = r.maintCost;
  var wasteCost    = r.wasteCost;
  var baseCost     = r.baseCost,     totalCost    = r.totalCost;

  document.getElementById('r-mat').textContent     = cur + matCost.toFixed(2);
  document.getElementById('r-energy').textContent   = cur + energyCost.toFixed(2);
  document.getElementById('r-labor').textContent    = cur + laborCost.toFixed(2);
  document.getElementById('r-deprec').textContent   = cur + deprecCost.toFixed(2);
  document.getElementById('r-fixed').textContent    = cur + fixedCost.toFixed(2);
  _setRubroRow('row-maint',    'r-maint',    maintCost,    cur);
  _setRubroRow('row-indirect', 'r-indirect', indirectCost, cur);
  document.getElementById('r-waste').textContent    = cur + wasteCost.toFixed(2);
  document.getElementById('result-base').textContent  = cur + baseCost.toFixed(2);
  document.getElementById('result-total').textContent = cur + totalCost.toFixed(0);

  /* ── Ganancia ── */
  var profitAmt = totalCost - baseCost;
  var profitStr = (profitAmt >= 0 ? '+' : '') + cur + profitAmt.toFixed(2);
  var profitEl  = document.getElementById('result-profit');
  if (profitEl) profitEl.textContent = profitStr;
  var gainEl2 = document.getElementById('result-margin-gain');
  if (gainEl2) gainEl2.textContent = profitStr;

  /* ── Margen display y label ── */
  var md2 = document.getElementById('calc-margin-display2');
  if (md2) md2.textContent = margin;
  var mlbl = document.getElementById('calc-margin-label');
  if (mlbl) mlbl.textContent = margin + '% margen';

  /* ── Barra de composición de costos (CCB) ── */
  var ccbParts = [
    { id: 'ccb-mat',    val: matCost },
    { id: 'ccb-energy', val: energyCost },
    { id: 'ccb-design', val: laborCost },
    { id: 'ccb-deprec', val: deprecCost },
    { id: 'ccb-fixed',  val: fixedCost },
    { id: 'ccb-maint',    val: maintCost },
    { id: 'ccb-indirect', val: indirectCost },
    { id: 'ccb-waste',  val: wasteCost },
    { id: 'ccb-post',   val: postProcCost + ipaCost + uvCost },
  ];
  var ccbTotal = baseCost || 1; /* evitar ÷0 */
  ccbParts.forEach(function(p) {
    var el = document.getElementById(p.id);
    if (el) el.style.flex = String(Math.max(0, p.val / ccbTotal));
  });

  /* ── Etiqueta de desglose ── */
  var rubroCount = 6; /* mat, energy, labor, deprec, fixed, waste */
  if (maintCost > 0)             rubroCount++;
  if (indirectCost > 0)          rubroCount++;
  if (postProcCost > 0)          rubroCount++;
  if (isResin && (ipaCost + uvCost) > 0) rubroCount++;
  var lblEl = document.getElementById('breakdown-label');
  if (lblEl) lblEl.textContent = 'Ver desglose · ' + rubroCount + ' rubros';

  /* ── Línea "por pieza" ────────────────────────────────────────────
     Con una placa de 30 el número grande baja mucho de golpe. Sin ver de
     dónde salió, el usuario no sabe si la app dividió o si se equivocó al
     capturar. Solo aparece cuando hay más de una pieza. */
  var perPieceEl  = document.getElementById('calc-per-piece');
  var perPieceTxt = document.getElementById('per-piece-detail');
  if (perPieceEl && perPieceTxt) {
    if (pieces > 1) {
      perPieceTxt.textContent =
        (weight / pieces).toFixed(1) + ' g · ' +
        (timeH  / pieces).toFixed(2) + ' h · ' +
        cur + baseCost.toFixed(2) + ' de costo · placa de ' + pieces;
      perPieceEl.classList.remove('hidden');
    } else {
      perPieceEl.classList.add('hidden');
    }
  }

  /* ── Bloque de post-procesado (pintura) ── */
  _renderPostProcBlock(pp, cur);

  /* ── Resumen de purga AMS — para comparar contra el dato del slicer ── */
  var amsSummaryEl = document.getElementById('ams-purge-summary');
  if (amsSummaryEl) {
    amsSummaryEl.textContent = amsData
      ? amsData.numPurges + ' × ' + amsData.purgeGrams.toFixed(2) + ' g = ' +
        (amsData.numPurges * amsData.purgeGrams).toFixed(2) + ' g · ' + cur + amsData.purgeCost.toFixed(2)
      : '—';
  }

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


  /* Recordar última impresora y material usados.
     calculate() corre en CADA pulsación del teclado, así que antes esto
     reescribía la configuración completa letra por letra. Ahora solo se
     guarda cuando el valor cambió de verdad — que es una o dos veces por
     sesión, no cien. */
  if (config.lastPrinterId !== printer.id || config.lastMaterialId !== material.id) {
    config.lastPrinterId  = printer.id;
    config.lastMaterialId = material.id;
    sv('config', config);
  }

  var spoolSel = document.getElementById('calc-spool');
  var spoolId  = spoolSel ? spoolSel.value : '';

  saveLastCalc({
    desc:           document.getElementById('calc-desc').value || 'Sin descripción',
    /* Todo lo que sale de aquí es POR PIEZA: es lo que descuenta el inventario
       y lo que se multiplica por la cantidad en la cotización. Si guardáramos
       los gramos de la placa, un pedido de 30 descontaría 30 placas.
       Los datos tal como se capturaron se guardan aparte, para poder volver a
       llenar el formulario igual que estaba. */
    weight:         weight  / pieces,
    timeH:          timeH   / pieces,
    designH:        designH / pieces,
    margin:         margin,
    pieces:         pieces,
    plateWeight:    weight,
    plateTimeH:     timeH,
    plateDesignH:   designH,
    printer:        printer.name,
    material:       material.name,
    printerId:      printer.id,
    materialId:     material.id,
    spoolId:        spoolId,
    /* Rollos por color en modo AMS. Sin esto el descuento de inventario
       ignoraba los trabajos multicolor — justo los que más filamento gastan —
       porque el selector de rollo único está oculto en ese modo. */
    amsColors:      amsData ? amsData.colors.map(function(c) {
                      return { spoolId: c.spoolId, weight: c.weight / pieces };
                    }) : null,
    amsPurgeGrams:  amsData ? (amsData.purgeGrams * amsData.numPurges) / pieces : 0,
    isResin:        isResin,
    effectiveWeight: isResin ? effectiveWeight : weight / pieces,
    supportPct:     supportPct,
    matCost, energyCost, laborCost, deprecCost, fixedCost,
    ipaCost:        ipaCost,
    uvCost:         uvCost,
    postProc:       pp,
    postProcCost:   postProcCost,
    maintCost:      maintCost,
    indirectCost:   indirectCost,
    wasteCost,
    baseCost, totalCost,
    date: new Date().toISOString()
  });
}

/* ── Listeners de cálculo en vivo ─────────────────────────────── */
function initCalcLive() {
  var liveInputs   = ['calc-weight', 'calc-time', 'calc-design-time', 'calc-pieces'];
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
          _updateAMSBlock();
        }
        if (id === 'calc-material') {
          _updateSpoolSelector();
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
    function _syncMarginDisplays(v) {
      if (numEl) numEl.value = v;
      var md2 = document.getElementById('calc-margin-display2');
      if (md2) md2.textContent = v;
      var mlbl = document.getElementById('calc-margin-label');
      if (mlbl) mlbl.textContent = v + '% margen';
    }
    rangeEl.addEventListener('input', function() {
      _syncMarginDisplays(rangeEl.value);
    });
    numEl.addEventListener('input', function() {
      var v = Math.min(200, Math.max(0, parseFloat(numEl.value) || 0));
      rangeEl.value = v;
      _syncMarginDisplays(v);
      calculate(true);
    });
    rangeEl._marginSync = true;
  }

  initCalcFloatingBar();
}

/* ── Barra flotante del teléfono ───────────────────────────────────
   Cuando los botones de la calculadora salen de la pantalla por arriba,
   se fijan abajo, sobre la navegación, con el precio a un lado. Es el mismo
   botón «Agregar a orden», movido con la clase .is-floating
   (components.css), no una copia. En escritorio no se usa: ahí el resumen
   ya está fijo en su columna (desktop.css).

   IntersectionObserver avisa cuando un elemento entra o sale de la pantalla,
   sin revisar en cada pixel de desplazamiento. Se observa el hueco (slot) de
   los botones, que conserva su alto mientras ellos flotan: así la página no
   brinca y el observador sigue sabiendo dónde estaban. */
function initCalcFloatingBar() {
  var slot    = document.getElementById('calc-actions-slot');
  var actions = slot && slot.querySelector('.calc-actions');
  var total   = document.getElementById('result-total');
  var mini    = document.getElementById('calc-float-total');
  /* initCalcLive corre cada vez que se abre la calculadora: solo una vez */
  if (!actions || slot._floatingBar || !('IntersectionObserver' in window)) return;
  slot._floatingBar = true;

  var mobile = window.matchMedia('(max-width: 899px)');

  function setFloating(on) {
    on = on && mobile.matches;
    if (on === actions.classList.contains('is-floating')) return;
    /* Guardar el alto ANTES de sacar los botones del flujo de la página */
    slot.style.minHeight = on ? slot.offsetHeight + 'px' : '';
    actions.classList.toggle('is-floating', on);
  }

  new IntersectionObserver(function(entries) {
    var e = entries[0];
    /* Flota solo si salió por ARRIBA (top < 0). Al cambiar de página el
       slot se oculta y llega todo en 0: eso la apaga. */
    setFloating(!e.isIntersecting && e.boundingClientRect.top < 0);
  }).observe(slot);

  /* Si la ventana crece a tamaño escritorio, apagarla */
  if (mobile.addEventListener) {
    mobile.addEventListener('change', function() { if (!mobile.matches) setFloating(false); });
  }

  /* El precio de la barra copia al de arriba cada vez que cambia.
     MutationObserver avisa cuando cambia el contenido de un elemento, así
     no hay que tocar cada lugar de calculate() que escribe el total. */
  function syncTotal() { if (mini && total) mini.textContent = total.textContent; }
  syncTotal();
  if (total) new MutationObserver(syncTotal).observe(total, { childList: true, characterData: true, subtree: true });
}

/* ── Poblar y mostrar selector de spool del inventario ────────── */
function _updateSpoolSelector() {
  var matEl   = document.getElementById('calc-material');
  var chipsEl = document.getElementById('calc-color-chips');
  var hiddenEl= document.getElementById('calc-spool');
  if (!chipsEl || !hiddenEl || !matEl) return;

  /* Filtrar rollos del inventario por material activo.
     Se compara por materialId, no por nombre: antes bastaba renombrar un
     material para que todos sus rollos desaparecieran de aquí. */
  var matId = matEl.value;
  var matSel = materials.find(function(m) { return m.id === matId; });
  var matching = (typeof inventory !== 'undefined' ? inventory : []).filter(function(it) {
    if (it.materialId) return it.materialId === matId;
    /* Respaldo para rollos que la migración no pudo resolver porque su
       material ya no existe en el catálogo. */
    return matSel && it.material &&
           it.material.toLowerCase() === matSel.name.toLowerCase();
  });

  var prevId = hiddenEl.value;

  /* Chip "Cualquier color" siempre presente */
  var anyActive = !prevId || !matching.some(function(it) { return it.id === prevId; });
  var html = '<button type="button" class="color-chip' + (anyActive ? ' active' : '') +
    '" id="color-chip-any" onclick="_selectColorChip(this,\'\')">' +
    '<span style="width:12px;height:12px;border-radius:50%;background:var(--bg-sunk);border:1px solid var(--line);flex-shrink:0;display:inline-block"></span>' +
    '<span>Cualquier color</span>' +
    '</button>';

  matching.forEach(function(it) {
    var dot   = it.colorHex
      ? 'background:' + it.colorHex + ';border:none'
      : 'background:var(--bg-sunk);border:1px solid var(--line)';
    var label = (it.color || nombreMaterialDeRollo(it));
    var remain= (it.remainingG || 0);
    var isActive = it.id === prevId;
    html += '<button type="button" class="color-chip' + (isActive ? ' active' : '') +
      '" onclick="_selectColorChip(this,\'' + it.id + '\')">' +
      '<span style="width:12px;height:12px;border-radius:50%;flex-shrink:0;display:inline-block;' + dot + '"></span>' +
      '<span>' + esc(label) + '</span>' +
      (remain > 0 ? '<span style="font-size:12px;opacity:0.55">' + remain.toFixed(0) + 'g</span>' : '') +
      '</button>';
  });

  chipsEl.innerHTML = html;

  /* Si la selección previa ya no existe, resetear */
  if (prevId && !matching.some(function(it) { return it.id === prevId; })) {
    hiddenEl.value = '';
  }
}

/* Selecciona un chip y actualiza el input oculto */
function _selectColorChip(btn, spoolId) {
  var chipsEl = document.getElementById('calc-color-chips');
  if (chipsEl) {
    chipsEl.querySelectorAll('.color-chip').forEach(function(c) { c.classList.remove('active'); });
  }
  btn.classList.add('active');
  var hiddenEl = document.getElementById('calc-spool');
  if (hiddenEl) hiddenEl.value = spoolId;
}

/* ── Mostrar/ocultar y renderizar bloque AMS multicolor ─────────── */
function _updateAMSBlock() {
  var printerEl = document.getElementById('calc-printer');
  var block     = document.getElementById('calc-ams-block');
  if (!block || !printerEl) return;

  var printer    = printers.find(function(p) { return p.id === printerEl.value; });
  var isMulti    = printer && (printer.multicolor === true ||
                   (printer.name && printer.name.toLowerCase().indexOf('ams') !== -1));
  var spoolWrap  = document.getElementById('field-spool-wrap');

  if (isMulti) {
    block.classList.remove('hidden');
    /* Ocultar selector de rollo individual — AMS gestiona sus propios colores */
    if (spoolWrap) spoolWrap.style.display = 'none';
    /* Prefill de la purga con el valor de Ajustes, sin pisar lo que el usuario escribió */
    var purgeInp = document.getElementById('ams-purge-grams');
    if (purgeInp && purgeInp.value === '') purgeInp.value = (config.amsPurgeGrams || 0.7);
    _renderAMSSlots();
  } else {
    block.classList.add('hidden');
    /* Restaurar selector de color según inventario */
    if (spoolWrap) spoolWrap.style.display = '';
    _updateSpoolSelector();
  }
}

function _renderAMSSlots() {
  var container = document.getElementById('ams-color-slots');
  if (!container) return;

  /* Obtener número de cabezales de la impresora activa */
  var printerEl  = document.getElementById('calc-printer');
  var printer    = printerEl ? printers.find(function(p) { return p.id === printerEl.value; }) : null;
  var numHeads   = printer ? (printer.heads || 4) : 4;

  /* Solo re-renderizar si cambió el número de slots */
  if (container.children.length === numHeads) { _populateAMSSpools(); return; }

  container.innerHTML = '';
  for (var i = 0; i < numHeads; i++) {
    var slot = document.createElement('div');
    slot.className = 'ams-slot';
    slot.dataset.slot = i;
    slot.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px';
    slot.innerHTML =
      '<div style="width:22px;height:22px;border-radius:50%;background:var(--bg-sunk);display:flex;align-items:center;justify-content:center;' +
        'font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--ink-3);flex-shrink:0">' + (i+1) + '</div>' +
      '<div class="m3-field" style="flex:2;margin:0">' +
        '<select class="ams-spool-sel" onchange="calculate(true)">' +
          '<option value="">Sin especificar</option>' +
        '</select>' +
        '<label>Cabezal / color ' + (i+1) + '</label>' +
      '</div>' +
      '<div class="m3-field" style="flex:1;margin:0;max-width:80px">' +
        '<input type="number" class="ams-weight-inp" min="0" step="1" placeholder=" " inputmode="decimal" oninput="calculate(true)">' +
        '<label>Gramos</label>' +
      '</div>';
    container.appendChild(slot);
  }
  _populateAMSSpools();
}

function _populateAMSSpools() {
  var slots = document.querySelectorAll('#ams-color-slots .ams-slot');
  slots.forEach(function(slot) {
    var sel = slot.querySelector('.ams-spool-sel');
    if (!sel) return;
    var prev = sel.value;
    var fdmSpools = inventory.filter(function(it) { return (it.remainingG || 0) > 0; });
    sel.innerHTML = '<option value="">Sin especificar</option>' +
      fdmSpools.map(function(it) {
        var label = (it.brand ? it.brand + ' ' : '') + nombreMaterialDeRollo(it) + (it.color ? ' · ' + it.color : '') +
                    ' (' + (it.remainingG||0).toFixed(0) + 'g)';
        return '<option value="' + it.id + '" data-cost="' + (it.costPerKg || 0) + '">' + label + '</option>';
      }).join('');
    if (prev) sel.value = prev;
  });
}

/* ── Ayuda: cómo obtener purga y cambios de color del slicer ───────
   Bottom sheet en móvil, modal centrado en escritorio — ver .help-sheet
   en desktop.css. El drag to dismiss lo engancha native.js al detectar
   .m3-bottom-sheet dentro de #modal-container. */
function showPurgeHelp() {
  var container = document.getElementById('modal-container');
  if (!container) return;

  function step(n, title, body) {
    return '<div style="display:flex;gap:12px;margin-bottom:16px">' +
      '<div style="width:22px;height:22px;border-radius:50%;background:var(--accent-tint);flex-shrink:0;' +
        'display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);' +
        'font-size:12px;font-weight:700;color:var(--accent)">' + n + '</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:13px;font-weight:600;color:var(--ink);margin-bottom:3px">' + title + '</div>' +
        '<div style="font-size:12px;color:var(--ink-3);line-height:1.6">' + body + '</div>' +
      '</div>' +
    '</div>';
  }

  container.innerHTML =
    '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet help-sheet">' +
      '<div class="m3-drag-handle"></div>' +
      '<h2>Datos de purga</h2>' +
      '<div style="font-size:12px;color:var(--ink-3);line-height:1.6;margin-bottom:20px">' +
        'El slicer ya calcula los dos números. Rebana la pieza y abre ' +
        '<strong style="color:var(--ink-2)">Resultado del corte</strong>.' +
      '</div>' +

      step(1, 'Cambios de color',
        'Copia el valor de «Tiempos de cambio en el filamento». No es el número de colores: ' +
        'una pieza multicolor alterna colores varias veces por capa.') +

      step(2, 'Purga por cambio',
        'En el renglón <strong style="color:var(--ink-2)">Total</strong>, suma ' +
        '<em>Expulsado</em> + <em>Torre</em> y divide entre los cambios.') +

      /* Ejemplo trabajado */
      '<div style="background:var(--bg-sunk);border-radius:10px;padding:14px 16px;margin-bottom:16px">' +
        '<div class="micro" style="color:var(--ink-4);margin-bottom:10px">Ejemplo · pieza de 4 colores</div>' +
        '<div style="font-family:var(--font-mono);font-size:12px;color:var(--ink-2);line-height:1.9">' +
          '<div style="display:flex;justify-content:space-between"><span>Expulsado</span><span>4,90 g</span></div>' +
          '<div style="display:flex;justify-content:space-between"><span>Torre</span><span>1,09 g</span></div>' +
          '<div style="display:flex;justify-content:space-between;border-top:0.5px solid var(--line);margin-top:6px;padding-top:6px">' +
            '<span>Desperdicio</span><span>5,99 g</span></div>' +
          '<div style="display:flex;justify-content:space-between;color:var(--ink-4)"><span>÷ 9 cambios</span></div>' +
          '<div style="display:flex;justify-content:space-between;color:var(--accent);font-weight:600">' +
            '<span>Purga por cambio</span><span>0,67 g</span></div>' +
        '</div>' +
      '</div>' +

      /* Tabla de referencia */
      '<div class="micro" style="color:var(--ink-4);margin-bottom:8px">Referencia en PLA</div>' +
      '<div style="border:0.5px solid var(--line);border-radius:10px;overflow:hidden;margin-bottom:18px">' +
        [['Entre tonos parecidos', '0,25 g'],
         ['Típico', '0,7 g'],
         ['De oscuro a claro', '0,9 g']].map(function(r, i) {
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px' +
            (i < 2 ? ';border-bottom:0.5px solid var(--line)' : '') + '">' +
            '<span style="font-size:12px;color:var(--ink-2)">' + r[0] + '</span>' +
            '<span class="num" style="font-size:12px;color:var(--ink)">' + r[1] + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +

      '<div style="font-size:12px;color:var(--ink-4);line-height:1.6;margin-bottom:20px">' +
        'Si dejas «cambios» vacío se asume uno por color — el mínimo teórico, casi siempre corto. ' +
        'La línea de <strong>Purga total</strong> en la calculadora te sirve para comparar ' +
        'contra el desperdicio que reporta el slicer.' +
      '</div>' +

      '<button class="btn btn-primary" style="width:100%" onclick="closeModal()">Entendido</button>' +
    '</div>';
}

/* Lee los datos AMS del DOM → devuelve null si modo inactivo */
function _getAMSData() {
  var block = document.getElementById('calc-ams-block');
  if (!block || block.classList.contains('hidden')) return null;

  var slots = document.querySelectorAll('#ams-color-slots .ams-slot');
  var colors = [];
  slots.forEach(function(slot) {
    var sel    = slot.querySelector('.ams-spool-sel');
    var wInp   = slot.querySelector('.ams-weight-inp');
    var weight = parseFloat((wInp && wInp.value) || 0) || 0;
    if (weight <= 0 && !(sel && sel.value)) return; /* slot vacío */
    var spoolId   = sel ? sel.value : '';
    var costPerKg = 0;
    if (sel && sel.value) {
      var opt = sel.querySelector('option[value="' + sel.value + '"]');
      if (opt) costPerKg = parseFloat(opt.dataset.cost) || 0;
    }
    if (!costPerKg) {
      /* Fallback: costPerKg del material seleccionado globalmente */
      var matEl = document.getElementById('calc-material');
      var mat   = matEl && materials.find(function(m) { return m.id === matEl.value; });
      costPerKg = mat ? mat.costPerKg : 0;
    }
    colors.push({ spoolId: spoolId, weight: weight, costPerKg: costPerKg });
  });

  if (!colors.length) return null;

  /* Purga por cambio — el dato bueno sale del slicer: (Expulsado + Torre) ÷ cambios.
     Referencia en PLA: 0.25 g entre tonos parecidos, 0.7 g típico, 0.9 g oscuro→claro. */
  var purgeEl   = document.getElementById('ams-purge-grams');
  var purgeRaw  = purgeEl ? purgeEl.value : '';
  var purgeGrams = (purgeRaw === '' || purgeRaw === null || purgeRaw === undefined)
    ? (config.amsPurgeGrams || 0.7)
    : (parseFloat(purgeRaw) || 0);

  /* Cambios de color: el slicer los reporta ("Tiempos de cambio en el filamento").
     Sin ese dato se asume uno por color — el mínimo teórico, casi siempre corto,
     porque una pieza multicolor alterna colores varias veces por capa. */
  var changesEl = document.getElementById('ams-color-changes');
  var changes   = parseFloat((changesEl && changesEl.value) || 0) || 0;
  var numPurges = changes > 0 ? changes : Math.max(0, colors.length - 1);

  /* Costo total de material AMS */
  var amsMatCost = colors.reduce(function(s, c) {
    return s + (c.weight / 1000) * c.costPerKg;
  }, 0);

  /* Costo de purga: usa el promedio de costPerKg de los colores activos */
  var avgCostPerKg = colors.reduce(function(s, c) { return s + c.costPerKg; }, 0) / colors.length;
  var purgeCost    = (purgeGrams / 1000) * avgCostPerKg * numPurges;
  var totalWeight  = colors.reduce(function(s, c) { return s + c.weight; }, 0) +
                     purgeGrams * numPurges;

  return { colors: colors, purgeGrams: purgeGrams, numPurges: numPurges,
           amsMatCost: amsMatCost, purgeCost: purgeCost, totalWeight: totalWeight };
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
  /* Guardado diferido: estos campos están en oninput, así que escribir "150"
     disparaba tres guardados. El cálculo sí es inmediato — el usuario ve el
     número actualizarse — pero persistir puede esperar a que deje de teclear. */
  svDebounced('config', config);
  calculate(true);  /* recalcular en tiempo real */
}

/* ── Guardar en historial ─────────────────────────────────────── */
function saveToHistory() {
  /* Antes salía en silencio si no había cálculo, así que el botón parecía roto. */
  if (!lastCalc) { snack('Calcula un costo antes de guardarlo'); return; }
  history.unshift(lastCalc);
  if (history.length > 100) history.pop();
  sv('history', history);
  clearLastCalc();
  /* No ocultamos calc-result — el hero siempre es visible en el nuevo layout */
  snack('Guardado en historial');
}

/* ── Restaurar resultado al volver a la calculadora ──────────── */
function restoreCalcResult() {
  if (!lastCalc) return;
  var cur = config.currency;
  document.getElementById('calc-desc').value              = lastCalc.desc !== 'Sin descripción' ? lastCalc.desc : '';
  /* Se repone lo que se capturó (la placa), no lo que se guardó (la pieza).
     Los cálculos viejos no traen los datos de placa: ahí pieza y placa son
     lo mismo. */
  var piezas = lastCalc.pieces || 1;
  document.getElementById('calc-weight').value            = (lastCalc.plateWeight  != null ? lastCalc.plateWeight  : lastCalc.weight)  || '';
  document.getElementById('calc-time').value              = (lastCalc.plateTimeH   != null ? lastCalc.plateTimeH   : lastCalc.timeH)   || '';
  document.getElementById('calc-design-time').value       = (lastCalc.plateDesignH != null ? lastCalc.plateDesignH : lastCalc.designH) || 0;
  var piezasEl = document.getElementById('calc-pieces');
  if (piezasEl) piezasEl.value = piezas;
  document.getElementById('calc-margin').value            = lastCalc.margin || 50;
  var mnEl = document.getElementById('calc-margin-num');
  if (mnEl) mnEl.value = lastCalc.margin || 50;
  var savedMargin = lastCalc.margin || 50;
  var md2 = document.getElementById('calc-margin-display2');
  if (md2) md2.textContent = savedMargin;
  var mlbl = document.getElementById('calc-margin-label');
  if (mlbl) mlbl.textContent = savedMargin + '% margen';
  var ps = document.getElementById('calc-printer');
  var ms = document.getElementById('calc-material');
  if (lastCalc.printerId)  ps.value = lastCalc.printerId;
  if (lastCalc.materialId) ms.value = lastCalc.materialId;
  document.getElementById('r-mat').textContent            = cur + lastCalc.matCost.toFixed(2);
  document.getElementById('r-energy').textContent         = cur + lastCalc.energyCost.toFixed(2);
  document.getElementById('r-labor').textContent          = cur + lastCalc.laborCost.toFixed(2);
  document.getElementById('r-deprec').textContent         = cur + lastCalc.deprecCost.toFixed(2);
  document.getElementById('r-fixed').textContent          = cur + lastCalc.fixedCost.toFixed(2);
  _setRubroRow('row-maint',    'r-maint',    lastCalc.maintCost    || 0, cur);
  _setRubroRow('row-indirect', 'r-indirect', lastCalc.indirectCost || 0, cur);
  document.getElementById('r-waste').textContent          = cur + lastCalc.wasteCost.toFixed(2);
  document.getElementById('result-base').textContent      = cur + lastCalc.baseCost.toFixed(2);
  document.getElementById('result-total').textContent     = cur + lastCalc.totalCost.toFixed(0);
  /* Ganancia */
  var profitAmt = lastCalc.totalCost - lastCalc.baseCost;
  var profitStr = (profitAmt >= 0 ? '+' : '') + cur + profitAmt.toFixed(2);
  var profitEl  = document.getElementById('result-profit');
  if (profitEl) profitEl.textContent = profitStr;
  var gainEl2 = document.getElementById('result-margin-gain');
  if (gainEl2) gainEl2.textContent = profitStr;

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
  /* Línea "por pieza" — lastCalc ya guarda los valores divididos */
  var ppEl  = document.getElementById('calc-per-piece');
  var ppTxt = document.getElementById('per-piece-detail');
  if (ppEl && ppTxt) {
    if (piezas > 1) {
      ppTxt.textContent = (lastCalc.weight || 0).toFixed(1) + ' g · ' +
        (lastCalc.timeH || 0).toFixed(2) + ' h · ' +
        cur + (lastCalc.baseCost || 0).toFixed(2) + ' de costo · placa de ' + piezas;
      ppEl.classList.remove('hidden');
    } else {
      ppEl.classList.add('hidden');
    }
  }

  /* Garantizar que el panel de resultado sea visible */
  var resEl = document.getElementById('calc-result');
  if (resEl) resEl.classList.remove('hidden');
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
  if (ps) ps.value = p.printerId;
  if (ms) ms.value = p.materialId;
  if (mr) mr.value = p.margin;
  var mnEl = document.getElementById('calc-margin-num');
  if (mnEl) mnEl.value = p.margin;
  var md2 = document.getElementById('calc-margin-display2');
  if (md2) md2.textContent = p.margin;
  var mlbl = document.getElementById('calc-margin-label');
  if (mlbl) mlbl.textContent = p.margin + '% margen';
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
  var p = presets[i]; if (!p) return;
  /* La ✕ vive dentro del chip, así que tarde o temprano se falla el toque.
     Antes borraba al instante, sin preguntar y sin deshacer. */
  m3Confirm('¿Eliminar el preset «' + esc(p.name) + '»?', function() {
    presets.splice(i, 1);
    sv('presets', presets);
    renderPresets();
    snack('Preset eliminado');
  }, { detail: 'Solo se borra el atajo. Tus cotizaciones no se tocan.' });
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

/* ── Toggle desglose ─────────────────────────────────────────── */
function toggleBreakdown() {
  var detail = document.getElementById('breakdown-detail');
  var chev   = document.getElementById('breakdown-chev');
  var lbl    = document.getElementById('breakdown-label');
  if (!detail) return;
  var isOpen = !detail.classList.contains('hidden');
  if (isOpen) {
    detail.classList.add('hidden');
    if (chev) chev.style.transform = '';
    if (lbl && lbl.textContent.startsWith('Ocultar')) {
      lbl.textContent = lbl.textContent.replace('Ocultar', 'Ver');
    }
  } else {
    detail.classList.remove('hidden');
    if (chev) chev.style.transform = 'rotate(90deg)';
    if (lbl && lbl.textContent.startsWith('Ver')) {
      lbl.textContent = lbl.textContent.replace('Ver', 'Ocultar');
    }
  }
}

/* ── Helper: fila de rubro opcional — se oculta cuando vale 0 ──── */
function _setRubroRow(rowId, valId, val, cur) {
  var row = document.getElementById(rowId);
  var el  = document.getElementById(valId);
  if (el)  el.textContent = cur + val.toFixed(2);
  if (row) row.classList.toggle('hidden', !(val > 0));
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
