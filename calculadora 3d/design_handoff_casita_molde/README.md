# Handoff: La Casita del Molde — Rediseño Dark Luxe

## Overview

Rediseño completo de la interfaz móvil de **La Casita del Molde**, una aplicación PWA para cotizar piezas impresas en 3D. El objetivo es reemplazar la UI actual con una estética **"Dark Luxe"**: minimalista, tipográfica, con fondo negro profundo y un único color de acento neon/lima que dirige la atención al dinero (totales, CTAs, elementos de éxito).

La app tiene 5 pestañas principales: **Inicio, Cotizaciones, Calcular (oculta, accesible desde "+"), Catálogo, Ajustes** — más pantallas secundarias (Nuevo Cliente, Diseño de Cotización).

---

## About the Design Files

Los archivos en la carpeta `prototype/` son **referencias de diseño en HTML + React (inline vía Babel)**. Son prototipos que muestran el look & feel final y las interacciones; **NO son código de producción para copiar tal cual**.

Tu tarea es **recrear estos diseños en el entorno real del proyecto** (HTML + Vanilla JS, que es el stack actual). Mantén la estructura de archivos existente — reemplaza solo el HTML, CSS y la lógica de render. No introduzcas React a menos que el usuario lo pida.

El archivo principal es `prototype/La Casita del Molde.html` — ábrelo en el navegador para ver la app en vivo y navegar entre pantallas.

## Fidelity

**Alta fidelidad (hifi)**. Todos los valores (colores hex, tipografía, espaciados, radios, transiciones) son finales y deben replicarse pixel-perfect. Los `styles.css` en `prototype/` contienen el sistema de diseño completo como CSS variables — cópialo tal cual al proyecto real.

---

## Design Tokens

Todos los tokens están definidos como CSS variables en `prototype/styles.css`. Cópialos directamente.

### Colores — Dark (default)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0a0a0a` | Fondo principal de la app |
| `--bg-elev` | `#141414` | Tarjetas, inputs elevados |
| `--bg-sunk` | `#050505` | Zonas hundidas, fondo detrás del shell |
| `--ink` | `#f5f5f5` | Texto primario |
| `--ink-2` | `#a8a8a8` | Texto secundario |
| `--ink-3` | `#707070` | Texto terciario (labels, micro) |
| `--ink-4` | `#3a3a3a` | Bordes muy tenues, texto deshabilitado |
| `--line` | `#1f1f1f` | Bordes de tarjetas (0.5px) |
| `--line-2` | `#161616` | Bordes más sutiles |
| `--accent` | `#c6ff3d` | **Neon lime** — CTAs, totales, highlights |
| `--accent-tint` | `#1a2407` | Fondos tintados de accent |
| `--ok` | `#c6ff3d` | Estado éxito (mismo que accent) |
| `--warn` | `#ffb84d` | Advertencias |
| `--danger` | `#ff5a5a` | Errores, eliminar |

### Colores — Light (alternativo, vía toggle)

| Token | Valor |
|---|---|
| `--bg` | `#fafafa` |
| `--bg-elev` | `#fff` |
| `--bg-sunk` | `#f0f0f0` |
| `--ink` | `#0a0a0a` |
| `--ink-2` | `#555` |
| `--ink-3` | `#888` |
| `--ink-4` | `#c0c0c0` |
| `--line` | `#e8e8e8` |
| `--accent` | `#5cb800` (verde oliva) |
| `--accent-tint` | `#eaffcf` |

El tema se aplica agregando `data-theme="light"` al `<html>`. Se persiste en `localStorage.lcdm_theme` con valores `dark` (default), `light`, o `auto`.

### Tipografía

```css
--font-sans: 'Geist', -apple-system, system-ui, sans-serif;
--font-mono: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
--font-display: 'Geist', -apple-system, system-ui, sans-serif;
--font-data: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
```

Carga desde Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**Escala tipográfica:**

