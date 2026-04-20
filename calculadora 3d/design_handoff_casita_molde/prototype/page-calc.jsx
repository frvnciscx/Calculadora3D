// Calcular — la pantalla protagonista
const CalcPage = ({ setPage, currency }) => {
  const [weight, setWeight] = React.useState(15);
  const [time, setTime] = React.useState(1.5);
  const [designTime, setDesignTime] = React.useState(0.5);
  const [margin, setMargin] = React.useState(50);
  const [printer, setPrinter] = React.useState('Bambu X1C');
  const [material, setMaterial] = React.useState('PLA · Naranja');
  const [tab, setTab] = React.useState('cotizar');
  const [showBreakdown, setShowBreakdown] = React.useState(true);
  const [hasPaint, setHasPaint] = React.useState(false);
  const [paintHrs, setPaintHrs] = React.useState(0.3);
  const [colors, setColors] = React.useState(2);
  const [hasResin, setHasResin] = React.useState(false);
  const [supports, setSupports] = React.useState(12);

  // Calculations
  const mat = (weight * 0.38);                 // $/g ~ PLA
  const energy = time * 1.2 * 3.5;             // kWh*costo
  const design = designTime * 180;             // $/hr diseño
  const deprec = time * 8;                     // $/hr impresora
  const fixed = time * 15;                     // costos fijos
  const waste = (mat + energy) * 0.07;         // 7% desperdicio
  const paint = hasPaint ? (paintHrs * 150 + colors * 18 + 25) : 0;
  const resin = hasResin ? (weight * (1 + supports/100) * 0.09 + 45) : 0;

  const base = mat + energy + design + deprec + fixed + waste + paint + resin;
  const total = base * (1 + margin / 100);

  const parts = [
    { k: 'Material', v: mat, color: 'var(--ink)' },
    { k: 'Energía', v: energy, color: 'var(--ink-2)' },
    { k: 'Diseño', v: design, color: 'var(--accent)' },
    { k: 'Depreciación', v: deprec, color: 'var(--ink-3)' },
    { k: 'Costos fijos', v: fixed, color: 'var(--ink-4)' },
    { k: 'Desperdicio', v: waste, color: 'var(--line)' },
    ...(hasPaint ? [{ k: 'Post-pintura', v: paint, color: 'var(--ink-2)' }] : []),
    ...(hasResin ? [{ k: 'Post-resina', v: resin, color: 'var(--ink-3)' }] : []),
  ].filter(p => p.v > 0.01);

  return (
    <div className="page">
      <OfflineBanner />

      {/* Header */}
      <div style={{ padding: '18px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setPage('quotes')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: 13 }}>
          <IcBack size={16} /> Cotizaciones
        </button>
        <div className="seg" style={{ fontSize: 12 }}>
          <button className={tab === 'cotizar' ? 'active' : ''} onClick={() => setTab('cotizar')}>Cotizar</button>
          <button className={tab === 'preset' ? 'active' : ''} onClick={() => setTab('preset')}>Presets</button>
          <button className={tab === 'historial' ? 'active' : ''} onClick={() => setTab('historial')}>Historial</button>
        </div>
      </div>

      {/* HERO — total */}
      <div style={{ padding: '6px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="micro">Costo total sugerido</div>
          <div className="micro" style={{ color: 'var(--ink-4)' }}>{currency} · {margin}% margen</div>
        </div>
        <div className="display" style={{ fontSize: 72, lineHeight: 0.9, letterSpacing: '-0.03em' }}>
          {fmt(total, currency)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, color: 'var(--ink-2)' }}>
          <span>Costo base</span>
          <span className="num" style={{ color: 'var(--ink) '}}>{fmt(base, currency)}</span>
          <span style={{ color: 'var(--ink-4)' }}>·</span>
          <span>Ganancia</span>
          <span className="num" style={{ color: 'var(--ok)' }}>+{fmt(total - base, currency)}</span>
        </div>

        {/* Composition bar */}
        <div style={{ marginTop: 14, height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
          {parts.map((p, i) => (
            <div key={i} style={{ background: p.color, flex: p.v, transition: 'flex 0.35s' }} />
          ))}
        </div>

        {/* Legend */}
        <button onClick={() => setShowBreakdown(!showBreakdown)} style={{
          marginTop: 12, width: '100%', padding: '10px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: '0.5px solid var(--line)', borderRadius: 10,
          fontSize: 13, color: 'var(--ink-2)',
        }}>
          <span>{showBreakdown ? 'Ocultar desglose' : 'Ver desglose'} · {parts.length} rubros</span>
          <IcChev size={14} style={{ transform: showBreakdown ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </button>

        {showBreakdown && (
          <div className="card" style={{ padding: '4px 16px', marginTop: 10 }}>
            {parts.map((p, i) => (
              <div key={i} className="row" style={{ padding: '11px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Swatch color={p.color} />
                  <span style={{ fontSize: 13 }}>{p.k}</span>
                </div>
                <div className="num" style={{ fontSize: 13 }}>{fmt(p.v, currency)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section — datos de la pieza */}
      <div style={{ padding: '18px 20px 0' }}>
        <div className="rule micro" style={{ marginBottom: 18 }}>01 · Datos de la pieza</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="field">
            <label>Peso</label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <input className="num-input" type="number" value={weight} onChange={e => setWeight(+e.target.value || 0)} style={{ border: 'none', flex: 1, padding: 0 }} />
              <span className="suffix">g</span>
            </div>
          </div>
          <div className="field">
            <label>Tiempo impresión</label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <input className="num-input" type="number" step="0.1" value={time} onChange={e => setTime(+e.target.value || 0)} style={{ border: 'none', flex: 1, padding: 0 }} />
              <span className="suffix">hrs</span>
            </div>
          </div>
        </div>

        <div className="field" style={{ marginBottom: 16 }}>
          <label>Descripción</label>
          <input type="text" placeholder="Ej. Topper cumpleaños personalizado" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>Tiempo diseño</label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <input className="num-input" type="number" step="0.1" value={designTime} onChange={e => setDesignTime(+e.target.value || 0)} style={{ border: 'none', flex: 1, padding: 0 }} />
              <span className="suffix">hrs</span>
            </div>
          </div>
          <div className="field">
            <label>Cantidad</label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <input className="num-input" type="number" defaultValue="1" style={{ border: 'none', flex: 1, padding: 0 }} />
              <span className="suffix">uds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section — impresora y material */}
      <div style={{ padding: '28px 20px 0' }}>
        <div className="rule micro" style={{ marginBottom: 18 }}>02 · Impresora y material</div>
        <div style={{ display: 'grid', gap: 10 }}>
          <button className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
            <IcPrinter size={20} stroke={1.3} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{printer}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>FDM · 256×256×256 · $8/hr depreciación</div>
            </div>
            <IcChev size={14} style={{ color: 'var(--ink-4)' }} />
          </button>
          <button className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--ink)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{material}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Polymaker · $0.38/g · quedan 840g</div>
            </div>
            <IcChev size={14} style={{ color: 'var(--ink-4)' }} />
          </button>
        </div>
      </div>

      {/* Section — Post-procesado */}
      <div style={{ padding: '28px 20px 0' }}>
        <div className="rule micro" style={{ marginBottom: 18 }}>03 · Post-procesado</div>

        {/* Pintura */}
        <div className="card" style={{ padding: 16, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: hasPaint ? 14 : 0 }}>
            <IcPalette size={18} stroke={1.3} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Pintura</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Primer, color, barniz</div>
            </div>
            <div className={`switch ${hasPaint ? 'on' : ''}`} onClick={() => setHasPaint(!hasPaint)} />
          </div>
          {hasPaint && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="micro" style={{ display: 'block', marginBottom: 6 }}>Colores · {colors}</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setColors(n)} style={{
                        flex: 1, height: 32, borderRadius: 6,
                        background: n <= colors ? 'var(--ink)' : 'var(--bg-sunk)',
                        color: n <= colors ? 'var(--bg)' : 'var(--ink-3)',
                        fontFamily: 'var(--font-mono)', fontSize: 12,
                        border: '0.5px solid var(--line)',
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="micro" style={{ display: 'block', marginBottom: 8 }}>Tiempo de pintado · {paintHrs}h</label>
                <input className="slider" type="range" min="0" max="3" step="0.1" value={paintHrs} onChange={e => setPaintHrs(+e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '0.5px solid var(--line)', fontSize: 12 }}>
                <span style={{ color: 'var(--ink-3)' }}>Total pintura</span>
                <span className="num">{fmt(paint, currency)}</span>
              </div>
            </>
          )}
        </div>

        {/* Resina */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: hasResin ? 14 : 0 }}>
            <IcDrop size={18} stroke={1.3} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Proceso resina</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Lavado IPA + curado UV</div>
            </div>
            <div className={`switch ${hasResin ? 'on' : ''}`} onClick={() => setHasResin(!hasResin)} />
          </div>
          {hasResin && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="micro" style={{ display: 'block', marginBottom: 6 }}>Soportes · {supports}%</label>
                  <input className="slider" type="range" min="0" max="40" value={supports} onChange={e => setSupports(+e.target.value)} />
                </div>
                <div>
                  <label className="micro" style={{ display: 'block', marginBottom: 6 }}>Peso c/ soportes</label>
                  <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>
                    {(weight * (1 + supports/100)).toFixed(1)}<span style={{ color: 'var(--ink-3)', fontSize: 12 }}>g</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '0.5px solid var(--line)', fontSize: 12 }}>
                <span style={{ color: 'var(--ink-3)' }}>Total post-resina</span>
                <span className="num">{fmt(resin, currency)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Margen */}
      <div style={{ padding: '28px 20px 0' }}>
        <div className="rule micro" style={{ marginBottom: 18 }}>04 · Margen de ganancia</div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="display" style={{ fontSize: 44 }}>
              {margin}<span style={{ fontSize: 22, color: 'var(--ink-3)' }}>%</span>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--ink-3)' }}>
              <div>Ganancia</div>
              <div className="num" style={{ fontSize: 15, color: 'var(--ok)', fontWeight: 500 }}>+{fmt(total - base, currency)}</div>
            </div>
          </div>
          <input className="slider" type="range" min="0" max="150" value={margin} onChange={e => setMargin(+e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
            <span>0%</span><span>50%</span><span>100%</span><span>150%</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '28px 20px 0', display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }}>
          <IcStar size={16} /> Guardar preset
        </button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setPage('generate')}>
          <IcReceipt size={16} /> Generar cotización
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { CalcPage });
