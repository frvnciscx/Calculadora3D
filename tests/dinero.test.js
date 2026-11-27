/* El dinero con un solo formato en toda la app (D237): «$1,250.00». */

const test   = require('node:test');
const assert = require('node:assert');
const { formatoDinero } = require('../js/costing.js');

test('dos decimales siempre, también en los enteros', () => {
  assert.strictEqual(formatoDinero(95, '$'), '$95.00');
  assert.strictEqual(formatoDinero(0, '$'), '$0.00');
});

test('comas de miles', () => {
  assert.strictEqual(formatoDinero(1000, '$'), '$1,000.00');
  assert.strictEqual(formatoDinero(12500, '$'), '$12,500.00');
  assert.strictEqual(formatoDinero(1234567.891, '$'), '$1,234,567.89');
});

test('primero redondea a centavos: 999.9999 es $1,000.00', () => {
  assert.strictEqual(formatoDinero(999.9999, '$'), '$1,000.00');
  assert.strictEqual(formatoDinero(1000 / 1.1 * 1.1, '$'), '$1,000.00');
});

test('negativos con el signo menos antes de la moneda', () => {
  assert.strictEqual(formatoDinero(-12.5, '$'), '\u2212$12.50');
  assert.strictEqual(formatoDinero(-1500, '$'), '\u2212$1,500.00');
});

test('otra moneda, y sin número da cero', () => {
  assert.strictEqual(formatoDinero(10, '€'), '€10.00');
  assert.strictEqual(formatoDinero(null, '$'), '$0.00');
  assert.strictEqual(formatoDinero('45', '$'), '$45.00');
  assert.strictEqual(formatoDinero(undefined), '$0.00');
});
