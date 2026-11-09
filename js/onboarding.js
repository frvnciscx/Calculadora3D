/* ===== ACCESO Y ONBOARDING =================================================

   Dos pantallas que viven en la misma capa (#auth-gate), encima de la app:

     1. Acceso y Registro — mientras no haya sesión
     2. Introducción        — la primera vez que alguien entra

   El flujo lo decide _actualizarGate(), que se ejecuta cada vez que cambia
   la sesión. Esa función es la única que decide qué se ve; las demás solo
   pintan. Tener un único lugar que decide evita el error clásico de que dos
   partes del código muestren cosas contradictorias.

   ========================================================================= */

var ONBOARDING_KEY  = 'onboardingDone';
var _obPaso         = 0;

/* ══════════════════════════════════════════════════════════════════
   Contenido de la introducción

   Está separado del código que lo pinta a propósito: para cambiar un
   texto, una ilustración o el orden de los pasos, se edita este arreglo
   y nada más. Agregar un paso es agregar un objeto.
   ══════════════════════════════════════════════════════════════════ */
var OB_PASOS = [
  {
    titulo: 'Cobra lo que de verdad cuesta',
    cuerpo: 'Esta app calcula el costo real de cada pieza que imprimes y lo convierte ' +
            'en una cotización lista para enviar.',
    tip:    '<b>El error más común</b> al cotizar impresión 3D es cobrar solo el filamento. ' +
            'Es la parte más visible y casi nunca la más cara.',
    art: function() {
      return '<svg viewBox="0 0 220 150" fill="none">' +
        '<rect x="30" y="34" width="160" height="92" rx="10" stroke="var(--line)" stroke-width="1.5"/>' +
        '<rect x="46" y="52" width="76" height="8" rx="4" fill="var(--ink-4)"/>' +
        '<rect x="46" y="70" width="52" height="8" rx="4" fill="var(--line)"/>' +
        '<rect x="46" y="94" width="128" height="16" rx="6" fill="var(--accent)"/>' +
        '<text x="110" y="106" font-size="10" font-weight="700" fill="var(--bg)" ' +
          'text-anchor="middle" font-family="monospace">$60.00</text>' +
        '<circle cx="168" cy="56" r="14" fill="var(--accent-tint)"/>' +
        '<text x="168" y="61" font-size="14" text-anchor="middle" fill="var(--accent)">$</text>' +
      '</svg>';
    }
  },
  {
    titulo: 'El filamento es la punta del iceberg',
    cuerpo: 'En una pieza de una hora, el material suele ser menos de la quinta parte ' +
            'del costo. Lo que pesa son las horas de máquina.',
    tip:    'Cada pieza carga su parte de <b>gastos fijos</b>, depreciación de la impresora, ' +
            'consumibles, mantenimiento y un margen por fallas.',
    art: function() {
      /* Barra apilada con la composición real de un marco de 0.91 h */
      var rubros = [
        { w: 29, c: 'var(--ink)',          l: 'Material' },
        { w: 14, c: 'var(--ink-3)',        l: 'Deprec.'  },
        { w: 53, c: 'var(--accent)',       l: 'Fijos'    },
        { w: 13, c: 'var(--accent-mint)',  l: 'Indir.'   },
        { w:  5, c: 'var(--ink-4)',        l: 'Mant.'    },
        { w: 21, c: 'var(--line)',         l: 'Merma'    }
      ];
      var x = 20, barras = '';
      rubros.forEach(function(r) {
        barras += '<rect x="' + x + '" y="54" width="' + (r.w - 2) + '" height="44" rx="3" fill="' + r.c + '"/>';
        x += r.w;
      });
      return '<svg viewBox="0 0 220 150" fill="none">' +
        '<text x="20" y="42" font-size="9" fill="var(--ink-4)" font-family="monospace">COSTO DE UNA PIEZA</text>' +
        barras +
        '<text x="22" y="118" font-size="9" fill="var(--ink-3)" font-family="monospace">material 17%</text>' +
        '<text x="198" y="118" font-size="9" fill="var(--accent)" text-anchor="end" font-family="monospace">fijos 50%</text>' +
      '</svg>';
    }
  },
  {
    titulo: 'Configura una vez',
    cuerpo: 'Tus impresoras, materiales y gastos del mes. Es lo único que hay que ' +
            'capturar antes de empezar a cotizar.',
    tip:    'El dato que más mueve tus precios son las <b>horas de impresión al mes</b>. ' +
            'Si imprimes la mitad de lo que crees, cada pieza cuesta el doble en gastos fijos.',
    art: function() {
      var filas = ['Impresoras', 'Materiales', 'Gastos fijos', 'Gastos indirectos'];
      var y = 34, out = '';
      filas.forEach(function(f, i) {
        out += '<rect x="24" y="' + y + '" width="172" height="24" rx="6" ' +
               'stroke="var(--line)" stroke-width="1" fill="none"/>' +
               '<circle cx="38" cy="' + (y + 12) + '" r="5" fill="' +
                 (i < 3 ? 'var(--accent)' : 'var(--line)') + '"/>' +
               '<rect x="52" y="' + (y + 8) + '" width="' + (60 + i * 16) + '" height="7" rx="3" fill="var(--ink-4)"/>';
        y += 30;
      });
      return '<svg viewBox="0 0 220 150" fill="none">' + out + '</svg>';
    }
  },
  {
    titulo: 'Del slicer a la cotización',
    cuerpo: 'Copia el peso y el tiempo que te da tu slicer. La calculadora hace el resto ' +
            'y puedes juntar varias piezas en una sola orden.',
    tip:    'Usa el <b>Total</b> del slicer, no solo el peso del modelo: incluye la purga ' +
            'y la torre de limpieza, que también pagas.',
    art: function() {
      return '<svg viewBox="0 0 220 150" fill="none">' +
        '<rect x="14" y="48" width="56" height="54" rx="8" stroke="var(--line)" stroke-width="1.5"/>' +
        '<text x="42" y="72" font-size="9" fill="var(--ink-3)" text-anchor="middle" font-family="monospace">13.42 g</text>' +
        '<text x="42" y="86" font-size="9" fill="var(--ink-3)" text-anchor="middle" font-family="monospace">0.91 h</text>' +
        '<path d="M76 75 L94 75" stroke="var(--ink-4)" stroke-width="1.5"/>' +
        '<path d="M90 71 L94 75 L90 79" stroke="var(--ink-4)" stroke-width="1.5" fill="none"/>' +
        '<rect x="100" y="48" width="56" height="54" rx="8" fill="var(--accent-tint)" stroke="var(--accent)" stroke-width="1.5"/>' +
        '<text x="128" y="79" font-size="13" font-weight="700" fill="var(--accent)" text-anchor="middle" font-family="monospace">$60</text>' +
        '<path d="M162 75 L180 75" stroke="var(--ink-4)" stroke-width="1.5"/>' +
        '<path d="M176 71 L180 75 L176 79" stroke="var(--ink-4)" stroke-width="1.5" fill="none"/>' +
        '<rect x="186" y="54" width="22" height="42" rx="4" stroke="var(--line)" stroke-width="1.5"/>' +
        '<rect x="191" y="62" width="12" height="3" rx="1.5" fill="var(--ink-4)"/>' +
        '<rect x="191" y="70" width="12" height="3" rx="1.5" fill="var(--ink-4)"/>' +
        '<rect x="191" y="78" width="8" height="3" rx="1.5" fill="var(--accent)"/>' +
        '<text x="42" y="120" font-size="8" fill="var(--ink-4)" text-anchor="middle">SLICER</text>' +
        '<text x="128" y="120" font-size="8" fill="var(--ink-4)" text-anchor="middle">CALCULADORA</text>' +
        '<text x="197" y="120" font-size="8" fill="var(--ink-4)" text-anchor="middle">PDF</text>' +
      '</svg>';
    }
  },
  {
    titulo: 'Al aceptar, todo se mueve solo',
    cuerpo: 'Marcas la cotización como aceptada y el inventario se descuenta, el ingreso ' +
            'entra al panel y el margen del mes se recalcula.',
    tip:    'El panel te dice tu <b>margen real</b>, no el que configuraste. ' +
            'Suelen ser distintos por el redondeo de precios.',
    art: function() {
      return '<svg viewBox="0 0 220 150" fill="none">' +
        '<circle cx="110" cy="52" r="18" fill="var(--accent-tint)"/>' +
        '<path d="M102 52 L108 58 L119 46" stroke="var(--accent)" stroke-width="2.5" ' +
          'fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M110 74 L110 84" stroke="var(--line)" stroke-width="1.5"/>' +
        '<path d="M50 84 L170 84" stroke="var(--line)" stroke-width="1.5"/>' +
        '<path d="M50 84 L50 94 M110 84 L110 94 M170 84 L170 94" stroke="var(--line)" stroke-width="1.5"/>' +
        '<rect x="20" y="94" width="60" height="30" rx="6" stroke="var(--line)" stroke-width="1"/>' +
        '<text x="50" y="113" font-size="8" fill="var(--ink-3)" text-anchor="middle">Inventario</text>' +
        '<rect x="80" y="94" width="60" height="30" rx="6" stroke="var(--line)" stroke-width="1"/>' +
        '<text x="110" y="113" font-size="8" fill="var(--ink-3)" text-anchor="middle">Ingresos</text>' +
        '<rect x="140" y="94" width="60" height="30" rx="6" stroke="var(--line)" stroke-width="1"/>' +
        '<text x="170" y="113" font-size="8" fill="var(--ink-3)" text-anchor="middle">Margen</text>' +
      '</svg>';
    }
  }
];

