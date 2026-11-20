/* ===== CATALOG — Productos frecuentes =====
   Desde v115 (D148–D151) el producto se cotiza dentro de la calculadora:
   «¿Qué cotizas?» arriba de los campos elige entre una pieza nueva y los
   productos guardados. Un producto por tamaño (los cortadores) cambia la
   calculadora a «modo producto»: tamaño, diseño, refuerzo y cantidad en
   lugar del peso y el tiempo, con el precio en el panel de siempre y el
   mismo botón «Agregar a orden». Las cuentas viven en js/precios-tamano.js. */

/* ── Tabla Solo Cortador (imagen de referencia) ───────────────── */
var SOLO_CORTADOR_TABLE = {
  4:15, 5:18, 6:21, 7:24, 8:27, 9:30,
  10:33, 11:36, 12:39, 13:42, 14:45,
  15:48, 16:51, 17:54, 18:57, 19:60, 20:63
};

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

function _productoPorId(id) {
  for (var k = 0; k < catalogItems.length; k++) {
    if (catalogItems[k] && String(catalogItems[k].id) === String(id)) return catalogItems[k];
  }
  return null;
}
function _indiceProducto(id) {
  for (var k = 0; k < catalogItems.length; k++) {
    if (catalogItems[k] && String(catalogItems[k].id) === String(id)) return k;
  }
  return -1;
}

/* $27 o $27.50: los precios de tabla casi siempre son enteros */
function _dinero(n) {
  var cur = (typeof config !== 'undefined' && config.currency) || '$';
  n = Number(n) || 0;
  return cur + (Math.round(n) === n ? String(n) : n.toFixed(2));
}

/* ══ ¿Qué cotizas? ══════════════════════════════════════════════ */

/* Lo que está elegido. Modo producto (tabla): { id, size, designIdx,
   refuerzo, qty, desc, descManual }. Un producto por costo solo llena los
   campos de la pieza; se recuerda para marcarlo mientras sea esa pieza. */
var _modoProducto    = null;
var _productoCostoId = null;

function enModoProducto() {
  return !!(_modoProducto && _productoPorId(_modoProducto.id));
}

function _subtituloProducto(p) {
  if (p.type !== 'table') return (p.variant ? p.variant + ' · ' : '') + 'Por peso y tiempo';
  var tams = tamanosDe(p);
  if (!tams.length) return (p.variant ? p.variant + ' · ' : '') + 'Sin precios todavía';
  return (p.variant ? p.variant + ' · ' : '') + formatoTamano(tams[0]) + ' a ' + formatoTamano(tams[tams.length - 1]) + ' cm';
}

function renderQueCotizas() {
  /* Si el producto que se estaba cotizando ya no existe (se borró aquí o en
     otro equipo), la calculadora regresa a la pieza. */
  if (_modoProducto && !_productoPorId(_modoProducto.id)) salirModoProducto();
  if (_productoCostoId && !_productoPorId(_productoCostoId)) _productoCostoId = null;

  var el = document.getElementById('que-cotizas-opciones');
  if (!el) return;
  var activo = _modoProducto ? _modoProducto.id : _productoCostoId;

  function opcion(id, icono, nombre, sub, on) {
    return '<button type="button" class="qc-opcion" data-id="' + esc(id) + '" aria-pressed="' + (on ? 'true' : 'false') + '" ' +
             'onclick="elegirQueCotizas(this.dataset.id)">' +
      '<span class="material-symbols-rounded qc-icono" aria-hidden="true">' + icono + '</span>' +
      '<span class="qc-texto"><span class="qc-nombre">' + esc(nombre) + '</span>' +
      '<span class="qc-sub">' + esc(sub) + '</span></span>' +
    '</button>';
  }

  el.innerHTML = opcion('pieza', 'view_in_ar', 'Pieza nueva', 'Con el peso y el tiempo', !activo) +
    catalogItems.map(function(p) {
      return opcion(p.id, p.type === 'table' ? 'straighten' : 'category', p.name, _subtituloProducto(p), String(activo) === String(p.id));
    }).join('');

  if (enModoProducto()) renderPanelProducto();
}

function elegirQueCotizas(id) {
  if (id === 'pieza') {
    _productoCostoId = null;
    salirModoProducto();
    renderQueCotizas();
    return;
  }
  var p = _productoPorId(id);
  if (!p) return;
  if (p.type === 'table') { entrarModoProducto(p); return; }
  salirModoProducto();
  _cargarProductoCosto(p);
  renderQueCotizas();
}

