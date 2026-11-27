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
        '<text x="20" y="42" font-size="9" fill="var(--ink-4)">Costo de una pieza</text>' +
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
        '<text x="42" y="120" font-size="8" fill="var(--ink-4)" text-anchor="middle">Slicer</text>' +
        '<text x="128" y="120" font-size="8" fill="var(--ink-4)" text-anchor="middle">Calculadora</text>' +
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
  if (!_onboardingVisto()) {
    gate.classList.remove('hidden');
    _obPaso = 0;
    _pintarOnboarding();
    return;
  }
  gate.classList.add('hidden');
  gate.innerHTML = '';
  _reflejarUsuario();
}

/* La introducción se ve una vez por cuenta (D196), no una vez por equipo:
   antes, una cuenta nueva en un equipo que ya la había visto no la veía. Sin
   cuenta («Entrar sin cuenta»), una vez por equipo, como antes. */
function _claveOnboarding() {
  var u = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  return u && !u.isAnonymous && u.uid ? ONBOARDING_KEY + '_' + u.uid : ONBOARDING_KEY;
}

function _onboardingVisto() {
  var clave = _claveOnboarding();
  if (ld(clave, false)) return true;
  /* Al llegar esta versión, la cuenta que ya estaba abierta en un equipo que
     vio la introducción no la vuelve a ver. Una sola vez por equipo: después,
     cada cuenta nueva la ve. */
  if (clave !== ONBOARDING_KEY && !ld('onboardingPorCuenta', false)) {
    sv('onboardingPorCuenta', true);
    if (ld(ONBOARDING_KEY, false)) { sv(clave, true); return true; }
  }
  return false;
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

  /* Sin cuenta no hay sesión que cerrar: el botón dice «Iniciar sesión» (D226) */
  var invitado = !!u.isAnonymous;
  document.querySelectorAll('.boton-sesion').forEach(function(b) {
    var icono = b.querySelector('.sesion-icono');
    var texto = b.querySelector('.sesion-texto');
    if (icono) icono.textContent = invitado ? 'login' : 'logout';
    if (texto) texto.textContent = invitado ? 'Iniciar sesión' : 'Cerrar sesión';
  });
}

function _esInvitado() {
  var u = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  return !!(u && u.isAnonymous);
}

/* El botón de la sesión, abajo de la barra lateral y en Ajustes del teléfono
   (D226). Sin cuenta («Entrar sin cuenta») abre la pantalla de acceso sin
   borrar nada de este equipo: al entrar, lo configurado sin cuenta pasa a la
   cuenta como dicen D40, D84 y D86. Antes decía «Cerrar sesión» y al tocarlo
   borraba lo del equipo, con un aviso que hablaba de datos en la nube que un
   invitado no tiene. */
function botonDeSesion() {
  if (_esInvitado()) iniciarSesionDesdeInvitado();
  else cerrarSesion();
}

function iniciarSesionDesdeInvitado() {
  var gate = document.getElementById('auth-gate');
  if (!gate) return;
  _authModo = 'login';
  gate.classList.remove('hidden');
  _pintarAcceso();
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

      /* La «G» de Google en sus cuatro colores, como pide Google para sus
         botones de acceso; antes era un ícono genérico de persona (D242) */
      '<button class="btn btn-ghost gate-google" style="width:100%;margin-bottom:10px" onclick="entrarConGoogle()">' +
        '<svg class="gate-google-logo" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true" focusable="false">' +
          '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
          '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
          '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
          '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>' +
        '</svg> ' +
        'Continuar con Google' +
      '</button>' +

      /* Si ya entraste sin cuenta y viniste a iniciar sesión, este botón te
         regresa a la app como estabas (D226) */
      (_esInvitado()
        ? '<button class="btn btn-ghost" style="width:100%" onclick="_actualizarGate()">Seguir sin cuenta</button>'
        : '<button class="btn btn-ghost" style="width:100%" onclick="entrarSinCuenta()">Entrar sin cuenta</button>') +
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
    '<button class="ob-skip" onclick="obIrAConfiguracion()">' +
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
          (ultimo ? 'obIrAConfiguracion()' : 'obSiguiente()') + '">' +
          (ultimo && !_faltaConfigurar() ? 'Empezar' : 'Siguiente') +
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
  sv(_claveOnboarding(), true);
  sv(ONBOARDING_KEY, true);
  _actualizarGate();
  if (typeof renderDashboard === 'function') renderDashboard();
  /* Después de la introducción, el recorrido por la pantalla de verdad (D198).
     También si se saltó: «Saltar» se salta las explicaciones, no dónde está cada cosa. */
  setTimeout(iniciarRecorrido, 350);
}

/* ══════════════════════════════════════════════════════════════════
   Recorrido guiado (D198)

   Señala en la pantalla real dónde está cada cosa: impresoras, ajustes,
   la calculadora y las cotizaciones. Usa Driver.js (licencia MIT, gratuito,
   sin dependencias, parecido a TourGuide.js). Se baja del CDN solo cuando
   se va a mostrar, con la versión fija: quien ya lo vio no lo descarga, y
   sin conexión simplemente no aparece.
   ══════════════════════════════════════════════════════════════════ */
