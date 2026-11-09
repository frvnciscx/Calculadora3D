/* ===== DB — Capa de Base de Datos con Cloud Firestore =====================
   Maneja la estructura multi-negocio definida en docs/modelo-de-datos.md:
     usuarios/{uid}                 -> A qué negocio pertenece el usuario (D36, D46)
     negocios/{negocioId}           -> Datos, miembros y catálogos del negocio
       ajustes/general              -> Parámetros de costeo y datos del taller
       ajustes/documento            -> Estilos de cotización
       contadores/cotizaciones      -> Folios secuenciales (D89)
       impresoras/{id}              -> Catálogo de impresoras
       materiales/{id}              -> Catálogo de materiales
       rollos/{id}                  -> Inventario de filamento
       clientes/{id}                -> Directorio de clientes
       productos/{id}               -> Catálogo de productos frecuentes
       cotizaciones/{id}            -> Cotizaciones con partidas
       calculos/{id}                -> Historial de cálculos, los últimos 100
       favoritos/{id}               -> Combinaciones guardadas (presets)
   ========================================================================= */

var _db = null;
var currentNegocioId   = null;
var currentNegocio     = null;
var currentPerfil      = null;
var _ultimoUidConocido = null;
var _negocioListeners  = [];
var _dbUnsubs          = [];

/* ── Inicialización de Firestore con Persistencia Offline ────────── */
(function _initFirestore() {
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    try {
      _db = firebase.firestore();

      /* Persistencia local en caché (IndexedDB) para funcionamiento sin conexión */
      if (_db.enablePersistence) {
        _db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
          if (err.code === 'failed-precondition') {
            console.warn('[Firestore] Persistencia activa solo en una pestaña.');
          } else if (err.code === 'unimplemented') {
            console.warn('[Firestore] Este navegador no soporta persistencia offline.');
          }
        });
      }
    } catch (e) {
      console.error('[Firestore] Error inicializando Firestore:', e);
    }
  }
})();

function getDb() {
  return _db;
}

function getCurrentNegocioId() {
  return currentNegocioId;
}

function getCurrentNegocio() {
  return currentNegocio;
}

function getCurrentPerfil() {
  return currentPerfil;
}

function onNegocioChanged(callback) {
  if (typeof callback !== 'function') return function() {};
  _negocioListeners.push(callback);
  if (currentNegocioId) {
    try { callback(currentNegocioId, currentNegocio); } catch (e) {}
  }
  return function() {
    _negocioListeners = _negocioListeners.filter(function(f) { return f !== callback; });
  };
}

function _notificarNegocio() {
  _negocioListeners.forEach(function(callback) {
    try { callback(currentNegocioId, currentNegocio); }
    catch (e) { console.error('[DB] Error en listener de negocio:', e); }
  });
}

function _detenerSincronizacion() {
  _dbUnsubs.forEach(function(unsub) {
    try { unsub(); } catch (e) {}
  });
  _dbUnsubs = [];
  _escuchando = false;
  Object.keys(_timersDoc).forEach(function(k) { clearTimeout(_timersDoc[k]); });
  _timersDoc = {};
}

