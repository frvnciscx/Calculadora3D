/* ===== CLIENTS ===== */

/* ── Helpers del formulario de cliente ───────────────────────────── */
function _cliInitials(name) {
  return (name || '').split(' ').filter(Boolean).slice(0, 2)
    .map(function(w) { return w[0].toUpperCase(); }).join('') || '—';
}

var _cliActiveSource = 'instagram';
var _cliActiveTag    = 'nuevo';

function _cliSetSource(id) {
  _cliActiveSource = id;
  document.querySelectorAll('#cli-source-group button').forEach(function(btn) {
    var isActive = btn.id === 'cli-src-' + id;
    btn.style.background = isActive ? 'var(--ink)' : 'transparent';
    btn.style.color      = isActive ? 'var(--bg)'  : 'var(--ink-2)';
    btn.style.borderColor = isActive ? 'var(--ink)' : 'var(--line)';
  });
}

function _cliSetTag(id) {
  _cliActiveTag = id;
  document.querySelectorAll('#cli-tag-group button').forEach(function(btn) {
    btn.classList.toggle('active', btn.id === 'cli-tag-' + id);
  });
  var previewTag = document.getElementById('cli-preview-tag');
  if (previewTag) previewTag.textContent = id;
}

function _cliUpdatePreview() {
  var nameEl      = document.getElementById('cli-name');
  var avatarEl    = document.getElementById('cli-avatar');
  var previewRow  = document.getElementById('cli-preview-row');
  var previewAv   = document.getElementById('cli-preview-avatar');
  var previewName = document.getElementById('cli-preview-name');
  if (!nameEl) return;
  var val      = nameEl.value.trim();
  var initials = _cliInitials(val);
  if (avatarEl) {
    avatarEl.textContent = val ? initials : '—';
    avatarEl.style.background = val ? 'var(--ink)' : 'var(--bg-sunk)';
    avatarEl.style.color      = val ? 'var(--bg)'  : 'var(--ink-4)';
  }
  if (previewRow)  previewRow.style.opacity  = val ? '1' : '0.45';
  if (previewAv)   previewAv.textContent     = val ? initials : '—';
  if (previewName) previewName.textContent   = val || 'Nombre del cliente';
}

