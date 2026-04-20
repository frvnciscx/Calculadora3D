// Shared bits: bottom nav, page header, offline banner
const BottomNav = ({ page, setPage }) => {
  const items = [
    { id: 'home', label: 'Inicio', Icon: IcHome },
    { id: 'quotes', label: 'Cotizaciones', Icon: IcReceipt },
    { id: 'catalog', label: 'Catálogo', Icon: IcCatalog },
    { id: 'settings', label: 'Ajustes', Icon: IcSettings },
  ];
  return (
    <nav className="bottom-nav" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => setPage(id)} className={page === id ? 'active' : ''}>
          <Icon size={22} stroke={page === id ? 1.75 : 1.4} />
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
};

const OfflineBanner = () => null;

const PageHeader = ({ eyebrow, title, trailing, onBack }) => (
  <div className="page-header">
    <div style={{ flex: 1, minWidth: 0 }}>
      {onBack && (
        <button onClick={onBack} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 10,
          color: 'var(--ink-3)', fontSize: 13,
        }}>
          <IcBack size={14} /> Volver
        </button>
      )}
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
    </div>
    {trailing}
  </div>
);

// Brand mark
const BrandMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="0.5" y="0.5" width="39" height="39" rx="8" stroke="currentColor" strokeWidth="1"/>
    <path d="M9 26V14l11-4 11 4v12" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M14 26v-6h12v6" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M9 14l11 4 11-4" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity="0.5"/>
    <line x1="20" y1="18" x2="20" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
  </svg>
);

// Format money
const fmt = (n, cur = 'MXN') => {
  const sym = { MXN: '$', USD: 'US$', EUR: '€' }[cur] || '$';
  const v = Number(n || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  return `${sym}${v}`;
};

// Swatch pie (share percentage)
const Swatch = ({ color }) => (
  <span className="pie" style={{ background: color }} />
);

Object.assign(window, { BottomNav, OfflineBanner, PageHeader, BrandMark, fmt, Swatch });
