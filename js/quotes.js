/* ===== QUOTES ===== */

/* Next unique quote number — never reuses */
function nextQuoteNum() {
  quoteCounter++;
  sv('quoteCounter', quoteCounter);
  return 'COT-' + String(quoteCounter).padStart(4, '0');
}

/* ── Índice de cotización en edición (null = nueva) ───────────── */
/* Índice de la cotización que se está editando.

   Vivía solo en esta variable y únicamente se limpiaba al guardar con éxito.
   Eso provocaba una pérdida de datos silenciosa: si abrías "Editar" en una
   cotización, cerrabas sin guardar, y después armabas una orden nueva, al
   generarla el código entraba por la rama de edición y SOBRESCRIBÍA la
   cotización vieja en lugar de crear una nueva.

   Ahora el índice vive dentro del borrador (draftQuote.editIndex) y se
   sincroniza con esta variable al cargarlo. Así nace y muere con el borrador,
   que es exactamente lo que dura una edición. */
var _editQuoteIndex = null;

/* ── Draft quote (multi-producto en borrador) ─────────────────── */
var draftQuote = (function() {
  try {
    var v = sessionStorage.getItem('c3d_draftQuote');
    return v ? JSON.parse(v) : null;
  } catch { return null; }
})();

function saveDraftQuote(draft) {
  /* El borrador recuerda si es una edición. Si el borrador no lo dice,
     no hay edición en curso: una orden nueva nunca debe pisar una vieja. */
  if (draft && draft.editIndex === undefined) draft.editIndex = _editQuoteIndex;
  _editQuoteIndex = draft ? (draft.editIndex != null ? draft.editIndex : null) : null;
  draftQuote = draft;
  try { sessionStorage.setItem('c3d_draftQuote', JSON.stringify(draft)); } catch {}
}

function clearDraftQuote() {
  draftQuote = null;
  _editQuoteIndex = null;   /* se acabó el borrador, se acabó la edición */
  try { sessionStorage.removeItem('c3d_draftQuote'); } catch {}
}

/* Actualiza el botón Cotizar según contexto:
   - Sin draft ni cálculo: "Agregar a orden" (addItemToDraft)
   - Draft con ítems y sin cálculo activo: "Generar cotización" (generateQuote)
   - Cálculo activo (con o sin draft): "Agregar a orden" + badge */
function refreshDraftIndicator() {
  var hasDraft = draftQuote && draftQuote.items && draftQuote.items.length > 0;
  var hasCalc  = !!lastCalc;

  /* Toggle «Costo de la pieza | Orden» del encabezado (escritorio): Orden
     queda deshabilitado hasta que haya al menos un producto */
  var segOrden = document.getElementById('calc-seg-orden');
  var segN     = document.getElementById('calc-seg-orden-n');
  if (segOrden) segOrden.disabled = !hasDraft;
  if (segN)     segN.textContent  = hasDraft ? draftQuote.items.length : '';

  var btn = document.getElementById('btn-cotizar');
  if (!btn) return;

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
    /* Por pieza — lastCalc ya dividió entre las piezas de la placa */
    weight:     lastCalc.weight,
    timeH:      lastCalc.timeH,
    designH:    lastCalc.designH || 0,
    margin:     lastCalc.margin,
    /* De cuántas piezas era la placa. No entra en ninguna cuenta: queda como
       registro de cómo se imprimió, para poder repetir la corrida. */
    pieces:     lastCalc.pieces || 1,
    matCost:    lastCalc.matCost,
    energyCost: lastCalc.energyCost,
    laborCost:  lastCalc.laborCost || 0,
    deprecCost: lastCalc.deprecCost,
    fixedCost:  lastCalc.fixedCost,
    maintCost:    lastCalc.maintCost    || 0,
    indirectCost: lastCalc.indirectCost || 0,
    wasteCost:  lastCalc.wasteCost,
    baseCost:   lastCalc.baseCost,
    totalCost:  lastCalc.totalCost,
    /* El precio que calculó la fórmula. totalCost se puede sobrescribir a mano
       en el borrador; éste queda como referencia para poder volver. */
    autoPrice:  lastCalc.totalCost,
    priceManual: false,
    spoolId:    lastCalc.spoolId || '',
    amsColors:  lastCalc.amsColors || null,
    /* Sin esto, _deductQuoteInventory calcula la purga como 0 y el material
       purgado nunca se descuenta del inventario. La lógica de reparto estaba,
       pero el dato no llegaba hasta aquí. */
    amsPurgeGrams: lastCalc.amsPurgeGrams || 0,
    /* Detalle del post-procesado: el dinero ya va dentro de baseCost, pero sin
       esto la cotización guardada pierde para siempre el desglose. */
    postProcCost:  lastCalc.postProcCost  || 0,
    ipaCost:       lastCalc.ipaCost       || 0,
    uvCost:        lastCalc.uvCost        || 0,
    qty:        1
  };

  if (!draftQuote) {
    saveDraftQuote({ editIndex: null, client: '', phone: '', notes: '', items: [newItem] });
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
  /* Las piezas vuelven a 1: dejarlas en 30 hacía que la siguiente pieza se
     dividiera entre 30 sin que nada en pantalla lo advirtiera. */
  var piezasEl = document.getElementById('calc-pieces');
  if (piezasEl) piezasEl.value = 1;
  var ppEl = document.getElementById('calc-per-piece');
  if (ppEl) ppEl.classList.add('hidden');
  /* Los mismos textos de ayuda de index.html (helper-on-rest) */
  _setFieldState('field-weight', 'helper-weight', 'neutral', 'De toda la placa');
  _setFieldState('field-time', 'helper-time', 'neutral', 'De toda la placa');
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
}

