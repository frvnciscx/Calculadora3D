/* Pruebas de la sincronización con la nube (js/db.js, desde v107).
   Se corren con:  npm test

   Usan un Firestore de mentira (nube-de-prueba.js): no tocan la nube real ni
   necesitan internet. Un mismo taller usa la app en dos dispositivos, A y B, y
   la abre y la cierra a la mitad, como en el uso diario.

   Si una falla, se vuelven a perder registros: con v106 fallaban 13 de estas
   comprobaciones, y así se borraron cotizaciones, clientes, gastos fijos,
   gastos indirectos y datos del negocio (D111). Las pruebas corren en orden y
   cada una sigue donde se quedó la anterior. */

const test = require('node:test');
const assert = require('node:assert');
const { crearNube, esperar, cerrarTodo } = require('./nube-de-prueba.js');

test.after(cerrarTodo);

const nube = crearNube();
const enNube = (col) => nube.docs(`negocios/neg_u1/${col}`);
const ajustesNube = () => nube.docs('negocios/neg_u1/ajustes').general || {};
const ESPERA = 300;   // lo que se deja correr la app antes de revisar
const abiertas = [];
let A;

function abrir(nombre, opciones) {
  const app = nube.abrirApp(nombre, opciones);
  abiertas.push(app);
  return app;
}

test('Cuenta nueva: sube lo que ya había en el dispositivo', async () => {
  Object.assign(nube.dispositivo('A'), {
    c3d_quotes: JSON.stringify([
      { id: 'q1', quoteNum: 'COT-1', quoteDate: '2026-11-01', status: 'pendiente' },
      { id: 'q2', quoteNum: 'COT-2', quoteDate: '2026-11-02', status: 'pendiente' },
    ]),
    c3d_config: JSON.stringify({ fixedMonthlyCost: 1860, monthlyPrintHours: 120, bizName: 'La Casita del Molde' }),
  });
  A = abrir('A');
  await esperar(ESPERA);
  assert.strictEqual(Object.keys(enNube('cotizaciones')).length, 2, 'cotizaciones en la nube');
  assert.strictEqual(ajustesNube().fixedMonthlyCost, 1860, 'gastos fijos en la nube');
});

test('Lo que se guarda solo con sv(), sin dbGuardar…, llega a la nube', async () => {
  A.run(`
    quotes.unshift({ id: 'q3', quoteNum: 'COT-3', quoteDate: '2026-11-09', status: 'pendiente' }); sv('quotes', quotes);
    clients.unshift({ id: 'c9', name: 'Rosalía' }); sv('clients', clients);
    history.unshift({ desc: 'llavero', date: '2026-11-09T10:00:00Z' }, { desc: 'topper', date: '2026-11-09T09:00:00Z' }); sv('history', history);
    presets.push({ name: 'PLA 50%', printerId: '1', materialId: '1', margin: 50 }); sv('presets', presets);
  `);
  await esperar(200);
  assert.ok('q3' in enNube('cotizaciones'), 'la cotización duplicada no llegó');
  assert.ok('c9' in enNube('clientes'), 'el cliente creado desde la cotización no llegó');
  assert.strictEqual(Object.keys(enNube('calculos')).length, 2, 'historial en la nube');
  assert.strictEqual(Object.keys(enNube('favoritos')).length, 1, 'favoritos en la nube');

  A.run(`history.splice(1, 1); sv('history', history);`);
  await esperar(100);
  assert.strictEqual(Object.keys(enNube('calculos')).length, 1, 'borrar un cálculo del historial no lo borró de la nube');
});

test('Guardar gastos y cerrar la app enseguida: al volver a abrirla siguen ahí y suben', async () => {
  A.run(`config.fixedMonthlyCost = 1500; config.indirectMonthlyCost = 300; config.bizPhone = '55 1234'; sv('config', config);`);
  await esperar(100);
  A.cerrar();
  assert.strictEqual(ajustesNube().fixedMonthlyCost, 1860, 'la prueba necesita que la app se cierre antes de subir');

  A = abrir('A');
  await esperar(ESPERA);
  assert.strictEqual(A.run('config.fixedMonthlyCost'), 1500, 'gastos fijos en el dispositivo');
  assert.deepStrictEqual(
    { fijos: ajustesNube().fixedMonthlyCost, indirectos: ajustesNube().indirectMonthlyCost, telefono: ajustesNube().bizPhone },
    { fijos: 1500, indirectos: 300, telefono: '55 1234' },
    'gastos fijos, indirectos y datos del negocio en la nube');
  A.cerrar();
});

