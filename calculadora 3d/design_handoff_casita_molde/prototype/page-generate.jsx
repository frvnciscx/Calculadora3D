// Generar cotización — vista de preview + envío
const GenerateQuotePage = ({ setPage, currency }) => {
  const [step, setStep] = React.useState('preview'); // 'preview' | 'sent'
  const [client, setClient] = React.useState('Ana Ramírez');
  const [showClientPicker, setShowClientPicker] = React.useState(false);
  const [validity, setValidity] = React.useState(15);
  const [advance, setAdvance] = React.useState(50);
  const [notes, setNotes] = React.useState('Incluye empaque. Entrega estimada 3-5 días hábiles.');
  const [shareMenu, setShareMenu] = React.useState(false);

  const today = new Date();
  const fmtDate = (d) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  const validUntil = new Date(today.getTime() + validity * 864e5);

  // Sample values (would normally flow from Calc state)
  const pieceName = 'Topper cumpleaños Marvel';
  const pieceDesc = '15g · 1.5h impresión · PLA Naranja';
  const base = 128.30;
  const margin = 50;
  const total = base * (1 + margin / 100);
  const lineItems = [
    { k: 'Material', v: 5.70 },
    { k: 'Impresión y energía', v: 38.60 },
    { k: 'Diseño', v: 90.00 },
    { k: 'Acabado', v: 58.00 },
  ];

  const clients = ['Ana Ramírez', 'Luis Mendoza', 'Brenda Gómez', 'Carlos Villa', 'Diana Soto'];

  if (step === 'sent') {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)', padding: '40px 28px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--ok-tint)', color: 'var(--ok)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          animation: 'pageIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <IcCheck size={32} stroke={2} />
        </div>
        <div className="micro" style={{ marginBottom: 10 }}>Cotización enviada</div>
        <h1 className="display" style={{ fontSize: 40, margin: '0 0 16px', lineHeight: 0.95 }}>
          Lista para<br/><em style={{ fontStyle: 'italic' }}>{client.split(' ')[0]}</em>
        </h1>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 280, marginBottom: 32 }}>
          COT-043 se agregó a tu historial. Recibirás una notificación cuando sea vista.
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 320 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setStep('preview'); setPage('calc'); }}>
            Nueva
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setPage('quotes')}>
            Ver cotizaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <OfflineBanner />

      {/* Header */}
      <div style={{ padding: '18px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setPage('calc')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: 13 }}>
          <IcBack size={16} /> Editar
        </button>
        <div className="tag num">COT-043 · borrador</div>
      </div>

      <PageHeader
        eyebrow="Revisa y envía"
        title="Generar cotización"
      />

      {/* Cliente */}
      <div style={{ padding: '0 20px 16px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Cliente</div>
        <button
          onClick={() => setShowClientPicker(!showClientPicker)}
          className="card"
          style={{ width: '100%', padding: 14, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--bg-sunk)', border: '0.5px solid var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 500,
          }}>{client.split(' ').map(w => w[0]).join('')}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{client}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>+52 55 4123 7890 · @ana.r</div>
          </div>
          <IcChev size={14} style={{ color: 'var(--ink-4)', transform: showClientPicker ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {showClientPicker && (
          <div className="card" style={{ marginTop: 8, padding: '0 16px', maxHeight: 220, overflowY: 'auto' }}>
            {clients.map(c => (
              <button key={c} className="row" onClick={() => { setClient(c); setShowClientPicker(false); }} style={{ width: '100%', textAlign: 'left' }}>
                <div className="row-label">{c}</div>
                {c === client && <IcCheck size={14} style={{ color: 'var(--ok)' }} />}
              </button>
            ))}
            <button className="row" style={{ width: '100%', color: 'var(--ink-2)', borderBottom: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IcPlus size={14} /> Nuevo cliente
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Quote preview — the hero */}
      <div style={{ padding: '0 20px 16px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Vista previa</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 12px 32px -12px oklch(0% 0 0 / 0.12)' }}>
          {/* Paper header */}
          <div style={{ padding: '20px 22px 18px', borderBottom: '1px solid var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 6,
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
              }}>
                <BrandMark size={22} />
              </div>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>La Casita del Molde</div>
                <div className="micro" style={{ marginTop: 2 }}>@casitadelmolde · hola@casitadelmolde.mx</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div className="micro">Cotización</div>
                <div className="num" style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>COT-043</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="micro">Fecha</div>
                <div className="num" style={{ fontSize: 13, marginTop: 4 }}>{fmtDate(today)}</div>
              </div>
            </div>
          </div>

          {/* Cliente + pieza */}
          <div style={{ padding: '18px 22px', borderBottom: '0.5px solid var(--line)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <div className="micro" style={{ marginBottom: 4 }}>Cliente</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{client}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>+52 55 4123 7890</div>
              </div>
              <div>
                <div className="micro" style={{ marginBottom: 4 }}>Válida hasta</div>
                <div className="num" style={{ fontSize: 13 }}>{fmtDate(validUntil)}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{validity} días</div>
              </div>
            </div>
          </div>

          {/* Pieza */}
          <div style={{ padding: '18px 22px', borderBottom: '0.5px solid var(--line)' }}>
            <div className="micro" style={{ marginBottom: 8 }}>Concepto</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{pieceName}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{pieceDesc}</div>
              </div>
              <div className="num" style={{ fontSize: 14 }}>1 ud</div>
            </div>
          </div>

          {/* Desglose */}
          <div style={{ padding: '14px 22px', borderBottom: '0.5px solid var(--line)' }}>
            {lineItems.map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                <span style={{ color: 'var(--ink-2)' }}>{it.k}</span>
                <span className="num" style={{ color: 'var(--ink-2)' }}>{fmt(it.v, currency)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ padding: '18px 22px', background: 'var(--bg-sunk)' }}>
            <div className="micro" style={{ marginBottom: 6 }}>Total · IVA incluido</div>
            <div className="display" style={{ fontSize: 44, color: 'var(--accent)', lineHeight: 0.95, letterSpacing: '-0.02em' }}>{fmt(total, currency)}</div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '0.5px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)' }}>
              <span>Anticipo {advance}%</span>
              <span className="num">{fmt(total * advance / 100, currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
              <span>Saldo a la entrega</span>
              <span className="num">{fmt(total * (1 - advance/100), currency)}</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '14px 22px', fontSize: 10, color: 'var(--ink-3)', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
            Cotización válida por {validity} días. {advance}% anticipo para iniciar producción.
          </div>
        </div>
      </div>

      {/* Términos */}
      <div style={{ padding: '8px 20px 16px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Condiciones</div>
        <div className="card" style={{ padding: 18 }}>
          <div className="field" style={{ marginBottom: 18 }}>
            <label>Validez · {validity} días</label>
            <input className="slider" type="range" min="1" max="60" value={validity} onChange={e => setValidity(+e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 18 }}>
            <label>Anticipo · {advance}%</label>
            <input className="slider" type="range" min="0" max="100" step="5" value={advance} onChange={e => setAdvance(+e.target.value)} />
          </div>
          <div className="field">
            <label>Notas (opcional)</label>
            <textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)} style={{
              resize: 'none', padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: 13,
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--line)', outline: 'none',
              fontFamily: 'var(--font-sans)', color: 'var(--ink)',
            }} />
          </div>
        </div>
      </div>

      {/* Share options */}
      <div style={{ padding: '0 20px 16px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Método de envío</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { id: 'wa', label: 'WhatsApp', icon: <IcReceipt size={18} stroke={1.3} /> },
            { id: 'mail', label: 'Correo', icon: <IcUpload size={18} stroke={1.3} /> },
            { id: 'pdf', label: 'PDF', icon: <IcDownload size={18} stroke={1.3} /> },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setShareMenu(opt.id)}
              className="card"
              style={{
                padding: '14px 10px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: shareMenu === opt.id ? 'var(--ink)' : 'var(--bg-elev)',
                color: shareMenu === opt.id ? 'var(--bg)' : 'var(--ink)',
                border: shareMenu === opt.id ? '0.5px solid var(--ink)' : '0.5px solid var(--line)',
              }}
            >
              {opt.icon}
              <span style={{ fontSize: 11, fontWeight: 500 }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sticky action */}
      <div style={{
        position: 'sticky', bottom: 'var(--nav-h)', left: 0, right: 0,
        padding: '14px 20px',
        background: 'color-mix(in oklch, var(--bg) 90%, transparent)',
        backdropFilter: 'blur(12px)',
        borderTop: '0.5px solid var(--line)',
        display: 'flex', gap: 10,
        zIndex: 10,
      }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep('sent')}>
          <IcSave size={16} /> Guardar
        </button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep('sent')}>
          {shareMenu === 'wa' ? 'Enviar por WhatsApp' :
           shareMenu === 'mail' ? 'Enviar por correo' :
           shareMenu === 'pdf' ? 'Descargar PDF' : 'Enviar cotización'}
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { GenerateQuotePage });