| Uso | Tamaño | Peso | Letter-spacing | Familia |
|---|---|---|---|---|
| Page title (H1) | 34px | 600 | -0.035em | sans |
| Display/hero (total cotización) | 64–72px | 600 | -0.04em | sans (line-height 0.92) |
| Card title | 17px | 500 | -0.01em | sans |
| Body | 14–15px | 400 | -0.01em | sans |
| Labels (form) | 10px | 500 | 0.12em uppercase | mono |
| Micro / eyebrow | 10px | 500 | 0.14–0.16em uppercase | mono |
| Datos numéricos | variable | 500 | -0.02em | mono (tabular-nums) |
| Tags / chips | 10px | 500 | 0.1em uppercase | mono |

Los números **siempre** usan `font-variant-numeric: tabular-nums` para que no "bailen" al cambiar valores.

### Espaciado

Escala principal: **4px** (radio pequeño), **8px, 12px, 14px, 16px, 18px, 20px, 24px, 28px**.

- Padding lateral de páginas: `20px`
- Padding vertical header: `28px 20px 18px`
- Gap entre elementos principales: `16–20px`
- Gap entre micro elementos: `6–10px`

### Border radius

| Token | Valor | Uso |
|---|---|---|
| `--r-s` | `10px` | Chips pequeños |
| `--r-m` | `16px` | Tarjetas estándar |
| `--r-l` | `24px` | Hero cards |
| — | `999px` | Botones, switches, pills (full-round) |
| — | `8px` | Inputs, dividers internos |
| — | `50%` | Avatars, puntos de estado |

### Bordes

- Todas las líneas son **`0.5px solid var(--line)`** — medio pixel para lujo tipográfico.
- Las divisiones dentro de cards también `0.5px`.

### Sombras (mínimas)

- Shell móvil en desktop: `0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px var(--line)`
- Tweaks panel: `0 20px 40px -10px rgba(0,0,0,0.5)`
- Slider thumb: `0 0 0 1px var(--accent)` + borde `3px var(--bg)`

No usar sombras para elevar tarjetas — usar `border` + `background` elevado.

### Transiciones

- Botones (press): `transform 0.1s; background 0.15s`
- Hover states: `0.15s`
- Switch toggle: `background 0.2s; transform 0.2s`
- Page-in animation: `0.28s cubic-bezier(0.2, 0.8, 0.2, 1)` con `opacity 0→1, translateY(6px→0)`

---

## Layout General

La app está diseñada **mobile-first** con un contenedor `.app-shell`:
- `max-width: 440px`, centrado
- En desktop (`>441px`): margen vertical 24px, border-radius 28px, con sombra para simular dispositivo
- En móvil real: ocupa toda la pantalla
- Soporta `env(safe-area-inset-bottom)` en el bottom nav

### Bottom Navigation

- Sticky en el fondo, con `backdrop-filter: blur(16px) saturate(160%)`
- 4 items visibles: Inicio, Cotizaciones, Catálogo, Ajustes
- Grid equidistante `repeat(4, 1fr)`
- Altura: ~78px incluyendo safe-area
- Indicador activo: barra lime de `18×2px` arriba del ícono, ícono en `--ink`, inactivo en `--ink-3`
- Ícono stroke: `1.4` inactivo, `1.75` activo

**Importante:** "Calcular" NO está en el bottom nav. Se accede desde el botón "+" de la página Cotizaciones (o el atajo del Inicio).

---

## Pantallas

### 1. Inicio (`home`)

**Propósito:** Dashboard con resumen — saludo, métricas clave y cotizaciones recientes.

**Layout (top-down):**

1. **PageHeader**
   - Eyebrow mono `RESUMEN`
   - H1: `Bienvenido, Francisco` (sin italic, regular Geist)

2. **Grid de 2 stat cards** (material usado / ingresos)
   - Cada card: `--bg-elev` + `0.5px solid --line`, padding 16px, radius 16px
   - Título mono pequeño arriba, valor grande mono abajo, delta en lime

3. **Mini gráfico de barras** (ingresos últimos 7 días)
   - Barras verticales con altura proporcional, color `--ink` para normales y `--accent` para el día activo
   - Ancho de barra: ~28px, gap: ~4px
   - Label del día debajo en mono pequeño `--ink-3`

