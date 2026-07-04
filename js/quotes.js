/* ===== QUOTES ===== */

/* Next unique quote number — never reuses */
function nextQuoteNum() {
  quoteCounter++;
  sv('quoteCounter', quoteCounter);
  return 'COT-' + String(quoteCounter).padStart(4, '0');
}

/* ── Índice de cotización en edición (null = nueva) ───────────── */
var _editQuoteIndex = null;

/* ── Draft quote (multi-producto en borrador) ─────────────────── */
var draftQuote = (function() {
  try {
    var v = sessionStorage.getItem('c3d_draftQuote');
    return v ? JSON.parse(v) : null;
  } catch { return null; }
})();

function saveDraftQuote(draft) {
  draftQuote = draft;
  try { sessionStorage.setItem('c3d_draftQuote', JSON.stringify(draft)); } catch {}
}

function clearDraftQuote() {
  draftQuote = null;
  try { sessionStorage.removeItem('c3d_draftQuote'); } catch {}
}

/* Actualiza el botón Cotizar según contexto:
   - Sin draft ni cálculo: "Agregar a orden" (addItemToDraft)
   - Draft con ítems y sin cálculo activo: "Generar cotización" (generateQuote)
   - Cálculo activo (con o sin draft): "Agregar a orden" + badge */
function refreshDraftIndicator() {
  var btn = document.getElementById('btn-cotizar');
  if (!btn) return;
  var hasDraft = draftQuote && draftQuote.items && draftQuote.items.length > 0;
  var hasCalc  = !!lastCalc;

  if (hasDraft && !hasCalc) {
    /* Modo: hay productos en borrador pero nada nuevo que agregar → ir a cotizar */
    var n = draftQuote.items.length;
    btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px">receipt_long</span> Generar cotización <span class="draft-badge">' + n + '</span>';
    btn.onclick = generateQuote;
    btn.className = 'btn btn-primary';
  } else {
    /* Modo normal: agregar cálculo actual al borrador */
    btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px">add_shopping_cart</span>'
      + (hasDraft ? ' Agregar a orden <span class="draft-badge">' + draftQuote.items.length + '</span>' : ' Agregar a orden');
    btn.onclick = addItemToDraft;
    btn.className = 'btn btn-primary';
  }
}

/* ── Agregar producto actual al borrador ──────────────────────── */
function addItemToDraft() {
  if (!lastCalc) { snack('Primero calcula un costo'); return; }

  var newItem = {
    desc:       lastCalc.desc,
    printer:    lastCalc.printer,
    material:   lastCalc.material,
    weight:     lastCalc.weight,
    timeH:      lastCalc.timeH,
    designH:    lastCalc.designH || 0,
    margin:     lastCalc.margin,
    matCost:    lastCalc.matCost,
    energyCost: lastCalc.energyCost,
    laborCost:  lastCalc.laborCost || 0,
    deprecCost: lastCalc.deprecCost,
    fixedCost:  lastCalc.fixedCost,
    wasteCost:  lastCalc.wasteCost,
    baseCost:   lastCalc.baseCost,
    totalCost:  lastCalc.totalCost,
    spoolId:    lastCalc.spoolId || '',
    qty:        1
  };

  if (!draftQuote) {
    saveDraftQuote({ client: '', phone: '', notes: '', items: [newItem] });
  } else {
    draftQuote.items.push(newItem);
    saveDraftQuote(draftQuote);
  }

  var n = draftQuote.items.length;
  snack(n === 1 ? 'Producto agregado a la orden' : n + ' productos en la orden');
  refreshDraftIndicator();

  /* Limpiar campos para la siguiente pieza */
  var fields = ['calc-desc', 'calc-weight', 'calc-time', 'calc-design-time'];
  fields.forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  _setFieldState('field-weight', 'helper-weight', 'neutral', 'Ej: 15g para un topper');
  _setFieldState('field-time', 'helper-time', 'neutral', 'Ej: 1.5 hrs');
  clearLastCalc();

  /* Limpiar post-procesado si estaba activo */
  var ppEnabled = document.getElementById('postproc-enabled');
  if (ppEnabled && ppEnabled.checked) {
    ppEnabled.checked = false;
    var ppFields = document.getElementById('postproc-fields');
    if (ppFields) ppFields.classList.add('hidden');
    ['postproc-primer','postproc-varnish','postproc-time'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });
    var colorList = document.getElementById('paint-colors-list');
    if (colorList) colorList.innerHTML = '';
  }

  /* Rehabilitar el botón para la siguiente pieza */
  var btnAdd = document.getElementById('btn-add-item');
  if (btnAdd) {
    btnAdd.classList.remove('item-added');
    btnAdd.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px">add_shopping_cart</span> Agregar a orden';
    btnAdd.disabled = false;
  }
}

/* ── Editar cotización existente (no aceptada) ────────────────── */
function editQuote(i) {
  var q = quotes[i]; if (!q) return;
  if (q.status === 'aceptada') { snack('Las cotizaciones aceptadas no se pueden editar'); return; }
  _editQuoteIndex = i;
  saveDraftQuote({
    client:            q.client   || '',
    phone:             q.phone    || '',
    notes:             q.notes    || '',
    discount:          q.discount || 0,
    commission:        q.commission    || 0,
    commissionEnabled: (q.commission && q.commission > 0) || false,
    items:             JSON.parse(JSON.stringify(q.items || []))
  });
  renderDraftModal();
}

/* ── Abrir modal de cotización ────────────────────────────────── */
function generateQuote() {
  if (!draftQuote || !draftQuote.items.length) {
    snack('Agrega al menos un producto a la orden primero'); return;
  }
  renderDraftModal();
}

/* ── Modal multi-producto ─────────────────────────────────────── */
function renderDraftModal() {
  var draft = draftQuote;
  if (!draft) return;
  document.getElementById('modal-container').innerHTML = tplDraftModal(draft, config.currency);
}

/* ── Cambio de descuento — delega a onCommissionChange ───────── */
function onDiscountChange() { onCommissionChange(); }

/* ── Toggle de comisión ───────────────────────────────────────── */
function onCommissionToggle() {
  var toggle = document.getElementById('q-commission-toggle');
  var input  = document.getElementById('q-commission');
  if (input) {
    input.disabled      = !toggle.checked;
    input.style.opacity = toggle.checked ? '' : '0.4';
  }
  if (draftQuote) { draftQuote.commissionEnabled = toggle.checked; saveDraftQuote(draftQuote); }
  onCommissionChange();
}

