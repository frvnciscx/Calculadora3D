/* ===== TEMPLATES =================================================
   Funciones puras: reciben datos, devuelven strings de HTML.
   Sin efectos secundarios, sin acceso al DOM, sin estado global.
   Los módulos de lógica (quotes.js, clients.js, etc.) llaman a
   estas funciones y asignan el resultado a .innerHTML.
   ================================================================ */

/* ── Utilidades compartidas ─────────────────────────────────────── */

/* Estado vacío con jerarquía: icono → título → explicación → acción.
   El botón va DEBAJO del texto, que es donde la gente lo busca después de
   leer qué pasó. Antes el texto incluía la instrucción ("usa la calculadora
   y presiona…") sin que hubiera nada que presionar ahí mismo.

   accion (opcional): { label, onclick, icon } */
function tplEmptyState(icon, titulo, descripcion, accion, secundaria) {
  /* Compatibilidad: las llamadas viejas pasaban (icono, textoUnico) */
  if (descripcion === undefined && accion === undefined) {
    descripcion = titulo;
    titulo = '';
  }
  return '<div class="empty-state">' +
    '<div class="empty-state-icon">' +
      '<span class="material-symbols-rounded">' + icon + '</span>' +
    '</div>' +
    (titulo ? '<h3 class="empty-state-title">' + titulo + '</h3>' : '') +
    (descripcion ? '<p>' + descripcion + '</p>' : '') +
    (accion
      ? '<button class="btn btn-primary empty-state-action" onclick="' + accion.onclick + '">' +
          (accion.icon
            ? '<span class="material-symbols-rounded" style="font-size:18px">' + accion.icon + '</span> '
            : '') +
          accion.label +
        '</button>'
      : '') +
    /* Una segunda salida, más discreta: «Agregar los comunes» (D195) */
    (secundaria
      ? '<button class="btn btn-ghost empty-state-action empty-state-secundaria" onclick="' + secundaria.onclick + '">' +
          secundaria.label + '</button>'
      : '') +
  '</div>';
}

/* Impresoras comunes para elegir (D195, como pedía D47): las de ejemplo de
   antes, con valores de referencia que después se cambian */
function tplImpresorasComunes() {
  var cur = (config && config.currency) || '$';
  var mil = function(n) { return Number(n || 0).toLocaleString('es-MX'); };
  return '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      tplSheetHeader('Impresoras comunes') +
      '<div class="comunes-lista" role="group" aria-label="Impresoras comunes">' +
        PRINTERS_EJEMPLO.map(function(p, k) {
          return '<label class="comunes-fila">' +
            '<input type="checkbox" value="' + k + '">' +
            '<span class="comunes-texto">' +
              '<span class="comunes-nombre">' + esc(p.name) + '</span>' +
              '<span class="comunes-sub">' + esc(p.type) + ' · ' + p.power + ' W · ' + formatoDinero(p.cost, cur) +
                ' · ' + mil(p.lifeHours) + ' h' + (p.multicolor ? ' · ' + p.heads + ' colores' : '') + '</span>' +
            '</span>' +
          '</label>';
        }).join('') +
      '</div>' +
      tplSheetActions('closeModal()', 'agregarImpresorasElegidas()', 'Agregar') +
    '</div>';
}

/* El precio grande con los centavos más chicos (D237): «$1,250.00» con el
   «.00» a menos de la mitad, para que a 72 px se lea «$1,250» de un vistazo */
function tplDinero(n, cur) {
  var s = formatoDinero(n, cur), k = s.lastIndexOf('.');
  return esc(s.slice(0, k)) + '<span class="centavos">' + s.slice(k) + '</span>';
}

function tplIcon(name, size) {
  size = size || 18;
  /* aria-hidden: el lector de pantalla no lee el nombre del ícono («edit», «delete»), D214 */
  return '<span class="material-symbols-rounded" aria-hidden="true" style="font-size:' + size + 'px">' + name + '</span>';
}

function tplSheetHeader(title, closeFn) {
  closeFn = closeFn || 'closeModal()';
  return '<div class="m3-drag-handle"></div>' +
    '<div class="sheet-header-row">' +
      '<h2>' + title + '</h2>' +
      '<button class="sheet-close-btn" onclick="' + closeFn + '" aria-label="Cerrar">' +
        '<span class="material-symbols-rounded" style="font-size:20px">close</span>' +
      '</button>' +
    '</div>';
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
      '<div class="hist-total">' + formatoDinero(h.totalCost, cur) + '</div>' +
    '</div>' +
    '<div class="hist-chips">' +
      '<span class="hist-chip">' + esc(h.printer)  + '</span>' +
      '<span class="hist-chip">' + esc(h.material) + '</span>' +
      '<span class="hist-chip">' + h.weight + 'g</span>' +
      '<span class="hist-chip">' + h.timeH  + 'hrs</span>' +
      '<span class="hist-chip">+' + (Number(h.margin) || 0) + ' % sobre costo</span>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
      '<button class="m3-btn-text m3-btn-sm" onclick="reuseCalc(' + i + ')">' +
        tplIcon('replay', 16) + ' Reusar' +
      '</button>' +
      '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteHistoryItem(' + i + ')" aria-label="Borrar ' + esc(h.desc) + '">' +
        tplIcon('delete', 16) +
      '</button>' +
    '</div>' +
  '</div>';
}

/* ── PRINTERS ───────────────────────────────────────────────────── */

function tplPrinterItem(p, cur) {
  var multiTag = p.multicolor
    ? '<span style="display:inline-flex;align-items:center;font-size:12px;font-family:var(--font-mono);color:var(--accent);' +
        'background:color-mix(in oklab,var(--accent) 12%,transparent);' +
        'border:0.5px solid color-mix(in oklab,var(--accent) 30%,transparent);' +
        'padding:2px 6px;border-radius:4px;margin-top:4px;width:fit-content">' +
        'Multicolor &middot; ' + (p.heads || 4) + ' cabezales</span>'
    : '';
  return '<div class="m3-list-item">' +
    '<div class="leading">' + tplIcon('print') + '</div>' +
    '<div class="content" style="min-width:0">' +
      '<h3 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(p.name) + '</h3>' +
      (multiTag ? '<div>' + multiTag + '</div>' : '') +
      '<p>' + p.power + 'W &middot; ' + esc(p.type) + ' &middot; ' +
        formatoDinero(p.cost, cur) + ' &middot; ' + (p.lifeHours || 0) + 'hrs vida' +
      '</p>' +
    '</div>' +
    '<div class="actions">' +
      '<button class="m3-btn-text m3-btn-sm" onclick="showPrinterModal(\'' + p.id + '\')" aria-label="Editar ' + esc(p.name) + '">' +
        tplIcon('edit') +
      '</button>' +
      '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deletePrinter(\'' + p.id + '\')" aria-label="Borrar ' + esc(p.name) + '">' +
        tplIcon('delete') +
      '</button>' +
    '</div>' +
  '</div>';
}