/* ══════════════════════════════════════════════════════════════════
   Control de flujo — el único lugar que decide qué pantalla se ve
   ══════════════════════════════════════════════════════════════════ */

function _actualizarGate() {
  var gate = document.getElementById('auth-gate');
  if (!gate) return;

  if (!isSignedIn()) {
    gate.classList.remove('hidden');
    _pintarAcceso();
    return;
  }
  if (!ld(ONBOARDING_KEY, false)) {
    gate.classList.remove('hidden');
    _obPaso = 0;
    _pintarOnboarding();
    return;
  }
  gate.classList.add('hidden');
  gate.innerHTML = '';
  _reflejarUsuario();
}

/* Pone el nombre del usuario donde corresponda */
function _reflejarUsuario() {
  var u = getCurrentUser();
  if (!u) return;
  var el = document.getElementById('dash-user-name');
  if (el && !config.bizName && u.displayName) {
    el.textContent = u.displayName.split(' ')[0];
  }
  /* La cuenta, abajo de la barra lateral, junto a «Cerrar sesión» */
  var cuenta = document.getElementById('sidebar-cuenta');
  if (cuenta) cuenta.textContent = u.email || u.displayName || 'Sin cuenta';
}

/* ══════════════════════════════════════════════════════════════════
   Pantalla de acceso y registro
   ══════════════════════════════════════════════════════════════════ */

