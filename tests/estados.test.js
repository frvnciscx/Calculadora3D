/* Pruebas de los estados de la cotización (js/estados.js).
   Se corren con:  npm test

   Siguen las reglas de docs/reglas-de-negocio.md §4.1 (D6–D9, D18) y lo que
   decidió Francisco el 2026-11-18 (D140–D144). */

const test = require('node:test');
const assert = require('node:assert');
const e = require('../js/estados.js');

test('«pendiente» y una cotización sin estado se leen como Borrador (D6, D141)', () => {
  assert.strictEqual(e.estadoDe({ status: 'pendiente' }), 'borrador');
  assert.strictEqual(e.estadoDe({}), 'borrador');
  assert.strictEqual(e.estadoDe({ status: 'borrador' }), 'borrador');
  assert.strictEqual(e.estadoDe({ status: 'enviada' }), 'enviada');
  assert.strictEqual(e.etiquetaEstado('pendiente'), 'Borrador');
  assert.strictEqual(e.etiquetaEstado('aceptada'), 'Aceptada');
});

test('Compartir solo pasa Borrador a Enviada (D7)', () => {
  assert.strictEqual(e.estadoAlCompartir({ status: 'pendiente' }), 'enviada');
  assert.strictEqual(e.estadoAlCompartir({ status: 'borrador' }), 'enviada');
  assert.strictEqual(e.estadoAlCompartir({ status: 'enviada' }), null);
  assert.strictEqual(e.estadoAlCompartir({ status: 'aceptada' }), null, 'compartir una aceptada no la regresa');
  assert.strictEqual(e.estadoAlCompartir({ status: 'rechazada' }), null);
});

test('Editar: una enviada regresa a Borrador y una aceptada no se edita (D9)', () => {
  assert.strictEqual(e.estadoAlEditar({ status: 'enviada' }), 'borrador');
  assert.strictEqual(e.estadoAlEditar({ status: 'pendiente' }), 'borrador', 'al editarse, la vieja se guarda como borrador');
  assert.strictEqual(e.estadoAlEditar({ status: 'rechazada' }), 'rechazada');
  assert.strictEqual(e.sePuedeEditar({ status: 'aceptada' }), false);
  assert.strictEqual(e.sePuedeEditar({ status: 'enviada' }), true);
});

test('Regresar un paso vuelve al estado del que vino (D18)', () => {
  assert.strictEqual(e.estadoAnterior({ status: 'borrador' }), null);
  assert.strictEqual(e.estadoAnterior({ status: 'enviada' }), 'borrador');
  assert.strictEqual(e.estadoAnterior({ status: 'aceptada', estadoAnterior: 'borrador' }), 'borrador', 'aceptada en mostrador');
  assert.strictEqual(e.estadoAnterior({ status: 'aceptada', estadoAnterior: 'pendiente' }), 'borrador');
  assert.strictEqual(e.estadoAnterior({ status: 'aceptada' }), 'enviada', 'las viejas regresan a Enviada (D67)');
  assert.strictEqual(e.estadoAnterior({ status: 'rechazada', estadoAnterior: 'enviada' }), 'enviada');
});

test('Una acción principal por estado y el resto en el menú (D143)', () => {
  assert.deepStrictEqual(e.accionesPrincipales({ status: 'pendiente' }), ['enviar']);
  assert.deepStrictEqual(e.accionesPrincipales({ status: 'enviada' }), ['aceptar', 'rechazar']);
  assert.deepStrictEqual(e.accionesPrincipales({ status: 'aceptada' }), ['ver']);
  const borrador = e.accionesDelMenu({ status: 'borrador' });
  assert.ok(borrador.includes('marcar-enviada') && borrador.includes('aceptar'), 'aceptar en mostrador, desde el menú (D8)');
  assert.ok(!borrador.includes('regresar'), 'un borrador no tiene a dónde regresar');
  const aceptada = e.accionesDelMenu({ status: 'aceptada' });
  assert.ok(!aceptada.includes('editar'), 'una aceptada no se edita');
  assert.ok(aceptada.includes('regresar') && aceptada.includes('enviar'));
  assert.strictEqual(aceptada[aceptada.length - 1], 'borrar', 'borrar va al final');
});