function tplPrinterModal(e, editId) {
  var title    = (e ? 'Editar' : 'Nueva') + ' impresora';
  var sel      = function(type) { return e && e.type === type ? ' selected' : ''; };
  var isMulti  = e ? !!e.multicolor : false;
  var heads    = e ? (e.heads || 4) : 4;
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
            '<option value="FDM"'    + sel('FDM')    + '>FDM</option>' +
            '<option value="Resina"' + sel('Resina') + '>Resina</option>' +
            '<option value="SLA"'    + sel('SLA')    + '>SLA</option>' +
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
      /* ── Toggle multicolor ─────────────────────────── */
      '<div style="margin-top:4px">' +
        '<div class="etiqueta" style="margin-bottom:8px">Impresión multicolor</div>' +
        '<div class="seg" style="display:flex;width:100%">' +
          '<button type="button" id="mod-p-multi-no"  onclick="_printerMultiToggle(false)" style="flex:1"' + (!isMulti ? ' class="active"' : '') + '>Un color</button>' +
          '<button type="button" id="mod-p-multi-yes" onclick="_printerMultiToggle(true)"  style="flex:1"' + (isMulti  ? ' class="active"' : '') + '>Multicolor</button>' +
        '</div>' +
      '</div>' +
      /* ── Cabezales (visible solo si multicolor) ────── */
      '<div id="mod-p-heads-wrap" style="margin-top:10px;' + (isMulti ? '' : 'display:none') + '">' +
        '<div class="m3-field">' +
          '<input type="number" id="mod-p-heads" value="' + heads + '" placeholder=" " min="1" max="16" step="1">' +
          '<label>Cabezales / ranuras de color</label>' +
        '</div>' +
      '</div>' +
      tplSheetActions('closeModal()', 'savePrinter(\'' + (editId || '') + '\')') +
    '</div>';
}

/* ── MATERIALS ──────────────────────────────────────────────────── */

/* El aviso de un rollo (D257): «Por acabarse» en ámbar y «Agotado» en rojo,
   con ícono y palabra, no solo color. Antes: ⚠ rojo en Inventario y ↓ roja en
   Materiales, y en una tarjeta «TPU Rojo» el rojo decía cuatro cosas. */
function tplAvisoStock(estado) {
  if (estado === 'bajo')    return '<span class="aviso-stock">' + tplIcon('warning', 13) + 'Por acabarse</span>';
  if (estado === 'agotado') return '<span class="aviso-stock agotado">' + tplIcon('block', 13) + 'Agotado</span>';
  return '';
}
/* La barra de lo que queda: neutra; ámbar cuando se acaba (D257) */
function colorBarraStock(estado) {
  return estado === 'ok' ? 'var(--ink-3)' : 'var(--warn)';
}

function tplMaterialItem(m, cur, invItems) {
  /* Color chips from inventory */
  var colorChips = '';
  if (invItems && invItems.length) {
    colorChips = '<div class="mat-color-chips">' +
      invItems.map(function(it) {
        var hexRollo = colorDeRollo(it);
        var dot = hexRollo
          ? 'background:' + hexRollo + ';border:1px solid rgba(127,127,127,.45)'
          : 'background:var(--bg-sunk);border:0.5px solid var(--line)';
        var label = it.color || 'Sin color';
        var estado = estadoDeStock(it);
        var low    = estado === 'bajo';
        var out    = estado === 'agotado';
        return '<span class="mat-color-chip"' + (out ? ' style="opacity:0.35"' : '') + '>' +
          '<span style="width:10px;height:10px;border-radius:50%;flex-shrink:0;display:inline-block;' + dot + '"></span>' +
          esc(label) +
          (low ? '<span class="material-symbols-rounded aviso-stock-icono" aria-hidden="true" title="Por acabarse">warning</span><span class="sr-only">, por acabarse</span>' : '') +
          (out ? '<span class="sr-only">, agotado</span>' : '') +
          '</span>';
      }).join('') +
    '</div>';
  }

  return '<div class="m3-list-item" style="flex-direction:column;align-items:stretch;padding-bottom:' + (colorChips ? '10px' : '') + '">' +
    '<div style="display:flex;align-items:center">' +
      '<div class="leading">' + tplIcon('category') + '</div>' +
      '<div class="content">' +
        '<h3>' + esc(m.name) + '</h3>' +
        '<p>' + formatoDinero(m.costPerKg, cur) + '/kg &middot; ' + esc(m.type) + ' &middot; ' + m.density + ' g/cm³</p>' +
      '</div>' +
      '<div class="actions">' +
        '<button class="m3-btn-text m3-btn-sm" onclick="showMaterialModal(\'' + m.id + '\')" aria-label="Editar ' + esc(m.name) + '">' +
          tplIcon('edit') +
        '</button>' +
        '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteMaterial(\'' + m.id + '\')" aria-label="Borrar ' + esc(m.name) + '">' +
          tplIcon('delete') +
        '</button>' +
      '</div>' +
    '</div>' +
    (colorChips ? '<div style="padding-left:48px">' + colorChips + '</div>' : '') +
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
        (totalSpent > 0 ? '<div class="client-stat-total">' + formatoDinero(totalSpent, cur) + '</div>' : '') +
      '</div>' +
    '</div>' +
    (c.notes ? '<div class="client-notes">' + esc(c.notes) + '</div>' : '') +
    '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center">' +
      waBtn +
      quotesToggle +
      '<button class="m3-btn-text m3-btn-sm" onclick="showClientModal(' + i + ')">' +
        tplIcon('edit', 16) + ' Editar' +
      '</button>' +
      '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error)" onclick="deleteClient(' + i + ')" aria-label="Borrar ' + esc(c.name) + '">' +
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
      '<span class="cq-row-total">' + formatoDinero(total, cur) + '</span>' +
      '<button class="m3-btn-text m3-btn-sm" onclick="viewQuote(' + qi + ')" style="padding:0 6px;height:28px">' +
        tplIcon('visibility', 14) +
      '</button>' +
    '</div>' +
  '</div>';
}

/* Editor de cliente (D176): un panel como el de los demás editores. Antes era
   una página a pantalla completa con «‹ Clientes», un título de 34 px, un
   avatar de 84 px y una «vista previa en tu lista». */
