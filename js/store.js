/* ===== DATA STORE ===== */
const DEF_CONFIG = {
  kwhCost: 1.20,
  laborCostPerHour: 50,
  currency: '$',
  fixedMonthlyCost: 2000,
  monthlyPrintHours: 200,
  wastePercent: 10,
  maintenancePercent: 5,   /* % sobre costos de máquina — refacciones, boquillas, mantenimiento */
  /* Gastos indirectos — prorrateados por hora igual que los fijos */
  indirectMonthlyCost: 0,  /* total mensual de consumibles indirectos */
  indirectCostItems: [],   /* [{name:'Guantes', amount:120}, ...] */
  bizName: '',
  bizPhone: '',
  bizEmail: '',
  bizSocial: '',
  bizQrUrl: '',
  bizBank: '',
  bizAccountHolder: '',
  bizAccountNumber: '',
  amsPurgeGrams: 0.7,      /* gramos de purga por cambio de color en AMS — medido en Bambu Studio:
                              (Expulsado + Torre) ÷ cambios de filamento. Rango PLA 0.25–0.9 g */
  theme: 'dark',
  lastPrinterId: '',
  lastMaterialId: '',
  /* Resina — post-proceso */
  ipaLiterCost: 80,      /* Costo del litro de IPA (MXN) */
  ipaMlPerPrint: 150,    /* ml de IPA usados por impresión */
  resinSupportPct: 20,   /* % de soporte sobre el peso base */
  /* Costos fijos — desglose por categoría */
  fixedCostItems: [],    /* [{name:'Luz', amount:500}, ...] */
  /* Visibilidad de datos bancarios en cotizaciones */
  showBankInfo: true
};

const DEF_QUOTE_STYLE = {
  primaryColor: '#6750A4',
  accentColor: '#D0BCFF',
  textColor: '#1C1B1F',
  bgColor: '#FFFFFF',
  logo: '',
  showDesglose: true,
  showDepreciacion: true,
  showCostosFijos: true,
  showDesperdicio: true,
  showDiseno: true,
  showNotas: true,
  termsText: '',
  footerText: '',
};

const DEF_PRINTERS = [
  { id:'1', name:'Ender 3 V2',        power:350, type:'FDM',    cost:4500,  lifeHours:3000, multicolor:false, heads:1 },
  { id:'2', name:'Ender 3 S1 Pro',    power:400, type:'FDM',    cost:7000,  lifeHours:3000, multicolor:false, heads:1 },
  { id:'3', name:'Bambu Lab A1 + AMS',power:150, type:'FDM',    cost:12000, lifeHours:5000, multicolor:true,  heads:4 },
  { id:'4', name:'Elegoo Mars 3',     power:55,  type:'Resina', cost:5500,  lifeHours:2000, multicolor:false, heads:1 }
];

const DEF_MATERIALS = [
  { id:'1', name:'PLA', type:'FDM', costPerKg:350, density:1.24 },
  { id:'2', name:'PETG', type:'FDM', costPerKg:400, density:1.27 },
  { id:'3', name:'ABS', type:'FDM', costPerKg:380, density:1.04 },
  { id:'4', name:'TPU', type:'FDM', costPerKg:550, density:1.21 },
  { id:'5', name:'Resina Standard', type:'Resina', costPerKg:600, density:1.10 }
];

function ld(k, d) {
  try { const v = localStorage.getItem('c3d_' + k); return v ? JSON.parse(v) : d; }
  catch { return d; }
}
function sv(k, v) {
  localStorage.setItem('c3d_' + k, JSON.stringify(v));
  /* La sincronización con Notion se retiró en v101 (D71 de docs/reglas-de-negocio.md):
     sus funciones no pedían contraseña. Los datos en la nube llegan con Firebase. */
}

/* Agrupa llamadas seguidas en una sola, esperando a que paren.
   Útil para no guardar en cada tecla: svDebounced('config', config).

   En localStorage escribir de más solo gasta milisegundos. En una base de
   datos en la nube cada escritura cuenta contra la cuota y puede costar
   dinero, así que conviene adquirir el hábito desde ahora. */
var _svTimers = {};
function svDebounced(k, v, ms) {
  clearTimeout(_svTimers[k]);
  _svTimers[k] = setTimeout(function() { sv(k, v); }, ms || 600);
}
function lv(k) { return localStorage.getItem('c3d_' + k); }

/* Redondea al múltiplo de 5 más cercano hacia arriba (terminación 5 o 10) */
function roundToFive(n) {
  return Math.ceil(n / 5) * 5;
}

