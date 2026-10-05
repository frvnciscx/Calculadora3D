# Auditoría de usabilidad y contraste

Tres auditorías independientes, cada una desde una persona distinta, más una
medición objetiva de contraste. Octubre 2026.

---

## Cómo se hizo

**El contraste se midió, no se opinó.** Se calcularon los ratios WCAG 2.1 de cada par
color/fondo que la app usa de verdad, en tema claro y oscuro.

**Las personas salieron de investigación, no de la imaginación.** Se buscó quién usa
realmente herramientas de costeo de impresión 3D antes de inventar perfiles. El
resultado cambió el alcance: el segmento dominante no es el taller artesanal sino el
**vendedor de marketplace**, y en México hay un segundo mercado claro en servicios B2B
—arquitectura, dental, PyME manufacturera— que la app hoy no puede atender.

Cada persona auditó el código de forma independiente, sin ver lo que encontraron las
otras.

---

## Las tres personas

### Rosa Mendoza · 41 años · Puebla
**"Detalles Rosa"** — microtaller en casa. Toppers, cortadores y recuerdos para XV años
y bautizos. Dos impresoras FDM y una de resina. **Usa el celular para todo**, cotiza por
WhatsApp mientras atiende a sus hijos. Presbicia incipiente.

> *"A veces cobro una pieza y a fin de mes no me queda nada, y no sé por qué."*

Representa al usuario actual de la app.

### Diego Narváez · 28 años · Guadalajara
**"NrvForge"** — granja de 6 impresoras corriendo casi 24/7. **Vende en Etsy, Mercado
Libre y Amazon Handmade.** Imprime lotes de 30 piezas idénticas por placa. Trabaja en
laptop con monitor externo.

> *"Tengo 40 listados activos y no sé cuáles me dan dinero y cuáles me lo quitan."*

Representa el segmento más grande del mercado según la investigación.

### Ing. Alfonso Rivera · 57 años · Querétaro
**"Prototipos AR"** — buró de servicio con 3 empleados. Clientes empresa: despachos de
arquitectura, PyMEs manufactureras, dos clínicas dentales. Factura con IVA, emite
cotizaciones formales con vigencia y anticipo. Escritorio, lentes de lectura, oficina con
ventanal.

> *"Excel ya no me alcanza, pero no voy a usar algo que no pueda auditar ni explicarle a
> un cliente."*

Representa el mercado B2B que la app no puede atender hoy.

---

## Auditoría de contraste — resultado

Se midieron 19 pares contra tres fondos distintos, en los dos temas.

### Antes

| Tema | Incumplimientos | Casos |
|---|---|---|
| Oscuro | 5 de 19 | `ink-4` en los tres fondos (2.91–3.28:1) |
| Claro | 7 de 19 | `ink-4` (2.32–2.63:1), `ink-3` sobre hundido (4.23:1), `warn` (3.32:1) |

`--ink-4` se usa **24 veces como color de texto**. No hay exención posible: texto normal
necesita 4.5:1.

### Después

| Token | Tema | Antes | Ahora | Ratios |
|---|---|---|---|---|
| `--ink-4` | oscuro | `#5C6660` · 2.91 | `#7C8680` | 5.0 / 4.6 / 5.2 |
| `--ink-4` | claro | `#98A29C` · 2.32 | `#656F69` | 4.9 / 5.2 / 4.6 |
| `--ink-3` | claro | `#69756E` · 4.23 | `#636F68` | 5.0 / 5.2 / 4.6 |
| `--warn` | claro | `#c27f00` · 3.32 | `#A05D00` | 4.9 / 5.2 / 4.6 |

Se agregó **`--line-strong`** para el contorno de los campos de texto. El borde de un
campo no es decoración: es lo único que indica dónde se puede escribir, así que WCAG
1.4.11 pide 3:1. Antes era `0.5px` de `--line` con **1.2:1** — prácticamente invisible.
Ahora `1px` de `--line-strong`, 3.0–3.4:1.

Los separadores decorativos siguen usando `--line` sin cambio: son hairlines sin
significado y están exentos.

**Resultado: cero incumplimientos de texto en ambos temas.**

---

## Lo que se corrigió

### Bloqueantes de datos

