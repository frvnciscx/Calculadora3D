/* ===== AUTH — sesión simulada ==============================================

   Esta es una simulación. No hay servidor, no hay contraseñas verificadas,
   no hay seguridad: cualquier correo con cualquier contraseña de 6 o más
   caracteres entra. Sirve para diseñar y probar el flujo de la aplicación.

   LO IMPORTANTE ES LA FORMA, NO LA IMPLEMENTACIÓN
   ------------------------------------------------
   Las funciones de abajo tienen deliberadamente la misma firma que las de
   Firebase Authentication:

     signInWithEmailAndPassword({ email, password })
     signInWithGoogle()
     signOut()
     onAuthStateChanged(callback)
     getCurrentUser()

   Y devuelven un objeto de usuario con los mismos campos que devuelve
   Firebase: { uid, email, displayName, photoUrl }.

   Por eso, el día que conectes Firebase de verdad, el cambio es reemplazar
   el CUERPO de estas funciones. Todo el resto de la app —la pantalla de
   acceso, el guardado de sesión, el onboarding— sigue funcionando sin
   tocarse, porque llama a los mismos nombres y recibe los mismos datos.

   Esa técnica se llama "programar contra una interfaz". Es la misma idea
   que tiene un sistema de diseño: defines el componente botón una vez, y
   después puedes cambiarle el color sin rediseñar cada pantalla.

   Cuando migres, el reemplazo se ve así:

     // ANTES (aquí)
     function signInWithEmailAndPassword(datos) {
       ... guarda en localStorage ...
     }

     // DESPUÉS (Firebase, vía el plugin de Capacitor)
     function signInWithEmailAndPassword(datos) {
       return FirebaseAuthentication.signInWithEmailAndPassword(datos);
     }

   ========================================================================= */

var AUTH_KEY = 'session';   /* se guarda como c3d_session */

/* Suscriptores a cambios de sesión. Firebase usa este mismo patrón:
   le pasas una función y te avisa cada vez que el usuario entra o sale. */
var _authListeners = [];

/* Usuario en memoria. null = nadie ha iniciado sesión. */
var currentUser = ld(AUTH_KEY, null);

/* ── Lectura ───────────────────────────────────────────────────── */

function getCurrentUser() {
  return currentUser;
}

function isSignedIn() {
  return currentUser !== null;
}

/* Registra una función que se ejecuta cada vez que cambia la sesión.
   Devuelve una función para cancelar la suscripción, igual que Firebase. */
function onAuthStateChanged(callback) {
  _authListeners.push(callback);
  callback(currentUser);            /* avisa el estado actual de inmediato */
  return function cancelar() {
    _authListeners = _authListeners.filter(function(f) { return f !== callback; });
  };
}

function _notificar() {
  _authListeners.forEach(function(f) {
    try { f(currentUser); } catch (e) { console.error('[auth] listener falló', e); }
  });
}

/* ── Escritura ─────────────────────────────────────────────────── */

function _crearSesion(user) {
  currentUser = user;
  sv(AUTH_KEY, user);
  _notificar();
  return user;
}

/* Genera un identificador estable a partir del correo.
   Firebase genera un uid aleatorio; aquí lo derivamos del correo para que
   la misma persona obtenga siempre el mismo uid entre recargas. */
function _uidDesdeCorreo(email) {
  var h = 0;
  for (var i = 0; i < email.length; i++) {
    h = ((h << 5) - h) + email.charCodeAt(i);
    h |= 0;                                   /* fuerza entero de 32 bits */
  }
  return 'sim_' + Math.abs(h).toString(36);
}

/* Deriva un nombre legible del correo: paco.vazquez@x.com → Paco Vazquez */
function _nombreDesdeCorreo(email) {
  return email.split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, function(c) { return c.toUpperCase(); });
}

/**
 * Inicio de sesión con correo y contraseña.
 * @returns {Promise<{user: object}>}  misma forma que Firebase
 */
function signInWithEmailAndPassword(datos) {
  var email    = (datos && datos.email    || '').trim().toLowerCase();
  var password = (datos && datos.password || '');

  /* Las mismas validaciones que aplicaría Firebase, para que los mensajes
     de error que diseñes ahora sigan siendo los correctos después. */
  return new Promise(function(resolve, reject) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      reject({ code: 'auth/invalid-email', message: 'El correo no tiene un formato válido' });
      return;
    }
    if (password.length < 6) {
      reject({ code: 'auth/weak-password', message: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    /* Retraso artificial: la red tarda, y la interfaz debe aguantar ese
       momento con un estado de carga. Sin esto, diseñas una pantalla que
       se siente instantánea y en producción parpadea. */
    setTimeout(function() {
      resolve({ user: _crearSesion({
        uid:         _uidDesdeCorreo(email),
        email:       email,
        displayName: _nombreDesdeCorreo(email),
        photoUrl:    '',
        provider:    'password',
        simulado:    true
      })});
    }, 700);
  });
}

/**
 * Inicio de sesión con Google.
 * En la app real esto abre el selector de cuentas del sistema Android.
 */
function signInWithGoogle() {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve({ user: _crearSesion({
        uid:         'sim_google',
        email:       'cuenta.google@ejemplo.com',
        displayName: 'Cuenta de Google',
        photoUrl:    '',
        provider:    'google.com',
        simulado:    true
      })});
    }, 900);
  });
}

/** Entrar sin cuenta. Firebase lo llama signInAnonymously. */
function signInAnonymously() {
  return new Promise(function(resolve) {
    resolve({ user: _crearSesion({
      uid:         'sim_invitado',
      email:       '',
      displayName: 'Invitado',
      photoUrl:    '',
      provider:    'anonymous',
      simulado:    true
    })});
  });
}

/**
 * Cerrar sesión.
 *
 * Importante: NO borra los datos del negocio. Hoy las cotizaciones viven en
 * localStorage sin dueño, así que cerrar sesión solo quita la identidad.
 * Cuando los datos pasen a Firestore bajo users/{uid}, cerrar sesión sí los
 * dejará de mostrar — porque pertenecerán a esa cuenta, no al dispositivo.
 */
function signOut() {
  return new Promise(function(resolve) {
    currentUser = null;
    sv(AUTH_KEY, null);
    _notificar();
    resolve();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCurrentUser, isSignedIn, onAuthStateChanged, signOut,
    signInWithEmailAndPassword, signInWithGoogle, signInAnonymously
  };
}
