/* ===== DASHBOARD ===== */

/* ── Etiquetas de mes ─── */
var _MES_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function renderDashboard() {
  var dashContent = document.getElementById('dash-content');
  if (!dashContent) return;

  /* ── Actualizar etiqueta de mes en el header ─── */
  var now = new Date();
  var monthLabel = document.getElementById('dash-month-label');
  if (monthLabel) {
    monthLabel.textContent = 'Estudio · ' + _MES_ES[now.getMonth()] + ' ' + now.getFullYear();
  }
  /* ── Encabezado de escritorio: el mes y «Nueva cotización» (D234) ─── */
  var dashResumen = document.getElementById('dash-resumen');
  if (dashResumen) dashResumen.textContent = _MES_LARGO[now.getMonth()] + ' de ' + now.getFullYear();
  var dashNueva = document.getElementById('dash-btn-nueva');
  /* Sin cotizaciones, el estado vacío de Ingresos ya trae el botón (D205) */
  if (dashNueva) dashNueva.style.display = quotes.length ? '' : 'none';

  /* ── Nombre del usuario ─── */
  var userNameEl = document.getElementById('dash-user-name');
  if (userNameEl && config.bizName) {
    userNameEl.textContent = config.bizName.split(' ')[0];
  }

  var cur = config.currency || '$';
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  /* ── Primer uso: sin impresoras configuradas ─── */
  var needsSetup = printers.length === 0 || materials.length === 0;
  if (needsSetup) {
    dashContent.innerHTML =
      '<div style="padding:0 20px">' +
        '<div class="card" style="padding:24px;text-align:center">' +
          '<span class="material-symbols-rounded" style="font-size:40px;color:var(--accent);margin-bottom:12px;display:block">view_in_ar</span>' +
          '<div style="font-size:17px;font-weight:600;margin-bottom:8px;letter-spacing:-0.02em">¡Bienvenido!</div>' +
          '<p style="font-size:13px;color:var(--ink-3);margin-bottom:20px;line-height:1.5">Configura una impresora y un material para empezar a cotizar.</p>' +
          '<div style="display:flex;flex-direction:column;gap:10px">' +
            (printers.length === 0
              ? '<button class="btn btn-primary" onclick="showPage(\'catalog\')" style="width:100%"><span class="material-symbols-rounded" style="font-size:16px">print</span> Agregar impresora</button>'
              : '<div style="font-size:13px;color:var(--ok);display:flex;align-items:center;justify-content:center;gap:6px"><span class="material-symbols-rounded" style="font-size:16px">check_circle</span> Impresora configurada</div>') +
            (materials.length === 0
              ? '<button class="btn btn-ghost" onclick="showPage(\'materials\')" style="width:100%"><span class="material-symbols-rounded" style="font-size:16px">category</span> Agregar material</button>'
              : '<div style="font-size:13px;color:var(--ok);display:flex;align-items:center;justify-content:center;gap:6px"><span class="material-symbols-rounded" style="font-size:16px">check_circle</span> Material configurado</div>') +
          '</div>' +
        '</div>' +
      '</div>';
    return;
  }

  /* ── Calcular datos del mes ─── */
  var monthQuotes   = quotes.filter(function(q) { return new Date(q.quoteDate) >= monthStart; });
  var monthAccepted = monthQuotes.filter(function(q) { return q.status === 'aceptada'; });
  /* Lo que entra al negocio: sin la comisión del recomendador, que es de él
     (D30, D218). La comisión del mes se dice aparte, abajo del número. */
  var monthRevenue  = monthAccepted.reduce(function(s, q) { return s + _ingresoDe(q); }, 0);
  var monthComision = monthAccepted.reduce(function(s, q) { return s + _totalDe(q); }, 0) - monthRevenue;

  /* Ganancia y margen */
  var monthWithCost      = monthAccepted.filter(function(q) { return q.totalBaseCost != null; });
  var monthBaseCost      = monthWithCost.reduce(function(s, q) { return s + (q.totalBaseCost || 0); }, 0);
  /* La ganancia y el margen, sin la comisión del recomendador: no es del
     negocio (D30). El mismo margen que la Calculadora y la Orden (D213). */
  var monthRevWithCost   = monthWithCost.reduce(function(s, q) { return s + _ingresoDe(q); }, 0);
  var monthProfit    = monthRevWithCost - monthBaseCost;
  var monthMarginPct = monthRevWithCost > 0 ? Math.round((monthProfit / monthRevWithCost) * 100) : null;
  var hasMarginData  = monthWithCost.length > 0;

  /* Aceptación */
  var acceptRate = monthQuotes.length > 0
    ? Math.round((monthAccepted.length / monthQuotes.length) * 100) : 0;

  /* Historial 6 meses para mini chart */
  var bars = [];
  for (var mi = 5; mi >= 0; mi--) {
    var bd    = new Date(now.getFullYear(), now.getMonth() - mi, 1);
    var bS    = new Date(bd.getFullYear(), bd.getMonth(), 1);
    var bE    = new Date(bd.getFullYear(), bd.getMonth() + 1, 0, 23, 59, 59);
    var bAcc  = quotes.filter(function(q) {
      var qd = new Date(q.quoteDate);
      return qd >= bS && qd <= bE && q.status === 'aceptada';
    });
    var bRev  = bAcc.reduce(function(s, q) { return s + _ingresoDe(q); }, 0);
    bars.push({ label: _MES_ES[bd.getMonth()], rev: bRev });   /* «Nov», no «NOV» (D244) */
  }
  var maxRev = Math.max.apply(null, bars.map(function(b) { return b.rev; })) || 1;

  var barsHTML = bars.map(function(b, idx) {
    var h = Math.round((b.rev / maxRev) * 64);
    var isCurrent = idx === 5;
    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:78px;justify-content:flex-end">' +
      '<div style="width:100%;height:' + Math.max(h, 3) + 'px;' +
        'background:' + (isCurrent ? 'var(--ink)' : 'var(--line)') + ';' +
        'border-radius:2px 2px 0 0;transition:height 0.5s cubic-bezier(0.2,0.8,0.2,1)"></div>' +
      '<div class="micro" style="font-size:12px">' + b.label + '</div>' +
    '</div>';
  }).join('');

  /* ── Piezas impresas del mes (cotizaciones aceptadas este mes) ───
     Suma las CANTIDADES, no los renglones: una cotización con una partida
     de 15 piezas son 15 piezas, no 1. Mismo criterio que las horas de abajo. */
  var piecesCount = monthAccepted.reduce(function(s, q) {
    if (q.items && q.items.length > 0) {
      return s + q.items.reduce(function(si, it) { return si + (it.qty || 1); }, 0);
    }
    return s + 1; /* cotizaciones legacy sin items */
  }, 0);

  /* ── Horas de impresión del mes (cotizaciones aceptadas) ─── */
  var monthPrintHours = monthAccepted.reduce(function(s, q) {
    if (q.items && q.items.length > 0) {
      var qHours = q.items.reduce(function(si, it) {
        return si + (it.timeH || 0) * (it.qty || 1);
      }, 0);
      return s + qHours;
    }
    return s + (q.timeH || 0); /* fallback: cotizaciones legacy (pre-multi-producto) */
  }, 0);
  var hoursCapacity = config.monthlyPrintHours || 0;
  var hoursUsePct   = (hoursCapacity > 0 && monthPrintHours > 0)
    ? Math.round((monthPrintHours / hoursCapacity) * 100) : null;

  /* ── Cotizaciones recientes ─── */
  var recent      = quotes.slice(0, 4);
  var recentRows  = recent.length === 0
    ? _dashVacio('receipt_long', 'Sin cotizaciones', 'Aquí verás las 4 más recientes.')
    : recent.map(function(q) {
        var total  = q.grandTotal != null ? q.grandTotal : (q.totalWithQty || 0);
        var status = estadoDe(q);
        var statusColor = colorDeEstado(status);   /* D224 */
        var statusDot   = '● ' + etiquetaEstado(status).toLowerCase();
        var num = q.quoteNum ? q.quoteNum.replace('COT-','') : '?';
        /* Abre esa cotización, no la lista (D231) */
        return '<div class="row dash-reciente" role="button" tabindex="0" onclick="abrirCotizacionReciente(' + quotes.indexOf(q) + ')" ' +
                 'onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();this.click()}">' +
          '<div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">' +
            '<div style="width:32px;height:32px;border-radius:6px;background:var(--bg-sunk);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:12px;color:var(--ink-2);flex-shrink:0">' + num + '</div>' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(q.items && q.items[0] ? q.items[0].desc : (q.desc || q.client)) + '</div>' +
              '<div style="font-size:12px;color:var(--ink-3);margin-top:2px">' +
                esc(q.client) + ' · ' +
                '<span style="color:' + statusColor + '">' + statusDot + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="num" style="font-size:14px;font-weight:500">' + formatoDinero(total, cur) + '</div>' +
        '</div>';
      }).join('');

  /* ── Armar todo el contenido ─── */
  /* Cuenta nueva, sin ninguna cotización: estados vacíos en lugar de ceros (D205) */
  var sinCotizaciones = !quotes.length;
  var uso = typeof usoDeMaterial === 'function' ? usoDeMaterial(quotes, now, _nombreParaUso) : null;

  dashContent.innerHTML =

    /* 0. Lo que te necesita hoy (D258): solo si hay algo */
    _tplParaHoy(pendientesDeHoy(quotes, inventory, now, estadoDeStock)) +

    /* 1. Hero stat card */
    '<div style="padding:0 20px">' +
      '<div class="card" style="padding:22px;position:relative;overflow:hidden">' +
        (sinCotizaciones
          ? '<div class="micro">Ingresos aceptados · ' + _MES_ES[now.getMonth()].toLowerCase() + '</div>' +
            _dashVacio('payments', 'Aún no hay ingresos',
              'Cuando un cliente acepte una cotización, aquí verás lo que entra cada mes.',
              { label: 'Nueva cotización', onclick: 'nuevaCotizacion()', primario: true })
          :
        '<div style="margin-bottom:18px">' +
          '<div class="micro">Ingresos aceptados · ' + _MES_ES[now.getMonth()].toLowerCase() + '</div>' +
          '<div class="display" style="font-size:48px;margin-top:8px;line-height:1">' +
            '<span style="font-variant-numeric:tabular-nums">' + tplDinero(monthRevenue, cur) + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:16px;margin-top:10px;font-size:12px;color:var(--ink-2)">' +
            '<span class="num">' + monthAccepted.length + (monthAccepted.length === 1 ? ' cotización' : ' cotizaciones') + '</span>' +
            (monthComision >= 0.005
              ? '<span class="num">Sin ' + formatoDinero(monthComision, cur) + ' de comisiones</span>'
              : '') +
            (monthMarginPct !== null
              ? '<span><span class="num" style="color:var(--ok)">' + monthMarginPct + '% margen</span></span>'
              : '') +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:flex-end;gap:8px">' + barsHTML + '</div>') +
      '</div>' +
    '</div>' +

    /* 2. Accesos rápidos: en escritorio los da la barra lateral (D171). Sin
       cotizaciones no van: el estado vacío de arriba ya trae «Nueva cotización» (D205) */
    (sinCotizaciones ? '' :
    '<div class="solo-movil" style="padding:24px 20px 0">' +
      '<div class="micro" style="margin-bottom:10px">Accesos rápidos</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<button onclick="nuevaCotizacion()" class="card" style="padding:16px;text-align:left;display:flex;flex-direction:column;gap:10px;min-height:96px">' +
          '<span class="material-symbols-rounded" style="font-size:22px;color:var(--accent)">calculate</span>' +
          '<div>' +
            '<div style="font-size:14px;font-weight:500;letter-spacing:-0.01em">Nueva cotización</div>' +
            '<div style="font-size:12px;color:var(--ink-3);margin-top:2px">Calcular costo de pieza</div>' +
          '</div>' +
        '</button>' +
        '<button onclick="showPage(\'quotes\')" class="card" style="padding:16px;text-align:left;display:flex;flex-direction:column;gap:10px;min-height:96px">' +
          '<span class="material-symbols-rounded" style="font-size:22px;color:var(--ink-2)">receipt_long</span>' +
          '<div>' +
            '<div style="font-size:14px;font-weight:500;letter-spacing:-0.01em">Ver cotizaciones</div>' +
            '<div style="font-size:12px;color:var(--ink-3);margin-top:2px">' + monthQuotes.length + ' este mes</div>' +
          '</div>' +
        '</button>' +
      '</div>' +
    '</div>') +

    /* 3. Cotizaciones recientes */
    '<div class="dash-seccion" style="padding:24px 20px 0">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<div class="micro">Cotizaciones recientes</div>' +
        '<button class="link-btn" onclick="showPage(\'quotes\')" style="font-size:12px;color:var(--ink-2)">Ver todo →</button>' +
      '</div>' +
      '<div class="card" style="padding:0 16px">' + recentRows + '</div>' +
    '</div>' +

    /* 4. Salud del negocio */
    '<div class="dash-seccion" style="padding:24px 20px 0">' +
      '<div class="micro" style="margin-bottom:10px;min-height:44px;display:flex;align-items:center">Salud del negocio</div>' +
      '<div class="card" style="padding:0 16px">' +
      (sinCotizaciones
        ? _dashVacio('monitoring', 'Sin números del mes',
            'La ganancia, la aceptación, las piezas y las horas aparecen con tus cotizaciones.')
        :
        '<div class="row" style="padding:14px 0">' +
          '<div class="row-label">Ganancia del mes</div>' +
          '<div class="row-value">' + (hasMarginData ? formatoDinero(monthProfit, cur) : '—') + '</div>' +
        '</div>' +
        '<div class="row" style="padding:14px 0">' +
          '<div class="row-label">Tasa de aceptación</div>' +
          '<div class="row-value">' + (monthQuotes.length > 0 ? acceptRate + '%' : '—') +
            (acceptRate > 60 ? ' <span style="color:var(--ok);font-size:12px">↑</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="row" style="padding:14px 0">' +
          '<div class="row-label">Piezas impresas (mes)</div>' +
          '<div class="row-value">' + piecesCount + '</div>' +
        '</div>' +
        '<div class="row" style="padding:14px 0;border-bottom:none">' +
          '<div class="row-label">Horas de impresión</div>' +
          '<div class="row-value">' +
            (monthPrintHours > 0 ? monthPrintHours.toFixed(1) + ' h' : '—') +
            (hoursUsePct !== null
              ? ' <span style="font-size:12px;color:' + (hoursUsePct >= 90 ? 'var(--danger)' : hoursUsePct >= 70 ? 'var(--accent)' : 'var(--ink-3)') + '">· ' + hoursUsePct + '% cap.</span>'
              : '') +
          '</div>' +
        '</div>') +
      '</div>' +
    '</div>' +

    /* 5. Material usado en el mes (D182, la misma tarjeta de Inventario, D180) */
    '<div class="dash-seccion" style="padding:24px 20px 0">' +
      '<div class="micro" style="margin-bottom:10px;min-height:44px;display:flex;align-items:center">Material usado · ' + _MES_ES[now.getMonth()].toLowerCase() + '</div>' +
      (uso && uso.hayDatos
        ? tplUsoMaterial(uso, { sinTitulo: true, colorDe: _colorParaUso })
        : '<div class="card">' + _dashVacio('donut_large', 'Sin material usado',
            'Al aceptar cotizaciones, aquí ves qué material gastas más.') + '</div>') +
    '</div>' +

    /* 6. Filamento: lo que queda y los rollos más vacíos (D182) */
    '<div class="dash-seccion" style="padding:24px 20px 0">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<div class="micro">Filamento</div>' +
        '<button class="link-btn" onclick="showPage(\'inventory\')" style="font-size:12px;color:var(--ink-2)">Ver inventario →</button>' +
      '</div>' +
      _tplFilamentoDashboard(cur) +
    '</div>' +

    /* Espaciado final para no quedar tapado por la nav bar */
    '<div class="dash-espacio" style="height:100px"></div>';
}

/* formatNum salió en v149: el dinero se escribe con formatoDinero (js/costing.js, D237) */

/* ── Filamento en el Dashboard (D182) ────────────────────────────────
   Cuánto queda en todos los rollos y los 4 con menos porcentaje, con su barra.
   Los colores de la barra son los del Inventario: verde, ámbar y rojo; con
   20 % o menos lleva además el ícono de aviso, para no depender del color. */
function _tplFilamentoDashboard(cur) {
  if (!inventory.length) {
    return '<div class="card dash-filamento">' +
      _dashVacio('inventory_2', 'Sin rollos',
        'Regístralos y se descuentan solos al aceptar una cotización.',
        { label: 'Agregar filamento', onclick: "showPage('inventory');showInventoryModal()" }) +
    '</div>';
  }

  var gramos = 0, valor = 0;
  var filas = inventory.map(function(r) {
    var total = parseFloat(r.totalG) || 0;
    var resto = Math.max(0, parseFloat(r.remainingG) || 0);
    if (total > 0 && resto > total) resto = total;
    var mat = r.materialId ? materials.find(function(m) { return m.id === r.materialId; }) : null;
    var precioKg = parseFloat(r.costPerKg) || (mat ? parseFloat(mat.costPerKg) || 0 : 0);
    gramos += resto;
    valor += resto / 1000 * precioKg;
    return { r: r, resto: resto, pct: total > 0 ? Math.round(resto / total * 100) : 0 };
  }).sort(function(a, b) { return a.pct - b.pct; });

  var renglones = filas.slice(0, 4).map(function(f) {
    var r = f.r;
    var estado = estadoDeStock(r);   /* D257 */
    var color = colorBarraStock(estado);
    var hexRollo = colorDeRollo(r);
    var muestra = hexRollo
      ? 'background:' + hexRollo + ';box-shadow:inset 0 0 0 1px rgba(127,127,127,.45)'
      : 'background:var(--bg-sunk);box-shadow:inset 0 0 0 0.5px var(--line-strong)';
    var aviso = estado === 'ok' ? '' :
      '<span class="material-symbols-rounded dash-rollo-aviso' + (estado === 'agotado' ? ' agotado' : '') + '" aria-hidden="true" title="' + (estado === 'agotado' ? 'Agotado' : 'Por acabarse') + '">' + (estado === 'agotado' ? 'block' : 'warning') + '</span>' +
      '<span class="sr-only">, ' + (estado === 'agotado' ? 'agotado' : 'por acabarse') + '</span>';
    return '<div class="dash-rollo">' +
      '<span class="dash-rollo-muestra" style="' + muestra + '"></span>' +
      '<div class="dash-rollo-info">' +
        '<div class="dash-rollo-nombre">' + esc(nombreMaterialDeRollo(r)) +
          (r.color ? ' <span>\u00b7 ' + esc(r.color) + '</span>' : '') + aviso + '</div>' +
        '<div class="dash-rollo-barra"><span style="width:' + f.pct + '%;background:' + color + '"></span></div>' +
      '</div>' +
      '<div class="dash-rollo-gramos">' + formatoGramos(f.resto) + '<span>' + f.pct + '%</span></div>' +
    '</div>';
  }).join('');

  var n = inventory.length;
  /* Con más de 4 rollos dice cuáles se ven: decía «en 5 rollos» y mostraba 4 (D233) */
  var nota = n > 4
    ? '<div class="dash-filamento-nota">Los 4 más vacíos \u00b7 ' + (n - 4) + (n - 4 === 1 ? ' rollo más' : ' rollos más') + ' en Inventario</div>'
    : '';
  return '<div class="card dash-filamento">' +
    '<div class="dash-filamento-cifra">' +
      '<span class="dash-filamento-total">' + formatoGramos(gramos) + '</span>' +
      '<span class="dash-filamento-sub">en ' + n + (n === 1 ? ' rollo' : ' rollos') +
        (valor > 0 ? ' \u00b7 ' + formatoDinero(valor, cur) : '') + '</span>' +
    '</div>' +
    nota +
    renglones +
  '</div>';
}

/* ── Estado vacío de una tarjeta del Dashboard (D205) ────────────────
   Más chico que el de una página. El botón va solo donde hay algo que
   hacer: «Nueva cotización» arriba y «Agregar filamento» en Filamento. */
function _dashVacio(icono, titulo, texto, accion) {
  return '<div class="dash-vacio">' +
    '<span class="material-symbols-rounded dash-vacio-icono" aria-hidden="true">' + icono + '</span>' +
    '<div class="dash-vacio-titulo">' + titulo + '</div>' +
    (texto ? '<p>' + texto + '</p>' : '') +
    (accion
      ? '<button type="button" class="btn ' + (accion.primario ? 'btn-primary' : 'btn-ghost') + '" onclick="' + accion.onclick + '">' +
          '<span class="material-symbols-rounded" style="font-size:16px" aria-hidden="true">add</span> ' + accion.label +
        '</button>'
      : '') +
  '</div>';
}

/* El total de una cotización y la parte que es del negocio: sin la comisión
   del recomendador (D30, D218) */
function _totalDe(q) { return q.grandTotal != null ? q.grandTotal : (q.totalWithQty || 0); }
function _ingresoDe(q) { return ingresoSinComision(_totalDe(q), q.commission); }

var _MES_LARGO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto',
                  'Septiembre','Octubre','Noviembre','Diciembre'];

/* Una cotización reciente del Inicio abre esa cotización (D231). En
   escritorio se abre en el panel de Cotizaciones; en el teléfono, en la
   hoja de siempre, sin salir del Inicio. */
function abrirCotizacionReciente(i) {
  if (!quotes[i]) return;
  if (typeof _mqEscritorio !== 'undefined' && _mqEscritorio.matches) showPage('quotes');
  viewQuote(i);
}

/* ── Para hoy (D258) ──────────────────────────────────────────────────
   Arriba del Inicio, lo que te necesita: enviadas que esperan respuesta,
   borradores sin mandar y rollos por reponer. Cada renglón lleva a donde se
   resuelve. Sin nada pendiente no sale. */
function _hace(dias) {
  if (dias == null) return '';
  return dias === 0 ? 'de hoy' : 'de hace ' + dias + (dias === 1 ? ' día' : ' días');
}
function _tplParaHoy(p) {
  if (!p || !p.hay) return '';
  var filas = [];
  if (p.enviadas) filas.push(_filaParaHoy('send', 'var(--info)',
    p.enviadas + (p.enviadas === 1 ? ' enviada espera respuesta' : ' enviadas esperan respuesta'),
    (p.enviadas === 1 ? 'Es ' : 'La más vieja es ') + _hace(p.diasEnviadaMasVieja),
    "showPage('quotes');_setQuoteFilter('enviada')"));
  if (p.borradores) filas.push(_filaParaHoy('edit_note', 'var(--warn)',
    p.borradores + (p.borradores === 1 ? ' borrador sin mandar' : ' borradores sin mandar'),
    (p.borradores === 1 ? 'Es ' : 'El más viejo es ') + _hace(p.diasBorradorMasViejo),
    "showPage('quotes');_setQuoteFilter('borrador')"));
  var rollos = p.rollosBajos + p.rollosAgotados;
  if (rollos) filas.push(_filaParaHoy('inventory_2', 'var(--warn)',
    rollos + (rollos === 1 ? ' rollo por reponer' : ' rollos por reponer'),
    [p.rollosBajos ? p.rollosBajos + ' por acabarse' : '',
     p.rollosAgotados ? p.rollosAgotados + (p.rollosAgotados === 1 ? ' agotado' : ' agotados') : ''].filter(Boolean).join(' \u00b7 '),
    "showPage('inventory')"));
  return '<section class="para-hoy-seccion" aria-labelledby="para-hoy-titulo" style="padding:0 20px 24px">' +
    '<h2 class="micro" id="para-hoy-titulo" style="margin:0 0 10px">Para hoy</h2>' +
    '<div class="card para-hoy">' + filas.join('') + '</div>' +
  '</section>';
}
function _filaParaHoy(icono, color, titulo, detalle, accion) {
  return '<button type="button" class="para-hoy-fila" onclick="' + accion + '">' +
    '<span class="material-symbols-rounded para-hoy-icono" aria-hidden="true" style="color:' + color + '">' + icono + '</span>' +
    '<span class="para-hoy-texto">' +
      '<span class="para-hoy-titulo">' + titulo + '</span>' +
      (detalle ? '<span class="para-hoy-detalle">' + detalle + '</span>' : '') +
    '</span>' +
    '<span class="material-symbols-rounded para-hoy-ir" aria-hidden="true">chevron_right</span>' +
  '</button>';
}