/* ── Recalcula descuento + comisión y actualiza DOM ───────────── */
function onCommissionChange() {
  if (!draftQuote) return;
  var discountEl   = document.getElementById('q-discount');
  var commissionEl = document.getElementById('q-commission');
  var commToggle   = document.getElementById('q-commission-toggle');
  var discount     = Math.min(100, Math.max(0, parseFloat((discountEl   && discountEl.value)   || 0) || 0));
  var commEnabled  = commToggle && commToggle.checked;
  var commission   = commEnabled
    ? Math.min(100, Math.max(0, parseFloat((commissionEl && commissionEl.value) || 0) || 0))
    : 0;
  var cur          = config.currency;
  var subtotal     = draftQuote.items.reduce(function(s, it) { return s + it.totalCost * it.qty; }, 0);
  var discountAmt  = subtotal    * (discount   / 100);
  var discounted   = subtotal    - discountAmt;
  var commAmt      = discounted  * (commission / 100);
  var finalTotal   = discounted  + commAmt;

  draftQuote.discount          = discount;
  draftQuote.commission        = commission;
  draftQuote.commissionEnabled = commEnabled;
  saveDraftQuote(draftQuote);

  var amtEl     = document.getElementById('draft-discount-amt');
  var commAmtEl = document.getElementById('draft-commission-amt');
  var totalEl   = document.getElementById('draft-grand-total');
  if (amtEl)     amtEl.textContent     = discountAmt > 0 ? '−' + cur + discountAmt.toFixed(2) : '—';
  if (commAmtEl) commAmtEl.textContent = commAmt     > 0 ? '+' + cur + commAmt.toFixed(2)     : '—';
  if (totalEl)   totalEl.textContent   = cur + finalTotal.toFixed(2);
}

/* Ajustar cantidad de un ítem en el borrador */
function draftItemQty(i, delta) {
  if (!draftQuote) return;
  var item = draftQuote.items[i];
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  saveDraftQuote(draftQuote);

  var cur         = config.currency;
  var discount    = draftQuote.discount || 0;
  var commEnabled = draftQuote.commissionEnabled || false;
  var commission  = commEnabled ? (draftQuote.commission || 0) : 0;
  var subtotal    = draftQuote.items.reduce(function(s, it) { return s + it.totalCost * it.qty; }, 0);
  var discAmt     = subtotal   * (discount   / 100);
  var discounted  = subtotal   - discAmt;
  var commAmt     = discounted * (commission / 100);
  var grandTotal  = discounted + commAmt;
  var qtyEl       = document.getElementById('dqi-' + i);
  var priceEl     = document.getElementById('dqp-' + i);
  var subEl       = document.getElementById('draft-subtotal');
  var amtEl       = document.getElementById('draft-discount-amt');
  var commAmtEl   = document.getElementById('draft-commission-amt');
  var totalEl     = document.getElementById('draft-grand-total');
  if (qtyEl)      qtyEl.textContent      = item.qty;
  if (priceEl)    priceEl.textContent    = cur + (item.totalCost * item.qty).toFixed(2);
  if (subEl)      subEl.textContent      = cur + subtotal.toFixed(2);
  if (amtEl)      amtEl.textContent      = discAmt  > 0 ? '−' + cur + discAmt.toFixed(2)  : '—';
  if (commAmtEl)  commAmtEl.textContent  = commAmt  > 0 ? '+' + cur + commAmt.toFixed(2)  : '—';
  if (totalEl)    totalEl.textContent    = cur + grandTotal.toFixed(2);
}

/* Quitar un ítem del borrador */
function removeDraftItem(i) {
  if (!draftQuote) return;
  if (draftQuote.items.length <= 1) { snack('La orden debe tener al menos un producto'); return; }
  draftQuote.items.splice(i, 1);
  saveDraftQuote(draftQuote);
  renderDraftModal();
}

/* Ir a la calculadora a calcular otro producto */
function addMoreToQuote() {
  var clientEl = document.getElementById('q-client');
  var phoneEl  = document.getElementById('q-phone');
  var notesEl  = document.getElementById('q-notes');
  if (draftQuote) {
    if (clientEl) draftQuote.client = clientEl.value.trim();
    if (phoneEl)  draftQuote.phone  = phoneEl.value.trim();
    if (notesEl)  draftQuote.notes  = notesEl.value.trim();
    saveDraftQuote(draftQuote);
  }
  closeModal();
  snack('Calcula el siguiente producto y presiona \u00abAgregar a orden\u00bb');
  showPage('calc');
  refreshDraftIndicator();
}

