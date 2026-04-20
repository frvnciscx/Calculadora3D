// Cotizaciones — lista + clientes
const QuotesPage = ({ setPage, currency }) => {
  const [tab, setTab] = React.useState('cotizaciones');
  const [filter, setFilter] = React.useState('todas');

  const quotes = [
    { id: '042', client: 'Ana Ramírez', piece: 'Topper cumpleaños Marvel', total: 245, state: 'aceptada', date: '04 Jun' },
    { id: '041', client: 'Luis Mendoza', piece: 'Figura resina 12cm', total: 890, state: 'enviada', date: '03 Jun' },
    { id: '040', client: 'Brenda Gómez', piece: 'Soporte celular x6', total: 420, state: 'aceptada', date: '03 Jun' },
    { id: '039', client: 'Carlos Villa', piece: 'Llavero personalizado x20', total: 680, state: 'borrador', date: '02 Jun' },
    { id: '038', client: 'Ana Ramírez', piece: 'Maceta geométrica L', total: 320, state: 'aceptada', date: '01 Jun' },
    { id: '037', client: 'Diana Soto', piece: 'Cenefa decorativa', total: 1450, state: 'rechazada', date: '31 May' },
    { id: '036', client: 'Pablo Cruz', piece: 'Pieza repuesto cafetera', total: 180, state: 'aceptada', date: '30 May' },
  ];

  const clients = [
    { name: 'Ana Ramírez', quotes: 8, total: 2840, last: 'hoy' },
    { name: 'Luis Mendoza', quotes: 3, total: 1620, last: 'ayer' },
    { name: 'Brenda Gómez', quotes: 5, total: 1980, last: 'ayer' },
    { name: 'Carlos Villa', quotes: 2, total: 1160, last: '2 días' },
    { name: 'Diana Soto', quotes: 4, total: 3200, last: '1 sem' },
  ];

  const filtered = filter === 'todas' ? quotes : quotes.filter(q => q.state === filter);

  const stateDot = (s) => ({
    aceptada: 'var(--ok)',
    enviada: 'var(--accent)',
    borrador: 'var(--ink-4)',
    rechazada: 'var(--danger)',
  }[s]);

  return (
    <div className="page">
      <OfflineBanner />

      <PageHeader
        eyebrow="42 cotizaciones · 24 este mes"
        title="Cotizaciones"
      />

      <div style={{ padding: '0 20px 16px' }}>
        <div className="seg" style={{ width: '100%', display: 'flex' }}>
          <button className={tab === 'cotizaciones' ? 'active' : ''} onClick={() => setTab('cotizaciones')} style={{ flex: 1 }}>Cotizaciones</button>
          <button className={tab === 'clientes' ? 'active' : ''} onClick={() => setTab('clientes')} style={{ flex: 1 }}>Clientes</button>
        </div>
      </div>

      {tab === 'cotizaciones' && (
        <>
          {/* Search */}
          <div style={{ padding: '0 20px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-sunk)', border: '0.5px solid var(--line)', borderRadius: 10 }}>
              <IcSearch size={16} style={{ color: 'var(--ink-3)' }} />
              <input placeholder="Buscar cotización, cliente o pieza" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14 }} />
            </div>
          </div>

          {/* Filter chips */}
          <div className="hscroll" style={{ padding: '0 20px 16px', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[
              { id: 'todas', label: 'Todas', count: quotes.length },
              { id: 'aceptada', label: 'Aceptadas', count: quotes.filter(q => q.state === 'aceptada').length },
              { id: 'enviada', label: 'Enviadas', count: quotes.filter(q => q.state === 'enviada').length },
              { id: 'borrador', label: 'Borradores', count: quotes.filter(q => q.state === 'borrador').length },
              { id: 'rechazada', label: 'Rechazadas', count: quotes.filter(q => q.state === 'rechazada').length },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: '0.5px solid ' + (filter === f.id ? 'var(--ink)' : 'var(--line)'),
                background: filter === f.id ? 'var(--ink)' : 'transparent',
                color: filter === f.id ? 'var(--bg)' : 'var(--ink-2)',
                fontSize: 12,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {f.label} <span style={{ opacity: 0.6, marginLeft: 4, fontFamily: 'var(--font-mono)' }}>{f.count}</span>
              </button>
            ))}
          </div>

          {/* List grouped by date */}
          <div style={{ padding: '0 20px' }}>
            {['04 Jun', '03 Jun', '02 Jun', '01 Jun', '31 May', '30 May'].map(date => {
              const items = filtered.filter(q => q.date === date);
              if (!items.length) return null;
              return (
                <div key={date} style={{ marginBottom: 20 }}>
                  <div className="micro" style={{ marginBottom: 10 }}>{date}</div>
                  <div className="card" style={{ padding: '0 16px' }}>
                    {items.map((q, i) => (
                      <div key={q.id} className="row" style={{ padding: '14px 0', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: 'var(--bg-sunk)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--ink-2)',
                            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.05em',
                            flexShrink: 0, fontWeight: 500,
                          }}>{q.id}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.piece}</div>
                            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: stateDot(q.state) }} />
                              <span style={{ textTransform: 'capitalize' }}>{q.state}</span>
                              <span style={{ color: 'var(--ink-4)' }}>·</span>
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.client}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: 10 }}>
                          <div className="num" style={{ fontSize: 14, fontWeight: 500 }}>{fmt(q.total, currency)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '0 20px' }}>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setPage('calc')}>
              <IcPlus size={16} /> Nueva cotización
            </button>
          </div>
        </>
      )}

      {tab === 'clientes' && (
        <>
          <div style={{ padding: '0 20px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-sunk)', border: '0.5px solid var(--line)', borderRadius: 10 }}>
              <IcSearch size={16} style={{ color: 'var(--ink-3)' }} />
              <input placeholder="Buscar cliente" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14 }} />
            </div>
          </div>

          <div style={{ padding: '8px 20px' }}>
            <div className="card" style={{ padding: '0 16px' }}>
              {clients.map((c, i) => (
                <div key={i} className="row" style={{ padding: '14px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'var(--bg-sunk)',
                      border: '0.5px solid var(--line)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 500,
                    }}>{c.name.split(' ').map(w => w[0]).join('')}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                        <span className="num">{c.quotes}</span> cotizaciones · última {c.last}
                      </div>
                    </div>
                  </div>
                  <div className="num" style={{ fontSize: 13, fontWeight: 500 }}>{fmt(c.total, currency)}</div>
                </div>
              ))}
            </div>

            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 16 }} onClick={() => setPage('new-client')}>
              <IcPlus size={16} /> Nuevo cliente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

Object.assign(window, { QuotesPage });