function renderClients() {
  /* En el nuevo layout los clientes están dentro de page-quotes en #clients-list-panel */
  var el = document.getElementById('clients-list-panel') || document.getElementById('clients-list');
  if (!el) return;

  /* Aplicar filtro de búsqueda */
  var filtered = clients;
  if (_clientSearchTerm) {
    filtered = clients.filter(function(c) {
      return (c.name || '').toLowerCase().indexOf(_clientSearchTerm) !== -1 ||
             (c.phone || '').toLowerCase().indexOf(_clientSearchTerm) !== -1 ||
             (c.email || '').toLowerCase().indexOf(_clientSearchTerm) !== -1;
    });
  }

  /* Era la única lista con el estado vacío a mano: un renglón de texto gris,
     sin icono y sin salida. Ahora usa la misma plantilla que las demás y el
     botón del encabezado se retira mientras ese estado está en pantalla. */
  marcarListaVacia('clients', !clients.length);

  if (!clients.length) {
    el.innerHTML = tplEmptyState('group',
      'Sin clientes',
      'Guarda a quién le cotizas para no volver a teclear su nombre y su teléfono en cada orden.',
      { label: 'Agregar cliente', onclick: 'showClientModal()', icon: 'person_add' });
    return;
  }
  if (!filtered.length) {
    el.innerHTML = tplEmptyState('search_off',
      'Sin resultados',
      'Ningún cliente coincide con «' + esc(_clientSearchTerm) + '».');
    return;
  }

  var cur = config.currency || '$';
  el.innerHTML =
    '<div class="card" style="padding:0 16px">' +
    filtered.map(function(c, i) {
      var realIndex  = clients.indexOf(c);
      var cQuotes    = quotes.filter(function(q) {
        return q.client && q.client.toLowerCase() === (c.name || '').toLowerCase();
      });
      var totalSpent = cQuotes.reduce(function(s, q) {
        return s + (q.grandTotal != null ? q.grandTotal : (q.totalWithQty != null ? q.totalWithQty : 0));
      }, 0);
      var lastQ    = cQuotes[0];
      var lastDate = lastQ
        ? new Date(lastQ.quoteDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
        : null;
      /* Avatar de iniciales */
      var initials = (c.name || '?').split(' ').slice(0, 2).map(function(w) { return w[0] || ''; }).join('').toUpperCase();
      return '<button onclick="showClientDetail(' + realIndex + ')" style="width:100%;text-align:left;background:transparent;display:flex;align-items:center;padding:14px 0;gap:12px;border-bottom:0.5px solid var(--line)">' +
        '<div style="width:38px;height:38px;border-radius:50%;background:var(--bg-sunk);border:0.5px solid var(--line);' +
          'display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;flex-shrink:0;color:var(--ink-2)">' +
          initials +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(c.name) + '</div>' +
          '<div style="font-size:12px;color:var(--ink-3);margin-top:2px">' +
            '<span class="num">' + cQuotes.length + '</span> cot.' +
            (lastDate ? ' · última ' + lastDate : '') +
          '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0">' +
          '<div class="num" style="font-size:13px;font-weight:500">' + (totalSpent > 0 ? cur + totalSpent.toFixed(0) : '—') + '</div>' +
          '<span class="material-symbols-rounded" style="font-size:14px;color:var(--ink-4)">chevron_right</span>' +
        '</div>' +
      '</button>';
    }).join('') +
    '</div>';
}

/* ── Modal alta/edición de cliente ───────────────────────────────── */
function showClientModal(editIndex) {
  var c = editIndex != null ? clients[editIndex] : null;
  /* Resetear estado de chips al abrir */
  _cliActiveSource = (c && c.source) ? c.source : 'instagram';
  _cliActiveTag    = (c && c.tag)    ? c.tag    : 'nuevo';
  document.getElementById('modal-container').innerHTML = tplClientModal(c, editIndex);
}

/* ── Guardar cliente ─────────────────────────────────────────────── */
function saveClient(editIndex) {
  var nameEl = document.getElementById('cli-name');
  var name   = nameEl ? nameEl.value.trim() : '';
  if (!name) { snack('Ingresa el nombre del cliente'); nameEl && nameEl.focus(); return; }

  var phone  = ((document.getElementById('cli-phone')  || {}).value || '').trim();
  var email  = ((document.getElementById('cli-email')  || {}).value || '').trim();
  var social = ((document.getElementById('cli-social') || {}).value || '').trim();
  var notes  = ((document.getElementById('cli-notes')  || {}).value || '').trim();
  var source = _cliActiveSource || 'instagram';
  var tag    = _cliActiveTag    || 'nuevo';

  var c = {
    id:     Date.now().toString(),
    name:   name,
    phone:  phone,
    email:  email,
    social: social,
    notes:  notes,
    source: source,
    tag:    tag,
  };

  if (editIndex != null && clients[editIndex]) {
    c.id = clients[editIndex].id;
    clients[editIndex] = c;
    snack('Cliente actualizado');
  } else {
    clients.unshift(c);
    snack(name.split(' ')[0] + ' agregado a tu lista ✓');
  }

  sv('clients', clients);
  if (typeof dbGuardarCliente === 'function') dbGuardarCliente(c);
  closeModal();
  renderClients();
}

/* ── Eliminar cliente ────────────────────────────────────────────── */
function deleteClient(i) {
  var c = clients[i]; if (!c) return;
  /* Las cotizaciones guardan el nombre por copia, así que NO se pierden
     al borrar al cliente — pero conviene decírselo al usuario. */
  var nCot = (typeof quotes !== 'undefined' ? quotes : []).filter(function(q) {
    return q.client && c.name && q.client.toLowerCase() === c.name.toLowerCase();
  }).length;
  m3Confirm('¿Eliminar a ' + esc(c.name) + '?', function() {
    clients.splice(i, 1);
    sv('clients', clients);
    if (c && c.id && typeof dbBorrarCliente === 'function') dbBorrarCliente(c.id);
    renderClients();
    snack('Cliente eliminado');
  }, { detail: nCot > 0
        ? 'Sus ' + nCot + ' cotizaciones se conservan — guardan el nombre por copia.'
        : 'No tiene cotizaciones registradas.' });
}

/* ── Filtrar lista de clientes en el buscador del tab ────────────── */
var _clientSearchTerm = '';
function onClientSearch(input) {
  _clientSearchTerm = (input.value || '').trim().toLowerCase();
  renderClients();
}

/* ── Buscar cliente por nombre ───────────────────────────────────── */
function getClientByName(name) {
  if (!name) return null;
  var low = name.toLowerCase();
  return clients.find(function(c) { return c.name.toLowerCase() === low; }) || null;
}

/* ── Autocompletado de cliente en modal de cotización ────────────── */
/* Buffer temporal para sugerencias — evita pasar strings en onclick */
var _clientSuggestBuffer = [];

function onClientInput(input) {
  var val  = input.value.trim().toLowerCase();
  var box  = document.getElementById('q-client-suggestions');
  if (!box) return;

  if (!val || !clients.length) { box.innerHTML = ''; _clientSuggestBuffer = []; return; }

  _clientSuggestBuffer = clients.filter(function(c) {
    return c.name.toLowerCase().indexOf(val) !== -1;
  }).slice(0, 5);

  if (!_clientSuggestBuffer.length) { box.innerHTML = ''; return; }

  box.innerHTML = _clientSuggestBuffer.map(function(c, i) {
    var initial = (c.name || '?')[0].toUpperCase();
    var sub     = [c.phone, c.email].filter(Boolean).join(' · ');
    return '<button class="client-suggest-item" onclick="selectClientSuggestion(' + i + ')">' +
      '<span class="suggest-avatar">' + initial + '</span>' +
      '<span class="suggest-info">' +
        '<span class="suggest-name">' + esc(c.name) + '</span>' +
        (sub ? '<span class="suggest-sub">' + esc(sub) + '</span>' : '') +
      '</span>' +
    '</button>';
  }).join('');
}

function selectClientSuggestion(i) {
  var c       = _clientSuggestBuffer[i];
  if (!c) return;
  var nameEl  = document.getElementById('q-client');
  var phoneEl = document.getElementById('q-phone');
  var box     = document.getElementById('q-client-suggestions');
  if (nameEl)  nameEl.value  = c.name;
  if (phoneEl && c.phone) phoneEl.value = c.phone;
  if (box)     box.innerHTML = '';
  _clientSuggestBuffer = [];
  /* Actualizar borrador en memoria */
  if (draftQuote) {
    draftQuote.client = c.name;
    draftQuote.phone  = c.phone || draftQuote.phone;
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

/* ── Detalle de cliente — overlay de pantalla completa ───────────── */
function showClientDetail(i) {
  var c = clients[i]; if (!c) return;
  var cur = config.currency || '$';

  var cQuotes    = _clientQuotes(c);
  var totalSpent = cQuotes.reduce(function(s, q) {
    return s + (q.grandTotal != null ? q.grandTotal : (q.totalWithQty != null ? q.totalWithQty : 0));
  }, 0);
  var avgOrder   = cQuotes.length ? (totalSpent / cQuotes.length) : 0;
  var lastQ      = cQuotes[0];
  var lastDate   = lastQ
    ? new Date(lastQ.quoteDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  var initials   = _cliInitials(c.name);

  /* Tag color */
  var tagColors = { nuevo: 'var(--ink-3)', frecuente: 'var(--accent)', mayorista: 'var(--warn)', vip: 'var(--ok)' };
  var tagColor  = tagColors[c.tag] || 'var(--ink-3)';

  /* Cotizaciones rows */
  var quotesHTML = cQuotes.length ? cQuotes.map(function(q) {
    var qi       = quotes.indexOf(q);
    var qDate    = new Date(q.quoteDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    var qTotal   = q.grandTotal != null ? q.grandTotal : (q.totalWithQty != null ? q.totalWithQty : 0);
    var status   = q.status || 'pendiente';
    var statusColor = status === 'aceptada' ? 'var(--ok)' : status === 'rechazada' ? 'var(--danger)' : 'var(--ink-3)';
    var nItems   = q.items ? q.items.length : 1;
    return '<button onclick="viewQuote(' + qi + ')" style="width:100%;text-align:left;background:transparent;padding:14px 0;display:flex;align-items:center;gap:12px;border-bottom:0.5px solid var(--line)">' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13px;font-weight:500;display:flex;align-items:center;gap:8px">' +
          '<span class="num">' + esc(q.quoteNum || '—') + '</span>' +
          '<span style="font-size:12px;font-family:var(--font-mono);color:' + statusColor + ';text-transform:uppercase;letter-spacing:0.06em">' + status + '</span>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--ink-3);margin-top:2px">' +
          qDate + ' · ' + nItems + ' producto' + (nItems !== 1 ? 's' : '') +
        '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0">' +
        '<span class="num" style="font-size:13px;font-weight:500">' + cur + qTotal.toFixed(0) + '</span>' +
        '<span class="material-symbols-rounded" style="font-size:14px;color:var(--ink-4)">chevron_right</span>' +
      '</div>' +
    '</button>';
  }).join('') :
    '<div style="padding:20px 0;text-align:center;font-size:13px;color:var(--ink-3)">Sin cotizaciones registradas</div>';

  document.getElementById('modal-container').innerHTML =
    '<div style="position:fixed;inset:0;z-index:200;background:var(--bg);overflow-y:auto;display:flex;flex-direction:column">' +

      /* Mini header */
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:0.5px solid var(--line);position:sticky;top:0;background:var(--bg);z-index:1">' +
        '<button onclick="closeModal()" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:var(--bg-sunk);border-radius:10px;color:var(--ink)">' +
          '<span class="material-symbols-rounded" style="font-size:18px">arrow_back</span>' +
        '</button>' +
        '<span style="font-size:14px;font-weight:500">Cliente</span>' +
        '<button onclick="closeModal();showClientModal(' + i + ')" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:var(--bg-sunk);border-radius:10px;color:var(--ink)">' +
          '<span class="material-symbols-rounded" style="font-size:18px">edit</span>' +
        '</button>' +
      '</div>' +

      /* Avatar + nombre */
      '<div style="padding:32px 20px 24px;text-align:center">' +
        '<div style="width:72px;height:72px;border-radius:50%;background:var(--ink);color:var(--bg);font-size:24px;font-weight:600;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' +
          initials +
        '</div>' +
        '<div style="font-size:22px;font-weight:600;letter-spacing:-0.02em">' + esc(c.name) + '</div>' +
        (c.tag ? '<div style="display:inline-block;margin-top:8px;padding:3px 10px;border-radius:20px;border:0.5px solid ' + tagColor + ';font-size:12px;color:' + tagColor + ';letter-spacing:0.06em;text-transform:uppercase">' + esc(c.tag) + '</div>' : '') +
      '</div>' +

      /* Stats row */
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--line);margin:0 20px 24px;border-radius:12px;overflow:hidden">' +
        _statCell(String(cQuotes.length), 'cotizaciones') +
        _statCell(totalSpent > 0 ? cur + totalSpent.toFixed(0) : '—', 'total compra') +
        _statCell(avgOrder > 0 ? cur + avgOrder.toFixed(0) : '—', 'promedio') +
      '</div>' +

      /* Contacto */
      (c.phone || c.email || c.social ? (
        '<div style="margin:0 20px 24px">' +
          '<div class="micro" style="margin-bottom:10px">Contacto</div>' +
          '<div class="card" style="padding:0 16px">' +
            (c.phone  ? '<div class="row" style="padding:12px 0"><span style="font-size:13px;color:var(--ink-2)">Teléfono</span><span class="num" style="font-size:13px">' + esc(c.phone) + '</span></div>' : '') +
            (c.email  ? '<div class="row" style="padding:12px 0"><span style="font-size:13px;color:var(--ink-2)">Email</span><span style="font-size:13px">' + esc(c.email) + '</span></div>' : '') +
            (c.social ? '<div class="row" style="padding:12px 0"><span style="font-size:13px;color:var(--ink-2)">Social</span><span style="font-size:13px">' + esc(c.social) + '</span></div>' : '') +
          '</div>' +
        '</div>'
      ) : '') +

      /* Cotizaciones */
      '<div style="margin:0 20px;padding-bottom:40px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
          '<div class="micro">Cotizaciones</div>' +
          '<div style="font-size:12px;color:var(--ink-3)">Última: ' + lastDate + '</div>' +
        '</div>' +
        '<div class="card" style="padding:0 16px">' + quotesHTML + '</div>' +
      '</div>' +

    '</div>';
}

function _statCell(value, label) {
  return '<div style="background:var(--bg-elev);padding:14px 8px;text-align:center">' +
    '<div class="num" style="font-size:18px;font-weight:600;letter-spacing:-0.02em">' + value + '</div>' +
    '<div style="font-size:12px;color:var(--ink-3);margin-top:3px;letter-spacing:0.04em;text-transform:uppercase">' + label + '</div>' +
  '</div>';
}