**El flujo de cortadores por tamaño no funcionaba** *(Rosa, escenario B)*
`js/catalog.js` — un error de precedencia: `'<div id="tp-total">' + cur + sizes[0] && …
? … : …`. El `+` se evalúa antes que `&&` y que `?:`, así que **la etiqueta de apertura
se consumía dentro de la condición y nunca llegaba al HTML**. Sin `id="tp-total"`,
`updateTableTotal()` no encontraba el elemento y el precio se quedaba congelado en el
tamaño más chico. Y si el producto no tenía precio, salía un `</div>` suelto que
desbarataba la hoja y dejaba el botón "Agregar a orden" fuera de la pantalla.

Rosa: *"los cortadores son la mitad de lo que vendo entre semana."*

**El interruptor de refuerzo era invisible** *(Rosa, H3)*
`js/catalog.js` — se renderizaba un `<input type="checkbox">` suelto, pero
`components.css` lo esconde con `display:none` y dibuja el control en un
`.m3-switch-track` hermano que ahí no existía. El control funcionaba y no se podía ver.

**Cancelar una edición sobrescribía la cotización** *(Alfonso, N4)*
`js/quotes.js` — `_editQuoteIndex` solo se limpiaba al guardar con éxito. Abrir "Editar",
cerrar sin guardar, y después generar una cotización nueva **sobrescribía la vieja**, sin
aviso. El índice ahora vive dentro del borrador: nace y muere con él.

**Duplicar una cotización aceptada inventaba ingresos** *(Alfonso, N3)*
`js/quotes.js` — la copia heredaba `status: 'aceptada'` y `notionPageId`. El panel sumaba
un ingreso que nadie había pedido, y Notion la daba por sincronizada. Las copias ahora
nacen en blanco.

**El respaldo nunca guardó clientes ni inventario** *(sesión anterior, confirmado)*
`js/config.js` — `exportData` exportaba 6 de 8 colecciones.

### Números equivocados

**La purga de AMS nunca se descontaba** *(Diego, A4)*
`js/quotes.js` — regresión introducida al arreglar el descuento multicolor: la lógica de
reparto estaba, pero `addItemToDraft` no copiaba `amsPurgeGrams`, así que siempre
calculaba cero. Una tanda de 30 piezas multicolor dejaba ~189 g fantasma en inventario.

Diego lo encontró leyendo el código y comparándolo contra lo que el documento de
auditoría decía que estaba corregido. Tenía razón: estaba medio arreglado.

**El ingreso se reportaba en el mes equivocado** *(Alfonso, N2)*
`js/quotes.js` — no se guardaba fecha de aceptación y el panel filtraba por `quoteDate`,
la fecha de *creación*. Cotizar el 28 de septiembre y cobrar el 10 de octubre ponía el
dinero en septiembre. Ahora se guarda `acceptedAt`.

**Los cortadores de tabla reportaban ganancia cero** *(sesión anterior)*
**El panel contaba partidas, no piezas** *(sesión anterior)*

### Miedo y fricción

**"Aceptar" no preguntaba nada y no se podía deshacer** *(Rosa, H5)*
`js/quotes.js` — un toque descontaba inventario y subía a Notion. Regresar el estado a
pendiente **no devolvía el filamento**. Ahora pide confirmación diciendo exactamente qué
se va a descontar (*"Se va a descontar de tu inventario: 280 g de PLA Blanco"*), y salir
de "aceptada" devuelve el material.

Rosa: *"después de ese susto ya no quiero tocar Aceptar, y es el botón que más debería
usar."*

**La pestaña Historial no podía tener contenido nunca** *(Diego, escenario C)*
`saveToHistory()` existía y **ningún botón la llamaba**. El estado vacío decía *"usa la
calculadora y presiona «Guardar»"* refiriéndose a un botón inexistente. Se agregó el
botón.

**La app olvidaba tu impresora en cada carga** *(Diego, A5)*
`config.lastPrinterId` y `lastMaterialId` se guardaban con cuidado y **nadie los leía**.
`populateSelects()` siempre dejaba la primera impresora de la lista. Diego: *"2 selects ×
40 listados = 80 interacciones que el código ya intentó ahorrarme."*

**Se escribía en localStorage en cada tecla** *(sesión anterior)*

### Lo que pediste en esta sesión

**Estados vacíos con el botón debajo del texto**
`js/templates.js` + `css/components.css` — nueva jerarquía: icono en tarjeta → título →
explicación → acción. Los seis estados vacíos ahora tienen un botón que resuelve lo que
falta, en vez de una instrucción escrita sin nada que presionar.

