/* ===== PRODUCTOS DE PRECIO FIJO, COMO LOS KITS (D187–D191) =====
   El precio de venta lo pone el negocio (el kit de la casita, $250). Lo que
   cuesta sale de la fórmula de siempre, con los gramos y las horas de sus
   placas, y la calculadora dice cuánto se gana a ese precio. Se imprime como
   cualquier otra pieza: impresora, material, rollo e inventario (D189).

   Un producto así: { id, name, type: 'fijo', precio: 250,
                      placas: [{ nombre, gramos, horas }] }

   Sin pantalla, para probarlo en Node (tests/precio-fijo.test.js). */

function _numFijo(v) {
  var t = String(v == null ? '' : v).trim().replace(/^\$/, '').replace(',', '.');
  if (t === '') return null;
  var n = Number(t);
  return isNaN(n) ? NaN : n;
}

/* Las placas que cuentan: las que traen gramos u horas */
function placasDe(p) {
  return ((p && p.placas) || []).map(function(pl, i) {
    return {
      nombre: String((pl && pl.nombre) || '').trim() || 'Placa ' + (i + 1),
      gramos: Number(pl && pl.gramos) || 0,
      horas:  Number(pl && pl.horas)  || 0
    };
  }).filter(function(pl) { return pl.gramos > 0 || pl.horas > 0; });
}

/* Lo que se imprime para un producto: la suma de sus placas */
function totalesDePlacas(p) {
  return placasDe(p).reduce(function(t, pl) {
    t.gramos = Math.round((t.gramos + pl.gramos) * 100) / 100;
    t.horas  = Math.round((t.horas  + pl.horas)  * 1000) / 1000;
    t.placas += 1;
    return t;
  }, { gramos: 0, horas: 0, placas: 0 });
}

/* Lo que se gana a ese precio. El margen es sobre el costo, como el de la
   calculadora (precio = costo × (1 + margen / 100)), para poder compararlos.
   «abajo»: cuando gana menos que el margen de la calculadora (D190). */
function gananciaDePrecioFijo(precio, costo, margenBuscado) {
  precio = Number(precio) || 0;
  costo  = Number(costo)  || 0;
  var ganancia = Math.round((precio - costo) * 100) / 100;
  var margen = costo > 0 ? Math.round((precio / costo - 1) * 100) : null;
  var buscado = Number(margenBuscado);
  return {
    ganancia: ganancia,
    margen: margen,
    abajo: margen != null && !isNaN(buscado) && margen < buscado
  };
}

/* Lo que se capturó en el editor, revisado. filas: [{ nombre, gramos, horas }]
   como texto. Las filas vacías no cuentan; a una a medias le falta un dato. */
function validarPrecioFijo(precioTexto, filas) {
  var errores = [], placas = [];
  var precio = _numFijo(precioTexto);
  if (precio == null || isNaN(precio) || precio <= 0) {
    errores.push({ fila: -1, campo: 'precio', mensaje: 'Escribe el precio de venta' });
  }
  (filas || []).forEach(function(f, i) {
    var g = _numFijo(f.gramos), h = _numFijo(f.horas);
    var nombre = String(f.nombre || '').trim();
    if (g == null && h == null && !nombre) return;   /* vacía */
    if (g == null || isNaN(g) || g <= 0) {
      errores.push({ fila: i, campo: 'gramos', mensaje: 'Escribe los gramos de esta placa' });
      return;
    }
    if (h == null || isNaN(h) || h <= 0) {
      errores.push({ fila: i, campo: 'horas', mensaje: 'Escribe las horas de esta placa' });
      return;
    }
    placas.push({ nombre: nombre || 'Placa ' + (placas.length + 1), gramos: g, horas: h });
  });
  return { precio: precio > 0 ? precio : null, placas: placas, errores: errores };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    placasDe: placasDe, totalesDePlacas: totalesDePlacas,
    gananciaDePrecioFijo: gananciaDePrecioFijo, validarPrecioFijo: validarPrecioFijo
  };
}
