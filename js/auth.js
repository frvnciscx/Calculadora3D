/* ===== AUTH — Capa de autenticación con Firebase Auth =====================
   Usa el bundle oficial compat de Firebase para garantizar funcionamiento
   tanto en servidor web (Vercel) como en local (file://) y sin problemas
   de orden de carga de scripts.
   ========================================================================= */

var firebaseConfig = {
  apiKey: "AIzaSyAkV2PPCKtc8Uupr0gsfXnFu_QY4IReIrk",
  authDomain: "calculadora3d-prod.firebaseapp.com",
  projectId: "calculadora3d-prod",
  storageBucket: "calculadora3d-prod.firebasestorage.app",
  messagingSenderId: "661233635816",
  appId: "1:661233635816:web:e36329dff59a39a8c9145d",
  measurementId: "G-DK806WJTZ2"
};

var _fbAuth = null;
var _authListeners = [];
var currentUser = null;
var _authReady = false;

/* Normaliza el objeto User de Firebase al formato de la app */
function formatUserData(user) {
  if (!user) return null;
  return {
    uid:         user.uid,
    email:       user.email || '',
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario'),
    photoUrl:    user.photoURL || '',
    isAnonymous: user.isAnonymous || false
  };
}

function _notificarAuth() {
  _authListeners.forEach(function(callback) {
    try { callback(currentUser); }
    catch (e) { console.error('[Auth] Error en listener:', e); }
  });
}

/* Inicializar Firebase si el SDK está presente en window */
(function _initFirebase() {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      _fbAuth = firebase.auth();

      /* Persistencia local (guarda la sesión en IndexedDB / localStorage) */
      if (_fbAuth.setPersistence && firebase.auth.Auth && firebase.auth.Auth.Persistence) {
        _fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(err) {
          console.warn('[Auth] No se pudo fijar persistencia LOCAL:', err);
        });
      }

      /* Escuchar cambios de sesión de Firebase */
      _fbAuth.onAuthStateChanged(function(user) {
        currentUser = formatUserData(user);
        _authReady = true;
        _notificarAuth();
      });
    } catch (e) {
      console.error('[Auth] Error inicializando Firebase:', e);
      _authReady = true;
    }
  } else {
    console.warn('[Auth] SDK de Firebase no detectado en ventana. Modo fallback activo.');
    _authReady = true;
  }
})();

/* Mapeo de errores de Firebase a mensajes amigables en español */
function translateAuthError(error) {
  if (!error) return new Error('Error de autenticación desconocido.');
  var message = error.message || 'Ocurrió un error al autenticar.';
  switch (error.code) {
    case 'auth/invalid-email':
      message = 'El formato de correo no es válido.';
      break;
    case 'auth/user-not-found':
      message = 'No existe una cuenta registrada con este correo.';
      break;
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      message = 'Correo o contraseña incorrectos.';
      break;
    case 'auth/email-already-in-use':
      message = 'Ya existe una cuenta con este correo. Inicia sesión.';
      break;
    case 'auth/weak-password':
      message = 'La contraseña debe tener al menos 6 caracteres.';
      break;
    case 'auth/network-request-failed':
      message = 'Sin conexión a internet. Verifica tu red.';
      break;
    case 'auth/too-many-requests':
      message = 'Demasiados intentos fallidos. Intenta más tarde.';
      break;
    case 'auth/popup-closed-by-user':
      message = 'Se cerró la ventana de Google antes de completar el acceso.';
      break;
    case 'auth/popup-blocked':
      message = 'La ventana de Google fue bloqueada. Permite las ventanas emergentes en tu navegador.';
      break;
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      message = 'El método de acceso por Correo/Contraseña no está habilitado en la consola de Firebase.';
      break;
  }
  var err = new Error(message);
  err.code = error.code;
  return err;
}

/* ── Métodos de autenticación ─────────────────────────────────── */

function getCurrentUser() {
  if (currentUser) return currentUser;
  if (_fbAuth && _fbAuth.currentUser) {
    currentUser = formatUserData(_fbAuth.currentUser);
    return currentUser;
  }
  return null;
}

function isSignedIn() {
  return getCurrentUser() !== null;
}

function onAuthStateChanged(callback) {
  if (typeof callback !== 'function') return function() {};
  _authListeners.push(callback);

  if (_authReady) {
    try { callback(currentUser); }
    catch (e) { console.error('[Auth] Error listener inmediato:', e); }
  }

  return function cancelar() {
    _authListeners = _authListeners.filter(function(f) { return f !== callback; });
  };
}