/* «Mis productos» › Cotizar: lo mismo que tocarlo arriba */
function cotizarProducto(i) {
  var p = catalogItems[i]; if (!p) return;
  closeModal();
  if (document.body.dataset.page !== 'calc' && typeof showPage === 'function') showPage('calc');
  elegirQueCotizas(p.id);
  var bloque = document.getElementById('que-cotizas');
  if (bloque && bloque.scrollIntoView) bloque.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

/* La pieza ya se agregó a la orden: el producto por costo deja de estar marcado */
function alAgregarPieza() {
  if (!_productoCostoId) return;
  _productoCostoId = null;
  renderQueCotizas();
}

/* ── Producto por costo: llena los campos de la pieza ─────────── */
function _cargarProductoCosto(p) {
  _productoCostoId = p.id;
  var descEl   = document.getElementById('calc-desc');
  var weightEl = document.getElementById('calc-weight');
  var timeEl   = document.getElementById('calc-time');
  var designEl = document.getElementById('calc-design-time');
  var marginEl = document.getElementById('calc-margin');

  if (descEl)   descEl.value   = p.name + (p.variant ? ' ' + p.variant : '');
  /* 0 horas de diseño es un valor válido; antes se volvía 1 */
  var dh = parseFloat(p.designH);
  if (designEl) designEl.value = isNaN(dh) ? 1 : dh;
  /* El peso y el tiempo se llenan solo si el producto los trae: si no, se
     respeta lo que ya está, por ejemplo lo que leyó el archivo del slicer. */
  if (p.defaultWeight && weightEl) weightEl.value = p.defaultWeight;
  if (p.defaultTimeH  && timeEl)   timeEl.value   = p.defaultTimeH;
  if (p.defaultMargin && marginEl) {
    marginEl.value = p.defaultMargin;
    var md2c = document.getElementById('calc-margin-display2');
    if (md2c) md2c.textContent = p.defaultMargin;
    var mnElC = document.getElementById('calc-margin-num');
    if (mnElC) mnElC.value = p.defaultMargin;
    var mlblC = document.getElementById('calc-margin-label');
    if (mlblC) mlblC.textContent = p.defaultMargin + '% margen';
  }

  calculate(true);

  var faltan = [];
  if (!(parseFloat(weightEl && weightEl.value) > 0)) faltan.push('el peso');
  if (!(parseFloat(timeEl && timeEl.value) > 0))     faltan.push('el tiempo');
  if (faltan.length) {
    snack(p.name + ': escribe ' + faltan.join(' y ') + ', o lee el archivo del slicer');
    var primero = !(parseFloat(weightEl && weightEl.value) > 0) ? weightEl : timeEl;
    if (primero) {
      if (primero.scrollIntoView) primero.scrollIntoView({ block: 'center', behavior: 'smooth' });
      primero.focus({ preventScroll: true });
    }
  } else {
    snack(p.name + ' listo para cotizar');
  }
}

/* ── Modo producto (por tamaño) ───────────────────────────────── */
function entrarModoProducto(p) {
  var antes = _modoProducto && String(_modoProducto.id) === String(p.id) ? _modoProducto : null;
  _productoCostoId = null;
  /* Sin tamaño elegido de entrada: que el precio no salga del más chico
     por descuido. Si se vuelve al mismo producto, se conserva lo elegido. */
  _modoProducto = antes || { id: p.id, size: null, designIdx: 0, refuerzo: false, qty: 1, desc: '', descManual: false };
  var pagina = document.getElementById('page-calc');
  if (pagina) pagina.classList.add('modo-producto');
  renderQueCotizas();
  refreshDraftIndicator();
}

function salirModoProducto() {
  if (!_modoProducto) return;
  _modoProducto = null;
  var pagina = document.getElementById('page-calc');
  if (pagina) pagina.classList.remove('modo-producto');
  var panel = document.getElementById('calc-producto');
  if (panel) panel.innerHTML = '';
  _reiniciarResultado();
  /* Los campos de la pieza siguen ahí: si ya tenían datos, vuelve su precio */
  calculate(true);
  refreshDraftIndicator();
}

/* El panel de resultado vuelve a como está sin cálculo */
function _reiniciarResultado() {
  var cur = (config && config.currency) || '$';
  var lbl = document.getElementById('calc-hero-label');
  if (lbl) lbl.textContent = 'Costo total sugerido';
  var tot = document.getElementById('result-total');
  if (tot) tot.textContent = cur + '0.00';
  var base = document.getElementById('result-base');
  if (base) base.textContent = cur + '0.00';
  var gan = document.getElementById('result-profit');
  if (gan) gan.textContent = '+' + cur + '0.00';
  var rp = document.getElementById('result-producto');
  if (rp) rp.innerHTML = '';
  if (typeof _pintarNotaRedondeo === 'function') _pintarNotaRedondeo(null);
}

function renderPanelProducto() {
  var el = document.getElementById('calc-producto');
  var m  = _modoProducto;
  var p  = m && _productoPorId(m.id);
  if (!el || !p) return;
  var tams = tamanosDe(p);
  if (m.size != null && tams.indexOf(Number(m.size)) === -1) m.size = null;
  var niveles = nivelesDiseno(p);
  if (m.designIdx >= niveles.length) m.designIdx = 0;

  var cabeza =
    '<div class="pt-cabeza">' +
      '<h2 class="pt-titulo" id="pt-titulo">' + esc(p.name) +
        (p.variant ? ' <span class="pt-variante">' + esc(p.variant) + '</span>' : '') + '</h2>' +
      '<button type="button" class="pt-editar" onclick="editarPreciosProducto()">' +
        '<span class="material-symbols-rounded" aria-hidden="true">edit</span>Editar precios' +
      '</button>' +
    '</div>';

  if (!tams.length) {
    el.innerHTML = cabeza +
      '<div class="pt-vacio">' +
        '<p>Este producto todavía no tiene precios. Agrega sus tamaños para cotizarlo.</p>' +
        '<button type="button" class="btn btn-primary" onclick="editarPreciosProducto()">' +
          '<span class="material-symbols-rounded" aria-hidden="true">add</span> Agregar precios' +
        '</button>' +
      '</div>';
    pintarProducto();
    return;
  }

  var tamanos = tams.map(function(s) {
    return '<label class="pt-chip">' +
      '<input type="radio" name="pt-tam" value="' + s + '"' + (Number(m.size) === s ? ' checked' : '') +
        ' onchange="ptElegir(\'size\', this.value)">' +
      '<span class="pt-chip-principal">' + formatoTamano(s) + ' cm</span>' +
      '<span class="pt-chip-sub">' + _dinero(precioDeTamano(p, s)) + '</span>' +
    '</label>';
  }).join('');

  var disenos = niveles.map(function(n, di) {
    return '<label class="pt-chip pt-chip-ancho">' +
      '<input type="radio" name="pt-diseno" value="' + di + '"' + (m.designIdx === di ? ' checked' : '') +
        ' onchange="ptElegir(\'designIdx\', this.value)">' +
      '<span class="pt-chip-principal">' + esc(n.label) + '</span>' +
      '<span class="pt-chip-sub">' + (Number(n.cost) > 0 ? '+' + _dinero(n.cost) : 'Sin costo') + '</span>' +
    '</label>';
  }).join('');

  el.innerHTML = cabeza +
    '<fieldset class="pt-grupo">' +
      '<legend class="pt-legend">Tamaño</legend>' +
      '<div class="pt-opciones pt-tamanos">' + tamanos + '</div>' +
    '</fieldset>' +
    '<fieldset class="pt-grupo">' +
      '<legend class="pt-legend">Diseño</legend>' +
      '<div class="pt-opciones pt-disenos">' + disenos + '</div>' +
    '</fieldset>' +
    '<div class="pt-fila">' +
      '<label class="m3-switch pt-switch">' +
        '<span class="pt-switch-texto"><span class="pt-switch-titulo">Refuerzo</span>' +
          '<span class="pt-switch-ayuda" id="pt-ref-ayuda"></span></span>' +
        '<input type="checkbox" id="pt-refuerzo" aria-describedby="pt-ref-ayuda"' + (m.refuerzo ? ' checked' : '') +
          ' onchange="ptElegir(\'refuerzo\', this.checked)">' +
        '<div class="m3-switch-track"></div>' +
      '</label>' +
    '</div>' +
    '<div class="pt-fila">' +
      '<span class="pt-switch-titulo" id="pt-cant-label">Cantidad</span>' +
      '<div class="pt-stepper" role="group" aria-labelledby="pt-cant-label">' +
        '<button type="button" onclick="ptCantidad(-1)" aria-label="Quitar uno">' +
          '<span class="material-symbols-rounded" aria-hidden="true">remove</span></button>' +
        '<input type="number" id="pt-qty" min="1" step="1" inputmode="numeric" value="' + m.qty + '"' +
          ' aria-labelledby="pt-cant-label" oninput="ptElegir(\'qty\', this.value)">' +
        '<button type="button" onclick="ptCantidad(1)" aria-label="Agregar uno">' +
          '<span class="material-symbols-rounded" aria-hidden="true">add</span></button>' +
      '</div>' +
    '</div>' +
    '<div class="m3-field pt-desc">' +
      '<input type="text" id="pt-desc" placeholder=" " oninput="ptDescEscrita(this.value)">' +
      '<label for="pt-desc">Descripción en la cotización</label>' +
    '</div>' +
    '<button type="button" class="pt-desc-auto hidden" id="pt-desc-auto" onclick="ptDescAutomatica()">' +
      '<span class="material-symbols-rounded" aria-hidden="true">restart_alt</span>Usar la descripción automática' +
    '</button>';

  _actualizarPanelProducto();
}

/* Lo que cambia sin volver a dibujar el panel (así el foco no se pierde
   al moverse con las flechas entre los tamaños) */
function _actualizarPanelProducto() {
  var m = _modoProducto, p = m && _productoPorId(m.id);
  if (!p) return;

  var ayuda = document.getElementById('pt-ref-ayuda');
  var sw    = document.getElementById('pt-refuerzo');
  if (ayuda && sw) {
    var ref = m.size != null ? refuerzoDe(p, m.size) : 0;
    sw.disabled = m.size != null && ref <= 0;
    ayuda.textContent = m.size == null ? 'Elige el tamaño para ver cuánto suma'
      : ref > 0 ? '+' + _dinero(ref) + ' en ' + formatoTamano(m.size) + ' cm'
      : 'No aplica en ' + formatoTamano(m.size) + ' cm';
    sw.closest('.pt-switch').classList.toggle('pt-switch-apagado', sw.disabled);
  }

  var desc = document.getElementById('pt-desc');
  if (desc) desc.value = m.descManual ? m.desc : (m.size != null ? descripcionProductoTabla(p, m) : '');
  var auto = document.getElementById('pt-desc-auto');
  if (auto) auto.classList.toggle('hidden', !m.descManual);

  pintarProducto();
}

function ptElegir(campo, valor) {
  var m = _modoProducto; if (!m) return;
  if (campo === 'size')      m.size = Number(valor);
  if (campo === 'designIdx') m.designIdx = parseInt(valor, 10) || 0;
  if (campo === 'refuerzo')  m.refuerzo = !!valor;
  if (campo === 'qty')       m.qty = Math.max(1, parseInt(valor, 10) || 1);
  _actualizarPanelProducto();
}

function ptCantidad(delta) {
  var m = _modoProducto; if (!m) return;
  m.qty = Math.max(1, (parseInt(m.qty, 10) || 1) + delta);
  var q = document.getElementById('pt-qty');
  if (q) q.value = m.qty;
  _actualizarPanelProducto();
}

function ptDescEscrita(v) {
  var m = _modoProducto; if (!m) return;
  m.desc = v;
  m.descManual = true;
  var auto = document.getElementById('pt-desc-auto');
  if (auto) auto.classList.remove('hidden');
}

function ptDescAutomatica() {
  var m = _modoProducto; if (!m) return;
  m.desc = '';
  m.descManual = false;
  _actualizarPanelProducto();
  var d = document.getElementById('pt-desc');
  if (d) d.focus();
}

/* El precio en el panel de resultado: el mismo lugar que el de la pieza */
function pintarProducto() {
  var m = _modoProducto, p = m && _productoPorId(m.id);
  if (!p) return;
  var lbl = document.getElementById('calc-hero-label');
  var tot = document.getElementById('result-total');
  var rp  = document.getElementById('result-producto');

  if (!tamanosDe(p).length || m.size == null) {
    if (lbl) lbl.textContent = 'Precio';
    if (tot) tot.textContent = '—';
    if (rp)  rp.innerHTML = '<p class="rp-nota">' +
      (tamanosDe(p).length ? 'Elige el tamaño para ver el precio.' : 'Agrega los precios de este producto para cotizarlo.') + '</p>';
    return;
  }

  var r = totalProductoTabla(p, m);
  if (lbl) lbl.textContent = r.qty > 1 ? 'Precio de ' + r.qty : 'Precio';
  if (tot) tot.textContent = _dinero(r.total);
  if (rp) {
    var filas = [['Tamaño ' + formatoTamano(m.size) + ' cm', _dinero(r.base)]];
    if (r.diseno > 0)   filas.push(['Diseño ' + String(r.nivel).toLowerCase(), '+' + _dinero(r.diseno)]);
    if (r.refuerzo > 0) filas.push(['Refuerzo', '+' + _dinero(r.refuerzo)]);
    if (r.qty > 1)      filas.push([_dinero(r.unitario) + ' cada uno × ' + r.qty, _dinero(r.total), 'rp-total']);
    rp.innerHTML = '<dl class="rp-lista">' + filas.map(function(f) {
      return '<div class="rp-fila' + (f[2] ? ' ' + f[2] : '') + '"><dt>' + esc(f[0]) + '</dt><dd class="num">' + esc(f[1]) + '</dd></div>';
    }).join('') + '</dl>';
  }
}

/* «Agregar a orden» en modo producto (addItemToDraft llega aquí) */
function agregarProductoTabla() {
  var m = _modoProducto, p = m && _productoPorId(m.id);
  if (!p) return;
  if (!tamanosDe(p).length) { snack('Primero agrega los precios de este producto'); return; }
  if (m.size == null) {
    snack('Elige el tamaño');
    var primero = document.querySelector('#calc-producto input[name="pt-tam"]');
    if (primero) {
      if (primero.scrollIntoView) primero.scrollIntoView({ block: 'center', behavior: 'smooth' });
      primero.focus({ preventScroll: true });
    }
    return;
  }

  var r = totalProductoTabla(p, m);
  var desc = (m.descManual && String(m.desc).trim()) ? String(m.desc).trim() : descripcionProductoTabla(p, m);
  var item = {
    desc:      desc,
    /* Sin impresora ni material: el precio sale de la tabla (D148) */
    printer:   '',
    material:  '',
    weight:    0, timeH: 0, designH: 0, margin: 0,
    /* Los rubros de costo van en 0: antes el precio se guardaba como
       «Material» y el refuerzo como «Desperdicio», y así salían en el
       desglose de la cotización. Lo elegido va en detalleTabla. */
    matCost:   0, energyCost: 0, laborCost: 0, deprecCost: 0,
    fixedCost: 0, wasteCost: 0,
    /* baseCost null = no se conoce el costo real; el dashboard lo deja
       fuera del margen en lugar de contarlo como margen cero. */
    baseCost:  null,
    totalCost: r.unitario,
    autoPrice: r.unitario, priceManual: false,
    qty:       r.qty,
    tipo:      'tabla',
    detalleTabla: {
      productoId: p.id, tamano: Number(m.size),
      nivel: r.nivel, diseno: r.diseno, refuerzo: r.refuerzo, base: r.base
    }
  };

  var puesto = _ponerEnOrden(item);
  if (puesto.editado) {
    /* Terminó la edición: la calculadora regresa a la pieza y se vuelve a la orden */
    salirModoProducto();
    renderQueCotizas();
    _terminarEdicion(puesto);
    return;
  }

  /* Agregar y seguir: se queda el producto con su tamaño, para el siguiente.
     La cantidad y la descripción vuelven a empezar. */
  m.qty = 1; m.desc = ''; m.descManual = false;
  var q = document.getElementById('pt-qty');
  if (q) q.value = 1;
  _actualizarPanelProducto();
  refreshDraftIndicator();
  if (typeof resaltarOrden === 'function') resaltarOrden();

  var msg = 'Agregado: ' + desc + (r.qty > 1 ? ' × ' + r.qty : '');
  if (typeof snackAccion === 'function') snackAccion(msg, 'Ver orden', generateQuote);
  else snack(msg);
}

/* «Editar precios» desde el panel: al guardar, regresa a la calculadora */
var _editorDesde = 'lista';
function editarPreciosProducto() {
  var i = _modoProducto ? _indiceProducto(_modoProducto.id) : -1;
  if (i < 0) return;
  showAddCatalogModal(i, 'panel');
}

/* ══ Mis productos ═══════════════════════════════════════════════ */
function showCatalogModal() {
  _editorDesde = 'lista';
  document.getElementById('modal-container').innerHTML =
    '<div class="m3-scrim" onclick="closeModal()"></div>' +
    '<div class="m3-bottom-sheet catalogo-sheet" role="dialog" aria-modal="true" aria-labelledby="catalogo-titulo">' +
      '<div class="m3-drag-handle"></div>' +
      '<div class="sheet-header-row">' +
        '<h2 id="catalogo-titulo">Mis productos</h2>' +
        '<button type="button" class="sheet-close-btn" onclick="closeModal()" aria-label="Cerrar">' +
          '<span class="material-symbols-rounded" aria-hidden="true" style="font-size:20px">close</span>' +
        '</button>' +
      '</div>' +
      '<div class="catalogo-cuerpo">' +
        '<p class="catalogo-ayuda">Los productos que vendes seguido. Para cotizar uno, tócalo en «¿Qué cotizas?» o usa «Cotizar».</p>' +
        '<div id="catalog-list">' + _htmlListaCatalogo() + '</div>' +
        /* Sin «Exportar precios» a Excel (D160) */
        '<div class="m3-sheet-actions catalogo-acciones">' +
          '<button type="button" class="m3-btn-filled" onclick="showAddCatalogModal()">' +
            '<span class="material-symbols-rounded" aria-hidden="true" style="font-size:18px">add</span> Nuevo producto' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* db.js la llama cuando los productos cambian en otro equipo: redibuja la
   lista abierta y las opciones de «¿Qué cotizas?». Devuelve el HTML. */
function renderCatalogList() {
  var html = _htmlListaCatalogo();
  var lista = document.getElementById('catalog-list');
  if (lista) lista.innerHTML = html;
  renderQueCotizas();
  return html;
}

function _htmlListaCatalogo() {
  if (!catalogItems.length) {
    return '<p class="catalogo-vacio">Todavía no hay productos. Crea uno con «Nuevo producto».</p>';
  }
  return catalogItems.map(function(p, i) {
    var porTamano = p.type === 'table';
    var tams = porTamano ? tamanosDe(p) : [];
    var badge = porTamano
      ? '<span class="catalog-badge">Por tamaño</span>'
      : '<span class="catalog-badge catalog-badge-cost">Por costo</span>';
    var pistas;
    if (porTamano) {
      pistas = tams.length
        ? (p.variant ? esc(p.variant) + ' · ' : '') + tams.length + (tams.length === 1 ? ' tamaño' : ' tamaños') +
          ' · ' + esc(_dinero(precioDeTamano(p, tams[0]))) + (tams.length > 1 ? ' a ' + esc(_dinero(precioDeTamano(p, tams[tams.length - 1]))) : '')
        : (p.variant ? esc(p.variant) + ' · ' : '') + '<span class="catalogo-falta">Sin precios todavía</span>';
    } else {
      var dh = parseFloat(p.designH);
      pistas = esc(['Diseño: ' + (isNaN(dh) ? 1 : dh) + ' h', p.defaultWeight ? p.defaultWeight + ' g' : '', p.defaultTimeH ? p.defaultTimeH + ' h de impresión' : ''].filter(Boolean).join(' · '));
    }
    var nombre = p.name + (p.variant ? ' ' + p.variant : '');
    return (
      '<div class="catalog-item">' +
        '<div class="catalog-item-info">' +
          '<div class="catalog-item-name">' + esc(p.name) + ' ' + badge + '</div>' +
          '<div class="catalog-item-hints">' + pistas + '</div>' +
        '</div>' +
        '<div class="catalog-item-actions">' +
          '<button type="button" class="m3-btn-text m3-btn-sm" onclick="editCatalogModal(' + i + ')" aria-label="Editar ' + esc(nombre) + '">' +
            '<span class="material-symbols-rounded" aria-hidden="true" style="font-size:18px">edit</span> Editar' +
          '</button>' +
          '<button type="button" class="m3-btn-tonal m3-btn-sm" onclick="cotizarProducto(' + i + ')" aria-label="Cotizar ' + esc(nombre) + '">Cotizar</button>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

/* Se conservan los nombres de antes por si algo los llama */
function loadCatalogProduct(i) { cotizarProducto(i); }
function loadCostProduct(i) { var p = catalogItems[i]; if (p) { closeModal(); elegirQueCotizas(p.id); } }

/* ══ Editor de producto ══════════════════════════════════════════ */
var _tipoEditor = 'cost';

function _filaPrecioHTML(f) {
  f = f || {};
  return '<div class="pe-fila">' +
    '<div class="pe-celdas">' +
      '<input type="text" class="pe-tam" inputmode="decimal" autocomplete="off" placeholder="cm" value="' + esc(f.tamano != null ? String(f.tamano) : '') + '" aria-label="Tamaño en cm">' +
      '<input type="text" class="pe-precio" inputmode="decimal" autocomplete="off" placeholder="$" value="' + esc(f.precio != null ? String(f.precio) : '') + '" aria-label="Precio">' +
      '<input type="text" class="pe-ref" inputmode="decimal" autocomplete="off" placeholder="—" value="' + esc(f.refuerzo != null && Number(f.refuerzo) !== 0 ? String(f.refuerzo) : '') + '" aria-label="Refuerzo">' +
      '<button type="button" class="pe-quitar" onclick="editorQuitarFila(this)" aria-label="Quitar este tamaño">' +
        '<span class="material-symbols-rounded" aria-hidden="true">close</span></button>' +
    '</div>' +
    '<p class="pe-error hidden"></p>' +
  '</div>';
}

function _filaNivelHTML(n) {
  n = n || {};
  return '<div class="pe-fila">' +
    '<div class="pe-celdas pe-celdas-nivel">' +
      '<input type="text" class="pe-nivel" autocomplete="off" placeholder="Nombre" value="' + esc(n.label || '') + '" aria-label="Nombre del nivel">' +
      '<input type="text" class="pe-costo" inputmode="decimal" autocomplete="off" placeholder="$" value="' + esc(n.cost != null ? String(n.cost) : '') + '" aria-label="Costo del nivel">' +
      '<button type="button" class="pe-quitar" onclick="editorQuitarFila(this)" aria-label="Quitar este nivel">' +
        '<span class="material-symbols-rounded" aria-hidden="true">close</span></button>' +
    '</div>' +
    '<p class="pe-error hidden"></p>' +
  '</div>';
}

function showAddCatalogModal(editIndex, desde) {
  if (desde) _editorDesde = desde;
  var isEdit = editIndex !== undefined && editIndex !== null && editIndex >= 0 && !!catalogItems[editIndex];
  var p = isEdit ? catalogItems[editIndex]
                 : { name: '', type: 'cost', designH: 1, defaultWeight: '', defaultTimeH: '', defaultMargin: '' };
  _tipoEditor = p.type === 'table' ? 'table' : 'cost';
  var volver = _editorDesde === 'panel' ? 'closeModal()' : 'showCatalogModal()';

  /* Las filas de un producto viejo traen el refuerzo de la regla de antes,
     para que se vea y se pueda cambiar (D150) */
  var filas = tamanosDe(p).map(function(s) {
    return { tamano: formatoTamano(s), precio: precioDeTamano(p, s), refuerzo: refuerzoDe(p, s) };
  });
  if (!filas.length) filas = [{}, {}, {}];
  var niveles = nivelesDiseno(p);
  var dh = parseFloat(p.designH);

  document.getElementById('modal-container').innerHTML =
    '<div class="m3-scrim" onclick="' + volver + '"></div>' +
    '<div class="m3-bottom-sheet editor-producto" role="dialog" aria-modal="true" aria-labelledby="pe-titulo">' +
      '<div class="m3-drag-handle"></div>' +
      '<div class="sheet-header-row">' +
        '<h2 id="pe-titulo">' + (isEdit ? 'Editar producto' : 'Nuevo producto') + '</h2>' +
        '<button type="button" class="sheet-close-btn" onclick="' + volver + '" aria-label="Cerrar sin guardar">' +
          '<span class="material-symbols-rounded" aria-hidden="true" style="font-size:20px">close</span>' +
        '</button>' +
      '</div>' +
      '<div class="catalogo-cuerpo">' +
        '<div class="pe-tipo seg" role="radiogroup" aria-label="Cómo se cotiza">' +
          '<button type="button" role="radio" data-tipo="table" onclick="editorTipo(\'table\')">Por tamaño</button>' +
          '<button type="button" role="radio" data-tipo="cost" onclick="editorTipo(\'cost\')">Por peso y tiempo</button>' +
        '</div>' +
        '<div class="m3-field" id="cp-name-field">' +
          '<input type="text" id="cp-name" placeholder=" " value="' + esc(p.name || '') + '" aria-describedby="cp-name-error">' +
          '<label for="cp-name">Nombre del producto</label>' +
          '<span class="m3-helper hidden" id="cp-name-error">Escribe el nombre del producto</span>' +
        '</div>' +
        '<div class="m3-field optional">' +
          '<input type="text" id="cp-variant" placeholder=" " value="' + esc(p.variant || '') + '">' +
          '<label for="cp-variant">Variante, como «Solo Cortador»</label>' +
        '</div>' +

        '<div id="cp-table-fields">' +
          '<h3 class="pe-subtitulo">Precios por tamaño</h3>' +
          '<p class="pe-ayuda">El refuerzo es lo que suma en ese tamaño; déjalo vacío si no aplica. Puedes usar medios centímetros, como 8.5.</p>' +
          '<div class="pe-encabezados" aria-hidden="true"><span>Tamaño (cm)</span><span>Precio</span><span>Refuerzo</span><span></span></div>' +
          '<div id="pe-precios">' + filas.map(_filaPrecioHTML).join('') + '</div>' +
          '<div class="pe-botones">' +
            '<button type="button" class="m3-btn-text m3-btn-sm" onclick="editorAgregarFila()">' +
              '<span class="material-symbols-rounded" aria-hidden="true" style="font-size:18px">add</span> Agregar tamaño</button>' +
          '</div>' +
          '<details class="pe-rango">' +
            '<summary>Llenar varios tamaños de una vez</summary>' +
            '<div class="pe-rango-campos">' +
              '<label>De <input type="text" id="pe-de" inputmode="decimal" placeholder="4"> cm</label>' +
              '<label>a <input type="text" id="pe-a" inputmode="decimal" placeholder="20"> cm</label>' +
              '<label>El primero cuesta $<input type="text" id="pe-desde" inputmode="decimal" placeholder="15"></label>' +
              '<label>y sube $<input type="text" id="pe-sube" inputmode="decimal" placeholder="3"> por cm</label>' +
            '</div>' +
            '<button type="button" class="m3-btn-tonal m3-btn-sm" onclick="editorLlenarRango()">Llenar</button>' +
            '<p class="pe-ayuda">Cambia el precio de esos tamaños y conserva su refuerzo.</p>' +
          '</details>' +

          '<h3 class="pe-subtitulo">Niveles de diseño</h3>' +
          '<p class="pe-ayuda">Lo que suma el diseño según qué tan complicado es. Siempre queda uno sin costo.</p>' +
          '<div class="pe-encabezados pe-encabezados-nivel" aria-hidden="true"><span>Nivel</span><span>Costo</span><span></span></div>' +
          '<div id="pe-niveles">' + niveles.map(_filaNivelHTML).join('') + '</div>' +
          '<div class="pe-botones">' +
            '<button type="button" class="m3-btn-text m3-btn-sm" onclick="editorAgregarNivel()">' +
              '<span class="material-symbols-rounded" aria-hidden="true" style="font-size:18px">add</span> Agregar nivel</button>' +
          '</div>' +
        '</div>' +

        '<div id="cp-cost-fields">' +
          '<div class="flex-row">' +
            '<div class="m3-field optional">' +
              '<input type="number" id="cp-weight" placeholder=" " min="0" step="0.1" inputmode="decimal" value="' + esc(p.defaultWeight || '') + '">' +
              '<label for="cp-weight">Peso típico (g)</label>' +
            '</div>' +
            '<div class="m3-field optional">' +
              '<input type="number" id="cp-time" placeholder=" " min="0" step="0.1" inputmode="decimal" value="' + esc(p.defaultTimeH || '') + '">' +
              '<label for="cp-time">Tiempo típico (h)</label>' +
            '</div>' +
          '</div>' +
          '<div class="flex-row">' +
            '<div class="m3-field optional">' +
              '<input type="number" id="cp-design" placeholder=" " min="0" step="0.5" inputmode="decimal" value="' + esc(String(isNaN(dh) ? 1 : dh)) + '">' +
              '<label for="cp-design">Horas de diseño</label>' +
            '</div>' +
            '<div class="m3-field optional">' +
              '<input type="number" id="cp-margin" placeholder=" " min="0" step="1" inputmode="decimal" value="' + esc(p.defaultMargin || '') + '">' +
              '<label for="cp-margin">Margen típico (%)</label>' +
            '</div>' +
          '</div>' +
        '</div>' +

        (isEdit
          ? '<button type="button" class="m3-btn-text pe-eliminar" onclick="deleteCatalogProduct(' + editIndex + ')">' +
              '<span class="material-symbols-rounded" aria-hidden="true" style="font-size:18px">delete</span> Eliminar producto</button>'
          : '') +
        '<div class="m3-sheet-actions">' +
          '<button type="button" class="m3-btn-outlined" onclick="' + volver + '">Cancelar</button>' +
          '<button type="button" class="m3-btn-filled" onclick="saveCatalogProduct(' + (isEdit ? editIndex : -1) + ')">' +
            (isEdit ? 'Guardar' : 'Agregar') + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  editorTipo(_tipoEditor);
}

function editorTipo(t) {
  _tipoEditor = t === 'table' ? 'table' : 'cost';
  document.querySelectorAll('.pe-tipo button').forEach(function(b) {
    var on = b.dataset.tipo === _tipoEditor;
    b.classList.toggle('active', on);
    b.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  var tabla = document.getElementById('cp-table-fields');
  var costo = document.getElementById('cp-cost-fields');
  if (tabla) tabla.classList.toggle('hidden', _tipoEditor !== 'table');
  if (costo) costo.classList.toggle('hidden', _tipoEditor !== 'cost');
}
/* Nombre de antes, por si algo lo llama */
function toggleCatalogType() { editorTipo(_tipoEditor === 'table' ? 'cost' : 'table'); }

function editorAgregarFila() {
  var c = document.getElementById('pe-precios'); if (!c) return;
  c.insertAdjacentHTML('beforeend', _filaPrecioHTML());
  var ultima = c.lastElementChild.querySelector('.pe-tam');
  if (ultima) ultima.focus();
}

function editorAgregarNivel() {
  var c = document.getElementById('pe-niveles'); if (!c) return;
  c.insertAdjacentHTML('beforeend', _filaNivelHTML());
  var ultima = c.lastElementChild.querySelector('.pe-nivel');
  if (ultima) ultima.focus();
}

function editorQuitarFila(btn) {
  var fila = btn.closest('.pe-fila'); if (!fila) return;
  var lista = fila.parentElement;
  var siguiente = fila.nextElementSibling || fila.previousElementSibling;
  fila.remove();
  /* El foco no se pierde: pasa a la fila de al lado o al botón de agregar */
  var destino = siguiente ? siguiente.querySelector('input') : null;
  if (!destino && lista) {
    var botones = lista.nextElementSibling;
    destino = botones && botones.querySelector('button');
  }
  if (destino) destino.focus();
}

function _leerFilasPrecios() {
  return Array.prototype.map.call(document.querySelectorAll('#pe-precios .pe-fila'), function(f) {
    return { tamano: f.querySelector('.pe-tam').value, precio: f.querySelector('.pe-precio').value, refuerzo: f.querySelector('.pe-ref').value };
  });
}

function _leerNiveles() {
  return Array.prototype.map.call(document.querySelectorAll('#pe-niveles .pe-fila'), function(f) {
    return { label: f.querySelector('.pe-nivel').value, cost: f.querySelector('.pe-costo').value };
  });
}

function editorLlenarRango() {
  var nuevas = llenarRango({
    desde: (document.getElementById('pe-de') || {}).value,
    hasta: (document.getElementById('pe-a') || {}).value,
    inicio: (document.getElementById('pe-desde') || {}).value,
    incremento: (document.getElementById('pe-sube') || {}).value
  });
  if (!nuevas.length) { snack('Escribe de qué tamaño a qué tamaño y el precio del primero'); return; }

  /* Lo que ya estaba se conserva; los tamaños del rango toman su precio
     nuevo y se quedan con su refuerzo */
  var porTamano = {}, orden = [];
  _leerFilasPrecios().forEach(function(f) {
    var t = parseFloat(String(f.tamano).replace(',', '.'));
    if (!(t > 0)) return;
    var k = formatoTamano(t);
    if (!porTamano[k]) orden.push(k);
    porTamano[k] = { tamano: k, precio: f.precio, refuerzo: f.refuerzo };
  });
  nuevas.forEach(function(n) {
    var k = formatoTamano(n.tamano);
    if (!porTamano[k]) { orden.push(k); porTamano[k] = { tamano: k, refuerzo: '' }; }
    porTamano[k].precio = n.precio;
  });
  orden.sort(function(a, b) { return Number(a) - Number(b); });
  document.getElementById('pe-precios').innerHTML = orden.map(function(k) { return _filaPrecioHTML(porTamano[k]); }).join('');
  snack(nuevas.length === 1 ? 'Se llenó 1 tamaño' : 'Se llenaron ' + nuevas.length + ' tamaños');
}

/* Marca cada fila con su error, en el lugar donde se corrige */
function _marcarErrores(contenedorId, errores, campos) {
  var filas = document.querySelectorAll('#' + contenedorId + ' .pe-fila');
  Array.prototype.forEach.call(filas, function(f, i) {
    f.classList.remove('pe-fila-error');
    f.querySelectorAll('input').forEach(function(inp) { inp.removeAttribute('aria-invalid'); inp.removeAttribute('aria-describedby'); });
    var p = f.querySelector('.pe-error');
    p.textContent = ''; p.classList.add('hidden'); p.id = contenedorId + '-err-' + i;
  });
  var primero = null;
  errores.forEach(function(e) {
    var f = filas[e.fila]; if (!f) return;
    var inp = f.querySelector(campos[e.campo]);
    var p = f.querySelector('.pe-error');
    f.classList.add('pe-fila-error');
    p.textContent = e.mensaje; p.classList.remove('hidden');
    if (inp) {
      inp.setAttribute('aria-invalid', 'true');
      inp.setAttribute('aria-describedby', p.id);
      if (!primero) primero = inp;
    }
  });
  return primero;
}

/* ── Guardar (nuevo o edición) ────────────────────────────────── */
function saveCatalogProduct(editIndex) {
  var nameEl = document.getElementById('cp-name');
  var name = (nameEl.value || '').trim();
  var nameField = document.getElementById('cp-name-field');
  var nameErr = document.getElementById('cp-name-error');
  if (!name) {
    if (nameField) nameField.classList.add('m3-field-error');
    if (nameErr) nameErr.classList.remove('hidden');
    nameEl.setAttribute('aria-invalid', 'true');
    nameEl.focus();
    return;
  }
  if (nameField) nameField.classList.remove('m3-field-error');
  if (nameErr) nameErr.classList.add('hidden');
  nameEl.removeAttribute('aria-invalid');

  var type = _tipoEditor;
  var anterior = editIndex >= 0 ? catalogItems[editIndex] : null;
  var product = { id: anterior ? anterior.id : 'cat-' + Date.now(), name: name, type: type };
  var variantEl = document.getElementById('cp-variant');
  if (variantEl && variantEl.value.trim()) product.variant = variantEl.value.trim();

  var sinPrecios = false;
  if (type === 'table') {
    var precios = validarFilasPrecios(_leerFilasPrecios());
    var niveles = validarNiveles(_leerNiveles());
    /* Sin ningún tamaño se puede guardar: el producto avisa que le faltan precios */
    var errPrecios = precios.errores.filter(function(e) { return e.fila >= 0; });
    var p1 = _marcarErrores('pe-precios', errPrecios, { tamano: '.pe-tam', precio: '.pe-precio', refuerzo: '.pe-ref' });
    var p2 = _marcarErrores('pe-niveles', niveles.errores, { label: '.pe-nivel', cost: '.pe-costo' });
    var total = errPrecios.length + niveles.errores.length;
    if (total) {
      (p1 || p2).focus();
      snack(total === 1 ? 'Revisa la fila marcada' : 'Revisa las ' + total + ' filas marcadas');
      return;
    }
    product.priceTable    = precios.tabla;
    product.refuerzoTable = precios.refuerzos;
    product.designLevels  = niveles.niveles;
    sinPrecios = !Object.keys(precios.tabla).length;
  } else {
    var dh = parseFloat(document.getElementById('cp-design').value);
    product.designH       = isNaN(dh) ? 1 : dh;
    product.defaultWeight = document.getElementById('cp-weight').value.trim();
    product.defaultTimeH  = document.getElementById('cp-time').value.trim();
    product.defaultMargin = document.getElementById('cp-margin').value.trim();
  }

  if (anterior) { catalogItems[editIndex] = product; }
  else { catalogItems.push(product); }

  saveCatalog();
  if (typeof dbGuardarProducto === 'function') dbGuardarProducto(product);

  /* Si se estaba cotizando este producto y ya no es por tamaño, regresa a la pieza */
  if (_modoProducto && String(_modoProducto.id) === String(product.id) && product.type !== 'table') salirModoProducto();
  if (_editorDesde === 'panel') closeModal(); else showCatalogModal();
  renderQueCotizas();
  /* El botón que abrió el editor se volvió a dibujar: el foco va a su reemplazo */
  var editar = _editorDesde === 'panel' && document.querySelector('#calc-producto .pt-editar, #calc-producto .pt-vacio .btn');
  if (editar) editar.focus({ preventScroll: true });
  snack(sinPrecios ? 'Guardado. Agrégale precios para poder cotizarlo'
                   : (anterior ? 'Producto actualizado' : 'Producto agregado'));
}

/* ── Eliminar ─────────────────────────────────────────────────── */
function deleteCatalogProduct(i) {
  var p = catalogItems[i]; if (!p) return;
  m3Confirm('¿Eliminar "' + esc(p.name) + '" de tus productos?', function() {
    _deleteCatalogProductConfirmed(i);
  }, { detail: 'Las cotizaciones que ya lo usan no se modifican.' });
}

function _deleteCatalogProductConfirmed(i) {
  var prodId = catalogItems[i] && catalogItems[i].id;
  catalogItems.splice(i, 1);
  saveCatalog();
  if (prodId && typeof dbBorrarProducto === 'function') dbBorrarProducto(prodId);
  showCatalogModal();
  renderQueCotizas();
  snack('Producto eliminado');
}

function editCatalogModal(i) { showAddCatalogModal(i, 'lista'); }

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ══ Editar un producto por tamaño de la orden (D152) ═══════════════ */

/* El producto de «Mis productos» del que salió. Los agregados desde v115
   traen su id; los de antes se buscan por el nombre al inicio de la
   descripción («Cortador de galletas Solo Cortador…»). */
function productoDeItem(item) {
  var dt = item && item.detalleTabla;
  if (dt && dt.productoId != null) {
    var p = _productoPorId(dt.productoId);
    if (p && p.type === 'table') return p;
  }
  var d = String((item && item.desc) || ''), mejor = null, largo = 0;
  catalogItems.forEach(function(p) {
    if (p.type !== 'table') return;
    var n = p.name + (p.variant ? ' ' + p.variant : '');
    if (d.indexOf(n) === 0 && n.length > largo) { mejor = p; largo = n.length; }
  });
  return mejor;
}

/* Abre el producto en la calculadora con lo que se eligió. Devuelve lo que
   hay que revisar (un tamaño o un nivel de diseño que ya no existen). */
function cargarProductoTablaDeOrden(item, p) {
  var dt = item.detalleTabla || {};
  var avisos = [];
  var niveles = nivelesDiseno(p), di = 0;
  niveles.forEach(function(n, k) { if (n.label === dt.nivel) di = k; });
  if (dt.nivel && niveles[di].label !== dt.nivel) avisos.push('el diseño: «' + dt.nivel + '» ya no está');
  var size = dt.tamano != null && tamanosDe(p).indexOf(Number(dt.tamano)) !== -1 ? Number(dt.tamano) : null;
  if (dt.tamano != null && size == null) avisos.push('el tamaño: ' + formatoTamano(dt.tamano) + ' cm ya no tiene precio');
  if (!item.detalleTabla) avisos.push('el tamaño: este producto es de antes y no lo guardó');

  var sel = { size: size, designIdx: di, refuerzo: Number(dt.refuerzo) > 0 };
  var auto = size != null ? descripcionProductoTabla(p, sel) : '';
  /* Una descripción escrita a mano se conserva; la automática se vuelve a armar */
  var manual = !!item.detalleTabla && !!item.desc && item.desc !== auto;

  _productoCostoId = null;
  _modoProducto = { id: p.id, size: size, designIdx: di, refuerzo: sel.refuerzo,
                    qty: item.qty || 1, desc: manual ? item.desc : '', descManual: manual };
  var pagina = document.getElementById('page-calc');
  if (pagina) pagina.classList.add('modo-producto');
  renderQueCotizas();
  return avisos;
}
