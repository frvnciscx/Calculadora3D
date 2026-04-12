/* ===== CLIENTS ===== */

function renderClients() {
  var el = document.getElementById('clients-list');
  if (!el) return;

  if (!clients.length) {
    el.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded">person_off</span><p>Sin clientes. Agrega tu primer cliente.</p></div>';
    return;
  }

  el.innerHTML = clients.map(function(c, i) {
    var quotesForClient = quotes.filter(function(q) {
      return q.client && q.client.toLowerCase() === (c.name || '').toLowerCase();
    });
    var totalSpent = quotesForClient.reduce(function(s, q) {
      var t = q.grandTotal != null ? q.grandTotal : (q.totalWithQty != null ? q.totalWithQty : 0);
      return s + t;
    }, 0);

    var waBtn = c.phone
      ? '<a href="https://wa.me/' + c.phone.replace(/\D/g,'') + '" target="_blank" class="m3-btn-text m3-btn-sm" style="color:#25D366;text-decoration:none;display:inline-flex;align-items:center;gap:4px">' +
          '<span class="material-symbols-rounded" style="font-size:16px">chat</span> WA' +
        '</a>'
      : '';

    return '<div class="client-card">' +
      '<div class="client-header">' +
        '<div class="client-avatar">' + (c.name || '?')[0].toUpperCase() + '</div>' +
        '<div class="client-info">' +
          '<div class="client-name">' + esc(c.name) + '</div>' +
          (c.phone ? '<div class="client-sub">' + esc(c.phone) + '</div>' : '') +
          (c.email ? '<div class="client-sub">' + esc(c.email) + '</div>' : '') +
        '</div>' +
        '<div class="client-stats">' +
          '<div class="client-stat-val">' + quotesForClient.length + '</div>' +
          '<div class="client-stat-lbl">cotizaciones</div>' +
        '</div>' +
      '</div>' +
      (c.notes ? '<div class="client-notes">' + esc(c.notes) + '</div>' : '') +
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center">' +
        (totalSpent > 0 ? '<span class="hist-chip">' + (config.currency || '$') + totalSpent.toFixed(2) + ' cotizado</span>' : '') +
        waBtn +
        '<button class="m3-btn-text m3-btn-sm" onclick="showClientModal(' + i + ')">' +
          '<span class="material-symbols-rounded" style="font-size:16px">edit</span> Editar' +
        '</button>' +
        '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteClient(' + i + ')">' +
          '<span class="material-symbols-rounded" style="font-size:16px">delete</span>' +
        '</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ── Modal alta/edición de cliente ───────────────────────────────── */
function showClientModal(editIndex) {
  var c = editIndex != null ? clients[editIndex] : null;
  var title = c ? 'Editar cliente' : 'Nuevo cliente';

  document.getElementById('modal-container').innerHTML =
    '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      '<div class="m3-drag-handle"></div>' +
      '<h2>' + title + '</h2>' +
      '<div class="m3-field">' +
        '<input type="text" id="cli-name" placeholder=" " value="' + esc(c ? c.name : '') + '">' +
        '<label for="cli-name">Nombre del cliente</label>' +
      '</div>' +
      '<div class="flex-row">' +
        '<div class="m3-field" style="flex:1">' +
          '<input type="tel" id="cli-phone" placeholder=" " inputmode="tel" value="' + esc(c ? c.phone || '' : '') + '">' +
          '<label for="cli-phone">Tel\u00e9fono / WhatsApp</label>' +
        '</div>' +
        '<div class="m3-field optional" style="flex:1">' +
          '<input type="email" id="cli-email" placeholder=" " inputmode="email" value="' + esc(c ? c.email || '' : '') + '">' +
          '<label for="cli-email">Email</label>' +
        '</div>' +
      '</div>' +
      '<div class="m3-field optional">' +
        '<textarea id="cli-notes" placeholder=" ">' + esc(c ? c.notes || '' : '') + '</textarea>' +
        '<label for="cli-notes">Notas</label>' +
      '</div>' +
      '<div class="m3-sheet-actions">' +
        '<button class="m3-btn-outlined" onclick="closeModal()">Cancelar</button>' +
        '<button class="m3-btn-filled" onclick="saveClient(' + (editIndex != null ? editIndex : 'null') + ')">Guardar</button>' +
      '</div>' +
    '</div>';
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