var _authModo = 'login'; /* 'login' | 'registro' */

function cambiarModoAuth(modo) {
  _authModo = modo;
  _errorAcceso('');
  _pintarAcceso();
}

/* ── Recordar contraseña ───────────────────────────────────────────
   La contraseña la guarda el administrador de contraseñas del navegador o
   del teléfono, nunca la app. Por eso los campos van en un <form> con
   autocomplete: así el navegador ofrece guardarla y la llena la próxima vez.
   La app solo recuerda el correo, para que aparezca escrito al volver. */
var _CLAVE_RECORDAR = 'c3d_recordarContrasena';
var _CLAVE_CORREO   = 'c3d_correoRecordado';

function _quiereRecordar() {
  try { return localStorage.getItem(_CLAVE_RECORDAR) !== 'false'; } catch (e) { return true; }
}

function _recordarAcceso(email, pass, recordar) {
  try {
    localStorage.setItem(_CLAVE_RECORDAR, recordar ? 'true' : 'false');
    if (recordar) localStorage.setItem(_CLAVE_CORREO, email);
    else localStorage.removeItem(_CLAVE_CORREO);
  } catch (e) {}
  /* Chrome y Android: pide guardarla en su administrador de contraseñas.
     Safari no tiene esta función; ahí la ofrece el llavero al enviar el formulario. */
  if (recordar && window.PasswordCredential && navigator.credentials && navigator.credentials.store) {
    try {
      navigator.credentials.store(new PasswordCredential({ id: email, password: pass })).catch(function() {});
    } catch (e) {}
  }
}

