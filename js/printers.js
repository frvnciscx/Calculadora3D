/* ===== PRINTERS CRUD ===== */
function renderPrinters() {
  const el = document.getElementById('printer-list');
  if (!printers.length) {
    el.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded">print</span><p>No hay impresoras. Agrega una.</p></div>';
    return;
  }
  const cur = config.currency;
  el.innerHTML = printers.map(p => tplPrinterItem(p, cur)).join('');
}

function showPrinterModal(editId) {
  const e = editId ? printers.find(p => p.id === editId) : null;
  document.getElementById('modal-container').innerHTML = tplPrinterModal(e, editId);
}

function savePrinter(editId) {
  const name = document.getElementById('mod-p-name').value.trim();
  const power = parseFloat(document.getElementById('mod-p-power').value) || 0;
  const type = document.getElementById('mod-p-type').value;
  const cost = parseFloat(document.getElementById('mod-p-cost').value) || 0;
  const lifeHours = parseFloat(document.getElementById('mod-p-life').value) || 0;
  if (!name || power <= 0) { snack('Completa nombre y potencia'); return; }
  if (editId) {
    const p = printers.find(p => p.id === editId);
    if (p) { p.name = name; p.power = power; p.type = type; p.cost = cost; p.lifeHours = lifeHours; }
  } else {
    printers.push({ id: Date.now().toString(), name, power, type, cost, lifeHours });
  }
  sv('printers', printers); closeModal(); renderPrinters();
  snack(editId ? 'Impresora actualizada' : 'Impresora agregada');
}

function deletePrinter(id) {
  m3Confirm('¿Eliminar impresora?', function() {
    printers = printers.filter(p => p.id !== id);
    sv('printers', printers); renderPrinters();
  });
}
