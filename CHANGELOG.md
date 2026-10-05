# Historial de cambios

Qué cambió en cada versión de la app, en orden: lo más reciente arriba.

## Cómo saber qué versión estás viendo

La app no muestra su versión en pantalla. El dato está en `sw.js`, primera línea:

```js
const CACHE_NAME = 'calc3d-v100';
```

Ese número sube en cada despliegue y es lo que identifica el build. Para comprobar
cuál está corriendo en producción, abre la consola del navegador y escribe:

```js
caches.keys()
```

Si el número no coincide con el de este archivo, el navegador sigue sirviendo una
versión vieja desde el service worker. Se fuerza la actualización recargando con la
pestaña de Aplicación → Service Workers abierta, o cerrando todas las pestañas de la
app y volviendo a entrar.

> **Antes de probar en producción:** el `README.md` apunta a
> `calculadora3d-delta.vercel.app`, que **no es esta app** — sirve otro producto
> («3D COST PRO», en pesos argentinos). Hay que corregir esa URL antes de que alguien
> la siga para probar.

---

## 2026-10-04 · caché v100

La entrega más grande desde el inicio. Toca el modelo de costos, así que **los precios
que calcula la app cambian** respecto a la versión de julio. Es intencional: los de
antes estaban mal en los casos que se describen abajo.

### Añadido

- **Campo «Piezas» en la calculadora.** El slicer reporta la placa completa, no la
  pieza. Ahora se declara cuántas piezas salen de esa placa y todo se divide entre
  ese número — material, energía, depreciación, fijos, indirectos, mantenimiento,
  desperdicio, post-procesado y diseño. Debajo aparece una línea con lo que quedó por
  pieza y de qué placa salió.
- **Precio por partida editable.** Se escribe el precio cerrado con el cliente y la app
  recalcula el margen hacia atrás. Si queda por debajo del costo lo dice en rojo y
  avisa. Vaciar el campo devuelve el precio calculado.
- **Apartado de gastos indirectos** (Ajustes → Gastos indirectos), con categorías y
  prorrateo por hora de impresión. Cubre guantes, lijas, alcohol, cinta, bolsas.
- **Porcentaje de mantenimiento** para boquillas, bandas y refacciones. Se aplica sobre
  los costos de máquina, no sobre el diseño ni la pintura.
- **Onboarding de cinco pasos** e **inicio de sesión simulado** (`js/auth.js`), escrito
  con las firmas exactas de Firebase para que migrar sea cambiar el cuerpo de las
  funciones y no la interfaz.
- **`js/costing.js`** — la fórmula de costeo aislada del navegador, con **24 pruebas
  automáticas** (`npm test`). Es lo único que habrá que portar a Android.
- **Documentación** en `docs/`: mapa de sitio, diseño de base de datos para Firebase,
  auditoría de código, auditoría de usabilidad y la ruta a Android, con diagramas.

### Cambiado

- **Purga AMS: de 40 g a 0.7 g por cambio de color.** El valor anterior estaba inflado
  unas 60 veces contra un corte real de Bambu Studio. Hay migración automática: si
  tenías guardado un valor de 10 g o más, se corrige solo al abrir la app. Además se
  captura el número de cambios de color, que el slicer reporta y que **no** es el
  número de colores.
- **Estados vacíos con un solo botón**, debajo de la explicación. Antes aparecía el
  mismo botón dos veces: en el encabezado y en el estado vacío.
- **El botón de atrás de la calculadora** decía «Cotizaciones» y siempre llevaba ahí.
  Ahora dice «Regresar» y vuelve a donde estabas. El segmentado «Cotizar | Historial»
  se quitó; el historial quedó como acceso de icono.
- **El PDF se genera desde el mismo HTML de la cotización** en vez de dibujarse a mano.
  Contrapartida: el texto del PDF deja de ser seleccionable porque es una imagen.
- **Accesibilidad:** piso de 12 px (80 textos que estaban entre 9 y 11 px), áreas
  táctiles de 44 px, y contraste corregido — tres colores de texto no cumplían WCAG en
  ninguno de los dos temas.
- **La cantidad de una partida se escribe** en vez de subir de uno en uno, y la ✕ de
  borrar se movió a la esquina, lejos de los botones de ±1.

### Corregido

Cuatro de éstos perdían datos en silencio:

- **Editar una cotización y cerrar sin guardar** hacía que la siguiente orden
  sobrescribiera esa cotización.
- **Aceptar una cotización** descontaba inventario y regresarla a pendiente no devolvía
  el filamento.
- **El material purgado nunca se descontaba** del inventario: el dato no llegaba a la
  cotización.
- **El ingreso se reportaba por fecha de creación**, no de aceptación. Cotizar el 28 de
  septiembre y cobrar el 10 de octubre ponía el dinero en septiembre.
- **El historial de cálculos no podía tener contenido**: la función de guardar existía
  y ningún botón la llamaba.
- **Los productos de tabla de precios reportaban ganancia cero** en el panel.
- **Switches de la pestaña Diseño** que no respondían, y **datos bancarios** que
  aparecían vacíos en la cotización.

### Qué conviene probar en producción

1. **Una placa con varias piezas.** Captura los datos de un corte real con «Piezas» en
   el número correcto y comprueba que el precio por pieza es razonable. Multiplícalo por
   las piezas: debe acercarse al costo de la placa completa.
2. **La purga AMS después de abrir la app.** Si venías de la versión de julio, revisa en
   Ajustes que el valor haya migrado a 0.7 g. Es el cambio con más efecto en los precios
   de piezas multicolor.
3. **Aceptar una cotización y regresarla a pendiente.** El inventario debe descontarse y
   volver a su lugar.
4. **Escribir un precio por debajo del costo.** Debe avisar y pintarse en rojo.
5. **Una cotización completa en el teléfono**, de principio a fin, incluido el PDF.

---

## 2026-07-04 · identidad Quotia

Identidad de marca, edición de cotizaciones ya creadas, comisiones y un interruptor para
mostrar u ocultar los datos bancarios en la cotización.

---

## 2026-05-24 · versión de escritorio · caché v64–v66

La tanda que convirtió la app de «móvil estirado» a una versión de escritorio real:

- Barra lateral fija, con las secciones separadas y botones de acción arriba a la derecha
- Los modales pasaron a cajones laterales en pantallas grandes
- Ajustes en dos paneles, con pestañas
- Sincronización bidireccional con Notion
- Tarjeta de cotización con diseño propio de escritorio y enlace público para compartir

---

## 2026-05-02 · caché v61

Correcciones de espaciado en cotizaciones, clientes y panel. Piezas del mes y estado
«enviada».

---

## 2026-04-26 · caché v57–v60

Barra superior personalizable, impresión multicolor con número de cabezales, selector de
rollo corregido, y varias correcciones de desbordamiento en Ajustes.

---

## 2026-04-19 · caché v46–v52

Migración de la interfaz a **Dark Luxe**: tokens de color, tipografía y componentes, con
la marca en SVG. Redondeo de precios al múltiplo de cinco. Varias correcciones de
desbordamiento horizontal.

---

## 2026-04-13 · caché v30

Gastos fijos por categoría, descuento en cotizaciones, y ganancia y margen en el panel.

---

## 2026-04-11 · versión inicial

Primera versión de la Calculadora 3D: costeo de piezas, impresoras, materiales,
inventario y cotizaciones.