/* ── Vinculación de Usuario y Negocio (D36, D46) ─────────────────── */
function resolverPerfilYNegocio(user) {
  if (!user || !_db) return Promise.resolve(null);

  var uid = user.uid;

  /* Si cambiamos de usuario diferente al anterior, limpiar datos del usuario previo (D83) */
  if (_ultimoUidConocido && _ultimoUidConocido !== uid) {
    limpiarDatosLocales();
  }
  _ultimoUidConocido = uid;

  var userRef = _db.collection('usuarios').doc(uid);

  return userRef.get().then(function(userSnap) {
    if (userSnap.exists) {
      /* Usuario existente */
      currentPerfil = userSnap.data();
      currentNegocioId = currentPerfil.negocioId;

      return _db.collection('negocios').doc(currentNegocioId).get().then(function(negSnap) {
        if (negSnap.exists) {
          currentNegocio = negSnap.data();
        } else {
          currentNegocio = { nombre: 'Mi Negocio 3D', miembros: {} };
        }
        _notificarNegocio();
        _prepararSincronizacion(false);
        return { perfil: currentPerfil, negocio: currentNegocio };
      });
    }

    /* Usuario nuevo: crear negocio y perfil de acuerdo a D36 y D46 */
    var negocioId = 'neg_' + uid;
    var nombreNegocio = (typeof config !== 'undefined' && config.bizName) ||
                        user.displayName || 'La Casita del Molde';

    var nuevoNegocio = {
      nombre:        nombreNegocio,
      miembros:      {},
      arranqueHecho: false,
      creadoEn:      firebase.firestore.FieldValue.serverTimestamp()
    };
    nuevoNegocio.miembros[uid] = 'dueño';

    var nuevoPerfil = {
      correo:    user.email || '',
      nombre:    user.displayName || '',
      negocioId: negocioId,
      creadoEn:  firebase.firestore.FieldValue.serverTimestamp()
    };

    var batch = _db.batch();
    batch.set(_db.collection('negocios').doc(negocioId), nuevoNegocio);
    batch.set(userRef, nuevoPerfil);

    return batch.commit().then(function() {
      currentPerfil    = nuevoPerfil;
      currentNegocioId = negocioId;
      currentNegocio   = nuevoNegocio;
      _notificarNegocio();
      _prepararSincronizacion(true);
      return { perfil: currentPerfil, negocio: currentNegocio };
    });
  }).catch(function(err) {
    console.error('[DB] Error en resolverPerfilYNegocio:', err);
    throw err;
  });
}

function limpiarNegocio(borrarDatosLocales) {
  _detenerSincronizacion();
  currentNegocioId   = null;
  currentNegocio     = null;
  currentPerfil      = null;
  _ultimoUidConocido = null;
  _notificarNegocio();

  if (borrarDatosLocales) {
    limpiarDatosLocales();
  }
}

/* ── Borrado de datos locales al cerrar sesión (D83) ─────────────── */
function limpiarDatosLocales() {
  /* 1. Vaciar colecciones operativas en memoria */
  quotes = [];
  inventory = [];
  clients = [];
  if (typeof catalogItems !== 'undefined') {
    catalogItems = [];
  }
  history = [];
  if (typeof presets !== 'undefined') presets = [];

  /* 2. Restablecer catálogos base y configuración */
  if (typeof DEF_PRINTERS !== 'undefined') {
    printers = DEF_PRINTERS.map(function(p) { return Object.assign({}, p); });
  }
  if (typeof DEF_MATERIALS !== 'undefined') {
    materials = DEF_MATERIALS.map(function(m) { return Object.assign({}, m); });
  }
  if (typeof DEF_CONFIG !== 'undefined') {
    config = Object.assign({}, DEF_CONFIG);
  }
  if (typeof DEF_QUOTE_STYLE !== 'undefined') {
    quoteStyle = Object.assign({}, DEF_QUOTE_STYLE);
  }

  /* 3. Limpiar almacenamiento local */
  localStorage.removeItem('c3d_quotes');
  localStorage.removeItem('c3d_inventory');
  localStorage.removeItem('c3d_clients');
  localStorage.removeItem('c3d_catalog');
  localStorage.removeItem('c3d_history');
  localStorage.removeItem('c3d_presets');
  localStorage.removeItem('c3d_draftQuote');
  localStorage.removeItem('c3d_quoteCounter');
  try { sessionStorage.removeItem('c3d_lastCalc'); } catch (e) {}

  /* Lo que se recordaba de la nube de esa cuenta. Si se quedara, al volver a
     entrar los valores de ejemplo de abajo parecerían cambios del dispositivo
     y se subirían encima de los de la cuenta. */
  for (var i = localStorage.length - 1; i >= 0; i--) {
    var clave = localStorage.key(i);
    if (clave && (clave.indexOf('c3d_nube_') === 0 || clave.indexOf('c3d_migrado_') === 0)) {
      localStorage.removeItem(clave);
    }
  }
  _base = {};
  _enviado = {};

  localStorage.setItem('c3d_printers', JSON.stringify(printers));
  localStorage.setItem('c3d_materials', JSON.stringify(materials));
  localStorage.setItem('c3d_config', JSON.stringify(config));
  localStorage.setItem('c3d_quoteStyle', JSON.stringify(quoteStyle));

  /* 4. Actualizar vistas */
  try {
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof renderClients === 'function') renderClients();
    if (typeof renderQuotes === 'function') renderQuotes();
    if (typeof renderPrinters === 'function') renderPrinters();
    if (typeof renderMaterials === 'function') renderMaterials();
    if (typeof populateSelects === 'function') populateSelects();
    if (typeof updateTopBar === 'function') updateTopBar();
    if (typeof loadConfig === 'function') loadConfig();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderCatalogList === 'function') renderCatalogList();
    if (typeof refreshDraftIndicator === 'function') refreshDraftIndicator();
  } catch (err) {
    console.warn('[DB] Error refrescando interfaz tras limpiar datos:', err);
  }
}

