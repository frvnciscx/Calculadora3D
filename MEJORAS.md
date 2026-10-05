# Mejoras pendientes — Calculadora 3D

Bitácora de mejoras detectadas durante el uso real de la app. Sirve como backlog para
iteraciones futuras. Cada entrada indica el archivo y línea donde vive el problema.

> **Documentos relacionados** (4 oct 2026)
> - [docs/AUDITORIA.md](docs/AUDITORIA.md) — revisión completa del código con orden de
>   trabajo sugerido. Incluye estas entradas y varias más que no se habían detectado.
> - [docs/MAPA-DE-SITIO.md](docs/MAPA-DE-SITIO.md) — qué existe y qué se puede añadir.
> - [docs/BASE-DE-DATOS.md](docs/BASE-DE-DATOS.md) — diseño para migrar a Firebase.
>
> Este archivo nació del uso diario; la auditoría nació de leer el código entero. Cuando
> se contradigan, manda la auditoría.

---

## ✅ Implementado

### Porcentaje de mantenimiento y refacciones
`store.js` · `calculator.js` · `config.js` · `index.html`

Nuevo rubro `maintenancePercent` (default 5 %) para boquillas, bandas, PEI/FEP y
refacciones. Se aplica sobre los **costos de máquina** (material + energía +
depreciación + fijos), no sobre el subtotal completo — el desgaste escala con el uso
de la impresora y con el material, no con las horas de diseño ni con la pintura.

### Apartado de gastos indirectos
`store.js` · `calculator.js` · `config.js` · `index.html` · `ui.js` · `desktop.css`

Nueva sub-página **Ajustes → Gastos indirectos** con el mismo patrón que Gastos fijos:
categorías con monto mensual, total, y el costo por hora derivado. Cubre guantes, lijas,
alcohol, cinta, adhesivo, bolsas y empaque.

El total se prorratea por hora de impresión (`indirectMonthlyCost ÷ monthlyPrintHours`),
compartiendo el mismo campo de horas/mes que los gastos fijos. Se descartó la versión
inicial con porcentaje fijo: el número sale mejor de gastos reales capturados que de un
% estimado.

Las funciones de categorías se generalizaron en `config.js` (`_costItemRow`,
`_readCostItems`, `_updateCostTotal` con prefijos `fci`/`ici`) para que ambos grupos
compartan lógica en lugar de duplicarla.

Mantenimiento e indirectos entran al subtotal **antes** del factor de desperdicio, así
que una pieza fallida también arrastra su parte proporcional de ambos. El mantenimiento
se calcula sobre los costos de máquina **sin** incluir los indirectos, para no encadenar
un porcentaje sobre otro rubro derivado.

---

### Purga AMS — default corregido y cambios de color capturables
`store.js` · `calculator.js` · `config.js` · `index.html`

El default `amsPurgeGrams` era **40 g por cambio de color**. Medido en Bambu Studio con
una pieza real de 4 colores, la purga es **0,67 g por cambio**: el default estaba inflado
unas 60 veces.

Datos del corte que sirvieron de referencia (pieza de 4 colores, 58 min):

| | Modelo | Expulsado | Torre | Total |
|---|---|---|---|---|
| Total | 3,84 g | 4,90 g | 1,09 g | 9,83 g |

Desperdicio real = Expulsado + Torre = 5,99 g ÷ 9 cambios = **0,67 g/cambio**. Cuadra con
la matriz de volúmenes de limpieza del slicer (182–679 mm³ × multiplicador 1.1 →
0,25–0,93 g con densidad PLA 1,24).

Segundo defecto, independiente: `numPurges` se derivaba de `colors.length - 1`, o sea 3
purgas para 4 colores, cuando el slicer reportó **9 cambios** — una pieza multicolor
alterna colores varias veces por capa. Ahora hay un campo de «cambios de color» que el
usuario copia del slicer, con el viejo `colores - 1` como fallback.

