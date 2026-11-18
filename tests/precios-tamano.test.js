/* Pruebas de los productos por tamaño (js/precios-tamano.js), como los cortadores.
   Se corren con:  npm test

   La tabla «Solo Cortador» es la de La Casita del Molde: 4 cm = $15 y +$3 por cm
   hasta 20 cm. Los niveles de diseño y el refuerzo de antes de D150 son los de
   NIVELES_DISENO_INICIALES y refuerzoInicial. */

const test = require('node:test');
const assert = require('node:assert');
const p = require('../js/precios-tamano.js');

const SOLO = { name: 'Cortador de galletas', variant: 'Solo Cortador', type: 'table',
  priceTable: { 4: 15, 5: 18, 6: 21, 7: 24, 8: 27, 9: 30, 10: 33, 11: 36, 12: 39, 13: 42, 14: 45, 15: 48, 16: 51, 17: 54, 18: 57, 19: 60, 20: 63 } };

test('Un producto viejo cotiza igual que antes: mismos precios, diseño y refuerzo', () => {
  const r = p.totalProductoTabla(SOLO, { size: 9, designIdx: 2, refuerzo: true, qty: 1 });
  assert.deepStrictEqual([r.base, r.diseno, r.refuerzo, r.unitario], [30, 20, 10, 60]);
  assert.strictEqual(p.refuerzoDe(SOLO, 8), 0, 'de 6 a 8 cm no había refuerzo');
});

test('El total multiplica por la cantidad', () => {
  const r = p.totalProductoTabla(SOLO, { size: 8, designIdx: 0, refuerzo: false, qty: 3 });
  assert.strictEqual(r.unitario, 27);
  assert.strictEqual(r.total, 81);
});

test('La descripción lleva el tamaño y lo elegido (D148)', () => {
  assert.strictEqual(p.descripcionProductoTabla(SOLO, { size: 8, designIdx: 0 }), 'Cortador de galletas Solo Cortador · 8 cm');
  assert.strictEqual(p.descripcionProductoTabla(SOLO, { size: 9, designIdx: 2, refuerzo: true }),
                     'Cortador de galletas Solo Cortador · 9 cm · diseño sencillo · con refuerzo');
  assert.strictEqual(p.descripcionProductoTabla(SOLO, { size: 8, refuerzo: true }), 'Cortador de galletas Solo Cortador · 8 cm',
                     'sin refuerzo para ese tamaño, no lo dice');
});

test('Cada producto tiene su refuerzo y sus niveles de diseño (D150)', () => {
  const propio = Object.assign({}, SOLO, { refuerzoTable: { 8: 7 }, designLevels: [{ label: 'Sin diseño', cost: 0 }, { label: 'Logo', cost: 40 }] });
  const r = p.totalProductoTabla(propio, { size: 8, designIdx: 1, refuerzo: true });
  assert.deepStrictEqual([r.diseno, r.refuerzo, r.unitario], [40, 7, 74]);
  assert.strictEqual(p.refuerzoDe(propio, 9), 0, 'con tabla propia, un tamaño sin refuerzo no lleva');
});

test('El editor avisa cada fila que no cuadra, en vez de descartarla (D149)', () => {
  const r = p.validarFilasPrecios([
    { tamano: '4', precio: '15', refuerzo: '5' },
    { tamano: '8.5', precio: '$28', refuerzo: '' },
    { tamano: '', precio: '', refuerzo: '' },
    { tamano: '4', precio: '16' },
    { tamano: '10', precio: '' },
    { tamano: 'x', precio: '3' },
    { tamano: '12', precio: '39', refuerzo: 'diez' }
  ]);
  assert.deepStrictEqual(r.tabla, { 4: 15, 8.5: 28 }, 'conserva 8.5 cm, no lo convierte en 8');
  assert.deepStrictEqual(r.refuerzos, { 4: 5 });
  assert.deepStrictEqual(r.errores.map((e) => [e.fila, e.campo]), [[3, 'tamano'], [4, 'precio'], [5, 'tamano'], [6, 'refuerzo']]);
  assert.match(r.errores[0].mensaje, /repetido/);
  assert.strictEqual(p.validarFilasPrecios([]).errores.length, 1, 'sin ningún tamaño, lo pide');
});

test('Niveles de diseño: siempre queda uno sin costo', () => {
  const r = p.validarNiveles([{ label: 'Logo', cost: '40' }, { label: '', cost: '' }, { label: '', cost: '10' }]);
  assert.deepStrictEqual(r.niveles, [{ label: 'Sin diseño', cost: 0 }, { label: 'Logo', cost: 40 }]);
  assert.strictEqual(r.errores.length, 1);
});

test('Llenado rápido: de 4 a 20 cm, $15 y +$3 por cm da la tabla de siempre', () => {
  const filas = p.llenarRango({ desde: 4, hasta: 20, inicio: 15, incremento: 3 });
  assert.strictEqual(filas.length, 17);
  const tabla = p.validarFilasPrecios(filas).tabla;
  assert.deepStrictEqual(Object.keys(tabla).map(Number).sort((a, b) => a - b), p.tamanosDe(SOLO));
  assert.ok(p.tamanosDe(SOLO).every((s) => tabla[s] === SOLO.priceTable[s]));
  assert.deepStrictEqual(p.llenarRango({ desde: 5, hasta: 4, inicio: 10 }), [], 'un rango al revés no llena nada');
  assert.deepStrictEqual(p.llenarRango({ desde: 4, hasta: 5, inicio: 10, incremento: 2, paso: 0.5 }).map((f) => f.precio), [10, 11, 12]);
});
