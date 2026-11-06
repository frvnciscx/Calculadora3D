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
        iniciarSincronizacionNegocio();
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
      iniciarSincronizacionNegocio();
      _verificarMigracionInicial();
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
  localStorage.removeItem('c3d_draftQuote');
  localStorage.removeItem('c3d_quoteCounter');
  try { sessionStorage.removeItem('c3d_lastCalc'); } catch (e) {}

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

/* ── Sincronización en tiempo real con Firestore ─────────────────── */
function iniciarSincronizacionNegocio() {
  if (!currentNegocioId || !_db) return;
  _detenerSincronizacion();

  var negRef = _db.collection('negocios').doc(currentNegocioId);

  /* 1. Cotizaciones */
  var unsubQuotes = negRef.collection('cotizaciones').onSnapshot(function(snap) {
    var remoteQuotes = [];
    snap.forEach(function(doc) {
      var q = doc.data();
      q.id = doc.id;
      remoteQuotes.push(q);
    });
    remoteQuotes.sort(function(a, b) {
      return new Date(b.quoteDate || 0) - new Date(a.quoteDate || 0);
    });
    quotes = remoteQuotes;
    sv('quotes', quotes);
    if (typeof renderQuotes === 'function') renderQuotes();
    if (typeof renderDashboard === 'function') renderDashboard();
  }, function(err) { console.warn('[DB] Sync cotizaciones:', err); });
  _dbUnsubs.push(unsubQuotes);

  /* 2. Clientes */
  var unsubClients = negRef.collection('clientes').onSnapshot(function(snap) {
    var remoteClients = [];
    snap.forEach(function(doc) {
      var c = doc.data();
      c.id = doc.id;
      remoteClients.push(c);
    });
    clients = remoteClients;
    sv('clients', clients);
    if (typeof renderClients === 'function') renderClients();
  }, function(err) { console.warn('[DB] Sync clientes:', err); });
  _dbUnsubs.push(unsubClients);

  /* 3. Rollos (Inventario) */
  var unsubRollos = negRef.collection('rollos').onSnapshot(function(snap) {
    var remoteRollos = [];
    snap.forEach(function(doc) {
      var r = doc.data();
      r.id = doc.id;
      remoteRollos.push(r);
    });
    inventory = remoteRollos;
    sv('inventory', inventory);
    if (typeof renderInventory === 'function') renderInventory();
  }, function(err) { console.warn('[DB] Sync rollos:', err); });
  _dbUnsubs.push(unsubRollos);

  /* 4. Impresoras */
  var unsubPrinters = negRef.collection('impresoras').onSnapshot(function(snap) {
    if (!snap.empty) {
      var remotePrinters = [];
      snap.forEach(function(doc) {
        var p = doc.data();
        p.id = doc.id;
        remotePrinters.push(p);
      });
      printers = remotePrinters;
      sv('printers', printers);
    } else {
      /* Negocio sin impresoras guardadas aún: usar base estándar */
      if (typeof DEF_PRINTERS !== 'undefined') {
        printers = DEF_PRINTERS.map(function(p) { return Object.assign({}, p); });
        sv('printers', printers);
      }
    }
    if (typeof populateSelects === 'function') populateSelects();
    if (typeof renderPrinters === 'function') renderPrinters();
  }, function(err) { console.warn('[DB] Sync impresoras:', err); });
  _dbUnsubs.push(unsubPrinters);

  /* 5. Materiales */
  var unsubMaterials = negRef.collection('materiales').onSnapshot(function(snap) {
    if (!snap.empty) {
      var remoteMaterials = [];
      snap.forEach(function(doc) {
        var m = doc.data();
        m.id = doc.id;
        remoteMaterials.push(m);
      });
      materials = remoteMaterials;
      sv('materials', materials);
    } else {
      /* Negocio sin materiales guardados aún: usar base estándar */
      if (typeof DEF_MATERIALS !== 'undefined') {
        materials = DEF_MATERIALS.map(function(m) { return Object.assign({}, m); });
        sv('materials', materials);
      }
    }
    if (typeof populateSelects === 'function') populateSelects();
    if (typeof renderMaterials === 'function') renderMaterials();
  }, function(err) { console.warn('[DB] Sync materiales:', err); });
  _dbUnsubs.push(unsubMaterials);

  /* 6. Productos frecuentes */
  var unsubProducts = negRef.collection('productos').onSnapshot(function(snap) {
    var remoteProducts = [];
    snap.forEach(function(doc) {
      var p = doc.data();
      p.id = doc.id;
      remoteProducts.push(p);
    });
    catalogItems = remoteProducts;
    sv('catalog', catalogItems);
    if (typeof renderCatalogList === 'function') renderCatalogList();
  }, function(err) { console.warn('[DB] Sync productos:', err); });
  _dbUnsubs.push(unsubProducts);

  /* 7. Ajustes de costeo */
  var unsubConfig = negRef.collection('ajustes').doc('general').onSnapshot(function(doc) {
    if (doc.exists) {
      config = { ...DEF_CONFIG, ...doc.data() };
    } else {
      config = { ...DEF_CONFIG };
      if (currentNegocio && currentNegocio.nombre) {
        config.bizName = currentNegocio.nombre;
      }
    }
    sv('config', config);
    if (typeof updateTopBar === 'function') updateTopBar();
    if (typeof loadConfig === 'function') loadConfig();
  }, function(err) { console.warn('[DB] Sync ajustes:', err); });
  _dbUnsubs.push(unsubConfig);

  /* 8. Estilo de cotización */
  var unsubStyle = negRef.collection('ajustes').doc('documento').onSnapshot(function(doc) {
    if (doc.exists) {
      quoteStyle = { ...DEF_QUOTE_STYLE, ...doc.data() };
    } else {
      quoteStyle = { ...DEF_QUOTE_STYLE };
    }
    sv('quoteStyle', quoteStyle);
  }, function(err) { console.warn('[DB] Sync estilo cotización:', err); });
  _dbUnsubs.push(unsubStyle);
}

