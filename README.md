# Calculadora de Costos 3D

PWA para calcular costos de impresión 3D y generar cotizaciones profesionales para clientes.

## Funcionalidades

- **Calculadora de costos** — material, energía, depreciación por impresora, costos fijos, desperdicio y margen de ganancia
- **Cotizaciones** — multi-producto, exportación a PDF e imagen, botón de WhatsApp, estados (pendiente / aceptada / rechazada)
- **Catálogo de productos** — toppers, cortadores de galleta con tabla de precios por tamaño, lista de precios en Excel
- **Clientes** — base de datos con historial de cotizaciones por cliente
- **Inventario de filamento** — control de stock por rollo con alertas de stock bajo
- **Dashboard** — ingresos del mes (solo cotizaciones aceptadas), historial mensual de los últimos 6 meses
- **Editor de cotizaciones** — logo, colores de marca, campos visibles, términos y pie de página

## Stack

HTML + CSS + JavaScript vanilla. Sin frameworks ni build step.

- Material Design 3 tokens
- PWA con Service Worker (funciona offline)
- `localStorage` para persistencia local
- Exportación PDF con `pdf-lib`, imágenes con `html2canvas`, Excel con `SheetJS`

## Estructura del proyecto

```
├── index.html          # Shell principal
├── manifest.json       # PWA manifest
├── sw.js               # Service worker
├── css/
│   ├── tokens.css      # Design tokens (dark/light)
│   ├── base.css        # Reset, layout, navegación
│   ├── components.css  # Componentes UI
│   └── quote.css       # Template de cotización
├── js/
│   ├── store.js        # Data store y helpers de localStorage
│   ├── ui.js           # Navegación y helpers de UI
│   ├── calculator.js   # Lógica de cálculo
│   ├── catalog.js      # Catálogo de productos
│   ├── quotes.js       # Cotizaciones, PDF, imagen, WhatsApp
│   ├── clients.js      # Base de clientes
│   ├── inventory.js    # Inventario de filamento
│   ├── dashboard.js    # Métricas e historial mensual
│   ├── printers.js     # CRUD impresoras
│   ├── materials.js    # CRUD materiales
│   ├── quote-editor.js # Editor visual de cotizaciones
│   ├── config.js       # Configuración general
│   ├── history.js      # Historial de cálculos
│   └── theme.js        # Tema claro/oscuro/auto
└── assets/
    ├── icon-192.png
    └── icon-512.png
```

## Uso local

No requiere instalación ni servidor. Abre `index.html` directamente en el navegador, o sirve la carpeta con cualquier servidor estático:

```bash
npx serve .
```

## Deploy en Vercel

El proyecto está conectado a Vercel para deploy automático. Cada `git push` a `main` actualiza la app en producción.

```bash
git add .
git commit -m "descripción del cambio"
git push
```

## Datos

Todos los datos se guardan en `localStorage` del dispositivo bajo el prefijo `c3d_`. Usa **Ajustes → Exportar** para hacer respaldos manuales en formato JSON.