/* ── Sincronización: juntar lo del dispositivo con la nube ─────────────
   Hasta v106, cada aviso de la nube reemplazaba la lista completa del
   dispositivo, y se perdía lo que no había alcanzado a subir: cotizaciones,
   clientes, gastos fijos, gastos indirectos y datos del negocio (reportado
   por Francisco el 2026-11-09, D111).

   Ahora se juntan los dos lados. De cada registro se recuerda su «firma» tal
   como llegó la última vez de la nube (la base, en c3d_nube_<negocio>).
   Cuando llega la nube:
     - si desde la base solo cambió el dispositivo, gana el dispositivo y se sube;
     - si cambió la nube, gana la nube;
     - lo que solo está en el dispositivo y nunca llegó de la nube se conserva y
       se sube; lo que sí había llegado y ya no está, se borró en otro equipo.
   Y cada sv() sube lo que cambió, venga de la pantalla que venga. */

var _LISTAS = {
  quotes:    { col: 'cotizaciones', render: ['renderQuotes', 'renderDashboard'], orden: 'quoteDate' },
  clients:   { col: 'clientes',     render: ['renderClients'] },
  inventory: { col: 'rollos',       render: ['renderInventory'] },
  catalog:   { col: 'productos',    render: ['renderCatalogList'] },
  printers:  { col: 'impresoras',   render: ['populateSelects', 'renderPrinters'] },
  materials: { col: 'materiales',   render: ['populateSelects', 'renderMaterials'] },
  /* Estas dos solo cambian por acciones de la persona (guardar, borrar, limpiar),
     así que lo que ya no está en el dispositivo se borra también de la nube. */
  history:   { col: 'calculos',     render: ['renderHistory'], orden: 'date', borrarLoQueFalta: true },
  presets:   { col: 'favoritos',    render: ['renderPresets'], borrarLoQueFalta: true }
};
var _DOCS = {
  config:     { doc: 'general',   render: ['updateTopBar', 'loadConfig'] },
  quoteStyle: { doc: 'documento', render: [] }
};

var _escuchando = false;
var _base = {};       /* clave -> { id: firma } en las listas, o la firma en los documentos */
var _enviado = {};    /* lo que ya se mandó y la nube todavía no devuelve */
var _timersDoc = {};
var _contadorIds = 0;

function _leerLocal(k) {
  switch (k) {
    case 'quotes':     return quotes;
    case 'clients':    return clients;
    case 'inventory':  return inventory;
    case 'catalog':    return typeof catalogItems !== 'undefined' ? catalogItems : [];
    case 'printers':   return printers;
    case 'materials':  return materials;
    case 'history':    return history;
    case 'presets':    return typeof presets !== 'undefined' ? presets : [];
    case 'config':     return config;
    case 'quoteStyle': return quoteStyle;
  }
}

function _ponerLocal(k, v) {
  switch (k) {
    case 'quotes':     quotes = v; break;
    case 'clients':    clients = v; break;
    case 'inventory':  inventory = v; break;
    case 'catalog':    catalogItems = v; break;
    case 'printers':   printers = v; break;
    case 'materials':  materials = v; break;
    case 'history':    history = v; break;
    case 'presets':    presets = v; break;
    case 'config':     config = v; break;
    case 'quoteStyle': quoteStyle = v; break;
  }
  /* Directo a localStorage, sin sv(): sv() volvería a subir lo que acaba de llegar */
  try { localStorage.setItem('c3d_' + k, JSON.stringify(v)); } catch (e) {}
}

