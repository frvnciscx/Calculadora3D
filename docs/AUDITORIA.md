# Auditoría — Calculadora 3D

Revisión de los 17 módulos de JavaScript, el service worker y las funciones de servidor.
Cada hallazgo indica archivo y línea, cómo falla en la práctica, y qué tan difícil es
arreglarlo.

Fecha: 4 de octubre de 2026 · Rama `claude/corregir-impresion-3d-39e02c`

> ## Estado — todo lo corregido en esta sesión
>
> | # | Hallazgo | Estado |
> |---|---|---|
> | 1 | La sincronización puede borrar todo | ✅ Corregido |
> | 2 | Importar reemplaza sin avisar | ✅ Corregido |
> | — | **El respaldo nunca guardó clientes ni inventario** | ✅ Corregido |
> | 3 | El dashboard cuenta partidas, no piezas | ✅ Corregido |
> | 4 | Productos de tabla con ganancia cero | ✅ Corregido |
> | 5 | Multicolor no descuenta inventario | ✅ Corregido |
> | 6 | El desglose borra el total manual | ✅ Corregido |
> | 7 | La app se rompe sin conexión | ✅ Corregido |
> | 8 | Diálogos nativos del navegador | ✅ Corregido |
> | 9 | Se guarda en cada tecla | ✅ Corregido |
> | 10 | Índice del arreglo como identidad | ⏸ Pendiente — ver nota |
> | 11 | **Inventario vinculado al material por nombre** | ⏸ Pendiente — hallado al diagramar las llaves |
> | 12 | Sin pruebas automatizadas | ✅ 14 pruebas, `npm test` |
> | — | **Fórmula de costeo separada del DOM** | ✅ `js/costing.js` |
>
> El punto 10 se dejó pendiente a propósito: son cambios mecánicos en una docena de
> archivos, y es justo el trabajo que conviene hacer leyendo el código con calma — es
> donde más se entiende cómo se conecta la app. Está en la secuencia de
> [`ANDROID.md`](ANDROID.md) como fase 2.
>
> Verificación: `npm test` pasa 14 de 14, y los precios de referencia de las cotizaciones
> reales ($60 el marco, $15 la herradura, $130 el topper) siguen idénticos después de
> todos los cambios.

---

## Lo que está bien hecho

No es cortesía, es contexto: estas decisiones hay que **conservarlas** en la migración a
Firebase.

**La separación de `templates.js`.** 771 líneas de funciones que solo devuelven HTML, sin
lógica ni acceso a datos. Es la decisión de arquitectura más valiosa del proyecto y mucha
gente con más experiencia no la toma.

**El escapado es consistente.** `esc()` se aplica en prácticamente todo dato de usuario
que entra al HTML. Busqué agujeros y no encontré ninguno explotable. Esto previene que el
nombre de un cliente rompa la página.

**Las migraciones de datos existen.** `store.js` arregla datos viejos al cargar — los
campos `multicolor`/`heads` en impresoras, el contador de folios, y ahora la purga de AMS.
Es una práctica que mucho software comercial no tiene.

**Los costos se guardan por copia, no por referencia.** Cada cotización conserva sus
propios `matCost`, `fixedCost`, etc. Si mañana sube el PLA, las cotizaciones viejas no se
alteran. Es correcto y es sutil.

**Los tokens de diseño.** `tokens.css` con escala de espaciado, tipografía y elevación.
Se nota la mano del diseñador y es lo que mantiene la app coherente.

---

## 🔴 Críticos — pérdida de datos

### 1. La sincronización puede borrar todo tu negocio

**Dónde:** [`js/sync.js:19-52`](../js/sync.js) y [`js/store.js:66`](../js/store.js)

`sv()` llama a `schedulePush()` en cada escritura importante. Tres segundos después,
`pushSync()` sube **el estado local completo** y reemplaza el snapshot remoto:

```js
var state = { quotes, clients, inventory, materials, config, quoteStyle, quoteCounter };
```

**Cómo falla, paso a paso:**

