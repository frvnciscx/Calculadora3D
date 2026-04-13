/* ===== CLIENTS ===== */

function renderClients() {
  var el = document.getElementById('clients-list');
  if (!el) return;

  if (!clients.length) {
    el.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded">person_off</span><p>Sin clientes. Agrega tu primer cliente.</p></div>';
    return;
  }

  var cur = config.currency || '$';
  el.innerHTML = clients.map(function(c, i) {
    var clientQuotes = quotes.filter(function(q) {
      return q.client && q.client.toLowerCase() === (c.name || '').toLowerCase();
    });
    var totalSpent = clientQuotes.reduce(function(s, q) {
      return s + (q.grandTotal != null ? q.grandTotal : (q.totalWithQty != null ? q.totalWithQty : 0));
    }, 0);
    return tplClientCard(c, i, clientQuotes.length, totalSpent, cur);
  }).join('');
}

/* ── Modal alta/edición de cliente ───────────────────────────────── */
function showClientModal(editIndex) {
  var c = editIndex != null ? clients[editIndex] : null;
  var title = c ? 'Editar cliente' : 'Nuevo cliente';

  document.getElementById('modal-container').innerHTML = tplClientModal(c, editIndex);
}

/* ── Guardar cliente ─────────────────────────────────────────────── */
function saveClient(editIndex) {
  var nameEl = document.getElementById('cli-name');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { snack('Ingresa el nombre del cliente'); return; }

  var phone = (document.getElementById('cli-phone') || {}).value || '';
  var email = (document.getElementById('cli-email') || {}).value || '';
  var notes = (document.getElementById('cli-notes') || {}).value || '';

  var c = { id: Date.now().toString(), name: name, phone: phone.trim(), email: email.trim(), notes: notes.trim() };

  if (editIndex != null && clients[editIndex]) {
    c.id = clients[editIndex].id;
    clients[editIndex] = c;
    snack('Cliente actualizado');
  } else {
    clients.unshift(c);
    snack('Cliente agregado');
  }

  sv('clients', clients);
  closeModal();
  renderClients();
}

/* ── Eliminar cliente ────────────────────────────────────────────── */
function deleteClient(i) {
  var c = clients[i]; if (!c) return;
  if (!confirm('¿Eliminar a ' + c.name + '?')) return;
  clients.splice(i, 1);
  sv('clients', clients);
  renderClients();
  snack('Cliente eliminado');
}

/* ── Buscar cliente para autocompletar en cotización ─────────────── */
function getClientByName(name) {
  if (!name) return null;
  var low = name.toLowerCase();
  return clients.find(function(c) { return c.name.toLowerCase() === low; }) || null;
}
