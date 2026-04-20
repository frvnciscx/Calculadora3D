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
  var monthRevenue  = monthAccepted.reduce(function(s, q) {
    return s + (q.grandTotal != null ? q.grandTotal : (q.totalWithQty || 0));
  }, 0);

  /* Ganancia y margen */
  var monthWithCost      = monthAccepted.filter(function(q) { return q.totalBaseCost != null; });
  var monthBaseCost      = monthWithCost.reduce(function(s, q) { return s + (q.totalBaseCost || 0); }, 0);
  var monthRevWithCost   = monthWithCost.reduce(function(s, q) {
    return s + (q.grandTotal != null ? q.grandTotal : (q.totalWithQty || 0));
  }, 0);
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
    var bRev  = bAcc.reduce(function(s, q) {
      return s + (q.grandTotal != null ? q.grandTotal : (q.totalWithQty || 0));
    }, 0);
    bars.push({ label: _MES_ES[bd.getMonth()].toUpperCase(), rev: bRev });
  }
  var maxRev = Math.max.apply(null, bars.map(function(b) { return b.rev; })) || 1;

  var barsHTML = bars.map(function(b, idx) {
    var h = Math.round((b.rev / maxRev) * 64);
    var isCurrent = idx === 5;
    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:78px;justify-content:flex-end">' +
      '<div style="width:100%;height:' + Math.max(h, 3) + 'px;' +
        'background:' + (isCurrent ? 'var(--ink)' : 'var(--line)') + ';' +
        'border-radius:2px 2px 0 0;transition:height 0.5s cubic-bezier(0.2,0.8,0.2,1)"></div>' +
      '<div class="micro" style="font-size:9px">' + b.label + '</div>' +
    '</div>';
  }).join('');

  /* ── Piezas impresas (total ítems aceptados) ─── */
  var piecesCount = quotes.filter(function(q) { return q.status === 'aceptada'; })
    .reduce(function(s, q) { return s + (q.items ? q.items.length : 1); }, 0);

  /* ── Cotizaciones recientes ─── */
  var recent      = quotes.slice(0, 4);
  var recentRows  = recent.length === 0
    ? '<div style="padding:20px;text-align:center;font-size:13px;color:var(--ink-3)">Sin cotizaciones aún</div>'
    : recent.map(function(q) {
        var total  = q.grandTotal != null ? q.grandTotal : (q.totalWithQty || 0);
        var status = q.status || 'pendiente';
        var statusColor = status === 'aceptada' ? 'var(--ok)' : status === 'rechazada' ? 'var(--danger)' : status === 'enviada' ? 'var(--accent)' : 'var(--ink-4)';
        var statusDot   = '● ' + (status === 'aceptada' ? 'aceptada' : status === 'rechazada' ? 'rechazada' : status === 'enviada' ? 'enviada' : 'borrador');
        var num = q.quoteNum ? q.quoteNum.replace('COT-','') : '?';
        return '<div class="row" style="padding:14px 0;cursor:pointer" onclick="showPage(\'quotes\')">' +
          '<div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">' +
            '<div style="width:32px;height:32px;border-radius:6px;background:var(--bg-sunk);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:10px;color:var(--ink-2);flex-shrink:0">' + num + '</div>' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(q.items && q.items[0] ? q.items[0].desc : (q.desc || q.client)) + '</div>' +
              '<div style="font-size:11px;color:var(--ink-3);margin-top:2px">' +
                esc(q.client) + ' · ' +
                '<span style="color:' + statusColor + '">' + statusDot + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="num" style="font-size:14px;font-weight:500">' + cur + total.toFixed(0) + '</div>' +
        '</div>';
      }).join('');

  /* ── Armar todo el contenido ─── */
  dashContent.innerHTML =

    /* 1. Hero stat card */
    '<div style="padding:0 20px">' +
      '<div class="card" style="padding:22px;position:relative;overflow:hidden">' +
        '<div style="margin-bottom:18px">' +
          '<div class="micro">Ingresos aceptados · ' + _MES_ES[now.getMonth()] + '</div>' +
          '<div class="display" style="font-size:48px;margin-top:8px;line-height:1">' +
            cur + '<span style="font-variant-numeric:tabular-nums">' + formatNum(monthRevenue) + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:16px;margin-top:10px;font-size:12px;color:var(--ink-2)">' +
            '<span class="num">' + monthAccepted.length + ' cotizaciones</span>' +
            (monthMarginPct !== null
              ? '<span><span class="num" style="color:var(--ok)">' + monthMarginPct + '% margen</span></span>'
              : '') +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:flex-end;gap:8px">' + barsHTML + '</div>' +
      '</div>' +
    '</div>' +

    /* 2. Accesos rápidos */
    '<div style="padding:24px 20px 0">' +
      '<div class="micro" style="margin-bottom:10px">Accesos rápidos</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<button onclick="showPage(\'calc\')" class="card" style="padding:16px;text-align:left;display:flex;flex-direction:column;gap:10px;min-height:96px">' +
          '<span class="material-symbols-rounded" style="font-size:22px;color:var(--accent)">calculate</span>' +
          '<div>' +
            '<div style="font-size:14px;font-weight:500;letter-spacing:-0.01em">Nueva cotización</div>' +
            '<div style="font-size:11px;color:var(--ink-3);margin-top:2px">Calcular costo de pieza</div>' +
          '</div>' +
        '</button>' +
        '<button onclick="showPage(\'quotes\')" class="card" style="padding:16px;text-align:left;display:flex;flex-direction:column;gap:10px;min-height:96px">' +
          '<span class="material-symbols-rounded" style="font-size:22px;color:var(--ink-2)">receipt_long</span>' +
          '<div>' +
            '<div style="font-size:14px;font-weight:500;letter-spacing:-0.01em">Ver cotizaciones</div>' +
            '<div style="font-size:11px;color:var(--ink-3);margin-top:2px">' + monthQuotes.length + ' este mes</div>' +
          '</div>' +
        '</button>' +
      '</div>' +
    '</div>' +

    /* 3. Cotizaciones recientes */
    '<div style="padding:24px 20px 0">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<div class="micro">Cotizaciones recientes</div>' +
        '<button onclick="showPage(\'quotes\')" style="font-size:12px;color:var(--ink-2)">Ver todo →</button>' +
      '</div>' +
      '<div class="card" style="padding:0 16px">' + recentRows + '</div>' +
    '</div>' +

    /* 4. Salud del negocio */
    '<div style="padding:24px 20px 0">' +
      '<div class="micro" style="margin-bottom:10px">Salud del negocio</div>' +
      '<div class="card" style="padding:0 16px">' +
        '<div class="row" style="padding:14px 0">' +
          '<div class="row-label">Margen promedio</div>' +
          '<div class="row-value">' + (monthMarginPct !== null ? monthMarginPct + '%' : '—') + '</div>' +
        '</div>' +
        '<div class="row" style="padding:14px 0">' +
          '<div class="row-label">Ganancia del mes</div>' +
          '<div class="row-value">' + (hasMarginData ? cur + formatNum(monthProfit) : '—') + '</div>' +
        '</div>' +
        '<div class="row" style="padding:14px 0">' +
          '<div class="row-label">Tasa de aceptación</div>' +
          '<div class="row-value">' + (monthQuotes.length > 0 ? acceptRate + '%' : '—') +
            (acceptRate > 60 ? ' <span style="color:var(--ok);font-size:11px">↑</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="row" style="padding:14px 0;border-bottom:none">' +
          '<div class="row-label">Piezas impresas</div>' +
          '<div class="row-value">' + piecesCount + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function formatNum(n) {
  if (n >= 1000) {
    return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return n.toFixed(2);
}
