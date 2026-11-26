/* ===== MATERIALS CRUD ===== */
function renderMaterials() {
  const el = document.getElementById('material-list');
  marcarListaVacia('materials', !materials.length);
  /* Vacío: el botón es el del estado vacío, no también «+ Material» (D194) */
  const agregar = document.getElementById('cfg-material-agregar');
  if (agregar) agregar.classList.toggle('hidden', !materials.length);
  if (!materials.length) {
    el.innerHTML = tplEmptyState('category',
      'Sin materiales',
      'Registra los filamentos y resinas que usas, con su precio por kilo. Sin esto no se puede cotizar.',
      { label: 'Agregar material', onclick: 'showMaterialModal()', icon: 'add' },
      { label: 'Agregar los comunes', onclick: 'agregarMaterialesComunes()' });
    return;
  }
  const cur = config.currency;
  const inv = (typeof inventory !== 'undefined') ? inventory : [];
  el.innerHTML = materials.map(function(m) {
    /* Rollos del inventario que coinciden con este material */
    var invItems = inv.filter(function(it) {
      return it.material && m.name && it.material.toLowerCase() === m.name.toLowerCase();
    });
    return tplMaterialItem(m, cur, invItems);
  }).join('');
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
  const targetMat = editId ? materials.find(m => m.id === editId) : materials[materials.length - 1];
  sv('materials', materials);
  if (targetMat && typeof dbGuardarMaterial === 'function') dbGuardarMaterial(targetMat);
  closeModal(); renderMaterials();
  if (typeof populateSelects === 'function') populateSelects();   /* la calculadora lo ve ya */
  snack(editId ? 'Material actualizado' : 'Material agregado');
}

function deleteMaterial(id) {
  m3Confirm('¿Eliminar material?', function() {
    materials = materials.filter(m => m.id !== id);
    sv('materials', materials);
    if (typeof dbBorrarMaterial === 'function') dbBorrarMaterial(id);
    renderMaterials();
    if (typeof populateSelects === 'function') populateSelects();
  });
}

/* «Agregar los comunes» (D195, como pedía D47): PLA, PETG, ABS, TPU y resina
   con precios de referencia, para cambiarlos por los tuyos. Los que ya tengas
   con ese nombre no se repiten. */
function agregarMaterialesComunes() {
  var tiene = materials.map(function(m) { return String(m.name || '').toLowerCase(); });
  var base = Date.now();
  var nuevos = MATERIALS_EJEMPLO
    .filter(function(m) { return tiene.indexOf(m.name.toLowerCase()) === -1; })
    .map(function(m, i) { return Object.assign({}, m, { id: String(base + i) }); });
  if (!nuevos.length) { snack('Ya tienes los materiales comunes'); return; }
  materials = materials.concat(nuevos);
  sv('materials', materials);
  if (typeof dbGuardarMaterial === 'function') nuevos.forEach(function(m) { dbGuardarMaterial(m); });
  renderMaterials();
  if (typeof populateSelects === 'function') populateSelects();
  snack('Agregué ' + nuevos.length + ' materiales. Cambia sus precios por los tuyos');
}