1. Abres la app en un navegador o dispositivo nuevo. `localStorage` está vacío.
2. Tocas cualquier cosa — hasta calcular un costo dispara `sv('config')`.
3. A los 3 segundos se sube un estado con **cero cotizaciones, cero clientes, cero
   inventario**, con fecha de ahora.
4. Tu teléfono sincroniza. Como la fecha remota es más nueva que su último `_syncedAt`,
   `pullSync` aplica el estado vacío y **sobrescribe tus datos reales**.

No es teórico: esta sesión abrió la app en un navegador limpio y el riesgo era exactamente
ese. Lo que lo evitó fue que el endpoint no respondía.

**Arreglo mínimo e inmediato:** desactivar `schedulePush()` hasta rediseñarlo. Una línea.

**Arreglo correcto:** nunca subir un estado vacío si el remoto tiene datos; pullear antes
del primer push en un dispositivo; y sincronizar por registro en vez de por snapshot
completo — que es justo lo que resuelve Firestore.

### 2. Importar un respaldo borra lo que no venga en el archivo

**Dónde:** [`js/config.js:248-268`](../js/config.js)

```js
if (Array.isArray(data.quotes)) { quotes = data.quotes; sv('quotes', quotes); }
```

Reemplaza, no mezcla. Importar un respaldo que tenga cotizaciones pero no clientes deja
**cero clientes**. No hay advertencia ni confirmación.

**Arreglo:** un `m3Confirm` que diga exactamente qué se va a reemplazar y con cuántos
registros, antes de tocar nada. Media hora.

---

## 🟠 Altos — números equivocados en decisiones de negocio

Estos no borran datos, pero te hacen tomar decisiones con cifras falsas.

### 3. El dashboard cuenta partidas, no piezas

**Dónde:** [`js/dashboard.js:97`](../js/dashboard.js)

```js
var piecesCount = monthAccepted
  .reduce(function(s, q) { return s + (q.items ? q.items.length : 1); }, 0);
```

Cuenta renglones de la cotización, no piezas producidas. La cotización COT-0002 —8
herraduras, 6 letras, 1 caballo, 1 topper— reporta **4 piezas impresas en vez de 16**.

Lo delata la inconsistencia con el cálculo de horas doce líneas más abajo, que sí
multiplica por cantidad:

```js
return si + (it.timeH || 0) * (it.qty || 1);   // línea 104 — correcto
```

**Arreglo:** sumar `it.qty` en vez de contar el array. Una línea.

### 4. Los productos de tabla de precios reportan ganancia cero

**Dónde:** [`js/catalog.js:236`](../js/catalog.js)

```js
baseCost: total, totalCost: total,
```

En los productos con tabla de precios por tamaño —tus cortadores— el costo base se guarda
**igual al precio de venta**. El dashboard calcula ganancia como ingresos menos
`totalBaseCost`, así que cada cortador que vendas aporta **$0 de ganancia** a tus métricas.

Si una parte de tus ventas son cortadores de tabla, tu margen real del mes está
subestimado y no sabes cuánto.

**Arreglo:** estimar el costo real de esos productos, o marcarlos con `baseCost: null`
para que el dashboard los excluya en vez de contarlos como margen cero. Ese filtro ya
existe (`monthWithCost`). Una o dos horas.

### 5. Los trabajos multicolor no descuentan inventario

**Dónde:** [`js/calculator.js`](../js/calculator.js), `_updateAMSBlock` y `_getAMSData`

En modo AMS, `_getAMSData()` recoge correctamente el rollo de cada color. Pero
`saveLastCalc` solo guarda un `spoolId` único, tomado del campo `#calc-spool` que en modo
AMS **está oculto**. Los rollos por color se pierden.

El descuento automático de [`js/quotes.js:462`](../js/quotes.js) sale sin hacer nada:

```js
if (!it.spoolId) return;
```

Resultado: los trabajos que más filamento consumen —el topper gastó 79,74 g de tres
colores— son los únicos que no descuentan del inventario.

**Arreglo:** guardar el arreglo de colores en el item de la cotización y recorrerlo al
descontar. Dos o tres horas.

### 6. El desglose de gastos borra el total manual

**Dónde:** [`js/config.js:106`](../js/config.js) y [`:112`](../js/config.js)

