/* Pruebas de los productos de precio fijo, como el kit de la casita
   (js/precio-fijo.js, D187–D191). Se corren con:  npm test */

const test = require('node:test');
const assert = require('node:assert');
const f = require('../js/precio-fijo.js');

const kit = {
  id: 'cat-kit', name: 'Kit casita de galleta', type: 'fijo', precio: 250,
  placas: [
    { nombre: 'Cortadores', gramos: 66.7, horas: 3.2 },
    { nombre: 'Marcadores', gramos: 31.4, horas: 1.55 },
    { nombre: '', gramos: 0, horas: 0 }
  ]
};

test('El kit suma sus placas; las vacías no cuentan', () => {
  assert.deepStrictEqual(f.totalesDePlacas(kit), { gramos: 98.1, horas: 4.75, placas: 2 });
  assert.deepStrictEqual(f.totalesDePlacas({}), { gramos: 0, horas: 0, placas: 0 });
  assert.strictEqual(f.placasDe({ placas: [{ gramos: 5, horas: 1 }] })[0].nombre, 'Placa 1');
});

test('Lo que se gana a precio fijo, con el margen sobre el costo como la calculadora', () => {
  assert.deepStrictEqual(f.gananciaDePrecioFijo(250, 120, 50), { ganancia: 130, margen: 108, abajo: false });
  assert.deepStrictEqual(f.gananciaDePrecioFijo(250, 200, 50), { ganancia: 50, margen: 25, abajo: true });
  assert.deepStrictEqual(f.gananciaDePrecioFijo(250, 300, 50), { ganancia: -50, margen: -17, abajo: true });
  assert.strictEqual(f.gananciaDePrecioFijo(250, 0, 50).margen, null, 'sin costo no hay margen');
});

test('El editor pide precio y, en cada placa, gramos y horas', () => {
  const ok = f.validarPrecioFijo('$250', [
    { nombre: 'Cortadores', gramos: '66,7', horas: '3.2' },
    { nombre: '', gramos: '', horas: '' }
  ]);
  assert.strictEqual(ok.precio, 250);
  assert.deepStrictEqual(ok.placas, [{ nombre: 'Cortadores', gramos: 66.7, horas: 3.2 }]);
  assert.deepStrictEqual(ok.errores, []);

  const mal = f.validarPrecioFijo('', [{ nombre: 'A', gramos: '20', horas: '' }, { nombre: '', gramos: 'x', horas: '1' }]);
  assert.deepStrictEqual(mal.errores.map((e) => [e.fila, e.campo]), [[-1, 'precio'], [0, 'horas'], [1, 'gramos']]);

  const sinPlacas = f.validarPrecioFijo('250', []);
  assert.deepStrictEqual(sinPlacas.errores, [], 'se puede guardar sin placas: el producto avisa que le faltan');
});
