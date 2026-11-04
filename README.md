# La Casita del Molde — Calculadora de Costos 3D

PWA para calcular costos de impresión 3D y generar cotizaciones profesionales. Va a ser un producto para otros talleres de impresión 3D en México, con el nombre provisional **«Placa 3D»** (D56).

**URL:** https://calculadora3-d-delta.vercel.app (con guion; `calculadora3d-delta`, sin guion, es otro producto)

**Versión:** v101 en el código ([`CHANGELOG.md`](CHANGELOG.md)). La app publicada se actualiza cuando un cambio llega a `main`.

---

## Estado del proyecto (2026-11-03)

La planeación de la primera versión está en [`docs/`](docs/). El registro de decisiones es [`docs/reglas-de-negocio.md`](docs/reglas-de-negocio.md): cada una con número (D#), fecha y quién la tomó.

### Hacia dónde va

- **Para otros talleres en México,** primero en Google Play, con una prueba cerrada de 12 personas durante 14 días; la App Store, después (D34, D38, D43, D48).
- **Cuentas y datos en Firebase,** con modo sin conexión; Notion sale del proyecto (D33). Sin cuenta se usa la calculadora; guardar una cotización pide entrar (D84).
- **Gratis al lanzar;** los planes se definen cuando el desarrollo esté terminado (D42).

### Lo avanzado

| Qué | Dónde | Estado |
|---|---|---|
| Reglas de negocio: ciclo de vida de la cotización, anticipo y pagos, fecha de entrega, inventario, IVA, comisiones, empaque, cuentas, tiendas y qué entra a la primera versión | [`docs/reglas-de-negocio.md`](docs/reglas-de-negocio.md) | 103 decisiones (D1–D103) |
| Los 7 flujos de la primera versión, con diagramas: estados de la cotización, de la calculadora a la cotización, enviar y aceptar, pagos, producción y entrega, cuentas, y arranque de un negocio nuevo | [`docs/flujos.md`](docs/flujos.md) y [`docs/flujos/`](docs/flujos/) | Hechos, con sus preguntas respondidas |
| Competencia: 12 apps y plataformas, qué ofrecen que esta app no, y qué se agregó a la primera versión | [`docs/competencia.md`](docs/competencia.md) | Revisada el 2026-10-16 |
| Seguridad (v101): se quitó la sincronización con Notion, que no pedía contraseña, y Vercel publica solo los archivos de la app | [`CHANGELOG.md`](CHANGELOG.md), [`.vercelignore`](.vercelignore) | Publicado el 2026-11-03 y comprobado: los documentos y `/api/sync/` responden 404 |
| Modelo de datos para Firebase, organizado por negocio, con su diagrama | [`docs/modelo-de-datos.md`](docs/modelo-de-datos.md) | Hecho, con sus preguntas respondidas |
| Lo aprendido al trabajar el proyecto | [`docs/aprendizajes.md`](docs/aprendizajes.md) | Al día |

### Lo que sigue

1. ~~**Juntar v101 a `main`** con un Pull Request. Mientras tanto, la app publicada sigue con la sincronización sin contraseña.~~ Hecho el 2026-11-03 (Pull Request #1).
2. ~~**Responder las preguntas del modelo de datos**~~ Respondidas el 2026-11-03 (D89–D98 en [`docs/reglas-de-negocio.md`](docs/reglas-de-negocio.md)).
3. **Borrador del aviso de privacidad** (D51), antes de subir la app a Google Play.
4. **Construir la primera versión** ([`docs/reglas-de-negocio.md`](docs/reglas-de-negocio.md) §4.12) y hacer la prueba cerrada en Google Play.

---

## Funcionalidades

Lo que hace la app hoy (v101).

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
- Estados: **pendiente** / **aceptada** / **rechazada** — badge visual y cambio directo desde la lista. El estado «enviada» existe, pero ningún botón lo asigna. El ciclo de la primera versión está en [`docs/flujos/estados-cotizacion.html`](docs/flujos/estados-cotizacion.html)
- Botón de WhatsApp con mensaje preformateado listo para enviar
- Exportar a PDF, imagen compartible o texto plano
- QR del negocio en cada cotización (configurar URL en Ajustes)
- Búsqueda por cliente, número o producto
- Notion: al aceptar, la cotización se manda sola a Notion, una vez; también hay un botón «Notion». Sale del proyecto con Firebase (D33)
- Cada cotización guarda: `subtotal`, `discount`, `discountAmt`, `grandTotal`, `totalBaseCost`

### Dashboard
- Ingresos del mes (cotizaciones aceptadas)
- **Ganancia del mes** = ingresos − costo base (solo cotizaciones con `totalBaseCost`)
- **Margen del mes** = ganancia / ingresos × 100 (%)
- Historial mensual de los últimos 6 meses con barras y ratio de aceptación
- Alerta de stock bajo en filamento
- Cotizaciones recientes con estado

### Acceso e introducción
- Pantalla de acceso con correo. Es una **sesión simulada** (`js/auth.js`), sin servidor ni seguridad: sus funciones tienen la misma forma que las de Firebase Authentication, para cambiarlas después
- Introducción de 5 pasos la primera vez (`js/onboarding.js`); se puede saltar

### Costeo
- La fórmula vive sola en `js/costing.js`: recibe números y devuelve números
- 24 pruebas automáticas con cotizaciones reales: `npm test`

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
| `costing.js` | Fórmula de costeo, sin pantalla; la prueba `tests/costing.test.js` |
| `auth.js` | Sesión simulada, con la forma de Firebase Authentication |
| `onboarding.js` | Pantalla de acceso e introducción |

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
├── quote.html             — Página de una cotización
├── manifest.json
├── sw.js                  — Service Worker (caché calc3d-v101)
├── .vercelignore          — Lo que sí se publica en Vercel (D70)
├── CLAUDE.md              — Instrucciones para Claude Code
├── CHANGELOG.md           — Qué cambió en cada versión
├── MEJORAS.md             — Pendientes del uso diario
├── package.json           — npm test
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
│   ├── desktop.css        — Diseño de escritorio (900 px o más): barra lateral
│   ├── onboarding.css     — Pantalla de acceso e introducción
│   └── quote.css          — Template visual de cotización
├── docs/                  — Planeación: reglas de negocio, flujos, competencia, auditorías
├── tests/
│   └── costing.test.js    — Pruebas de la fórmula (npm test)
└── js/
    ├── store.js           — Data store y helpers localStorage (prefijo c3d_)
    ├── costing.js         — Fórmula de costeo, sin pantalla
    ├── auth.js            — Sesión simulada
    ├── onboarding.js      — Acceso e introducción
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

Lo que no es de la app (`node_modules/`, la documentación en `.docx`, el diseño original en `calculadora 3d/` y las órdenes de compra) no está en git (D99–D103).

---

## Integraciones

### Notion Sync
- Función serverless en `api/notion.js` (Vercel la detecta automáticamente)
- Recibe un objeto `quote` y crea una página en la DB "Ventas 2026"
- **Configuración requerida:** agregar `NOTION_API_KEY` en Vercel → Settings → Environment Variables
- El botón aparece únicamente en cotizaciones con estado *Aceptada*
- Guarda `notionPageId` y `notionSyncedAt` en el objeto quote tras sincronizar
- Al aceptar, la cotización se manda sola, una vez
- **Sale del proyecto con Firebase** (D33): no se construye nada nuevo sobre Notion
- La sincronización del estado completo (`js/sync.js`, `/api/sync/pull` y `/api/sync/push`) **se quitó en v101** porque no pedía contraseña (D71)

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

Conectado a Vercel: cada cambio que llega a `main` se publica solo, y Vercel publica solo lo que lista [`.vercelignore`](.vercelignore) (D70).

Los cambios se trabajan en una rama y llegan a `main` con un Pull Request; el commit y el push se hacen con GitHub Desktop. El plan gratuito de Vercel es para uso no comercial: el producto irá a Firebase Hosting (D55).


---

## Datos locales

Todos los datos se guardan en `localStorage` del dispositivo con el prefijo `c3d_`.  
Claves: `printers`, `materials`, `config`, `quoteStyle`, `history`, `quotes`, `quoteCounter`, `presets`, `clients`, `inventory`.

Usa **Ajustes → Exportar** para respaldar en JSON e **Importar** para restaurar.

Con Firebase, los datos de cada negocio irán en su cuenta (D33, D46).

---

## Próximas iteraciones

Lo que entra a la primera versión y lo que queda para después está en [`docs/reglas-de-negocio.md`](docs/reglas-de-negocio.md) §4.12. De la lista anterior:

- ~~Seguimiento de pedidos en producción (en cola → imprimiendo → listo → entregado)~~ Entra a la primera versión: estados «En producción» y «Entregada», y lista de pedidos por fecha de entrega (D11, D60; flujo 5)
- Recordatorio de cotizaciones pendientes sin respuesta después de X días. Sin decidir; la cotización ya tiene vigencia (D10)
- Exportar catálogo de precios como PDF con logo. Sin decidir
- Rediseño en Figma. Sin decidir; si se hace, arranca con `/system-design` (ver [`CLAUDE.md`](CLAUDE.md))
- ~~Publicar en Google Play vía PWABuilder (TWA)~~ Google Play primero, con prueba cerrada (D38, D48). [`docs/ANDROID.md`](docs/ANDROID.md) recomienda Capacitor en lugar de TWA