function tplClientModal(c, editIndex) {
  var isEdit = (c != null);
  var saveFn = 'saveClient(' + (editIndex != null ? editIndex : 'null') + ')';
  var name   = esc(c ? c.name   || '' : '');
  var phone  = esc(c ? c.phone  || '' : '');
  var email  = esc(c ? c.email  || '' : '');
  var social = esc(c ? c.social || '' : '');
  var notes  = esc(c ? c.notes  || '' : '');
  var source = c ? (c.source || 'instagram') : 'instagram';

  var sourceOpts = [
    { id: 'instagram',   label: 'Instagram' },
    { id: 'facebook',    label: 'Facebook' },
    { id: 'recomendado', label: 'Recomendado' },
    { id: 'feria',       label: 'Feria / Bazar' },
    { id: 'web',         label: 'Web' },
    { id: 'otro',        label: 'Otro' }
  ];
  function chipSrc(o) {
    var active = source === o.id;
    return '<button type="button" id="cli-src-' + o.id + '" onclick="_cliSetSource(\'' + o.id + '\')" style="' +
      'padding:6px 12px;border-radius:999px;font-size:12px;white-space:nowrap;cursor:pointer;' +
      'border:0.5px solid ' + (active ? 'var(--ink)' : 'var(--line)') + ';' +
      'background:' + (active ? 'var(--ink)' : 'transparent') + ';' +
      'color:' + (active ? 'var(--bg)' : 'var(--ink-2)') + '">' + o.label + '</button>';
  }

  return '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet catalogo-sheet cliente-editor">' +
      tplSheetHeader(isEdit ? 'Editar cliente' : 'Nuevo cliente') +
      '<div class="catalogo-cuerpo">' +
        '<div class="m3-field">' +
          '<input type="text" id="cli-name" placeholder=" " value="' + name + '" autocomplete="off">' +
          '<label for="cli-name">Nombre</label>' +
        '</div>' +
        '<div class="flex-row">' +
          '<div class="m3-field">' +
            '<input type="tel" id="cli-phone" placeholder=" " value="' + phone + '" inputmode="tel">' +
            '<label for="cli-phone">WhatsApp</label>' +
          '</div>' +
          '<div class="m3-field">' +
            '<input type="email" id="cli-email" placeholder=" " value="' + email + '" inputmode="email">' +
            '<label for="cli-email">Correo</label>' +
          '</div>' +
        '</div>' +
        '<div class="m3-field optional">' +
          '<input type="text" id="cli-social" placeholder=" " value="' + social + '">' +
          '<label for="cli-social">Red social</label>' +
        '</div>' +
        '<div class="cliente-editor-origen">' +
          '<div class="pt-legend">¿Cómo te conoció?</div>' +
          '<div id="cli-source-group" class="cliente-editor-chips">' + sourceOpts.map(chipSrc).join('') + '</div>' +
        '</div>' +
        '<div class="m3-field optional">' +
          '<textarea id="cli-notes" placeholder=" " rows="3">' + notes + '</textarea>' +
          '<label for="cli-notes">Notas internas</label>' +
        '</div>' +
        '<div class="m3-sheet-actions">' +
          '<button type="button" class="m3-btn-outlined" onclick="closeModal()">Cancelar</button>' +
          '<button type="button" class="m3-btn-filled" onclick="' + saveFn + '">Guardar</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ── INVENTORY ──────────────────────────────────────────────────── */

function tplInventoryCard(item, i, cur) {
  var total   = parseFloat(item.totalG)     || 0;
  var remain  = parseFloat(item.remainingG) || 0;
  if (remain > total) remain = total;
  var pct      = total > 0 ? Math.round((remain / total) * 100) : 0;
  var used     = total - remain;
  var estado    = estadoDeStock(item);   /* D257 */
  var barColor  = colorBarraStock(estado);
  var alertIcon = tplAvisoStock(estado);

  var hexRollo = colorDeRollo(item);   /* D185 */
  return '<div class="inv-card">' +
    '<div class="inv-header">' +
      '<div class="inv-info">' +
        '<div class="inv-name">' +
          (hexRollo ? '<span class="inv-color-punto" style="background:' + hexRollo + '"></span>' : '') +
          esc(nombreMaterialDeRollo(item)) + alertIcon + '</div>' +
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
      (item.costPerKg ? '<span>' + formatoDinero((remain / 1000) * item.costPerKg, cur) + ' en stock</span>' : '') +
    '</div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">' +
      '<div style="display:flex;gap:8px">' +
        '<button class="m3-btn-text m3-btn-sm" onclick="showDeductModal(' + i + ')">' +
          tplIcon('remove', 16) + ' Descontar' +
        '</button>' +
        '<button class="m3-btn-text m3-btn-sm" onclick="showInventoryModal(' + i + ')">' +
          tplIcon('edit', 16) + ' Editar' +
        '</button>' +
      '</div>' +
      '<button class="m3-btn-text m3-btn-sm" style="color:var(--md-error);padding:4px 8px" onclick="deleteInventory(' + i + ')" aria-label="Borrar el rollo de ' + esc(nombreMaterialDeRollo(item)) + '">' +
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
        '<div class="m3-field" style="flex:1">' +
          '<input type="text" id="inv-color" placeholder=" " value="' + esc(item ? item.color || '' : '') + '">' +
          '<label for="inv-color">Color</label>' +
        '</div>' +
      '</div>' +
      tplColoresRollo(item) +
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
        '<label for="inv-cost">Costo por kg</label>' +
      '</div>' +
      tplSheetActions('closeModal()', saveFn) +
    '</div>';
}

/* Selector del color del rollo (D185): las muestras de COLORES_FILAMENTO y
   «Otro», que abre el selector de color del sistema. El elegido va en
   #inv-color-hex; tocar otra vez el elegido lo quita. */
function tplColoresRollo(item) {
  var actual = item ? colorDeRollo(item).toUpperCase() : '';
  var deLista = COLORES_FILAMENTO.some(function(c) { return c.hex.toUpperCase() === actual; });
  var propio = actual && !deLista ? actual : '';
  return '<div class="inv-colores" role="group" aria-label="Color del rollo">' +
    '<input type="hidden" id="inv-color-hex" value="' + actual + '">' +
    COLORES_FILAMENTO.map(function(c) {
      var sel = c.hex.toUpperCase() === actual;
      return '<button type="button" class="inv-color-muestra' + (sel ? ' elegido' : '') + '"' +
        ' aria-pressed="' + sel + '" aria-label="' + c.nombre + '" title="' + c.nombre + '"' +
        ' data-hex="' + c.hex + '" data-nombre="' + c.nombre + '"' +
        ' style="--muestra:' + c.hex + '" onclick="elegirColorRollo(this)"></button>';
    }).join('') +
    '<label class="inv-color-muestra inv-color-otro' + (propio ? ' elegido' : '') + '" title="Otro color"' +
      (propio ? ' style="--muestra:' + propio + '"' : '') + '>' +
      '<input type="color" id="inv-color-propio" value="' + (propio && propio.length === 7 ? propio.toLowerCase() : '#888888') + '"' +
        ' aria-label="Otro color" oninput="elegirColorPropio(this)">' +
      '<span class="material-symbols-rounded" aria-hidden="true">colorize</span>' +
    '</label>' +
  '</div>';
}

function tplDeductModal(item, i) {
  return '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      tplSheetHeader('Descontar filamento') +
      '<p style="font-size:14px;color:var(--md-on-surface-variant);margin-bottom:16px">' +
        esc(nombreMaterialDeRollo(item)) + (item.color ? ' ' + esc(item.color) : '') +
        ' &mdash; Restante: ' + (parseFloat(item.remainingG) || 0).toFixed(0) + 'g' +
      '</p>' +
      '<div class="m3-field">' +
        '<input type="number" id="deduct-g" placeholder=" " inputmode="decimal" min="1" step="0.1">' +
        '<label for="deduct-g">Gramos a descontar</label>' +
      '</div>' +
      tplSheetActions('closeModal()', 'deductInventory(' + i + ')', 'Descontar') +
    '</div>';
}

/* ── Estado de una cotización (D224) ─────────────────────────────────
   Cada estado con su color y su ícono, para no depender solo del color:
   Borrador ámbar, Enviada azul, Aceptada verde, Rechazada rojo. El verde
   queda para lo aceptado y la ganancia; antes Enviada y Aceptada eran el
   mismo verde de los botones y los folios. */
function tplEstado(estado) {
  var e = estadoDe({ status: estado });
  return '<span class="status-badge status-' + e + '">' +
    tplIcon(ESTADOS_COTIZACION[e].icono, 14) + esc(etiquetaEstado(e)) + '</span>';
}
function colorDeEstado(estado) {
  return { borrador: 'var(--warn)', enviada: 'var(--info)', aceptada: 'var(--ok)',
           rechazada: 'var(--danger)' }[estadoDe({ status: estado })];
}

/* ── QUOTES — card individual ───────────────────────────────────── */

/* Tarjeta de cotización (D143): tocarla la abre, tiene una sola acción principal
   según su estado y el resto va en el menú «⋯». Antes eran de 8 a 10 botones
   iguales, incluido el de Notion, que ya salió del proyecto (D33, D144). */
function tplQuoteCard(q, i, cur) {
  var total     = q.grandTotal != null ? q.grandTotal
                : (q.totalWithQty != null ? q.totalWithQty : (q.totalCost || 0));
  var itemCount = q.items ? q.items.length : 1;
  var firstItem = q.items ? q.items[0] : q;
  var estado    = estadoDe(q);

  var chipsHTML = itemCount > 1
    ? '<span class="hist-chip">' + itemCount + ' productos</span>' +
      '<span class="hist-chip">' + esc(firstItem.desc) + '…</span>' +
      _chipMaterial(firstItem.material)
    : '<span class="hist-chip">' + esc(firstItem.desc     || q.desc     || '') + '</span>' +
      _chipMaterial(firstItem.material || q.material || '');

  var statusHTML = tplEstado(estado);

  var botones = {
    enviar:   '<button type="button" class="accion-principal" onclick="showSendQuoteModal(' + i + ',\'enviar\')">' + tplIcon('send', 16) + ' Enviar</button>',
    aceptar:  '<button type="button" class="accion-principal" onclick="setQuoteStatus(' + i + ',\'aceptada\')">' + tplIcon('check_circle', 16) + ' Aceptar</button>',
    rechazar: '<button type="button" class="accion-secundaria" onclick="setQuoteStatus(' + i + ',\'rechazada\')">' + tplIcon('cancel', 16) + ' Rechazar</button>',
    ver:      '<button type="button" class="accion-secundaria" onclick="viewQuote(' + i + ')">' + tplIcon('visibility', 16) + ' Ver</button>'
  };

  return '<div class="hist-item quote-card" onclick="_abrirTarjeta(event,' + i + ')">' +
    '<div class="hist-header">' +
      '<div class="quote-card-meta">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          /* El folio sin verde: el verde es de lo aceptado (D224) */
          '<div class="quote-folio">' + esc(q.quoteNum) + '</div>' +
          statusHTML +
        '</div>' +
        '<div class="hist-desc">' + esc(q.client) + '</div>' +
        '<div class="hist-date">' +
          new Date(q.quoteDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) +
        '</div>' +
      '</div>' +
      '<div class="hist-total">' + formatoDinero(total, cur) + '</div>' +
    '</div>' +
    '<div class="hist-chips">' + chipsHTML + '</div>' +
    '<div class="quote-acciones">' +
      accionesPrincipales(q).map(function(a) { return botones[a]; }).join('') +
      '<button type="button" class="quote-menu-btn" aria-haspopup="menu" aria-expanded="false" ' +
              'aria-label="Más acciones de ' + esc(q.quoteNum) + '" onclick="abrirMenuCotizacion(event,' + i + ')">' +
        tplIcon('more_horiz', 20) +
      '</button>' +
    '</div>' +
  '</div>';
}

/* ── QUOTES — modal de borrador ─────────────────────────────────── */

/* Lo que resulta del precio escrito: total de la línea y margen implícito.
   El margen es justo el dato que se pierde al fijar un precio a mano, así que
   es el que hay que devolver a la vista — y en rojo cuando queda negativo,
   porque vender bajo costo sin que nada lo diga es el peor final posible. */
function tplDraftItemCalc(item, cur, sinImporte) {
  var qty    = item.qty || 1;
  var linea  = (item.totalCost || 0) * qty;
  var partes = [];
  var perdida = false;

  /* En la Orden de escritorio el importe ya va en su renglón (D222) */
  if (qty > 1 && !sinImporte) partes.push('× ' + qty + ' = ' + formatoDinero(linea, cur));
  /* baseCost null = producto de tabla de precios, sin costo real conocido.
     Ahí no hay margen que calcular y se calla en vez de inventar un número. */
  if (item.baseCost > 0) {
    /* Margen: la parte del precio que es ganancia (D213) */
    var m = margenDePrecio(item.totalCost, item.baseCost);
    perdida = (item.totalCost || 0) < item.baseCost;
    if (m != null) partes.push('margen ' + m + ' %');
  }
  if (item.priceManual) partes.push('precio escrito');

  var txt = partes.join(' · ');
  if (!txt) return '';
  return perdida
    ? '<span class="draft-item-loss">' + txt + ' · bajo costo</span>'
    : txt;
}

/* Debajo del nombre: con qué se imprime, o «Precio por tamaño» para los
   productos de tabla (D148; los de antes de v115 traían «—»). */
function _subLineaItem(item) {
  if (item.tipo === 'tabla' || item.printer === '—' || (!item.printer && !item.material)) return 'Precio por tamaño';
  return esc(item.printer) + ' &middot; ' + _puntosDeRollo(item) + esc(item.material);
}

/* Los colores de los rollos de un producto: [{ nombre, hex }], uno por
   color en el AMS. Sin rollo elegido o sin color guardado, [] (D247, D252). */
function coloresDeItem(item) {
  if (!item || typeof inventory === 'undefined' || typeof colorDeRollo !== 'function') return [];
  var ids = item.amsColors && item.amsColors.length
    ? item.amsColors.map(function(c) { return c.spoolId; })
    : [item.spoolId];
  var lista = [];
  ids.slice(0, 4).forEach(function(id) {
    var r = id ? inventory.find(function(x) { return x.id === id; }) : null;
    var hex = r ? colorDeRollo(r) : '';
    if (hex) lista.push({ nombre: String(r.color || '').trim(), hex: hex });
  });
  return lista;
}

/* «Rojo», «Blanco y Negro»: para los textos que se comparten (D252) */
function textoColores(item) {
  var n = coloresDeItem(item).map(function(c) { return c.nombre; }).filter(Boolean);
  return n.length > 1 ? n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1] : (n[0] || '');
}

