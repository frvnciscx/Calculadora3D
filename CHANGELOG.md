# Historial de cambios

Qué cambió en cada versión de la app, en orden: lo más reciente arriba.

## Cómo saber qué versión estás viendo

La app no muestra su versión en pantalla. El dato está en `sw.js`, primera línea:

```js
const CACHE_NAME = 'calc3d-v102';
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

> ~~**Antes de probar en producción:** el `README.md` apunta a
> `calculadora3d-delta.vercel.app`, que **no es esta app** — sirve otro producto
> («3D COST PRO», en pesos argentinos). Hay que corregir esa URL antes de que alguien
> la siga para probar.~~ Corregido el 2026-11-03: la app es `calculadora3-d-delta.vercel.app`, con guion.

---

## 2026-11-09 · caché v108

Cambios de diseño que pidió Francisco (D115–D126). La sincronización y la fórmula de costeo no
cambian (44 pruebas en verde).

### Añadido

- **Pantalla de entrada:** casilla «Recordar contraseña» y un ojo para mostrar u ocultar la
  contraseña. La contraseña la guarda el navegador o el teléfono, no la app; la app solo
  recuerda el correo. Los campos ahora van en un formulario, para que el navegador ofrezca
  guardarla.
- **«¿Olvidaste tu contraseña?»:** Firebase manda un correo, en español, para poner una nueva.
- **Barra lateral:** «Cerrar sesión» abajo, con el correo de la cuenta; un interruptor de modo
  oscuro debajo de Ajustes; Clientes debajo de Inventario; y el logo de Ajustes › Diseño en el
  ícono de arriba. Si el logo cambia en otro equipo, la barra se redibuja al momento: una línea
  en `js/db.js`, en la lista de qué se redibuja cuando llega algo de la nube (D126).

### Cambiado

- **Ajustes › Diseño:** la vista previa de la cotización va a la derecha y se queda a la vista al
  bajar. En el teléfono sigue debajo.
- **Ajustes va centrado** en escritorio: encabezado, pestañas y contenido con el mismo ancho.
- **El tema empieza en automático** (sigue al navegador) y se guarda en cada navegador, no en la
  cuenta: cambiarlo ya no escribe en la nube ni lo cambia en los otros equipos. Quien había
  elegido Claro lo conserva; en Ajustes › Otros sigue «Auto» para volver a automático.

### Corregido

- **En escritorio, Ajustes se salía 240 px por la derecha** y cortaba Exportar e Importar: el
  panel medía toda la ventana aunque empieza después de la barra lateral.
- **El logo nunca aparecía en la barra** (lateral ni de arriba): se buscaba con otro nombre.

### Qué conviene probar en producción

1. Entrar con la casilla marcada: el navegador ofrece guardar la contraseña. Al cerrar sesión y
   volver, el correo aparece escrito.
2. Ajustes › Diseño: cambiar un color y verlo en la vista previa de la derecha; subir el logo y
   verlo en el ícono de la barra lateral.
3. «¿Olvidaste tu contraseña?» con tu correo: llega el correo para poner una nueva.

**Comprobado por Francisco el 2026-11-09, en su equipo y antes de publicar:** el navegador ofrece
guardar la contraseña y, al crear una cuenta, sugiere una segura; el logo aparece en la barra
lateral. Falta el 3, después de publicar.

---

## 2026-11-09 · caché v107

La sincronización con la nube ya no pierde registros. La fórmula de costeo no cambia (24 pruebas en verde).

### Corregido

- **Se borraban cotizaciones, clientes, gastos fijos, gastos indirectos y datos del negocio**
  (reportado por Francisco). Cada aviso de la nube reemplazaba la lista completa del dispositivo,
  y se perdía lo que no había alcanzado a subir: una cotización duplicada, el cliente creado al
  guardar una cotización, los gastos guardados justo antes de cerrar la app. Ahora `js/db.js`
  junta los dos lados: recuerda cómo llegó cada registro la última vez de la nube; si solo cambió
  el dispositivo, gana el dispositivo y se sube; si cambió la nube, gana la nube; lo que nunca
  subió se conserva y se sube.
- **Cualquier cosa que se guarda en el dispositivo sube a la nube**, no solo lo que pasaba por las
  funciones `dbGuardar*`.
- **Los ajustes suben al ocultarse la app** o al cerrar sesión, sin esperar los 0.8 s.

### Añadido

- **El historial de cálculos y los favoritos viven en la nube** (`calculos/` y `favoritos/`):
  se ven en todos los equipos y ya no se pierden al cerrar sesión.

### Qué conviene probar en producción

1. Guardar los gastos fijos, cerrar la app enseguida y volver a abrirla: siguen ahí.
2. Duplicar una cotización y abrir la app en otro equipo: aparece.

**Después de v107** se agregaron al repo las pruebas de la sincronización, de entrar con cuenta
y de lo que une las pantallas con la nube y con la caché (`tests/`, D113). `npm test` pasa de 24
a 43 pruebas. No cambian la app.

---

## 2026-11-09 · caché v106

Correcciones a la conexión con Firebase. La fórmula de costeo no cambia (24 pruebas en verde).

### Corregido

- **Entrar con cuenta borraba los datos del dispositivo.** La app escuchaba la nube antes de
  subir lo que había, y la nube vacía de una cuenta nueva reemplazaba cotizaciones, clientes,
  rollos y ajustes. Ahora decide primero: en una cuenta nueva lo sube solo; en una cuenta que ya
  existía pregunta si agregarlo, y los ajustes de la cuenta se quedan. Antes de subir guarda una
  copia en el dispositivo (`c3d_respaldoAntesDeNube`).
- **La app no abría sin conexión.** `index.html` pedía `js/auth.js?v=105` y el service worker lo
  tenía guardado como `js/auth.js`; tampoco guardaba la librería de Firebase. Ahora coinciden, y
  los tres archivos de Firebase se guardan en la caché.
- **«Otros (sin desglosar)» volvía** al borrarlo de los gastos fijos. Ahora solo se crea la
  primera vez que se desglosa un total escrito a mano.
- Importar un respaldo con sesión también lo sube a la cuenta.
- Las escrituras a Firestore quitan los campos vacíos (`undefined`), que hacían fallar la
  escritura completa, y suben en tandas de 450.

### Qué conviene probar en producción

1. Sin conexión: abrir la app una vez con señal, cerrarla, poner modo avión y volver a abrirla.
2. En un navegador sin datos importantes: entrar con la cuenta y ver que aparezcan los datos de la nube.

**Comprobado por Francisco el 2026-11-09:** ya abre sin conexión (antes se quedaba en negro) y la
configuración se guarda en la cuenta. Se borran los registros que se guardan solo en el dispositivo
(duplicar una cotización, el cliente creado al guardar una cotización): ver `docs/firebase.md` §3.
Después de v106 se agregaron al repo las reglas de seguridad (`firestore.rules`); no cambian la app.

---

## 2026-11-06 · caché v105

Conexión inicial a Firebase (Javi Gama, commit `5355271`): inicio de sesión con correo, Google y
sin cuenta; negocio y persona en Firestore como dice `docs/modelo-de-datos.md`; cotizaciones,
clientes, rollos, impresoras, materiales, productos y ajustes en la nube, con copia en el
dispositivo. Anotada el 2026-11-09 en la revisión de `docs/reglas-de-negocio.md` §5.

---

## 2026-11-04 · caché v102

Cambios de pantalla, sobre todo en escritorio. La fórmula de costeo no cambia (24 pruebas en verde).

### Escritorio (900 px o más)

- **La calculadora usa el ancho.** A la izquierda van los campos: los cuatro números de la placa
  en una fila, la impresora y el material lado a lado, y el bloque multicolor en cuadrícula. A la
  derecha, el resultado con su desglose siempre abierto y los botones, que no se van al desplazarse.
- **Encabezado fijo** con el título y el toggle **«Costo de la pieza | Orden»**. «Orden» se
  habilita con el primer producto y muestra cuántos lleva.
- **Modo Orden:** a la izquierda van el cliente, la tabla de productos (cantidad, precio e importe)
  y el resumen con «Generar cotización». A la derecha, la **vista previa** de la cotización tal como
  la verá el cliente, que se actualiza mientras se escribe. El folio que muestra es el que tendrá al
  generarse; la vista previa no gasta folios.
- **Contenedor lateral de la cotización**, como el panel del agente en VS Code. «Ver cotización»
  la abre a la derecha sin oscurecer la pantalla, y la página se angosta para darle lugar. Sigue
  abierto al cambiar de sección hasta cerrarlo. Si la página queda angosta, la calculadora pasa a
  una columna.

### Teléfono y escritorio

- **Al generar, ya no te saca de la calculadora.** Sale un modal con las opciones para enviarla:
  PDF, imagen, WhatsApp, enlace, texto y ver cotización. Al editar una, dice «actualizada».
- **Teléfono:** al bajar por los campos, los botones de la calculadora flotan abajo con el precio.
- **Modo claro:** el texto y el punto de los toggles van en blanco sobre el color de acento.
- Se quitó el botón «Agregar a orden» repetido.
- Los textos de ayuda de Peso y Tiempo dicen «De toda la placa». Antes, al agregar un producto,
  volvía «Ej: 15g para un topper».
- Los campos de cambios de color y purga del bloque multicolor ya no cortan lo escrito.

### Qué conviene probar en producción

1. Que `caches.keys()` diga `calc3d-v102`.
2. En escritorio: calcular, agregar dos productos, pasar a «Orden», escribir el cliente y ver que la
   vista previa cambia; generar y elegir PDF desde el modal.
3. «Ver cotización» abre el contenedor lateral y sus botones exportan esa cotización, también
   después de generar otra.
4. En el teléfono: la orden sigue saliendo desde abajo y el modal de envío aparece al generar.
5. En **modo claro**, el modo Orden, el modal y el contenedor. En local se probó el escritorio
   a 1400 × 900 y 1000 × 700 en oscuro, el modo claro a 1400 × 900 y el teléfono a 390 px.

---

## 2026-10-16 · caché v101

Cambio de seguridad. Los precios y los datos no cambian.

### Quitado

- **La sincronización con Notion** (`api/sync/`, `js/sync.js` y el icono de nube de la
  barra superior y de la barra lateral). Sus dos funciones no pedían contraseña: cualquiera
  con la dirección de la app podía descargar la copia de los datos o subir una nueva, y la
  app la aplicaba sola al abrir. Se retira por D71 de `docs/reglas-de-negocio.md`; los
  datos en la nube llegan con Firebase. El respaldo de Ajustes › Exportar e Importar sigue.

### Añadido

- **`.vercelignore`** con la lista de lo único que se publica: `index.html`, `quote.html`,
  `manifest.json`, `sw.js`, `css/`, `js/`, `assets/` y `api/`. Hasta v100 el sitio publicaba
  también los documentos, las órdenes de compra y los archivos de respaldo (D70).

### Qué conviene probar en producción

1. Que `/docs/AUDITORIA.md` y `/MEJORAS.md` respondan 404 en la dirección de la app.
2. Que la app abra y cotice igual que antes, y que `caches.keys()` diga `calc3d-v101`.
3. Que el botón «Notion» de las cotizaciones aceptadas siga funcionando: esa función no se tocó.

**Comprobado el 2026-11-03**, después de publicar (Pull Request #1), solo con códigos de estado: el 1 sí, y la caché publicada es `calc3d-v101`. También responden 404 `/CHANGELOG.md`, `/README.md`, `/docs/reglas-de-negocio.md`, `/js/sync.js`, `/api/sync/pull` y `/api/sync/push`. Cotizar (2) y el botón «Notion» (3) los prueba Francisco en la app.

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
