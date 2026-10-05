/* ===== FILAMENT INVENTORY ===== */

function renderInventory() {
  var el = document.getElementById('inventory-list');
  if (!el) return;

  marcarListaVacia('inventory', !inventory.length);
  if (!inventory.length) {
    el.innerHTML = tplEmptyState('inventory_2',
      'Sin rollos registrados',
      'Lleva el control de cuánto filamento te queda. Al aceptar una cotización se descuenta solo.',
      { label: 'Agregar filamento', onclick: 'showInventoryModal()', icon: 'add' });
    return;
  }

  var cur = config.currency || '$';

  el.innerHTML = inventory.map(function(item, i) {
    return tplInventoryCard(item, i, cur);
  }).join('');
}

/* ── Modal alta/edición ──────────────────────────────────────────── */
function showInventoryModal(editIndex) {
  var item = editIndex != null ? inventory[editIndex] : null;
  var title = item ? 'Editar filamento' : 'Agregar filamento';

  /* Opciones de material — el value es el ID, no el nombre, para que
     renombrar un material no desvincule los rollos. */
  var matOptions = materials.map(function(m) {
    var sel = item && item.materialId === m.id ? ' selected' : '';
    return '<option value="' + esc(m.id) + '"' + sel + '>' + esc(m.name) + '</option>';
  }).join('');
  if (!materials.length) matOptions = '<option value="">Sin materiales</option>';

  document.getElementById('modal-container').innerHTML = tplInventoryModal(item, editIndex, matOptions);
}

/* ── Guardar filamento ───────────────────────────────────────────── */
function saveInventory(editIndex) {
  var matEl = document.getElementById('inv-material');
  var materialId = matEl ? matEl.value.trim() : '';
  if (!materialId) { snack('Selecciona el material'); return; }
  var matObj = materials.find(function(m) { return m.id === materialId; });
  if (!matObj) { snack('El material seleccionado ya no existe'); return; }

  var totalG     = parseFloat(document.getElementById('inv-total').value)     || 0;
  var remainingG = parseFloat(document.getElementById('inv-remaining').value) || 0;
  if (totalG <= 0) { snack('El peso total debe ser mayor a 0'); return; }
  if (remainingG > totalG) remainingG = totalG;

  var brand    = (document.getElementById('inv-brand')   || {}).value || '';
  var color    = (document.getElementById('inv-color')   || {}).value || '';
  var costPerKg= parseFloat((document.getElementById('inv-cost') || {}).value) || 0;

  var entry = {
    id:         Date.now().toString(),
    materialId: materialId,        /* vínculo vivo con el catálogo */
    material:   matObj.name,       /* copia legible, respaldo si se borra */
    brand:      brand.trim(),
    color:      color.trim(),
    totalG:     totalG,
    remainingG: remainingG,
    costPerKg:  costPerKg || null
  };

  if (editIndex != null && inventory[editIndex]) {
    entry.id = inventory[editIndex].id;
    inventory[editIndex] = entry;
    snack('Filamento actualizado');
  } else {
    inventory.push(entry);
    snack('Filamento agregado');
  }

  sv('inventory', inventory);
  closeModal();
  renderInventory();
}

/* ── Modal descontar gramos ──────────────────────────────────────── */
function showDeductModal(i) {
  var item = inventory[i]; if (!item) return;

  document.getElementById('modal-container').innerHTML = tplDeductModal(item, i);
}

function deductInventory(i) {
  var item = inventory[i]; if (!item) return;
  var grams = parseFloat((document.getElementById('deduct-g') || {}).value) || 0;
  if (grams <= 0) { snack('Ingresa la cantidad a descontar'); return; }

  var newRemaining = Math.max(0, (parseFloat(item.remainingG) || 0) - grams);
  inventory[i].remainingG = newRemaining;
  sv('inventory', inventory);
  closeModal();
  renderInventory();
  snack(grams.toFixed(0) + 'g descontados. Restante: ' + newRemaining.toFixed(0) + 'g');
}

/* ── Eliminar ────────────────────────────────────────────────────── */
function deleteInventory(i) {
  var item = inventory[i]; if (!item) return;
  var nombre = nombreMaterialDeRollo(item) + (item.color ? ' ' + item.color : '');
  m3Confirm('\u00bfEliminar ' + esc(nombre) + '?', function() {
    inventory.splice(i, 1);
    sv('inventory', inventory);
    renderInventory();
    snack('Filamento eliminado');
  }, { detail: 'Quedan ' + (item.remainingG || 0).toFixed(0) + ' g sin usar en este rollo.' });
}

/* ── Resumen de inventario para dashboard ────────────────────────── */
function getInventorySummary() {
  var total = inventory.length;
  var lowStock = inventory.filter(function(it) {
    var pct = it.totalG > 0 ? (it.remainingG / it.totalG) * 100 : 0;
    return pct <= 20;
  }).length;
  return { total: total, lowStock: lowStock };
}