Los dos errores no se cancelaban: con los defaults previos esa pieza cotizaba
3 × 40 = 120 g de purga contra 6 g reales — **$42 de material fantasma** a PLA $350/kg.

Se agregó migración en `store.js`: cualquier `amsPurgeGrams ≥ 10 g` guardado en
`localStorage` se corrige al default, porque ningún valor real llega a eso.

La calculadora incluye ahora un bloque de ayuda que explica cómo obtener ambos datos del
slicer, y una línea de «Purga total» (`cambios × g = total · $`) para comparar contra el
número del slicer.

### Guía de purga como hoja contextual
`calculator.js` (`showPurgeHelp`) · `index.html` · `desktop.css`

La explicación de cómo leer los datos del slicer pasó de bloque de texto inline a hoja
contextual: **bottom sheet en móvil, modal centrado en escritorio**. En la calculadora
queda solo un disparador de una línea.

Se creó la clase `.help-sheet` que se combina con `.m3-bottom-sheet` para heredar el
comportamiento de móvil (incluido el drag to dismiss que `native.js` engancha solo al
detectar `.m3-bottom-sheet` en `#modal-container`) y sobreescribirlo en desktop, donde
`.m3-bottom-sheet` se convierte en drawer lateral. El modal se centra sobre el área de
contenido con `left: calc(50% + 120px)` para no cruzarse con el sidebar de 240 px.
Sirve como patrón reutilizable para futuras ayudas contextuales.

---

## 🔴 Prioridad alta

### 1. El desglose sobrescribe el total manual — en los dos grupos
[`js/config.js:106`](js/config.js:106) (fijos) · [`js/config.js:112`](js/config.js:112) (indirectos)

```js
if (fciItems.length > 0) {
  fixed = fciItems.reduce(function(s, it) { return s + it.amount; }, 0);
}
```

Si el usuario tiene un total manual (ej. $2 000) y agrega **un solo** ítem al desglose
(ej. "Contaduría $500"), al guardar el total queda en $500 — se pierden $1 500 sin
aviso. Es una pérdida silenciosa de datos que subcotiza todas las piezas.

El apartado de gastos indirectos hereda el mismo comportamiento. Ahí arranca en $0, así
que hoy no hay nada que perder, pero cualquier arreglo debe cubrir ambos grupos — la
lógica es la misma en `saveConfig`.

**Opciones de arreglo:**
- Al detectar que la suma de ítems < total manual previo, crear automáticamente una
  fila "Otros" con la diferencia.
- Mostrar un `m3Confirm` antes de guardar: "El desglose suma $X, tu total actual es
  $Y. ¿Reemplazar?"
- Separar visualmente los dos modos (total simple vs. desglosado) para que no
  convivan de forma ambigua.

### 2. Las horas de impresión / mes no se pueden verificar
[`index.html:963`](index.html:963) · [`js/calculator.js:48`](js/calculator.js:48)

Es el parámetro **más sensible de todo el modelo** y hoy es un número que el usuario
teclea a mano, sin forma de saber si es real. Con $1 860 de gastos fijos:

| Horas / mes | Costo fijo / hora | Efecto en un topper de 1.5 h |
|---|---|---|
| 100 h | $18.60 | $50 |
| 150 h | $12.40 | $45 |
| 200 h | $9.30 | $40 |
| 250 h | $7.44 | $40 |

Una diferencia de 2× en las horas mueve el precio final ~25 %.

**Propuesta:** derivar las horas reales del historial. `history` ya guarda `timeH` y
`date` en cada cálculo ([`calculator.js`](js/calculator.js) → `saveLastCalc`), así que
se puede calcular las horas impresas de los últimos 30/60/90 días y mostrarlas como
sugerencia junto al campo: *"Según tu historial: 143 h en los últimos 30 días"*.
Idealmente usar las cotizaciones **aceptadas**, no todos los cálculos, para no contar
piezas que nunca se imprimieron.

### 3. Riesgo de doble cobro: luz del taller vs. kWh de impresión
[`js/calculator.js:46`](js/calculator.js:46)

