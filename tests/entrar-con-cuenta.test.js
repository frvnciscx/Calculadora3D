/* Pruebas de lo que pasa la primera vez que se entra con una cuenta (js/db.js, desde v106).
   Se corren con:  npm test

   Con v105, entrar con una cuenta borraba lo que había en el dispositivo: la app
   escuchaba la nube, vacía, antes de subir nada. Así se perdieron los datos de
   La Casita del Molde el 2026-11-09 (D107). Estas pruebas cubren los cinco casos,
   con un Firestore de mentira (nube-de-prueba.js) que no toca la nube real. */

const test = require('node:test');
const assert = require('node:assert');
const { crearNube, esperar, cerrarTodo } = require('./nube-de-prueba.js');

test.after(cerrarTodo);

const ESPERA = 1200;           // lo que se deja correr la app antes de revisar
const TARDA_EN_CONTESTAR = 300; // la persona lee la pregunta antes de contestar

function cuentaQueYaExistia(nube) {
  nube.docs('usuarios').u1 = { negocioId: 'neg_u1' };
  nube.docs('negocios').neg_u1 = { nombre: 'La Casita del Molde', miembros: { u1: 'dueño' } };
  nube.docs('negocios/neg_u1/ajustes').general = { fixedMonthlyCost: 2500, monthlyPrintHours: 150 };
  nube.docs('negocios/neg_u1/cotizaciones').qNube = { quoteNum: 'COT-0009', quoteDate: '2026-11-08' };
}

/* 600 cotizaciones: más de las 500 que caben en una tanda de Firestore */
function dispositivoConDatos(nube) {
  const cotizaciones = Array.from({ length: 600 }, (_, i) => ({ id: 'q' + (i + 1), quoteNum: 'COT-' + (i + 1) }));
  Object.assign(nube.dispositivo('A'), {
    c3d_quotes: JSON.stringify(cotizaciones),
    c3d_clients: JSON.stringify([{ id: 'c1', name: 'Cliente Frecuente 1' }, { id: 'c9', name: 'Rosalía' }]),
    c3d_inventory: JSON.stringify([{ id: 'r1', color: 'Cian' }]),
    c3d_catalog: JSON.stringify([{ id: 'p1', name: 'Topper' }]),
    c3d_printers: JSON.stringify([{ id: 'a', name: 'Mi Bambu A1' }]),
    c3d_materials: JSON.stringify([{ id: 'b', name: 'Mi PLA' }]),
    c3d_config: JSON.stringify({ fixedMonthlyCost: 1860, monthlyPrintHours: 120 }),
  });
}

/* En memoria, una cotización puede traer campos sin valor; Firestore los rechaza */
const CAMPOS_SIN_VALOR = 'quotes.forEach(function (q) { q.acceptedAt = undefined; });';

function resultado(nube, app) {
  const local = (k) => JSON.parse(nube.dispositivo('A')['c3d_' + k] || 'null');
  return {
    cotizacionesDispositivo: local('quotes').length,
    cotizacionesNube: Object.keys(nube.docs('negocios/neg_u1/cotizaciones')).length,
    gastosDispositivo: local('config').fixedMonthlyCost,
    gastosNube: (nube.docs('negocios/neg_u1/ajustes').general || {}).fixedMonthlyCost,
    clientesNube: Object.keys(nube.docs('negocios/neg_u1/clientes')).sort(),
    respaldo: Boolean(local('respaldoAntesDeNube')),
    preguntas: app.preguntas.length,
    errores: app.errores,
  };
}

test('Cuenta nueva: todo lo del dispositivo sube, y los clientes de ejemplo no', async () => {
  const nube = crearNube();
  dispositivoConDatos(nube);
  const app = nube.abrirApp('A', { antes: CAMPOS_SIN_VALOR });
  await esperar(ESPERA);
  app.cerrar();
  assert.deepStrictEqual(resultado(nube, app), {
    cotizacionesDispositivo: 600, cotizacionesNube: 600,
    gastosDispositivo: 1860, gastosNube: 1860,
    clientesNube: ['c9'], respaldo: true, preguntas: 0, errores: [],
  });
  assert.ok(nube.tandas.every((n) => n <= 500), `tandas de más de 500: ${nube.tandas.join(' + ')}`);
});

test('Cuenta que ya existía: si la persona acepta, se junta todo y los ajustes de la cuenta se quedan', async () => {
  const nube = crearNube();
  cuentaQueYaExistia(nube);
  dispositivoConDatos(nube);
  const app = nube.abrirApp('A', { antes: CAMPOS_SIN_VALOR, respuesta: 'acepta', tardaEnContestar: TARDA_EN_CONTESTAR });
  await esperar(ESPERA);
  app.cerrar();
  assert.deepStrictEqual(resultado(nube, app), {
    cotizacionesDispositivo: 601, cotizacionesNube: 601,
    gastosDispositivo: 2500, gastosNube: 2500,
    clientesNube: ['c9'], respaldo: true, preguntas: 1, errores: [],
  });
});

test('Cuenta que ya existía: si la persona cancela, el dispositivo queda como estaba', async () => {
  const nube = crearNube();
  cuentaQueYaExistia(nube);
  dispositivoConDatos(nube);
  const app = nube.abrirApp('A', { antes: CAMPOS_SIN_VALOR, respuesta: 'cancela' });
  await esperar(ESPERA);
  app.cerrar();
  assert.deepStrictEqual(resultado(nube, app), {
    cotizacionesDispositivo: 600, cotizacionesNube: 1,
    gastosDispositivo: 1860, gastosNube: 2500,
    clientesNube: [], respaldo: true, preguntas: 1, errores: [],
  });
  assert.strictEqual(nube.escrituras(), 0, 'escribió en la nube');
});

test('Cuenta que ya existía, en un dispositivo sin datos propios: no pregunta y baja lo de la cuenta', async () => {
  const nube = crearNube();
  cuentaQueYaExistia(nube);
  nube.dispositivo('A').c3d_clients = JSON.stringify([
    { id: 'c1', name: 'Cliente Frecuente 1' }, { id: 'c2', name: 'Cliente Frecuente 2' },
  ]);
  const app = nube.abrirApp('A');
  await esperar(ESPERA);
  app.cerrar();
  assert.deepStrictEqual(resultado(nube, app), {
    cotizacionesDispositivo: 1, cotizacionesNube: 1,
    gastosDispositivo: 2500, gastosNube: 2500,
    clientesNube: [], respaldo: false, preguntas: 0, errores: [],
  });
});

test('Segunda vez en este dispositivo: no pregunta, y lo que no alcanzó a subir se conserva y sube', async () => {
  const nube = crearNube();
  cuentaQueYaExistia(nube);
  dispositivoConDatos(nube);
  nube.dispositivo('A').c3d_migrado_neg_u1 = 'true';
  const app = nube.abrirApp('A', { antes: CAMPOS_SIN_VALOR });
  await esperar(ESPERA);
  app.cerrar();
  const r = resultado(nube, app);
  assert.deepStrictEqual(
    { cotizacionesDispositivo: r.cotizacionesDispositivo, cotizacionesNube: r.cotizacionesNube, preguntas: r.preguntas, errores: r.errores },
    { cotizacionesDispositivo: 601, cotizacionesNube: 601, preguntas: 0, errores: [] });
});