function _pintar(nombres) {
  nombres.forEach(function(n) {
    if (typeof window[n] === 'function') {
      try { window[n](); } catch (e) { console.warn('[DB] Error pintando ' + n + ':', e); }
    }
  });
}

/* JSON con las llaves en orden: la nube no devuelve los campos en el mismo
   orden en que se guardaron, y sin esto todo parecería cambiado. */
function _estable(v) {
  if (v === null || v === undefined || typeof v !== 'object') {
    return JSON.stringify(v === undefined ? null : v) || 'null';
  }
  if (Array.isArray(v)) return '[' + v.map(_estable).join(',') + ']';
  return '{' + Object.keys(v).filter(function(c) { return v[c] !== undefined; }).sort()
    .map(function(c) { return JSON.stringify(c) + ':' + _estable(v[c]); }).join(',') + '}';
}

function _firma(obj) {
  var s = _estable(obj), h = 5381;
  for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + '.' + s.length;
}

/* El historial y los favoritos no traían id; sin id no hay documento */
function _asignarIds(k, lista) {
  var asignados = false;
  (lista || []).forEach(function(x) {
    if (x && typeof x === 'object' && x.id == null) {
      x.id = Date.now().toString(36) + '-' + (_contadorIds++).toString(36);
      asignados = true;
    }
  });
  if (asignados) {
    try { localStorage.setItem('c3d_' + k, JSON.stringify(lista)); } catch (e) {}
  }
}

function _claveBase() { return 'c3d_nube_' + currentNegocioId; }

function _cargarBase() {
  try { _base = JSON.parse(localStorage.getItem(_claveBase()) || '{}') || {}; }
  catch (e) { _base = {}; }
}

function _guardarBase() {
  if (!currentNegocioId) return;
  try { localStorage.setItem(_claveBase(), JSON.stringify(_base)); } catch (e) {}
}

function _refNegocio() {
  return _db.collection('negocios').doc(currentNegocioId);
}

function _escribirRegistro(k, x) {
  if (!currentNegocioId || !_db || !x || x.id == null) return Promise.resolve();
  var id = String(x.id), f = _firma(x);
  var enviado = _enviado[k] || (_enviado[k] = {});
  if (enviado[id] === f || (_base[k] && _base[k][id] === f)) return Promise.resolve();
  enviado[id] = f;
  return _refNegocio().collection(_LISTAS[k].col).doc(id).set(_limpio(x))
    .catch(function(err) { console.error('[DB] Error guardando en ' + _LISTAS[k].col + ':', err); });
}

function _borrarRegistro(k, id) {
  if (!currentNegocioId || !_db || id == null) return Promise.resolve();
  id = String(id);
  if (_base[k]) { delete _base[k][id]; _guardarBase(); }
  if (_enviado[k]) delete _enviado[k][id];
  return _refNegocio().collection(_LISTAS[k].col).doc(id).delete()
    .catch(function(err) { console.error('[DB] Error borrando de ' + _LISTAS[k].col + ':', err); });
}

function _escribirDoc(k, v) {
  if (!currentNegocioId || !_db || !v) return Promise.resolve();
  var f = _firma(v);
  if (_enviado[k] === f || _base[k] === f) return Promise.resolve();
  _enviado[k] = f;
  return _refNegocio().collection('ajustes').doc(_DOCS[k].doc).set(_limpio(v))
    .catch(function(err) { console.error('[DB] Error guardando ajustes/' + _DOCS[k].doc + ':', err); });
}

