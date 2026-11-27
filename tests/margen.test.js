/* Margen y ganancia (D213): «margen» es la parte del precio que es ganancia,
   en la Calculadora, en la Orden, en el panel de la cotización y en Inicio.
   La comisión del recomendador no es del negocio (D30). */

const test   = require('node:test');
const assert = require('node:assert');
const { margenDePrecio, gananciaDeOrden, ingresoSinComision } = require('../js/costing.js');

test('+50 % sobre el costo es 33 % de margen', () => {
  assert.strictEqual(margenDePrecio(150, 100), 33);
});

test('el margen sale del precio redondeado: $86 de costo, $130 de precio', () => {
  assert.strictEqual(margenDePrecio(130, 86), 34);
});

test('vender bajo costo da margen negativo', () => {
  assert.strictEqual(margenDePrecio(80, 100), -25);
});

test('sin precio no hay margen', () => {
  assert.strictEqual(margenDePrecio(0, 50), null);
});

test('la ganancia de la orden es después del descuento y por cantidad', () => {
  const g = gananciaDeOrden([
    { totalCost: 130, baseCost: 86, qty: 2 },
    { totalCost: 50,  baseCost: 30, qty: 1 }
  ], 10);
  /* (260 + 50) × 0.9 = 279; costo 172 + 30 = 202 */
  assert.strictEqual(g.ingreso, 279);
  assert.strictEqual(g.costo, 202);
  assert.strictEqual(g.ganancia, 77);
  assert.strictEqual(g.margen, 28);
});

test('con un producto sin costo (tabla de precios) la ganancia no se sabe', () => {
  const g = gananciaDeOrden([
    { totalCost: 130, baseCost: 86, qty: 1 },
    { totalCost: 90,  baseCost: null, qty: 1 }
  ], 0);
  assert.strictEqual(g.ganancia, null);
  assert.strictEqual(g.margen, null);
  assert.strictEqual(g.ingreso, 220);
});

test('la comisión del recomendador sale del ingreso', () => {
  /* $1,000 de piezas con 10 % de comisión: el cliente paga $1,100 y el negocio recibe $1,000 */
  assert.ok(Math.abs(ingresoSinComision(1100, 10) - 1000) < 1e-9);
  assert.strictEqual(ingresoSinComision(500, 0), 500);
});
