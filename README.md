# La Casita del Molde — Calculadora de Costos 3D

PWA para calcular costos de impresión 3D y generar cotizaciones profesionales.

**URL:** https://calculadora3d-delta.vercel.app

---

## Funcionalidades

### Calculadora
- Cálculo en tiempo real al escribir (peso, tiempo, impresora, material, margen)
- Validación visual con helper text preventivo en campos requeridos
- Presets de configuración rápida (guardar combinaciones impresora+material+margen)
- Filtrado de materiales según tipo de impresora seleccionada (FDM / Resina)
- Catálogo de productos con dos tipos: costo calculado y tabla de precios por tamaño
- Exportar lista de precios a Excel

### Impresión en resina
- Bloque contextual "Post-proceso Resina" aparece automáticamente al seleccionar impresora tipo Resina
- Peso efectivo = peso base + % de soportes (configurable, default 20%)
- Costo de lavado IPA: ml por impresión × costo por litro (configurable)
- Costo de curado UV: Elegoo Mercury Plus — 24W × 5 min lavado + 36W × 3 min curado ≈ 0.0038 kWh
- Parámetros editables directamente en la calculadora, se guardan en config automáticamente

### Cotizaciones
- Orden multi-producto con cantidades individuales
- Estados: **pendiente** / **aceptada** / **rechazada** — badge visual y cambio directo desde la lista
- Botón de WhatsApp con mensaje preformateado listo para enviar
- Exportar a PDF, imagen compartible o texto plano
- QR del negocio en cada cotización (configurar URL en Ajustes)
- Búsqueda por cliente, número o producto
- Sincronización con Notion: botón "Notion" en cotizaciones aceptadas → crea entrada en DB "Ventas 2026"

### Base de clientes
- CRUD con nombre, teléfono, email y notas
- **Autocompletado** en el modal de cotización: al escribir el nombre sugiere clientes registrados y auto-rellena el teléfono
- Vista expandible por cliente con tabs **Pendientes / Aceptadas**
- Total cotizado y conteo de cotizaciones por cliente
- Acceso rápido a WhatsApp desde la card

### Inventario de filamento
- Control de stock por rollo (material, marca, color, peso total y restante)
- Barra de progreso con alerta visual cuando queda ≤ 20%
- Botón "Descontar" para registrar gramos usados tras cada impresión

### Post-procesado / Pintura
- Tarjeta opcional en la calculadora (toggle switch)
- Colores de pintura dinámicos: "Agregar color" genera filas con nombre + costo individual
- Campos de primer, barniz y tiempo de pintado (usa tarifa de labor de Ajustes)
- Costos incluidos en el subtotal antes del % desperdicio
- Bloque de desglose aparece en resultados con total de post-procesado
- Al agregar a la orden: campos de la pieza se limpian automáticamente para la siguiente

### Cotizaciones
- Orden multi-producto con cantidades individuales
- **Descuento:** campo % en el modal de borrador — actualiza subtotal / monto / total en tiempo real
- Estados: **pendiente** / **aceptada** / **rechazada** — badge visual y cambio directo desde la lista
- Botón de WhatsApp con mensaje preformateado listo para enviar
- Exportar a PDF, imagen compartible o texto plano
- QR del negocio en cada cotización (configurar URL en Ajustes)
- Búsqueda por cliente, número o producto
- Sincronización con Notion: botón "Notion" en cotizaciones aceptadas → crea entrada en DB "Ventas 2026"
- Cada cotización guarda: `subtotal`, `discount`, `discountAmt`, `grandTotal`, `totalBaseCost`

### Dashboard
- Ingresos del mes (cotizaciones aceptadas)
- **Ganancia del mes** = ingresos − costo base (solo cotizaciones con `totalBaseCost`)
- **Margen del mes** = ganancia / ingresos × 100 (%)
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

## Arquitectura JS

Los módulos siguen separación de responsabilidades:

| Archivo | Responsabilidad |
|---|---|
| `store.js` | Data store, localStorage helpers, estado global |
| `templates.js` | **Funciones puras de HTML** — sin lógica, solo retornan strings |
| `ui.js` | Navegación, snack, modal, filtrado de materiales |
| `calculator.js` | Cálculo live, validación, presets, lógica de resina |
| `quotes.js` | CRUD cotizaciones, estados, WhatsApp, PDF, Notion |
| `clients.js` | CRUD clientes, autocompletado, tabs de cotizaciones |
| `native.js` | Drag bottom sheets, transiciones, haptic feedback |
| `config.js` | Configuración general, desglose costos fijos, export/import JSON |
| `dashboard.js` | Métricas, historial mensual, ganancia/margen del mes |
| `theme.js` | Tema claro/oscuro/auto |

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
├── sw.js                  — Service Worker (v30)
├── deploy.sh              — git add + commit + push en un paso
├── api/
│   └── notion.js          — Vercel Function: POST /api/notion
├── assets/
│   ├── icon.svg           — Logo casita magenta (fuente)
│   ├── icon-192.png
│   └── icon-512.png
├── css/
│   ├── tokens.css         — Design tokens: colores, tipografía, espaciado, sombras
│   ├── base.css           — Reset, layout, nav bar, safe areas, utilidades
│   ├── components.css     — Todos los componentes UI
│   └── quote.css          — Template visual de cotización
└── js/
    ├── store.js           — Data store y helpers localStorage (prefijo c3d_)
    ├── templates.js       — Funciones puras de HTML (sin DOM, sin estado)
    ├── ui.js              — showPage(), navegación, snack, modal
    ├── native.js          — Safe areas, drag sheets, transiciones, haptic
    ├── calculator.js      — Lógica de cálculo + validación + resina
    ├── catalog.js         — Catálogo de productos, tabla cortadores, Excel
    ├── quotes.js          — Cotizaciones, estados, WhatsApp, PDF, Notion
    ├── clients.js         — Clientes CRUD + autocomplete + tabs cotizaciones
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

## Integraciones

### Notion Sync
- Función serverless en `api/notion.js` (Vercel la detecta automáticamente)
- Recibe un objeto `quote` y crea una página en la DB "Ventas 2026"
- **Configuración requerida:** agregar `NOTION_API_KEY` en Vercel → Settings → Environment Variables
- El botón aparece únicamente en cotizaciones con estado *Aceptada*
- Guarda `notionPageId` y `notionSyncedAt` en el objeto quote tras sincronizar

---

## Native App Feel

Mejoras implementadas para comportamiento de app nativa:

| Mejora | Implementación |
|---|---|
| Safe areas (notch / isla dinámica) | `viewport-fit=cover` + `env(safe-area-inset-*)` en top bar, nav y sheets |
| Drag to dismiss en bottom sheets | Touch gesture con umbral 35% + spring back con cubic-bezier |
| Transiciones de página | Slide horizontal suave al cambiar entre tabs |
| Haptic feedback | Vibration API — patrón diferente para éxito, error y navegación |

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

Todos los datos se guardan en `localStorage` del dispositivo con el prefijo `c3d_`.  
Claves: `printers`, `materials`, `config`, `quoteStyle`, `history`, `quotes`, `quoteCounter`, `presets`, `clients`, `inventory`.

Usa **Ajustes → Exportar** para respaldar en JSON e **Importar** para restaurar.

---

## Próximas iteraciones

- Seguimiento de pedidos en producción (en cola → imprimiendo → listo → entregado)
- Recordatorio de cotizaciones pendientes sin respuesta después de X días
- Exportar catálogo de precios como PDF con logo
- Rediseño en Figma
- Publicar en Google Play vía PWABuilder (TWA)
