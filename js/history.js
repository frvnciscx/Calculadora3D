/* ===== HISTORY PAGE ===== */

function renderHistory() {
  var el = document.getElementById('history-list');
  if (!history.length) {
    el.innerHTML = tplEmptyState('history',
      'Sin cálculos guardados',
      'Guarda un cálculo desde la calculadora para reutilizarlo después sin volver a capturarlo.',
      { label: 'Ir a la calculadora', onclick: "showPage('calc')", icon: 'calculate' });
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
  /* Se repone la placa capturada. Los cálculos guardados antes de que
     existiera el campo no traen datos de placa: ahí la placa era una pieza. */
  document.getElementById('calc-weight').value      = (h.plateWeight  != null ? h.plateWeight  : h.weight)  || '';
  document.getElementById('calc-time').value        = (h.plateTimeH   != null ? h.plateTimeH   : h.timeH)   || '';
  document.getElementById('calc-design-time').value = (h.plateDesignH != null ? h.plateDesignH : h.designH) || 0;
  var piezasEl = document.getElementById('calc-pieces');
  if (piezasEl) piezasEl.value = h.pieces || 1;
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
