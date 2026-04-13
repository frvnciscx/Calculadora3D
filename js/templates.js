/* ===== TEMPLATES =================================================
   Funciones puras: reciben datos, devuelven strings de HTML.
   Sin efectos secundarios, sin acceso al DOM, sin estado global.
   Los módulos de lógica (quotes.js, clients.js, etc.) llaman a
   estas funciones y asignan el resultado a .innerHTML.
   ================================================================ */

/* ── Utilidades compartidas ─────────────────────────────────────── */

function tplEmptyState(icon, text) {
  return '<div class="empty-state">' +
    '<span class="material-symbols-rounded">' + icon + '</span>' +
    '<p>' + text + '</p>' +
  '</div>';
}

function tplIcon(name, size) {
  size = size || 18;
  return '<span class="material-symbols-rounded" style="font-size:' + size + 'px">' + name + '</span>';
}

function tplSheetHeader(title) {
  return '<div class="m3-drag-handle"></div><h2>' + title + '</h2>';
}

function tplSheetActions(cancelFn, saveFn, saveLabel) {
  saveLabel = saveLabel || 'Guardar';
  return '<div class="m3-sheet-actions">' +
    '<button class="m3-btn-outlined" onclick="' + cancelFn + '">Cancelar</button>' +
    '<button class="m3-btn-filled" onclick="' + saveFn + '">' + saveLabel + '</button>' +
  '</div>';
}

/* ── HISTORY ────────────────────────────────────────────────────── */

function tplHistoryItem(h, i, cur) {
  return '<div class="hist-item">' +
    '<div class="hist-header">' +
      '<div>' +
        '<div class="hist-desc">' + esc(h.desc) + '</div>' +
        '<div class="hist-date">' +
          new Date(h.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) +
        '</div>' +
      '</div>' +
      '<div class="hist-total">' + cur + h.totalCost.toFixed(2) + '</div>' +
    '</div>' +
    '<div class="hist-chips">' +
      '<span class="hist-chip">' + esc(h.printer)  + '</span>' +
      '<span class="hist-chip">' + esc(h.material) + '</span>' +
      '<span class="hist-chip">' + h.weight + 'g</span>' +
      '<span class="hist-chip">' + h.timeH  + 'hrs</span>' +
      '<span class="hist-chip">Margen ' + h.margin + '%</span>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
      '<button class="m3-btn-text m3-btn-sm" onclick="reuseCalc(' + i + ')">' +
        tplIcon('replay', 16) + ' Reusar' +
      '</button>' +
      '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteHistoryItem(' + i + ')">' +
        tplIcon('delete', 16) +
      '</button>' +
    '</div>' +
  '</div>';
}

/* ── PRINTERS ───────────────────────────────────────────────────── */

function tplPrinterItem(p, cur) {
  return '<div class="m3-list-item">' +
    '<div class="leading">' + tplIcon('print') + '</div>' +
    '<div class="content">' +
      '<h3>' + esc(p.name) + '</h3>' +
      '<p>' + p.power + 'W &middot; ' + esc(p.type) + ' &middot; ' +
        cur + (p.cost || 0).toLocaleString() + ' &middot; ' + (p.lifeHours || 0) + 'hrs vida' +
      '</p>' +
    '</div>' +
    '<div class="actions">' +
      '<button class="m3-btn-text m3-btn-sm" onclick="showPrinterModal(\'' + p.id + '\')">' +
        tplIcon('edit') +
      '</button>' +
      '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deletePrinter(\'' + p.id + '\')">' +
        tplIcon('delete') +
      '</button>' +
    '</div>' +
  '</div>';
}