/* ── Editar cotización existente (no aceptada) ────────────────── */
function editQuote(i) {
  var q = quotes[i]; if (!q) return;
  if (q.status === 'aceptada') { snack('Las cotizaciones aceptadas no se pueden editar'); return; }
  saveDraftQuote({
    editIndex:         i,          /* marca el borrador como edición de ésta */
    client:            q.client   || '',
    phone:             q.phone    || '',
    notes:             q.notes    || '',
    discount:          q.discount || 0,
    commission:        q.commission    || 0,
    commissionEnabled: (q.commission && q.commission > 0) || false,
    items:             _conPrecioAuto(JSON.parse(JSON.stringify(q.items || [])))
  });
  renderDraftModal();
}

/* Las cotizaciones guardadas antes de que se pudiera escribir el precio no
   traen autoPrice. Sin esto, editar una de ésas y escribir un precio nuevo no
   quedaba marcado como precio manual. */
function _conPrecioAuto(items) {
  items.forEach(function(it) {
    if (it.autoPrice == null) it.autoPrice = it.totalCost;
  });
  return items;
}

/* ── Abrir modal de cotización ────────────────────────────────── */
function generateQuote() {
  if (!draftQuote || !draftQuote.items.length) {
    snack('Agrega al menos un producto a la orden primero'); return;
  }
  renderDraftModal();
}

/* ── Orden multi-producto ─────────────────────────────────────── */
/* Teléfono: la orden es un panel que sale desde abajo.
   Escritorio: la calculadora cambia al modo «Orden» (review) con el toggle
   del encabezado o con «Generar cotización»: cliente, tabla de productos y
   totales a la izquierda; vista previa en vivo a la derecha. «Orden» está
   deshabilitado mientras la orden está vacía.
   Todos los caminos pasan por aquí: generar, editar una cotización de la
   lista y quitar un producto. El ancho es el mismo de desktop.css. */
var _mqEscritorio = window.matchMedia('(min-width: 900px)');

function renderDraftModal() {
  var draft = draftQuote;
  if (!draft) return;
  if (_mqEscritorio.matches) {
    if (document.body.dataset.page !== 'calc') showPage('calc');
    setCalcMode('review');
    return;
  }
  document.getElementById('modal-container').innerHTML = tplDraftModal(draft, config.currency);
}

/* Modo de la calculadora en escritorio: 'calc' (costo de la pieza) o
   'review' (la orden). Lo cambia el toggle del encabezado. La CSS lee
   data-mode de #page-calc. */
function setCalcMode(mode) {
  var pageEl = document.getElementById('page-calc');
  if (!pageEl) return;
  if (mode === 'review' && !(draftQuote && draftQuote.items && draftQuote.items.length)) mode = 'calc';
  pageEl.dataset.mode = mode;

  document.querySelectorAll('.calc-mode-seg button').forEach(function(b) {
    var on = b.dataset.mode === mode;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });

  var title = document.getElementById('calc-header-title');
  var main  = document.getElementById('calc-review-main');
  var prev  = document.getElementById('calc-review-preview');
  if (mode === 'review') {
    if (title) title.textContent = _draftLabels().title;
    if (main)  main.innerHTML = tplReviewMain(draftQuote, config.currency);
    pageEl.scrollTop = 0;
    _pintarVistaPrevia();
  } else {
    if (title) title.textContent = 'Calculadora';
    /* Vaciar: así los id de la orden (q-client, q-discount…) no quedan
       repetidos si después se abre la orden en otro lado */
    if (main) main.innerHTML = '';
    if (prev) prev.innerHTML = '';
  }
}

/* ── Vista previa de la orden (escritorio, panel derecho) ──────────
   La cotización tal como la verá el cliente, armada con el mismo
   buildQuoteHTML del visor y de las exportaciones, y actualizada mientras
   se edita la orden (con una pausa corta para no redibujar en cada tecla). */
var _vistaPreviaTimer = null;
var _vistaPreviaQR    = undefined;   /* undefined = aún no se pide */

function _programarVistaPrevia() {
  clearTimeout(_vistaPreviaTimer);
  _vistaPreviaTimer = setTimeout(_pintarVistaPrevia, 150);
}