/* ── Operaciones de Escritura a Firestore ───────────────────────── */

function dbGuardarCotizacion(q) {
  if (!currentNegocioId || !_db || !q || !q.id) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('cotizaciones').doc(String(q.id)).set(q, { merge: true })
    .catch(function(err) { console.error('[DB] Error guardando cotización:', err); });
}

function dbBorrarCotizacion(quoteId) {
  if (!currentNegocioId || !_db || !quoteId) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('cotizaciones').doc(String(quoteId)).delete()
    .catch(function(err) { console.error('[DB] Error borrando cotización:', err); });
}

function dbGuardarRollo(rollo) {
  if (!currentNegocioId || !_db || !rollo || !rollo.id) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('rollos').doc(String(rollo.id)).set(rollo, { merge: true })
    .catch(function(err) { console.error('[DB] Error guardando rollo:', err); });
}

function dbBorrarRollo(rolloId) {
  if (!currentNegocioId || !_db || !rolloId) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('rollos').doc(String(rolloId)).delete()
    .catch(function(err) { console.error('[DB] Error borrando rollo:', err); });
}

function dbGuardarCliente(c) {
  if (!currentNegocioId || !_db || !c || !c.id) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('clientes').doc(String(c.id)).set(c, { merge: true })
    .catch(function(err) { console.error('[DB] Error guardando cliente:', err); });
}

function dbBorrarCliente(clienteId) {
  if (!currentNegocioId || !_db || !clienteId) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('clientes').doc(String(clienteId)).delete()
    .catch(function(err) { console.error('[DB] Error borrando cliente:', err); });
}

function dbGuardarImpresora(p) {
  if (!currentNegocioId || !_db || !p || !p.id) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('impresoras').doc(String(p.id)).set(p, { merge: true })
    .catch(function(err) { console.error('[DB] Error guardando impresora:', err); });
}

function dbBorrarImpresora(printerId) {
  if (!currentNegocioId || !_db || !printerId) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('impresoras').doc(String(printerId)).delete()
    .catch(function(err) { console.error('[DB] Error borrando impresora:', err); });
}

function dbGuardarMaterial(m) {
  if (!currentNegocioId || !_db || !m || !m.id) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('materiales').doc(String(m.id)).set(m, { merge: true })
    .catch(function(err) { console.error('[DB] Error guardando material:', err); });
}

function dbBorrarMaterial(materialId) {
  if (!currentNegocioId || !_db || !materialId) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('materiales').doc(String(materialId)).delete()
    .catch(function(err) { console.error('[DB] Error borrando material:', err); });
}

function dbGuardarProducto(prod) {
  if (!currentNegocioId || !_db || !prod || !prod.id) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('productos').doc(String(prod.id)).set(prod, { merge: true })
    .catch(function(err) { console.error('[DB] Error guardando producto:', err); });
}

function dbBorrarProducto(prodId) {
  if (!currentNegocioId || !_db || !prodId) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('productos').doc(String(prodId)).delete()
    .catch(function(err) { console.error('[DB] Error borrando producto:', err); });
}

function dbGuardarAjustes(cfg) {
  if (!currentNegocioId || !_db || !cfg) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('ajustes').doc('general').set(cfg, { merge: true })
    .catch(function(err) { console.error('[DB] Error guardando ajustes:', err); });
}

