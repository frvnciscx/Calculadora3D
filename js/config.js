/* ===== CONFIG ===== */
function loadConfig() {
  document.getElementById('cfg-kwh').value = config.kwhCost;
  document.getElementById('cfg-labor').value = config.laborCostPerHour;
  document.getElementById('cfg-currency').value = config.currency;
  document.getElementById('cfg-fixed-monthly').value = config.fixedMonthlyCost || 0;
  document.getElementById('cfg-monthly-hours').value = config.monthlyPrintHours || 0;
  document.getElementById('cfg-waste').value = config.wastePercent || 0;
  document.getElementById('cfg-biz-name').value = config.bizName || '';
  document.getElementById('cfg-biz-phone').value = config.bizPhone || '';
  document.getElementById('cfg-biz-email').value = config.bizEmail || '';
  document.getElementById('cfg-biz-social').value = config.bizSocial || '';
  document.getElementById('cfg-biz-qr').value = config.bizQrUrl || '';
  applyTheme();
}

function saveConfig() {
  var kwh    = parseFloat(document.getElementById('cfg-kwh').value);
  var labor  = parseFloat(document.getElementById('cfg-labor').value);
  var fixed  = parseFloat(document.getElementById('cfg-fixed-monthly').value);
  var hours  = parseFloat(document.getElementById('cfg-monthly-hours').value);
  var waste  = parseFloat(document.getElementById('cfg-waste').value);

  /* Validación */
  if (isNaN(kwh) || kwh < 0)    { snack('Costo kWh inválido'); document.getElementById('cfg-kwh').focus(); return; }
  if (isNaN(labor) || labor < 0) { snack('Costo hora de diseño inválido'); document.getElementById('cfg-labor').focus(); return; }
  if (!isNaN(waste) && (waste < 0 || waste > 100)) { snack('Desperdicio debe ser entre 0 y 100%'); document.getElementById('cfg-waste').focus(); return; }
  if (!isNaN(fixed) && fixed > 0 && (isNaN(hours) || hours <= 0)) {
    snack('Ingresa horas de impresión/mes para calcular costos fijos'); document.getElementById('cfg-monthly-hours').focus(); return;
  }

  config.kwhCost = kwh || 0;
  config.laborCostPerHour = labor || 0;
  config.currency = document.getElementById('cfg-currency').value;
  config.fixedMonthlyCost = fixed || 0;
  config.monthlyPrintHours = hours || 0;
  config.wastePercent = isNaN(waste) ? 0 : waste;
  config.bizName = document.getElementById('cfg-biz-name').value.trim();
  config.bizPhone = document.getElementById('cfg-biz-phone').value.trim();
  config.bizEmail = document.getElementById('cfg-biz-email').value.trim();
  config.bizSocial = document.getElementById('cfg-biz-social').value.trim();
  config.bizQrUrl  = document.getElementById('cfg-biz-qr').value.trim();
  sv('config', config);
  snack('Configuración guardada ✓');
}

/* ===== EXPORT / IMPORT ===== */
function exportData() {
  const data = {
    printers, materials, config, quoteStyle, history, quotes,
    quoteCounter: quoteCounter,
    v: 5,
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'calc3d_backup_' + new Date().toISOString().slice(0, 10) + '.json';
  a.click(); URL.revokeObjectURL(url);
  snack('Datos exportados');
}

/* Required fields for validation */
var PRINTER_FIELDS = ['id', 'name', 'power', 'type', 'cost', 'lifeHours'];
var MATERIAL_FIELDS = ['id', 'name', 'type', 'costPerKg', 'density'];

function hasRequiredFields(obj, fields) {
  return fields.every(function(f) { return obj.hasOwnProperty(f) && obj[f] !== undefined && obj[f] !== ''; });
}

function importData(event) {
  var file = event.target.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    try {
      var data = JSON.parse(e.target.result);

      /* Printers — validate each entry has required fields */
      if (Array.isArray(data.printers)) {
        var validPrinters = data.printers.filter(function(p) { return hasRequiredFields(p, PRINTER_FIELDS); });
        if (validPrinters.length > 0) { printers = validPrinters; sv('printers', printers); }
      }

      /* Materials — validate each entry has required fields */
      if (Array.isArray(data.materials)) {
        var validMaterials = data.materials.filter(function(m) { return hasRequiredFields(m, MATERIAL_FIELDS); });
        if (validMaterials.length > 0) { materials = validMaterials; sv('materials', materials); }
      }

      if (data.config && typeof data.config === 'object') {
        config = { ...DEF_CONFIG, ...data.config };
        sv('config', config);
      }
      if (data.quoteStyle && typeof data.quoteStyle === 'object') {
        quoteStyle = { ...DEF_QUOTE_STYLE, ...data.quoteStyle };
        sv('quoteStyle', quoteStyle);
      }
      if (Array.isArray(data.history)) { history = data.history; sv('history', history); }
      if (Array.isArray(data.quotes))  { quotes = data.quotes; sv('quotes', quotes); }

      /* Restore quote counter — take max of imported vs existing */
      if (typeof data.quoteCounter === 'number' && data.quoteCounter > quoteCounter) {
        quoteCounter = data.quoteCounter;
      }
      /* Re-sync counter with imported quotes to be safe */
      quotes.forEach(function(q) {
        if (q.quoteNum) {
          var n = parseInt(q.quoteNum.replace(/\D/g, '')) || 0;
          if (n > quoteCounter) quoteCounter = n;
        }
      });
      sv('quoteCounter', quoteCounter);

      snack('Datos importados');
      populateSelects();
      showPage('calc');
    } catch(err) { snack('Error al importar: archivo inválido'); }
  };
  reader.readAsText(file); event.target.value = '';
}
