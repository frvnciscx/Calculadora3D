/* ===== MATERIAL USADO (D180) =====
   Cuánto material se fue en las cotizaciones aceptadas de un mes, por material,
   para la tarjeta de Inventario. Son los mismos gramos que se descontaron de los
   rollos al aceptarlas (_deductQuoteInventory en js/quotes.js): el peso por
   pieza por la cantidad y, en el AMS, cada color con su parte de la purga.

   Sin pantalla, para probarlo en Node (tests/uso-material.test.js). La pantalla
   le pasa nombreDe() para leer el nombre vigente del material o del rollo. */

/* Más de 4 materiales en el mes: los primeros 3 y el resto junto en «Otros».
   La paleta de la barra tiene 4 colores probados para daltonismo (D180). */
var MAX_PARTES_USO = 4;

var MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
var MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
                    'septiembre', 'octubre', 'noviembre', 'diciembre'];

/* Un mes como número (año × 12 + mes), para comparar y restar sin fechas */
function _mesDeFecha(fecha) {
  var d = fecha instanceof Date ? fecha : new Date(fecha);
  return isNaN(d.getTime()) ? null : d.getFullYear() * 12 + d.getMonth();
}

/* La aceptación cuenta desde que se aceptó; las viejas sin esa fecha, desde que se hizo */
function _mesDeCotizacion(q) {
  return _mesDeFecha(q.acceptedAt || q.quoteDate || q.date);
}

/* Gramos de cada producto, por material: [{ nombre, gramos }] */
function gramosDeProducto(it, nombreDe) {
  var qty = parseFloat(it.qty) || 1;
  var nombre = function(color) {
    var n = nombreDe ? nombreDe(it, color) : it.material;
    n = (n || '').trim();
    return n && n !== '—' ? n : 'Sin material';
  };
  if (it.amsColors && it.amsColors.length) {
    var purgaPorColor = (parseFloat(it.amsPurgeGrams) || 0) / it.amsColors.length;
    return it.amsColors.map(function(c) {
      return { nombre: nombre(c), gramos: ((parseFloat(c.weight) || 0) + purgaPorColor) * qty };
    });
  }
  return [{ nombre: nombre(null), gramos: (parseFloat(it.weight) || 0) * qty }];
}

/* { nombre: gramos } de las cotizaciones aceptadas de un mes */
function gramosDelMes(quotes, mes, nombreDe) {
  var suma = {};
  (quotes || []).forEach(function(q) {
    if (!q || q.status !== 'aceptada' || _mesDeCotizacion(q) !== mes) return;
    (q.items || []).forEach(function(it) {
      gramosDeProducto(it, nombreDe).forEach(function(p) {
        if (p.gramos > 0) suma[p.nombre] = (suma[p.nombre] || 0) + p.gramos;
      });
    });
  });
  return suma;
}

/* Porcentajes enteros que suman 100: el sobrante va a los de mayor fracción */
function _porcentajes(valores) {
  var total = valores.reduce(function(s, v) { return s + v; }, 0);
  if (!total) return valores.map(function() { return 0; });
  var crudos = valores.map(function(v) { return v / total * 100; });
  var enteros = crudos.map(Math.floor);
  var falta = 100 - enteros.reduce(function(s, v) { return s + v; }, 0);
  crudos.map(function(v, i) { return { i: i, resto: v - Math.floor(v) }; })
    .sort(function(a, b) { return b.resto - a.resto; })
    .slice(0, falta)
    .forEach(function(x) { enteros[x.i] += 1; });
  return enteros;
}

/* Todo lo de la tarjeta. hoy: la fecha del mes que se muestra */
function usoDeMaterial(quotes, hoy, nombreDe) {
  var mes = _mesDeFecha(hoy || new Date());
  var actual = gramosDelMes(quotes, mes, nombreDe);
  var previo = gramosDelMes(quotes, mes - 1, nombreDe);
  var sumar = function(o) { return Object.keys(o).reduce(function(s, k) { return s + o[k]; }, 0); };
  var total = sumar(actual), totalPrevio = sumar(previo);

  var partes = Object.keys(actual)
    .map(function(n) { return { nombre: n, gramos: actual[n] }; })
    .sort(function(a, b) { return b.gramos - a.gramos || a.nombre.localeCompare(b.nombre); });
  if (partes.length > MAX_PARTES_USO) {
    var resto = partes.slice(MAX_PARTES_USO - 1);
    partes = partes.slice(0, MAX_PARTES_USO - 1).concat([{
      nombre: 'Otros', otros: true,
      gramos: resto.reduce(function(s, p) { return s + p.gramos; }, 0)
    }]);
  }
  var pct = _porcentajes(partes.map(function(p) { return p.gramos; }));
  partes.forEach(function(p, i) { p.pct = pct[i]; });

  /* ¿Hubo alguna vez material en una aceptada? Sin eso la tarjeta no aparece */
  var hayDatos = (quotes || []).some(function(q) {
    return q && q.status === 'aceptada' && (q.items || []).some(function(it) {
      return gramosDeProducto(it, nombreDe).some(function(p) { return p.gramos > 0; });
    });
  });

  return {
    anio: Math.floor(mes / 12), mes: mes % 12,
    total: total, totalPrevio: totalPrevio,
    cambio: totalPrevio > 0 && total > 0 ? Math.round((total - totalPrevio) / totalPrevio * 100) : null,
    partes: partes,
    hayDatos: hayDatos
  };
}

/* 850 g · 1.9 kg · 12 kg */
function formatoGramos(g) {
  g = Math.round(g || 0);
  if (g < 1000) return g + ' g';
  var kg = g / 1000;
  return (kg >= 10 ? Math.round(kg) : Math.round(kg * 10) / 10) + ' kg';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MAX_PARTES_USO: MAX_PARTES_USO, MESES_CORTOS: MESES_CORTOS, MESES_LARGOS: MESES_LARGOS,
    gramosDeProducto: gramosDeProducto, gramosDelMes: gramosDelMes,
    usoDeMaterial: usoDeMaterial, formatoGramos: formatoGramos
  };
}