El costo de energía de cada pieza ya se cobra aparte a `config.kwhCost`. Si el usuario
mete el recibo de luz **completo** en gastos fijos, la electricidad de las impresoras
se cobra dos veces. En gastos fijos debe ir solo la luz que no es de impresión
(iluminación, cómputo, clima).

**Propuesta:** texto de ayuda en la categoría de luz dentro de Gastos fijos, o una
advertencia si el monto de luz parece alto respecto a `kwhCost × horas/mes`.

---

## 🟡 Prioridad media

### 4. Periodicidad de los gastos
[`js/config.js:164`](js/config.js:164) (`_costItemRow`)

Todas las categorías asumen monto **mensual**, pero los recibos reales no lo son: la
luz llega bimestral, algunos servicios son anuales. Hoy el usuario tiene que dividir a
mano (ej. $400 bimestral → $200/mes), y ese cálculo manual se olvida o se equivoca al
actualizar.

**Propuesta:** agregar un selector de periodicidad por fila (mensual / bimestral /
trimestral / anual) y normalizar a mensual internamente. Guardar el monto original y
su periodo para que al revisar el desglose se vea el recibo tal como llega.

### 5. Prorrateo de gastos compartidos con uso personal
[`js/config.js:164`](js/config.js:164)

Internet, Gemini, gasolina y celular normalmente se usan para trabajo **y** para uso
personal. Hoy solo se puede cargar el 100 % al negocio, lo que infla el costo por hora.

**Propuesta:** campo opcional de "% de uso de negocio" por categoría. El monto
efectivo sería `amount × pctNegocio / 100`. Default 100 % para no cambiar el
comportamiento actual.

### 6. Falta la categoría de renta / espacio
Decisión de negocio más que bug: si se trabaja desde casa puede ser válido no
cobrarla, pero conviene que la app lo haga explícito (una categoría sugerida en $0 con
nota) en lugar de que sea un olvido.

---

### 6a. Falta un campo para insumos y herrajes
[`js/calculator.js:66`](js/calculator.js:66) (`_getPostProcData`)

Muchas piezas llevan componentes que no son filamento: imanes, argollas de llavero,
tornillería, LEDs, cordón, base de madera. Hoy no hay dónde capturarlos.

El workaround es agregarlos como una fila de color de pintura en Post-procesado, que
acepta nombre + costo libre — se cotizó así un pedido de 15 marcos con 4 imanes cada uno
("Imanes (4 pzas)" · $16.00). Funciona porque el rubro solo suma montos, pero el
desglose los etiqueta con 🎨 y los agrupa bajo "Total post-procesado", lo que se lee mal
en una cotización.

**Propuesta:** un bloque "Insumos" con filas de nombre + costo unitario + cantidad, en
lugar de un costo total por línea. Con cantidad el costo por pieza se calcula solo, y
además queda registrado cuántas piezas se consumen para control de compras.

**Nota de costeo relacionada:** conviene costear al precio unitario (imán a $4.00 =
$200 ÷ 50), no al desembolso de la bolsa. Un pedido de 60 imanes obliga a comprar 2
bolsas ($400) y deja 40 en inventario — ese sobrante es inventario, no costo del pedido.

### 6b. Atajo: capturar el peso total del slicer en vez de estimar la purga
[`js/calculator.js:400`](js/calculator.js:400) (`_getAMSData`)

El bloque AMS pide gramos por color y estima la purga con dos campos (cambios × g). Pero
Bambu Studio ya reporta el **Total** con purga y torre incluidas — 9,83 g en el ejemplo.
Capturar ese número directo en el campo de peso, sin usar el bloque AMS, da el dato
medido en lugar de dos estimaciones multiplicadas.

**Propuesta:** un toggle "tengo el total del slicer" que colapse el bloque AMS a un solo
campo de gramos. El desglose por color seguiría siendo útil para descontar del inventario
por rollo, así que conviene mantener ambos modos en lugar de reemplazar uno con el otro.