var DRIVER_VERSION  = '1.3.1';
var _driverCargando = null;

function _cargarDriver() {
  if (window.driver && window.driver.js) return Promise.resolve(window.driver.js.driver);
  if (_driverCargando) return _driverCargando;
  var base = 'https://cdn.jsdelivr.net/npm/driver.js@' + DRIVER_VERSION + '/dist/';
  _driverCargando = new Promise(function(resolve, reject) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = base + 'driver.css';
    document.head.appendChild(css);
    var js = document.createElement('script');
    js.src = base + 'driver.js.iife.js';
    js.onload = function() {
      if (window.driver && window.driver.js) resolve(window.driver.js.driver);
      else reject(new Error('Driver.js no se cargó'));
    };
    js.onerror = function() { _driverCargando = null; reject(new Error('Sin conexión al CDN')); };
    document.head.appendChild(js);
  });
  return _driverCargando;
}

/* Los pasos, con lo que se ve: la barra lateral en escritorio, la barra de
   abajo en el teléfono. Un paso cuyo elemento no está a la vista se omite. */
function _pasosRecorrido() {
  var escritorio = window.innerWidth >= 900;
  var q = function(escr, movil) { return document.querySelector(escritorio ? escr : movil); };
  var pasos = [
    { element: q('.sidebar-item[data-tab="printers"]', '.nav-item[data-page="catalog"]'),
      popover: { title: escritorio ? 'Tus impresoras' : 'Impresoras y rollos',
                 description: 'Empieza aquí: cada impresora con su consumo y lo que costó. Puedes elegirlas de una lista.' } },
    { element: escritorio ? document.querySelector('.sidebar-item[data-page="inventory"]') : null,
      popover: { title: 'Inventario',
                 description: 'Tus rollos de filamento. Se descuentan solos al aceptar una cotización.' } },
    { element: q('.sidebar-item[data-page="config"]', '.nav-item[data-page="config"]'),
      popover: { title: 'Ajustes',
                 description: 'Tus materiales y tus gastos fijos e indirectos. Con eso sale el costo real de cada pieza.' } },
    { element: q('.sidebar-item[data-page="calc"]', '#dash-content button[onclick="nuevaCotizacion()"]'),
      popover: { title: 'Cotizar',
                 description: 'Escribe el peso y el tiempo del slicer, o lee su archivo, y te da el precio.' } },
    { element: q('.sidebar-item[data-page="quotes"]', '.nav-item[data-page="quotes"]'),
      popover: { title: 'Tus cotizaciones',
                 description: 'Las mandas por WhatsApp o PDF y les cambias el estado cuando te contestan.' } },
    { element: escritorio ? document.querySelector('.sidebar-item[data-page="ayuda"]') : null,
      popover: { title: 'Ayuda',
                 description: 'Este recorrido y las preguntas de siempre, para cuando los necesites.' } }
  ];
  return pasos.filter(function(p) { return p.element && p.element.offsetParent !== null; })
    .map(function(p) {
      p.popover.side  = escritorio ? 'right' : 'top';
      p.popover.align = escritorio ? 'center' : 'end';
      return p;
    });
}

