// Nuevo cliente — formulario
const NewClientPage = ({ setPage, currency }) => {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [handle, setHandle] = React.useState('');
  const [source, setSource] = React.useState('instagram');
  const [tag, setTag] = React.useState('frecuente');
  const [notes, setNotes] = React.useState('');
  const [saved, setSaved] = React.useState(false);

  const initials = (name || '—').split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('') || '?';
  const canSave = name.trim().length > 0 && (phone || email);

  if (saved) {
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
        <div className="micro" style={{ marginBottom: 10 }}>Cliente guardado</div>
        <h1 className="display" style={{ fontSize: 38, margin: '0 0 14px', lineHeight: 0.95 }}>
          <em style={{ fontStyle: 'italic' }}>{name.split(' ')[0]}</em> se sumó<br/>a tu lista
        </h1>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 280, marginBottom: 32 }}>
          Ya puedes asignarle cotizaciones y ver su historial.
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 320 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => {
            setName(''); setPhone(''); setEmail(''); setHandle(''); setNotes(''); setSaved(false);
          }}>
            Agregar otro
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setPage('quotes')}>
            Volver a clientes
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
        <button onClick={() => setPage('quotes')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: 13 }}>
          <IcBack size={16} /> Clientes
        </button>
        <button onClick={() => canSave && setSaved(true)} style={{
          fontSize: 13, fontWeight: 500,
          color: canSave ? 'var(--ink)' : 'var(--ink-4)',
          cursor: canSave ? 'pointer' : 'not-allowed',
        }}>Guardar</button>
      </div>

      <PageHeader
        eyebrow="Nuevo"
        title="Agregar cliente"
      />

      {/* Avatar + nombre (hero) */}
      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 84, height: 84, borderRadius: '50%',
          background: name ? 'var(--ink)' : 'var(--bg-sunk)',
          color: name ? 'var(--bg)' : 'var(--ink-4)',
          border: '0.5px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 32, letterSpacing: '-0.02em',
          transition: 'background 0.2s, color 0.2s',
        }}>{initials}</div>
        <div style={{ width: '100%', textAlign: 'center' }}>
          <input
            type="text"
            placeholder="Nombre y apellido"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%', textAlign: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 28, letterSpacing: '-0.01em',
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--ink)',
              padding: '4px 0',
            }}
          />
          <div style={{ height: 1, background: 'var(--line)', margin: '0 auto', maxWidth: 220 }} />
          <div className="micro" style={{ marginTop: 8 }}>Nombre del cliente</div>
        </div>
      </div>

      {/* Contacto */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Contacto</div>
        <div className="card" style={{ padding: 18, display: 'grid', gap: 18 }}>
          <div className="field">
            <label>WhatsApp / Teléfono</label>
            <input
              type="tel"
              placeholder="+52 55 0000 0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Red social / @usuario</label>
            <input
              type="text"
              placeholder="@cliente"
              value={handle}
              onChange={e => setHandle(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Origen */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>¿Cómo te conoció?</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'instagram', label: 'Instagram' },
            { id: 'facebook', label: 'Facebook' },
            { id: 'recomendado', label: 'Recomendado' },
            { id: 'feria', label: 'Feria / Bazar' },
            { id: 'web', label: 'Web' },
            { id: 'otro', label: 'Otro' },
          ].map(o => (
            <button key={o.id} onClick={() => setSource(o.id)} style={{
              padding: '7px 13px',
              borderRadius: 999,
              border: '0.5px solid ' + (source === o.id ? 'var(--ink)' : 'var(--line)'),
              background: source === o.id ? 'var(--ink)' : 'transparent',
              color: source === o.id ? 'var(--bg)' : 'var(--ink-2)',
              fontSize: 12,
            }}>{o.label}</button>
          ))}
        </div>
      </div>

      {/* Etiqueta */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Tipo de cliente</div>
        <div className="seg" style={{ width: '100%', display: 'flex' }}>
          {[
            { id: 'nuevo', label: 'Nuevo' },
            { id: 'frecuente', label: 'Frecuente' },
            { id: 'mayorista', label: 'Mayorista' },
            { id: 'vip', label: 'VIP' },
          ].map(t => (
            <button key={t.id} className={tag === t.id ? 'active' : ''} onClick={() => setTag(t.id)} style={{ flex: 1 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notas */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Notas internas</div>
        <div className="card" style={{ padding: 16 }}>
          <textarea
            rows="4"
            placeholder="Preferencias, direcciones de entrega, alergias a materiales, historial…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{
              width: '100%', resize: 'none',
              background: 'transparent', border: 'none', outline: 'none',
              fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink)',
              lineHeight: 1.5,
            }}
          />
        </div>
      </div>

      {/* Preview card — cómo se verá en la lista */}
      <div style={{ padding: '0 20px 20px' }}>
        <div className="micro" style={{ marginBottom: 10 }}>Vista previa en tu lista</div>
        <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, opacity: name ? 1 : 0.5, transition: 'opacity 0.2s' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--bg-sunk)', border: '0.5px solid var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 500,
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name || 'Nombre del cliente'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="num">0</span> cotizaciones
              <span style={{ color: 'var(--ink-4)' }}>·</span>
              <span style={{ textTransform: 'capitalize' }}>{tag}</span>
            </div>
          </div>
          <div className="num" style={{ fontSize: 13, color: 'var(--ink-3)' }}>{fmt(0, currency)}</div>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div style={{
        position: 'sticky', bottom: 'var(--nav-h)', left: 0, right: 0,
        padding: '14px 20px',
        background: 'color-mix(in oklch, var(--bg) 90%, transparent)',
        backdropFilter: 'blur(12px)',
        borderTop: '0.5px solid var(--line)',
        display: 'flex', gap: 10,
        zIndex: 10,
      }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setPage('quotes')}>
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 2, opacity: canSave ? 1 : 0.4 }}
          disabled={!canSave}
          onClick={() => canSave && setSaved(true)}
        >
          <IcCheck size={16} /> Guardar cliente
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { NewClientPage });