/* El ojo junto a la contraseña: la muestra u oculta */
function alternarContrasena(id, boton) {
  var campo = document.getElementById(id);
  if (!campo || !boton) return;
  var mostrar = campo.type === 'password';
  campo.type = mostrar ? 'text' : 'password';
  boton.setAttribute('aria-pressed', mostrar ? 'true' : 'false');
  boton.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
  boton.title = mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña';
  var icono = boton.querySelector('.material-symbols-rounded');
  if (icono) icono.textContent = mostrar ? 'visibility_off' : 'visibility';
}

function _campoContrasena(id, nombre, etiqueta, autocompletar) {
  return '<div class="m3-field campo-contrasena">' +
      '<input type="password" id="' + id + '" name="' + nombre + '" placeholder=" " autocomplete="' + autocompletar + '">' +
      '<label for="' + id + '">' + etiqueta + '</label>' +
      '<button type="button" class="ver-contrasena" aria-label="Mostrar contraseña" aria-pressed="false" ' +
              'title="Mostrar contraseña" onclick="alternarContrasena(\'' + id + '\', this)">' +
        '<span class="material-symbols-rounded" aria-hidden="true">visibility</span>' +
      '</button>' +
    '</div>';
}

function _pintarAcceso() {
  var gate = document.getElementById('auth-gate');
  if (!gate) return;
  var esRegistro = _authModo === 'registro';

  gate.innerHTML =
    '<div class="gate-inner">' +
      '<div class="gate-brand">' +
        '<div class="gate-logo"><span class="material-symbols-rounded">home_work</span></div>' +
        '<div class="gate-title">La Casita del Molde</div>' +
        '<div class="gate-sub">' + (esRegistro ? 'Crea tu cuenta para guardar tus cotizaciones' : 'Calculadora de costos e impresión 3D') + '</div>' +
      '</div>' +

      /* novalidate: los avisos los da la app, no el navegador */
      '<form id="auth-form" novalidate onsubmit="event.preventDefault();' + (esRegistro ? 'registrarConCorreo()' : 'entrarConCorreo()') + '">' +
        (esRegistro ?
          '<div class="m3-field">' +
            '<input type="text" id="auth-name" name="name" placeholder=" " autocomplete="name">' +
            '<label for="auth-name">Nombre o Taller</label>' +
          '</div>' : '') +

        '<div class="m3-field">' +
          '<input type="email" id="auth-email" name="email" placeholder=" " autocomplete="username" inputmode="email">' +
          '<label for="auth-email">Correo</label>' +
        '</div>' +

        _campoContrasena('auth-pass', 'password', 'Contraseña (mínimo 6 caracteres)',
                         esRegistro ? 'new-password' : 'current-password') +

        (esRegistro ?
          _campoContrasena('auth-pass-confirm', 'password-confirm', 'Confirmar contraseña', 'new-password') : '') +

        '<div class="gate-fila">' +
          '<label class="gate-recordar">' +
            '<input type="checkbox" id="auth-recordar"' + (_quiereRecordar() ? ' checked' : '') + '>' +
            '<span>Recordar contraseña</span>' +
          '</label>' +
          (esRegistro ? '' :
            '<button type="button" class="gate-enlace" id="auth-olvido" onclick="recuperarContrasena()">' +
              '¿Olvidaste tu contraseña?' +
            '</button>') +
        '</div>' +

        '<div class="gate-error" id="auth-error" aria-live="polite"></div>' +

        '<button type="submit" class="btn btn-primary" style="width:100%" id="auth-submit">' +
          (esRegistro ? 'Crear cuenta' : 'Entrar') +
        '</button>' +
      '</form>' +

      (esRegistro ?
        '<button class="btn btn-ghost" style="width:100%;margin-top:10px" onclick="cambiarModoAuth(\'login\')">' +
          '¿Ya tienes cuenta? <strong style="margin-left:4px">Inicia sesión</strong>' +
        '</button>' :
        '<button class="btn btn-ghost" style="width:100%;margin-top:10px" onclick="cambiarModoAuth(\'registro\')">' +
          '¿No tienes cuenta? <strong style="margin-left:4px">Regístrate aquí</strong>' +
        '</button>'
      ) +

      '<div class="gate-or">o</div>' +

      '<button class="btn btn-ghost" style="width:100%;margin-bottom:10px" onclick="entrarConGoogle()">' +
        '<span class="material-symbols-rounded" style="font-size:16px">account_circle</span> ' +
        'Continuar con Google' +
      '</button>' +

      '<button class="btn btn-ghost" style="width:100%" onclick="entrarSinCuenta()">' +
        'Entrar sin cuenta' +
      '</button>' +
    '</div>';

  /* El correo recordado, puesto con .value y no dentro del HTML */
  if (!esRegistro && _quiereRecordar()) {
    var correo = '';
    try { correo = localStorage.getItem(_CLAVE_CORREO) || ''; } catch (e) {}
    var campoCorreo = document.getElementById('auth-email');
    if (correo && campoCorreo) campoCorreo.value = correo;
  }
}

