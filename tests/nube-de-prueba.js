/* Un Firestore de mentira, en memoria, para probar js/db.js sin tocar la nube real.
   Lo usan sincronizacion.test.js y entrar-con-cuenta.test.js.

   Imita lo que importa de Firestore para estas pruebas:
   - avisa en tiempo real a quien escucha cuando algo cambia;
   - rechaza campos undefined, como el real;
   - una tanda (batch) no puede tener más de 500 escrituras.

   Cada «dispositivo» tiene su propio localStorage. Cada vez que se abre la app,
   js/db.js se vuelve a cargar en un contexto nuevo, como al abrir el navegador;
   al cerrarla, lo que no alcanzó a subir ya no sube. */

const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const CODIGO_DB = fs.readFileSync(path.join(__dirname, '..', 'js', 'db.js'), 'utf8');

/* Lo de js/store.js que usa db.js: los valores de ejemplo, ld(), sv() y las listas.
   Sin los clientes de ejemplo: la prueba que los necesita los pone. */
const COMO_STORE = `
  var DEF_CONFIG = { fixedMonthlyCost: 2000, monthlyPrintHours: 200, bizName: '' };
  var DEF_QUOTE_STYLE = { primaryColor: '#6750A4' };
  var DEF_PRINTERS = [{ id: '1', name: 'Ender 3 V2 (de ejemplo)' }];
  var DEF_MATERIALS = [{ id: '1', name: 'PLA (de ejemplo)' }];
  function ld(k, d) { var v = localStorage.getItem('c3d_' + k); return v ? JSON.parse(v) : d; }
  function sv(k, v) {
    localStorage.setItem('c3d_' + k, JSON.stringify(v));
    if (typeof dbNotificarEscritura === 'function') dbNotificarEscritura(k, v);
  }
  var quotes = ld('quotes', []);
  var clients = ld('clients', []);
  var inventory = ld('inventory', []);
  var catalogItems = ld('catalog', []);
  var printers = ld('printers', DEF_PRINTERS);
  var materials = ld('materials', DEF_MATERIALS);
  var config = Object.assign({}, DEF_CONFIG, ld('config', {}));
  var quoteStyle = Object.assign({}, DEF_QUOTE_STYLE, ld('quoteStyle', {}));
  var history = ld('history', []);
  var presets = ld('presets', []);
`;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const copia = (o) => JSON.parse(JSON.stringify(o));

/* Todas las apps abiertas, para cerrarlas al final aunque una prueba falle a la mitad:
   una app abierta que se quedó escribiendo deja colgado npm test */
const sesiones = [];
function cerrarTodo() {
  sesiones.forEach((s) => { s.viva = false; s.timers.forEach(clearTimeout); });
}

function tieneUndefined(o) {
  if (o === undefined) return true;
  return Boolean(o && typeof o === 'object' && Object.values(o).some(tieneUndefined));
}

