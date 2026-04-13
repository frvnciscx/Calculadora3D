# La Casita del Molde — Calculadora de Costos 3D

PWA para calcular costos de impresión 3D y generar cotizaciones profesionales.

**URL:** https://calculadora3d-delta.vercel.app

---

## Funcionalidades

### Calculadora
- Cálculo en tiempo real al escribir (peso, tiempo, impresora, material, margen)
- Validación visual con helper text preventivo en campos requeridos
- Presets de configuración rápida (guardar combinaciones impresora+material+margen)
- Catálogo de productos con dos tipos: costo calculado (toppercakes) y tabla de precios (cortadores de galleta por tamaño)
- Exportar lista de precios a Excel

### Cotizaciones
- Orden multi-producto con cantidades individuales
- Estados: **pendiente** / **aceptada** / **rechazada** — con badge visual y cambio directo desde la lista
- Botón de WhatsApp con mensaje preformateado listo para enviar
- Exportar a PDF, imagen compartible o texto plano
- QR del negocio en cada cotización (configurar URL en Ajustes)
- Búsqueda por cliente, número o producto

### Base de clientes
- CRUD con nombre, teléfono, email y notas
- Historial de cotizaciones y total cotizado por cliente
- Acceso rápido a WhatsApp desde la card

### Inventario de filamento
- Control de stock por rollo (material, marca, color, peso total y restante)
- Barra de progreso con alerta visual cuando queda ≤ 20%
- Botón "Descontar" para registrar gramos usados tras cada impresión

### Dashboard
- Ingresos del mes (solo cotizaciones aceptadas)
- Historial mensual de los últimos 6 meses con barras y ratio de aceptación
- Alerta de stock bajo en filamento
- Cotizaciones recientes con estado

---

## Stack

HTML + CSS + JS vanilla — sin frameworks ni build step.

| Librería | Uso | Carga |
|---|---|---|
| pdf-lib 1.17.1 | Exportar PDF | Lazy (solo al exportar) |
| html2canvas 1.4.1 | Exportar imagen | Lazy |
| SheetJS 0.18.5 | Exportar Excel | Lazy |
| qrcode-generator 1.4.4 | QR en cotizaciones | Lazy |

---

## Sistema de diseño

### Espaciado — escala de 4px
```css
--space-1: 4px  |  --space-2: 8px  |  --space-3: 12px  |  --space-4: 16px
--space-5: 20px |  --space-6: 24px |  --space-7: 28px  |  --space-8: 32px
```

### Tipografía
| Token | Tamaño | Peso | Uso |
|---|---|---|---|
| display | 34px | 900 | Totales, números grandes |
| heading-lg | 22px | 800 | Títulos de modal |
| heading-md | 18px | 700 | Top bar, encabezados de página |
| title | 15px | 700 | Nombre de ítem en cards |
| label-lg | 13px | 600 | Etiquetas, botones |
| overline | 11px | 700 | Card titles, nav (uppercase) |

### Sombras — 3 niveles de elevación
```css
--shadow-card   /* cards, list items    */
--shadow-float  /* FAB, tooltips        */
--shadow-modal  /* bottom sheets        */
```

### Jerarquía de botones
- `btn-filled` → acción primaria (Cotizar, Agregar a orden, Guardar)
- `btn-tonal` → acción secundaria contextual
- `btn-outlined` → alternativa (Cancelar, Cerrar)
- `btn-text` → acciones terciarias (Guardar historial, Preset)

---

## Estructura del proyecto

```
├── index.html
├── manifest.json
├── sw.js                  — Service worker (v27)
├── deploy.sh              — Script de deploy: git add + commit + push
├── assets/
│   ├── icon.svg           — Logo casita magenta (fuente)
│   ├── icon-192.png
│   └── icon-512.png
├── css/
│   ├── tokens.css         — Design tokens: colores, tipografía, espaciado, sombras
│   ├── base.css           — Reset, layout, nav bar, utilidades
│   ├── components.css     — Todos los componentes UI
│   └── quote.css          — Template visual de cotización
└── js/
    ├── store.js           — Data store y helpers localStorage (prefijo c3d_)
    ├── ui.js              — showPage(), navegación, snack, modal
    ├── calculator.js      — Lógica de cálculo + validación en tiempo real
    ├── catalog.js         — Catálogo de productos, tabla cortadores, exportar Excel
    ├── quotes.js          — Cotizaciones, estados, WhatsApp, PDF, imagen
    ├── clients.js         — Base de clientes CRUD
    ├── inventory.js       — Inventario de filamento
    ├── dashboard.js       — Métricas, historial mensual
    ├── printers.js        — CRUD impresoras
    ├── materials.js       — CRUD materiales
    ├── history.js         — Historial de cálculos
    ├── quote-editor.js    — Editor visual de cotizaciones
    ├── config.js          — Configuración general, export/import
    └── theme.js           — Tema claro/oscuro/auto
```

---

## Deploy

Conectado a Vercel — cada `git push` a `main` despliega automáticamente.

```bash
./deploy.sh
# Pide descripción del cambio y hace add + commit + push
```

Primera vez en un equipo nuevo:
```bash
chmod +x deploy.sh
```

---

## Datos locales

Todos los datos se guardan en `localStorage` del dispositivo con el prefijo `c3d_`. Usa **Ajustes → Exportar** para respaldar en JSON e **Importar** para restaurar.

---

## Próximas iteraciones

- Seguimiento de pedidos en producción (en cola → imprimiendo → listo → entregado)
- Recordatorio de cotizaciones pendientes sin respuesta
- Exportar catálogo de precios como PDF con logo
- Rediseño en Figma