function tplPrinterModal(e, editId) {
  var title = (e ? 'Editar' : 'Nueva') + ' impresora';
  var sel = function(type) { return e && e.type === type ? ' selected' : ''; };
  return '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      tplSheetHeader(title) +
      '<div class="m3-field">' +
        '<input type="text" id="mod-p-name" value="' + esc(e ? e.name : '') + '" placeholder=" ">' +
        '<label>Nombre</label>' +
      '</div>' +
      '<div class="flex-row">' +
        '<div class="m3-field">' +
          '<input type="number" id="mod-p-power" value="' + (e ? e.power : '') + '" placeholder=" " min="0">' +
          '<label>Potencia (W)</label>' +
        '</div>' +
        '<div class="m3-field">' +
          '<select id="mod-p-type">' +
            '<option value="FDM"' + sel('FDM') + '>FDM</option>' +
            '<option value="Resina"' + sel('Resina') + '>Resina</option>' +
            '<option value="SLA"' + sel('SLA') + '>SLA</option>' +
          '</select>' +
          '<label>Tipo</label>' +
        '</div>' +
      '</div>' +
      '<div class="flex-row">' +
        '<div class="m3-field">' +
          '<input type="number" id="mod-p-cost" value="' + (e ? (e.cost || 0) : '') + '" placeholder=" " min="0" step="1">' +
          '<label>Costo ($)</label>' +
        '</div>' +
        '<div class="m3-field">' +
          '<input type="number" id="mod-p-life" value="' + (e ? (e.lifeHours || 0) : '') + '" placeholder=" " min="0" step="100">' +
          '<label>Vida útil (hrs)</label>' +
        '</div>' +
      '</div>' +
      tplSheetActions('closeModal()', 'savePrinter(\'' + (editId || '') + '\')') +
    '</div>';
}

/* ── MATERIALS ──────────────────────────────────────────────────── */

function tplMaterialItem(m, cur) {
  return '<div class="m3-list-item">' +
    '<div class="leading">' + tplIcon('category') + '</div>' +
    '<div class="content">' +
      '<h3>' + esc(m.name) + '</h3>' +
      '<p>' + cur + m.costPerKg + '/kg &middot; ' + esc(m.type) + ' &middot; ' + m.density + ' g/cm³</p>' +
    '</div>' +
    '<div class="actions">' +
      '<button class="m3-btn-text m3-btn-sm" onclick="showMaterialModal(\'' + m.id + '\')">' +
        tplIcon('edit') +
      '</button>' +
      '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteMaterial(\'' + m.id + '\')">' +
        tplIcon('delete') +
      '</button>' +
    '</div>' +
  '</div>';
}

function tplMaterialModal(e, editId) {
  var title = (e ? 'Editar' : 'Nuevo') + ' material';
  var sel = function(type) { return e && e.type === type ? ' selected' : ''; };
  return '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      tplSheetHeader(title) +
      '<div class="m3-field">' +
        '<input type="text" id="mod-m-name" value="' + esc(e ? e.name : '') + '" placeholder=" ">' +
        '<label>Nombre</label>' +
      '</div>' +
      '<div class="flex-row">' +
        '<div class="m3-field">' +
          '<input type="number" id="mod-m-cost" value="' + (e ? e.costPerKg : '') + '" placeholder=" " min="0" step="0.01">' +
          '<label>Costo/kg</label>' +
        '</div>' +
        '<div class="m3-field">' +
          '<input type="number" id="mod-m-density" value="' + (e ? e.density : '1.24') + '" placeholder=" " min="0" step="0.01">' +
          '<label>Densidad (g/cm³)</label>' +
        '</div>' +
      '</div>' +
      '<div class="m3-field">' +
        '<select id="mod-m-type">' +
          '<option value="FDM"'    + sel('FDM')    + '>FDM (Filamento)</option>' +
          '<option value="Resina"' + sel('Resina') + '>Resina</option>' +
        '</select>' +
        '<label>Tipo</label>' +
      '</div>' +
      tplSheetActions('closeModal()', 'saveMaterial(\'' + (editId || '') + '\')') +
    '</div>';
}

/* ── CLIENTS ────────────────────────────────────────────────────── */