**Los interruptores de Diseño ahora funcionan** *(Alfonso, D6)*
`js/quotes.js` — cinco de los seis se guardaban, se pintaban en la pantalla de
configuración y **`buildQuoteHTML` nunca los consultaba**. Prender "Mostrar desglose" no
hacía absolutamente nada. Ahora controlan un bloque de desglose en la cotización, con
cada rubro bajo su propio interruptor.

Alfonso: *"no es que falte la función, es que la pantalla dice que la tengo."*

**Datos bancarios**
`js/quotes.js` — antes exigía `bizAccountNumber`: capturar banco y titular sin la cuenta
no mostraba nada. Ahora el apartado aparece si hay **cualquier** dato y muestra solo los
capturados. Sin datos, no se dibuja.

**Totales desglosados** *(Alfonso, F2)*
El documento imprimía una sola línea TOTAL. Si dabas 12 % de descuento, el descuento se
aplicaba al número pero **no aparecía en ningún lado**. Ahora: Subtotal → Descuento →
Comisión → TOTAL.

**PDF rediseñado**
`js/quotes.js` — el PDF se dibujaba a mano con primitivas de pdf-lib: una segunda
implementación del mismo layout, que no se parecía a la vista previa, **perdía los
acentos** (Helvetica estándar: "COTIZACION", "Pena Nieto") y no tenía salto de página —
pasando de ~22 renglones el texto se encimaba y luego se salía de la hoja.

Ahora se renderiza el mismo HTML de la cotización con html2canvas y se incrusta en el
PDF, con reparto automático en varias páginas.

> **Sobre la librería:** no hizo falta cambiarla. Se conservan pdf-lib y html2canvas —
> ambas gratuitas y ya presentes. La limitante no era pdf-lib: era mantener el diseño
> escrito dos veces. **Contrapartida honesta:** el texto del PDF deja de ser
> seleccionable porque es una imagen. Para una cotización que se imprime o se manda por
> WhatsApp no estorba. Si algún día hace falta texto buscable, el camino es generar el
> PDF en el servidor con un motor de HTML, no volver a dibujarlo a mano.

---

## Un solo botón en los estados vacíos — aplicado

Un estado vacío mostraba **el mismo botón dos veces**: el del encabezado (escritorio) o
el de la barra inferior (móvil), y el del propio estado vacío. Dos "Nueva cotización" en
la misma pantalla, sin que uno pesara más que el otro, justo en el momento en que el
usuario menos sabe qué hacer.

Ahora, mientras la lista está vacía, **se retira el del encabezado y la barra**. El del
estado vacío se queda: está debajo de la explicación de qué pasó, que es donde la gente
lo busca después de leer. Vuelven en cuanto hay registros.

Las listas se registran solas al renderizarse (`marcarListaVacia()` en `js/ui.js`), así
que la regla vale igual en escritorio y en móvil y no hay que recordar mantenerla.

Tres detalles del comportamiento:

- **Con el filtro puesto y cero resultados no se oculta nada.** Ahí sí hay registros, y el
  botón del estado vacío dice "Ver todas" — otra acción, no un duplicado.
- **La barra inferior se oculta entera**, no solo su botón: es un bloque con fondo y borde
  que sin contenido dejaba una franja flotando sobre la lista.
- **El catálogo tiene un botón para tres listas**, así que manda la pestaña abierta: sin
  impresoras se retira, y al cambiar a Materiales vuelve.

**Clientes era la única lista con el estado vacío escrito a mano** — un renglón de texto
gris, sin icono y sin salida. Ahora usa la misma plantilla que las demás.

---

## Navegación de la calculadora — aplicado

**El botón de atrás mentía.** Decía "Cotizaciones" y siempre llevaba ahí, aunque hubieras
entrado desde Inicio o desde el Catálogo. Ahora dice **"Regresar"** y regresa a la página
de donde viniste.

**El segmentado "Cotizar | Historial" no era un segmentado.** Un control de ese tipo
promete cambiar la vista sin moverte de lugar; éste navegaba a otra página, que además
tiene su propio botón de regreso. Prometía una cosa y hacía otra.

Se quitó. El historial es un **destino**, no un modo, y quedó como un acceso de icono en
la misma esquina. No se eliminó del todo porque en móvil **no existe en ningún otro
lado**: el menú lateral que lo lista es exclusivo de escritorio, y borrarlo habría dejado
la página huérfana en el teléfono.

---

## Dos defectos que aparecieron al verificar

Ninguno de los dos se pidió; los dos estaban rompiendo la pantalla.