4. **Botón "+ Nueva cotización"** — pill full-width, variante primaria (lime sobre negro)

5. **Lista de cotizaciones recientes** (3 items)
   - Card con padding 14px, flex con ID mono a la izquierda, pieza + cliente al centro, total a la derecha
   - Punto de estado (lime/ámbar/gris) junto al texto

**Datos mostrados:** nombre del usuario, material acumulado (g), ingresos (MXN/USD), barras diarias, últimas 3 cotizaciones.

---

### 2. Calcular (`calc`)

**Propósito:** Calcular el costo de una pieza 3D con todos los parámetros. Accesible desde el "+" en Cotizaciones o el CTA en Inicio.

**Layout:**

1. **Header con botón "← Volver"** (regresa a quotes)
2. **Hero del total**
   - Numero grande (64–72px) en Geist 600, `-0.04em` letter-spacing, line-height `0.92`
   - Moneda en mono pequeño debajo
   - Texto acumula con `tabular-nums` — se actualiza en vivo al mover sliders
3. **Grid de inputs:**
   - Material (selector)
   - Peso (g) — input numérico + slider
   - Tiempo de impresión (h/m) — dos inputs
   - Diseño (h) — input + slider
   - Impresora (selector) — para calcular energía y depreciación
4. **Switches opcionales:**
   - "Pintura" — al activar muestra sub-input de horas
   - "Resina" — al activar muestra sub-input de mL
5. **Desglose en vivo** (card collapsible)
   - Para cada componente activo: swatch de color (ahora monocromático en escala `--ink` → `--ink-4`), nombre, valor
   - **Material**: `--ink`
   - **Energía**: `--ink-2`
   - **Diseño**: `--accent` (único componente en lime)
   - **Depreciación**: `--ink-3`
   - **Costos fijos**: `--ink-4`
   - **Desperdicio**: `--line`
   - **Post-pintura** (si activo): `--ink-2`
   - **Post-resina** (si activo): `--ink-3`
6. **Botón "Guardar cotización"** — primary, full-width, al fondo

**Fórmulas (existentes en la app actual, preservar):**
- Material = peso × precio/g
- Energía = tiempo_h × consumo_impresora × precio_kwh
- Diseño = horas_diseño × tarifa/h
- Depreciación = tiempo_h × costo_impresora / vida_útil_h
- Costos fijos = tiempo_h × fijos_mensuales / horas_operación_mensual
- Desperdicio = % configurable sobre material
- Post-pintura = horas × tarifa + materiales
- Post-resina = mL × precio/mL + mano de obra

---

### 3. Cotizaciones (`quotes`)

**Propósito:** Lista de todas las cotizaciones y clientes. Dos sub-pestañas internas.

**Layout:**

1. **PageHeader**: "Cotizaciones"
2. **Segmented control** (`.seg`): `Cotizaciones | Clientes`
3. **Fila de chips filtrables** (scroll horizontal, scrollbar oculta con clase `.hscroll`)
   - Chips: Todas, Pendientes, Aprobadas, Completadas — cada uno con count entre paréntesis
   - Chip activo: fondo `--ink`, texto `--bg`
4. **Agrupación por fecha** ("Hoy", "Esta semana", "Anteriores")
   - Separador `.rule` con texto al centro y líneas a los lados
5. **Cards de cotización** (como en Inicio)
6. **Botón "+ Nueva cotización"** al final de la lista (pill ghost full-width)

**Sub-pestaña Clientes:** lista vertical de clientes con avatar (inicial en círculo), nombre, teléfono, número de cotizaciones. Botón "+ Nuevo cliente" al final.

---

### 4. Catálogo (`catalog`)

**Propósito:** Gestionar impresoras, materiales e inventario.

**Layout:**

1. **PageHeader**: "Catálogo"
2. **Segmented control**: `Impresoras | Materiales | Inventario`
3. **Lista de items** — cada uno como card con:
   - Ícono/thumbnail (placeholder 40×40, radius 8px)
   - Nombre + metadata secundaria
   - Flecha `>` a la derecha (para editar)
4. **Botón "+ Agregar"** al final

