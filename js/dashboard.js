/* ===== DASHBOARD ===== */

function renderDashboard() {
  /* First-run: sin impresoras configuradas — mostrar guía */
  var needsSetup = printers.length === 0 || materials.length === 0;
  if (needsSetup) {
    document.getElementById('dash-stats').innerHTML =
      '<div class="dash-onboarding">' +
        '<span class="material-symbols-rounded" style="font-size:40px;color:var(--accent-warm);margin-bottom:12px">view_in_ar</span>' +
        '<h2 style="font-size:18px;font-weight:700;margin-bottom:8px">¡Bienvenido a Calculadora 3D!</h2>' +
        '<p style="font-size:14px;color:var(--md-on-surface-variant);margin-bottom:20px;line-height:1.6">Para empezar a calcular costos necesitas configurar al menos una impresora y un material.</p>' +
        '<div style="display:flex;flex-direction:column;gap:10px;">' +
          (printers.length === 0 ? '<button class="m3-btn-filled" onclick="showPage(\'printers\')" style="background:var(--md-primary)"><span class="material-symbols-rounded" style="font-size:18px">print</span> Agregar impresora</button>' : '<div style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--accent-mint)"><span class="material-symbols-rounded">check_circle</span> Impresora configurada</div>') +
          (materials.length === 0 ? '<button class="m3-btn-outlined" onclick="showPage(\'materials\')"><span class="material-symbols-rounded" style="font-size:18px">category</span> Agregar material</button>' : '<div style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--accent-mint)"><span class="material-symbols-rounded">check_circle</span> Material configurado</div>') +
        '</div>' +
      '</div>';
    document.getElementById('dash-recent-list').innerHTML = '';
    document.getElementById('dash-recent').style.display = 'none';
    var mh = document.getElementById('dash-monthly-history');
    if (mh) mh.style.display = 'none';
    return;
  }
  document.getElementById('dash-recent').style.display = '';
  var mh = document.getElementById('dash-monthly-history');
  if (mh) mh.style.display = '';

  var cur = config.currency;
  var now = new Date();
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  /* ── Stats ─────────────────────────────────────────────────────── */
  var totalQuotes    = quotes.length;
  var acceptedQuotes = quotes.filter(function(q) { return q.status === 'aceptada'; });
  var totalRevenue   = acceptedQuotes.reduce(function(s, q) {
    return s + (q.grandTotal != null ? q.grandTotal : (q.totalWithQty || 0));
  }, 0);

  var monthQuotes = quotes.filter(function(q) { return new Date(q.quoteDate) >= monthStart; });
  var monthAccepted = monthQuotes.filter(function(q) { return q.status === 'aceptada'; });
  var monthRevenue = monthAccepted.reduce(function(s, q) {
    return s + (q.grandTotal != null ? q.grandTotal : (q.totalWithQty || 0));
  }, 0);

  var pendingCount = quotes.filter(function(q) { return !q.status || q.status === 'pendiente'; }).length;

  /* Inventory alerts */
  var invSummary = (typeof getInventorySummary === 'function') ? getInventorySummary() : { total: 0, lowStock: 0 };

  /* Top printer */
  var printerCount = {};
  quotes.forEach(function(q) {
    if (q.printer) printerCount[q.printer] = (printerCount[q.printer] || 0) + 1;
    if (q.items) q.items.forEach(function(it) {
      if (it.printer) printerCount[it.printer] = (printerCount[it.printer] || 0) + 1;
    });
  });
  var topPrinter = '—';
  var topPrinterN = 0;
  Object.keys(printerCount).forEach(function(k) {
    if (printerCount[k] > topPrinterN) { topPrinter = k; topPrinterN = printerCount[k]; }
  });

  /* ── Stat cards ─────────────────────────────────────────────────── */
  var statsEl = document.getElementById('dash-stats');
  statsEl.innerHTML =
    '<div class="dash-stat-card dash-stat-primary">' +
      '<span class="material-symbols-rounded dash-stat-icon">receipt_long</span>' +
      '<div class="dash-stat-val">' + totalQuotes + '</div>' +
      '<div class="dash-stat-label">Cotizaciones</div>' +
    '</div>' +
    '<div class="dash-stat-card dash-stat-accent">' +
      '<span class="material-symbols-rounded dash-stat-icon">payments</span>' +
      '<div class="dash-stat-val">' + cur + formatNum(totalRevenue) + '</div>' +
      '<div class="dash-stat-label">Ingresos aceptados</div>' +
    '</div>' +
    '<div class="dash-stat-card">' +
      '<span class="material-symbols-rounded dash-stat-icon">trending_up</span>' +
      '<div class="dash-stat-val">' + cur + formatNum(monthRevenue) + '</div>' +
      '<div class="dash-stat-label">Este mes ✓</div>' +
    '</div>' +
    '<div class="dash-stat-card">' +
      '<span class="material-symbols-rounded dash-stat-icon">schedule</span>' +
      '<div class="dash-stat-val">' + pendingCount + '</div>' +
      '<div class="dash-stat-label">Pendientes</div>' +
    '</div>' +
    '<div class="dash-stat-card">' +
      '<span class="material-symbols-rounded dash-stat-icon">print</span>' +
      '<div class="dash-stat-val dash-stat-val-sm">' + topPrinter + '</div>' +
      '<div class="dash-stat-label">Impresora más usada</div>' +
    '</div>' +
    (invSummary.lowStock > 0
      ? '<div class="dash-stat-card" style="border-color:var(--md-error);cursor:pointer" onclick="showPage(\'inventory\')">' +
          '<span class="material-symbols-rounded dash-stat-icon" style="color:var(--md-error)">warning</span>' +
          '<div class="dash-stat-val" style="color:var(--md-error)">' + invSummary.lowStock + '</div>' +
          '<div class="dash-stat-label">Stock bajo</div>' +
        '</div>'
      : '<div class="dash-stat-card">' +
          '<span class="material-symbols-rounded dash-stat-icon">inventory_2</span>' +
          '<div class="dash-stat-val">' + invSummary.total + '</div>' +
          '<div class="dash-stat-label">Rollos en stock</div>' +
        '</div>');

  /* ── Monthly history (last 6 months) ───────────────────────────── */
  var mhContent = document.getElementById('dash-monthly-content');
  if (mhContent) {
    var months = [];
    for (var m = 5; m >= 0; m--) {
      var d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      var mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      var mEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      var mName  = d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });

      var mAll = quotes.filter(function(q) {
        var qd = new Date(q.quoteDate);
        return qd >= mStart && qd <= mEnd;
      });
      var mAcc = mAll.filter(function(q) { return q.status === 'aceptada'; });
      var mRev = mAcc.reduce(function(s, q) {
        return s + (q.grandTotal != null ? q.grandTotal : (q.totalWithQty || 0));
      }, 0);

      months.push({ name: mName, total: mAll.length, accepted: mAcc.length, revenue: mRev });
    }

    /* Max revenue for bar scaling */
    var maxRev = Math.max.apply(null, months.map(function(mm) { return mm.revenue; }));
    if (maxRev === 0) maxRev = 1;

    mhContent.innerHTML = months.map(function(mm, idx) {
      var barPct = Math.round((mm.revenue / maxRev) * 100);
      var isCurrentMonth = idx === 5;
      return '<div class="month-row' + (isCurrentMonth ? ' month-row-current' : '') + '">' +
        '<div class="month-name">' + mm.name + '</div>' +
        '<div class="month-bar-wrap">' +
          '<div class="month-bar" style="width:' + Math.max(barPct, 2) + '%"></div>' +
        '</div>' +
        '<div class="month-stats">' +
          '<span class="month-rev">' + (mm.revenue > 0 ? cur + formatNum(mm.revenue) : '—') + '</span>' +
          '<span class="month-count">' + mm.accepted + '/' + mm.total + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ── Recent quotes (last 5) ─────────────────────────────────────── */
  var recentEl = document.getElementById('dash-recent-list');
  if (totalQuotes === 0) {
    recentEl.innerHTML = '<div class="empty-state" style="padding:24px 0"><span class="material-symbols-rounded">receipt_long</span><p>Aún no hay cotizaciones. Calcula un costo y genera tu primera cotización.</p></div>';
  } else {
    var recent = quotes.slice(0, 5);
    recentEl.innerHTML = recent.map(function(q) {
      var total = q.grandTotal != null ? q.grandTotal : (q.totalWithQty || 0);
      var status = q.status || 'pendiente';
      return '<div class="dash-recent-item" onclick="showPage(\'quotes\')">' +
        '<div class="dash-recent-left">' +
          '<div class="dash-recent-num">' + q.quoteNum + '</div>' +
          '<div class="dash-recent-client">' + q.client + '</div>' +
          '<div class="dash-recent-date">' + new Date(q.quoteDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' +
          '<div class="dash-recent-total">' + cur + total.toFixed(2) + '</div>' +
          '<span class="status-badge status-' + status + '">' + statusLabel(status) + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }
}

function formatNum(n) {
  if (n >= 1000) {
    return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return n.toFixed(2);
}