/* El color del rollo junto al material, uno por color en el AMS (D247) */
function _puntosDeRollo(item) {
  return coloresDeItem(item).map(function(c) {
    var tono = esc(c.nombre || 'Color del rollo');
    return '<span class="punto-rollo" style="background:' + c.hex + '" role="img" aria-label="' + tono + '" title="' + tono + '"></span>';
  }).join('');
}

/* La etiqueta del material en la tarjeta: los productos por tamaño no tienen */
function _chipMaterial(m) {
  return m && m !== '—' ? '<span class="hist-chip">' + esc(m) + '</span>' : '';
}

function tplDraftItem(item, i, cur) {
  return '<div class="draft-item">' +
    '<div class="draft-item-info">' +
      '<div class="draft-item-desc">'+ esc(item.desc) + '</div>' +
      '<div class="draft-item-sub">' + _subLineaItem(item) + '</div>' +
      '<div class="draft-item-calc" id="dqc-' + i + '">' + tplDraftItemCalc(item, cur) + '</div>' +
      '<button type="button" class="draft-item-editar" onclick="editarProductoDeOrden(' + i + ')" aria-label="Editar ' + esc(item.desc) + '">' +
        tplIcon('edit', 16) + ' Editar' +
      '</button>' +
    '</div>' +
    '<div class="draft-item-controls">' +
      '<button class="draft-qty-btn" onclick="draftItemQty(' + i + ',-1)" aria-label="Quitar uno">&#8722;</button>' +
      /* Campo, no etiqueta: un pedido de 20 recuerdos exigía 19 toques en un
         botón de 28 px, con el ✕ de borrar a 6 px de distancia. Ahora se
         escribe la cantidad y los botones son para ajustes de uno en uno. */
      '<input type="number" class="draft-qty-val" id="dqi-' + i + '" value="' + item.qty + '" ' +
        'min="1" step="1" inputmode="numeric" aria-label="Cantidad" ' +
        'onchange="draftItemQtySet(' + i + ', this.value)">' +
      '<button class="draft-qty-btn" onclick="draftItemQty(' + i + ',1)" aria-label="Agregar uno">&#43;</button>' +
      /* Precio por pieza, editable. Ver draftItemPriceSet(). */
      '<label class="draft-price-wrap">' +
        '<span class="draft-price-cur">' + cur + '</span>' +
        '<input type="number" class="draft-item-price" id="dqp-' + i + '" ' +
          'value="' + (item.totalCost || 0).toFixed(2) + '" min="0" step="0.01" ' +
          'inputmode="decimal" aria-label="Precio por pieza" ' +
          'onchange="draftItemPriceSet(' + i + ', this.value)">' +
      '</label>' +
      '<button class="draft-remove-btn" onclick="removeDraftItem(' + i + ')" title="Quitar">&#10005;</button>' +
    '</div>' +
  '</div>';
}