function _pintarVistaPrevia() {
  var prev   = document.getElementById('calc-review-preview');
  var pageEl = document.getElementById('page-calc');
  if (!prev || !draftQuote || !pageEl || pageEl.dataset.mode !== 'review') return;
  if (_vistaPreviaQR === undefined) {
    _vistaPreviaQR = null;
    getQRDataURL().then(function(qr) { _vistaPreviaQR = qr; _pintarVistaPrevia(); });
  }
  prev.innerHTML =
    '<div class="preview-head"><span class="micro">Vista previa</span>' +
      '<span class="preview-note">Así la verá el cliente</span></div>' +
    '<div class="preview-body"><div class="preview-paper">' +
      buildQuoteHTML(_cotizacionDelBorrador(), _vistaPreviaQR) +
    '</div></div>';
}

/* Arma una cotización «de mentiras» con el borrador, para la vista previa.
   El folio es el que tendría al generarse: nextQuoteNum() no se llama aquí
   porque gasta el número (suma 1 al contador y lo guarda). */
function _cotizacionDelBorrador() {
  var d = draftQuote;
  var items       = d.items || [];
  var discount    = d.discount || 0;
  var commission  = d.commissionEnabled ? (d.commission || 0) : 0;
  var subtotal    = items.reduce(function(s, it) { return s + it.totalCost * it.qty; }, 0);
  var discountAmt = subtotal * (discount / 100);
  var commAmt     = (subtotal - discountAmt) * (commission / 100);
  var editando    = _editQuoteIndex !== null && quotes[_editQuoteIndex];
  return {
    quoteNum:      editando ? quotes[_editQuoteIndex].quoteNum : 'COT-' + String(quoteCounter + 1).padStart(4, '0'),
    quoteDate:     editando ? quotes[_editQuoteIndex].quoteDate : new Date().toISOString(),
    client:        d.client || 'Nombre del cliente',
    phone:         d.phone  || '',
    notes:         d.notes  || '',
    items:         items,
    subtotal:      subtotal,
    discount:      discount,
    discountAmt:   discountAmt,
    commission:    commission,
    commissionAmt: commAmt,
    grandTotal:    subtotal - discountAmt + commAmt
  };
}

/* Guarda cliente, teléfono y notas en el borrador mientras se escriben */
function guardarDatosDraft() {
  if (!draftQuote) return;
  var clientEl = document.getElementById('q-client');
  var phoneEl  = document.getElementById('q-phone');
  var notesEl  = document.getElementById('q-notes');
  if (clientEl) draftQuote.client = clientEl.value.trim();
  if (phoneEl)  draftQuote.phone  = phoneEl.value.trim();
  if (notesEl)  draftQuote.notes  = notesEl.value.trim();
  saveDraftQuote(draftQuote);
  _programarVistaPrevia();
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
  _programarVistaPrevia();
}

/* Ajustar cantidad de un ítem en el borrador */
/* Escribir la cantidad directamente. Para 20 piezas, teclear "20" en vez de
   dar 19 toques a un botón que mide menos que la yema del pulgar. */
function draftItemQtySet(i, valor) {
  if (!draftQuote) return;
  var item = draftQuote.items[i]; if (!item) return;
  var n = Math.max(1, Math.round(parseFloat(valor) || 1));
  draftItemQty(i, n - (item.qty || 1));
}

function draftItemQty(i, delta) {
  if (!draftQuote) return;
  var item = draftQuote.items[i];
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  saveDraftQuote(draftQuote);
  _repintarDraftTotales(i);
}

/* ── Escribir el precio a mano ─────────────────────────────────────
   Hay precios que no salen de una fórmula: los cerrados con el cliente, los
   de lista, los que ya se dieron por WhatsApp. La única manera de llegar a
   $850 exactos era empujar el deslizador de margen hasta que el redondeo
   cooperara —38 % daba $845 y 39 % daba $855— y el precio buscado no existía
   en ningún punto del deslizador.

   Se escribe el precio POR PIEZA y la app recalcula el margen hacia atrás.
   Ése es el dato que se pierde al fijar un precio, y el que hay que
   devolver: si queda por debajo del costo, lo dice en la fila y lo avisa. */
function draftItemPriceSet(i, valor) {
  if (!draftQuote) return;
  var item = draftQuote.items[i]; if (!item) return;

  var p = parseFloat(valor);
  /* Vacío o basura: vuelve al precio calculado en vez de dejar un cero. */
  if (!isFinite(p) || p < 0) {
    p = item.autoPrice != null ? item.autoPrice : item.totalCost;
  }

  item.totalCost   = p;
  item.priceManual = item.autoPrice != null && Math.abs(p - item.autoPrice) > 0.005;
  /* Margen implícito. Sin costo conocido (productos de tabla de precios) no
     hay nada que recalcular y se deja como estaba. */
  if (item.baseCost > 0) item.margin = ((p / item.baseCost) - 1) * 100;

  saveDraftQuote(draftQuote);
  _repintarDraftTotales(i);

  if (item.baseCost > 0 && p < item.baseCost) {
    snack('Ese precio queda por debajo del costo: ' +
          (config.currency || '$') + item.baseCost.toFixed(2));
  }
}

/* Repinta los totales del borrador y, si se indica, la fila que cambió.
   Vivía dentro de draftItemQty, así que el precio escrito no tenía manera
   de reusarlo. */