```js
if (fciItems.length > 0) {
  fixed = fciItems.reduce(function(s, it) { return s + it.amount; }, 0);
}
```

Si tienes $2 000 como total manual y agregas **un** ítem de $500, al guardar el total queda
en $500. Se pierden $1 500 sin aviso, y todas tus piezas se subcotizan.

Afecta a gastos fijos y a gastos indirectos — es el mismo código.

**Arreglo:** detectar la diferencia y crear una fila "Otros" automática, o confirmar antes
de reemplazar. Una hora.

### 7. La app se rompe sin conexión

**Dónde:** [`sw.js:2-30`](../sw.js)

`index.html` carga 17 archivos de JavaScript. La lista de archivos a guardar en caché del
service worker tiene **16**. Falta `js/native.js`.

Sin internet, ese archivo no carga y se pierden los gestos de arrastre de los paneles, las
áreas seguras del notch, las transiciones entre pantallas y la vibración. En una app que
se instala en el teléfono y presume de funcionar offline, es un defecto real.

**Arreglo:** agregar la línea faltante. Treinta segundos.

Pero el problema de fondo es que esa lista se mantiene a mano, y ya falló una vez. En este
mismo día tuvimos que subir la versión del caché cuatro veces. Vale la pena automatizarlo.

---

## 🟡 Medios — fricción y deuda

### 8. Diálogos nativos del navegador en tres módulos

**Dónde:** [`js/catalog.js:410`](../js/catalog.js),
[`js/clients.js:162`](../js/clients.js), [`js/inventory.js:96`](../js/inventory.js)

Usan `confirm()` del navegador mientras existe `m3Confirm()` en `ui.js`, que respeta tu
sistema de diseño. En la app instalada en el teléfono el diálogo nativo se ve como una
pieza ajena.

Son tres reemplazos de una línea cada uno, con el detalle de que `m3Confirm` recibe una
función en vez de devolver verdadero o falso.

### 9. Se guarda en cada tecla

**Dónde:** `oninput="saveResinParams()"` en [`index.html`](../index.html)

Escribir "150" en el campo de IPA ejecuta `sv('config', config)` tres veces, y cada una
agenda una subida al servidor.

Hoy es gratis porque localStorage es local. **En Firestore cada tecla es una escritura
facturable.** Es el patrón que más rápido quema la cuota gratuita.

**Arreglo:** esperar a que dejes de escribir antes de guardar. Tu propio código tiene el
ejemplo en [`js/sync.js:13`](../js/sync.js).

### 10. El índice del arreglo se usa como identidad

**Dónde:** transversal — `deleteQuote(i)`, `deductInventory(i)`, `saveInventory(i)`…

Los botones pasan la posición en el arreglo. Hoy funciona, y en `quotes.js` está bien
resuelto con `quotes.indexOf(q)` ([línea 424](../js/quotes.js)) para que los filtros no lo
rompan.

El problema es el futuro: en cuanto Firestore reordene la lista entre que se pinta la
pantalla y que haces clic, **el botón borra el registro equivocado**.

**Arreglo:** pasar el `id` del registro en vez de la posición. Es tedioso pero mecánico, y
conviene hacerlo *antes* de la migración, no después.

### 11. El inventario se vincula al material por nombre, no por id

**Dónde:** [`js/inventory.js:51`](../js/inventory.js) y
[`js/calculator.js:261`](../js/calculator.js)

Cada rollo guarda el **nombre** del material como texto:

```js
material: material,        // "PLA", no el id "1"
```

Y la calculadora los relaciona comparando cadenas en minúsculas:

```js
return it.material && matName && it.material.toLowerCase() === matName.toLowerCase();
```

**Cómo falla:** si renombras «PLA» a «PLA Básico» en Materiales, todos tus rollos de PLA
dejan de aparecer en el selector de color de la calculadora. Siguen existiendo en
Inventario, pero quedan desconectados — y como el selector simplemente no los muestra, no
hay ningún mensaje de error que te diga qué pasó.

Apareció al dibujar el diagrama de llaves foráneas, que es justo para lo que sirve ese
ejercicio: obliga a preguntarse *con qué exactamente* se relaciona cada cosa.