function signInWithEmailAndPassword(datos, passwordOpt) {
  var email = '';
  var password = '';

  if (typeof datos === 'object' && datos !== null) {
    email = (datos.email || '').trim().toLowerCase();
    password = datos.password || '';
  } else {
    email = (datos || '').trim().toLowerCase();
    password = passwordOpt || '';
  }

  if (!email) return Promise.reject(new Error('Ingresa tu correo electrónico.'));
  if (!password) return Promise.reject(new Error('Ingresa tu contraseña.'));

  if (!_fbAuth) {
    return Promise.reject(new Error('Firebase Auth no está conectado. Revisa tu conexión.'));
  }

  return _fbAuth.signInWithEmailAndPassword(email, password)
    .then(function(userCredential) {
      currentUser = formatUserData(userCredential.user);
      _notificarAuth();
      return currentUser;
    })
    .catch(function(error) {
      console.error('[Auth] Error signIn:', error);
      throw translateAuthError(error);
    });
}

function createUserWithEmailAndPassword(datos, passwordOpt, displayNameOpt) {
  var email = '';
  var password = '';
  var displayName = '';

  if (typeof datos === 'object' && datos !== null) {
    email = (datos.email || '').trim().toLowerCase();
    password = datos.password || '';
    displayName = (datos.displayName || '').trim();
  } else {
    email = (datos || '').trim().toLowerCase();
    password = passwordOpt || '';
    displayName = (displayNameOpt || '').trim();
  }

  if (!email) return Promise.reject(new Error('Ingresa un correo electrónico válido.'));
  if (!password || password.length < 6) return Promise.reject(new Error('La contraseña debe tener al menos 6 caracteres.'));

  if (!_fbAuth) {
    return Promise.reject(new Error('Firebase Auth no está conectado. Revisa tu conexión.'));
  }

  return _fbAuth.createUserWithEmailAndPassword(email, password)
    .then(function(userCredential) {
      var user = userCredential.user;
      if (displayName && user.updateProfile) {
        return user.updateProfile({ displayName: displayName }).then(function() {
          currentUser = formatUserData(user);
          currentUser.displayName = displayName;
          _notificarAuth();
          return currentUser;
        }).catch(function() {
          currentUser = formatUserData(user);
          _notificarAuth();
          return currentUser;
        });
      }
      currentUser = formatUserData(user);
      _notificarAuth();
      return currentUser;
    })
    .catch(function(error) {
      console.error('[Auth] Error createUser:', error);
      throw translateAuthError(error);
    });
}

function signInWithGoogle() {
  if (!_fbAuth || typeof firebase === 'undefined') {
    return Promise.reject(new Error('Firebase Auth no está disponible.'));
  }
  var provider = new firebase.auth.GoogleAuthProvider();
  return _fbAuth.signInWithPopup(provider)
    .then(function(userCredential) {
      currentUser = formatUserData(userCredential.user);
      _notificarAuth();
      return currentUser;
    })
    .catch(function(error) {
      console.error('[Auth] Error Google Sign In:', error);
      throw translateAuthError(error);
    });
}

function signInAnonymously() {
  if (_fbAuth) {
    return _fbAuth.signInAnonymously()
      .then(function(userCredential) {
        currentUser = formatUserData(userCredential.user);
        _notificarAuth();
        return currentUser;
      })
      .catch(function(err) {
        console.warn('[Auth] signInAnonymously falló, usando fallback local:', err);
        currentUser = {
          uid: 'invitado_' + Math.random().toString(36).slice(2, 9),
          email: '',
          displayName: 'Invitado',
          photoUrl: '',
          isAnonymous: true
        };
        _notificarAuth();
        return currentUser;
      });
  }

  currentUser = {
    uid: 'invitado_' + Math.random().toString(36).slice(2, 9),
    email: '',
    displayName: 'Invitado',
    photoUrl: '',
    isAnonymous: true
  };
  _notificarAuth();
  return Promise.resolve(currentUser);
}

function signOut() {
  if (_fbAuth) {
    return _fbAuth.signOut().then(function() {
      currentUser = null;
      _notificarAuth();
      if (typeof limpiarNegocio === 'function') {
        limpiarNegocio(true);
      }
    });
  }
  currentUser = null;
  _notificarAuth();
  if (typeof limpiarNegocio === 'function') {
    limpiarNegocio(true);
  }
  return Promise.resolve();
}

/* Exponer en window explícitamente para compatibilidad global */
window.getCurrentUser                 = getCurrentUser;
window.isSignedIn                     = isSignedIn;
window.onAuthStateChanged             = onAuthStateChanged;
window.signInWithEmailAndPassword     = signInWithEmailAndPassword;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithGoogle               = signInWithGoogle;
window.signInAnonymously              = signInAnonymously;
window.signOut                        = signOut;
window.login                          = signInWithEmailAndPassword;
window.register                       = createUserWithEmailAndPassword;
window.logout                         = signOut;
window.isAuthenticated                = isSignedIn;
