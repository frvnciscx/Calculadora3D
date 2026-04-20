/* ===== DATA STORE ===== */
const DEF_CONFIG = {
  kwhCost: 1.20,
  laborCostPerHour: 50,
  currency: '$',
  fixedMonthlyCost: 2000,
  monthlyPrintHours: 200,
  wastePercent: 10,
  bizName: '',
  bizPhone: '',
  bizEmail: '',
  bizSocial: '',
  bizQrUrl: '',
  theme: 'dark',
  lastPrinterId: '',
  lastMaterialId: '',
  /* Resina — post-proceso */
  ipaLiterCost: 80,      /* Costo del litro de IPA (MXN) */
  ipaMlPerPrint: 150,    /* ml de IPA usados por impresión */
  resinSupportPct: 20,   /* % de soporte sobre el peso base */
  /* Costos fijos — desglose por categoría */
  fixedCostItems: []     /* [{name:'Luz', amount:500}, ...] */
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
  { id:'1', name:'Ender 3 V2', power:350, type:'FDM', cost:4500, lifeHours:3000 },
  { id:'2', name:'Ender 3 S1 Pro', power:400, type:'FDM', cost:7000, lifeHours:3000 },
  { id:'3', name:'Bambu Lab A1 + AMS', power:150, type:'FDM', cost:12000, lifeHours:5000 },
  { id:'4', name:'Elegoo Mars 3', power:55, type:'Resina', cost:5500, lifeHours:2000 }
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
function sv(k, v) { localStorage.setItem('c3d_' + k, JSON.stringify(v)); }

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
let materials   = ld('materials', DEF_MATERIALS);
let config      = { ...DEF_CONFIG, ...ld('config', DEF_CONFIG) };
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
