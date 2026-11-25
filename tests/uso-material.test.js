/* Pruebas de la tarjeta «Material usado» de Inventario (js/uso-material.js, D180).
   Se corren con:  npm test

   Cuenta los gramos de las cotizaciones aceptadas del mes, por material, igual
   que el descuento de los rollos al aceptar (js/quotes.js). Las fechas van a
   mitad de mes para que la zona horaria no cambie el mes. */

const test = require('node:test');
const assert = require('node:assert');
const u = require('../js/uso-material.js');

const pieza = (material, weight, qty, extra) => Object.assign({ material, weight, qty }, extra || {});
const cot = (status, fecha, items, extra) => Object.assign({ status, quoteDate: fecha, items }, extra || {});
const NOV = new Date(2026, 10, 15);

test('Solo cuentan las aceptadas del mes, con el peso por la cantidad', () => {
  const quotes = [
    cot('aceptada', '2026-11-10T12:00:00', [pieza('PLA', 12, 40), pieza('PETG', 180, 2)]),
    cot('enviada',  '2026-11-12T12:00:00', [pieza('PETG', 400, 1)]),
    cot('borrador', '2026-11-12T12:00:00', [pieza('ABS', 400, 1)]),
    cot('aceptada', '2026-10-14T12:00:00', [pieza('PLA', 100, 1)])
  ];
  assert.deepStrictEqual(u.gramosDelMes(quotes, 2026 * 12 + 10), { PLA: 480, PETG: 360 });
});

test('Se cuenta el mes en que se aceptó, no el de la cotización', () => {
  const quotes = [cot('aceptada', '2026-10-20T12:00:00', [pieza('PLA', 50, 2)], { acceptedAt: '2026-11-05T12:00:00' })];
  const r = u.usoDeMaterial(quotes, NOV);
  assert.strictEqual(r.total, 100);
  assert.strictEqual(r.totalPrevio, 0);
});

test('En el AMS cada color va a su material, con su parte de la purga', () => {
  const it = pieza('PLA', 90, 3, { amsColors: [{ spoolId: 'r1', weight: 60 }, { spoolId: 'r3', weight: 30 }], amsPurgeGrams: 20 });
  const rollos = { r1: 'PLA', r3: 'PETG' };
  const nombreDe = (item, color) => color ? rollos[color.spoolId] : item.material;
  assert.deepStrictEqual(u.gramosDeProducto(it, nombreDe), [
    { nombre: 'PLA', gramos: 210 },   /* (60 + 10) × 3 */
    { nombre: 'PETG', gramos: 120 }   /* (30 + 10) × 3 */
  ]);
});

test('Ordena de más a menos, los porcentajes suman 100 y compara con el mes anterior', () => {
  const quotes = [
    cot('aceptada', '2026-11-03T12:00:00', [pieza('PLA', 100, 2), pieza('PETG', 100, 1)]),
    cot('aceptada', '2026-11-09T12:00:00', [pieza('TPU', 100, 1)]),
    cot('aceptada', '2026-10-09T12:00:00', [pieza('PLA', 200, 1)])
  ];
  const r = u.usoDeMaterial(quotes, NOV);
  assert.strictEqual(r.total, 400);
  assert.deepStrictEqual(r.partes.map((p) => [p.nombre, p.gramos, p.pct]),
    [['PLA', 200, 50], ['PETG', 100, 25], ['TPU', 100, 25]]);
  assert.strictEqual(r.cambio, 100);
  assert.strictEqual(r.anio, 2026);
  assert.strictEqual(r.mes, 10);

  const tercios = u.usoDeMaterial([cot('aceptada', '2026-11-03T12:00:00', [pieza('A', 1, 1), pieza('B', 1, 1), pieza('C', 1, 1)])], NOV);
  assert.strictEqual(tercios.partes.reduce((s, p) => s + p.pct, 0), 100);
});

test('Con más de 4 materiales, el resto va junto en «Otros»', () => {
  const items = [['PLA', 500], ['PETG', 300], ['ABS', 100], ['TPU', 60], ['ASA', 40]].map(([m, g]) => pieza(m, g, 1));
  const r = u.usoDeMaterial([cot('aceptada', '2026-11-03T12:00:00', items)], NOV);
  assert.deepStrictEqual(r.partes.map((p) => [p.nombre, p.gramos]), [['PLA', 500], ['PETG', 300], ['ABS', 100], ['Otros', 100]]);
  assert.strictEqual(r.partes[3].otros, true);
});

test('Sin aceptadas no hay tarjeta; sin nada este mes no hay comparación', () => {
  assert.strictEqual(u.usoDeMaterial([cot('enviada', '2026-11-03T12:00:00', [pieza('PLA', 10, 1)])], NOV).hayDatos, false);
  const r = u.usoDeMaterial([cot('aceptada', '2026-09-03T12:00:00', [pieza('PLA', 10, 1)])], NOV);
  assert.strictEqual(r.hayDatos, true);
  assert.strictEqual(r.total, 0);
  assert.strictEqual(r.cambio, null);
  assert.deepStrictEqual(r.partes, []);
});

test('Gramos en g o kg', () => {
  assert.strictEqual(u.formatoGramos(850.4), '850 g');
  assert.strictEqual(u.formatoGramos(1934), '1.9 kg');
  assert.strictEqual(u.formatoGramos(2000), '2 kg');
  assert.strictEqual(u.formatoGramos(12345), '12 kg');
});
