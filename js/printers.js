/* ===== PRINTERS CRUD ===== */
function renderPrinters() {
  const el = document.getElementById('printer-list');
  marcarListaVacia('printers', !printers.length);
  if (!printers.length) {
    el.innerHTML = tplEmptyState('print',
      'Sin impresoras',
      'Agrega tus impresoras con su consumo y vida útil para que el costo por hora salga bien.',
      { label: 'Agregar impresora', onclick: 'showPrinterModal()', icon: 'add' });
    return;
  }
  const cur = config.currency;
  el.innerHTML = printers.map(p => tplPrinterItem(p, cur)).join('');
}

function showPrinterModal(editId) {
  const e = editId ? printers.find(p => p.id === editId) : null;
  document.getElementById('modal-container').innerHTML = tplPrinterModal(e, editId);
}

/* Toggle multicolor en el modal */
function _printerMultiToggle(isMulti) {
  var noBtn    = document.getElementById('mod-p-multi-no');
  var yesBtn   = document.getElementById('mod-p-multi-yes');
  var headsWrap= document.getElementById('mod-p-heads-wrap');
  if (noBtn)    noBtn.classList.toggle('active',  !isMulti);
  if (yesBtn)   yesBtn.classList.toggle('active',  isMulti);
  if (headsWrap) headsWrap.style.display = isMulti ? '' : 'none';
}

function savePrinter(editId) {
  const name      = document.getElementById('mod-p-name').value.trim();
  const power     = parseFloat(document.getElementById('mod-p-power').value) || 0;
  const type      = document.getElementById('mod-p-type').value;
  const cost      = parseFloat(document.getElementById('mod-p-cost').value) || 0;
  const lifeHours = parseFloat(document.getElementById('mod-p-life').value) || 0;
  const yesBtn    = document.getElementById('mod-p-multi-yes');
  const multicolor= yesBtn ? yesBtn.classList.contains('active') : false;
  const headsEl   = document.getElementById('mod-p-heads');
  const heads     = multicolor ? (parseInt((headsEl && headsEl.value) || 4) || 4) : 1;
  if (!name || power <= 0) { snack('Completa nombre y potencia'); return; }
  if (editId) {
    const p = printers.find(p => p.id === editId);
    if (p) { p.name = name; p.power = power; p.type = type; p.cost = cost; p.lifeHours = lifeHours; p.multicolor = multicolor; p.heads = heads; }
  } else {
    printers.push({ id: Date.now().toString(), name, power, type, cost, lifeHours, multicolor, heads });
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