**El botón principal de la calculadora se salía de la fila.** En cuanto hay un borrador,
el botón pasa de "Agregar a orden" a "Generar cotización" con el contador, y a 375 px ya
no cabía en un tercio de fila: la acción más importante de la pantalla quedaba cortada a
la mitad. Debajo de 420 px se baja a su propio renglón, a todo lo ancho.

**La partida del borrador se apilaba según el ancho de la pantalla, y ésa era la medida
equivocada.** La regla miraba el *viewport*, pero el cajón de escritorio mide 520 px —
igual de estrecho que un teléfono. En un monitor de 1054 px la descripción se quedaba con
**56 px** y decía "Guía q…": justo el dato que dice qué estás contando. El apilado pasó a
ser el comportamiento normal del renglón, sin consulta de ancho.

De paso: al agregar el campo de precio, el flex encogió los botones de ±1 y el de quitar
a 38–39 px y se perdía el área táctil ganada en la sesión anterior. Llevan `flex-shrink: 0`.

---

## La placa y el precio escrito — aplicado

Tres de los hallazgos de alto impacto estaban marcados como "requieren una decisión
tuya". La decisión se tomó, y los tres se resolvieron con **dos campos**, porque eran el
mismo problema visto desde tres lados.

### Un campo, no tres: «Piezas»

