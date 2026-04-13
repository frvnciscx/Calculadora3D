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

/* ── Buscar cliente por nombre ───────────────────────────────────── */
function getClientByName(name) {
  if (!name) return null;
  var low = name.toLowerCase();
  return clients.find(function(c) { return c.name.toLowerCase() === low; }) || null;
}

/* ── Autocompletado de cliente en modal de cotización ────────────── */
function onClientInput(input) {
  var val  = input.value.trim().toLowerCase();
  var box  = document.getElementById('q-client-suggestions');
  if (!box) return;

  if (!val || !clients.length) { box.innerHTML = ''; return; }

  var matches = clients.filter(function(c) {
    return c.name.toLowerCase().indexOf(val) !== -1;
  }).slice(0, 5);

  if (!matches.length) { box.innerHTML = ''; return; }

  box.innerHTML = matches.map(function(c) {
    var initial = (c.name || '?')[0].toUpperCase();
    var sub     = [c.phone, c.email].filter(Boolean).join(' · ');
    return '<button class="client-suggest-item" onclick="selectClientSuggestion(' + JSON.stringify(esc(c.name)) + ',' + JSON.stringify(esc(c.phone || '')) + ')">' +
      '<span class="suggest-avatar">' + initial + '</span>' +
      '<span class="suggest-info">' +
        '<span class="suggest-name">' + esc(c.name) + '</span>' +
        (sub ? '<span class="suggest-sub">' + esc(sub) + '</span>' : '') +
      '</span>' +
    '</button>';
  }).join('');
}

function selectClientSuggestion(name, phone) {
  var nameEl  = document.getElementById('q-client');
  var phoneEl = document.getElementById('q-phone');
  var box     = document.getElementById('q-client-suggestions');
  if (nameEl)  nameEl.value  = name;
  if (phoneEl && phone) phoneEl.value = phone;
  if (box)     box.innerHTML = '';
  /* Actualizar borrador en memoria */
  if (draftQuote) {
    draftQuote.client = name;
    draftQuote.phone  = phone;
    saveDraftQuote(draftQuote);
  }
}

/* ── Toggle cotizaciones por cliente ────────────────────────────── */
var _clientQuoteTabState = {};   /* { clientIdx: 'pendiente' | 'aceptada' } */

function toggleClientQuotes(i) {
  var section   = document.getElementById('cq-section-' + i);
  var labelEl   = document.getElementById('cq-toggle-label-' + i);
  var c         = clients[i]; if (!section || !c) return;

  var isOpen = !section.classList.contains('hidden');
  if (isOpen) {
    section.classList.add('hidden');
    var clientQuotes = _clientQuotes(c);
    if (labelEl) labelEl.textContent = 'Ver ' + clientQuotes.length + ' cotizaci' + (clientQuotes.length === 1 ? 'ón' : 'ones');
    return;
  }

  section.classList.remove('hidden');
  if (labelEl) labelEl.textContent = 'Ocultar';

  /* Renderizar con la tab activa guardada (o 'pendiente' por defecto) */
  var tab = _clientQuoteTabState[i] || 'pendiente';
  _renderClientQuoteList(i, tab);
  _setActiveTab(i, tab);
}

function setClientQuoteTab(i, tab) {
  _clientQuoteTabState[i] = tab;
  _renderClientQuoteList(i, tab);
  _setActiveTab(i, tab);
}

function _clientQuotes(c) {
  var name = (c.name || '').toLowerCase();
  return quotes.filter(function(q) {
    return q.client && q.client.toLowerCase() === name;
  });
}

function _renderClientQuoteList(i, tab) {
  var listEl = document.getElementById('cq-list-' + i);
  var c      = clients[i];
  if (!listEl || !c) return;

  var cur      = config.currency || '$';
  var filtered = _clientQuotes(c).filter(function(q) {
    return (q.status || 'pendiente') === tab;
  });

  if (!filtered.length) {
    listEl.innerHTML = '<div class="cq-empty">Sin cotizaciones ' + (tab === 'pendiente' ? 'pendientes' : 'aceptadas') + '</div>';
    return;
  }

  listEl.innerHTML = filtered.map(function(q) {
    var qi = quotes.indexOf(q);
    return tplClientQuoteRow(q, qi, cur);
  }).join('');
}

function _setActiveTab(i, tab) {
  ['pendiente', 'aceptada'].forEach(function(t) {
    var btn = document.getElementById('cq-tab-' + t + '-' + i);
    if (btn) btn.classList.toggle('active', t === tab);
  });
}