/* ── La orden ─────────────────────────────────────────────────────
   Cuatro piezas con los mismos campos (los mismos id) en dos pantallas:
     tplDraftClient  cliente, teléfono, guardar cliente y notas
     tplDraftItem    un producto como tarjeta (teléfono)
     tplReviewRow    un producto como fila de tabla (escritorio)
     tplDraftTotals  subtotal, descuento, comisión y total
   Teléfono:   tplDraftModal = panel desde abajo con cliente + tarjetas + totales
   Escritorio: modo «Orden» de la calculadora (setCalcMode en quotes.js):
               tplReviewMain (cliente, tabla, resumen y botón) a la izquierda
               y la vista previa de la cotización en el panel derecho.
   Como los id son los mismos, saveQuote, onCommissionChange y
   _repintarDraftTotales funcionan igual en las dos. */

function _draftLabels() {
  var isEdit = (typeof _editQuoteIndex !== 'undefined' && _editQuoteIndex !== null);
  return {
    title: isEdit && typeof quotes !== 'undefined' && quotes[_editQuoteIndex]
             ? 'Editar ' + quotes[_editQuoteIndex].quoteNum
             : 'Nueva cotización',
    save:  isEdit ? 'Actualizar' : 'Generar cotización'
  };
}

/* Teléfono: panel que sale desde abajo */
function tplDraftModal(draft, cur) {
  var l = _draftLabels();
  var itemsHTML = draft.items.map(function(item, i) { return tplDraftItem(item, i, cur); }).join('');
  return '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet draft-drawer">' +
      tplSheetHeader(l.title) +
      tplDraftClient(draft) +
      '<div class="draft-items-section">' +
        '<div class="draft-items-header">' +
          '<span>Productos (' + draft.items.length + ')</span>' +
          '<button class="m3-btn-text" style="font-size:13px;width:auto;padding:0 8px;height:36px" onclick="addMoreToQuote()">' +
            tplIcon('add', 16) + ' Agregar producto' +
          '</button>' +
        '</div>' +
        itemsHTML +
      '</div>' +
      tplDraftTotals(draft, cur) +
      '<div class="m3-sheet-actions">' +
        /* «Cancelar» sale sin guardar, igual que en escritorio (D164); la ✕ de arriba
           y tocar fuera cierran el panel y conservan la orden */
        '<button class="m3-btn-outlined" onclick="cancelarOrden()">Cancelar</button>' +
        '<button class="m3-btn-filled" onclick="saveQuote()">' + l.save + '</button>' +
      '</div>' +
    '</div>';
}

