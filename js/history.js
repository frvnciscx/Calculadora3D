/* ===== HISTORY PAGE ===== */

function renderHistory() {
  var el = document.getElementById('history-list');
  if (!history.length) {
    el.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded">history</span><p>Sin cálculos guardados. Usa la calculadora y presiona «Guardar».</p></div>';
    return;
  }
  var cur = config.currency;
  el.innerHTML = history.map(function(h, i) {
    return '<div class="hist-item">' +
      '<div class="hist-header">' +
        '<div>' +
          '<div class="hist-desc">' + esc(h.desc) + '</div>' +
          '<div class="hist-date">' + new Date(h.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) + '</div>' +
        '</div>' +
        '<div class="hist-total">' + cur + h.totalCost.toFixed(2) + '</div>' +
      '</div>' +
      '<div class="hist-chips">' +
        '<span class="hist-chip">' + esc(h.printer) + '</span>' +
        '<span class="hist-chip">' + esc(h.material) + '</span>' +
        '<span class="hist-chip">' + h.weight + 'g</span>' +
        '<span class="hist-chip">' + h.timeH + 'hrs</span>' +
        '<span class="hist-chip">Margen ' + h.margin + '%</span>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
        '<button class="m3-btn-text m3-btn-sm" onclick="reuseCalc(' + i + ')">' +
          '<span class="material-symbols-rounded" style="font-size:16px">replay</span> Reusar' +
        '</button>' +
        '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteHistoryItem(' + i + ')">' +
          '<span class="material-symbols-rounded" style="font-size:16px">delete</span>' +
        '</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function reuseCalc(i) {
  var h = history[i]; if (!h) return;
  /* Prefill calculator fields with saved values */
  document.getElementById('calc-desc').value = h.desc || '';
  document.getElementById('calc-weight').value = h.weight || '';
  document.getElementById('calc-time').value = h.timeH || '';
  document.getElementById('calc-design-time').value = h.designH || 0;
  document.getElementById('calc-margin').value = h.margin || 50;
  document.getElementById('calc-margin-display').textContent = (h.margin || 50) + '%';

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