**Impresoras:** nombre, modelo, volumen, consumo W, costo, vida útil h
**Materiales:** tipo (PLA/PETG/ABS/TPU...), color, marca, precio/kg, densidad
**Inventario:** spools con peso restante en barra de progreso

---

### 5. Ajustes (`settings`)

**Propósito:** Configuración global — perfil, tarifas, tema, exportar/importar.

**Layout:**

1. **PageHeader**: "Ajustes"
2. **Secciones en cards agrupadas**, cada fila como `.row`:
   - Nombre/negocio
   - Moneda (MXN/USD)
   - Tarifa de diseño/h
   - Costo de energía/kWh
   - Costos fijos mensuales
   - % desperdicio
   - **Tema** (Light / Dark / Auto) — segmented control
   - **Diseño de cotización** → abre subpantalla
   - Exportar datos (JSON)
   - Importar datos
   - Acerca de

---

### Pantallas secundarias

**Nuevo Cliente** (`new-client`): header con "← Volver", avatar circular grande, campos de nombre, teléfono, email, notas.

**Diseño de Cotización** (`generate`): preview de cómo se ve el PDF/mensaje que el cliente recibe — con logo, datos, desglose, total. Opciones para personalizar texto de encabezado, nota final, incluir/excluir desglose.

---

## State Management

Todo se persiste en `localStorage` con prefijo `lcdm_`:

| Key | Tipo | Uso |
|---|---|---|
| `lcdm_page` | string | Pestaña activa (`home`, `calc`, `quotes`, `catalog`, `settings`, `new-client`, `generate`) |
| `lcdm_theme` | string | `dark` \| `light` \| `auto` |
| `lcdm_currency` | string | `MXN` \| `USD` |
| `lcdm_quotes` | JSON array | Todas las cotizaciones |
| `lcdm_clients` | JSON array | Clientes |
| `lcdm_printers` | JSON array | Impresoras |
| `lcdm_materials` | JSON array | Materiales |
| `lcdm_settings` | JSON object | Configuración global (tarifas, costos) |

Al cargar la app, lee todos los valores de localStorage con defaults razonables. Al salir de una pantalla, guarda los cambios.

---

## Componentes reutilizables

### `.btn` (botón pill)
```css
height: 52px; padding: 0 22px; border-radius: 999px;
font-size: 14px; font-weight: 500;
```
Variantes: `.btn-primary` (lime bg + black text), `.btn-ghost` (elev bg + line border), `.btn-accent` (alias de primary).

### `.card`
```css
background: var(--bg-elev);
border: 0.5px solid var(--line);
border-radius: 16px;
```

### `.seg` (segmented control)
Inflex con padding 3px, cada botón con padding `8px 14px`, radius `999px`. El activo tiene `background: var(--ink); color: var(--bg)`.

### `.switch`
42×24px, fondo `--line` apagado, `--accent` encendido. Thumb 20×20px con `transform: translateX(18px)` al activar.

### `.slider` (range input customizado)
Track 2px altura, thumb 20px con borde de 3px color `--bg` y shadow 1px del accent.

### `.field`
Input con label mono arriba, input sin background, `border-bottom: 1px solid var(--line)`. Al focus cambia borde a `--accent`.

### `.tag` (chip pequeño)
Padding `4px 9px`, radius 999px, font mono 10px uppercase, bg `--bg-elev`, border `--line`.

### `.page-header`
Padding `28px 20px 18px`, con eyebrow mono + H1 grande. El H1 puede contener `<em>` que se renderiza en `--accent` (NO italic).

### `.row`
Fila de ajuste con padding vertical 14px, `border-bottom: 0.5px solid --line`, flex space-between.

### `.micro`
Texto mono 10px uppercase con letter-spacing 0.14em en color `--ink-3` — para labels y eyebrows.

### `.ph` (placeholder visual)
Patrón de rayas diagonales para thumbnails/imágenes que aún no existen. Usar `repeating-linear-gradient`.

### `.hscroll`
Utilidad para rows con `overflow-x: auto` que necesitan esconder la scrollbar. Incluye `scrollbar-width: none` y `::-webkit-scrollbar { display: none }`.