function _errorAcceso(msg) {
  var el = document.getElementById('auth-error');
  if (!el) return;
  el.classList.remove('ok');
  el.textContent = msg || '';
}

/* Un aviso que no es error (mismo lugar, otro color) */
function _avisoAcceso(msg) {
  var el = document.getElementById('auth-error');
  if (!el) return;
  el.classList.add('ok');
  el.textContent = msg || '';
}

/* ¿Olvidaste tu contraseña? Firebase manda un correo con un enlace para poner
   una nueva. Es una función que Firebase Auth ya trae: no cambia nada en
   Firebase ni en js/auth.js. */
function recuperarContrasena() {
  _errorAcceso('');
  var campo = document.getElementById('auth-email');
  var email = ((campo || {}).value || '').trim();
  if (!email) {
    _errorAcceso('Escribe tu correo arriba y vuelve a tocar «¿Olvidaste tu contraseña?»');
    if (campo) campo.focus();
    return;
  }
  if (typeof firebase === 'undefined' || !firebase.auth) {
    _errorAcceso('No hay conexión con el servidor. Inténtalo con internet.');
    return;
  }
  var boton = document.getElementById('auth-olvido');
  if (boton) boton.disabled = true;
  var auth = firebase.auth();
  auth.languageCode = 'es';   /* el correo llega en español */
  auth.sendPasswordResetEmail(email)
    .then(function() {
      /* Firebase no dice si la cuenta existe, para no revelar qué correos tienen cuenta */
      _avisoAcceso('Si hay una cuenta con ' + email + ', te llegará un correo para poner una contraseña nueva. ' +
                   'Revisa también el correo no deseado.');
    })
    .catch(function(err) {
      _errorAcceso(typeof translateAuthError === 'function'
        ? translateAuthError(err).message
        : 'No se pudo enviar el correo. Inténtalo de nuevo.');
    })
    .then(function() { if (boton) boton.disabled = false; });
}