function _repintarDraftTotales(i) {
  if (!draftQuote) return;
  var cur         = config.currency;
  var discount    = draftQuote.discount || 0;
  var commEnabled = draftQuote.commissionEnabled || false;
  var commission  = commEnabled ? (draftQuote.commission || 0) : 0;
  var subtotal    = draftQuote.items.reduce(function(s, it) { return s + it.totalCost * it.qty; }, 0);
  var discAmt     = subtotal   * (discount   / 100);
  var discounted  = subtotal   - discAmt;
  var commAmt     = discounted * (commission / 100);
  var grandTotal  = discounted + commAmt;

  var item = (i != null) ? draftQuote.items[i] : null;
  if (item) {
    var qtyEl   = document.getElementById('dqi-' + i);
    var priceEl = document.getElementById('dqp-' + i);
    var calcEl  = document.getElementById('dqc-' + i);
    /* Son <input>, no <span>: textContent no los actualiza. */
    if (qtyEl)   qtyEl.value      = item.qty;
    if (priceEl) priceEl.value    = (item.totalCost || 0).toFixed(2);
    if (calcEl)  calcEl.innerHTML = tplDraftItemCalc(item, cur);
    /* Importe de la fila en la tabla de escritorio (tplReviewRow) */
    var lineEl  = document.getElementById('dql-' + i);
    if (lineEl)  lineEl.textContent = cur + ((item.totalCost || 0) * item.qty).toFixed(2);
  }

  var subEl      = document.getElementById('draft-subtotal');
  var amtEl      = document.getElementById('draft-discount-amt');
  var commAmtEl  = document.getElementById('draft-commission-amt');
  var totalEl    = document.getElementById('draft-grand-total');
  if (subEl)     subEl.textContent     = cur + subtotal.toFixed(2);
  if (amtEl)     amtEl.textContent     = discAmt > 0 ? '−' + cur + discAmt.toFixed(2) : '—';
  if (commAmtEl) commAmtEl.textContent = commAmt > 0 ? '+' + cur + commAmt.toFixed(2) : '—';
  if (totalEl)   totalEl.textContent   = cur + grandTotal.toFixed(2);
  _programarVistaPrevia();
}

/* Quitar un ítem del borrador */
function removeDraftItem(i) {
  if (!draftQuote) return;
  if (draftQuote.items.length <= 1) { snack('La orden debe tener al menos un producto'); return; }
  draftQuote.items.splice(i, 1);
  saveDraftQuote(draftQuote);
  renderDraftModal();
  refreshDraftIndicator();   /* el contador «Orden · n» del encabezado */
}

/* Ir a la calculadora a calcular otro producto */
function addMoreToQuote() {
  guardarDatosDraft();
  /* En escritorio la revisión vive dentro de la calculadora: basta con
     volver al modo de calcular */
  if (_mqEscritorio.matches && document.body.dataset.page === 'calc') {
    setCalcMode('calc');
    snack('Calcula el siguiente producto y presiona «Agregar a orden»');
    return;
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
  /* Base cost total para calcular ganancia en dashboard.
     Si ALGUNA partida no tiene costo conocido (productos de tabla de precios,
     que se venden a precio fijo sin costear), el total queda en null y el
     dashboard excluye la cotización del cálculo de margen. Sumar esas partidas
     como cero inflaría la ganancia al 100%; sumarlas como su precio de venta
     la aplastaría a cero. Ninguna de las dos es verdad: el dato no existe. */
  var _sinCosto     = items.some(function(it) { return it.baseCost == null; });
  var totalBaseCost = _sinCosto
    ? null
    : items.reduce(function(s, it) { return s + (it.baseCost || 0) * (it.qty || 1); }, 0);

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
    if (typeof dbGuardarCotizacion === 'function') dbGuardarCotizacion(existing);
    sv('quotes', quotes);
    var editada = _editQuoteIndex;
    _editQuoteIndex = null;
    clearDraftQuote();
    clearLastCalc();
    closeModal();
    setCalcMode('calc');
    refreshDraftIndicator();
    if (typeof renderQuotes === 'function') renderQuotes();
    showSendQuoteModal(editada, true);
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
  if (typeof dbGuardarCotizacion === 'function') dbGuardarCotizacion(q);
  sv('quotes', quotes);
  clearDraftQuote();
  clearLastCalc();
  /* No ocultamos calc-result — hero siempre visible en nuevo layout */
  closeModal();
  setCalcMode('calc');
  refreshDraftIndicator();
  if (typeof renderQuotes === 'function') renderQuotes();
  showSendQuoteModal(0);   /* la nueva qued\u00f3 primera (unshift) */
}

/* Despu\u00e9s de generar: te quedas donde estabas y eliges c\u00f3mo enviarla
   (PDF, imagen, WhatsApp, enlace, texto) o verla. Antes te mandaba a la
   lista de cotizaciones con el visor encima. */
function showSendQuoteModal(i, actualizada) {
  var q = quotes[i]; if (!q) return;
  document.getElementById('modal-container').innerHTML = tplSendQuoteModal(q, i, actualizada);
}

/* ── Listado de cotizaciones ──────────────────────────────────── */
var quoteSearchTerm = '';
var _quoteFilter    = 'all'; /* all | aceptada | enviada | pendiente | rechazada */

function renderQuotes() {
  _sincronizarDock();   /* antes del return: el contenedor puede estar abierto en otra sección */
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
        (c.count > 0 ? '<span style="font-family:var(--font-mono);font-size:12px;opacity:0.7">' + c.count + '</span>' : '') +
      '</button>';
    }).join('');
  }

  /* Solo cuenta la lista real. Con el filtro puesto y cero resultados sí hay
     registros, y ahí el botón del encabezado no duplica nada: el del estado
     vacío dice "Ver todas", que es otra acción. */
  marcarListaVacia('quotes', !quotes.length);

  if (!quotes.length) {
    el.innerHTML = tplEmptyState('receipt_long',
      'Sin cotizaciones',
      'Calcula el costo de una pieza, agr\u00e9gala a la orden y gen\u00e9rala desde ah\u00ed.',
      { label: 'Nueva cotizaci\u00f3n', onclick: "showPage('calc')", icon: 'add' });
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
    el.innerHTML = tplEmptyState('search_off',
      'Sin resultados',
      'Ninguna cotización coincide con el filtro o la búsqueda.',
      { label: 'Ver todas', onclick: "_setQuoteFilter('all')", icon: 'filter_alt_off' });
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

  /* Aceptar descuenta inventario y sube a Notion. Antes pasaba de un toque,
     sin preguntar, y no hab\u00eda forma de deshacerlo: regresar el estado a
     pendiente no devolv\u00eda el filamento. */
  if (status === 'aceptada' && q.status !== 'aceptada') {
    m3Confirm('\u00bfMarcar ' + esc(q.quoteNum) + ' como aceptada?', function() {
      _aplicarEstado(i, status);
    }, {
      confirmLabel: 'Aceptar',
      icon: 'check_circle',
      detail: _resumenDescuentoInventario(q)
    });
    return;
  }
  _aplicarEstado(i, status);
}