function iniciarRecorrido() {
  /* Solo con la app a la vista: no encima de la pantalla de acceso */
  var gate = document.getElementById('auth-gate');
  if (gate && !gate.classList.contains('hidden')) return;
  _cargarDriver().then(function(driver) {
    var pasos = _pasosRecorrido();
    if (!pasos.length) return;
    driver({
      steps: pasos,
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: 'Listo',
      popoverClass: 'recorrido',
      overlayOpacity: 0.6,
      stagePadding: 4,
      stageRadius: 10,
      allowClose: true
    }).drive();
  }).catch(function(err) {
    console.warn('[Recorrido] No se mostró:', err && err.message);
  });
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

/* ══════════════════════════════════════════════════════════════════
   Página de Ayuda (D200)
   ══════════════════════════════════════════════════════════════════ */

/* El recorrido empieza en el inicio: en el teléfono, «Cotizar» es un botón de ahí */
function verRecorrido() {
  if (typeof showPage === 'function') showPage('dashboard');
  setTimeout(iniciarRecorrido, 350);
}

/* Sin acentos ni mayúsculas, para que «envio» encuentre «envío» */
function _normalizarAyuda(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filtrarAyuda(texto) {
  var buscado = _normalizarAyuda(texto).trim();
  var visibles = 0;
  document.querySelectorAll('#ayuda-temas .ayuda-tema').forEach(function(t) {
    var si = !buscado || _normalizarAyuda(t.textContent).indexOf(buscado) !== -1;
    t.classList.toggle('hidden', !si);
    if (si) visibles++;
  });
  var nada = document.getElementById('ayuda-nada');
  if (nada) {
    nada.classList.toggle('hidden', visibles > 0);
    nada.textContent = visibles ? '' : 'Nada coincide con «' + String(texto).trim() + '».';
  }
}

/* ══════════════════════════════════════════════════════════════════
   Configurar al empezar (D208, como pedía D88)

   Después de las explicaciones, una cuenta o un equipo sin impresoras ni
   materiales los agrega ahí mismo: primero su impresora (de la lista de
   comunes o «Otra», con sus datos) y luego sus materiales, con lo que le
   cuesta el kilo. «Configurar después» (antes «Ahora no», D255) deja todo para después: el Dashboard y la
   Calculadora lo vuelven a pedir con sus estados vacíos. Quien ya tiene
   impresoras y materiales (o vuelve a ver la introducción) no ve estos pasos.
   ══════════════════════════════════════════════════════════════════ */

function _faltaConfigurar() {
  return !printers.length || !materials.length || _faltanGastos();
}

/* Sin gastos fijos (ni total ni categorías): una cuenta nueva empieza en $0 (D193) */
function _faltanGastos() {
  return !(Number(config.fixedMonthlyCost) > 0) && !((config.fixedCostItems || []).length);
}

/* Cuántos pasos de configuración van y en cuál se está, para «1 de 2» */
function _pasosConfig() {
  var p = [];
  if (!printers.length || _configHizoImpresora) p.push('impresora');
  if (!materials.length || _configHizoMateriales) p.push('materiales');
  if (_faltanGastos() || _configHizoGastos) p.push('gastos');
  return p;
}
var _configHizoImpresora = false, _configHizoMateriales = false, _configHizoGastos = false;

function obIrAConfiguracion() {
  _configHizoImpresora = false;
  _configHizoMateriales = false;
  _configHizoGastos = false;
  _obReiniciarEleccion();
  if (!printers.length) { _pintarConfigImpresora(); return; }
  if (!materials.length) { _pintarConfigMateriales(); return; }
  if (_faltanGastos()) { _pintarConfigGastos(); return; }
  terminarOnboarding();
}

function _cabezaConfig(paso) {
  var pasos = _pasosConfig();
  var n = pasos.indexOf(paso) + 1;
  return (pasos.length > 1 ? '<div class="ob-config-paso micro">Configura · ' + n + ' de ' + pasos.length + '</div>' : '');
}

/* ── Lo que se va eligiendo en la configuración (D210) ────────────────
   Se recuerda mientras dura, para que «Atrás» no lo pierda y para que, al
   volver a guardar un paso, se reemplace lo que ese paso ya había guardado
   en lugar de repetirlo. */
var _obImp    = { comunes: [], propias: [], ids: [] };
var _obMat    = { marcados: null, precios: {}, propios: [], ids: [] };
var _obGastos = null;

function _obReiniciarEleccion() {
  _obImp    = { comunes: [], propias: [], ids: [] };
  _obMat    = { marcados: null, precios: {}, propios: [], ids: [] };
  _obGastos = null;
}

/* La forma de los tres pasos: la lista a la izquierda y, a la derecha, lo
   que se escribe (en el teléfono, debajo) */
function _layoutConfig(paso, titulo, cuerpo, izquierda, derecha, acciones) {
  /* «Configurar después», no «Ahora no»: deja los tres pasos, no solo este,
     y medía 74 × 31 (D255) */
  return '<button class="ob-skip ob-skip-config" onclick="terminarOnboarding()">Configurar después</button>' +
    '<div class="gate-inner ob-config ob-config-ancho">' +
      '<div class="ob-step">' +
        _cabezaConfig(paso) +
        '<div class="ob-title">' + titulo + '</div>' +
        '<div class="ob-body">' + cuerpo + '</div>' +
        '<div class="ob-config-cuerpo">' +
          '<div class="ob-config-izq">' + izquierda + '</div>' +
          '<aside class="ob-config-der">' + derecha + '</aside>' +
        '</div>' +
      '</div>' +
      '<div class="ob-actions">' + acciones + '</div>' +
    '</div>';
}

function _obCampo(id, etiqueta, tipo, extra) {
  return '<div class="m3-field"><input type="' + (tipo || 'text') + '" id="' + id + '" placeholder=" " autocomplete="off"' + (extra || '') + '>' +
    '<label for="' + id + '">' + etiqueta + '</label></div>';
}

function _obVal(id) { return ((document.getElementById(id) || {}).value || '').trim(); }

function _obQuitarBoton(fn, nombre) {
  return '<button type="button" class="ob-quitar" onclick="' + fn + '" aria-label="Quitar ' + esc(nombre) + '">' +
    '<span class="material-symbols-rounded" aria-hidden="true">close</span></button>';
}

/* En el teléfono, lo nuevo se escribe en una hoja que sube desde abajo (D211).
   Va dentro de #auth-gate, que está encima de todo (las hojas de la app
   quedarían debajo). Se cierra con «Cancelar», tocando fuera o con Esc. */
function _obEsMovil() { return window.innerWidth < 900; }

function _obAbrirSheet(titulo, campos, accion) {
  _obCerrarSheet();
  var gate = document.getElementById('auth-gate');
  gate.insertAdjacentHTML('beforeend',
    '<div class="ob-sheet-velo" onclick="_obCerrarSheet()"></div>' +
    '<div class="ob-sheet" role="dialog" aria-modal="true" aria-labelledby="ob-sheet-titulo">' +
      '<div class="ob-sheet-asa" aria-hidden="true"></div>' +
      '<div class="ob-sheet-titulo" id="ob-sheet-titulo">' + titulo + '</div>' +
      campos +
      '<div class="ob-sheet-acciones">' +
        '<button type="button" class="btn btn-ghost" onclick="_obCerrarSheet()">Cancelar</button>' +
        '<button type="button" class="btn btn-primary" onclick="' + accion + '">Agregar</button>' +
      '</div>' +
    '</div>');
  var primero = gate.querySelector('.ob-sheet input');
  if (primero) primero.focus();
  document.addEventListener('keydown', _obEscSheet);
}

function _obEscSheet(e) { if (e.key === 'Escape') _obCerrarSheet(); }

function _obCerrarSheet() {
  document.querySelectorAll('#auth-gate .ob-sheet, #auth-gate .ob-sheet-velo').forEach(function(el) { el.remove(); });
  document.removeEventListener('keydown', _obEscSheet);
}

function _obBotonAgregarMovil(texto, fn) {
  return '<button type="button" class="btn btn-ghost ob-agregar-movil" onclick="' + fn + '">' +
    '<span class="material-symbols-rounded" style="font-size:18px" aria-hidden="true">add</span> ' + texto + '</button>';
}

/* ── Paso 1: las impresoras ─────────────────────────────────────────── */
function _filasImpresoras() {
  var cur = (config && config.currency) || '$';
  var mil = function(n) { return Number(n || 0).toLocaleString('es-MX'); };
  var sub = function(p) {
    return esc(p.type) + ' · ' + p.power + ' W · ' + formatoDinero(p.cost, cur) + (p.multicolor ? ' · ' + p.heads + ' colores' : '');
  };
  return PRINTERS_EJEMPLO.map(function(p, k) {
      var on = _obImp.comunes.indexOf(k) !== -1;
      return '<label class="comunes-fila">' +
        '<input type="checkbox" class="ob-imp" value="' + k + '"' + (on ? ' checked' : '') + ' onchange="_obMarcarImp(this)">' +
        '<span class="comunes-texto"><span class="comunes-nombre">' + esc(p.name) + '</span>' +
          '<span class="comunes-sub">' + sub(p) + '</span></span>' +
      '</label>';
    }).join('') +
    _obImp.propias.map(function(p, i) {
      return '<div class="comunes-fila ob-propia">' +
        '<span class="material-symbols-rounded ob-propia-icono" aria-hidden="true">check_circle</span>' +
        '<span class="comunes-texto"><span class="comunes-nombre">' + esc(p.name) + '<span class="ob-tuya">Tuya</span></span>' +
          '<span class="comunes-sub">' + sub(p) + '</span></span>' +
        _obQuitarBoton('_obQuitarImp(' + i + ')', p.name) +
      '</div>';
    }).join('');
}

function _obMarcarImp(inp) {
  var k = Number(inp.value), i = _obImp.comunes.indexOf(k);
  if (inp.checked && i === -1) _obImp.comunes.push(k);
  if (!inp.checked && i !== -1) _obImp.comunes.splice(i, 1);
}

function _obQuitarImp(i) {
  _obImp.propias.splice(i, 1);
  document.getElementById('ob-lista-imp').innerHTML = _filasImpresoras();
}

function _camposImpresora() {
  var cur = (config && config.currency) || '$';
  return _obCampo('ob-otra-nombre', 'Nombre') +
    '<div class="flex-row">' +
      _obCampo('ob-otra-watts', 'Consumo (W)', 'number', ' min="1" inputmode="decimal"') +
      _obCampo('ob-otra-costo', 'Costo (' + cur + ')', 'number', ' min="0" inputmode="decimal"') +
    '</div>' +
    '<div class="flex-row">' +
      _obCampo('ob-otra-vida', 'Vida útil (h)', 'number', ' min="1" inputmode="decimal" value="3000"') +
      '<div class="m3-field"><select id="ob-otra-tipo"><option value="FDM">FDM</option><option value="Resina">Resina</option></select>' +
        '<label for="ob-otra-tipo">Tipo</label></div>' +
    '</div>';
}

function _obSheetImpresora() {
  _obAbrirSheet('¿No está la tuya?', _camposImpresora(), 'if (obAgregarImpresora()) _obCerrarSheet()');
}

function _pintarConfigImpresora() {
  var movil = _obEsMovil();
  /* Escritorio: el formulario a la derecha. Teléfono: un botón abre la hoja */
  var derecha = movil ? '' :
    '<div class="ob-panel">' +
      '<div class="ob-panel-titulo">¿No está la tuya?</div>' +
      _camposImpresora() +
      '<button type="button" class="btn btn-ghost ob-panel-agregar" onclick="obAgregarImpresora()">' +
        '<span class="material-symbols-rounded" style="font-size:18px" aria-hidden="true">add</span> Agregar impresora</button>' +
    '</div>';
  document.getElementById('auth-gate').innerHTML = _layoutConfig('impresora',
    'Tus impresoras',
    'Marca las tuyas o agrega las que no estén. Su consumo y lo que costaron los cambias después.',
    '<div class="comunes-lista ob-config-lista" id="ob-lista-imp" role="group" aria-label="Impresoras">' + _filasImpresoras() + '</div>' +
      (movil ? _obBotonAgregarMovil('Agregar otra impresora', '_obSheetImpresora()') : ''),
    derecha,
    '<button class="btn btn-ghost" onclick="_obPaso = OB_PASOS.length - 1; _pintarOnboarding()">Atrás</button>' +
    '<button class="btn btn-primary" onclick="obGuardarImpresoras()">Siguiente</button>');
}

/* Lee el formulario de la derecha. vacío: nada escrito; error: el campo que falta */
function _obLeerImpresora() {
  var nombre = _obVal('ob-otra-nombre');
  var watts = parseFloat(_obVal('ob-otra-watts')), costo = parseFloat(_obVal('ob-otra-costo')), vida = parseFloat(_obVal('ob-otra-vida'));
  if (!nombre && !_obVal('ob-otra-watts') && !_obVal('ob-otra-costo')) return { vacio: true };
  var falta = !nombre ? 'ob-otra-nombre' : !(watts > 0) ? 'ob-otra-watts' : !(costo >= 0) ? 'ob-otra-costo' : !(vida > 0) ? 'ob-otra-vida' : '';
  if (falta) return { error: falta };
  return { impresora: { name: nombre, power: watts, type: _obVal('ob-otra-tipo') || 'FDM', cost: costo, lifeHours: vida, multicolor: false, heads: 1 } };
}

function obAgregarImpresora() {
  var r = _obLeerImpresora();
  if (r.vacio || r.error) {
    snack('Completa los datos de tu impresora');
    var el = document.getElementById(r.error || 'ob-otra-nombre'); if (el) el.focus();
    return false;
  }
  _obImp.propias.push(r.impresora);
  document.getElementById('ob-lista-imp').innerHTML = _filasImpresoras();
  ['ob-otra-nombre', 'ob-otra-watts', 'ob-otra-costo'].forEach(function(id) { var e = document.getElementById(id); if (e) e.value = ''; });
  snack(r.impresora.name + ' agregada');
  var n = document.getElementById('ob-otra-nombre'); if (n) n.focus();
  return true;
}

function obGuardarImpresoras() {
  /* Lo que quedó escrito a la derecha sin tocar «Agregar» también cuenta */
  var pendiente = _obLeerImpresora();
  if (pendiente.error) { snack('Completa los datos de tu impresora'); document.getElementById(pendiente.error).focus(); return; }
  if (pendiente.impresora) _obImp.propias.push(pendiente.impresora);

  var elegidas = _obImp.comunes.slice().sort().map(function(k) { return PRINTERS_EJEMPLO[k]; }).concat(_obImp.propias);
  if (!elegidas.length) { snack('Marca o agrega tu impresora, o toca «Configurar después»'); return; }

  /* Si se regresó a este paso, lo que guardó antes se reemplaza, no se repite */
  if (_obImp.ids.length) {
    printers = printers.filter(function(p) { return _obImp.ids.indexOf(p.id) === -1; });
    if (typeof dbBorrarImpresora === 'function') _obImp.ids.forEach(function(id) { dbBorrarImpresora(id); });
  }
  var base = Date.now();
  var nuevas = elegidas.map(function(p, i) { return Object.assign({}, p, { id: String(base + i) }); });
  _obImp.ids = nuevas.map(function(p) { return p.id; });
  printers = printers.concat(nuevas);
  sv('printers', printers);
  if (typeof dbGuardarImpresora === 'function') nuevas.forEach(function(p) { dbGuardarImpresora(p); });
  if (typeof renderPrinters === 'function') renderPrinters();
  if (typeof populateSelects === 'function') populateSelects();
  _configHizoImpresora = true;

  if (!materials.length || _configHizoMateriales) _pintarConfigMateriales();
  else if (_faltanGastos() || _configHizoGastos) _pintarConfigGastos();
  else terminarOnboarding();
}

/* ── Paso 2: los materiales, con lo que cuesta el kilo ─────────────── */
function _filasMateriales() {
  var cur = (config && config.currency) || '$';
  if (_obMat.marcados == null) {
    var conResina = printers.some(function(p) { return p.type === 'Resina'; });
    _obMat.marcados = [];
    MATERIALS_EJEMPLO.forEach(function(m, k) { if (m.name === 'PLA' || (conResina && m.type === 'Resina')) _obMat.marcados.push(k); });
  }
  var precio = function(clase, attrs, valor, nombre, accion) {
    return '<span class="ob-precio">' + cur +
      '<input type="number" class="' + clase + '" ' + attrs + ' value="' + valor + '" min="1" inputmode="decimal" ' +
        'oninput="' + accion + '" aria-label="Precio por kilo de ' + esc(nombre) + '">' +
      '<span>/kg</span></span>';
  };
  return MATERIALS_EJEMPLO.map(function(m, k) {
      var on = _obMat.marcados.indexOf(k) !== -1;
      var valor = _obMat.precios[k] != null ? _obMat.precios[k] : m.costPerKg;
      return '<div class="comunes-fila ob-material">' +
        '<label class="ob-material-nombre">' +
          '<input type="checkbox" class="ob-mat" value="' + k + '"' + (on ? ' checked' : '') + ' onchange="_obMarcarMat(this)">' +
          '<span class="comunes-texto"><span class="comunes-nombre">' + esc(m.name) + '</span>' +
            '<span class="comunes-sub">' + esc(m.type) + '</span></span>' +
        '</label>' +
        precio('ob-precio-kg', 'data-k="' + k + '"', valor, m.name, '_obMat.precios[' + k + '] = this.value') +
      '</div>';
    }).join('') +
    _obMat.propios.map(function(m, i) {
      return '<div class="comunes-fila ob-material ob-propia">' +
        '<span class="ob-material-nombre">' +
          '<span class="material-symbols-rounded ob-propia-icono" aria-hidden="true">check_circle</span>' +
          '<span class="comunes-texto"><span class="comunes-nombre">' + esc(m.name) + '<span class="ob-tuya">Tuyo</span></span>' +
            '<span class="comunes-sub">' + esc(m.type) + '</span></span>' +
        '</span>' +
        precio('ob-precio-propio', 'data-i="' + i + '"', m.costPerKg, m.name, '_obMat.propios[' + i + '].costPerKg = this.value') +
        _obQuitarBoton('_obQuitarMat(' + i + ')', m.name) +
      '</div>';
    }).join('');
}

function _obMarcarMat(inp) {
  var k = Number(inp.value), i = _obMat.marcados.indexOf(k);
  if (inp.checked && i === -1) _obMat.marcados.push(k);
  if (!inp.checked && i !== -1) _obMat.marcados.splice(i, 1);
}

function _obQuitarMat(i) {
  _obMat.propios.splice(i, 1);
  document.getElementById('ob-lista-mat').innerHTML = _filasMateriales();
}

function _camposMaterial() {
  var cur = (config && config.currency) || '$';
  return _obCampo('ob-mat-nombre', 'Nombre, como «PLA Silk»') +
    '<div class="flex-row">' +
      '<div class="m3-field"><select id="ob-mat-tipo"><option value="FDM">FDM</option><option value="Resina">Resina</option></select>' +
        '<label for="ob-mat-tipo">Tipo</label></div>' +
      _obCampo('ob-mat-precio', 'Precio/kg (' + cur + ')', 'number', ' min="1" inputmode="decimal"') +
    '</div>' +
    _obCampo('ob-mat-densidad', 'Densidad (g/cm³)', 'number', ' min="0.1" step="0.01" inputmode="decimal" value="1.24"');
}

function _obSheetMaterial() {
  _obAbrirSheet('¿Otro material?', _camposMaterial(), 'if (obAgregarMaterial()) _obCerrarSheet()');
}

function _pintarConfigMateriales() {
  var movil = _obEsMovil();
  var derecha = movil ? '' :
    '<div class="ob-panel">' +
      '<div class="ob-panel-titulo">¿Otro material?</div>' +
      _camposMaterial() +
      '<button type="button" class="btn btn-ghost ob-panel-agregar" onclick="obAgregarMaterial()">' +
        '<span class="material-symbols-rounded" style="font-size:18px" aria-hidden="true">add</span> Agregar material</button>' +
    '</div>';
  document.getElementById('auth-gate').innerHTML = _layoutConfig('materiales',
    'Tus materiales',
    'Marca los que usas y escribe lo que te cuesta el kilo. Si usas otro, agrégalo.',
    '<div class="comunes-lista ob-config-lista" id="ob-lista-mat" role="group" aria-label="Materiales">' + _filasMateriales() + '</div>' +
      (movil ? _obBotonAgregarMovil('Agregar otro material', '_obSheetMaterial()') : ''),
    derecha,
    '<button class="btn btn-ghost" onclick="' + (_configHizoImpresora ? '_pintarConfigImpresora()' : '_obPaso = OB_PASOS.length - 1; _pintarOnboarding()') + '">Atrás</button>' +
    '<button class="btn btn-primary" onclick="obGuardarMateriales()">' + (_faltanGastos() || _configHizoGastos ? 'Siguiente' : 'Listo') + '</button>');
}

function _obLeerMaterial() {
  var nombre = _obVal('ob-mat-nombre');
  var precio = parseFloat(_obVal('ob-mat-precio')), densidad = parseFloat(_obVal('ob-mat-densidad'));
  if (!nombre && !_obVal('ob-mat-precio')) return { vacio: true };
  var falta = !nombre ? 'ob-mat-nombre' : !(precio > 0) ? 'ob-mat-precio' : !(densidad > 0) ? 'ob-mat-densidad' : '';
  if (falta) return { error: falta };
  return { material: { name: nombre, type: _obVal('ob-mat-tipo') || 'FDM', costPerKg: precio, density: densidad } };
}

function obAgregarMaterial() {
  var r = _obLeerMaterial();
  if (r.vacio || r.error) {
    snack('Completa el nombre y el precio por kilo');
    var el = document.getElementById(r.error || 'ob-mat-nombre'); if (el) el.focus();
    return false;
  }
  _obMat.propios.push(r.material);
  document.getElementById('ob-lista-mat').innerHTML = _filasMateriales();
  ['ob-mat-nombre', 'ob-mat-precio'].forEach(function(id) { var e = document.getElementById(id); if (e) e.value = ''; });
  snack(r.material.name + ' agregado');
  var n = document.getElementById('ob-mat-nombre'); if (n) n.focus();
  return true;
}

function obGuardarMateriales() {
  var pendiente = _obLeerMaterial();
  if (pendiente.error) { snack('Completa el nombre y el precio por kilo'); document.getElementById(pendiente.error).focus(); return; }
  if (pendiente.material) _obMat.propios.push(pendiente.material);

  var malo = null;
  var elegidos = _obMat.marcados.slice().sort().map(function(k) {
    var el = document.querySelector('.ob-precio-kg[data-k="' + k + '"]');
    var precio = parseFloat(el && el.value);
    if (!(precio > 0) && !malo) malo = el;
    return Object.assign({}, MATERIALS_EJEMPLO[k], { costPerKg: precio });
  }).concat(_obMat.propios.map(function(m, i) {
    var el = document.querySelector('.ob-precio-propio[data-i="' + i + '"]');
    var precio = parseFloat(el ? el.value : m.costPerKg);
    if (!(precio > 0) && !malo) malo = el;
    return Object.assign({}, m, { costPerKg: precio });
  }));
  if (malo) { snack('Escribe lo que te cuesta el kilo'); malo.focus(); return; }
  if (!elegidos.length) { snack('Marca o agrega al menos un material, o toca «Configurar después»'); return; }

  if (_obMat.ids.length) {
    materials = materials.filter(function(m) { return _obMat.ids.indexOf(m.id) === -1; });
    if (typeof dbBorrarMaterial === 'function') _obMat.ids.forEach(function(id) { dbBorrarMaterial(id); });
  }
  var base = Date.now();
  var nuevos = elegidos.map(function(m, i) { return Object.assign({}, m, { id: String(base + i) }); });
  _obMat.ids = nuevos.map(function(m) { return m.id; });
  materials = materials.concat(nuevos);
  sv('materials', materials);
  if (typeof dbGuardarMaterial === 'function') nuevos.forEach(function(m) { dbGuardarMaterial(m); });
  if (typeof renderMaterials === 'function') renderMaterials();
  if (typeof populateSelects === 'function') populateSelects();
  _configHizoMateriales = true;

  if (_faltanGastos() || _configHizoGastos) _pintarConfigGastos();
  else terminarOnboarding();
}

/* ── Paso 3: los gastos del mes, uno por renglón (D209, D210) ──────────
   Cada gasto con su nombre y su monto, como en Ajustes › Gastos fijos; el
   total y lo que le toca a cada hora se ven a la derecha. */
var GASTOS_SUGERIDOS = ['Renta', 'Luz', 'Internet', 'Agua', 'Teléfono', 'Software'];

function _obLeerGastosDom() {
  var filas = document.querySelectorAll('#ob-lista-gastos .ob-gasto');
  if (!filas.length && _obGastos) return;
  _obGastos = Array.prototype.map.call(filas, function(f) {
    return { name: f.querySelector('.ob-gasto-nombre').value, amount: f.querySelector('.ob-gasto-monto').value };
  });
}

function _filasGastos() {
  return _obGastos.map(function(g, i) {
    return '<div class="ob-gasto">' +
      '<input type="text" class="ob-gasto-nombre" value="' + esc(g.name || '') + '" placeholder="Gasto" aria-label="Nombre del gasto" oninput="_obTotalGastos()">' +
      '<input type="number" class="ob-gasto-monto" value="' + (g.amount != null ? esc(String(g.amount)) : '') + '" placeholder="0" min="0" inputmode="decimal" ' +
        'aria-label="Monto al mes de ' + esc(g.name || 'este gasto') + '" oninput="_obTotalGastos()">' +
      _obQuitarBoton('_obQuitarGasto(' + i + ')', g.name || 'este gasto') +
    '</div>';
  }).join('');
}

function _sugeridosGastos() {
  var tiene = (_obGastos || []).map(function(g) { return String(g.name || '').trim().toLowerCase(); });
  return GASTOS_SUGERIDOS.filter(function(n) { return tiene.indexOf(n.toLowerCase()) === -1; })
    .map(function(n) { return '<button type="button" class="ob-sugerido" onclick="_obAgregarGasto(\'' + n + '\')">+ ' + n + '</button>'; })
    .join('') +
    '<button type="button" class="ob-sugerido" onclick="_obOtroGasto()">+ Otro gasto</button>';
}

function _obRepintarGastos(enfocar) {
  document.getElementById('ob-lista-gastos').innerHTML = _filasGastos();
  document.getElementById('ob-sugeridos').innerHTML = _sugeridosGastos();
  _obTotalGastos();
  if (enfocar) {
    var filas = document.querySelectorAll('#ob-lista-gastos .ob-gasto');
    var ultima = filas[filas.length - 1];
    var campo = ultima && (ultima.querySelector('.ob-gasto-nombre').value ? ultima.querySelector('.ob-gasto-monto') : ultima.querySelector('.ob-gasto-nombre'));
    if (campo) campo.focus();
  }
}

function _obAgregarGasto(nombre) {
  _obLeerGastosDom();
  _obGastos.push({ name: nombre, amount: '' });
  _obRepintarGastos(true);
}

/* Escritorio: un renglón vacío. Teléfono: la hoja con nombre y monto (D211) */
function _obOtroGasto() {
  if (!_obEsMovil()) { _obAgregarGasto(''); return; }
  var cur = (config && config.currency) || '$';
  _obAbrirSheet('Otro gasto',
    _obCampo('ob-gasto-nuevo-nombre', 'Nombre, como «Seguro»') +
    _obCampo('ob-gasto-nuevo-monto', 'Al mes (' + cur + ')', 'number', ' min="0" inputmode="decimal"'),
    '_obAgregarGastoSheet()');
}

function _obAgregarGastoSheet() {
  var nombre = _obVal('ob-gasto-nuevo-nombre');
  if (!nombre) { snack('Escribe el nombre del gasto'); document.getElementById('ob-gasto-nuevo-nombre').focus(); return; }
  _obLeerGastosDom();
  _obGastos.push({ name: nombre, amount: _obVal('ob-gasto-nuevo-monto') });
  _obCerrarSheet();
  _obRepintarGastos(false);
}

function _obQuitarGasto(i) {
  _obLeerGastosDom();
  _obGastos.splice(i, 1);
  _obRepintarGastos(false);
}

/* El total y lo que le toca a cada hora, mientras se escribe */
function _obTotalGastos() {
  _obLeerGastosDom();
  var cur = (config && config.currency) || '$';
  var total = (_obGastos || []).reduce(function(s, g) { return s + (parseFloat(g.amount) || 0); }, 0);
  var h = parseFloat(_obVal('ob-horas-mes'));
  var t = document.getElementById('ob-total-gastos');
  if (t) t.textContent = formatoDinero(total, cur);
  var el = document.getElementById('ob-gastos-hora');
  if (el) el.textContent = h > 0 ? '= ' + formatoDinero(total / h, cur) + ' por hora de impresión' : '';
}

function _pintarConfigGastos() {
  if (!_obGastos) {
    _obGastos = (config.fixedCostItems || []).length
      ? config.fixedCostItems.map(function(g) { return { name: g.name, amount: g.amount }; })
      : [{ name: 'Renta', amount: '' }, { name: 'Luz', amount: '' }, { name: 'Internet', amount: '' }];
  }
  var atras = _configHizoMateriales ? '_obLeerGastosDom(); _pintarConfigMateriales()'
            : _configHizoImpresora ? '_obLeerGastosDom(); _pintarConfigImpresora()'
            : '_obPaso = OB_PASOS.length - 1; _pintarOnboarding()';
  var izquierda =
    '<div class="ob-gastos-cabeza" aria-hidden="true"><span>Gasto</span><span>Al mes</span><span></span></div>' +
    '<div id="ob-lista-gastos">' + _filasGastos() + '</div>' +
    '<div class="ob-sugeridos" id="ob-sugeridos">' + _sugeridosGastos() + '</div>';
  var derecha =
    '<div class="ob-panel">' +
      '<div class="ob-total-etiqueta">Total al mes</div>' +
      '<div class="ob-total" id="ob-total-gastos">$0</div>' +
      _obCampo('ob-horas-mes', 'Horas que imprimes al mes', 'number',
               ' min="1" step="1" inputmode="decimal" value="' + (Number(config.monthlyPrintHours) || 200) + '" oninput="_obTotalGastos()"') +
      '<div class="ob-gastos-hora" id="ob-gastos-hora" aria-live="polite"></div>' +
    '</div>';
  document.getElementById('auth-gate').innerHTML = _layoutConfig('gastos',
    'Tus gastos del mes',
    'Lo que pagas cada mes aunque no imprimas, uno por renglón. Se reparte entre tus horas de impresión.',
    izquierda, derecha,
    '<button class="btn btn-ghost" onclick="' + atras + '">Atrás</button>' +
    '<button class="btn btn-primary" onclick="obGuardarGastos()">Listo</button>');
  _obTotalGastos();
}

function obGuardarGastos() {
  _obLeerGastosDom();
  var items = (_obGastos || [])
    .map(function(g) { return { name: String(g.name || '').trim() || 'Sin nombre', amount: parseFloat(g.amount) || 0 }; })
    .filter(function(g) { return g.amount > 0; });
  var h = parseFloat(_obVal('ob-horas-mes'));
  if (!items.length) {
    snack('Escribe al menos un gasto, o toca «Configurar después»');
    var monto = document.querySelector('#ob-lista-gastos .ob-gasto-monto'); if (monto) monto.focus();
    return;
  }
  if (!(h > 0)) { snack('Escribe cuántas horas imprimes al mes'); document.getElementById('ob-horas-mes').focus(); return; }
  config.fixedCostItems    = items;
  config.fixedMonthlyCost  = items.reduce(function(s, g) { return s + g.amount; }, 0);
  config.monthlyPrintHours = h;
  sv('config', config);
  if (typeof loadConfig === 'function') loadConfig();
  _configHizoGastos = true;
  terminarOnboarding();
}
