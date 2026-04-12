/* ===== QUOTE DESIGN EDITOR ===== */

function loadQuoteEditor() {
  const s = quoteStyle;
  // Colors
  document.getElementById('qe-primary').value = s.primaryColor;
  document.getElementById('qe-accent').value = s.accentColor;
  document.getElementById('qe-text').value = s.textColor;
  document.getElementById('qe-bg').value = s.bgColor;
  // Swatches
  document.getElementById('sw-primary').style.background = s.primaryColor;
  document.getElementById('sw-accent').style.background = s.accentColor;
  document.getElementById('sw-text').style.background = s.textColor;
  document.getElementById('sw-bg').style.background = s.bgColor;
  // Toggles
  document.getElementById('qe-showDesglose').checked = s.showDesglose;
  document.getElementById('qe-showDepreciacion').checked = s.showDepreciacion;
  document.getElementById('qe-showCostosFijos').checked = s.showCostosFijos;
  document.getElementById('qe-showDesperdicio').checked = s.showDesperdicio;
  document.getElementById('qe-showDiseno').checked = s.showDiseno;
  document.getElementById('qe-showNotas').checked = s.showNotas;
  // Texts
  document.getElementById('qe-terms').value = s.termsText || '';
  document.getElementById('qe-footer').value = s.footerText || '';
  // Logo preview
  updateLogoPreview();
  // Live preview
  updateQuotePreview();
}

function updateLogoPreview() {
  const area = document.getElementById('logo-preview-area');
  if (quoteStyle.logo) {
    area.innerHTML = `<img src="${quoteStyle.logo}" alt="Logo"><p>Toca para cambiar</p>`;
  } else {
    area.innerHTML = `<span class="material-symbols-rounded" style="font-size:32px;opacity:0.4">add_photo_alternate</span><p>Subir logo</p>`;
  }
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 500000) { snack('Logo muy grande (max 500KB)'); event.target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = function (e) {
    quoteStyle.logo = e.target.result;
    sv('quoteStyle', quoteStyle);
    updateLogoPreview();
    updateQuotePreview();
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function removeLogo() {
  quoteStyle.logo = '';
  sv('quoteStyle', quoteStyle);
  updateLogoPreview();
  updateQuotePreview();
}

function onColorChange(field, colorInput) {
  const val = colorInput.value;
  quoteStyle[field] = val;
  // Update swatch
  const swatchMap = { primaryColor: 'sw-primary', accentColor: 'sw-accent', textColor: 'sw-text', bgColor: 'sw-bg' };
  const sw = document.getElementById(swatchMap[field]);
  if (sw) sw.style.background = val;
  sv('quoteStyle', quoteStyle);
  updateQuotePreview();
}

function onToggleChange(field, checkbox) {
  quoteStyle[field] = checkbox.checked;
  sv('quoteStyle', quoteStyle);
  updateQuotePreview();
}

function onTextChange(field, input) {
  quoteStyle[field] = input.value;
  sv('quoteStyle', quoteStyle);
  updateQuotePreview();
}

function updateQuotePreview() {
  const previewEl = document.getElementById('qe-live-preview');
  if (!previewEl) return;

  // Prioridad 1: cotización más reciente guardada
  // Prioridad 2: cálculo en curso (aún no cotizado)
  // Prioridad 3: datos de muestra
  var previewData = null;

  if (quotes && quotes.length > 0) {
    var q = quotes[0];
    previewData = {
      quoteNum: q.quoteNum,
      client: q.client,
      phone: q.phone || '',
      notes: q.notes || '',
      desc: q.desc,
      printer: q.printer,
      material: q.material,
      weight: q.weight,
      timeH: q.timeH,
      designH: q.designH || 0,
      margin: q.margin,
      matCost: q.matCost,
      energyCost: q.energyCost,
      laborCost: q.laborCost || 0,
      deprecCost: q.deprecCost,
      fixedCost: q.fixedCost,
      wasteCost: q.wasteCost,
      baseCost: q.baseCost,
      totalCost: q.totalCost,
      qty: q.qty || 1,
      totalWithQty: q.totalWithQty || q.totalCost,
      quoteDate: q.quoteDate
    };
  } else if (lastCalc) {
    previewData = {
      quoteNum: 'VISTA PREVIA',
      client: 'Cliente Ejemplo',
      phone: '',
      notes: '',
      desc: lastCalc.desc,
      printer: lastCalc.printer,
      material: lastCalc.material,
      weight: lastCalc.weight,
      timeH: lastCalc.timeH,
      designH: lastCalc.designH || 0,
      margin: lastCalc.margin,
      matCost: lastCalc.matCost,
      energyCost: lastCalc.energyCost,
      laborCost: lastCalc.laborCost || 0,
      deprecCost: lastCalc.deprecCost,
      fixedCost: lastCalc.fixedCost,
      wasteCost: lastCalc.wasteCost,
      baseCost: lastCalc.baseCost,
      totalCost: lastCalc.totalCost,
      qty: 1,
      totalWithQty: lastCalc.totalCost,
      quoteDate: new Date().toISOString()
    };
  } else {
    // Datos de muestra como último recurso
    previewData = {
      quoteNum: 'COT-0001',
      client: 'Cliente Ejemplo',
      phone: '',
      notes: 'Entrega en 3 días hábiles',
      desc: 'Soporte para celular',
      printer: 'Impresora 3D',
      material: 'PLA',
      weight: 45,
      timeH: 1.5,
      designH: 0.5,
      margin: 50,
      matCost: 15.75,
      energyCost: 0.27,
      laborCost: 25.00,
      deprecCost: 3.60,
      fixedCost: 15.00,
      wasteCost: 5.96,
      baseCost: 65.58,
      totalCost: 98.37,
      qty: 1,
      totalWithQty: 98.37,
      quoteDate: new Date().toISOString()
    };
  }

  previewEl.innerHTML = buildQuoteHTML(previewData);
}

function resetQuoteStyle() {
  m3Confirm('¿Restaurar diseño a valores predeterminados?', function() {
    quoteStyle = { ...DEF_QUOTE_STYLE };
    sv('quoteStyle', quoteStyle);
    loadQuoteEditor();
    snack('Diseño restaurado');
  });
}