function tplClientCard(c, i, quoteCount, totalSpent, cur) {
  var waBtn = c.phone
    ? '<a href="https://wa.me/' + c.phone.replace(/\D/g, '') + '" target="_blank" ' +
        'class="m3-btn-text m3-btn-sm" style="color:#25D366;text-decoration:none;display:inline-flex;align-items:center;gap:4px">' +
        tplIcon('chat', 16) + ' WA' +
      '</a>'
    : '';

  var quotesToggle = quoteCount > 0
    ? '<button class="m3-btn-text m3-btn-sm" onclick="toggleClientQuotes(' + i + ')">' +
        tplIcon('receipt_long', 16) +
        ' <span id="cq-toggle-label-' + i + '">Ver ' + quoteCount + ' cotizaci' + (quoteCount === 1 ? 'ón' : 'ones') + '</span>' +
      '</button>'
    : '';

  return '<div class="client-card" id="client-card-' + i + '">' +
    '<div class="client-header">' +
      '<div class="client-avatar">' + (c.name || '?')[0].toUpperCase() + '</div>' +
      '<div class="client-info">' +
        '<div class="client-name">' + esc(c.name) + '</div>' +
        (c.phone ? '<div class="client-sub">' + esc(c.phone) + '</div>' : '') +
        (c.email ? '<div class="client-sub">' + esc(c.email) + '</div>' : '') +
      '</div>' +
      '<div class="client-stats">' +
        '<div class="client-stat-val">' + quoteCount + '</div>' +
        '<div class="client-stat-lbl">cotizaciones</div>' +
        (totalSpent > 0 ? '<div class="client-stat-total">' + cur + totalSpent.toFixed(0) + '</div>' : '') +
      '</div>' +
    '</div>' +
    (c.notes ? '<div class="client-notes">' + esc(c.notes) + '</div>' : '') +
    '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center">' +
      waBtn +
      quotesToggle +
      '<button class="m3-btn-text m3-btn-sm" onclick="showClientModal(' + i + ')">' +
        tplIcon('edit', 16) + ' Editar' +
      '</button>' +
      '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteClient(' + i + ')">' +
        tplIcon('delete', 16) +
      '</button>' +
    '</div>' +
    /* Sección expandible de cotizaciones — oculta por defecto */
    '<div id="cq-section-' + i + '" class="client-quotes-section hidden">' +
      '<div class="cq-tabs">' +
        '<button class="cq-tab active" id="cq-tab-pendiente-' + i + '" onclick="setClientQuoteTab(' + i + ',\'pendiente\')">' +
          '⏳ Pendientes' +
        '</button>' +
        '<button class="cq-tab" id="cq-tab-aceptada-' + i + '" onclick="setClientQuoteTab(' + i + ',\'aceptada\')">' +
          '✓ Aceptadas' +
        '</button>' +
      '</div>' +
      '<div id="cq-list-' + i + '" class="cq-list"></div>' +
    '</div>' +
  '</div>';
}

