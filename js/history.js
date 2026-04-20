/* ===== HISTORY PAGE ===== */

function renderHistory() {
  var el = document.getElementById('history-list');
  if (!history.length) {
    el.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded">history</span><p>Sin cálculos guardados. Usa la calculadora y presiona «Guardar».</p></div>';
    return;
  }
  var cur = config.currency;
  el.innerHTML = history.map(function(h, i) {
    return tplHistoryItem(h, i, cur);
  }).join('');
}

function reuseCalc(i) {
  var h = history[i]; if (!h) return;
  /* Prefill calculator fields with saved values */
  document.getElementById('calc-desc').value = h.desc || '';
  document.getElementById('calc-weight').value = h.weight || '';
  document.getElementById('calc-time').value = h.timeH || '';
  document.getElementById('calc-design-time').value = h.designH || 0;
  var savedMargin = h.margin || 50;
  document.getElementById('calc-margin').value = savedMargin;
  var md2r = document.getElementById('calc-margin-display2');
  if (md2r) md2r.textContent = savedMargin;
  var mnElR = document.getElementById('calc-margin-num');
  if (mnElR) mnElR.value = savedMargin;
  var mlblR = document.getElementById('calc-margin-label');
  if (mlblR) mlblR.textContent = savedMargin + '% margen';

  /* Try to select matching printer/material */
  var ps = document.getElementById('calc-printer');
  var ms = document.getElementById('calc-material');
  var pMatch = printers.find(function(p) { return p.name === h.printer; });
  var mMatch = materials.find(function(m) { return m.name === h.material; });
  if (pMatch) ps.value = pMatch.id;
  if (mMatch) ms.value = mMatch.id;

  showPage('calc');
  snack('Datos cargados — ajusta y recalcula');
}

function deleteHistoryItem(i) {
  m3Confirm('¿Eliminar este cálculo del historial?', function() {
    history.splice(i, 1);
    sv('history', history);
    renderHistory();
  });
}

function clearHistory() {
  if (!history.length) { snack('El historial ya está vacío'); return; }
  m3Confirm('¿Limpiar todo el historial?', function() {
    history = [];
    sv('history', history);
    renderHistory();
    snack('Historial eliminado');
  });
}
