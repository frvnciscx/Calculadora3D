/* ===== FILAMENT INVENTORY ===== */

function renderInventory() {
  var el = document.getElementById('inventory-list');
  if (!el) return;

  marcarListaVacia('inventory', !inventory.length);
  var uso = _tarjetaUsoMaterial();
  if (!inventory.length) {
    el.innerHTML = uso + tplEmptyState('inventory_2',
      'Sin rollos registrados',
      'Lleva el control de cuánto filamento te queda. Al aceptar una cotización se descuenta solo.',
      { label: 'Agregar filamento', onclick: 'showInventoryModal()', icon: 'add' });
    return;
  }

  var cur = config.currency || '$';

  el.innerHTML = uso + inventory.map(function(item, i) {
    return tplInventoryCard(item, i, cur);
  }).join('');
}

/* ── Material usado en el mes (D180) ─────────────────────────────── */
/* El nombre vigente: el material del rollo en el AMS, si no el de la pieza */
/* «Material usado» va por rollo de color: «PLA · Rojo», no solo «PLA», para
   pintar cada parte con el color real del filamento (D246). Sin rollo
   elegido, o sin color en el rollo, va el material. */
function _nombreParaUso(item, color) {
  var spoolId = color ? color.spoolId : item.spoolId;
  var rollo = spoolId ? inventory.find(function(r) { return r.id === spoolId; }) : null;
  if (rollo) {
    var nombreRollo = nombreMaterialDeRollo(rollo);
    var tono = String(rollo.color || '').trim();
    return tono ? nombreRollo + ' \u00b7 ' + tono : nombreRollo;
  }
  var id = item.entrada && item.entrada.materialId;
  var m = id ? materials.find(function(x) { return x.id === id; }) : null;
  return m ? m.name : item.material;
}

function _tarjetaUsoMaterial() {
  if (typeof usoDeMaterial !== 'function') return '';
  var u = usoDeMaterial(quotes, new Date(), _nombreParaUso);
  return u.hayDatos ? tplUsoMaterial(u, { colorDe: _colorParaUso }) : '';
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
  var colorHex = ((document.getElementById('inv-color-hex') || {}).value || '').trim();
  var costPerKg= parseFloat((document.getElementById('inv-cost') || {}).value) || 0;

  var entry = {
    id:         Date.now().toString(),
    materialId: materialId,        /* vínculo vivo con el catálogo */
    material:   matObj.name,       /* copia legible, respaldo si se borra */
    brand:      brand.trim(),
    color:      color.trim(),
    /* El color elegido (D185), como lo escribe el slicer: #RRGGBB (D74) */
    colorHex:   /^#[0-9a-f]{6}$/i.test(colorHex) ? colorHex.toUpperCase() : null,
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
  if (typeof dbGuardarRollo === 'function') dbGuardarRollo(entry);
  closeModal();
  renderInventory();
}

/* ── Color del rollo (D185) ──────────────────────────────────────── */
function elegirColorRollo(btn) {
  var yaEra = btn.classList.contains('elegido');
  _marcarColorRollo(yaEra ? '' : btn.getAttribute('data-hex'));
  /* El nombre: se llena si está vacío o si era el de otra muestra; se borra
     al quitar el color, si era el de la muestra */
  var campo = document.getElementById('inv-color');
  if (!campo) return;
  var escrito = campo.value.trim().toLowerCase();
  var esDeLista = COLORES_FILAMENTO.some(function(c) { return c.nombre.toLowerCase() === escrito; });
  if (yaEra) { if (esDeLista) campo.value = ''; return; }
  if (!escrito || esDeLista) campo.value = btn.getAttribute('data-nombre');
}

function elegirColorPropio(input) {
  _marcarColorRollo(input.value);
  /* Un color propio ya no es «Rojo» ni «Azul»: el nombre de la muestra se borra */
  var campo = document.getElementById('inv-color');
  var escrito = campo ? campo.value.trim().toLowerCase() : '';
  if (escrito && COLORES_FILAMENTO.some(function(c) { return c.nombre.toLowerCase() === escrito; })) campo.value = '';
}

function _marcarColorRollo(hex) {
  hex = (hex || '').toUpperCase();
  var guardado = document.getElementById('inv-color-hex');
  if (guardado) guardado.value = hex;
  var deLista = false;
  document.querySelectorAll('.inv-colores .inv-color-muestra[data-hex]').forEach(function(b) {
    var es = !!hex && b.getAttribute('data-hex').toUpperCase() === hex;
    if (es) deLista = true;
    b.classList.toggle('elegido', es);
    b.setAttribute('aria-pressed', es ? 'true' : 'false');
  });
  var otro = document.querySelector('.inv-colores .inv-color-otro');
  if (otro) {
    var propio = !!hex && !deLista;
    otro.classList.toggle('elegido', propio);
    if (propio) otro.style.setProperty('--muestra', hex); else otro.style.removeProperty('--muestra');
  }
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
  if (typeof dbGuardarRollo === 'function') dbGuardarRollo(item);
  closeModal();
  renderInventory();
  snack(grams.toFixed(0) + 'g descontados. Restante: ' + newRemaining.toFixed(0) + 'g');
}

/* ── Eliminar ────────────────────────────────────────────────────── */
function deleteInventory(i) {
  var item = inventory[i]; if (!item) return;
  var nombre = nombreMaterialDeRollo(item) + (item.color ? ' ' + item.color : '');
  var rid = item.id;
  m3Confirm('\u00bfEliminar ' + esc(nombre) + '?', function() {
    inventory.splice(i, 1);
    sv('inventory', inventory);
    if (rid && typeof dbBorrarRollo === 'function') dbBorrarRollo(rid);
    renderInventory();
    snack('Filamento eliminado');
  }, { detail: 'Quedan ' + (item.remainingG || 0).toFixed(0) + ' g sin usar en este rollo.' });
}

/* ── Resumen de inventario para dashboard ────────────────────────── */
function getInventorySummary() {
  var total = inventory.length;
  var lowStock = inventory.filter(function(it) { return estadoDeStock(it) !== 'ok'; }).length;   /* D257 */
  return { total: total, lowStock: lowStock };
}

/* El color real de una parte de «Material usado» («PLA · Rojo»), o '' si no
   hay un rollo con ese nombre y color (D246) */
function _colorParaUso(nombre) {
  var r = inventory.find(function(x) {
    var tono = String(x.color || '').trim();
    return tono && nombreMaterialDeRollo(x) + ' \u00b7 ' + tono === nombre && colorDeRollo(x);
  });
  return r ? colorDeRollo(r) : '';
}
