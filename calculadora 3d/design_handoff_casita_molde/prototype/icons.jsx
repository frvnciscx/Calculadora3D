// Icon set — thin line, 1.5 stroke, 20px default
const Ico = ({ size = 20, stroke = 1.5, children, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
);

const IcHome = (p) => <Ico {...p}><path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z"/></Ico>;
const IcCalc = (p) => <Ico {...p}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0"/></Ico>;
const IcReceipt = (p) => <Ico {...p}><path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3z"/><path d="M8 8h8M8 12h8M8 16h5"/></Ico>;
const IcCatalog = (p) => <Ico {...p}><rect x="3" y="5" width="7" height="7" rx="1"/><rect x="14" y="5" width="7" height="7" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/><rect x="14" y="16" width="7" height="5" rx="1"/></Ico>;
const IcSettings = (p) => <Ico {...p}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></Ico>;

const IcPlus = (p) => <Ico {...p}><path d="M12 5v14M5 12h14"/></Ico>;
const IcBack = (p) => <Ico {...p}><path d="M15 18l-6-6 6-6"/></Ico>;
const IcChev = (p) => <Ico {...p}><path d="M9 6l6 6-6 6"/></Ico>;
const IcSearch = (p) => <Ico {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></Ico>;
const IcSun = (p) => <Ico {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Ico>;
const IcMoon = (p) => <Ico {...p}><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></Ico>;
const IcSave = (p) => <Ico {...p}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></Ico>;
const IcStar = (p) => <Ico {...p}><path d="M12 2l3 7 7 .5-5.5 5 1.5 7-6-4-6 4 1.5-7L2 9.5 9 9z"/></Ico>;
const IcClock = (p) => <Ico {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ico>;
const IcPrinter = (p) => <Ico {...p}><path d="M6 9V3h12v6M6 18H4a1 1 0 01-1-1v-5a2 2 0 012-2h14a2 2 0 012 2v5a1 1 0 01-1 1h-2"/><rect x="6" y="14" width="12" height="7"/></Ico>;
const IcDrop = (p) => <Ico {...p}><path d="M12 2.5c3 4.2 6.5 7.9 6.5 12A6.5 6.5 0 015.5 14.5c0-4.1 3.5-7.8 6.5-12z"/></Ico>;
const IcPalette = (p) => <Ico {...p}><path d="M12 3a9 9 0 100 18c1 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.5-1-.3-.3-.5-.7-.5-1.1 0-.8.7-1.4 1.5-1.4H16a5 5 0 005-5 9 9 0 00-9-9z"/><circle cx="7" cy="10" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16" cy="10" r="1"/></Ico>;
const IcBolt = (p) => <Ico {...p}><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></Ico>;
const IcBox = (p) => <Ico {...p}><path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v9"/></Ico>;
const IcClose = (p) => <Ico {...p}><path d="M18 6L6 18M6 6l12 12"/></Ico>;
const IcMore = (p) => <Ico {...p}><circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/></Ico>;
const IcUser = (p) => <Ico {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></Ico>;
const IcDownload = (p) => <Ico {...p}><path d="M12 3v13M6 13l6 6 6-6M4 21h16"/></Ico>;
const IcUpload = (p) => <Ico {...p}><path d="M12 21V8M6 11l6-6 6 6M4 3h16"/></Ico>;
const IcFilter = (p) => <Ico {...p}><path d="M3 5h18M7 12h10M10 19h4"/></Ico>;
const IcEdit = (p) => <Ico {...p}><path d="M4 20h4l10-10-4-4L4 16v4zM13 7l4 4"/></Ico>;
const IcTrash = (p) => <Ico {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></Ico>;
const IcCheck = (p) => <Ico {...p}><path d="M5 12l5 5 10-10"/></Ico>;
const IcOffline = (p) => <Ico {...p}><path d="M1 1l22 22M16.7 14.7a5 5 0 00-9.4 0M8.5 16.4a7.5 7.5 0 016.9-.1M5.5 12.5a11 11 0 0111-1M2 9a15 15 0 0115-3"/><circle cx="12" cy="20" r="0.5"/></Ico>;

Object.assign(window, {
  IcHome, IcCalc, IcReceipt, IcCatalog, IcSettings,
  IcPlus, IcBack, IcChev, IcSearch, IcSun, IcMoon, IcSave, IcStar, IcClock,
  IcPrinter, IcDrop, IcPalette, IcBolt, IcBox, IcClose, IcMore, IcUser,
  IcDownload, IcUpload, IcFilter, IcEdit, IcTrash, IcCheck, IcOffline,
});