/* Mini-fila de cotización dentro del card de cliente */
function tplClientQuoteRow(q, qi, cur) {
  var total = q.grandTotal != null ? q.grandTotal : (q.totalCost || 0);
  var date  = new Date(q.quoteDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  return '<div class="cq-row">' +
    '<div class="cq-row-left">' +
      '<span class="cq-row-num">' + esc(q.quoteNum) + '</span>' +
      '<span class="cq-row-date">' + date + '</span>' +
    '</div>' +
    '<div class="cq-row-right">' +
      '<span class="cq-row-total">' + cur + total.toFixed(2) + '</span>' +
      '<button class="m3-btn-text m3-btn-sm" onclick="viewQuote(' + qi + ')" style="padding:0 6px;height:28px">' +
        tplIcon('visibility', 14) +
      '</button>' +
    '</div>' +
  '</div>';
}

function tplClientModal(c, editIndex) {
  var title = c ? 'Editar cliente' : 'Nuevo cliente';
  var saveFn = 'saveClient(' + (editIndex != null ? editIndex : 'null') + ')';
  return '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      tplSheetHeader(title) +
      '<div class="m3-field">' +
        '<input type="text" id="cli-name" placeholder=" " value="' + esc(c ? c.name : '') + '">' +
        '<label for="cli-name">Nombre del cliente</label>' +
      '</div>' +
      '<div class="flex-row">' +
        '<div class="m3-field" style="flex:1">' +
          '<input type="tel" id="cli-phone" placeholder=" " inputmode="tel" value="' + esc(c ? c.phone || '' : '') + '">' +
          '<label for="cli-phone">Teléfono / WhatsApp</label>' +
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
      tplSheetActions('closeModal()', saveFn) +
    '</div>';
}

/* ── INVENTORY ──────────────────────────────────────────────────── */

function tplInventoryCard(item, i, cur) {
  var total   = parseFloat(item.totalG)     || 0;
  var remain  = parseFloat(item.remainingG) || 0;
  if (remain > total) remain = total;
  var pct      = total > 0 ? Math.round((remain / total) * 100) : 0;
  var used     = total - remain;
  var barColor = pct > 50 ? 'var(--accent-mint)' : pct > 20 ? '#F9A825' : 'var(--md-error)';
  var alertIcon = pct <= 20
    ? '<span class="material-symbols-rounded" style="color:var(--md-error);font-size:16px;margin-left:4px" title="Stock bajo">warning</span>'
    : '';

  return '<div class="inv-card">' +
    '<div class="inv-header">' +
      '<div class="inv-info">' +
        '<div class="inv-name">' + esc(item.material) + alertIcon + '</div>' +
        '<div class="inv-sub">' + esc(item.brand || '') +
          (item.color ? ' &middot; ' + esc(item.color) : '') +
        '</div>' +
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
        tplIcon('remove', 16) + ' Descontar' +
      '</button>' +
      '<button class="m3-btn-text m3-btn-sm" onclick="showInventoryModal(' + i + ')">' +
        tplIcon('edit', 16) + ' Editar' +
      '</button>' +
      '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteInventory(' + i + ')">' +
        tplIcon('delete', 16) +
      '</button>' +
    '</div>' +
  '</div>';
}

function tplInventoryModal(item, editIndex, matOptions) {
  var title  = item ? 'Editar filamento' : 'Agregar filamento';
  var saveFn = 'saveInventory(' + (editIndex != null ? editIndex : 'null') + ')';
  return '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      tplSheetHeader(title) +
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
          '<input type="number" id="inv-total" placeholder=" " inputmode="decimal" min="1" step="1" value="' +
            (item ? item.totalG || '' : '1000') + '">' +
          '<label for="inv-total">Peso total (g)</label>' +
        '</div>' +
        '<div class="m3-field" style="flex:1">' +
          '<input type="number" id="inv-remaining" placeholder=" " inputmode="decimal" min="0" step="1" value="' +
            (item ? item.remainingG || '' : '1000') + '">' +
          '<label for="inv-remaining">Restante (g)</label>' +
        '</div>' +
      '</div>' +
      '<div class="m3-field optional">' +
        '<input type="number" id="inv-cost" placeholder=" " inputmode="decimal" min="0" step="1" value="' +
          (item ? item.costPerKg || '' : '') + '">' +
        '<label for="inv-cost">Costo por kg (opcional)</label>' +
      '</div>' +
      tplSheetActions('closeModal()', saveFn) +
    '</div>';
}

function tplDeductModal(item, i) {
  return '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      tplSheetHeader('Descontar filamento') +
      '<p style="font-size:14px;color:var(--md-on-surface-variant);margin-bottom:16px">' +
        esc(item.material) + (item.color ? ' ' + esc(item.color) : '') +
        ' &mdash; Restante: ' + (parseFloat(item.remainingG) || 0).toFixed(0) + 'g' +
      '</p>' +
      '<div class="m3-field">' +
        '<input type="number" id="deduct-g" placeholder=" " inputmode="decimal" min="1" step="0.1">' +
        '<label for="deduct-g">Gramos a descontar</label>' +
      '</div>' +
      tplSheetActions('closeModal()', 'deductInventory(' + i + ')', 'Descontar') +
    '</div>';
}

/* ── QUOTES — card individual ───────────────────────────────────── */

function tplQuoteCard(q, i, cur) {
  var total     = q.grandTotal != null ? q.grandTotal
                : (q.totalWithQty != null ? q.totalWithQty : (q.totalCost || 0));
  var itemCount = q.items ? q.items.length : 1;
  var firstItem = q.items ? q.items[0] : q;
  var status    = q.status || 'pendiente';

  var chipsHTML = itemCount > 1
    ? '<span class="hist-chip">' + itemCount + ' productos</span>' +
      '<span class="hist-chip">' + esc(firstItem.desc) + '\u2026</span>' +
      '<span class="hist-chip">' + esc(firstItem.material) + '</span>'
    : '<span class="hist-chip">' + esc(firstItem.desc     || q.desc     || '') + '</span>' +
      '<span class="hist-chip">' + esc(firstItem.material || q.material || '') + '</span>';

  var statusHTML = '<span class="status-badge status-' + status + '">' + statusLabel(status) + '</span>';

  var waBtn = (q.phone || config.bizPhone)
    ? '<button class="m3-btn-text m3-btn-sm" style="color:#25D366" onclick="whatsappQuote(' + i + ')">' +
        tplIcon('chat', 16) + ' WA' +
      '</button>'
    : '';

  var notionBtn = status === 'aceptada'
    ? '<button class="m3-btn-text m3-btn-sm notion-btn" id="notion-btn-' + i + '" onclick="sendToNotion(' + i + ')" title="Sincronizar con Notion">' +
        '<svg width="14" height="14" viewBox="0 0 100 100" fill="currentColor" style="vertical-align:middle;margin-right:4px">' +
          '<path d="M8 7c0-2.8 2.2-5 5-5h60l19 19v72c0 2.8-2.2 5-5 5H13c-2.8 0-5-2.2-5-5V7z" fill="none" stroke="currentColor" stroke-width="8"/>' +
          '<path d="M73 2v19h19" fill="none" stroke="currentColor" stroke-width="8"/>' +
          '<line x1="25" y1="40" x2="75" y2="40" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>' +
          '<line x1="25" y1="58" x2="75" y2="58" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>' +
          '<line x1="25" y1="76" x2="55" y2="76" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>' +
        '</svg>Notion' +
      '</button>'
    : '';

  var statusBtns = '';
  if (status !== 'aceptada') {
    statusBtns += '<button class="m3-btn-text m3-btn-sm" style="color:var(--accent-mint)" onclick="setQuoteStatus(' + i + ',\'aceptada\')">' +
      tplIcon('check_circle', 16) + ' Aceptar</button>';
  }
  if (status !== 'rechazada') {
    statusBtns += '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="setQuoteStatus(' + i + ',\'rechazada\')">' +
      tplIcon('cancel', 16) + ' Rechazar</button>';
  }
  if (status !== 'pendiente') {
    statusBtns += '<button class="m3-btn-text m3-btn-sm" onclick="setQuoteStatus(' + i + ',\'pendiente\')">' +
      tplIcon('schedule', 16) + ' Pendiente</button>';
  }

  return '<div class="hist-item">' +
    '<div class="hist-header">' +
      '<div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<div style="font-size:12px;color:var(--md-primary);font-weight:500">' + esc(q.quoteNum) + '</div>' +
          statusHTML +
        '</div>' +
        '<div class="hist-desc">' + esc(q.client) + '</div>' +
        '<div class="hist-date">' +
          new Date(q.quoteDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) +
        '</div>' +
      '</div>' +
      '<div class="hist-total">' + cur + total.toFixed(2) + '</div>' +
    '</div>' +
    '<div class="hist-chips">' + chipsHTML + '</div>' +
    '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
      '<button class="m3-btn-text m3-btn-sm" onclick="viewQuote(' + i + ')">'     + tplIcon('visibility', 16) + ' Ver</button>' +
      '<button class="m3-btn-text m3-btn-sm" onclick="shareQuote(' + i + ')">'    + tplIcon('share', 16)      + ' Compartir</button>' +
      waBtn +
      '<button class="m3-btn-text m3-btn-sm" onclick="duplicateQuote(' + i + ')">'+ tplIcon('content_copy', 16) + ' Duplicar</button>' +
      '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteQuote(' + i + ')">' + tplIcon('delete', 16) + '</button>' +
      notionBtn +
    '</div>' +
    '<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;border-top:1px solid var(--md-outline);padding-top:8px">' +
      statusBtns +
    '</div>' +
  '</div>';
}

/* ── QUOTES — modal de borrador ─────────────────────────────────── */

function tplDraftItem(item, i, cur) {
  return '<div class="draft-item">' +
    '<div class="draft-item-info">' +
      '<div class="draft-item-desc">'+ esc(item.desc) + '</div>' +
      '<div class="draft-item-sub">' + esc(item.printer) + ' &middot; ' + esc(item.material) + '</div>' +
    '</div>' +
    '<div class="draft-item-controls">' +
      '<button class="draft-qty-btn" onclick="draftItemQty(' + i + ',-1)">&#8722;</button>' +
      '<span class="draft-qty-val" id="dqi-' + i + '">' + item.qty + '</span>' +
      '<button class="draft-qty-btn" onclick="draftItemQty(' + i + ',1)">&#43;</button>' +
      '<span class="draft-item-price" id="dqp-' + i + '">' + cur + (item.totalCost * item.qty).toFixed(2) + '</span>' +
      '<button class="draft-remove-btn" onclick="removeDraftItem(' + i + ')" title="Quitar">&#10005;</button>' +
    '</div>' +
  '</div>';
}

function tplDraftModal(draft, cur) {
  var grandTotal = draft.items.reduce(function(s, it) { return s + it.totalCost * it.qty; }, 0);
  var itemsHTML  = draft.items.map(function(item, i) { return tplDraftItem(item, i, cur); }).join('');

  return '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      tplSheetHeader('Nueva cotización') +
      /* Campo cliente con autocompletado */
      '<div class="client-autocomplete-wrap">' +
        '<div class="m3-field">' +
          '<input type="text" id="q-client" placeholder=" " value="' + esc(draft.client || '') + '" ' +
            'oninput="onClientInput(this)" autocomplete="off">' +
          '<label for="q-client">Nombre del cliente</label>' +
        '</div>' +
        '<div id="q-client-suggestions" class="client-suggestions"></div>' +
      '</div>' +
      '<div class="m3-field optional">' +
        '<input type="tel" id="q-phone" inputmode="tel" placeholder=" " value="' + esc(draft.phone || '') + '">' +
        '<label for="q-phone">Teléfono</label>' +
      '</div>' +
      '<div class="m3-field optional">' +
        '<input type="text" id="q-notes" placeholder=" " value="' + esc(draft.notes || '') + '">' +
        '<label for="q-notes">Notas adicionales</label>' +
      '</div>' +
      '<div class="draft-items-section">' +
        '<div class="draft-items-header">' +
          '<span>PRODUCTOS (' + draft.items.length + ')</span>' +
          '<button class="m3-btn-text" style="font-size:13px;width:auto;padding:0 8px;height:36px" onclick="addMoreToQuote()">' +
            tplIcon('add', 16) + ' Agregar producto' +
          '</button>' +
        '</div>' +
        itemsHTML +
      '</div>' +
      '<div class="draft-total-row">' +
        '<span>TOTAL</span>' +
        '<span id="draft-grand-total">' + cur + grandTotal.toFixed(2) + '</span>' +
      '</div>' +
      '<div class="m3-sheet-actions">' +
        '<button class="m3-btn-outlined" onclick="closeModal()">Cancelar</button>' +
        '<button class="m3-btn-filled" onclick="saveQuote()">Generar cotización</button>' +
      '</div>' +
    '</div>';
}
