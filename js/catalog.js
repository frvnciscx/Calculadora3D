/* ===== CATALOG — Productos frecuentes ===== */

/* ── Tabla Solo Cortador (imagen de referencia) ───────────────── */
var SOLO_CORTADOR_TABLE = {
  4:15, 5:18, 6:21, 7:24, 8:27, 9:30,
  10:33, 11:36, 12:39, 13:42, 14:45,
  15:48, 16:51, 17:54, 18:57, 19:60, 20:63
};

var DESIGN_COSTS = [
  { label: 'Sin diseño',  cost: 0  },
  { label: 'Muy simple',  cost: 15 },
  { label: 'Sencillo',    cost: 20 },
  { label: 'Medio',       cost: 25 },
  { label: 'Complejo',    cost: 35 }
];

function reinforcementCost(size) {
  if (size >= 4  && size <= 5)  return 5;
  if (size >= 9  && size <= 14) return 10;
  if (size >= 15)               return 15;
  return 0;
}

/* ── Productos por defecto ────────────────────────────────────── */
var DEFAULT_CATALOG = [
  {
    id: 'cat-1',
    name: 'Topper Cake',
    type: 'cost',
    designH: 1,
    defaultWeight: '', defaultTimeH: '', defaultMargin: ''
  },
  {
    id: 'cat-cortador-solo',
    name: 'Cortador de galletas',
    variant: 'Solo Cortador',
    type: 'table',
    priceTable: SOLO_CORTADOR_TABLE
  },
  {
    id: 'cat-cortador-cm',
    name: 'Cortador de galletas',
    variant: 'Cortador y Marcador',
    type: 'table',
    priceTable: {}   /* Pendiente: configura los precios por tamaño */
  }
];

var catalogItems = ld('catalog', DEFAULT_CATALOG);

function saveCatalog() { sv('catalog', catalogItems); }

/* ── Modal principal del catálogo ─────────────────────────────── */
function showCatalogModal() {
  document.getElementById('modal-container').innerHTML =
    '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      '<div class="m3-drag-handle"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
        '<h2 style="margin:0">Catálogo de productos</h2>' +
        '<div style="display:flex;gap:8px">' +
          '<button class="m3-btn-text m3-btn-sm" onclick="exportPriceList()" title="Exportar lista de precios">' +
            '<span class="material-symbols-rounded" style="font-size:18px">table_view</span>' +
          '</button>' +
          '<button class="m3-btn-tonal m3-btn-sm" onclick="showAddCatalogModal()">' +
            '<span class="material-symbols-rounded" style="font-size:16px">add</span> Nuevo' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div id="catalog-list">' + renderCatalogList() + '</div>' +
    '</div>';
}

