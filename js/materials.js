/* ===== MATERIALS CRUD ===== */
function renderMaterials() {
  const el = document.getElementById('material-list');
  if (!materials.length) {
    el.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded">category</span><p>No hay materiales.</p></div>';
    return;
  }
  const cur = config.currency;
  el.innerHTML = materials.map(m => `
    <div class="m3-list-item">
      <div class="leading"><span class="material-symbols-rounded">category</span></div>
      <div class="content">
        <h3>${m.name}</h3>
        <p>${cur}${m.costPerKg}/kg · ${m.type} · ${m.density} g/cm³</p>
      </div>
      <div class="actions">
        <button class="m3-btn-text m3-btn-sm" onclick="showMaterialModal('${m.id}')">
          <span class="material-symbols-rounded" style="font-size:18px">edit</span>
        </button>
        <button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteMaterial('${m.id}')">
          <span class="material-symbols-rounded" style="font-size:18px">delete</span>
        </button>
      </div>
    </div>
  `).join('');
}

function showMaterialModal(editId) {
  const e = editId ? materials.find(m => m.id === editId) : null;
  document.getElementById('modal-container').innerHTML = `
    <div class="m3-scrim" onclick="closeModal()"></div>
    <div class="m3-bottom-sheet">
      <div class="m3-drag-handle"></div>
      <h2>${e ? 'Editar' : 'Nuevo'} material</h2>
      <div class="m3-field">
        <input type="text" id="mod-m-name" value="${e ? e.name : ''}" placeholder=" ">
        <label>Nombre</label>
      </div>
      <div class="flex-row">
        <div class="m3-field">
          <input type="number" id="mod-m-cost" value="${e ? e.costPerKg : ''}" placeholder=" " min="0" step="0.01">
          <label>Costo/kg</label>
        </div>
        <div class="m3-field">
          <input type="number" id="mod-m-density" value="${e ? e.density : '1.24'}" placeholder=" " min="0" step="0.01">
          <label>Densidad (g/cm³)</label>
        </div>
      </div>
      <div class="m3-field">
        <select id="mod-m-type">
          <option value="FDM" ${e && e.type === 'FDM' ? 'selected' : ''}>FDM (Filamento)</option>
          <option value="Resina" ${e && e.type === 'Resina' ? 'selected' : ''}>Resina</option>
        </select>
        <label>Tipo</label>
      </div>
      <div class="m3-sheet-actions">
        <button class="m3-btn-outlined" onclick="closeModal()">Cancelar</button>
        <button class="m3-btn-filled" onclick="saveMaterial('${editId || ''}')">Guardar</button>
      </div>
    </div>`;
}

function saveMaterial(editId) {
  const name = document.getElementById('mod-m-name').value.trim();
  const costPerKg = parseFloat(document.getElementById('mod-m-cost').value) || 0;
  const density = parseFloat(document.getElementById('mod-m-density').value) || 1.24;
  const type = document.getElementById('mod-m-type').value;
  if (!name || costPerKg <= 0) { snack('Completa nombre y costo'); return; }
  if (editId) {
    const m = materials.find(m => m.id === editId);
    if (m) { m.name = name; m.costPerKg = costPerKg; m.density = density; m.type = type; }
  } else {
    materials.push({ id: Date.now().toString(), name, costPerKg, density, type });
  }
  sv('materials', materials); closeModal(); renderMaterials();
  snack(editId ? 'Material actualizado' : 'Material agregado');
}

function deleteMaterial(id) {
  m3Confirm('¿Eliminar material?', function() {
    materials = materials.filter(m => m.id !== id);
    sv('materials', materials); renderMaterials();
  });
}