/* Escritorio, columna izquierda del modo «Orden»: cliente arriba, la tabla
   de productos (se desplaza por dentro si es larga) y abajo el resumen con
   el botón. La derecha es la vista previa (ver _pintarVistaPrevia). */
function tplReviewMain(draft, cur) {
  var l = _draftLabels();
  return tplReviewItems(draft, cur) +
    '<div class="review-footer">' +
      '<div class="review-footer-totals">' + tplDraftTotals(draft, cur) + '</div>' +
      /* Cancelar sale sin guardar (D156); cancelarOrden en quotes.js */
      '<div class="review-footer-acciones">' +
        '<button type="button" class="m3-btn-outlined review-cancelar" onclick="cancelarOrden()">Cancelar</button>' +
        '<button type="button" class="m3-btn-filled review-generate" onclick="saveQuote()">' +
          tplIcon('send', 18) + ' ' + l.save +
        '</button>' +
      '</div>' +
    '</div>';
}

function tplReviewItems(draft, cur) {
  var filas = draft.items.map(function(item, i) { return tplReviewRow(item, i, cur); }).join('');
  return '<div class="review-client">' + tplDraftClient(draft) + '</div>' +
    '<div class="review-items">' +
      '<div class="review-items-head">' +
        '<span class="micro" id="review-items-titulo">Productos (' + draft.items.length + ')</span>' +
        '<button class="m3-btn-text m3-btn-sm" onclick="addMoreToQuote()">' +
          tplIcon('add', 16) + ' Agregar producto' +
        '</button>' +
      '</div>' +
      /* Una lista, no una tabla (D222) */
      '<div class="review-lista-wrap">' +
        '<ul class="review-lista" aria-labelledby="review-items-titulo">' + filas + '</ul>' +
      '</div>' +
    '</div>';
}

/* Un producto en dos renglones (D222). Arriba, qué es y sus acciones; abajo
   la cuenta: cantidad × precio por pieza, y el importe a la derecha. Antes
   era una fila de tabla de 848 px en una caja de 637: el precio, el importe
   y «Quitar» quedaban detrás de una barra de desplazamiento lateral.
   Mismos id y funciones que la tarjeta del teléfono (tplDraftItem), más
   dql-i: el importe. dqc-i lleva data-sin-importe: ahí no se repite. */
function tplReviewRow(item, i, cur) {
  var qty    = item.qty || 1;
  var nombre = esc(item.desc || ('Producto ' + (i + 1)));
  return '<li class="review-fila">' +
    '<div class="review-fila-info">' +
      '<div class="draft-item-desc">' + esc(item.desc) + '</div>' +
      '<div class="review-fila-datos">' +
        '<span class="draft-item-sub">' + _subLineaItem(item) + '</span>' +
        '<span class="draft-item-calc" id="dqc-' + i + '" data-sin-importe>' + tplDraftItemCalc(item, cur, true) + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="review-fila-acciones">' +
      '<button type="button" class="draft-item-editar" onclick="editarProductoDeOrden(' + i + ')" aria-label="Editar ' + nombre + '">' +
        tplIcon('edit', 16) + ' Editar' +
      '</button>' +
      '<button type="button" class="draft-remove-btn" onclick="removeDraftItem(' + i + ')" title="Quitar" aria-label="Quitar ' + nombre + '">' +
        tplIcon('close', 18) +
      '</button>' +
    '</div>' +
    '<div class="review-fila-cuenta">' +
      '<div class="review-qty">' +
        '<button type="button" class="draft-qty-btn" onclick="draftItemQty(' + i + ',-1)" aria-label="Quitar uno">&#8722;</button>' +
        '<input type="number" class="draft-qty-val" id="dqi-' + i + '" value="' + qty + '" ' +
          'min="1" step="1" inputmode="numeric" aria-label="Cantidad de ' + nombre + '" ' +
          'onchange="draftItemQtySet(' + i + ', this.value)">' +
        '<button type="button" class="draft-qty-btn" onclick="draftItemQty(' + i + ',1)" aria-label="Agregar uno">&#43;</button>' +
      '</div>' +
      '<span class="review-fila-signo" aria-hidden="true">&times;</span>' +
      '<label class="draft-price-wrap">' +
        '<span class="draft-price-cur">' + cur + '</span>' +
        '<input type="number" class="draft-item-price" id="dqp-' + i + '" ' +
          'value="' + (item.totalCost || 0).toFixed(2) + '" min="0" step="0.01" ' +
          'inputmode="decimal" aria-label="Precio por pieza de ' + nombre + '" ' +
          'onchange="draftItemPriceSet(' + i + ', this.value)">' +
      '</label>' +
      '<span class="review-fila-cu" aria-hidden="true">c/u</span>' +
      '<span class="review-fila-importe num" id="dql-' + i + '">' + formatoDinero((item.totalCost || 0) * qty, cur) + '</span>' +
    '</div>' +
  '</li>';
}

/* ── Después de generar: modal para enviar la cotización ──────────
   Las opciones son las que ya existían en la lista de cotizaciones.
   Los id btn-export-pdf-i / btn-export-img-i los usan exportQuotePDF y
   exportQuoteImage para mostrar «Generando…». help-sheet: modal centrado
   en escritorio, panel desde abajo en el teléfono. */
/* Ventana de envío (D142, D143). WhatsApp va arriba como acción principal: es como
   se manda casi todo. Con un borrador, avisa que WhatsApp y el enlace la dejan
   como enviada (D7), y ofrece marcarla si se mandó por otro medio.
   modo: 'nueva', 'actualizada' o 'enviar' (desde la tarjeta). */