/* Finalizar y guardar la cotización */
function saveQuote() {
  var clientEl = document.getElementById('q-client');
  var client = clientEl ? clientEl.value.trim() : '';
  if (!client) { snack('Ingresa el nombre del cliente'); return; }

  var phone       = ((document.getElementById('q-phone')    || {}).value || '').trim();
  var notes       = ((document.getElementById('q-notes')    || {}).value || '').trim();
  var discount    = Math.min(100, Math.max(0, parseFloat(((document.getElementById('q-discount') || {}).value) || 0) || 0));
  var commToggle  = document.getElementById('q-commission-toggle');
  var commEnabled = commToggle && commToggle.checked;
  var commission  = commEnabled
    ? Math.min(100, Math.max(0, parseFloat(((document.getElementById('q-commission') || {}).value) || 0) || 0))
    : 0;
  var items         = draftQuote ? draftQuote.items : [];
  var subtotal      = items.reduce(function(s, it) { return s + it.totalCost * it.qty; }, 0);
  var discountAmt   = subtotal   * (discount   / 100);
  var discounted    = subtotal   - discountAmt;
  var commissionAmt = discounted * (commission / 100);
  var grandTotal    = discounted + commissionAmt;
  /* Base cost total para calcular ganancia en dashboard */
  var totalBaseCost = items.reduce(function(s, it) { return s + (it.baseCost || 0) * (it.qty || 1); }, 0);

  /* ── Guardar cliente si se eligió ── */
  var _saveClientCheck = document.getElementById('q-save-client');
  if (_saveClientCheck && _saveClientCheck.checked && client) {
    var _clientExists = (typeof clients !== 'undefined') && clients.some(function(c) {
      return c.name && c.name.toLowerCase() === client.toLowerCase();
    });
    if (!_clientExists && typeof clients !== 'undefined') {
      clients.unshift({ id: Date.now().toString(), name: client, phone: phone,
                        email: '', social: '', notes: '', source: 'cotización', tag: 'nuevo' });
      sv('clients', clients);
      if (typeof renderClients === 'function') renderClients();
    }
  }

  /* ── Modo edición: actualizar cotización existente ── */
  if (_editQuoteIndex !== null) {
    var existing = quotes[_editQuoteIndex];
    existing.client        = client;
    existing.phone         = phone;
    existing.notes         = notes;
    existing.items         = items;
    existing.subtotal      = subtotal;
    existing.discount      = discount;
    existing.discountAmt   = discountAmt;
    existing.commission    = commission;
    existing.commissionAmt = commissionAmt;
    existing.grandTotal    = grandTotal;
    existing.totalBaseCost = totalBaseCost;
    sv('quotes', quotes);
    _editQuoteIndex = null;
    clearDraftQuote();
    clearLastCalc();
    closeModal();
    refreshDraftIndicator();
    snack('Cotización actualizada ✓');
    showPage('quotes');
    return;
  }

  var q = {
    id:            Date.now().toString(),
    quoteNum:      nextQuoteNum(),
    quoteDate:     new Date().toISOString(),
    client:        client,
    phone:         phone,
    notes:         notes,
    items:         items,
    subtotal:      subtotal,
    discount:      discount,
    discountAmt:   discountAmt,
    commission:    commission,
    commissionAmt: commissionAmt,
    grandTotal:    grandTotal,
    totalBaseCost: totalBaseCost,
    status:        'pendiente'
  };

  quotes.unshift(q);
  sv('quotes', quotes);
  clearDraftQuote();
  clearLastCalc();
  /* No ocultamos calc-result — hero siempre visible en nuevo layout */
  closeModal();
  refreshDraftIndicator();
  snack('Cotizaci\u00f3n ' + q.quoteNum + ' generada');
  showPage('quotes');
}

/* ── Listado de cotizaciones ──────────────────────────────────── */
var quoteSearchTerm = '';
var _quoteFilter    = 'all'; /* all | aceptada | enviada | pendiente | rechazada */

function renderQuotes() {
  var el = document.getElementById('quotes-list');
  if (!el) return;

  /* Eyebrow dinámico */
  var now        = new Date();
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  var thisMonth  = quotes.filter(function(q) { return new Date(q.quoteDate) >= monthStart; }).length;
  var eyebrowEl  = document.getElementById('quotes-eyebrow');
  if (eyebrowEl) eyebrowEl.textContent = quotes.length + ' cotizaciones · ' + thisMonth + ' este mes';

  /* Filter chips */
  var chipsEl = document.getElementById('quotes-filter-chips');
  if (chipsEl) {
    var chipDefs = [
      { id: 'all',       label: 'Todas',      count: quotes.length },
      { id: 'aceptada',  label: 'Aceptadas',  count: quotes.filter(function(q) { return q.status === 'aceptada'; }).length },
      { id: 'enviada',   label: 'Enviadas',   count: quotes.filter(function(q) { return q.status === 'enviada'; }).length },
      { id: 'pendiente', label: 'Borradores', count: quotes.filter(function(q) { return !q.status || q.status === 'pendiente'; }).length },
      { id: 'rechazada', label: 'Rechazadas', count: quotes.filter(function(q) { return q.status === 'rechazada'; }).length },
    ];
    chipsEl.innerHTML = chipDefs.map(function(c) {
      var isActive = _quoteFilter === c.id;
      return '<button onclick="_setQuoteFilter(\'' + c.id + '\')" style="' +
        'display:inline-flex;align-items:center;gap:6px;' +
        'padding:6px 14px;border-radius:100px;font-size:13px;white-space:nowrap;flex-shrink:0;' +
        'background:' + (isActive ? 'var(--ink)' : 'var(--bg-elev)') + ';' +
        'color:' + (isActive ? 'var(--bg)' : 'var(--ink-2)') + ';' +
        'border:0.5px solid ' + (isActive ? 'transparent' : 'var(--line)') + ';' +
        'transition:background 0.15s,color 0.15s">' +
        c.label +
        (c.count > 0 ? '<span style="font-family:var(--font-mono);font-size:10px;opacity:0.7">' + c.count + '</span>' : '') +
      '</button>';
    }).join('');
  }

  if (!quotes.length) {
    el.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded">receipt_long</span><p>No hay cotizaciones. Calcula un costo y presiona \u00abCotizar\u00bb.</p></div>';
    return;
  }

  var filtered = quotes;
  /* Filtro por estado */
  if (_quoteFilter !== 'all') {
    filtered = filtered.filter(function(q) {
      if (_quoteFilter === 'pendiente') return !q.status || q.status === 'pendiente';
      return q.status === _quoteFilter;
    });
  }
  /* Filtro de búsqueda */
  if (quoteSearchTerm) {
    var term = quoteSearchTerm.toLowerCase();
    filtered = filtered.filter(function(q) {
      var matchClient = q.client && q.client.toLowerCase().indexOf(term) !== -1;
      var matchNum    = q.quoteNum && q.quoteNum.toLowerCase().indexOf(term) !== -1;
      var matchItems  = q.items && q.items.some(function(it) {
        return it.desc && it.desc.toLowerCase().indexOf(term) !== -1;
      });
      var matchDesc   = q.desc && q.desc.toLowerCase().indexOf(term) !== -1;
      return matchClient || matchNum || matchItems || matchDesc;
    });
  }

  var cur = config.currency;
  if (!filtered.length) {
    el.innerHTML = '<div class="empty-state"><span class="material-symbols-rounded">search_off</span><p>Sin resultados</p></div>';
    return;
  }

  el.innerHTML = filtered.map(function(q) {
    return tplQuoteCard(q, quotes.indexOf(q), cur);
  }).join('');
}

function _setQuoteFilter(f) {
  _quoteFilter = f;
  renderQuotes();
}

function onQuoteSearch(input) {
  quoteSearchTerm = input.value.trim();
  renderQuotes();
}

/* ── Etiqueta de estado ───────────────────────────────────────────── */
function statusLabel(s) {
  if (s === 'aceptada')  return '✓ Aceptada';
  if (s === 'rechazada') return '✕ Rechazada';
  if (s === 'enviada')   return '↗ Enviada';
  return '⏳ Pendiente';
}

