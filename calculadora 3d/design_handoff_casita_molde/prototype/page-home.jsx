// Inicio — Dashboard
const HomePage = ({ setPage, data }) => {
  const bars = [
    { m: 'ENE', v: 0.4 }, { m: 'FEB', v: 0.55 }, { m: 'MAR', v: 0.3 },
    { m: 'ABR', v: 0.72 }, { m: 'MAY', v: 0.6 }, { m: 'JUN', v: 0.85 },
  ];
  const recentQuotes = [
    { id: 'COT-042', client: 'Ana R.', piece: 'Topper cumpleaños', total: 245, state: 'aceptada', when: 'hoy' },
    { id: 'COT-041', client: 'Luis M.', piece: 'Figura resina 12cm', total: 890, state: 'enviada', when: 'ayer' },
    { id: 'COT-040', client: 'Brenda G.', piece: 'Soporte celular x6', total: 420, state: 'aceptada', when: 'ayer' },
    { id: 'COT-039', client: 'Carlos V.', piece: 'Llavero personalizado x20', total: 680, state: 'borrador', when: '2 días' },
  ];

  return (
    <div className="page">
      <OfflineBanner />

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrandMark size={32} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>La Casita del Molde</div>
            <div className="micro" style={{ marginTop: 2 }}>Estudio · Junio 2026</div>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ height: 38, padding: '0 12px', fontSize: 13 }}>
          <IcUser size={16} />
        </button>
      </div>

      <PageHeader
        eyebrow="Resumen"
        title={<>Bienvenido,<br/><em>Francisco</em></>}
      />

      {/* Hero stat card */}
      <div style={{ padding: '0 20px' }}>
        <div className="card" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div className="micro">Ingresos aceptados · Junio</div>
              <div className="display" style={{ fontSize: 52, marginTop: 8 }}>
                $18,420<span style={{ color: 'var(--ink-3)', fontSize: 22 }}>.50</span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--ink-2)' }}>
                <span><span className="num" style={{ color: 'var(--ok)' }}>↑ 23%</span> vs. mayo</span>
                <span className="num" style={{ color: 'var(--ink-3)' }}>24 cotizaciones</span>
              </div>
            </div>
          </div>

          {/* Mini bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 78, marginTop: 8 }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '100%', height: `${b.v * 64}px`,
                  background: i === bars.length - 1 ? 'var(--ink)' : 'var(--line)',
                  borderRadius: '2px 2px 0 0',
                  transition: 'height 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }} />
                <div className="micro" style={{ fontSize: 9 }}>{b.m}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '24px 20px 0' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Accesos rápidos</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={() => setPage('calc')}
            className="card"
            style={{ padding: 16, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 100 }}
          >
            <IcCalc size={22} stroke={1.3} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>Nueva cotización</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Calcular costo de pieza</div>
            </div>
          </button>
          <button
            onClick={() => setPage('quotes')}
            className="card"
            style={{ padding: 16, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 100 }}
          >
            <IcReceipt size={22} stroke={1.3} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>Ver cotizaciones</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>24 este mes</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent quotes */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="micro">Cotizaciones recientes</div>
          <button onClick={() => setPage('quotes')} style={{ fontSize: 12, color: 'var(--ink-2)' }}>Ver todo →</button>
        </div>
        <div className="card" style={{ padding: '0 16px' }}>
          {recentQuotes.map((q, i) => (
            <div key={q.id} className="row" style={{ padding: '14px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: 'var(--bg-sunk)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--ink-2)',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  flexShrink: 0,
                }}>{q.id.split('-')[1]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.piece}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                    {q.client} · {q.when}
                    {q.state === 'aceptada' && <span style={{ color: 'var(--ok)', marginLeft: 6 }}>● aceptada</span>}
                    {q.state === 'enviada' && <span style={{ color: 'var(--accent)', marginLeft: 6 }}>● enviada</span>}
                    {q.state === 'borrador' && <span style={{ color: 'var(--ink-4)', marginLeft: 6 }}>● borrador</span>}
                  </div>
                </div>
              </div>
              <div className="num" style={{ fontSize: 14, fontWeight: 500 }}>{fmt(q.total)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Business health */}
      <div style={{ padding: '24px 20px 0' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Salud del negocio</div>
        <div className="card" style={{ padding: 18 }}>
          <div className="row">
            <div className="row-label">Margen promedio</div>
            <div className="row-value">52.4%</div>
          </div>
          <div className="row">
            <div className="row-label">Costo/hora promedio</div>
            <div className="row-value">$84.20</div>
          </div>
          <div className="row">
            <div className="row-label">Tasa de aceptación</div>
            <div className="row-value">
              78% <span style={{ color: 'var(--ok)', fontSize: 11, marginLeft: 4 }}>↑</span>
            </div>
          </div>
          <div className="row">
            <div className="row-label">Piezas impresas</div>
            <div className="row-value">142</div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { HomePage });