function _cargando(activo, texto) {
  var btn = document.getElementById('auth-submit');
  if (!btn) return;
  btn.disabled = activo;
  btn.textContent = activo ? (texto || 'Entrando…') : (_authModo === 'registro' ? 'Crear cuenta' : 'Entrar');
  btn.style.opacity = activo ? '0.6' : '';
}

function entrarConCorreo() {
  _errorAcceso('');
  var email = ((document.getElementById('auth-email') || {}).value || '').trim();
  var pass  = (document.getElementById('auth-pass')  || {}).value || '';
  var recordar = !!(document.getElementById('auth-recordar') || {}).checked;

  if (!email) {
    _errorAcceso('Ingresa tu correo electrónico');
    return;
  }
  if (!pass) {
    _errorAcceso('Ingresa tu contraseña');
    return;
  }

  _cargando(true, 'Iniciando sesión…');
  signInWithEmailAndPassword({
    email:    email,
    password: pass
  })
  .then(function() {
    _recordarAcceso(email, pass, recordar);
    _actualizarGate();
  })
  .catch(function(err) {
    _cargando(false);
    _errorAcceso(err.message || 'No se pudo iniciar sesión');
    if (typeof haptic === 'function') haptic('error');
  });
}

function registrarConCorreo() {
  _errorAcceso('');
  var nameEl     = document.getElementById('auth-name');
  var emailEl    = document.getElementById('auth-email');
  var passEl     = document.getElementById('auth-pass');
  var passConfEl = document.getElementById('auth-pass-confirm');

  var name     = nameEl ? nameEl.value.trim() : '';
  var email    = emailEl ? emailEl.value.trim() : '';
  var pass     = passEl ? passEl.value : '';
  var passConf = passConfEl ? passConfEl.value : '';
  var recordar = !!(document.getElementById('auth-recordar') || {}).checked;

  if (!email) {
    _errorAcceso('Ingresa tu correo electrónico');
    if (emailEl) emailEl.focus();
    return;
  }
  if (!pass || pass.length < 6) {
    _errorAcceso('La contraseña debe tener al menos 6 caracteres');
    if (passEl) passEl.focus();
    return;
  }
  if (pass !== passConf) {
    _errorAcceso('Las contraseñas no coinciden');
    if (passConfEl) passConfEl.focus();
    return;
  }

  _cargando(true, 'Creando cuenta…');
  createUserWithEmailAndPassword({
    email:       email,
    password:    pass,
    displayName: name || email.split('@')[0]
  })
  .then(function() {
    if (name && typeof config !== 'undefined' && !config.bizName) {
      config.bizName = name;
      if (typeof sv === 'function') sv('config', config);
    }
    _recordarAcceso(email, pass, recordar);
    _actualizarGate();
  })
  .catch(function(err) {
    _cargando(false);
    _errorAcceso(err.message || 'No se pudo crear la cuenta');
    if (typeof haptic === 'function') haptic('error');
  });
}

function entrarConGoogle() {
  _errorAcceso('');
  _cargando(true, 'Conectando…');
  signInWithGoogle()
    .then(function() { _actualizarGate(); })
    .catch(function(err) {
      _cargando(false);
      _errorAcceso(err.message || 'No se pudo conectar con Google');
    });
}

function entrarSinCuenta() {
  _errorAcceso('');
  _cargando(true, 'Entrando…');
  signInAnonymously()
    .then(function() { _actualizarGate(); })
    .catch(function(err) {
      _cargando(false);
      _errorAcceso(err.message || 'No se pudo entrar como invitado');
    });
}