---

### 7a. La URL del README apunta a otra aplicación
[`README.md:5`](README.md:5)

`https://calculadora3d-delta.vercel.app` **no sirve esta app**. Sirve un proyecto ajeno
llamado "3D COST PRO — Calculadora de precisión": interfaz distinta, moneda en pesos
argentinos, catálogo de impresoras Creality y su propia clave de almacenamiento
`3d_calc_inputs_v2`. Ninguna función de este proyecto existe ahí (`showPage`, `saveQuote`
y `calculate` son `undefined`).

Costó tiempo real: se intentó capturar una cotización contra esa URL creyendo que era la
app, y hubo que revertir las claves escritas en un dominio de terceros.

**Pendiente:** determinar la URL real del deploy y corregir el README. Mientras siga
apuntando ahí, cualquier verificación contra "producción" es inválida — incluida la
revisión de si los archivos `.md` del repo quedan expuestos públicamente.

### 7b. ~~El filtro de cotizaciones no arranca en "Todas"~~ — descartado

Se verificó y es incorrecto: `_quoteFilter` ya arranca en `'all'`
([`js/quotes.js:361`](js/quotes.js:361)) y los chips se renderizan por JavaScript, así que
"Todas" siempre queda activa en una carga limpia. Lo que se observó fue un efecto de la
manipulación manual durante las pruebas, no un defecto de la app.

Se deja la entrada tachada en vez de borrarla para no volver a investigarlo.

---

## 🟢 Prioridad baja / notas de diseño

### 7. Doble cobro del IPA si se captura como gasto indirecto
[`js/calculator.js:53-63`](js/calculator.js:53)

El lavado con IPA ya se cobra explícitamente en piezas de resina (`ipaCost`, derivado de
`ipaMlPerPrint` × `ipaLiterCost`). Ahora que los gastos indirectos se capturan por
categoría, nada impide que el usuario agregue "IPA" como categoría indirecta y lo pague
dos veces.

