/* ===== MATERIALS CRUD ===== */
function renderMaterials() {
  const el = document.getElementById('material-list');
  if (!materials.length) {
    el.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded">category</span><p>No hay materiales.</p></div>';
    return;
  }
  const cur = config.currency;
  el.innerHTML = materials.map(m => tplMaterialItem(m, cur)).join('');
}

function showMaterialModal(editId) {
  const e = editId ? materials.find(m => m.id === editId) : null;
  document.getElementById('modal-container').innerHTML = tplMaterialModal(e, editId);
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