function renderCatalogList() {
  if (!catalogItems.length) {
    return '<p style="text-align:center;opacity:0.5;padding:24px 0">No hay productos guardados</p>';
  }
  return catalogItems.map(function(p, i) {
    var badge = p.type === 'table'
      ? '<span class="catalog-badge">Por tamaño</span>'
      : '<span class="catalog-badge catalog-badge-cost">Por costo</span>';
    var subtitle = p.type === 'table'
      ? (p.variant || '') + (Object.keys(p.priceTable || {}).length === 0 ? ' · ⚠ Sin precios' : ' · ' + Object.keys(p.priceTable).length + ' tamaños')
      : ['Diseño: ' + (p.designH || 1) + 'h', p.defaultWeight ? p.defaultWeight + 'g' : '', p.defaultTimeH ? p.defaultTimeH + 'h imp.' : ''].filter(Boolean).join(' · ');
    return (
      '<div class="catalog-item">' +
        '<div class="catalog-item-info">' +
          '<div class="catalog-item-name">' + esc(p.name) + ' ' + badge + '</div>' +
          '<div class="catalog-item-hints">' + esc(subtitle) + '</div>' +
        '</div>' +
        '<div class="catalog-item-actions">' +
          '<button class="m3-btn-text m3-btn-sm" onclick="editCatalogModal(' + i + ')" title="Editar">' +
            '<span class="material-symbols-rounded" style="font-size:18px">edit</span>' +
          '</button>' +
          '<button class="m3-btn-filled m3-btn-sm" onclick="loadCatalogProduct(' + i + ')">' +
            '<span class="material-symbols-rounded" style="font-size:16px">open_in_new</span> Usar' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

/* ── Cargar producto ─────────────────────────────────────────── */
function loadCatalogProduct(i) {
  var p = catalogItems[i]; if (!p) return;
  if (p.type === 'table') {
    closeModal();
    showTableProductModal(i);
  } else {
    loadCostProduct(i);
  }
}

/* ── Modal de cálculo por tabla (cortadores) ──────────────────── */
function showTableProductModal(i) {
  var p = catalogItems[i]; if (!p) return;
  var cur = config.currency || '$';
  var sizes = Object.keys(p.priceTable || {}).map(Number).sort(function(a,b){return a-b;});

  if (!sizes.length) {
    snack('Este producto no tiene precios configurados. Edítalo primero.');
    showCatalogModal();
    return;
  }

  var sizeOpts = sizes.map(function(s) {
    return '<option value="' + s + '">' + s + ' cm — ' + cur + p.priceTable[s].toFixed(2) + '</option>';
  }).join('');

  var designOpts = DESIGN_COSTS.map(function(d, di) {
    return '<option value="' + di + '">' + d.label + (d.cost > 0 ? '  +' + cur + d.cost : '') + '</option>';
  }).join('');

  /* Se calcula aparte a propósito.
     Antes esto iba en línea dentro de la concatenación del HTML:

       '<div ... id="tp-total">' + cur + sizes[0] && p.priceTable[sizes[0]]
         ? cur + p.priceTable[sizes[0]].toFixed(2) : cur + '0.00' + '</div>'

     El + se evalúa antes que && y que ?:, así que la etiqueta de apertura
     entera se consumía dentro de la condición y NUNCA llegaba al HTML. Sin
     id="tp-total", updateTableTotal() no encontraba el elemento y el precio
     se quedaba congelado en el tamaño más chico sin avisar. Y si el producto
     no tenía precio, salía un </div> suelto que desbarataba la hoja y dejaba
     el botón "Agregar a orden" fuera de la pantalla. */
  var precioBase    = p.priceTable[sizes[0]];
  var precioInicial = precioBase ? cur + precioBase.toFixed(2) : cur + '0.00';

  document.getElementById('modal-container').innerHTML =
    '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet">' +
      '<div class="m3-drag-handle"></div>' +
      '<h2>' + esc(p.name) + (p.variant ? ' — ' + esc(p.variant) : '') + '</h2>' +

      '<div class="m3-field">' +
        '<select id="tp-size" onchange="updateTableTotal(' + i + ')">' + sizeOpts + '</select>' +
        '<label for="tp-size">Tamaño (cm)</label>' +
      '</div>' +

      '<div class="m3-field optional">' +
        '<select id="tp-design" onchange="updateTableTotal(' + i + ')">' + designOpts + '</select>' +
        '<label for="tp-design">Costo de diseño</label>' +
      '</div>' +

      /* El interruptor necesita el .m3-switch-track hermano: components.css
         esconde el checkbox (display:none) y dibuja el control en el track.
         Sin él, el control existía pero era invisible — no se podía saber si
         el refuerzo estaba incluido o no. */
      '<label class="m3-switch" style="margin:12px 0">' +
        '<span>Incluir refuerzo</span>' +
        '<input type="checkbox" id="tp-refuerzo" onchange="updateTableTotal(' + i + ')">' +
        '<div class="m3-switch-track"></div>' +
      '</label>' +

      '<div class="result-card" style="margin:12px 0" id="tp-result">' +
        '<div class="result-header">' +
          '<div>' +
            '<div class="result-subtitle">TOTAL</div>' +
            '<div class="result-total" id="tp-total">' + precioInicial + '</div>' +
          '</div>' +
          '<div class="result-base-col" id="tp-breakdown">' +
            '<div class="result-subtitle">DESGLOSE</div>' +
            '<div class="result-base-val" id="tp-detail">—</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="m3-field optional">' +
        '<input type="text" id="tp-desc" placeholder=" " value="' + esc(p.name + (p.variant ? ' ' + p.variant : '')) + '">' +
        '<label for="tp-desc">Descripción en la cotización</label>' +
      '</div>' +

      '<div class="m3-sheet-actions">' +
        '<button class="m3-btn-outlined" onclick="showCatalogModal()">Volver</button>' +
        '<button class="m3-btn-filled" onclick="addTableItemToDraft(' + i + ')">' +
          '<span class="material-symbols-rounded" style="font-size:18px">add_shopping_cart</span> Agregar a orden' +
        '</button>' +
      '</div>' +
    '</div>';

  updateTableTotal(i);
}

function updateTableTotal(i) {
  var p = catalogItems[i]; if (!p) return;
  var cur = config.currency || '$';
  /* Si el elemento del total no existe, algo se rompió al armar el HTML.
     Antes esto fallaba en silencio y el usuario veía un precio congelado. */
  if (!document.getElementById('tp-total')) {
    console.error('[catalog] falta #tp-total: el precio no se va a actualizar');
  }
  var sizeEl    = document.getElementById('tp-size');
  var designEl  = document.getElementById('tp-design');
  var refuerzoEl = document.getElementById('tp-refuerzo');
  if (!sizeEl) return;

  var size      = parseInt(sizeEl.value) || 0;
  var basePrice = p.priceTable[size] || 0;
  var designIdx = designEl ? parseInt(designEl.value) || 0 : 0;
  var designCost = DESIGN_COSTS[designIdx].cost;
  var refuerzo   = (refuerzoEl && refuerzoEl.checked) ? reinforcementCost(size) : 0;
  var total      = basePrice + designCost + refuerzo;

  var totalEl   = document.getElementById('tp-total');
  var detailEl  = document.getElementById('tp-detail');
  if (totalEl)  totalEl.textContent  = cur + total.toFixed(2);
  if (detailEl) {
    var parts = [cur + basePrice.toFixed(2) + ' base'];
    if (designCost) parts.push('+' + cur + designCost + ' diseño');
    if (refuerzo)   parts.push('+' + cur + refuerzo + ' refuerzo');
    detailEl.textContent = parts.join(' ');
  }
}

function addTableItemToDraft(i) {
  var p = catalogItems[i]; if (!p) return;
  var cur = config.currency || '$';
  var sizeEl     = document.getElementById('tp-size');
  var designEl   = document.getElementById('tp-design');
  var refuerzoEl = document.getElementById('tp-refuerzo');
  var descEl     = document.getElementById('tp-desc');

  var size       = parseInt((sizeEl || {}).value) || 0;
  var basePrice  = p.priceTable[size] || 0;
  var designIdx  = designEl ? parseInt(designEl.value) || 0 : 0;
  var designCost = DESIGN_COSTS[designIdx].cost;
  var refuerzo   = (refuerzoEl && refuerzoEl.checked) ? reinforcementCost(size) : 0;
  var total      = basePrice + designCost + refuerzo;
  var desc       = (descEl ? descEl.value.trim() : '') || (p.name + ' ' + size + 'cm');

  var item = {
    desc:      desc,
    printer:   '—',
    material:  '—',
    weight:    0, timeH: 0, designH: 0, margin: 0,
    matCost:   basePrice,
    energyCost: 0, laborCost: designCost, deprecCost: 0,
    fixedCost: 0, wasteCost: refuerzo,
    /* baseCost null = "no se conoce el costo real de este producto".
       Antes se guardaba baseCost = total, lo que hacía que el dashboard
       calculara ganancia CERO para todo lo vendido por tabla de precios.
       Con null, el dashboard lo excluye del cálculo de margen (ver
       monthWithCost en dashboard.js) en vez de contarlo como margen cero. */
    baseCost:  null, totalCost: total,
    /* Precio de tabla. Se puede sobrescribir a mano en el borrador; éste
       queda como referencia para poder volver. */
    autoPrice: total, priceManual: false,
    qty: 1
  };

  if (!draftQuote) {
    saveDraftQuote({ editIndex: null, client: '', phone: '', notes: '', items: [item] });
  } else {
    draftQuote.items.push(item);
    saveDraftQuote(draftQuote);
  }

  var n = draftQuote.items.length;
  snack(n === 1 ? 'Producto agregado a la orden' : n + ' productos en la orden');
  refreshDraftIndicator();
  closeModal();
}

/* ── Cargar producto de tipo "costo" en calculadora ────────────── */
function loadCostProduct(i) {
  var p = catalogItems[i]; if (!p) return;
  var descEl    = document.getElementById('calc-desc');
  var weightEl  = document.getElementById('calc-weight');
  var timeEl    = document.getElementById('calc-time');
  var designEl  = document.getElementById('calc-design-time');
  var marginEl  = document.getElementById('calc-margin');

  if (descEl)   descEl.value   = p.name;
  if (designEl) designEl.value = p.designH || 1;
  if (p.defaultWeight && weightEl)  weightEl.value  = p.defaultWeight;
  if (p.defaultTimeH  && timeEl)    timeEl.value    = p.defaultTimeH;
  if (p.defaultMargin && marginEl) {
    marginEl.value = p.defaultMargin;
    var md2c = document.getElementById('calc-margin-display2');
    if (md2c) md2c.textContent = p.defaultMargin;
    var mnElC = document.getElementById('calc-margin-num');
    if (mnElC) mnElC.value = p.defaultMargin;
    var mlblC = document.getElementById('calc-margin-label');
    if (mlblC) mlblC.textContent = p.defaultMargin + '% margen';
  }

  closeModal();
  calculate(true);

  var missing = [];
  if (!p.defaultWeight) missing.push('peso');
  if (!p.defaultTimeH)  missing.push('tiempo de impresión');
  if (missing.length) snack('Ingresa ' + missing.join(' y ') + ' para calcular');
  else snack(p.name + ' cargado');
}

/* ── Modal agregar / editar producto ──────────────────────────── */
function showAddCatalogModal(editIndex) {
  var isEdit = editIndex !== undefined;
  var p = isEdit ? catalogItems[editIndex]
                 : { name: '', type: 'cost', designH: 1, defaultWeight: '', defaultTimeH: '', defaultMargin: '' };
  var isTable = p.type === 'table';

  document.getElementById('modal-container').innerHTML =
    '<div class="m3-scrim" onclick="' + (isEdit ? 'showCatalogModal()' : 'showCatalogModal()') + '"></div>' +
    '<div class="m3-bottom-sheet">' +
      '<div class="m3-drag-handle"></div>' +
      '<h2>' + (isEdit ? 'Editar producto' : 'Nuevo producto') + '</h2>' +
      '<div class="m3-field">' +
        '<input type="text" id="cp-name" placeholder=" " value="' + esc(p.name || '') + '">' +
        '<label for="cp-name">Nombre del producto</label>' +
      '</div>' +
      '<div class="m3-field optional">' +
        '<input type="text" id="cp-variant" placeholder=" " value="' + esc(p.variant || '') + '">' +
        '<label for="cp-variant">Variante (ej. Solo Cortador)</label>' +
      '</div>' +
      '<div class="m3-field">' +
        '<select id="cp-type" onchange="toggleCatalogType()" >' +
          '<option value="cost"' + (!isTable ? ' selected' : '') + '>Por costo (peso + tiempo)</option>' +
          '<option value="table"' + (isTable ? ' selected' : '') + '>Por tabla de tamaños</option>' +
        '</select>' +
        '<label for="cp-type">Tipo de cálculo</label>' +
      '</div>' +
      '<div id="cp-cost-fields" style="' + (isTable ? 'display:none' : '') + '">' +
        '<div class="flex-row">' +
          '<div class="m3-field optional">' +
            '<input type="number" id="cp-weight" placeholder=" " min="0" step="0.1" inputmode="decimal" value="' + esc(p.defaultWeight || '') + '">' +
            '<label for="cp-weight">Peso típico (g)</label>' +
          '</div>' +
          '<div class="m3-field optional">' +
            '<input type="number" id="cp-time" placeholder=" " min="0" step="0.1" inputmode="decimal" value="' + esc(p.defaultTimeH || '') + '">' +
            '<label for="cp-time">Tiempo típico (hrs)</label>' +
          '</div>' +
        '</div>' +
        '<div class="flex-row">' +
          '<div class="m3-field optional">' +
            '<input type="number" id="cp-design" placeholder=" " min="0" step="0.5" inputmode="decimal" value="' + esc(p.designH !== undefined ? p.designH : 1) + '">' +
            '<label for="cp-design">Horas de diseño</label>' +
          '</div>' +
          '<div class="m3-field optional">' +
            '<input type="number" id="cp-margin" placeholder=" " min="0" step="1" inputmode="decimal" value="' + esc(p.defaultMargin || '') + '">' +
            '<label for="cp-margin">Margen típico (%)</label>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="cp-table-fields" style="' + (!isTable ? 'display:none' : '') + '">' +
        '<p style="font-size:13px;opacity:0.6;margin:4px 0 8px">Ingresa los precios por tamaño en formato: <strong>tamaño:precio</strong>, uno por línea.<br>Ej: <em>4:15</em> significa 4cm = $15</p>' +
        '<div class="m3-field">' +
          '<textarea id="cp-table-text" placeholder=" " rows="6" style="font-family:monospace;font-size:13px">' +
            esc(tableToText(p.priceTable || {})) +
          '</textarea>' +
          '<label for="cp-table-text">Tabla de precios</label>' +
        '</div>' +
      '</div>' +
      '<div class="m3-sheet-actions">' +
        (isEdit
          ? '<button class="m3-btn-text" style="color:var(--md-error)" onclick="deleteCatalogProduct(' + editIndex + ')">Eliminar</button>'
          : '<button class="m3-btn-text" onclick="showCatalogModal()">Cancelar</button>') +
        '<button class="m3-btn-filled" onclick="saveCatalogProduct(' + (isEdit ? editIndex : -1) + ')">' +
          (isEdit ? 'Guardar' : 'Agregar') +
        '</button>' +
      '</div>' +
    '</div>';
}

function toggleCatalogType() {
  var t = document.getElementById('cp-type').value;
  document.getElementById('cp-cost-fields').style.display  = t === 'cost'  ? '' : 'none';
  document.getElementById('cp-table-fields').style.display = t === 'table' ? '' : 'none';
}

function tableToText(obj) {
  return Object.keys(obj).sort(function(a,b){return a-b;}).map(function(k){ return k + ':' + obj[k]; }).join('\n');
}

function textToTable(str) {
  var result = {};
  str.split('\n').forEach(function(line) {
    var parts = line.trim().split(':');
    if (parts.length === 2) {
      var k = parseInt(parts[0]);
      var v = parseFloat(parts[1]);
      if (!isNaN(k) && !isNaN(v)) result[k] = v;
    }
  });
  return result;
}

function editCatalogModal(i) { showAddCatalogModal(i); }

/* ── Guardar (nuevo o edición) ────────────────────────────────── */
function saveCatalogProduct(editIndex) {
  var name = (document.getElementById('cp-name').value || '').trim();
  if (!name) { snack('Ingresa un nombre'); return; }
  var type = document.getElementById('cp-type').value;

  var product = { id: editIndex >= 0 ? catalogItems[editIndex].id : 'cat-' + Date.now(), name: name, type: type };
  var variantEl = document.getElementById('cp-variant');
  if (variantEl && variantEl.value.trim()) product.variant = variantEl.value.trim();

  if (type === 'table') {
    var tableText = (document.getElementById('cp-table-text').value || '');
    product.priceTable = textToTable(tableText);
  } else {
    product.designH       = parseFloat(document.getElementById('cp-design').value) || 1;
    product.defaultWeight = document.getElementById('cp-weight').value.trim();
    product.defaultTimeH  = document.getElementById('cp-time').value.trim();
    product.defaultMargin = document.getElementById('cp-margin').value.trim();
  }

  if (editIndex >= 0) { catalogItems[editIndex] = product; }
  else { catalogItems.push(product); }

  saveCatalog();
  if (typeof dbGuardarProducto === 'function') dbGuardarProducto(product);
  showCatalogModal();
  snack(editIndex >= 0 ? 'Producto actualizado' : 'Producto agregado');
}

/* ── Eliminar ─────────────────────────────────────────────────── */
function deleteCatalogProduct(i) {
  var p = catalogItems[i]; if (!p) return;
  m3Confirm('¿Eliminar "' + esc(p.name) + '" del catálogo?', function() {
    _deleteCatalogProductConfirmed(i);
  }, { detail: 'Las cotizaciones que ya lo usan no se modifican.' });
}

function _deleteCatalogProductConfirmed(i) {
  var prodId = catalogItems[i] && catalogItems[i].id;
  catalogItems.splice(i, 1);
  saveCatalog();
  if (prodId && typeof dbBorrarProducto === 'function') dbBorrarProducto(prodId);
  showCatalogModal();
  snack('Producto eliminado');
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Cargar SheetJS desde CDN (lazy) ─────────────────────────── */
function loadSheetJS() {
  return new Promise(function(resolve, reject) {
    if (window.XLSX) { resolve(window.XLSX); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload  = function() { resolve(window.XLSX); };
    s.onerror = function() { reject(new Error('Excel no disponible sin conexi\u00f3n')); };
    document.head.appendChild(s);
  });
}

/* ── Exportar lista de precios como .xlsx ────────────────────── */
function exportPriceList() {
  snack('Generando lista de precios\u2026');
  loadSheetJS().then(function(XLSX) {
    var cur = config.currency || '$';
    var wb  = XLSX.utils.book_new();

    /* ── Hoja 1: Cortadores ──────────────────────────────────── */
    var tableProds = catalogItems.filter(function(p) { return p.type === 'table' && Object.keys(p.priceTable||{}).length; });

    // Collect all sizes across all table products
    var allSizes = [];
    tableProds.forEach(function(p) {
      Object.keys(p.priceTable).forEach(function(s) {
        var n = parseInt(s);
        if (allSizes.indexOf(n) === -1) allSizes.push(n);
      });
    });
    allSizes.sort(function(a,b){return a-b;});

    if (allSizes.length) {
      // Header row
      var hdrs = ['Tamaño (cm)'].concat(tableProds.map(function(p) {
        return p.name + (p.variant ? ' — ' + p.variant : '');
      }));
      var rows = [hdrs];

      allSizes.forEach(function(size) {
        var row = [size + ' cm'];
        tableProds.forEach(function(p) {
          var price = p.priceTable[size];
          row.push(price !== undefined ? cur + price.toFixed(2) : '—');
        });
        rows.push(row);
      });

      var wsCort = XLSX.utils.aoa_to_sheet(rows);

      // Column widths
      wsCort['!cols'] = [{ wch: 14 }].concat(tableProds.map(function() { return { wch: 22 }; }));

      XLSX.utils.book_append_sheet(wb, wsCort, 'Cortadores');
    }

    /* ── Hoja 2: Diseño y Refuerzo ───────────────────────────── */
    var wsExtras = XLSX.utils.aoa_to_sheet([
      ['COSTO DE DISEÑO', ''],
      ['Nivel', 'Costo'],
      ['Sin diseño', cur + '0.00'],
      ['Muy simple', cur + '15.00'],
      ['Sencillo',   cur + '20.00'],
      ['Medio',      cur + '25.00'],
      ['Complejo',   cur + '35.00'],
      ['', ''],
      ['REFUERZO', ''],
      ['Rango de tamaño', 'Costo'],
      ['4 cm – 5 cm',       cur + '5.00'],
      ['9 cm – 14 cm',      cur + '10.00'],
      ['15 cm en adelante', cur + '15.00']
    ]);
    wsExtras['!cols'] = [{ wch: 22 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsExtras, 'Diseño y Refuerzo');

    /* ── Hoja 3: Historial de cotizaciones ───────────────────── */
    if (quotes && quotes.length) {
      var qRows = [['Num. Cotización', 'Fecha', 'Cliente', 'Teléfono', 'Total']];
      quotes.slice().reverse().forEach(function(q) {
        var total = q.grandTotal != null ? q.grandTotal : (q.totalWithQty != null ? q.totalWithQty : (q.items && q.items[0] ? q.items[0].totalCost : 0));
        qRows.push([
          q.quoteNum || '',
          q.quoteDate ? new Date(q.quoteDate).toLocaleDateString('es-MX') : '',
          q.client || '',
          q.phone  || '',
          cur + (total || 0).toFixed(2)
        ]);
      });
      var wsQuotes = XLSX.utils.aoa_to_sheet(qRows);
      wsQuotes['!cols'] = [{wch:18},{wch:14},{wch:24},{wch:16},{wch:12}];
      XLSX.utils.book_append_sheet(wb, wsQuotes, 'Cotizaciones');
    }

    /* ── Descargar ───────────────────────────────────────────── */
    var biz   = (config.bizName || 'Lista').replace(/\s+/g,'_');
    var fecha = new Date().toISOString().slice(0,10);
    XLSX.writeFile(wb, biz + '_precios_' + fecha + '.xlsx');
    snack('Lista de precios descargada');
  }).catch(function(err) {
    snack(err.message || 'Error al exportar');
  });
}