/* ── Cambiar estado de cotización ────────────────────────────────── */
function setQuoteStatus(i, status) {
  var q = quotes[i]; if (!q) return;
  var prevStatus = q.status;
  q.status = status;
  sv('quotes', quotes);
  if (status === 'aceptada' && prevStatus !== 'aceptada') {
    _deductQuoteInventory(q);
    if (!q.notionPageId) sendToNotion(i, { silent: true });
  }
  renderQuotes();
  renderDashboard();
  var labels = { aceptada: 'Cotizaci\u00f3n aceptada \u2713', rechazada: 'Cotizaci\u00f3n rechazada', pendiente: 'Marcada como pendiente' };
  snack(labels[status] || 'Estado actualizado');
}

function _deductQuoteInventory(q) {
  var changed = false;
  (q.items || []).forEach(function(it) {
    if (!it.spoolId) return;
    var idx = -1;
    for (var k = 0; k < inventory.length; k++) {
      if (inventory[k].id === it.spoolId) { idx = k; break; }
    }
    if (idx === -1) return;
    var grams = (parseFloat(it.weight) || 0) * (it.qty || 1);
    if (grams <= 0) return;
    inventory[idx].remainingG = Math.max(0, (parseFloat(inventory[idx].remainingG) || 0) - grams);
    changed = true;
  });
  if (changed) {
    sv('inventory', inventory);
    if (typeof renderInventory === 'function') renderInventory();
  }
}

/* ── WhatsApp ─────────────────────────────────────────────────────── */
function whatsappQuote(i) {
  var q = quotes[i]; if (!q) return;
  var cur  = config.currency || '$';
  var biz  = config.bizName || 'Mi Negocio 3D';
  var phone = (q.phone || config.bizPhone || '').replace(/\D/g, '');
  if (!phone) { snack('No hay tel\u00e9fono en la cotizaci\u00f3n'); return; }

  var items = q.items || [{ desc: q.desc, material: q.material, qty: q.qty || 1, totalCost: q.totalCost }];
  var grandTotal = q.grandTotal != null ? q.grandTotal : (q.totalWithQty != null ? q.totalWithQty : items[0].totalCost);

  var txt = 'Hola ' + q.client + ', te comparto tu cotizaci\u00f3n de ' + biz + ':\n\n';
  txt += '\uD83D\uDCCB *' + q.quoteNum + '*\n';
  txt += '\uD83D\uDCC5 ' + new Date(q.quoteDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) + '\n\n';

  items.forEach(function(it) {
    var qty = it.qty || 1;
    var sub = it.totalCost * qty;
    txt += '\u2022 *' + it.desc + '*';
    if (it.material) txt += ' (' + it.material + ')';
    txt += '\n  Precio: ' + cur + it.totalCost.toFixed(2);
    if (qty > 1) txt += ' x' + qty + ' = ' + cur + sub.toFixed(2);
    txt += '\n';
  });

  txt += '\n*TOTAL: ' + cur + grandTotal.toFixed(2) + '*';
  if (q.notes) txt += '\n\nNotas: ' + q.notes;
  if (config.bizPhone) txt += '\n\nContacto: ' + config.bizPhone;

  var url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(txt);
  window.open(url, '_blank');
}

/* ── Link público de cotización ───────────────────────────────── */
function sharePublicLink(i) {
  var q = quotes[i]; if (!q) return;
  var total = q.grandTotal != null ? q.grandTotal
            : (q.totalWithQty != null ? q.totalWithQty : (q.totalCost || 0));
  var data = {
    quoteNum:   q.quoteNum,
    client:     q.client   || '',
    quoteDate:  q.quoteDate,
    items:      q.items    || [{ desc: q.desc || '', material: q.material || '', qty: 1, totalCost: q.totalCost || 0 }],
    grandTotal: total,
    discount:   q.discount || 0,
    notes:      q.notes    || '',
    bizName:    config.bizName    || '',
    bizPhone:   config.bizPhone   || '',
    bizEmail:   config.bizEmail   || '',
    bizQrUrl:   config.bizQrUrl   || '',
    currency:   config.currency   || '$',
    logoDataUrl: (typeof quoteStyle !== 'undefined' && quoteStyle && quoteStyle.logoDataUrl)
                  ? quoteStyle.logoDataUrl : ''
  };
  var encoded;
  try {
    encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch (e) {
    snack('Error al generar link'); return;
  }
  var base = location.href.split('?')[0].split('#')[0];
  base = base.substring(0, base.lastIndexOf('/') + 1) + 'quote.html';
  var url = base + '#' + encoded;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(function() {
      snack('🔗 Link copiado al portapapeles');
    }).catch(function() { _copyFallback(url); });
  } else {
    _copyFallback(url);
  }
}

function _copyFallback(text) {
  var el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
  document.body.appendChild(el);
  el.select();
  try { document.execCommand('copy'); snack('🔗 Link copiado'); }
  catch (e) { snack('Link: ' + text); }
  document.body.removeChild(el);
}

/* ── Duplicar cotización ──────────────────────────────────────── */
function duplicateQuote(i) {
  var orig = quotes[i]; if (!orig) return;
  var dup = JSON.parse(JSON.stringify(orig));
  dup.id = Date.now().toString();
  dup.quoteNum = nextQuoteNum();
  dup.quoteDate = new Date().toISOString();
  quotes.unshift(dup);
  sv('quotes', quotes);
  renderQuotes();
  snack('Cotizaci\u00f3n duplicada como ' + dup.quoteNum);
}