function dbGuardarEstiloCotizacion(style) {
  if (!currentNegocioId || !_db || !style) return Promise.resolve();
  return _db.collection('negocios').doc(currentNegocioId)
    .collection('ajustes').doc('documento').set(style, { merge: true })
    .catch(function(err) { console.error('[DB] Error guardando estilo:', err); });
}

/* Gancho universal para llamadas directas a sv(k, v) */
var _dbSyncTimers = {};
function dbNotificarEscritura(k, v) {
  if (!currentNegocioId || !_db) return;
  if (k === 'config') {
    clearTimeout(_dbSyncTimers['config']);
    _dbSyncTimers['config'] = setTimeout(function() { dbGuardarAjustes(v); }, 800);
  } else if (k === 'quoteStyle') {
    clearTimeout(_dbSyncTimers['quoteStyle']);
    _dbSyncTimers['quoteStyle'] = setTimeout(function() { dbGuardarEstiloCotizacion(v); }, 800);
  }
}

/* ── Migración de datos locales a Firestore (D84, D94) ──────────── */
function subirDatosLocales() {
  if (!currentNegocioId || !_db) {
    return Promise.reject(new Error('No hay sesión o negocio activo para subir datos.'));
  }

  var batch = _db.batch();
  var negRef = _db.collection('negocios').doc(currentNegocioId);

  // 1. Ajustes generales y de documento
  if (typeof config !== 'undefined') {
    batch.set(negRef.collection('ajustes').doc('general'), config, { merge: true });
  }
  if (typeof quoteStyle !== 'undefined') {
    batch.set(negRef.collection('ajustes').doc('documento'), quoteStyle, { merge: true });
  }

  // 2. Impresoras
  if (typeof printers !== 'undefined' && Array.isArray(printers)) {
    printers.forEach(function(p) {
      batch.set(negRef.collection('impresoras').doc(String(p.id)), p, { merge: true });
    });
  }

  // 3. Materiales
  if (typeof materials !== 'undefined' && Array.isArray(materials)) {
    materials.forEach(function(m) {
      batch.set(negRef.collection('materiales').doc(String(m.id)), m, { merge: true });
    });
  }

  // 4. Inventario (Rollos)
  if (typeof inventory !== 'undefined' && Array.isArray(inventory)) {
    inventory.forEach(function(r) {
      batch.set(negRef.collection('rollos').doc(String(r.id)), r, { merge: true });
    });
  }

  // 5. Clientes
  if (typeof clients !== 'undefined' && Array.isArray(clients)) {
    clients.forEach(function(c) {
      batch.set(negRef.collection('clientes').doc(String(c.id)), c, { merge: true });
    });
  }

  // 6. Productos de catálogo
  if (typeof catalogItems !== 'undefined' && Array.isArray(catalogItems)) {
    catalogItems.forEach(function(p) {
      batch.set(negRef.collection('productos').doc(String(p.id)), p, { merge: true });
    });
  }

  // 7. Cotizaciones
  if (typeof quotes !== 'undefined' && Array.isArray(quotes)) {
    quotes.forEach(function(q) {
      batch.set(negRef.collection('cotizaciones').doc(String(q.id)), q, { merge: true });
    });
  }

  return batch.commit().then(function() {
    console.log('[DB] Todos los datos locales subidos con éxito a Firestore.');
    return true;
  });
}

function _verificarMigracionInicial() {
  if (!currentNegocioId) return;
  var tieneDatos = (typeof quotes !== 'undefined' && quotes.length > 0);
  var yaMigrado  = ld('migrado_' + currentNegocioId, false);

  if (tieneDatos && !yaMigrado) {
    setTimeout(function() {
      if (typeof m3Confirm === 'function') {
        m3Confirm('¿Subir tus cotizaciones y catálogos a la nube?', function() {
          if (typeof snack === 'function') snack('Subiendo datos a tu cuenta…');
          subirDatosLocales().then(function() {
            sv('migrado_' + currentNegocioId, true);
            if (typeof snack === 'function') snack('✓ Tus datos ya están en la nube');
          }).catch(function() {
            if (typeof snack === 'function') snack('Error al subir datos a la nube');
          });
        }, {
          confirmLabel: 'Subir a la nube',
          cancelLabel:  'Más tarde',
          icon:         'cloud_upload',
          detail:       'Tienes cotizaciones y catálogos en este dispositivo. ' +
                        'Al subirlos se guardarán en tu cuenta y podrás verlos en cualquier equipo.'
        });
      }
    }, 1200);
  }
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
window.subirDatosLocales           = subirDatosLocales;