function tplSendQuoteModal(q, i, modo) {
  var cur = config.currency;
  var opcion = function(id, icon, title, sub, fn) {
    return '<button type="button" class="send-option"' + (id ? ' id="' + id + '"' : '') + ' onclick="' + fn + '">' +
      tplIcon(icon, 22) +
      '<span class="send-option-text"><strong>' + title + '</strong><small>' + sub + '</small></span>' +
    '</button>';
  };
  var tel = (q.phone || '').replace(/\D/g, '');
  var borrador = estadoDe(q) === 'borrador';
  var titulo = modo === 'nueva' ? esc(q.quoteNum) + ' generada'
             : modo === 'actualizada' ? esc(q.quoteNum) + ' actualizada'
             : 'Enviar ' + esc(q.quoteNum);
  return '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet help-sheet send-sheet" role="dialog" aria-modal="true" aria-labelledby="send-title">' +
      '<div class="m3-drag-handle"></div>' +
      '<div class="send-head">' +
        '<span class="send-check">' + tplIcon(modo === 'enviar' ? 'send' : 'check', 22) + '</span>' +
        '<div>' +
          '<h2 id="send-title">' + titulo + '</h2>' +
          '<p>' + esc(q.client) + ' · ' + formatoDinero(q.grandTotal || 0, cur) + '</p>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="m3-btn-filled send-whatsapp" onclick="whatsappQuote(' + i + ')">' +
        tplIcon('chat', 22) +
        '<span class="send-whatsapp-texto"><strong>Enviar por WhatsApp</strong>' +
          '<small>' + (tel ? 'Al ' + esc(q.phone) : 'Eliges el contacto en WhatsApp') + '</small></span>' +
      '</button>' +
      (borrador ? '<p class="send-nota">Al mandarla por WhatsApp o copiar el enlace, queda como enviada.</p>' : '') +
      '<div class="micro" style="margin:16px 0 10px">Otras formas</div>' +
      '<div class="send-options">' +
        opcion('', 'link', 'Enlace', 'Página para el cliente', 'sharePublicLink(' + i + ')') +
        opcion('btn-export-pdf-' + i, 'picture_as_pdf', 'PDF', 'Descargar en A4', 'exportQuotePDF(' + i + ')') +
        opcion('btn-export-img-' + i, 'image', 'Imagen', 'Para mandar por chat', 'exportQuoteImage(' + i + ')') +
        opcion('', 'share', 'Texto', 'Copiar o compartir', 'shareQuote(' + i + ')') +
        opcion('', 'visibility', 'Ver cotización', 'Como la verá el cliente', 'closeModal();viewQuote(' + i + ')') +
        (borrador ? opcion('', 'mark_email_read', 'Marcar como enviada', 'Si la mandaste por otro medio', 'marcarComoEnviada(' + i + ')') : '') +
      '</div>' +
      '<div class="m3-sheet-actions">' +
        '<button class="m3-btn-text" onclick="closeModal();showPage(\'quotes\')">Ir a cotizaciones</button>' +
        '<button class="m3-btn-outlined" onclick="closeModal()">Listo</button>' +
      '</div>' +
    '</div>';
}

/* ── Contenedor lateral de la cotización (escritorio) ──────────────
   Como el panel del agente en VS Code: se acomoda a la derecha de la
   página, sin oscurecer ni tapar nada; la página se angosta para darle
   lugar. viewQuote (quotes.js) lo llena; closeQuoteDock lo cierra. */
function tplQuoteDock(q, i, quoteHTML) {
  return '<div class="dock-head">' +
      '<div>' +
        '<div class="dock-title">' + esc(q.quoteNum) + ' · ' + esc(q.client || '') + '</div>' +
        _lineaGananciaDock(q) +
      '</div>' +
      '<button class="sheet-close-btn" onclick="closeQuoteDock()" aria-label="Cerrar">' + tplIcon('close', 20) + '</button>' +
    '</div>' +
    '<div class="dock-body"><div id="quote-render-area">' + quoteHTML + '</div></div>' +
    '<div class="dock-actions">' +
      '<button class="m3-btn-tonal" id="btn-export-pdf-' + i + '" onclick="exportQuotePDF(' + i + ')">' + tplIcon('picture_as_pdf', 18) + ' PDF</button>' +
      '<button class="m3-btn-tonal" id="btn-export-img-' + i + '" onclick="exportQuoteImage(' + i + ')">' + btnImgLabel() + '</button>' +
      '<button class="m3-btn-tonal" onclick="whatsappQuote(' + i + ')">' + tplIcon('chat', 18) + ' WhatsApp</button>' +
    '</div>';
}

/* guardarDatosDraft() guarda cliente, teléfono y notas mientras se
   escriben. Antes solo se guardaban al agregar producto o al generar:
   quitar un producto volvía a dibujar la orden y borraba lo escrito. */
function tplDraftClient(draft) {
  return '' +
      /* Campo cliente con autocompletado */
      '<div class="client-autocomplete-wrap">' +
        '<div class="m3-field">' +
          '<input type="text" id="q-client" placeholder=" " value="' + esc(draft.client || '') + '" ' +
            'oninput="onClientInput(this);guardarDatosDraft()" autocomplete="off">' +
          '<label for="q-client">Nombre del cliente</label>' +
        '</div>' +
        '<div id="q-client-suggestions" class="client-suggestions"></div>' +
      '</div>' +
      '<div class="m3-field optional">' +
        '<input type="tel" id="q-phone" inputmode="tel" placeholder=" " value="' + esc(draft.phone || '') + '" oninput="guardarDatosDraft()">' +
        '<label for="q-phone">Teléfono</label>' +
      '</div>' +
      '<label style="display:flex;align-items:center;gap:10px;padding:2px 0 12px;cursor:pointer">' +
        '<input type="checkbox" id="q-save-client" style="width:17px;height:17px;flex-shrink:0;accent-color:var(--accent);cursor:pointer">' +
        '<span style="font-size:13px;color:var(--ink-2)">Guardar cliente en mi lista</span>' +
      '</label>' +
      '<div class="m3-field optional">' +
        '<input type="text" id="q-notes" placeholder=" " value="' + esc(draft.notes || '') + '" oninput="guardarDatosDraft()">' +
        '<label for="q-notes">Notas adicionales</label>' +
      '</div>';
}