/* Llega una lista de la nube */
function _alLlegarLista(k, snap, conservarLocales) {
  var cfg = _LISTAS[k];
  var primera = !_base[k];
  var base = _base[k] || {};
  var nube = {}, nuevaBase = {};
  snap.forEach(function(doc) {
    var d = doc.data();
    d.id = doc.id;
    nube[doc.id] = d;
    nuevaBase[doc.id] = _firma(d);
  });

  var local = (_leerLocal(k) || []).filter(function(x) { return x && typeof x === 'object'; });
  _asignarIds(k, local);

  var resultado = [], subir = [], vistos = {};
  local.forEach(function(l) {
    var id = String(l.id), n = nube[id];
    vistos[id] = true;
    if (n) {
      /* Desde la última vez solo cambió el dispositivo: gana el dispositivo */
      if (!primera && _firma(l) !== nuevaBase[id] && base[id] === nuevaBase[id]) {
        resultado.push(l);
        subir.push(l);
      } else {
        resultado.push(n);
      }
    } else if (base[id]) {
      /* Había llegado de la nube y ya no está: se borró en otro equipo */
    } else if (primera && !conservarLocales) {
      /* Primera vez de este dispositivo con esta cuenta: manda la cuenta (D86) */
    } else {
      /* Nunca llegó a la nube: se conserva y se sube */
      resultado.push(l);
      subir.push(l);
    }
  });
  Object.keys(nube).forEach(function(id) { if (!vistos[id]) resultado.push(nube[id]); });

  /* Sin impresoras ni materiales la calculadora no funciona */
  if (!resultado.length && (k === 'printers' || k === 'materials')) {
    var def = k === 'printers'
      ? (typeof DEF_PRINTERS !== 'undefined' ? DEF_PRINTERS : [])
      : (typeof DEF_MATERIALS !== 'undefined' ? DEF_MATERIALS : []);
    resultado = def.map(function(x) { return Object.assign({}, x); });
    subir = resultado.slice();
  }
  if (cfg.orden) {
    resultado.sort(function(a, b) { return new Date(b[cfg.orden] || 0) - new Date(a[cfg.orden] || 0); });
  }

  _base[k] = nuevaBase;
  _guardarBase();
  _ponerLocal(k, resultado);
  subir.forEach(function(x) { _escribirRegistro(k, x); });
  _pintar(cfg.render);
}

function _defDoc(k) {
  if (k === 'config') return typeof DEF_CONFIG !== 'undefined' ? DEF_CONFIG : {};
  return typeof DEF_QUOTE_STYLE !== 'undefined' ? DEF_QUOTE_STYLE : {};
}

/* Llega un documento de ajustes de la nube */
function _alLlegarDoc(k, doc) {
  var local = _leerLocal(k) || {};
  if (!doc.exists) {
    /* La cuenta todavía no lo tiene: se sube el del dispositivo */
    var v = Object.assign({}, _defDoc(k), local);
    if (k === 'config' && !v.bizName && currentNegocio && currentNegocio.nombre) v.bizName = currentNegocio.nombre;
    _ponerLocal(k, v);
    _escribirDoc(k, v);
    _pintar(_DOCS[k].render);
    return;
  }
  var primera = _base[k] === undefined;
  var nube = Object.assign({}, _defDoc(k), doc.data());
  var fn = _firma(nube);
  /* Los valores de ejemplo nunca se suben encima de los de la cuenta */
  var deEjemplo = _firma(local) === _firma(Object.assign({}, _defDoc(k)));
  if (!primera && !deEjemplo && _firma(local) !== fn && _base[k] === fn) {
    /* Solo cambió el dispositivo (por ejemplo, se cerró la app antes de subir): gana el dispositivo */
    _escribirDoc(k, local);
  } else {
    _ponerLocal(k, nube);
    _pintar(_DOCS[k].render);
  }
  _base[k] = fn;
  _guardarBase();
}

function iniciarSincronizacionNegocio(opts) {
  if (!currentNegocioId || !_db) return;
  _detenerSincronizacion();

  /* conservarLocales: el dispositivo ya estaba sincronizado con esta cuenta,
     así que lo que tenga y no esté en la nube es algo que no alcanzó a subir. */
  var conservar = Boolean(opts && opts.conservarLocales);

  /* Desde aquí lo del dispositivo es copia de la nube: la próxima vez que se
     abra no hay nada propio que ofrecer subir (_prepararSincronizacion). */
  sv('migrado_' + currentNegocioId, true);

  _cargarBase();
  _enviado = {};
  _escuchando = true;

  var negRef = _refNegocio();
  Object.keys(_LISTAS).forEach(function(k) {
    _dbUnsubs.push(negRef.collection(_LISTAS[k].col).onSnapshot(
      function(snap) { _alLlegarLista(k, snap, conservar); },
      function(err) { console.warn('[DB] Sync ' + _LISTAS[k].col + ':', err); }
    ));
  });
  Object.keys(_DOCS).forEach(function(k) {
    _dbUnsubs.push(negRef.collection('ajustes').doc(_DOCS[k].doc).onSnapshot(
      function(doc) { _alLlegarDoc(k, doc); },
      function(err) { console.warn('[DB] Sync ajustes/' + _DOCS[k].doc + ':', err); }
    ));
  });
}

