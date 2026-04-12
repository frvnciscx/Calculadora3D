/* ===== PRINTERS CRUD ===== */
function renderPrinters() {
  const el = document.getElementById('printer-list');
  if (!printers.length) {
    el.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded">print</span><p>No hay impresoras. Agrega una.</p></div>';
    return;
  }
  const cur = config.currency;
  el.innerHTML = printers.map(p => `
    <div class="m3-list-item">
      <div class="leading"><span class="material-symbols-rounded">print</span></div>
      <div class="content">
        <h3>${p.name}</h3>
        <p>${p.power}W · ${p.type} · ${cur}${(p.cost||0).toLocaleString()} · ${p.lifeHours||0}hrs vida</p>
      </div>
      <div class="actions">
        <button class="m3-btn-text m3-btn-sm" onclick="showPrinterModal('${p.id}')">
          <span class="material-symbols-rounded" style="font-size:18px">edit</span>
        </button>
        <button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deletePrinter('${p.id}')">
          <span class="material-symbols-rounded" style="font-size:18px">delete</span>
        </button>
      </div>
    </div>
  `).join('');
}

function showPrinterModal(editId) {
  const e = editId ? printers.find(p => p.id === editId) : null;
  document.getElementById('modal-container').innerHTML = `
    <div class="m3-scrim" onclick="closeModal()"></div>
    <div class="m3-bottom-sheet">
      <div class="m3-drag-handle"></div>
      <h2>${e ? 'Editar' : 'Nueva'} impresora</h2>
      <div class="m3-field">
        <input type="text" id="mod-p-name" value="${e ? e.name : ''}" placeholder=" ">
        <label>Nombre</label>
      </div>
      <div class="flex-row">
        <div class="m3-field">
          <input type="number" id="mod-p-power" value="${e ? e.power : ''}" placeholder=" " min="0">
          <label>Potencia (W)</label>
        </div>
        <div class="m3-field">
          <select id="mod-p-type">
            <option value="FDM" ${e && e.type === 'FDM' ? 'selected' : ''}>FDM</option>
            <option value="Resina" ${e && e.type === 'Resina' ? 'selected' : ''}>Resina</option>
            <option value="SLA" ${e && e.type === 'SLA' ? 'selected' : ''}>SLA</option>
          </select>
          <label>Tipo</label>
        </div>
      </div>
      <div class="flex-row">
        <div class="m3-field">
          <input type="number" id="mod-p-cost" value="${e ? (e.cost || 0) : ''}" placeholder=" " min="0" step="1">
          <label>Costo ($)</label>
        </div>
        <div class="m3-field">
          <input type="number" id="mod-p-life" value="${e ? (e.lifeHours || 0) : ''}" placeholder=" " min="0" step="100">
          <label>Vida útil (hrs)</label>
        </div>
      </div>
      <div class="m3-sheet-actions">
        <button class="m3-btn-outlined" onclick="closeModal()">Cancelar</button>
        <button class="m3-btn-filled" onclick="savePrinter('${editId || ''}')">Guardar</button>
      </div>
    </div>`;
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