**Arreglo:** guardar `materialId` en el rollo y comparar por id. Hay que migrar los rollos
existentes, buscando el material cuyo nombre coincida con el texto guardado — el mismo
patrón de migración que ya usa `store.js`. Una o dos horas.

**Nota:** no todos los textos son un error. La cotización guarda `printer: "Bambu Lab A1"`
y `material: "PLA"` como texto a propósito, porque son un **dato histórico**: debe decir
con qué se imprimió ese día aunque después borres esa impresora. La diferencia es que el
inventario necesita un vínculo **vivo**, y eso sí pide un id.

### 12. No hay ninguna prueba automatizada

Cero archivos de test. La fórmula de costeo es el activo del negocio: si una edición la
rompe, te enteras cotizando mal a un cliente.

No hace falta una suite completa. Diez casos sobre `calculate()` —una pieza FDM simple,
una de resina, una multicolor, una con post-procesado— cubrirían lo que importa.

---

## 🔵 Estructurales — para la etapa de VS Code

No son errores. Son las cosas que harán que programar sea más fácil o más difícil.

**Todo vive en el espacio global.** Unas 200 funciones accesibles desde cualquier lado.
Funciona, pero nada te avisa si defines dos veces el mismo nombre. Los módulos de
JavaScript (`import`/`export`) lo resuelven y VS Code empieza a autocompletar de verdad.

**`quotes.js` tiene 1154 líneas** y mezcla datos, interfaz, PDF, WhatsApp y Notion. Es el
archivo que más te va a costar modificar. Partirlo en tres o cuatro es el refactor con
mejor retorno.

**`index.html` tiene 1281 líneas** con mucho estilo en línea, a pesar de que `tokens.css`
existe y está bien hecho. Cada estilo en línea es una excepción a tu sistema de diseño.

**No hay paso de compilación**, y eso es bueno para aprender: guardas el archivo,
recargas, ves el cambio. No lo cambies por costumbre. El día que te estorbe, lo sabrás.

---

## Orden sugerido

Agrupado por sesión de trabajo, de lo urgente a lo estructural.

| # | Qué | Por qué primero | Tamaño |
|---|---|---|---|
| 1 | Apagar `schedulePush()` | Riesgo activo de borrar todo | 1 línea |
| 2 | `native.js` al service worker | Una línea, arregla el modo offline | 1 línea |
| 3 | Piezas por cantidad en dashboard | Tus métricas mienten | 1 línea |
| 4 | Confirmación al importar | Segundo riesgo de pérdida | 30 min |
| 5 | Desglose que no borra el total | Subcotizas sin enterarte | 1 h |
| 6 | Costo real en productos de tabla | Tu margen está subestimado | 2 h |
| 7 | Descuento de inventario en AMS | El inventario miente en multicolor | 3 h |
| 8 | Diez pruebas sobre `calculate()` | Red de seguridad para lo que sigue | medio día |
| 9 | Pasar `id` en vez de índice | Prepara la migración | 1 día |
| 10 | Partir `quotes.js` | Prepara la migración | 1 día |
| 11 | Migración a Firebase | Lo de fondo | varias sesiones |

Los tres primeros son **tres líneas en total** y quitan el riesgo más grande.

---

## Qué se cambió, archivo por archivo

Referencia para cuando revises el diff y te preguntes por qué cambió algo.

### Archivos nuevos

| Archivo | Qué hace |
|---|---|
| [`js/costing.js`](../js/costing.js) | La fórmula de costeo, pura y sin DOM |
| [`tests/costing.test.js`](../tests/costing.test.js) | 14 pruebas con cortes reales |

### `js/sync.js`
`schedulePush()` quedó como función vacía con la explicación del riesgo. `pushSync()`
ahora se niega a subir si no hay cotizaciones, clientes ni inventario — es la condición
exacta que producía el borrado.

**No se eliminó la función** aunque ya no haga nada, porque `sv()` la llama. Borrarla
habría roto cada escritura de la app.