/* ── Operaciones de Escritura a Firestore ───────────────────────── */

/* Firestore rechaza los campos `undefined`, y uno solo hace fallar toda la
   escritura. Pasar por JSON los quita (y convierte NaN en null). */
function _limpio(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* Las llaman las pantallas. Desde v107 también sube cualquier sv() (abajo),
   así que estas llamadas ya no son las únicas por donde llega algo a la nube. */
function dbGuardarCotizacion(q)        { return _escribirRegistro('quotes', q); }
function dbBorrarCotizacion(id)        { return _borrarRegistro('quotes', id); }
function dbGuardarRollo(rollo)         { return _escribirRegistro('inventory', rollo); }
function dbBorrarRollo(id)             { return _borrarRegistro('inventory', id); }
function dbGuardarCliente(c)           { return _escribirRegistro('clients', c); }
function dbBorrarCliente(id)           { return _borrarRegistro('clients', id); }
function dbGuardarImpresora(p)         { return _escribirRegistro('printers', p); }
function dbBorrarImpresora(id)         { return _borrarRegistro('printers', id); }
function dbGuardarMaterial(m)          { return _escribirRegistro('materials', m); }
function dbBorrarMaterial(id)          { return _borrarRegistro('materials', id); }
function dbGuardarProducto(prod)       { return _escribirRegistro('catalog', prod); }
function dbBorrarProducto(id)          { return _borrarRegistro('catalog', id); }
function dbGuardarAjustes(cfg)         { return _escribirDoc('config', cfg); }
function dbGuardarEstiloCotizacion(st) { return _escribirDoc('quoteStyle', st); }

/* Sube lo que cambió en una lista. Sin nube todavía no hace nada: se junta
   cuando llegue (_alLlegarLista). */
function _alGuardarLista(k, lista) {
  if (!_escuchando) return;
  _asignarIds(k, lista);
  var base = _base[k] || {}, ids = {};
  (lista || []).forEach(function(x) {
    if (!x || typeof x !== 'object') return;
    ids[String(x.id)] = true;
    _escribirRegistro(k, x);
  });
  if (_LISTAS[k].borrarLoQueFalta) {
    Object.keys(base).forEach(function(id) { if (!ids[id]) _borrarRegistro(k, id); });
  }
}

function _escribirDocSiCambio(k) {
  _escribirDoc(k, _leerLocal(k));
}

/* Los ajustes esperan a que se deje de escribir. Si la app se cierra antes,
   se suben al ocultarse; y si ni eso alcanza, la próxima vez que se abra
   _alLlegarDoc ve que solo cambió el dispositivo y los sube. */
function _alGuardarDoc(k) {
  if (!_escuchando) return;
  clearTimeout(_timersDoc[k]);
  _timersDoc[k] = setTimeout(function() {
    delete _timersDoc[k];
    _escribirDocSiCambio(k);
  }, 800);
}

function dbVaciarPendientes() {
  Object.keys(_timersDoc).forEach(function(k) {
    clearTimeout(_timersDoc[k]);
    delete _timersDoc[k];
    if (_escuchando) _escribirDocSiCambio(k);
  });
}

if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') dbVaciarPendientes();
  });
}
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('pagehide', dbVaciarPendientes);
}

/* Gancho de sv(k, v) en store.js: todo lo que se guarda en el dispositivo */
function dbNotificarEscritura(k, v) {
  if (_LISTAS[k]) _alGuardarLista(k, v);
  else if (_DOCS[k]) _alGuardarDoc(k);
}

/* ── Lo que ya estaba en el dispositivo (D40, D84, D86, D94) ─────────
   Se decide ANTES de escuchar la nube. Si se escucha primero, la nube (vacía en
   una cuenta nueva) reemplaza lo del dispositivo antes de poder subirlo: así se
   borraron los datos de La Casita del Molde el 2026-11-09. */

