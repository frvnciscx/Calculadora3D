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
    var total   = parseFloat(item.totalG)     || 0;
    var remain  = parseFloat(item.remainingG) || 0;
    if (remain > total) remain = total;
    var pct     = total > 0 ? Math.round((remain / total) * 100) : 0;
    var used    = total - remain;

    /* Color indicator */
    var barColor = pct > 50 ? 'var(--accent-mint)' : pct > 20 ? '#F9A825' : 'var(--md-error)';
    var alertIcon = pct <= 20 ? '<span class="material-symbols-rounded" style="color:var(--md-error);font-size:16px;margin-left:4px" title="Stock bajo">warning</span>' : '';

    return '<div class="inv-card">' +
      '<div class="inv-header">' +
        '<div class="inv-info">' +
          '<div class="inv-name">' + esc(item.material) + alertIcon + '</div>' +
          '<div class="inv-sub">' + esc(item.brand || '') + (item.color ? ' &middot; ' + esc(item.color) : '') + '</div>' +
        '</div>' +
        '<div class="inv-weight-block">' +
          '<div class="inv-weight-val">' + remain.toFixed(0) + '<span class="inv-weight-unit">g</span></div>' +
          '<div class="inv-weight-sub">de ' + total.toFixed(0) + 'g</div>' +
        '</div>' +
      '</div>' +
      '<div class="inv-bar-wrap">' +
        '<div class="inv-bar" style="width:' + pct + '%;background:' + barColor + '"></div>' +
      '</div>' +
      '<div class="inv-stats">' +
        '<span>' + pct + '% restante</span>' +
        '<span>' + used.toFixed(0) + 'g usado</span>' +
        (item.costPerKg ? '<span>' + cur + ((remain / 1000) * item.costPerKg).toFixed(2) + ' en stock</span>' : '') +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
        '<button class="m3-btn-text m3-btn-sm" onclick="showDeductModal(' + i + ')">' +
          '<span class="material-symbols-rounded" style="font-size:16px">remove</span> Descontar' +
        '</button>' +
        '<button class="m3-btn-text m3-btn-sm" onclick="showInventoryModal(' + i + ')">' +
          '<span class="material-symbols-rounded" style="font-size:16px">edit</span> Editar' +
        '</button>' +
        '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteInventory(' + i + ')">' +
          '<span class="material-symbols-rounded" style="font-size:16px">delete</span>' +
        '</button>' +
      '</div>' +
    '</div>';
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

  document.getElementById('modal-container').innerHTML =
    '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      '<div class="m3-drag-handle"></div>' +
      '<h2>' + title + '</h2>' +
      '<div class="flex-row">' +
        '<div class="m3-field" style="flex:2">' +
          '<select id="inv-material">' + matOptions + '</select>' +
          '<label for="inv-material">Material</label>' +
        '</div>' +
        '<div class="m3-field optional" style="flex:1">' +
          '<input type="text" id="inv-color" placeholder=" " value="' + esc(item ? item.color || '' : '') + '">' +
          '<label for="inv-color">Color</label>' +
        '</div>' +
      '</div>' +
      '<div class="m3-field optional">' +
        '<input type="text" id="inv-brand" placeholder=" " value="' + esc(item ? item.brand || '' : '') + '">' +
        '<label for="inv-brand">Marca</label>' +
      '</div>' +
      '<div class="flex-row">' +
        '<div class="m3-field" style="flex:1">' +
          '<input type="number" id="inv-total" placeholder=" " inputmode="decimal" min="1" step="1" value="' + (item ? item.totalG || '' : '1000') + '">' +
          '<label for="inv-total">Peso total (g)</label>' +
        '</div>' +
        '<div class="m3-field" style="flex:1">' +
          '<input type="number" id="inv-remaining" placeholder=" " inputmode="decimal" min="0" step="1" value="' + (item ? item.remainingG || '' : '1000') + '">' +
          '<label for="inv-remaining">Restante (g)</label>' +
        '</div>' +
      '</div>' +
      '<div class="m3-field optional">' +
        '<input type="number" id="inv-cost" placeholder=" " inputmode="decimal" min="0" step="1" value="' + (item ? item.costPerKg || '' : '') + '">' +
        '<label for="inv-cost">Costo por kg (opcional)</label>' +
      '</div>' +
      '<div class="m3-sheet-actions">' +
        '<button class="m3-btn-outlined" onclick="closeModal()">Cancelar</button>' +
        '<button class="m3-btn-filled" onclick="saveInventory(' + (editIndex != null ? editIndex : 'null') + ')">Guardar</button>' +
      '</div>' +
    '</div>';
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

  document.getElementById('modal-container').innerHTML =
    '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      '<div class="m3-drag-handle"></div>' +
      '<h2>Descontar filamento</h2>' +
      '<p style="font-size:14px;color:var(--md-on-surface-variant);margin-bottom:16px">' +
        esc(item.material) + (item.color ? ' ' + esc(item.color) : '') +
        ' &mdash; Restante: ' + (parseFloat(item.remainingG)||0).toFixed(0) + 'g' +
      '</p>' +
      '<div class="m3-field">' +
        '<input type="number" id="deduct-g" placeholder=" " inputmode="decimal" min="1" step="0.1">' +
        '<label for="deduct-g">Gramos a descontar</label>' +
      '</div>' +
      '<div class="m3-sheet-actions">' +
        '<button class="m3-btn-outlined" onclick="closeModal()">Cancelar</button>' +
        '<button class="m3-btn-filled" onclick="deductInventory(' + i + ')">Descontar</button>' +
      '</div>' +
    '</div>';
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