/* Qu\u00e9 filamento se va a descontar \u2014 para que el di\u00e1logo lo diga antes. */
function _resumenDescuentoInventario(q) {
  var lineas = [];
  (q.items || []).forEach(function(it) {
    var qty = it.qty || 1;
    function agregar(spoolId, gramos) {
      var r = inventory.find(function(x) { return x.id === spoolId; });
      if (!r || gramos <= 0) return;
      lineas.push(gramos.toFixed(0) + ' g de ' + esc(nombreMaterialDeRollo(r)) +
                  (r.color ? ' ' + esc(r.color) : ''));
    }
    if (it.amsColors && it.amsColors.length) {
      var purga = (parseFloat(it.amsPurgeGrams) || 0) / it.amsColors.length;
      it.amsColors.forEach(function(c) {
        agregar(c.spoolId, ((parseFloat(c.weight) || 0) + purga) * qty);
      });
    } else {
      agregar(it.spoolId, (parseFloat(it.weight) || 0) * qty);
    }
  });
  if (!lineas.length) return 'No hay rollos asignados, as\u00ed que no se descuenta inventario.';
  return 'Se va a descontar de tu inventario:<br>\u2022 ' + lineas.join('<br>\u2022 ');
}

function _aplicarEstado(i, status) {
  var q = quotes[i]; if (!q) return;
  var prevStatus = q.status;
  q.status = status;

  if (status === 'aceptada' && prevStatus !== 'aceptada') {
    /* Fecha de aceptaci\u00f3n: el panel reportaba el ingreso en el mes en que se
       CRE\u00d3 la cotizaci\u00f3n. Cotizar en septiembre y cobrar en octubre pon\u00eda el
       dinero en septiembre. */
    q.acceptedAt = new Date().toISOString();
    _deductQuoteInventory(q);
    q.inventarioDescontado = true;
    if (!q.notionPageId) sendToNotion(i, { silent: true });
  }

  /* Salir de "aceptada" devuelve el filamento. Antes se iba y no volv\u00eda. */
  if (prevStatus === 'aceptada' && status !== 'aceptada' && q.inventarioDescontado) {
    _deductQuoteInventory(q, true);
    q.inventarioDescontado = false;
    q.acceptedAt = null;
    snack('Inventario devuelto');
  }

  sv('quotes', quotes);
  renderQuotes();
  renderDashboard();
  if (typeof dbGuardarCotizacion === 'function') dbGuardarCotizacion(q);
  var labels = { aceptada: 'Cotizaci\u00f3n aceptada \u2713', rechazada: 'Cotizaci\u00f3n rechazada',
                 enviada: 'Marcada como enviada', pendiente: 'Regresada a borrador' };
  snack(labels[status] || 'Estado actualizado');
}

/* devolver = true suma en vez de restar, para cuando una cotización deja de
   estar aceptada. Sin esto, equivocarse de botón dejaba el inventario mal
   para siempre y había que corregirlo a mano. */