/* HTML sanitizer — prevents XSS in template strings */
function esc(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let printers    = ld('printers', DEF_PRINTERS);
/* Migración: agregar multicolor/heads a impresoras existentes sin estos campos */
printers = printers.map(function(p) {
  if (p.multicolor === undefined) p.multicolor = (p.name && p.name.toLowerCase().indexOf('ams') !== -1);
  if (p.heads === undefined)      p.heads = p.multicolor ? 4 : 1;
  return p;
});
let materials   = ld('materials', DEF_MATERIALS);
let config      = { ...DEF_CONFIG, ...ld('config', DEF_CONFIG) };
/* Migración: amsPurgeGrams arrancó con un default irreal de 40 g por cambio de color.
   Medido en Bambu Studio ronda 0.7 g, así que cualquier valor ≥ 10 g es residuo del
   default viejo — con 40 g una pieza de 4 colores cotizaba 120 g de material fantasma. */
if (config.amsPurgeGrams >= 10) {
  config.amsPurgeGrams = DEF_CONFIG.amsPurgeGrams;
  sv('config', config);
}
let quoteStyle  = { ...DEF_QUOTE_STYLE, ...ld('quoteStyle', DEF_QUOTE_STYLE) };
let history     = ld('history', []);
let quotes      = ld('quotes', []);
let quoteCounter = ld('quoteCounter', 0);
let presets     = ld('presets', []);

/* ── Clients ─────────────────────────────────────────────────────── */
const DEF_CLIENTS = [
  { id: 'c1', name: 'Cliente Frecuente 1', phone: '', email: '', notes: 'Modifica aquí los datos del cliente' },
  { id: 'c2', name: 'Cliente Frecuente 2', phone: '', email: '', notes: 'Modifica aquí los datos del cliente' }
];
let clients = ld('clients', DEF_CLIENTS);

/* ── Filament Inventory ───────────────────────────────────────────── */
let inventory = ld('inventory', []);

/* ── Migración: el rollo guardaba el NOMBRE del material, no su id ──────────
   Antes: { material: "PLA" } y la calculadora comparaba cadenas en minúsculas.
   Renombrar «PLA» a «PLA Básico» en Materiales dejaba huérfanos a todos los
   rollos: seguían en Inventario pero desaparecían del selector de color, sin
   ningún mensaje que lo explicara.

   Ahora el rollo guarda materialId (el vínculo vivo) y conserva `material`
   como respaldo legible por si el material se borra del catálogo. */
(function migrarMaterialDeRollos() {
  var cambios = false;
  inventory.forEach(function(rollo) {
    if (rollo.materialId) return;
    var m = materials.find(function(x) {
      return x.name && rollo.material &&
             x.name.toLowerCase() === rollo.material.toLowerCase();
    });
    if (m) { rollo.materialId = m.id; cambios = true; }
  });
  if (cambios) sv('inventory', inventory);
})();

/* Nombre del material de un rollo.
   Resuelve por id para que renombrar el material se refleje al instante;
   cae al texto guardado solo si el material ya no existe en el catálogo. */
function nombreMaterialDeRollo(rollo) {
  if (!rollo) return '';
  if (rollo.materialId) {
    var m = materials.find(function(x) { return x.id === rollo.materialId; });
    if (m) return m.name;
  }
  return rollo.material || '';
}
/* lastCalc persists during the browser session — survives page navigation */
let lastCalc = (function() {
  try { var v = sessionStorage.getItem('c3d_lastCalc'); return v ? JSON.parse(v) : null; }
  catch { return null; }
})();
function saveLastCalc(calc) {
  lastCalc = calc;
  try { sessionStorage.setItem('c3d_lastCalc', JSON.stringify(calc)); } catch {}
  if (typeof refreshDraftIndicator === 'function') refreshDraftIndicator();
}
function clearLastCalc() {
  lastCalc = null;
  try { sessionStorage.removeItem('c3d_lastCalc'); } catch {}
  if (typeof refreshDraftIndicator === 'function') refreshDraftIndicator();
}

/* Ensure quoteCounter >= max existing quote number */
(function fixCounter() {
  quotes.forEach(function(q) {
    if (q.quoteNum) {
      var n = parseInt(q.quoteNum.replace(/\D/g, '')) || 0;
      if (n > quoteCounter) quoteCounter = n;
    }
  });
  sv('quoteCounter', quoteCounter);
})();

/* ── Indicador de conexión ─────────────────────────────────────── */
(function initOfflineBanner() {
  function setOffline(offline) {
    var banner = document.getElementById('offline-banner');
    if (!banner) return;
    if (offline) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }
  window.addEventListener('online',  function() { setOffline(false); });
  window.addEventListener('offline', function() { setOffline(true); });
  // Check initial state (handles app opening while already offline)
  if (!navigator.onLine) {
    document.addEventListener('DOMContentLoaded', function() { setOffline(true); });
  }
})();