**Propuesta:** nota explícita en el apartado de indirectos ("el IPA de resina ya se
cobra por impresión en Otros parámetros, no lo agregues aquí"), o detectar el nombre de
la categoría y avisar. Mismo patrón de riesgo que la luz en gastos fijos (punto 3).

### 8. El default de `fixedMonthlyCost` es un placeholder
[`js/store.js:6`](js/store.js:6)

`fixedMonthlyCost: 2000` es una estimación inventada. Los gastos reales del negocio
resultaron ser **$1 860/mes** al desglosarlos:

| Categoría | Monto mensual |
|---|---|
| Contaduría | $500 |
| Internet | $560 |
| Gasolina | $500 |
| Luz (400 bimestral ÷ 2) | $200 |
| Gemini | $100 |
| **Total** | **$1 860** |

Cambiar el default solo afecta instalaciones nuevas (los dispositivos existentes ya
tienen su valor en `localStorage`), pero vale la pena que el default arranque en algo
realista o en 0 con un onboarding que obligue a capturarlo.

### 9. El desglose de la cotización no incluye los rubros nuevos
[`js/quotes.js:578`](js/quotes.js:578) (`buildQuoteHTML`)

La cotización que ve el cliente no itemiza costos internos (por diseño, y está bien).
Los toggles de `quoteStyle` (`showDepreciacion`, `showCostosFijos`, `showDesperdicio`)
sugieren que en algún momento sí se mostraban. Si se reactivan, hay que agregar
mantenimiento e indirectos a esa vista — los campos ya se persisten en el objeto de la
cotización (`maintCost`, `indirectCost`).

---

### 10. Orden de compra derivada del pedido y el inventario
[`js/inventory.js`](js/inventory.js) · [`js/quotes.js`](js/quotes.js)

Al cotizar un pedido de varias piezas ya se conoce el consumo exacto por material y
color. El inventario guarda `material`, `color`, `remainingG` y `costPerKg` por rollo.
Con esos dos datos la app puede calcular qué falta comprar, y hoy hay que hacerlo a mano.

**Propuesta:** botón "Orden de compra" en una cotización que genere:

- Requerimiento por material y color, sumando todas las piezas × cantidad
- Faltante = requerimiento (+ % de merma) − `remainingG` disponible
- Unidades a comprar redondeadas a la unidad de venta real (rollo de 1 kg, bolsa de 50)
- Separación entre **desembolso** y **costo imputable al pedido** — comprar una bolsa de
  50 imanes para usar 4 no son $200 de costo del pedido, son $16 de costo y $184 de
  inventario

Requiere el bloque de insumos del punto 6a para cubrir lo que no es filamento, con su
unidad de venta y contenido por unidad.

## Ideas de producto (sin analizar a fondo)

- **Costo por pieza fallida real:** en lugar de un % de desperdicio fijo, permitir
  registrar impresiones fallidas y derivar el % del historial real.
- ~~**Alerta de precio bajo costo**~~ — **hecho a medias.** Al escribir un precio a mano
  en una partida, la app avisa y pinta la línea en rojo si queda bajo el costo
  (`draftItemPriceSet`). Falta el otro camino: el deslizador de margen nunca puede bajar
  del costo (empieza en 0 %), así que ahí no hace falta — pero **el descuento de la
  cotización sí**, y hoy puede llevar el total por debajo del costo sin decir nada.
- **Recalcular cotizaciones pendientes:** cuando cambian los parámetros de costo, las
  cotizaciones pendientes quedan con precios viejos. Ofrecer un "actualizar precios".
- **Depreciación por impresora vs. mantenimiento:** hoy el % de mantenimiento es global.
  Una resina desgasta FEP y una FDM desgasta boquillas a ritmos distintos; podría ser
  un % por impresora.

---

## Surgido al implementar la placa y el precio escrito

### 11. Placas parciales
[`js/costing.js`](js/costing.js)

«Piezas» divide la placa entre las piezas que salen de ella, y eso es correcto **mientras
el pedido sea un múltiplo de la placa**. Si la placa trae 30 y el cliente pide 45, se
corren dos placas: la segunda va a medias y cuesta casi lo mismo en horas de máquina que
una llena. La app cobra 45 × el costo de una pieza de placa llena, y se queda corta.

**Propuesta:** cuando la cantidad de la cotización no sea múltiplo de las piezas por
placa, avisar cuántas corridas implica y ofrecer cobrar por corridas completas. No es un
cálculo nuevo: es `Math.ceil(cantidad / piezas) × costo de placa`.

### 12. El post-procesado también se divide
[`js/costing.js`](js/costing.js) · [`js/calculator.js`](js/calculator.js)

La regla de la placa es "todo lo capturado es de la corrida, todo se divide", y el
post-procesado entra ahí. Funciona si capturas la pintura de las 30 piezas. Si capturas
la de una sola, el resultado queda 30 veces bajo.

El bloque de pintura no dice de qué está hablando. **Propuesta:** una línea en ese bloque
que diga "de toda la placa", igual que la que ya está arriba del peso y el tiempo.

### 13. El descuento puede dejar la cotización bajo costo
[`js/quotes.js`](js/quotes.js) (`onCommissionChange`)

Al escribir un precio por partida la app avisa si queda bajo el costo. El descuento
general no: un 60 % sobre una cotización con 40 % de margen la deja en pérdida y nada
lo dice. El dato existe (`totalBaseCost` ya se calcula al guardar).

### 14. Las cotizaciones guardadas no recuerdan si el precio fue escrito
[`js/quotes.js`](js/quotes.js)

`priceManual` y `autoPrice` viajan a la cotización guardada, pero nada los muestra al
verla. Si dentro de tres meses revisas por qué una pieza salió en $850, no hay manera de
saber si fue la fórmula o un acuerdo con el cliente. **Propuesta:** una marca discreta en
la vista de la cotización, no en el PDF del cliente.