test('Lo guardado antes de conectar con la nube se conserva y sube', async () => {
  A = abrir('A', { usuario: null });
  A.run(`quotes.unshift({ id: 'q4', quoteNum: 'COT-4', quoteDate: '2026-11-09', status: 'pendiente' }); sv('quotes', quotes);`);
  A.cerrar();

  A = abrir('A');
  await esperar(ESPERA);
  assert.ok(A.run(`quotes.some(function (q) { return q.id === 'q4'; })`), 'se perdió en el dispositivo');
  assert.ok('q4' in enNube('cotizaciones'), 'no subió a la nube');
  A.cerrar();
});

test('Otro dispositivo recibe todo, y lo que borra o cambia llega al primero', async () => {
  const B = abrir('B');
  await esperar(ESPERA);
  assert.deepStrictEqual(
    { cotizaciones: B.run('quotes.length'), clientes: B.run('clients.length'), gastos: B.run('config.fixedMonthlyCost') },
    { cotizaciones: 4, clientes: 1, gastos: 1500 },
    'lo que recibe el dispositivo B');

  B.run(`
    var i = quotes.findIndex(function (q) { return q.id === 'q1'; }); quotes.splice(i, 1); sv('quotes', quotes); dbBorrarCotizacion('q1');
    quotes.find(function (q) { return q.id === 'q2'; }).status = 'aceptada'; sv('quotes', quotes);
  `);
  await esperar(150);
  B.cerrar();

  A = abrir('A');
  await esperar(ESPERA);
  assert.ok(!A.run(`quotes.some(function (q) { return q.id === 'q1'; })`), 'lo que se borró en B sigue en A');
  assert.strictEqual(A.run(`quotes.find(function (q) { return q.id === 'q2'; }).status`), 'aceptada', 'el cambio hecho en B no ganó');
});

test('Abrir la app sin cambiar nada no escribe en la nube', async () => {
  A.cerrar();
  const antes = nube.escrituras();
  A = abrir('A');
  await esperar(ESPERA);
  assert.strictEqual(nube.escrituras() - antes, 0, 'escrituras al abrir');
});

test('Cerrar sesión y volver a entrar: vuelve lo de la cuenta, sin los valores de ejemplo encima', async () => {
  A.salir();
  await esperar(50);
  A.cerrar();
  A = abrir('A');
  await esperar(ESPERA);
  assert.strictEqual(A.run('config.fixedMonthlyCost'), 1500, 'gastos fijos en el dispositivo');
  assert.strictEqual(ajustesNube().fixedMonthlyCost, 1500, 'gastos fijos en la nube');
  assert.strictEqual(A.run('quotes.length'), 3, 'cotizaciones');
  assert.strictEqual(A.run('clients.length'), 1, 'clientes');
  assert.ok(Object.keys(enNube('impresoras')).length <= 1, 'se subieron impresoras de ejemplo a la cuenta');
  A.cerrar();
});

test('Si el diseño cambia en otro equipo, se redibuja la barra con el logo (D126)', async () => {
  A = abrir('A', { antes: 'var barraPintada = 0; function updateTopBar() { barraPintada++; }' });
  await esperar(ESPERA);
  const antes = A.run('barraPintada');

  const B = abrir('B');
  await esperar(ESPERA);
  B.run(`quoteStyle.logo = 'data:image/png;base64,AAAA'; sv('quoteStyle', quoteStyle);`);
  await esperar(1000);   // los ajustes esperan 0.8 s antes de subir
  B.cerrar();

  assert.strictEqual(A.run('quoteStyle.logo'), 'data:image/png;base64,AAAA', 'el logo no llegó al otro equipo');
  assert.ok(A.run('barraPintada') > antes, 'llegó el logo, pero la barra no se redibujó');
  A.cerrar();
});

test('Ninguna escritura falló', () => {
  const errores = abiertas.flatMap((app) => app.errores);
  assert.deepStrictEqual(errores, []);
});