function _deductQuoteInventory(q, devolver) {
  var changed = false;
  var signo = devolver ? -1 : 1;

  function _descontar(spoolId, grams) {
    if (!spoolId || grams <= 0) return;
    var idx = -1;
    for (var k = 0; k < inventory.length; k++) {
      if (inventory[k].id === spoolId) { idx = k; break; }
    }
    if (idx === -1) return;
    var rollo  = inventory[idx];
    var nuevo  = (parseFloat(rollo.remainingG) || 0) - grams * signo;
    /* Nunca negativo, y nunca más de lo que cabe en el rollo */
    rollo.remainingG = Math.max(0, Math.min(nuevo, parseFloat(rollo.totalG) || nuevo));
    changed = true;
  }

  (q.items || []).forEach(function(it) {
    var qty = it.qty || 1;

    /* Modo AMS: un rollo por color. Se reparte además la purga entre los
       colores activos, porque el material purgado sale de esos mismos rollos. */
    if (it.amsColors && it.amsColors.length) {
      var purgaPorColor = (parseFloat(it.amsPurgeGrams) || 0) / it.amsColors.length;
      it.amsColors.forEach(function(c) {
        _descontar(c.spoolId, ((parseFloat(c.weight) || 0) + purgaPorColor) * qty);
      });
      return;
    }

    /* Modo normal: un solo rollo */
    _descontar(it.spoolId, (parseFloat(it.weight) || 0) * qty);
  });

  if (changed) {
    sv('inventory', inventory);
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof dbGuardarRollo === 'function') {
      inventory.forEach(function(r) { dbGuardarRollo(r); });
    }
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
  /* Una copia nace en blanco. Antes se copiaba todo tal cual, así que duplicar
     una cotización aceptada creaba otra ya "aceptada": el panel sumaba un
     ingreso que nadie había pedido. Y al heredar notionPageId, el botón de
     Notion la daba por sincronizada y nunca subía. */
  dup.status         = 'pendiente';
  dup.acceptedAt     = null;
  delete dup.notionPageId;
  delete dup.notionSyncedAt;
  dup.inventarioDescontado = false;
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

  /* ¿Hay descuento o comisión que valga la pena desglosar? */
  var _tieneAjustes = (q.discountAmt > 0) || (q.commissionAmt > 0);

  /* ¿Se capturó algún dato bancario? Basta uno para mostrar el apartado. */
  var _hayDatosBancarios = !!(config.bizBank || config.bizAccountHolder || config.bizAccountNumber);

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

  /* ── Desglose de costos — los interruptores de Ajustes → Diseño ──────
     Estos cinco interruptores se guardaban y se pintaban en la pantalla de
     configuración, pero buildQuoteHTML nunca los consultaba: prender
     "Mostrar desglose" no hacía absolutamente nada. Ahora sí mandan. */
  function _sumaRubro(campo) {
    return items.reduce(function(acc, it) {
      return acc + (Number(it[campo]) || 0) * (it.qty || 1);
    }, 0);
  }

  var desgloseHTML = '';
  if (s.showDesglose) {
    var rubros = [
      { on: true,                 label: 'Material',      val: _sumaRubro('matCost') },
      { on: true,                 label: 'Energía',       val: _sumaRubro('energyCost') },
      { on: s.showDiseno,         label: 'Diseño',        val: _sumaRubro('laborCost') },
      { on: s.showDepreciacion,   label: 'Depreciación',  val: _sumaRubro('deprecCost') },
      { on: s.showCostosFijos,    label: 'Costos fijos',  val: _sumaRubro('fixedCost') },
      { on: s.showCostosFijos,    label: 'Indirectos',    val: _sumaRubro('indirectCost') },
      { on: s.showCostosFijos,    label: 'Mantenimiento', val: _sumaRubro('maintCost') },
      { on: true,                 label: 'Post-procesado',val: _sumaRubro('postProcCost') },
      { on: s.showDesperdicio,    label: 'Desperdicio',   val: _sumaRubro('wasteCost') }
    ].filter(function(r) { return r.on && r.val > 0.005; });

    if (rubros.length) {
      desgloseHTML =
        '<div class="qf-breakdown-block">' +
          '<div class="qf-breakdown-label">Desglose de costos</div>' +
          rubros.map(function(r) {
            return '<div class="qf-breakdown-row">' +
              '<span>' + r.label + '</span>' +
              '<span>' + cur + r.val.toFixed(2) + '</span>' +
            '</div>';
          }).join('') +
        '</div>';
    }
  }

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

    /* Totales: subtotal, descuento y comisión ahora SÍ se ven.
       Antes el documento imprimía una sola línea TOTAL, así que si le dabas
       12% de descuento a un cliente, el descuento se aplicaba al número pero
       no aparecía en ningún lado — el cliente nunca se enteraba. */
    '<div class="qf-totals">' +
      (_tieneAjustes
        ? '<div class="qf-total-sub"><span>Subtotal</span><span>' + cur + (q.subtotal || 0).toFixed(2) + '</span></div>' +
          (q.discountAmt > 0
            ? '<div class="qf-total-sub"><span>Descuento (' + q.discount + '%)</span>' +
              '<span>&minus;' + cur + q.discountAmt.toFixed(2) + '</span></div>' : '') +
          (q.commissionAmt > 0
            ? '<div class="qf-total-sub"><span>Comisión (' + q.commission + '%)</span>' +
              '<span>' + cur + q.commissionAmt.toFixed(2) + '</span></div>' : '')
        : '') +
      '<div class="qf-total-line" style="color:' + s.primaryColor + '">' +
        '<span>TOTAL</span><span>' + cur + grandTotal.toFixed(2) + '</span>' +
      '</div>' +
    '</div>' +

    desgloseHTML + notesHTML + termsHTML +

    /* Bloque de datos bancarios.
       Antes exigía bizAccountNumber: si capturabas banco y titular pero no la
       cuenta, el apartado no salía nunca. Ahora aparece si hay CUALQUIER dato
       y muestra solo los que capturaste. Sin datos, no se dibuja nada. */
    (config.showBankInfo !== false && _hayDatosBancarios
      ? '<div class="qf-bank-block">' +
          '<div class="qf-bank-label">Datos de pago</div>' +
          '<div class="qf-bank-row">' +
            (config.bizBank ? '<span>' + esc(config.bizBank) + '</span>' : '') +
            (config.bizAccountHolder ? '<span>' + esc(config.bizAccountHolder) + '</span>' : '') +
            (config.bizAccountNumber ? '<span class="qf-bank-num">' + esc(config.bizAccountNumber) + '</span>' : '') +
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

  /* Escritorio: en el contenedor de la derecha (tipo VS Code), sin
     oscurecer la pantalla; la página se angosta para darle lugar. */
  if (_mqEscritorio.matches) {
    _dockQuoteNum = q.quoteNum;
    getQRDataURL().then(function(qrDataURL) {
      var dock = document.getElementById('quote-dock');
      if (!dock) return;
      dock.innerHTML = tplQuoteDock(q, i, buildQuoteHTML(q, qrDataURL));
      document.body.classList.add('dock-open');
    });
    return;
  }

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

/* El contenedor sigue abierto al cambiar de sección, pero sus botones
   (PDF, Imagen, WhatsApp) usan la posición i en la lista, y esa posición
   cambia al generar, duplicar o eliminar. Por eso se recuerda el folio, que
   no cambia, y renderQuotes() vuelve a pintar el contenedor con la
   posición nueva, o lo cierra si la cotización ya no existe. */
var _dockQuoteNum = null;

function _sincronizarDock() {
  if (!_dockQuoteNum || !_mqEscritorio.matches || !document.body.classList.contains('dock-open')) return;
  for (var i = 0; i < quotes.length; i++) {
    if (quotes[i].quoteNum === _dockQuoteNum) { viewQuote(i); return; }
  }
  closeQuoteDock();
}

function closeQuoteDock() {
  _dockQuoteNum = null;
  var dock = document.getElementById('quote-dock');
  if (dock) dock.innerHTML = '';
  document.body.classList.remove('dock-open');
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
  /* Se guarda lo que ten\u00eda el bot\u00f3n para devolverlo igual: el mismo id lo
     usan el visor, el contenedor lateral y la tarjeta del modal de env\u00edo */
  var btnHTML = btn ? btn.innerHTML : '';
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

      if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
    }, 'image/png');

  }).catch(function(err) {
    if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
    snack(err.message || 'Error al generar la imagen');
    if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
  });
}

