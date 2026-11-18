/* ===== PRODUCTOS POR TAMAÑO (D148–D150) =====
   Las cuentas de los productos que se venden por tamaño, como los cortadores de
   galletas: el precio de cada tamaño, el refuerzo de cada tamaño y los niveles de
   diseño, todo editable por producto. Sin pantalla, para probarlo en Node
   (tests/precios-tamano.test.js); catalog.js lo usa para el panel y el editor. */

/* Lo que traían todos los productos antes de D150. Se usa cuando un producto
   todavía no tiene los suyos, y para llenar su editor la primera vez. */
var NIVELES_DISENO_INICIALES = [
  { label: 'Sin diseño', cost: 0 },
  { label: 'Muy simple', cost: 15 },
  { label: 'Sencillo',   cost: 20 },
  { label: 'Medio',      cost: 25 },
  { label: 'Complejo',   cost: 35 }
];

function refuerzoInicial(size) {
  if (size >= 4 && size <= 5)  return 5;
  if (size >= 9 && size <= 14) return 10;
  if (size >= 15)              return 15;
  return 0;
}

function _redondear(n) { return Math.round(n * 100) / 100; }

/* 8 → «8»; 8.5 → «8.5» */
function formatoTamano(s) { return String(_redondear(Number(s))); }

function _numero(v) {
  var t = String(v == null ? '' : v).trim().replace(/^\$/, '').replace(',', '.');
  return t === '' ? null : parseFloat(t);
}

function tamanosDe(p) {
  return Object.keys((p && p.priceTable) || {}).map(Number)
    .filter(function(n) { return !isNaN(n); })
    .sort(function(a, b) { return a - b; });
}

function precioDeTamano(p, size) {
  var v = ((p && p.priceTable) || {})[size];
  return typeof v === 'number' ? v : (parseFloat(v) || 0);
}

/* Con su tabla de refuerzos, la del producto; sin ella, la regla de antes */
function refuerzoDe(p, size) {
  if (p && p.refuerzoTable) return parseFloat(p.refuerzoTable[size]) || 0;
  return refuerzoInicial(Number(size));
}

function nivelesDiseno(p) {
  return p && Array.isArray(p.designLevels) && p.designLevels.length ? p.designLevels : NIVELES_DISENO_INICIALES;
}

/* sel: { size, designIdx, refuerzo, qty } */
function totalProductoTabla(p, sel) {
  var base     = precioDeTamano(p, sel.size);
  var nivel    = nivelesDiseno(p)[sel.designIdx || 0] || { label: '', cost: 0 };
  var refuerzo = sel.refuerzo ? refuerzoDe(p, sel.size) : 0;
  var unitario = _redondear(base + (Number(nivel.cost) || 0) + refuerzo);
  var qty      = Math.max(1, parseInt(sel.qty, 10) || 1);
  return { base: base, diseno: Number(nivel.cost) || 0, nivel: nivel.label, refuerzo: refuerzo,
           unitario: unitario, qty: qty, total: _redondear(unitario * qty) };
}

/* Lo que dice la cotización: «Cortador de galletas Solo Cortador · 8 cm · diseño sencillo · con refuerzo» */
function descripcionProductoTabla(p, sel) {
  var partes = [p.name + (p.variant ? ' ' + p.variant : ''), formatoTamano(sel.size) + ' cm'];
  var nivel = nivelesDiseno(p)[sel.designIdx || 0];
  if (nivel && Number(nivel.cost) > 0) partes.push('diseño ' + String(nivel.label).toLowerCase());
  if (sel.refuerzo && refuerzoDe(p, sel.size) > 0) partes.push('con refuerzo');
  return partes.join(' · ');
}

/* Filas del editor → tabla de precios y de refuerzos. Cada fila que no cuadra
   devuelve su error, en vez de descartarse sin avisar como el texto «4:15». */
function validarFilasPrecios(filas) {
  var tabla = {}, refuerzos = {}, errores = [], vistos = {};
  (filas || []).forEach(function(f, i) {
    var tam = _numero(f.tamano), precio = _numero(f.precio), ref = _numero(f.refuerzo);
    if (tam === null && precio === null && ref === null) return;   /* fila vacía */
    if (!(tam > 0)) { errores.push({ fila: i, campo: 'tamano', mensaje: 'Escribe el tamaño en cm' }); return; }
    var clave = formatoTamano(tam);
    if (vistos[clave] !== undefined) { errores.push({ fila: i, campo: 'tamano', mensaje: 'El tamaño de ' + clave + ' cm está repetido' }); return; }
    if (precio === null || isNaN(precio) || precio < 0) { errores.push({ fila: i, campo: 'precio', mensaje: 'Escribe el precio de ' + clave + ' cm' }); return; }
    if (ref !== null && (isNaN(ref) || ref < 0)) { errores.push({ fila: i, campo: 'refuerzo', mensaje: 'El refuerzo de ' + clave + ' cm no es un número' }); return; }
    vistos[clave] = i;
    tabla[clave] = _redondear(precio);
    if (ref > 0) refuerzos[clave] = _redondear(ref);
  });
  if (!Object.keys(tabla).length && !errores.length) {
    errores.push({ fila: -1, campo: 'tamano', mensaje: 'Agrega al menos un tamaño con su precio' });
  }
  return { tabla: tabla, refuerzos: refuerzos, errores: errores };
}

/* Niveles de diseño. Siempre queda uno sin costo, para poder cotizar sin diseño. */
function validarNiveles(filas) {
  var niveles = [], errores = [];
  (filas || []).forEach(function(f, i) {
    var label = String(f.label || '').trim(), costo = _numero(f.cost);
    if (!label && costo === null) return;
    if (!label) { errores.push({ fila: i, campo: 'label', mensaje: 'Ponle nombre al nivel de $' + costo }); return; }
    if (costo !== null && (isNaN(costo) || costo < 0)) { errores.push({ fila: i, campo: 'cost', mensaje: 'El costo de «' + label + '» no es un número' }); return; }
    niveles.push({ label: label, cost: costo === null ? 0 : _redondear(costo) });
  });
  if (!niveles.some(function(n) { return n.cost === 0; })) niveles.unshift({ label: 'Sin diseño', cost: 0 });
  return { niveles: niveles, errores: errores };
}

/* Llenado rápido: «de 4 a 20 cm, $15 el primero y +$3 por cm» */
function llenarRango(o) {
  var desde = _numero(o.desde), hasta = _numero(o.hasta), inicio = _numero(o.inicio);
  var inc = _numero(o.incremento) || 0, paso = _numero(o.paso) || 1;
  if (!(desde > 0) || hasta === null || hasta < desde || inicio === null || isNaN(inicio) || !(paso > 0)) return [];
  if ((hasta - desde) / paso > 200) return [];
  var filas = [];
  for (var n = 0; desde + n * paso <= hasta + 1e-9; n++) {
    var s = _redondear(desde + n * paso);
    filas.push({ tamano: s, precio: _redondear(inicio + (s - desde) * inc) });
  }
  return filas;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NIVELES_DISENO_INICIALES: NIVELES_DISENO_INICIALES, refuerzoInicial: refuerzoInicial,
    formatoTamano: formatoTamano, tamanosDe: tamanosDe, precioDeTamano: precioDeTamano,
    refuerzoDe: refuerzoDe, nivelesDiseno: nivelesDiseno, totalProductoTabla: totalProductoTabla,
    descripcionProductoTabla: descripcionProductoTabla, validarFilasPrecios: validarFilasPrecios,
    validarNiveles: validarNiveles, llenarRango: llenarRango
  };
}
