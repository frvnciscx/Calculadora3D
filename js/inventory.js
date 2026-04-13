/* ===== FILAMENT INVENTORY ===== */

function renderInventory() {
  var el = document.getElementById('inventory-list');
  if (!el) return;

  if (!inventory.length) {
    el.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded">inventory_2</span><p>Sin inventario. Agrega tu primer rollo de filamento.</p></div>';
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

  /* Build material options */
  var matOptions = materials.map(function(m) {
    var sel = item && item.material === m.name ? ' selected' : '';
    return '<option value="' + esc(m.name) + '"' + sel + '>' + esc(m.name) + '</option>';
  }).join('');
  if (!materials.length) matOptions = '<option value="">Sin materiales</option>';

  document.getElementById('modal-container').innerHTML = tplInventoryModal(item, editIndex, matOptions);
}

/* ── Guardar filamento ───────────────────────────────────────────── */
function saveInventory(editIndex) {
  var matEl = document.getElementById('inv-material');
  var material = matEl ? matEl.value.trim() : '';
  if (!material) { snack('Selecciona el material'); return; }

  var totalG     = parseFloat(document.getElementById('inv-total').value)     || 0;
  var remainingG = parseFloat(document.getElementById('inv-remaining').value) || 0;
  if (totalG <= 0) { snack('El peso total debe ser mayor a 0'); return; }
  if (remainingG > totalG) remainingG = totalG;

  var brand    = (document.getElementById('inv-brand')   || {}).value || '';
  var color    = (document.getElementById('inv-color')   || {}).value || '';
  var costPerKg= parseFloat((document.getElementById('inv-cost') || {}).value) || 0;

  var entry = {
    id:         Date.now().toString(),
    material:   material,
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
  if (!confirm('\u00bfEliminar ' + item.material + (item.color ? ' ' + item.color : '') + '?')) return;
  inventory.splice(i, 1);
  sv('inventory', inventory);
  renderInventory();
  snack('Filamento eliminado');
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