**No existía el concepto de placa** *(Diego B1, Rosa #6)* — la app cotizaba por pieza y
nadie imprime por pieza. Diego capturó 900 g y 14 h de una placa de 30 y la app le dio
**$25,650 en vez de $900**: 28× de error, sin advertencia, con un número grande y
plausible.

**El diseño se multiplicaba por la cantidad** *(Diego B2, Alfonso G1)* — un archivo se
diseña una vez y se imprime 30; la app cobraba 30 diseños. Diego: *"no mal por poco: mal
por un factor igual a la cantidad."*

Resultaron ser lo mismo. El slicer **siempre** reporta la placa: gramos, horas y
desperdicio de la corrida completa. Lo que faltaba no era un concepto nuevo, era decirle
a la app cuántas piezas cubren esos números.

`js/costing.js` recibe ahora `pieces` y divide **todo** entre ese número — sin
excepciones, porque todo lo que se captura es de la placa: material, energía,
depreciación, fijos, indirectos, mantenimiento, desperdicio, post-procesado y diseño.

El redondeo a múltiplo de 5 se aplica **después** de dividir. Redondear la placa y luego
repartir deja precios como $21.67.

| Caso | Antes | Ahora |
|---|---|---|
| Placa de 30 · 900 g · 14 h | $870 la pieza | $30 la pieza · $900 la placa |
| 6 maquetas · 12 h de diseño | 72 h cobradas | 2 h por maqueta · 12 h en total |

**Dos cantidades que no se confunden.** Las de la placa **dividen** (cuántas salieron de
una corrida); la de la cotización **multiplica** (cuántas te compran). Si capturas la
placa de 30 y vendes 30, el diseño se cobra exactamente una vez.

Tres detalles que no se ven pero importan:

- Lo que viaja a la cotización es el peso **por pieza**. Si se guardaran los gramos de la
  placa, un pedido de 30 descontaría 30 placas del inventario.
- Los datos tal como se capturaron se guardan aparte (`plateWeight`, `plateTimeH`,
  `plateDesignH`), para poder volver a llenar el formulario igual que estaba.
- Al agregar la pieza a la orden, «Piezas» vuelve a 1. Dejarlo en 30 habría dividido la
  siguiente pieza entre 30 sin que nada en pantalla lo advirtiera.

Debajo del campo aparece una línea con lo que quedó por pieza —gramos, horas y costo— y
de qué placa salió. Con 30 piezas el número grande baja mucho de golpe, y sin ver de
dónde salió no hay manera de saber si la app dividió o si uno se equivocó al capturar.

### Escribir el precio

**No se podía escribir un precio** *(Alfonso P1)* — tiene precios cerrados: $850 por guía
quirúrgica. La única forma de llegar era empujar el deslizador de margen hasta que el
redondeo cooperara: 38 % daba $845 y 39 % daba $855. El precio buscado **no existía en
ningún punto del deslizador**. Alfonso: *"honestamente, descalificante."*

El precio por pieza de cada partida es ahora un campo. Al escribirlo, la app recalcula el
margen hacia atrás y lo muestra en la fila — que es justo el dato que se pierde al fijar
un precio a mano:

> Guía quirúrgica · × 2 = $1,700.00 · margen 16 % · precio escrito

Si el precio queda **por debajo del costo**, la línea se pone en rojo (*"margen −42 % ·
bajo costo"*) y aparece un aviso con el costo real. Vender bajo costo es una decisión
legítima —un cliente grande, un trabajo de entrada— pero tomarla sin saberlo no.

Vaciar el campo devuelve el precio calculado: `autoPrice` guarda el original y nunca se
pisa. Las cotizaciones guardadas antes de este cambio se rellenan al editarlas.

En los productos de tabla de precios no hay costo real conocido (`baseCost: null`), así
que no se muestra margen en vez de inventar un número.

---

## Lo que NO se corrigió, y por qué

Son cambios de modelo de negocio, no defectos. Cada uno necesita una decisión tuya.

### Expansión de mercado

**Comisiones de marketplace** *(Diego A1)* — Etsy ~6.5 %, Mercado Libre hasta 16 %. No
existen en el modelo. El campo "Comisión" hace lo contrario: **suma al cliente** en vez de
restar al vendedor. Y aun usándolo como proxy, la matemática falla: sumar 16 % no
recupera un 16 % que te descuentan. El cálculo correcto es `precio ÷ (1 − 0.16)` =
**+19.05 %**, no +16 %.

**IVA y documento fiscal** *(Alfonso F1-F4, D1-D4)* — cero coincidencias de "IVA",
"impuesto" o "tax" en los 21 archivos. Sin RFC, razón social, vigencia, condiciones de
pago, anticipo ni orden de compra. Alfonso: *"lo que produce no es una cotización
empresarial, es un presupuesto de mostrador. Mis clientes la rechazan en compras antes de
ver el precio."*

**Empaque por pieza, no por hora** *(Diego A2, Rosa #2)* — los indirectos se prorratean
por hora de impresión, pero las bolsas escalan con **piezas enviadas**. 30 organizadores
en 14 h llevan 30 bolsas; un topper de 3 h lleva una. Con el método actual el topper
carga 6× más empaque que un organizador.

**Anticipos y fecha de entrega** *(Rosa #1 y #3, Alfonso D2)* — Rosa cobra 50 % al
confirmar, siempre. Hoy tiene las cotizaciones en la app y los anticipos en una libreta.
*"Si necesito la libreta, tarde o temprano dejo de abrir la app."* La fecha de entrega es
el primer dato que le pregunta toda clienta y no existe en ningún lado.

### Pendientes menores confirmados por dos personas

- **El estado "Enviada" es inalcanzable** — el filtro, el color y la etiqueta existen; ningún botón lo asigna *(Rosa H7, Alfonso N1)*
- **Un estado con tres nombres** — "Borradores" / "Pendiente" / "borrador" *(Rosa H8)*
- ~~**La cantidad solo se sube de uno en uno**~~ *(Rosa H4)* — **corregido**: la cantidad se escribe, y la ✕ de borrar se fue a la esquina del renglón, lejos de los botones de ±1
- **El costo del rollo no se usa** — se cotiza con el precio genérico del material aunque elijas un rollo con precio propio. En modo AMS sí se usa: dos caminos, dos respuestas *(Diego A3)*
- **El desglose no se puede volver a ver** — existe mientras la pieza está en pantalla y se evapora al convertirse en cotización *(Alfonso A1)*

---

## Accesibilidad: piso de 12 px y áreas táctiles de 44 px — aplicado

El hallazgo con más consenso: las tres personas lo reportaron por separado.

Rosa (presbicia, celular a brazo extendido): *"hay letreros que simplemente no leo."*
Alfonso (lentes, monitor de 24"): *"la versión de escritorio hereda tamaños de móvil sin
crecer."*

### Piso de 12 px

**80 instancias** subidas a 12 px en 12 archivos: 45 que estaban en 11 px, 27 en 10 px,
6 en 9 px y una en 11.5 px.

Dos ajustes de criterio además del cambio mecánico:

- **`.micro` y el token `--type-overline`** —la etiqueta de todas las secciones— estaban
  en 10 px, mayúsculas, monoespaciadas, con 0.12–0.14em de espaciado. A 12 px ese
  espaciado estorba más de lo que ayuda, así que bajó a 0.08em. Al token lo encontró la
  verificación final: el grep no lo alcanzaba porque el tamaño venía de una variable, no
  de un valor literal.
- **Las opacidades del documento de cotización** se reemplazaron por color explícito.
  `opacity: 0.45` sobre los términos y el pie mezclaba el texto contra el fondo y hundía
  el contraste sin que se pudiera medir en el token. En un papel que se imprime y que el
  cliente puede disputar, eso no va.

Lo que **no** se tocó: los `font-size="9"` de las ilustraciones SVG del onboarding y de
los diagramas de `docs/`. Son unidades del viewBox, no píxeles de pantalla.

### Áreas táctiles de 44 px

Medido en las siete pantallas: **de 94 elementos interactivos, 0 quedan por debajo de
44 px.**

Se agrupó en un bloque de `components.css` en vez de perseguir cada estilo en línea, con
dos clases reutilizables —`.icon-btn` y `.link-btn`— para que un control nuevo solo
necesite la clase.

| Control | Antes | Ahora |
|---|---|---|
| Cantidad y quitar del borrador | 28×28 | 44×44 |
| Cerrar de las hojas emergentes | ~20×20 *(sin estilo fuera de escritorio)* | 44×44 |
| Flecha de regreso de Ajustes | ~19 px de alto | 44 px |
| Chips de filtro de cotizaciones | 31 px | 44 px |
| Segmentados y chips de color | 34–35 px | 44 px |
| Botones de icono del historial | 40×40 | 44×44 |
| Botón de acción del encabezado | 34 px | 44 px |
| Pestañas de Ajustes, sidebar | 38–42 px | 44 px |
| Campos numéricos de Ajustes y AMS | alto de la letra | 44 px |

**La ✕ de los presets no creció** — un blanco de 16 px dentro de otro botón no se arregla
agrandándolo. Se le agregó confirmación: si se falla el toque, ya no se borra nada sin
avisar.

**La cantidad del borrador ahora se escribe.** Era un `<span>` entre dos botones: 20
recuerdos costaban 19 toques precisos con el ✕ de borrar a 6 px. Ahora es un campo y se
teclea el número. Verificado: de 1 a 20 en un paso.

### Una regresión que esto provocó, y cómo se cerró

Con los controles a 44 px, la descripción de la partida quedó aplastada a **"M…"** en
pantalla de 375 px — justo el dato que hay que leer para saber qué estás contando. Se
apila en dos renglones debajo de 520 px.

Vale la pena anotarlo: **agrandar áreas táctiles le quita espacio al contenido**, y en
móvil eso casi siempre obliga a reacomodar, no solo a cambiar un número.

### Lo que queda pendiente de esto

Los campos numéricos de Ajustes traen `border:none; background:transparent` en estilo en
línea, que gana sobre la hoja de estilos. Se forzó la altura —que era el objetivo— pero
siguen sin parecer editables (Rosa, H17). Cambiarlo implica decidir si se conserva el
diseño de "número grande sin caja", y eso es una decisión de diseño, no de accesibilidad.

---

## Lo que las tres personas defendieron

Coincidieron sin haberse leído entre ellas. Esto hay que conservarlo:

**`js/costing.js` separado del DOM, con tests.** Alfonso: *"es lo primero en esta app que
sí me deja auditar."* Diego: *"es la decisión correcta y es rara."*

**Los costos guardados por copia en cada cotización.** Si sube el PLA, las cotizaciones
viejas no se mueven. Los dos lo señalaron como sutil y correcto.

**El mantenimiento sobre costos de máquina y no sobre el subtotal**, con dos tests que lo
defienden. Diego: *"un matiz de costeo que casi nadie distingue."*

**`totalBaseCost: null` cuando el costo no se conoce.** Diego: *"exactamente el tipo de
honestidad con los datos que quiero en una app de costeo."*

**La barra de composición de costos y el paso 2 del onboarding.** Rosa: *"me explicó en
diez segundos lo que llevo tres años sin entender."*

---

## Qué dice esto del producto

La app está bien construida **para el negocio que la originó**: un taller que vende
piezas de bajo volumen a clientes finales por WhatsApp. El esqueleto del costeo es sólido
y arreglable.

Las dos personas que representan expansión de mercado coincidieron en el mismo
diagnóstico desde ángulos opuestos: **el modelo entiende la pieza, pero no entiende el
trabajo**. No sabe que hay una placa con 30 piezas encima, que hay un intermediario que
cobra comisión, que el diseño se hace una vez, que hay un cartón que se compra, ni que
hay un cliente que paga a 15 días con una orden de compra.

Ninguna de las dos la adoptaría hoy. Las dos la adoptarían con cuatro o cinco cambios que
están identificados y acotados arriba.