/* ── HTML de la cotización — sin costos internos ──────────────── */
function buildQuoteHTML(q, qrDataURL) {
  var s = quoteStyle;
  var cur = config.currency;
  var biz = esc(config.bizName || 'Mi Negocio 3D');
  var social = config.bizSocial ? esc(config.bizSocial) : '';

  var logoHTML = s.logo
    ? '<img src="' + s.logo + '" alt="Logo" class="qf-logo-img">'
    : '<div class="qf-biz-name-large">' + biz + '</div>';

  var dateStr = new Date(q.quoteDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

  /* Normalize: new format (items[]) o legacy flat */
  var items;
  if (q.items && q.items.length > 0) {
    items = q.items;
  } else {
    items = [{
      desc:      q.desc || 'Producto',
      printer:   q.printer || '',
      material:  q.material || '',
      weight:    q.weight || 0,
      timeH:     q.timeH || 0,
      totalCost: q.totalCost || 0,
      qty:       q.qty || 1
    }];
  }
  var grandTotal = q.grandTotal != null ? q.grandTotal
    : (q.totalWithQty != null ? q.totalWithQty
    : items.reduce(function(acc, it) { return acc + it.totalCost * (it.qty || 1); }, 0));

  /* Filas de la tabla — sin desglose interno */
  var itemRows = items.map(function(item) {
    var qty = item.qty || 1;
    var subtotal = item.totalCost * qty;
    return '<tr>' +
      '<td class="qf-td-left">' + esc(item.desc) +
        '<div class="qf-td-sub">' + esc(item.material) + (item.weight ? ' &middot; ' + item.weight + 'g' : '') + '</div>' +
      '</td>' +
      '<td class="qf-td-center">' + qty + '</td>' +
      '<td class="qf-td-right">' + cur + item.totalCost.toFixed(2) + '</td>' +
      '<td class="qf-td-right qf-td-bold">' + cur + subtotal.toFixed(2) + '</td>' +
    '</tr>';
  }).join('');

  var notesHTML = (s.showNotas && q.notes)
    ? '<div class="qf-notes-block">' + esc(q.notes) + '</div>' : '';
  var termsHTML = s.termsText
    ? '<div class="qf-terms-block">' + esc(s.termsText) + '</div>' : '';
  var footerHTML = s.footerText
    ? '<div class="qf-footer-block">' + esc(s.footerText) + '</div>' : '';

  return '<div class="qf" style="background:' + s.bgColor + ';color:' + s.textColor + '">' +
    '<div class="qf-deco qf-deco-tl"  style="background:' + s.primaryColor + '"></div>' +
    '<div class="qf-deco qf-deco-tl2" style="background:' + s.accentColor  + '"></div>' +
    '<div class="qf-deco qf-deco-br"  style="background:' + s.primaryColor + '"></div>' +
    '<div class="qf-deco qf-deco-br2" style="background:' + s.accentColor  + '"></div>' +

    (social ? '<div class="qf-social" style="color:' + s.primaryColor + '">' + social + '</div>' : '') +

    '<div class="qf-header-row">' +
      '<div>' +
        '<h1 class="qf-title" style="color:' + s.primaryColor + '">COTIZACI\u00d3N</h1>' +
        '<div class="qf-order-num" style="color:' + s.primaryColor + '">' + esc(q.quoteNum) + '</div>' +
      '</div>' +
      logoHTML +
    '</div>' +

    '<div class="qf-info-section">' +
      '<div class="qf-date">' + dateStr + '</div>' +
      '<div class="qf-client-grid">' +
        '<span class="qf-info-label">Cliente:</span><span>' + esc(q.client) + '</span>' +
        (q.phone ? '<span class="qf-info-label">Tel:</span><span>' + esc(q.phone) + '</span>' : '') +
      '</div>' +
    '</div>' +

    '<table class="qf-table">' +
      '<thead><tr>' +
        '<th class="qf-th-left"  style="background:' + s.primaryColor + ';color:#fff">Descripci\u00f3n</th>' +
        '<th class="qf-th-center" style="background:' + s.primaryColor + ';color:#fff">Cant.</th>' +
        '<th class="qf-th-right" style="background:' + s.primaryColor + ';color:#fff">Precio unit.</th>' +
        '<th class="qf-th-right" style="background:' + s.primaryColor + ';color:#fff">Subtotal</th>' +
      '</tr></thead>' +
      '<tbody>' + itemRows + '</tbody>' +
    '</table>' +

    '<div class="qf-totals">' +
      '<div class="qf-total-line" style="color:' + s.primaryColor + '">' +
        '<span>TOTAL</span><span>' + cur + grandTotal.toFixed(2) + '</span>' +
      '</div>' +
    '</div>' +

    notesHTML + termsHTML +

    /* Bloque de datos bancarios */
    (config.showBankInfo !== false && config.bizAccountNumber
      ? '<div class="qf-bank-block">' +
          '<div class="qf-bank-label">Datos de pago</div>' +
          '<div class="qf-bank-row">' +
            (config.bizBank ? '<span>' + esc(config.bizBank) + '</span>' : '') +
            (config.bizAccountHolder ? '<span>' + esc(config.bizAccountHolder) + '</span>' : '') +
            '<span class="qf-bank-num">' + esc(config.bizAccountNumber) + '</span>' +
          '</div>' +
        '</div>'
      : '') +

    '<div class="qf-biz-footer' + (qrDataURL ? ' qf-biz-footer--qr' : '') + '">' +
      '<div class="qf-biz-contact">' +
        '<span>' + biz + '</span>' +
        '<span>' +
          (config.bizPhone ? esc(config.bizPhone) : '') +
          (config.bizEmail ? ' | ' + esc(config.bizEmail) : '') +
        '</span>' +
      '</div>' +
      (qrDataURL
        ? '<div class="qf-qr-block">' +
            '<img src="' + qrDataURL + '" width="72" height="72" style="display:block;border-radius:4px">' +
            '<div class="qf-qr-label">Escaneame</div>' +
          '</div>'
        : '') +
    '</div>' +
    footerHTML +
  '</div>';
}

/* ── Ver cotización ───────────────────────────────────────────── */
function viewQuote(i) {
  var q = quotes[i]; if (!q) return;
  var imgBtnLabel = btnImgLabel();

  getQRDataURL().then(function(qrDataURL) {
    document.getElementById('modal-container').innerHTML =
      '<div class="m3-scrim" onclick="closeModal()"></div>' +
      '<div class="m3-bottom-sheet">' +
        '<div class="m3-drag-handle"></div>' +
        '<div id="quote-render-area">' + buildQuoteHTML(q, qrDataURL) + '</div>' +
        '<div class="m3-sheet-actions">' +
          '<button class="m3-btn-outlined" onclick="closeModal()">Cerrar</button>' +
          '<button class="m3-btn-text" id="btn-export-pdf-' + i + '" onclick="exportQuotePDF(' + i + ')" style="flex:none;width:auto;padding:0 16px">' +
            '<span class="material-symbols-rounded" style="font-size:18px">picture_as_pdf</span> PDF' +
          '</button>' +
          '<button class="m3-btn-tonal" id="btn-export-img-' + i + '" onclick="exportQuoteImage(' + i + ')" style="width:auto;flex:none;padding:0 20px">' +
            imgBtnLabel +
          '</button>' +
        '</div>' +
      '</div>';
  });
}

/* ── Compartir como texto (sin costos internos) ───────────────── */
function shareQuote(i) {
  var q = quotes[i]; if (!q) return;
  var cur = config.currency;
  var biz = config.bizName || 'Mi Negocio 3D';

  var txt = biz + '\n' + q.quoteNum + '\n';
  txt += 'Fecha: ' + new Date(q.quoteDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) + '\n\n';
  txt += 'Cliente: ' + q.client + '\n';
  if (q.phone) txt += 'Tel: ' + q.phone + '\n';
  txt += '\n';

  var items = q.items || [{ desc: q.desc, material: q.material, qty: q.qty || 1, totalCost: q.totalCost }];
  items.forEach(function(it) {
    var qty = it.qty || 1;
    var sub = it.totalCost * qty;
    txt += it.desc + '\n';
    txt += '  Material: ' + it.material + (it.weight ? ' | ' + it.weight + 'g' : '') + '\n';
    txt += '  Precio: ' + cur + it.totalCost.toFixed(2);
    if (qty > 1) txt += ' x' + qty + ' = ' + cur + sub.toFixed(2);
    txt += '\n\n';
  });

  var grandTotal = q.grandTotal != null ? q.grandTotal : (q.totalWithQty != null ? q.totalWithQty : items[0].totalCost);
  txt += 'TOTAL: ' + cur + grandTotal.toFixed(2) + '\n';

  if (q.notes && quoteStyle.showNotas) txt += '\nNotas: ' + q.notes + '\n';
  if (quoteStyle.termsText) txt += '\n' + quoteStyle.termsText + '\n';
  if (config.bizPhone) txt += '\nContacto: ' + config.bizPhone;

  if (navigator.share) {
    navigator.share({ title: q.quoteNum + ' - ' + q.client, text: txt }).catch(function() {});
  } else {
    navigator.clipboard.writeText(txt).then(function() {
      snack('Cotizaci\u00f3n copiada');
    }).catch(function() {
      var ta = document.createElement('textarea');
      ta.value = txt;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      snack('Cotizaci\u00f3n copiada');
    });
  }
}

/* ── Cargar librería QR desde CDN (lazy) ──────────────────────── */
function loadQRLib() {
  return new Promise(function(resolve, reject) {
    if (window.qrcode) { resolve(window.qrcode); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
    s.onload  = function() { resolve(window.qrcode); };
    s.onerror = function() { reject(new Error('QR no disponible sin conexión')); };
    document.head.appendChild(s);
  });
}

function getQRDataURL() {
  var url = (config.bizQrUrl || '').trim();
  if (!url) return Promise.resolve(null);
  return loadQRLib().then(function(qrGen) {
    var qr = qrGen(0, 'M');   /* typeNumber 0 = auto */
    qr.addData(url);
    qr.make();
    var cells    = qr.getModuleCount();
    var cellSize = 4;
    var canvas   = document.createElement('canvas');
    canvas.width = canvas.height = cells * cellSize;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    for (var r = 0; r < cells; r++) {
      for (var c = 0; c < cells; c++) {
        if (qr.isDark(r, c)) ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
    return canvas.toDataURL('image/png');
  }).catch(function() { return null; });
}

/* ── Cargar html2canvas desde CDN (lazy) ──────────────────────── */
function loadHtml2Canvas() {
  return new Promise(function(resolve, reject) {
    if (window.html2canvas) { resolve(window.html2canvas); return; }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload  = function() { resolve(window.html2canvas); };
    s.onerror = function() { reject(new Error('Sin conexi\u00f3n para cargar el exportador')); };
    document.head.appendChild(s);
  });
}

/* ── Exportar / compartir imagen de la cotización ─────────────── */
function exportQuoteImage(i) {
  var q = quotes[i]; if (!q) return;

  var btn = document.getElementById('btn-export-img-' + i);
  if (btn) { btn.disabled = true; btn.textContent = 'Generando\u2026'; }
  snack('Generando imagen\u2026');

  /* Crear contenedor off-screen con ancho fijo — formato vertical consistente */
  var QUOTE_WIDTH = 440;
  var PADDING     = 28;

  var wrapper = document.createElement('div');
  wrapper.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    'width:' + QUOTE_WIDTH + 'px',
    'background:#f8f7fc',          /* fondo neutro exterior */
    'padding:' + PADDING + 'px',
    'box-sizing:border-box',
    'font-family:Inter,sans-serif'
  ].join(';');
  document.body.appendChild(wrapper);

  getQRDataURL().then(function(qrDataURL) {
    wrapper.innerHTML = buildQuoteHTML(q, qrDataURL);
    return loadHtml2Canvas();
  }).then(function(h2c) {
    return h2c(wrapper, {
      scale:           2,            /* 2x para pantallas retina */
      useCORS:         true,
      allowTaint:      true,
      backgroundColor: '#f8f7fc',
      logging:         false,
      width:           QUOTE_WIDTH,
      windowWidth:     QUOTE_WIDTH
    });
  }).then(function(canvas) {
    document.body.removeChild(wrapper);

    canvas.toBlob(function(blob) {
      if (!blob) { snack('Error al generar la imagen'); return; }

      var filename = q.quoteNum + '_' + q.client.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '') + '.png';
      var file = new File([blob], filename, { type: 'image/png' });

      /* Móvil con Web Share API (archivos) */
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          title: q.quoteNum + ' \u2014 ' + q.client,
          files: [file]
        }).catch(function(e) {
          if (e.name !== 'AbortError') downloadBlob(blob, filename);
        });
      } else {
        downloadBlob(blob, filename);
        snack('Imagen descargada');
      }

      if (btn) { btn.disabled = false; btn.innerHTML = btnImgLabel(); }
    }, 'image/png');

  }).catch(function(err) {
    if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
    snack(err.message || 'Error al generar la imagen');
    if (btn) { btn.disabled = false; btn.innerHTML = btnImgLabel(); }
  });
}

