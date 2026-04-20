// Catálogo — impresoras, materiales, inventario
const CatalogPage = ({ setPage, currency }) => {
  const [tab, setTab] = React.useState('impresoras');

  const printers = [
    { name: 'Bambu Lab X1 Carbon', type: 'FDM', status: 'activa', use: 128, dep: 8, color: 'oklch(30% 0.02 60)' },
    { name: 'Elegoo Saturn 3 Ultra', type: 'Resina', status: 'activa', use: 42, dep: 12, color: 'oklch(60% 0.14 220)' },
    { name: 'Ender 3 V2', type: 'FDM', status: 'pausada', use: 320, dep: 3, color: 'oklch(70% 0.04 60)' },
  ];

  const materials = [
    { name: 'PLA Naranja Polymaker', kind: 'PLA', price: 0.38, stock: 840, total: 1000, color: 'oklch(62% 0.15 45)' },
    { name: 'PLA Negro mate', kind: 'PLA', price: 0.35, stock: 320, total: 1000, color: 'oklch(20% 0.01 60)' },
    { name: 'PETG Transparente', kind: 'PETG', price: 0.52, stock: 720, total: 1000, color: 'oklch(90% 0.02 180)' },
    { name: 'Resina ABS-like gris', kind: 'Resina', price: 0.89, stock: 480, total: 1000, color: 'oklch(55% 0.01 60)' },
    { name: 'TPU 95A Negro', kind: 'TPU', price: 0.68, stock: 180, total: 500, color: 'oklch(25% 0.01 60)' },
  ];

  const inventory = [
    { name: 'IPA Alcohol isopropílico', qty: '2.4', unit: 'L', price: '180/L', low: false },
    { name: 'Primer gris base', qty: '3', unit: 'uds', price: '95/u', low: false },
    { name: 'Barniz satinado', qty: '1', unit: 'ud', price: '120/u', low: true },
    { name: 'Pintura acrílica · 24 colores', qty: '22', unit: 'uds', price: '35/u', low: false },
    { name: 'Masilla reparadora', qty: '0', unit: 'uds', price: '65/u', low: true },
  ];

  return (
    <div className="page">
      <OfflineBanner />

      <PageHeader
        eyebrow="Recursos del estudio"
        title="Catálogo"
        trailing={
          <button className="btn btn-primary" style={{ height: 44, width: 44, padding: 0 }}>
            <IcPlus size={18} />
          </button>
        }
      />

      <div style={{ padding: '0 20px 16px' }}>
        <div className="seg" style={{ width: '100%', display: 'flex' }}>
          <button className={tab === 'impresoras' ? 'active' : ''} onClick={() => setTab('impresoras')} style={{ flex: 1 }}>Impresoras</button>
          <button className={tab === 'materiales' ? 'active' : ''} onClick={() => setTab('materiales')} style={{ flex: 1 }}>Materiales</button>
          <button className={tab === 'inventario' ? 'active' : ''} onClick={() => setTab('inventario')} style={{ flex: 1 }}>Inventario</button>
        </div>
      </div>

      {tab === 'impresoras' && (
        <div style={{ padding: '0 20px' }}>
          {printers.map((p, i) => (
            <div key={i} className="card" style={{ padding: 18, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: p.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0,
                }}>
                  <IcPrinter size={20} stroke={1.4} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>{p.name}</div>
                    <span className="tag" style={{ fontSize: 9 }}>{p.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <div>
                      <div className="micro">Uso</div>
                      <div className="num" style={{ fontSize: 16, marginTop: 2 }}>{p.use}<span style={{ color: 'var(--ink-3)', fontSize: 11 }}>h</span></div>
                    </div>
                    <div>
                      <div className="micro">Depreciación</div>
                      <div className="num" style={{ fontSize: 16, marginTop: 2 }}>${p.dep}<span style={{ color: 'var(--ink-3)', fontSize: 11 }}>/h</span></div>
                    </div>
                    <div>
                      <div className="micro">Estado</div>
                      <div style={{ fontSize: 13, marginTop: 2, color: p.status === 'activa' ? 'var(--ok)' : 'var(--ink-3)', textTransform: 'capitalize' }}>● {p.status}</div>
                    </div>
                  </div>
                </div>
                <button style={{ color: 'var(--ink-3)' }}><IcMore size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'materiales' && (
        <div style={{ padding: '0 20px' }}>
          {materials.map((m, i) => {
            const pct = (m.stock / m.total) * 100;
            return (
              <div key={i} className="card" style={{ padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: m.color, border: '0.5px solid var(--line)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{m.kind} · {fmt(m.price, currency)}/g</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="num" style={{ fontSize: 14, fontWeight: 500 }}>{m.stock}<span style={{ color: 'var(--ink-3)', fontSize: 11 }}>g</span></div>
                    <div className="micro" style={{ fontSize: 9, marginTop: 2 }}>/{m.total}g</div>
                  </div>
                </div>
                <div style={{ height: 3, background: 'var(--bg-sunk)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: pct < 30 ? 'var(--danger)' : pct < 60 ? 'var(--warn)' : 'var(--ink)',
                    transition: 'width 0.4s',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'inventario' && (
        <div style={{ padding: '0 20px' }}>
          <div className="card" style={{ padding: '0 16px' }}>
            {inventory.map((it, i) => (
              <div key={i} className="row" style={{ padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 7, background: 'var(--bg-sunk)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: it.low ? 'var(--danger)' : 'var(--ink-2)',
                  }}>
                    <IcBox size={16} stroke={1.3} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{it.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                      {fmt(parseFloat(it.price), currency)}/{it.price.split('/')[1]}
                      {it.low && <span style={{ color: 'var(--danger)', marginLeft: 8 }}>● stock bajo</span>}
                    </div>
                  </div>
                </div>
                <div className="num" style={{ fontSize: 15, fontWeight: 500, color: it.low ? 'var(--danger)' : 'var(--ink)' }}>
                  {it.qty}<span style={{ color: 'var(--ink-3)', fontSize: 11, marginLeft: 2 }}>{it.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { CatalogPage });