function cerrarSesion() {
  m3Confirm('¿Cerrar sesión?', function() {
    /* Los ajustes esperan 0.8 s antes de subir: que suban ya, antes de esperar lo pendiente */
    if (typeof dbVaciarPendientes === 'function') dbVaciarPendientes();
    var checkWrites = Promise.resolve();
    var db = (typeof getDb === 'function') ? getDb() : null;
    if (db && typeof db.waitForPendingWrites === 'function') {
      var timeout = new Promise(function(_, reject) {
        setTimeout(function() { reject(new Error('timeout')); }, 2500);
      });
      checkWrites = Promise.race([db.waitForPendingWrites(), timeout]);
    }

    checkWrites.then(function() {
      return signOut();
    }).catch(function() {
      if (!navigator.onLine) {
        snack('Tienes cambios pendientes y no hay conexión. Conéctate antes de cerrar sesión para no perder datos.');
        return;
      }
      return signOut();
    }).then(function() {
      if (typeof _actualizarGate === 'function') _actualizarGate();
    });
  }, {
    confirmLabel: 'Cerrar sesión',
    icon: 'logout',
    detail: 'Tus cotizaciones, clientes e inventario están guardados en tu cuenta en la nube. ' +
            'Al cerrar sesión se limpiarán de este dispositivo para proteger tu privacidad.'
  });
}

/* ══════════════════════════════════════════════════════════════════
   Introducción
   ══════════════════════════════════════════════════════════════════ */

function _pintarOnboarding() {
  var p       = OB_PASOS[_obPaso];
  var ultimo  = _obPaso === OB_PASOS.length - 1;

  var puntos = OB_PASOS.map(function(_, i) {
    return '<div class="ob-dot' + (i === _obPaso ? ' active' : '') + '"></div>';
  }).join('');

  document.getElementById('auth-gate').innerHTML =
    '<button class="ob-skip" onclick="terminarOnboarding()">' +
      (ultimo ? '' : 'Saltar') +
    '</button>' +
    '<div class="gate-inner">' +
      '<div class="ob-step">' +
        '<div class="ob-art">' + p.art() + '</div>' +
        '<div class="ob-title">' + p.titulo + '</div>' +
        '<div class="ob-body">' + p.cuerpo + '</div>' +
        (p.tip ? '<div class="ob-tip">' + p.tip + '</div>' : '') +
      '</div>' +
      '<div class="ob-dots">' + puntos + '</div>' +
      '<div class="ob-actions">' +
        (_obPaso > 0
          ? '<button class="btn btn-ghost" onclick="obAnterior()">Atrás</button>'
          : '') +
        '<button class="btn btn-primary" onclick="' +
          (ultimo ? 'terminarOnboarding()' : 'obSiguiente()') + '">' +
          (ultimo ? 'Empezar' : 'Siguiente') +
        '</button>' +
      '</div>' +
    '</div>';
}

function obSiguiente() {
  if (_obPaso < OB_PASOS.length - 1) { _obPaso++; _pintarOnboarding(); }
}

function obAnterior() {
  if (_obPaso > 0) { _obPaso--; _pintarOnboarding(); }
}

function terminarOnboarding() {
  sv(ONBOARDING_KEY, true);
  _actualizarGate();
  if (typeof renderDashboard === 'function') renderDashboard();
}

/** Permite volver a ver la introducción desde Ajustes. */
function verOnboardingDeNuevo() {
  _obPaso = 0;
  document.getElementById('auth-gate').classList.remove('hidden');
  _pintarOnboarding();
}

/* ══════════════════════════════════════════════════════════════════
   Arranque
   ══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
  /* onAuthStateChanged se dispara de inmediato con el estado actual,
     así que esto también cubre el arranque en frío. */
  if (typeof onAuthStateChanged === 'function') {
    onAuthStateChanged(function() { _actualizarGate(); });
  } else {
    _actualizarGate();
  }
});