function btnImgLabel() {
  var canShare = !!(navigator.share && navigator.canShare);
  return canShare
    ? '<span class="material-symbols-rounded" style="font-size:18px">share</span> Imagen'
    : '<span class="material-symbols-rounded" style="font-size:18px">download</span> Imagen';
}

function downloadBlob(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  setTimeout(function() { URL.revokeObjectURL(url); }, 5000);
}

/* ── Cargar pdf-lib desde CDN (lazy) ─────────────────────────── */
function loadPdfLib() {
  return new Promise(function(resolve, reject) {
    if (window.PDFLib) { resolve(window.PDFLib); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    s.onload  = function() { resolve(window.PDFLib); };
    s.onerror = function() { reject(new Error('PDF no disponible sin conexi\u00f3n')); };
    document.head.appendChild(s);
  });
}

/* ── Exportar cotización como PDF ────────────────────────────── */
function exportQuotePDF(i) {
  var q = quotes[i]; if (!q) return;
  var btn = document.getElementById('btn-export-pdf-' + i);
  if (btn) { btn.disabled = true; btn.textContent = 'Generando\u2026'; }
  snack('Generando PDF\u2026');

  var s  = quoteStyle;
  var cur = config.currency || '$';
  var items = q.items || [{ desc: q.desc || '', material: q.material || '', qty: q.qty || 1, totalCost: q.totalCost }];
  var grandTotal = q.grandTotal != null ? q.grandTotal : (q.totalWithQty != null ? q.totalWithQty : items[0].totalCost);

  function hexRgb(hex) {
    hex = (hex || '#6750A4').replace('#','');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return [parseInt(hex.slice(0,2),16)/255, parseInt(hex.slice(2,4),16)/255, parseInt(hex.slice(4,6),16)/255];
  }
  function safeStr(v) {
    return String(v || '').replace(/[^\x20-\xFF]/g, function(c) {
      var map = {'\u00e1':'a','\u00e9':'e','\u00ed':'i','\u00f3':'o','\u00fa':'u',
                 '\u00c1':'A','\u00c9':'E','\u00cd':'I','\u00d3':'O','\u00da':'U',
                 '\u00f1':'n','\u00d1':'N','\u00fc':'u','\u00dc':'U'};
      return map[c] || '?';
    });
  }
  function trunc(str, n) { str = safeStr(str); return str.length > n ? str.slice(0,n-1)+'\u2026' : str; }
  function dataUrlToUint8(dataUrl) {
    var b64 = dataUrl.split(',')[1];
    var bin = atob(b64);
    var arr = new Uint8Array(bin.length);
    for (var k = 0; k < bin.length; k++) arr[k] = bin.charCodeAt(k);
    return arr;
  }

  Promise.all([loadPdfLib(), getQRDataURL()]).then(function(res) {
    var PDFLib = res[0], qrDataURL = res[1];
    var PDFDocument = PDFLib.PDFDocument;
    var rgb = PDFLib.rgb;
    var SF  = PDFLib.StandardFonts;

    var pc = hexRgb(s.primaryColor);
    var tc = hexRgb(s.textColor);
    var primary = rgb(pc[0],pc[1],pc[2]);
    var textCol = rgb(tc[0],tc[1],tc[2]);
    var white   = rgb(1,1,1);
    var muted   = rgb(0.55,0.55,0.55);
    var light   = rgb(0.96,0.96,0.97);
    var divider = rgb(0.85,0.85,0.85);

    var W=595, H=842, M=40, CW=515;
    var colQ=M+CW*0.54, colU=M+CW*0.68, colS=M+CW*0.84;

    return PDFDocument.create().then(function(doc) {
      return doc.embedFont(SF.Helvetica).then(function(font) {
      return doc.embedFont(SF.HelveticaBold).then(function(bold) {

        var page = doc.addPage([W,H]);
        var y = H;

        /* ── Header bar ── */
        page.drawRectangle({x:0, y:y-68, width:W, height:68, color:primary});
        page.drawText('COTIZACION', {x:M, y:y-44, size:20, font:bold, color:white});
        var qn = safeStr(q.quoteNum||'');
        page.drawText(qn, {x:W-M-bold.widthOfTextAtSize(qn,12), y:y-34, size:12, font:bold, color:white});
        var ds = safeStr(new Date(q.quoteDate).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'}));
        page.drawText(ds, {x:W-M-font.widthOfTextAtSize(ds,8), y:y-50, size:8, font:font, color:rgb(0.85,0.85,0.85)});
        y -= 80;

        /* ── Biz name ── */
        var biz = safeStr(config.bizName||'Mi Negocio 3D');
        page.drawText(biz, {x:M, y, size:13, font:bold, color:primary});
        y -= 14;
        if (config.bizSocial) {
          page.drawText(safeStr(config.bizSocial), {x:M, y, size:9, font:font, color:muted});
          y -= 13;
        }
        y -= 6;
        page.drawLine({start:{x:M,y}, end:{x:W-M,y}, thickness:0.5, color:divider});
        y -= 14;

        /* ── Client info ── */
        page.drawText('Cliente:', {x:M, y, size:9, font:bold, color:muted});
        page.drawText(safeStr(q.client), {x:M+46, y, size:9, font:font, color:textCol});
        y -= 13;
        if (q.phone) {
          page.drawText('Tel:', {x:M, y, size:9, font:bold, color:muted});
          page.drawText(safeStr(q.phone), {x:M+46, y, size:9, font:font, color:textCol});
          y -= 13;
        }
        y -= 10;

        /* ── Table header ── */
        var rH = 22;
        page.drawRectangle({x:M, y:y-rH+5, width:CW, height:rH, color:primary});
        page.drawText('Descripcion', {x:M+4, y:y-rH+11, size:9, font:bold, color:white});
        page.drawText('Cant.', {x:colQ+4, y:y-rH+11, size:9, font:bold, color:white});
        page.drawText('Precio unit.', {x:colU+4, y:y-rH+11, size:9, font:bold, color:white});
        page.drawText('Subtotal', {x:colS+4, y:y-rH+11, size:9, font:bold, color:white});
        y -= rH;

        /* ── Rows ── */
        items.forEach(function(it, idx) {
          var rowBg = idx%2===1 ? light : white;
          page.drawRectangle({x:M, y:y-rH+5, width:CW, height:rH, color:rowBg});
          var qty = it.qty||1;
          page.drawText(trunc(it.desc||'',44), {x:M+4, y:y-rH+11, size:9, font:font, color:textCol});
          page.drawText(String(qty),            {x:colQ+4, y:y-rH+11, size:9, font:font, color:textCol});
          page.drawText(cur+(it.totalCost||0).toFixed(2), {x:colU+4, y:y-rH+11, size:9, font:font, color:textCol});
          page.drawText(cur+((it.totalCost||0)*qty).toFixed(2), {x:colS+4, y:y-rH+11, size:9, font:bold, color:textCol});
          y -= rH;
        });

        /* ── Total ── */
        y -= 6;
        page.drawLine({start:{x:M,y}, end:{x:W-M,y}, thickness:0.5, color:divider});
        y -= 18;
        var totalStr = cur+grandTotal.toFixed(2);
        page.drawText('TOTAL', {x:colS+4, y, size:10, font:bold, color:primary});
        y -= 16;
        page.drawText(totalStr, {x:colS+4, y, size:14, font:bold, color:primary});
        y -= 24;

        /* ── Notes ── */
        if (q.notes && s.showNotas) {
          y -= 6;
          page.drawText('Notas: '+safeStr(q.notes), {x:M, y, size:8, font:font, color:muted, maxWidth:CW, lineHeight:12});
          y -= 24;
        }

        /* ── Terms ── */
        if (s.termsText) {
          y -= 4;
          page.drawLine({start:{x:M,y}, end:{x:W-M,y}, thickness:0.3, color:divider});
          y -= 14;
          page.drawText(safeStr(s.termsText), {x:M, y, size:8, font:font, color:muted, maxWidth:CW, lineHeight:11});
          y -= 20;
        }

        /* ── Datos bancarios (antes del footer) ── */
        if (config.showBankInfo !== false && config.bizAccountNumber) {
          y -= 8;
          page.drawRectangle({x:M, y:y-28, width:CW, height:34, color:rgb(0.97,0.97,0.98)});
          page.drawText('DATOS DE PAGO', {x:M+8, y:y-10, size:7, font:bold, color:muted});
          var bankLine = [config.bizBank, config.bizAccountHolder, config.bizAccountNumber].filter(Boolean).map(safeStr).join('  ·  ');
          page.drawText(bankLine, {x:M+8, y:y-22, size:9, font:font, color:textCol});
          y -= 40;
        }

        /* ── Footer bar ── */
        page.drawRectangle({x:0, y:0, width:W, height:58, color:light});
        page.drawLine({start:{x:0,y:58}, end:{x:W,y:58}, thickness:0.5, color:divider});
        page.drawText(biz, {x:M, y:40, size:9, font:bold, color:textCol});
        var contact = [config.bizPhone, config.bizEmail].filter(Boolean).map(safeStr).join(' | ');
        if (contact) page.drawText(contact, {x:M, y:27, size:8, font:font, color:muted});
        if (config.bizSocial) page.drawText(safeStr(config.bizSocial), {x:M, y:14, size:8, font:font, color:muted});

        /* ── QR en footer ── */
        var qrEmbed = qrDataURL
          ? doc.embedPng(dataUrlToUint8(qrDataURL)).then(function(img) {
              page.drawImage(img, {x:W-M-52, y:4, width:52, height:52});
            })
          : Promise.resolve();

        return qrEmbed.then(function() { return doc.save(); });
      });});
    });
  }).then(function(pdfBytes) {
    var blob = new Blob([pdfBytes], {type:'application/pdf'});
    var fname = (q.quoteNum||'cotizacion')+'_'+safeStr(q.client||'').replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_-]/g,'')+'.pdf';
    if (navigator.share && navigator.canShare) {
      var file = new File([blob], fname, {type:'application/pdf'});
      if (navigator.canShare({files:[file]})) {
        navigator.share({title:q.quoteNum, files:[file]}).catch(function(e) {
          if (e.name!=='AbortError') { downloadBlob(blob, fname); snack('PDF descargado'); }
        });
        if (btn) { btn.disabled=false; btn.innerHTML='<span class="material-symbols-rounded" style="font-size:18px">picture_as_pdf</span> PDF'; }
        return;
      }
    }
    downloadBlob(blob, fname);
    snack('PDF descargado');
    if (btn) { btn.disabled=false; btn.innerHTML='<span class="material-symbols-rounded" style="font-size:18px">picture_as_pdf</span> PDF'; }
  }).catch(function(err) {
    snack(err.message||'Error al generar el PDF');
    if (btn) { btn.disabled=false; btn.innerHTML='<span class="material-symbols-rounded" style="font-size:18px">picture_as_pdf</span> PDF'; }
  });
}

