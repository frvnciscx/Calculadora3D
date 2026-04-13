/* ===== NATIVE APP FEEL ===========================================
   Tres mejoras independientes:
   1. Drag para cerrar bottom sheets (inercia física)
   2. Transiciones de página estilo tab nativo
   3. Feedback táctil (vibración) en acciones clave
   ================================================================ */

/* ── 1. HAPTIC FEEDBACK ─────────────────────────────────────────── */
const Haptic = {
  light()    { navigator.vibrate && navigator.vibrate(8);       },
  medium()   { navigator.vibrate && navigator.vibrate(18);      },
  heavy()    { navigator.vibrate && navigator.vibrate(30);      },
  success()  { navigator.vibrate && navigator.vibrate([8, 50, 12]); },
  warning()  { navigator.vibrate && navigator.vibrate([20, 40, 20]); },
  error()    { navigator.vibrate && navigator.vibrate([30, 60, 30]); }
};

/* ── 2. DRAG TO DISMISS — bottom sheets ─────────────────────────── */

/* Umbral: si el usuario arrastra más del 35% de la altura del sheet
   o hace swipe rápido (velocidad > 0.5 px/ms), se cierra. */
const DRAG_THRESHOLD_RATIO = 0.35;
const VELOCITY_THRESHOLD   = 0.5;

function initSheetDrag(sheet) {
  if (!sheet || sheet._dragInit) return;
  sheet._dragInit = true;

  var startY    = 0;
  var currentY  = 0;
  var startTime = 0;
  var isDragging = false;

  /* Solo iniciar drag desde el handle o la cabecera del sheet */
  function isHandleArea(target) {
    return target.closest('.m3-drag-handle') ||
           target.closest('.m3-bottom-sheet > h2') ||
           target === sheet;
  }

  sheet.addEventListener('touchstart', function(e) {
    if (!isHandleArea(e.target)) return;
    startY   = e.touches[0].clientY;
    startTime = Date.now();
    isDragging = true;
    sheet.style.transition = 'none';
  }, { passive: true });

  sheet.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    var delta = currentY - startY;
    if (delta < 0) delta = 0; /* no permitir arrastrar hacia arriba */
    sheet.style.transform = 'translateY(' + delta + 'px)';
    /* Oscurecer el scrim proporcionalmente */
    var scrim = document.querySelector('.m3-scrim');
    if (scrim) {
      var pct   = Math.min(delta / (sheet.offsetHeight * DRAG_THRESHOLD_RATIO), 1);
      scrim.style.opacity = 1 - pct * 0.7;
    }
  }, { passive: true });

  sheet.addEventListener('touchend', function() {
    if (!isDragging) return;
    isDragging = false;

    var delta    = Math.max(0, currentY - startY);
    var elapsed  = Date.now() - startTime;
    var velocity = elapsed > 0 ? delta / elapsed : 0;
    var threshold = sheet.offsetHeight * DRAG_THRESHOLD_RATIO;

    if (delta > threshold || velocity > VELOCITY_THRESHOLD) {
      /* Animar hacia abajo y cerrar */
      sheet.style.transition = 'transform 0.28s cubic-bezier(0.4, 0, 1, 1)';
      sheet.style.transform  = 'translateY(110%)';
      var scrim = document.querySelector('.m3-scrim');
      if (scrim) {
        scrim.style.transition = 'opacity 0.28s';
        scrim.style.opacity    = '0';
      }
      Haptic.light();
      setTimeout(function() { closeModal(); }, 260);
    } else {
      /* Spring back */
      sheet.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
      sheet.style.transform  = 'translateY(0)';
      var scrim = document.querySelector('.m3-scrim');
      if (scrim) {
        scrim.style.transition = 'opacity 0.25s';
        scrim.style.opacity    = '1';
      }
    }
  });
}

/* Observer: auto-inicializa drag cada vez que se inyecta un sheet */
(function watchModal() {
  var container = document.getElementById('modal-container');
  if (!container) return;

  var observer = new MutationObserver(function() {
    var sheet = container.querySelector('.m3-bottom-sheet');
    if (sheet) initSheetDrag(sheet);
  });
  observer.observe(container, { childList: true });
})();


/* ── 3. TRANSICIONES DE PÁGINA estilo tab nativo ─────────────────── */

/* Mapa de orden de tabs — determina dirección del slide */
const PAGE_ORDER = ['dashboard', 'calc', 'history', 'quotes', 'printers', 'config'];

var _prevPage = null;

function getPageDirection(from, to) {
  var fi = PAGE_ORDER.indexOf(from);
  var ti = PAGE_ORDER.indexOf(to);
  if (fi === -1 || ti === -1) return 'fade';
  return ti > fi ? 'forward' : 'back';
}

/* Hook sobre showPage — envuelve la transición */
(function patchShowPage() {
  var _original = window.showPage;
  window.showPage = function(name) {
    var from = _prevPage;
    _prevPage = name;

    /* Obtener página actual antes del cambio */
    var currentEl = document.querySelector('.page.active');

    /* Llamar al original (cambia clases active) */
    _original(name);

    var nextEl = document.getElementById('page-' + name);
    if (!nextEl || !currentEl || currentEl === nextEl) return;

    var dir = getPageDirection(from, name);
    if (dir === 'fade') return; /* ya tiene animación propia */

    /* Slide: forward = entra desde la derecha, back = desde la izquierda */
    var enterFrom = dir === 'forward' ? 'translateX(28px)' : 'translateX(-28px)';

    nextEl.style.animation = 'none';
    nextEl.style.opacity   = '0';
    nextEl.style.transform = enterFrom;

    requestAnimationFrame(function() {
      nextEl.style.transition = 'opacity 0.22s var(--ease-out), transform 0.22s var(--ease-out)';
      nextEl.style.opacity    = '1';
      nextEl.style.transform  = 'translateX(0)';
    });

    /* Limpiar estilos inline al terminar */
    nextEl.addEventListener('transitionend', function cleanup() {
      nextEl.style.transition = '';
      nextEl.style.opacity    = '';
      nextEl.style.transform  = '';
      nextEl.removeEventListener('transitionend', cleanup);
    });
  };
})();


/* ── 4. HAPTIC en acciones clave — hooks globales ────────────────── */

/* Interceptar snack para detectar acciones de guardado/error */
(function patchSnack() {
  var _original = window.snack;
  if (!_original) return;
  window.snack = function(msg) {
    /* Mensajes de éxito → success, errores → error */
    if (typeof msg === 'string') {
      if (/guardad|agregad|actualizad|generada|aceptad|sincronizad/i.test(msg)) {
        Haptic.success();
      } else if (/error|inv[aá]lid|ingresa|selecciona/i.test(msg)) {
        Haptic.error();
      } else {
        Haptic.light();
      }
    }
    _original(msg);
  };
})();

/* Tap en nav items → haptic light */
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-item').forEach(function(btn) {
    btn.addEventListener('touchstart', function() { Haptic.light(); }, { passive: true });
  });
});