/* Los dos clientes de ejemplo de store.js no cuentan como datos */
function _clientesReales() {
  return (typeof clients !== 'undefined' ? clients : []).filter(function(c) {
    return c && c.id !== 'c1' && c.id !== 'c2';
  });
}

function _hayDatosLocales() {
  return (typeof quotes !== 'undefined' && quotes.length > 0) ||
         _clientesReales().length > 0 ||
         (typeof inventory !== 'undefined' && inventory.length > 0);
}

/* Copia de lo del dispositivo antes de tocar nada, con el formato de
   Ajustes › Exportar. Se guarda una sola vez: si ya hay una, no se reemplaza,
   porque la primera es la que tiene los datos de antes de la nube. */
function _guardarRespaldoLocal() {
  try {
    if (localStorage.getItem('c3d_respaldoAntesDeNube')) return;
    var copia = { v: 6, exportDate: new Date().toISOString() };
    ['printers', 'materials', 'config', 'quoteStyle', 'history', 'quotes',
     'quoteCounter', 'clients', 'inventory', 'presets', 'catalog'].forEach(function(k) {
      var v = localStorage.getItem('c3d_' + k);
      if (v !== null) copia[k] = JSON.parse(v);
    });
    localStorage.setItem('c3d_respaldoAntesDeNube', JSON.stringify(copia));
  } catch (e) {
    console.warn('[DB] No se pudo guardar el respaldo local:', e);
  }
}

function _prepararSincronizacion(esNuevo) {
  var marca = 'migrado_' + currentNegocioId;
  var pendiente = _hayDatosLocales() && !ld(marca, false);
  if (pendiente) _guardarRespaldoLocal();

  /* Cuenta nueva: lo del dispositivo se sube solo, ajustes incluidos (D40) */
  if (esNuevo) {
    subirDatosLocales({ incluirAjustes: true })
      .then(function(n) {
        if (n.cotizaciones && typeof snack === 'function') {
          snack('Subí ' + n.cotizaciones + ' cotizaciones a tu cuenta');
        }
        iniciarSincronizacionNegocio({ conservarLocales: false });
      })
      .catch(function(err) {
        /* No se escucha la nube: así no reemplaza lo que no se pudo subir */
        console.error('[DB] No se pudieron subir los datos del dispositivo:', err);
        if (typeof snack === 'function') {
          snack('No se pudieron subir tus datos: siguen en este dispositivo. Vuelve a entrar con conexión.');
        }
      });
    return;
  }

  if (!pendiente) {
    /* Si ya se había sincronizado aquí, lo que falte en la nube no alcanzó a subir */
    iniciarSincronizacionNegocio({ conservarLocales: ld(marca, false) });
    return;
  }

  /* Cuenta que ya existía y un dispositivo con datos que no están en ella.
     Los ajustes de la cuenta se quedan (D86); se ofrece agregar las
     cotizaciones, los clientes y los rollos (D94). Si se cancela, todo sigue
     en el dispositivo, sin escuchar la nube, y se vuelve a preguntar la
     próxima vez. */
  var detalle = 'En este dispositivo hay ' + quotes.length + ' cotizaciones, ' +
                _clientesReales().length + ' clientes y ' + inventory.length +
                ' rollos que no están en tu cuenta, además del historial de cálculos. ' +
                'Los ajustes de tu cuenta no cambian.';
  if (typeof m3Confirm !== 'function') return;
  m3Confirm('¿Agregar a tu cuenta lo de este dispositivo?', function() {
    if (typeof snack === 'function') snack('Subiendo a tu cuenta…');
    subirDatosLocales({ incluirAjustes: false })
      .then(function(n) {
        if (typeof snack === 'function') snack('Agregué ' + n.cotizaciones + ' cotizaciones a tu cuenta');
        iniciarSincronizacionNegocio({ conservarLocales: false });
      })
      .catch(function(err) {
        console.error('[DB] No se pudieron subir los datos del dispositivo:', err);
        if (typeof snack === 'function') snack('No se pudieron subir: siguen en este dispositivo.');
      });
  }, { confirmLabel: 'Agregar', icon: 'cloud_upload', detail: detalle });
}

/* Sube lo del dispositivo y devuelve cuántos registros subió.
   incluirAjustes: también ajustes, impresoras, materiales y productos. */