/* ── Eliminar cotización ──────────────────────────────────────── */
function deleteQuote(i) {
  m3Confirm('\u00bfEliminar cotizaci\u00f3n?', function() {
    quotes.splice(i, 1); sv('quotes', quotes); renderQuotes();
  });
}

/* ── Enviar cotización a Notion ──────────────────────────────── */
function sendToNotion(i, opts) {
  opts = opts || {};
  var q = quotes[i]; if (!q) return;

  /* Ya sincronizada \u2014 no duplicar */
  if (q.notionPageId) {
    if (!opts.silent) snack('Esta cotizaci\u00f3n ya est\u00e1 en Notion');
    return;
  }

  var btn = document.getElementById('notion-btn-' + i);
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando\u2026'; }

  fetch('/api/notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quote: q, currency: config.currency || '$' })
  })
  .then(function(res) { return res.json().then(function(data) { return { ok: res.ok, data: data }; }); })
  .then(function(r) {
    if (r.ok) {
      snack('\u2713 Enviado a Notion: ' + q.quoteNum);
      /* Guardar el ID de página Notion en la cotización */
      q.notionPageId = r.data.notionPageId;
      q.notionSyncedAt = new Date().toISOString();
      sv('quotes', quotes);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 100 100" fill="currentColor" style="vertical-align:middle;margin-right:4px"><path d="M8 7c0-2.8 2.2-5 5-5h60l19 19v72c0 2.8-2.2 5-5 5H13c-2.8 0-5-2.2-5-5V7z" fill="none" stroke="currentColor" stroke-width="8"/><path d="M73 2v19h19" fill="none" stroke="currentColor" stroke-width="8"/><line x1="25" y1="40" x2="75" y2="40" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><line x1="25" y1="58" x2="75" y2="58" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><line x1="25" y1="76" x2="55" y2="76" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>\u2713 Sincronizado';
        btn.style.color = 'var(--accent-mint)';
      }
    } else {
      snack('Error Notion: ' + (r.data.error || 'Revisa la configuraci\u00f3n'));
      if (btn) { btn.disabled = false; btn.textContent = 'Notion'; }
    }
  })
  .catch(function(err) {
    snack('Error de red al conectar con Notion');
    if (btn) { btn.disabled = false; btn.textContent = 'Notion'; }
  });
}