/* latencia: lo que tarda la nube en contestar, en milisegundos */
function crearNube({ latencia = 40 } = {}) {
  const colecciones = {};   // ruta de la colección -> { id: datos }
  const escuchas = [];      // quién escucha qué
  const almacenes = {};     // dispositivo -> su localStorage
  const tandas = [];        // cuántas escrituras llevó cada tanda
  let escrituras = 0;

  const docs = (ruta) => (colecciones[ruta] = colecciones[ruta] || {});

  function avisar(ruta, id) {
    escuchas
      .filter((e) => e.sesion.viva && e.ruta === ruta && (e.id === undefined || e.id === id))
      .forEach((e) => setTimeout(() => e.sesion.viva && e.disparar(), 5));
  }

  function escuchar(e, sesion) {
    escuchas.push(e);
    setTimeout(() => sesion.viva && e.disparar(), latencia);
    return () => { e.sesion = { viva: false }; };
  }

  function colRef(ruta, sesion) {
    return {
      doc: (id) => docRef(ruta, id, sesion),
      onSnapshot(cb) {
        return escuchar({ ruta, sesion, disparar() {
          const ds = Object.entries(docs(ruta));
          cb({ empty: !ds.length, forEach: (f) => ds.forEach(([id, d]) => f({ id, data: () => copia(d) })) });
        } }, sesion);
      },
    };
  }

  function docRef(ruta, id, sesion) {
    return {
      collection: (sub) => colRef(`${ruta}/${id}/${sub}`, sesion),
      get: () => Promise.resolve({ exists: id in docs(ruta), data: () => copia(docs(ruta)[id]) }),
      onSnapshot(cb) {
        return escuchar({ ruta, id, sesion, disparar() {
          const d = docs(ruta)[id];
          cb({ exists: Boolean(d), data: () => copia(d || {}) });
        } }, sesion);
      },
      set(data, opts) {
        if (!sesion.viva) return Promise.resolve();
        if (tieneUndefined(data)) return Promise.reject(new Error('Unsupported field value: undefined'));
        escrituras++;
        docs(ruta)[id] = opts && opts.merge ? Object.assign({}, docs(ruta)[id], copia(data)) : copia(data);
        avisar(ruta, id);
        return Promise.resolve();
      },
      delete() {
        if (!sesion.viva) return Promise.resolve();
        escrituras++;
        delete docs(ruta)[id];
        avisar(ruta, id);
        return Promise.resolve();
      },
    };
  }

  const dispositivo = (nombre) => (almacenes[nombre] = almacenes[nombre] || {});

  /* opciones:
     usuario:   la cuenta que entra ('u1' si no se dice); null para abrir sin sesión
     antes:     código que corre después de cargar lo del dispositivo y antes de db.js
     respuesta: qué contesta la persona si la app pregunta: 'acepta' (así si no se dice) o 'cancela'
     tardaEnContestar: milisegundos que tarda en contestar */
  function abrirApp(nombre, opciones = {}) {
    const almacen = dispositivo(nombre);
    const sesion = { viva: true, timers: new Set() };
    sesiones.push(sesion);
    const preguntas = [];
    const avisos = [];
    const errores = [];
    let alEntrar = null;

    const fakeDb = {
      enablePersistence: () => Promise.resolve(),
      collection: (n) => colRef(n, sesion),
      batch() {
        const ops = [];
        return {
          set(ref, data, opts) {
            if (tieneUndefined(data)) throw new Error('Unsupported field value: undefined');
            ops.push([ref, data, opts]);
          },
          commit() {
            if (ops.length > 500) return Promise.reject(new Error('Más de 500 escrituras en una tanda'));
            tandas.push(ops.length);
            return esperar(latencia).then(() => Promise.all(ops.map(([r, d, o]) => r.set(d, o))));
          },
        };
      },
    };

    const ctx = {
      console: { log() {}, warn() {}, error: (...a) => errores.push(a.map(String).join(' ')) },
      setTimeout(f, ms) {
        const t = setTimeout(() => { sesion.timers.delete(t); if (sesion.viva) f(); }, ms);
        sesion.timers.add(t);
        return t;
      },
      clearTimeout(t) { clearTimeout(t); sesion.timers.delete(t); },
      Promise, JSON, Date, Math, Object, Array, String, Boolean, Number,
      localStorage: {
        getItem: (k) => (k in almacen ? almacen[k] : null),
        setItem: (k, v) => { almacen[k] = String(v); },
        removeItem: (k) => { delete almacen[k]; },
        key: (i) => Object.keys(almacen)[i] || null,
        get length() { return Object.keys(almacen).length; },
      },
      sessionStorage: { removeItem() {} },
      firebase: { firestore: Object.assign(() => fakeDb, { FieldValue: { serverTimestamp: () => 'ahora' } }) },
      onAuthStateChanged: (cb) => { alEntrar = cb; },
      m3Confirm(titulo, siConfirma) {
        preguntas.push(titulo);
        if ((opciones.respuesta || 'acepta') === 'acepta') ctx.setTimeout(siConfirma, opciones.tardaEnContestar || 10);
      },
      snack: (m) => avisos.push(m),
    };
    ctx.window = ctx;
    vm.createContext(ctx);
    vm.runInContext(COMO_STORE, ctx);
    if (opciones.antes) vm.runInContext(opciones.antes, ctx);
    vm.runInContext(CODIGO_DB, ctx, { filename: 'js/db.js' });

    const usuario = opciones.usuario === undefined ? 'u1' : opciones.usuario;
    if (usuario !== null) {
      assert.ok(alEntrar, 'js/db.js ya no se registra con onAuthStateChanged para saber cuándo se entra');
      alEntrar({ uid: usuario, email: 'taller@ejemplo.mx', isAnonymous: false });
    }

    return {
      preguntas, avisos, errores,
      run: (codigo) => vm.runInContext(codigo, ctx),
      cerrar() { sesion.viva = false; sesion.timers.forEach(clearTimeout); },
      salir() { alEntrar(null); },
    };
  }

  return {
    docs,
    dispositivo,
    abrirApp,
    tandas,
    escrituras: () => escrituras,
  };
}

module.exports = { crearNube, esperar, cerrarTodo };