### `js/config.js`
`exportData` ahora incluye `clients`, `inventory` y `presets`, y sube la versión del
formato a 6. `importData` se partió en dos: una parte arma el resumen y pide confirmación,
otra aplica los cambios. El resumen muestra `actual → resultado` por colección y marca en
rojo las que perderían registros.

El desglose de gastos ahora concilia: si la suma de los ítems es menor que el total
capturado a mano, la diferencia se guarda como fila "Otros (sin desglosar)" en lugar de
desaparecer. Aplica a gastos fijos y a indirectos.

### `js/quotes.js`
`totalBaseCost` queda en `null` si alguna partida no tiene costo conocido, para que el
dashboard la excluya del margen. `_deductQuoteInventory` maneja ahora el modo multicolor,
descontando de cada rollo y repartiendo la purga entre los colores activos.

### `js/calculator.js`
El cálculo se delega a `computeCost()`. Las variables locales se conservaron con los
mismos nombres para no tocar las 60 líneas que pintan el resultado — un cambio quirúrgico
en vez de una reescritura.

Se guardan los rollos por color (`amsColors`) para que el inventario pueda descontarlos.
`config` solo se persiste cuando la impresora o el material realmente cambiaron, en vez de
en cada pulsación.

### `js/ui.js`
`m3Confirm` acepta un tercer argumento opcional con `confirmLabel`, `icon` y `detail`. Sin
eso, el botón siempre decía "Eliminar", lo que lo hacía inservible para confirmar una
importación.

### `js/store.js`
Nueva función `svDebounced()` que agrupa escrituras seguidas. Hoy ahorra milisegundos; en
Firestore ahorra cuota y dinero.

### `js/inventory.js`, `js/clients.js`, `js/catalog.js`
Los tres `confirm()` del navegador pasaron a `m3Confirm`, cada uno con un detalle útil:
cuántos gramos quedan en el rollo, cuántas cotizaciones tiene el cliente, qué pasa con las
cotizaciones que usan el producto.

### `sw.js`, `index.html`, `package.json`
`native.js` y `costing.js` entraron a la lista de la caché, con un comentario que explica
cómo verificar que no falte ninguno. Caché v91 → v92. `npm test` quedó configurado.

---

## Cómo trabajar esto en VS Code

Dijiste que vienes del diseño y que la lógica de programación te cuesta, pero que no
quieres delegar. Eso cambia cómo conviene encarar la lista de arriba.

**Empieza por los arreglos de una línea.** Los puntos 1, 2 y 3 son cambios diminutos con
efecto visible. Sirven para aprender el ciclo completo —abrir el archivo, encontrar la
línea, cambiarla, recargar, comprobar— sin el riesgo de romper algo grande. El ciclo es lo
que hay que automatizar en tu cabeza; el contenido viene después.

**Pide el porqué antes que el cómo.** Cuando me pidas un cambio, pide primero la
explicación de qué hace el código actual. Vas a entender el 80 % leyendo, porque la lógica
de negocio ya la dominas: sabes qué es un margen, una merma y una purga. Lo que te falta
es la sintaxis, que es la parte fácil.

**Escribe el cambio tú, aunque yo te lo dicte.** Teclear `if (fciItems.length > 0)` fija
el patrón de una forma que copiar y pegar no logra. Es la diferencia entre calcar un
trazo y dibujarlo.

**Las pruebas del punto 8 son tu mejor inversión como principiante.** No por disciplina:
porque convierten "creo que no rompí nada" en "la computadora me confirma que no rompí
nada". Es lo que permite tocar código sin miedo, y el miedo es lo que de verdad frena a
quien está aprendiendo.

**Usa el control de versiones desde el primer día.** Un commit antes de cada cambio
significa que nunca puedes perder nada. En VS Code es un panel, no la terminal.

**Haz un cambio por sesión.** La lista tiene once puntos y no es una carrera. Entender
bien uno vale más que aplicar cinco sin saber qué hicieron.

Una cosa sobre el punto 9 y el 10: son los más aburridos y los que más tentación dan de
delegar completo. Son también donde más se aprende, porque te obligan a recorrer la app
entera y ver cómo se conectan las piezas. Si vas a leer código conmigo en algún momento,
que sea ahí.