function subirDatosLocales(opts) {
  opts = opts || {};
  if (!currentNegocioId || !_db) {
    return Promise.reject(new Error('No hay sesión o negocio activo para subir datos.'));
  }

  var negRef = _db.collection('negocios').doc(currentNegocioId);
  var ops = [];
  function agregar(coleccion, lista) {
    if (!Array.isArray(lista)) return 0;
    lista.forEach(function(x) {
      if (x && x.id != null) ops.push([negRef.collection(coleccion).doc(String(x.id)), x]);
    });
    return lista.length;
  }

  if (opts.incluirAjustes) {
    if (typeof config !== 'undefined')     ops.push([negRef.collection('ajustes').doc('general'), config]);
    if (typeof quoteStyle !== 'undefined') ops.push([negRef.collection('ajustes').doc('documento'), quoteStyle]);
    agregar('impresoras', typeof printers !== 'undefined' ? printers : []);
    agregar('materiales', typeof materials !== 'undefined' ? materials : []);
    agregar('productos', typeof catalogItems !== 'undefined' ? catalogItems : []);
    if (typeof presets !== 'undefined') { _asignarIds('presets', presets); agregar('favoritos', presets); }
  }
  if (typeof history !== 'undefined') { _asignarIds('history', history); agregar('calculos', history); }
  var n = {
    rollos:       agregar('rollos', typeof inventory !== 'undefined' ? inventory : []),
    clientes:     agregar('clientes', _clientesReales()),
    cotizaciones: agregar('cotizaciones', typeof quotes !== 'undefined' ? quotes : [])
  };

  /* Firestore acepta hasta 500 escrituras por tanda */
  var tandas = [];
  for (var i = 0; i < ops.length; i += 450) tandas.push(ops.slice(i, i + 450));
  return tandas.reduce(function(anterior, tanda) {
    return anterior.then(function() {
      var batch = _db.batch();
      tanda.forEach(function(op) { batch.set(op[0], _limpio(op[1]), { merge: true }); });
      return batch.commit();
    });
  }, Promise.resolve()).then(function() {
    sv('migrado_' + currentNegocioId, true);
    return n;
  });
}

/* ── Escuchar cambios de Auth para inicializar/limpiar negocio ────── */
if (typeof onAuthStateChanged === 'function') {
  onAuthStateChanged(function(user) {
    if (user && !user.isAnonymous) {
      resolverPerfilYNegocio(user).catch(function(e) {
        console.error('[DB] Error al inicializar negocio:', e);
      });
    } else {
      var teniaSesion = Boolean(_ultimoUidConocido);
      limpiarNegocio(teniaSesion);
    }
  });
}

/* Exponer en window */
window.getDb                       = getDb;
window.getCurrentNegocioId         = getCurrentNegocioId;
window.getCurrentNegocio           = getCurrentNegocio;
window.getCurrentPerfil            = getCurrentPerfil;
window.onNegocioChanged            = onNegocioChanged;
window.resolverPerfilYNegocio      = resolverPerfilYNegocio;
window.limpiarNegocio              = limpiarNegocio;
window.limpiarDatosLocales         = limpiarDatosLocales;
window.dbGuardarCotizacion         = dbGuardarCotizacion;
window.dbBorrarCotizacion          = dbBorrarCotizacion;
window.dbGuardarRollo              = dbGuardarRollo;
window.dbBorrarRollo               = dbBorrarRollo;
window.dbGuardarCliente            = dbGuardarCliente;
window.dbBorrarCliente             = dbBorrarCliente;
window.dbGuardarImpresora          = dbGuardarImpresora;
window.dbBorrarImpresora           = dbBorrarImpresora;
window.dbGuardarMaterial           = dbGuardarMaterial;
window.dbBorrarMaterial            = dbBorrarMaterial;
window.dbGuardarProducto           = dbGuardarProducto;
window.dbBorrarProducto            = dbBorrarProducto;
window.dbGuardarAjustes            = dbGuardarAjustes;
window.dbGuardarEstiloCotizacion   = dbGuardarEstiloCotizacion;
window.dbNotificarEscritura        = dbNotificarEscritura;
window.dbVaciarPendientes          = dbVaciarPendientes;
window.subirDatosLocales           = subirDatosLocales;
