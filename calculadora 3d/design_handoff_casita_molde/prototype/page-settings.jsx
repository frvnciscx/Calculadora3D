// Ajustes — settings
const SettingsPage = ({ setPage, theme, setTheme, currency, setCurrency }) => {
  const [kwh, setKwh] = React.useState(3.5);
  const [designRate, setDesignRate] = React.useState(180);
  const [waste, setWaste] = React.useState(7);
  const [fixedTotal, setFixedTotal] = React.useState(6500);
  const [printHrs, setPrintHrs] = React.useState(180);

  const fixedCats = [
    { name: 'Renta local', amount: 2800 },
    { name: 'Electricidad fija', amount: 900 },
    { name: 'Internet', amount: 450 },
    { name: 'Software y licencias', amount: 650 },
    { name: 'Marketing', amount: 1200 },
    { name: 'Otros', amount: 500 },
  ];

  return (
    <div className="page">
      <OfflineBanner />

      <PageHeader eyebrow="Configuración del estudio" title="Ajustes" />

      {/* Negocio */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Datos del negocio</div>
        <div className="card" style={{ padding: '4px 18px' }}>
          <div className="row">
            <div className="row-label">Nombre</div>
            <div className="row-value">La Casita del Molde</div>
          </div>
          <div className="row">
            <div className="row-label">WhatsApp</div>
            <div className="row-value">+52 55 4123 7890</div>
          </div>
          <div className="row">
            <div className="row-label">Email</div>
            <div className="row-value">hola@casitadelmolde.mx</div>
          </div>
          <div className="row">
            <div className="row-label">Instagram</div>
            <div className="row-value">@casitadelmolde</div>
          </div>
        </div>
      </div>

      {/* Electricidad y trabajo */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Electricidad y trabajo</div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="field">
              <label>Costo kWh</label>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                <span className="suffix">$</span>
                <input className="num-input" type="number" step="0.1" value={kwh} onChange={e => setKwh(+e.target.value)} style={{ border: 'none', flex: 1, padding: 0 }} />
              </div>
            </div>
            <div className="field">
              <label>Hora de diseño</label>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                <span className="suffix">$</span>
                <input className="num-input" type="number" value={designRate} onChange={e => setDesignRate(+e.target.value)} style={{ border: 'none', flex: 1, padding: 0 }} />
                <span className="suffix">/hr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Costos fijos */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <div className="micro">Costos fijos mensuales</div>
          <button style={{ fontSize: 12, color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IcPlus size={12} /> Categoría
          </button>
        </div>
        <div className="card" style={{ padding: '4px 18px' }}>
          {fixedCats.map((c, i) => (
            <div key={i} className="row">
              <div className="row-label">{c.name}</div>
              <div className="row-value">{fmt(c.amount, currency)}/mes</div>
            </div>
          ))}
          <div className="row" style={{ borderTop: '1px solid var(--ink)', paddingTop: 16, marginTop: 4, borderBottom: 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Total/mes</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>{fmt(fixedTotal, currency)}</div>
          </div>
        </div>
        <div className="card" style={{ padding: 18, marginTop: 10 }}>
          <div className="field">
            <label>Horas de impresión / mes</label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <input className="num-input" type="number" value={printHrs} onChange={e => setPrintHrs(+e.target.value)} style={{ border: 'none', flex: 1, padding: 0 }} />
              <span className="suffix">hrs/mes</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 10 }}>
            Costos fijos por hora de impresión: <span className="num" style={{ color: 'var(--ink)' }}>${(fixedTotal/printHrs).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Desperdicio */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Desperdicio y fallas</div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Factor de desperdicio</div>
            <div className="display" style={{ fontSize: 28 }}>{waste}<span style={{ fontSize: 14, color: 'var(--ink-3)' }}>%</span></div>
          </div>
          <input className="slider" type="range" min="0" max="25" value={waste} onChange={e => setWaste(+e.target.value)} />
        </div>
      </div>

      {/* Moneda */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Moneda</div>
        <div className="seg" style={{ width: '100%', display: 'flex' }}>
          {['MXN', 'USD', 'EUR'].map(c => (
            <button key={c} className={currency === c ? 'active' : ''} onClick={() => setCurrency(c)} style={{ flex: 1 }}>
              {c === 'MXN' ? '$ MXN' : c === 'USD' ? 'US$ USD' : '€ EUR'}
            </button>
          ))}
        </div>
      </div>

      {/* Apariencia */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Apariencia</div>
        <div className="seg" style={{ width: '100%', display: 'flex' }}>
          <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <IcSun size={14} /> Claro
          </button>
          <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <IcMoon size={14} /> Oscuro
          </button>
          <button className={theme === 'auto' ? 'active' : ''} onClick={() => setTheme('auto')} style={{ flex: 1 }}>
            Auto
          </button>
        </div>
      </div>

      {/* Diseño de cotización */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Plantilla de cotización</div>
        <button onClick={() => setPage('design')} className="card" style={{
          width: '100%', padding: 18, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        }}>
          <IcPalette size={20} stroke={1.3} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Diseño de cotización</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Logo, colores, campos visibles, textos</div>
          </div>
          <IcChev size={14} style={{ color: 'var(--ink-4)' }} />
        </button>
      </div>

      {/* Respaldo */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Respaldo</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="btn btn-ghost">
            <IcDownload size={16} /> Exportar
          </button>
          <button className="btn btn-ghost">
            <IcUpload size={16} /> Importar
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px 0', textAlign: 'center' }}>
        <div className="micro" style={{ color: 'var(--ink-4)' }}>v2.1.0 · La Casita del Molde</div>
      </div>
    </div>
  );
};

// Diseño de cotización — personalización visual
const DesignPage = ({ setPage, currency }) => {
  const [brandColor, setBrandColor] = React.useState('oklch(62% 0.15 45)');
  const [fields, setFields] = React.useState({
    breakdown: true, depreciation: false, fixed: false, waste: false, designTime: true, notes: true,
  });
  const colors = [
    'oklch(62% 0.15 45)', 'oklch(55% 0.11 250)', 'oklch(60% 0.12 150)',
    'oklch(55% 0.18 25)', 'oklch(25% 0.01 60)', 'oklch(70% 0.14 320)',
  ];

  return (
    <div className="page">
      <OfflineBanner />
      <PageHeader
        eyebrow="Personalización"
        title="Diseño de cotización"
        onBack={() => setPage('settings')}
      />

      {/* Preview */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Vista previa</div>
        <div className="card" style={{ padding: 20, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${brandColor}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 4, background: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <BrandMark size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>La Casita del Molde</div>
              <div style={{ fontSize: 9, color: 'var(--ink-3)' }}>COT-042 · 04 Jun 2026</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Cliente</div>
          <div style={{ marginBottom: 14 }}>Ana Ramírez</div>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Pieza</div>
          <div style={{ marginBottom: 14 }}>Topper cumpleaños Marvel · 15g · 1.5h</div>
          {fields.breakdown && (
            <div style={{ padding: '12px 0', borderTop: '0.5px solid var(--line)', borderBottom: '0.5px solid var(--line)', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--ink-2)' }}>Material</span>
                <span className="num">{fmt(5.70, currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--ink-2)' }}>Impresión y energía</span>
                <span className="num">{fmt(18.30, currency)}</span>
              </div>
              {fields.designTime && <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Tiempo de diseño</span>
                <span className="num">{fmt(90, currency)}</span>
              </div>}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="micro">Total</span>
            <div className="display" style={{ fontSize: 26, color: brandColor }}>{fmt(245, currency)}</div>
          </div>
        </div>
      </div>

      {/* Colores de marca */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Color de marca</div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {colors.map(c => (
              <button key={c} onClick={() => setBrandColor(c)} style={{
                width: 44, height: 44, borderRadius: 8,
                background: c,
                border: brandColor === c ? '2px solid var(--ink)' : '0.5px solid var(--line)',
                padding: 0,
                position: 'relative',
              }}>
                {brandColor === c && <IcCheck size={18} style={{ color: '#fff' }} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logo */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Logo</div>
        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="ph" style={{ width: 56, height: 56 }}>LOGO</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Sin logo</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>PNG o JPG, máximo 500KB</div>
          </div>
          <button className="btn btn-ghost" style={{ height: 36, padding: '0 14px', fontSize: 12 }}>Subir</button>
        </div>
      </div>

      {/* Campos visibles */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Campos visibles</div>
        <div className="card" style={{ padding: '4px 18px' }}>
          {[
            ['breakdown', 'Desglose de costos'],
            ['depreciation', 'Depreciación'],
            ['fixed', 'Costos fijos'],
            ['waste', 'Desperdicio'],
            ['designTime', 'Tiempo de diseño'],
            ['notes', 'Notas'],
          ].map(([k, label]) => (
            <div key={k} className="row">
              <div className="row-label">{label}</div>
              <div className={`switch ${fields[k] ? 'on' : ''}`} onClick={() => setFields({ ...fields, [k]: !fields[k] })} />
            </div>
          ))}
        </div>
      </div>

      {/* Textos */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Textos personalizados</div>
        <div className="card" style={{ padding: 18, display: 'grid', gap: 18 }}>
          <div className="field">
            <label>Términos y condiciones</label>
            <textarea rows="3" placeholder="Ej: Cotización válida por 15 días. 50% anticipo para iniciar producción." style={{
              resize: 'none', padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: 13,
            }} />
          </div>
          <div className="field">
            <label>Pie de página</label>
            <input placeholder="@casitadelmolde · hola@casitadelmolde.mx" />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <button className="btn btn-primary" style={{ width: '100%' }}>
          <IcSave size={16} /> Guardar plantilla
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { SettingsPage, DesignPage });
