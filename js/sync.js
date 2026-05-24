/* ===== SYNC — Calc3D =====
   Snapshot bidireccional con Notion DB "App State — Calc3D".
   - pushSync()  : sube estado completo a Notion (debounced 3s)
   - pullSync()  : baja el snapshot más reciente y lo aplica si es más nuevo
   - schedulePush(): llama pushSync con debounce (usar en sv())
   ========================== */

var _syncPushTimer  = null;
var _syncInProgress = false;
var _syncVersion    = parseInt(lv('syncVersion') || '0', 10);

/* ── Trigger con debounce ────────────────────────────────────── */
function schedulePush() {
  clearTimeout(_syncPushTimer);
  _syncPushTimer = setTimeout(pushSync, 3000);
}

/* ── Push completo ───────────────────────────────────────────── */
function pushSync() {
  if (_syncInProgress) return;
  _syncInProgress = true;
  _syncVersion++;
  sv('syncVersion', _syncVersion);

  _setSyncIcon('syncing');

  var state = {
    quotes:       quotes,
    clients:      clients,
    inventory:    inventory,
    materials:    materials,
    config:       config,
    quoteStyle:   quoteStyle,
    quoteCounter: quoteCounter,
    syncedAt:     new Date().toISOString(),
  };

  fetch('/api/sync/push', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ state: state, device: _deviceName(), version: _syncVersion }),
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    _syncInProgress = false;
    _setSyncIcon(d.ok ? 'ok' : 'error');
  })
  .catch(function() {
    _syncInProgress = false;
    _setSyncIcon('error');
  });
}

/* ── Pull y aplicar si es más nuevo ─────────────────────────── */
function pullSync(onDone) {
  _setSyncIcon('syncing');

  fetch('/api/sync/pull')
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (!d.ok || !d.state) {
      _setSyncIcon('ok');
      if (onDone) onDone(false);
      return;
    }

    var remote    = d.state;
    var remoteAt  = remote.syncedAt ? new Date(remote.syncedAt).getTime() : 0;
    var localAt   = config._syncedAt ? new Date(config._syncedAt).getTime() : 0;

    if (remoteAt <= localAt) {
      /* Local es igual o más nuevo — no pisar */
      _setSyncIcon('ok');
      if (onDone) onDone(false);
      return;
    }

    /* Aplicar estado remoto */
    if (Array.isArray(remote.quotes))    { quotes    = remote.quotes;    sv('quotes',    quotes);    }
    if (Array.isArray(remote.clients))   { clients   = remote.clients;   sv('clients',   clients);   }
    if (Array.isArray(remote.inventory)) { inventory = remote.inventory; sv('inventory', inventory); }
    if (Array.isArray(remote.materials)) { materials = remote.materials; sv('materials', materials); }
    if (remote.config)     { config     = Object.assign({}, DEF_CONFIG, remote.config); sv('config', config); }
    if (remote.quoteStyle) { quoteStyle = remote.quoteStyle; sv('quoteStyle', quoteStyle); }
    if (typeof remote.quoteCounter === 'number') { quoteCounter = remote.quoteCounter; sv('quoteCounter', quoteCounter); }

    /* Marcar timestamp local */
    config._syncedAt = remote.syncedAt;
    sv('config', config);

    _setSyncIcon('ok');
    snack('Sincronizado desde ' + (d.device || 'otro dispositivo') + ' ✓');
    if (onDone) onDone(true); /* true = se aplicaron cambios */
  })
  .catch(function() {
    _setSyncIcon('error');
    if (onDone) onDone(false);
  });
}

/* ── Manual desde Config ─────────────────────────────────────── */
function manualSync() {
  snack('Sincronizando…');
  pullSync(function(applied) {
    if (applied) {
      /* Re-renderizar todo */
      if (typeof renderDashboard  === 'function') renderDashboard();
      if (typeof renderQuotes     === 'function') renderQuotes();
      if (typeof renderClients    === 'function') renderClients();
      if (typeof renderInventory  === 'function') renderInventory();
    } else {
      snack('Ya est\xe1s al d\xeda');
      pushSync(); /* subir local por si el otro dispositivo no tiene lo m\xe1s nuevo */
    }
  });
}

/* ── Helpers ─────────────────────────────────────────────────── */
function _deviceName() {
  var ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua))   return 'iOS';
  if (/Android/.test(ua))       return 'Android';
  if (/Windows/.test(ua))       return 'Windows';
  if (/Mac/.test(ua))           return 'Mac';
  return 'Web';
}

function _setSyncIcon(state) {
  var el = document.getElementById('sync-indicator');
  if (!el) return;
  var map = {
    syncing: { icon: 'sync',       color: 'var(--ink-3)',  spin: true  },
    ok:      { icon: 'cloud_done', color: 'var(--ok)',     spin: false },
    error:   { icon: 'cloud_off',  color: 'var(--danger)', spin: false },
  };
  var s = map[state] || map.error;
  el.textContent = s.icon;
  el.style.color = s.color;
  el.style.animation = s.spin ? 'spin 1s linear infinite' : '';
}
