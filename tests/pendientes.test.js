/* «Para hoy» del Inicio (D258): lo que te necesita hoy. */

const test   = require('node:test');
const assert = require('node:assert');
const { pendientesDeHoy } = require('../js/estados.js');

const HOY = new Date('2026-11-27T12:00:00');
const hace = (dias) => new Date(HOY.getTime() - dias * 86400000).toISOString();
const stock = (r) => r.estado;   /* en la app es estadoDeStock */

test('cuenta enviadas y borradores, con los días de la más vieja', () => {
  const p = pendientesDeHoy([
    { status: 'enviada',   quoteDate: hace(5) },
    { status: 'enviada',   quoteDate: hace(1) },
    { status: 'borrador',  quoteDate: hace(3) },
    { status: 'pendiente', quoteDate: hace(8) },   /* el nombre viejo de Borrador */
    { status: 'aceptada',  quoteDate: hace(20) },
    { status: 'rechazada', quoteDate: hace(2) }
  ], [], HOY, stock);
  assert.strictEqual(p.enviadas, 2);
  assert.strictEqual(p.diasEnviadaMasVieja, 5);
  assert.strictEqual(p.borradores, 2);
  assert.strictEqual(p.diasBorradorMasViejo, 8);
  assert.strictEqual(p.hay, true);
});

test('los rollos por acabarse y agotados, aparte', () => {
  const p = pendientesDeHoy([], [{ estado: 'ok' }, { estado: 'bajo' }, { estado: 'bajo' }, { estado: 'agotado' }], HOY, stock);
  assert.strictEqual(p.rollosBajos, 2);
  assert.strictEqual(p.rollosAgotados, 1);
  assert.strictEqual(p.hay, true);
});

test('una enviada cuenta desde que se mandó (enviadaAt), no desde que se hizo (D261)', () => {
  const p = pendientesDeHoy([
    { status: 'enviada', quoteDate: hace(10), enviadaAt: hace(2) },
    { status: 'enviada', quoteDate: hace(1),  enviadaAt: null }   /* de antes de v156 */
  ], [], HOY, stock);
  assert.strictEqual(p.diasEnviadaMasVieja, 2);
});

test('sin nada pendiente no hay tarjeta', () => {
  const p = pendientesDeHoy([{ status: 'aceptada', quoteDate: hace(1) }], [{ estado: 'ok' }], HOY, stock);
  assert.strictEqual(p.hay, false);
  assert.strictEqual(p.diasEnviadaMasVieja, null);
});

test('una cotización de hoy cuenta 0 días, y una fecha rota no rompe la cuenta', () => {
  const p = pendientesDeHoy([
    { status: 'enviada', quoteDate: HOY.toISOString() },
    { status: 'enviada', quoteDate: 'no es fecha' }
  ], [], HOY, stock);
  assert.strictEqual(p.enviadas, 2);
  assert.strictEqual(p.diasEnviadaMasVieja, 0);
});