function btnImgLabel() {
  var canShare = !!(navigator.share && navigator.canShare);
  return canShare
    ? '<span class="material-symbols-rounded" style="font-size:18px">share</span> Imagen'
    : '<span class="material-symbols-rounded" style="font-size:18px">download</span> Imagen';
}

/* Quita acentos y signos. Solo se usa para armar nombres de archivo:
   el PDF ya no necesita esto porque ahora se renderiza como imagen y
   conserva los acentos (antes la fuente Helvetica de pdf-lib los perdía). */
function safeStr(s) {
  return String(s == null ? '' : s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
}

/* data:image/png;base64,… → Uint8Array, que es lo que espera pdf-lib */
function dataUrlToUint8(dataUrl) {
  var base64 = String(dataUrl).split(',')[1] || '';
  var bin    = atob(base64);
  var bytes  = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
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
/* ── Exportar a PDF ───────────────────────────────────────────────
   Antes el PDF se dibujaba a mano con primitivas de pdf-lib: rectángulos,
   líneas y texto colocados por coordenadas. Eso traía tres problemas:

     1. No se parecía al diseño que el usuario ve en pantalla ni a la imagen
        que exporta, porque era una segunda implementación del mismo layout.
     2. La fuente Helvetica estándar de pdf-lib no tiene acentos, así que
        "COTIZACIÓN" salía como "COTIZACION" y "Peña" como "Pena".
     3. No había salto de página: pasando de ~22 renglones el texto se
        encimaba con el pie y luego se dibujaba fuera de la hoja.

   Ahora se renderiza el MISMO HTML de la cotización con html2canvas y se
   incrusta en el PDF. El documento queda idéntico a la vista previa y a la
   imagen, los acentos funcionan, y el contenido largo se reparte en varias
   páginas automáticamente.

   Se conservan pdf-lib y html2canvas: las dos ya estaban en el proyecto, son
   gratuitas y se cargan solo al exportar. No hizo falta ninguna librería
   nueva — la limitante no era pdf-lib, era dibujar el diseño dos veces.

   Contrapartida honesta: el texto del PDF deja de ser seleccionable, porque
   es una imagen. Para una cotización que se imprime o se manda por WhatsApp
   eso no estorba; si algún día hace falta texto buscable, el camino es
   generar el PDF desde el servidor con un motor de HTML. */
function exportQuotePDF(i) {
  var q = quotes[i]; if (!q) return;
  var btn = document.getElementById('btn-export-pdf-' + i);
  var btnHTML = btn ? btn.innerHTML : '';   /* ver exportQuoteImage */
  function restaurarBoton() {
    if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
  }
  if (btn) { btn.disabled = true; btn.textContent = 'Generando\u2026'; }
  snack('Generando PDF\u2026');

  /* A4 en puntos (72 dpi) */
  var A4_W = 595.28, A4_H = 841.89;
  /* Ancho de render en px. 794 px ≈ A4 a 96 dpi; con scale 2 da 1588 px de
     ancho real, suficiente para que el texto imprima nítido. */
  var RENDER_W = 794;

  var wrapper = document.createElement('div');
  wrapper.style.cssText = [
    'position:fixed', 'left:-9999px', 'top:0',
    'width:' + RENDER_W + 'px',
    'background:#ffffff',
    'padding:32px',
    'box-sizing:border-box',
    'font-family:Inter,sans-serif'
  ].join(';');
  document.body.appendChild(wrapper);

  function limpiar() {
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  }

  getQRDataURL().then(function(qrDataURL) {
    wrapper.innerHTML = buildQuoteHTML(q, qrDataURL);
    return loadHtml2Canvas();
  }).then(function(h2c) {
    return h2c(wrapper, {
      scale: 2, useCORS: true, allowTaint: true,
      backgroundColor: '#ffffff', logging: false,
      width: RENDER_W, windowWidth: RENDER_W
    });
  }).then(function(canvas) {
    limpiar();
    return loadPdfLib().then(function(PDFLib) {
      return PDFLib.PDFDocument.create().then(function(doc) {

        /* Cuántos píxeles de la imagen caben en el alto de una página */
        var pxPorPunto  = canvas.width / A4_W;
        var altoPaginaPx = Math.floor(A4_H * pxPorPunto);
        var paginas = Math.max(1, Math.ceil(canvas.height / altoPaginaPx));

        var cadena = Promise.resolve();
        for (var n = 0; n < paginas; n++) {
          (function(pagina) {
            cadena = cadena.then(function() {
              var sy = pagina * altoPaginaPx;
              var sh = Math.min(altoPaginaPx, canvas.height - sy);

              /* Recorte de esta página */
              var trozo = document.createElement('canvas');
              trozo.width  = canvas.width;
              trozo.height = sh;
              var ctx = trozo.getContext('2d');
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, trozo.width, trozo.height);
              ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

              var altoPt = sh / pxPorPunto;
              var page = doc.addPage([A4_W, A4_H]);
              return doc.embedPng(dataUrlToUint8(trozo.toDataURL('image/png')))
                .then(function(img) {
                  /* Pegado al borde superior: el HTML ya trae su propio margen */
                  page.drawImage(img, { x: 0, y: A4_H - altoPt, width: A4_W, height: altoPt });
                });
            });
          })(n);
        }
        return cadena.then(function() { return doc.save(); });
      });
    });
  }).then(function(pdfBytes) {
    var blob = new Blob([pdfBytes], { type: 'application/pdf' });
    var fname = (q.quoteNum || 'cotizacion') + '_' +
      safeStr(q.client || '').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') + '.pdf';

    if (navigator.share && navigator.canShare) {
      var file = new File([blob], fname, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        navigator.share({ title: q.quoteNum, files: [file] }).catch(function(e) {
          if (e.name !== 'AbortError') { downloadBlob(blob, fname); snack('PDF descargado'); }
        });
        restaurarBoton();
        return;
      }
    }
    downloadBlob(blob, fname);
    snack('PDF descargado');
    restaurarBoton();
  }).catch(function(err) {
    limpiar();
    console.error('[PDF]', err);
    snack((err && err.message) || 'Error al generar el PDF');
    restaurarBoton();
  });
}

/* ── Eliminar cotización ──────────────────────────────────────── */
function deleteQuote(i) {
  m3Confirm('\u00bfEliminar cotizaci\u00f3n?', function() {
    var borradaId = quotes[i] && quotes[i].id;
    quotes.splice(i, 1);
    sv('quotes', quotes);
    if (borradaId && typeof dbBorrarCotizacion === 'function') dbBorrarCotizacion(borradaId);
    renderQuotes();
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