function tplDraftTotals(draft, cur) {
  var subtotal      = draft.items.reduce(function(s, it) { return s + it.totalCost * it.qty; }, 0);
  var discount      = draft.discount || 0;
  var discountAmt   = subtotal * (discount / 100);
  var discounted    = subtotal - discountAmt;
  var commEnabled   = draft.commissionEnabled || false;
  var commission    = commEnabled ? (draft.commission || 0) : 0;
  var commissionAmt = discounted * (commission / 100);
  var grandTotal    = discounted + commissionAmt;

  return '' +
      /* Subtotal + descuento */
      '<div class="draft-subtotal-row">' +
        '<span>Subtotal</span>' +
        '<span id="draft-subtotal">' + formatoDinero(subtotal, cur) + '</span>' +
      '</div>' +
      '<div class="draft-discount-row">' +
        '<label for="q-discount" style="display:flex;align-items:center;gap:6px">' +
          '<span class="material-symbols-rounded" style="font-size:16px">percent</span> Descuento' +
        '</label>' +
        '<div style="display:flex;align-items:center;gap:6px">' +
          '<input type="number" id="q-discount" class="discount-input" min="0" max="100" step="0.5" ' +
            'value="' + discount + '" inputmode="decimal" oninput="onDiscountChange()">' +
          '<span style="font-size:13px;color:var(--md-on-surface-variant)">%</span>' +
          '<span id="draft-discount-amt" class="discount-amount">' +
            (discountAmt > 0 ? '−' + formatoDinero(discountAmt, cur) : '—') +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="draft-discount-row">' +
        '<label style="display:flex;align-items:center;gap:8px;cursor:pointer">' +
          '<label class="m3-switch" style="margin:0" onclick="event.stopPropagation()">' +
            '<input type="checkbox" id="q-commission-toggle" ' + (commEnabled ? 'checked' : '') + ' onchange="onCommissionToggle()">' +
            '<div class="m3-switch-track"></div>' +
          '</label>' +
          '<span class="material-symbols-rounded" style="font-size:16px">payments</span> Comisión' +
        '</label>' +
        '<div style="display:flex;align-items:center;gap:6px">' +
          '<input type="number" id="q-commission" class="discount-input" min="0" max="100" step="0.5" ' +
            'value="' + commission + '" inputmode="decimal" oninput="onCommissionChange()"' +
            (!commEnabled ? ' disabled style="opacity:0.4"' : '') + '>' +
          '<span style="font-size:13px;color:var(--md-on-surface-variant)">%</span>' +
          '<span id="draft-commission-amt" class="discount-amount">' +
            (commissionAmt > 0 ? '+' + formatoDinero(commissionAmt, cur) : '—') +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="draft-total-row">' +
        '<span>Total</span>' +
        '<span id="draft-grand-total">' + formatoDinero(grandTotal, cur) + '</span>' +
      '</div>' +
      /* Lo que ganas, a la vista donde se aplican descuento y comisión (D213) */
      '<div class="draft-ganancia-row" id="draft-ganancia-row">' + tplGananciaOrden(draft, cur) + '</div>';
}

/* Tu ganancia con la orden (D213). Después del descuento; la comisión del
   recomendador no es tuya (D30). Sin el costo de algún producto, no se inventa. */
function tplGananciaOrden(draft, cur) {
  var g = gananciaDeOrden(draft.items, draft.discount);
  if (g.ganancia == null) {
    return '<span>Tu ganancia</span><span class="draft-ganancia-nota">Falta el costo de algún producto</span>';
  }
  var perdida = g.ganancia < 0;
  return '<span>Tu ganancia</span>' +
    '<span class="draft-ganancia-valor' + (perdida ? ' es-perdida' : '') + '">' +
      (perdida ? '−' : '+') + formatoDinero(Math.abs(g.ganancia), cur) +
      (g.margen != null ? '<span class="draft-ganancia-nota"> · margen ' + g.margen + ' %</span>' : '') +
    '</span>';
}

/* En el panel de la cotización: lo que ganas, solo para ti (D213) */
function _lineaGananciaDock(q) {
  if (!q.items || !q.items.length) return '';
  var g = gananciaDeOrden(q.items, q.discount);
  if (g.ganancia == null) return '';
  var cur = (config && config.currency) || '$';
  var perdida = g.ganancia < 0;
  return '<div class="dock-ganancia">Ganancia <strong' + (perdida ? ' class="es-perdida"' : '') + '>' +
      (perdida ? '−' : '+') + formatoDinero(Math.abs(g.ganancia), cur) + '</strong>' +
      (g.margen != null ? ' · margen ' + g.margen + ' %' : '') + ' · solo la ves tú</div>';
}

/* ── Material usado en el mes (D180) ──────────────────────────────
   La barra partida en el color de cada material y la lista con el porcentaje y
   los gramos. Los 4 colores (--serie-1 a --serie-4) pasaron la prueba de
   daltonismo en claro y oscuro; «Otros» va en gris. Siempre abierta, sin
   acordeón. opts.sinTitulo: el Dashboard le pone su título afuera (D182).
   opts.colorDe(nombre): el color real del rollo («PLA · Rojo» en rojo); las
   partes sin color guardado usan la paleta (D246). El nombre va junto a cada
   color, así no se depende solo del color. */
function tplUsoMaterial(u, opts) {
  var sinTitulo = !!(opts && opts.sinTitulo);
  var anterior = MESES_CORTOS[(u.mes + 11) % 12];
  var colorDe = opts && opts.colorDe;
  var real = function(p) { return !p.otros && colorDe ? colorDe(p.nombre) : ''; };
  var color = function(p, i) { return p.otros ? 'var(--serie-otros)' : (real(p) || 'var(--serie-' + (i + 1) + ')'); };
  var clase = function(p) { return real(p) ? ' class="color-real"' : ''; };
  var cambio = u.cambio == null ? '' :
    '<span class="uso-material-cambio">' + (u.cambio > 0 ? '+' : u.cambio < 0 ? '\u2212' : '') +
      Math.abs(u.cambio) + '%</span><span class="uso-material-vs">vs ' + anterior + '</span>';
  var resumen = u.partes.map(function(p) {
    return p.nombre + ' ' + p.pct + '%, ' + formatoGramos(p.gramos);
  }).join('; ');
  var cuerpo = u.partes.length
    ? '<div class="uso-material-barra" role="img" aria-label="' + esc(resumen) + '">' +
        u.partes.map(function(p, i) {
          return '<span' + clase(p) + ' style="flex-grow:' + p.gramos.toFixed(1) + ';background:' + color(p, i) + '" title="' +
            esc(p.nombre + ' \u00b7 ' + formatoGramos(p.gramos) + ' \u00b7 ' + p.pct + '%') + '"></span>';
        }).join('') +
      '</div>' +
      '<ul class="uso-material-lista">' +
        u.partes.map(function(p, i) {
          return '<li>' +
            '<span class="uso-material-punto' + (real(p) ? ' color-real' : '') + '" style="background:' + color(p, i) + '"></span>' +
            '<span class="uso-material-nombre">' + esc(p.nombre) + '</span>' +
            '<span class="uso-material-pct">' + p.pct + '%</span>' +
            '<span class="uso-material-gramos">' + formatoGramos(p.gramos) + '</span>' +
          '</li>';
        }).join('') +
      '</ul>'
    : '<p class="uso-material-vacio">Sin cotizaciones aceptadas en ' + MESES_LARGOS[u.mes] + '.</p>';

  return '<section class="uso-material"' +
      (sinTitulo ? ' aria-label="Material usado"' : ' aria-labelledby="uso-material-titulo"') + '>' +
    (sinTitulo ? '' :
      '<h2 class="uso-material-titulo" id="uso-material-titulo">Material usado ' +
        '<span>\u00b7 ' + MESES_CORTOS[u.mes] + ' ' + u.anio + '</span></h2>') +
    '<div class="uso-material-cifra">' +
      '<span class="uso-material-total">' + formatoGramos(u.total) + '</span>' + cambio +
    '</div>' +
    cuerpo +
  '</section>';
}