---

## Íconos

Los íconos están en `prototype/icons.jsx` como SVG components. Son **stroke-based, 1.4–1.75 de grosor**, estilo minimalista (Phosphor/Lucide-like). Incluyen: `IcHome, IcCalc, IcQuotes, IcCatalog, IcSettings, IcPlus, IcArrow, IcClose, IcCheck, IcDownload, IcUpload, IcSun, IcMoon`, etc.

Para el proyecto vanilla JS, recomendación: usar **Lucide** inline (`https://lucide.dev/`) o copiar los SVGs del archivo `icons.jsx` como strings en tu HTML. Mantener `stroke-width: 1.5` como default y `1.75` para estados activos.

No usar emojis.

---

## Animaciones

### Page transitions
Cada página al montar:
```css
animation: pageIn 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
@keyframes pageIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Botones
`:active { transform: scale(0.97); }` con transición de 0.1s — feedback táctil.

### Total en Calcular
El número grande debe animar cambios (no actualizar bruscamente). Sugerencia: interpolar con `requestAnimationFrame` durante ~200ms al detectar cambio de valor.

---

## Responsive

La app está pensada como **PWA instalable en móvil**. En desktop se muestra como un "dispositivo" centrado con max-width 440px y sombra. No hay layouts desktop diferentes — es mobile-first intencional.

Soporta:
- `env(safe-area-inset-bottom)` para notch/home bar iOS
- `prefers-color-scheme` cuando el tema está en `auto`
- Touch events — todos los botones tienen hit area ≥44px

---

## Tweaks panel (opcional)

El prototipo tiene un panel flotante con toggle `light/dark/auto`. En producción, **esto vive solo en Ajustes** — puedes omitir el panel flotante.

---

## Screenshots

Ver carpeta `screenshots/` — 5 capturas de las pantallas principales a 440px de ancho:
- `01-home.png` — Inicio con dashboard
- `02-calc.png` — Calcular con hero total
- `03-quotes.png` — Cotizaciones con filtros
- `04-catalog.png` — Catálogo de impresoras
- `05-settings.png` — Ajustes

---

## Files

### En `prototype/`
- `La Casita del Molde.html` — entrada principal, monta React via Babel
- `styles.css` — **sistema de diseño completo** (cópialo tal cual)
- `shared.jsx` — utilidades, `PageHeader`, `BottomNav`, `AppShell`
- `icons.jsx` — todos los íconos SVG
- `ios-frame.jsx` — frame de dispositivo (solo para desktop preview)
- `page-home.jsx` — pantalla Inicio
- `page-calc.jsx` — pantalla Calcular
- `page-quotes.jsx` — pantalla Cotizaciones
- `page-catalog.jsx` — pantalla Catálogo
- `page-settings.jsx` — pantalla Ajustes
- `page-new-client.jsx` — Nuevo Cliente
- `page-generate.jsx` — Diseño de Cotización

**Nota:** Los archivos `.jsx` son prototipos en React inline. Para adaptarlos a HTML + Vanilla JS, extrae la estructura del JSX como `innerHTML` templates y reemplaza los hooks de React por manejo manual de `localStorage` + `document.querySelector`. El CSS se puede copiar 1:1.

---

## Instrucciones para Claude Code

Cuando abras esto en Claude Code, el mejor flujo es:

1. **Leer `styles.css` completo** y adoptar los tokens CSS variables en el proyecto real — reemplaza los colores y fuentes actuales.
2. **Abrir `La Casita del Molde.html` en navegador** para ver la app en vivo y capturar intenciones de interacción.
3. **Migrar pantalla por pantalla** empezando por Inicio (más simple) → Ajustes → Cotizaciones → Catálogo → Calcular (más compleja).
4. **Preservar la lógica existente** de cálculo de costos, almacenamiento y PWA — solo cambia la capa visual y estructura del DOM.
5. **Verificar en móvil real** — la app se siente distinta en un teléfono que en un preview desktop.

---

**Generado por Claude Designer** · Diseño: Dark Luxe · Fidelidad: Alta · Stack destino: HTML + Vanilla JS
