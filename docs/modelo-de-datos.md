# Modelo de datos — por negocio, en Firebase

Qué guarda la app en Firebase, dónde vive cada dato y de qué decisión sale. Está organizado por negocio desde la primera versión (D46) y trae todo lo decidido, también lo que queda para después (§4.12 de las reglas), para no mover datos cuando entre. Es la base para programar la migración.

**Actualizado:** 2026-11-03 (con las respuestas a P88–P97: D89–D98)

**Fuentes:** decisiones D1–D88 de [`reglas-de-negocio.md`](reglas-de-negocio.md) · los 7 flujos de [`flujos.md`](flujos.md) · código v101 revisado el 2026-11-03 ([`js/store.js`](../js/store.js), [`js/quotes.js`](../js/quotes.js), [`js/catalog.js`](../js/catalog.js), [`js/inventory.js`](../js/inventory.js), [`js/costing.js`](../js/costing.js)) · [`BASE-DE-DATOS.md`](BASE-DE-DATOS.md) (2026-10-05) · [precios de Firestore](https://firebase.google.com/docs/firestore/pricing) y [cambios de Cloud Storage de 2024](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), revisados el 2026-11-03.

**Relacionados:** [`reglas-de-negocio.md`](reglas-de-negocio.md) · [`flujos.md`](flujos.md) · [`BASE-DE-DATOS.md`](BASE-DE-DATOS.md) · [`ANDROID.md`](ANDROID.md) · [`CLAUDE.md`](../CLAUDE.md)

> **Por qué no se llama `base-de-datos.md`.** Así lo anunciaban las reglas (§6), pero Windows no distingue mayúsculas de minúsculas: `base-de-datos.md` y `BASE-DE-DATOS.md` serían el mismo archivo, y el nuevo borraría el anterior. El anterior se queda, con una nota de qué parte superó este.

> **Cómo se lee.** Cada campo dice de dónde sale: **D#** es una decisión de Francisco; **derivada**, una consecuencia directa que escribió el asistente; **técnica**, una elección del asistente para programarlo que no cambia cómo se usa la app. Las dos últimas se corrigen si no son así. La columna «1.ª» dice si entra a la primera versión o queda para después.

---

## 1. Qué cambia frente a `BASE-DE-DATOS.md`

| Tema | `BASE-DE-DATOS.md` (2026-10-05) | Ahora | Sale de |
|---|---|---|---|
| De qué cuelga todo | De la persona: `users/{uid}/…` | Del negocio: `negocios/{negocioId}/…`, con una lista de personas | D46 |
| Seguridad | «Es el mismo usuario» | «Es miembro de ese negocio» (§6) | D46 |
| Estados | `pendiente`, `enviada`, `aceptada`, `rechazada` | Siete: Borrador, Enviada, Aceptada, En producción, Entregada, Rechazada y Cancelada | D1, D6, D11, D16 |
| Pagos | No existían | Colección propia, y un resumen en la cotización | D12, D19 |
| Notion | Apagarlo antes de migrar | Ya se quitó la sincronización en v101; el envío de ventas sale con la migración | D33, D71 |
| Cuota | 360 MB al día de transferencia, un solo usuario | 10 GB al mes; la cuota de lecturas se comparte entre todos los negocios (§8) | §4.13 de las reglas |
| Imágenes | El logo en el documento de configuración | Igual, reducido; la miniatura del slicer también | D57, D91 |

**Lo que sigue valiendo** de `BASE-DE-DATOS.md`: §1 (de cajas de zapatos a archivero), §4 (el problema del folio, resuelto con D89), §8 (modo sin conexión) y §9 (migrar por pasos, con una capa intermedia).

---

## 2. El diagrama

**Diagrama:** [`modelo-de-datos.html`](modelo-de-datos.html) — diagrama entidad-relación, en el estilo neutro de `/diagram-design`.

- **La persona queda fuera del negocio:** su cuenta la lleva Firebase Authentication, y `usuarios/{uid}` solo dice a qué negocio entra (D36, D46).
- **Dentro del negocio** viven sus ajustes, catálogos, clientes, cotizaciones, pagos y rollos. El recuadro punteado es el negocio: todo lo de adentro es de él.
- **La cotización es el centro** y la única en color: un cliente pide varias, cada una se paga con varios pagos y consume filamento de varios rollos.
- **Las listas dentro de un documento** van con `[ ]`: las partidas, los cargos, el historial de estados y los consumos viajan con su cotización y no se leen aparte.
- No se dibujan las copias: una partida guarda el nombre de su impresora y su material como estaban al cotizar, no una liga viva (técnica, ya era así en `BASE-DE-DATOS.md` §3).

---

## 3. Dónde vive cada cosa

### En Firebase

```text
usuarios/{uid}                 la persona: a qué negocio entra
negocios/{negocioId}           el negocio: nombre y miembros
  ajustes/general              costeo, anticipo, plazos, días hábiles, IVA, canales
  ajustes/documento            cómo se ve la cotización: colores, logo, textos
  contadores/cotizaciones      el último folio
  impresoras/{id}
  materiales/{id}
  insumos/{id}                 herrajes y consumibles por pieza (D61)
  productos/{id}               el catálogo de productos
  rollos/{id}                  el inventario de filamento
  clientes/{id}
  cotizaciones/{id}            con sus partidas, cargos, historial y consumos dentro
  pagos/{id}                   pagos y devoluciones de todas las cotizaciones
  calculos/{id}                el historial de cálculos, los últimos 100
  favoritos/{id}               las combinaciones guardadas de impresora, material y margen
ligas/{token}                  después: la cotización que el cliente acepta desde la liga (D63)
```

- **Nombres de los campos** (técnica). Los que ya existen se quedan como están (`quoteNum`, `grandTotal`, `remainingG`…), porque `js/costing.js` y sus 24 pruebas los usan, y cambiarlos solo agrega riesgo. Los nuevos van en español sin acentos (`fechaEntrega`, `anticipoPct`), como el código más reciente.
- **Fechas** (técnica). Lo que es un día del calendario (fecha de entrega, fecha de un pago, festivos) se guarda como texto `AAAA-MM-DD`, para que un pago del 31 de octubre no se cambie de mes por la zona horaria. Lo que es un momento (cuándo se aceptó, cuándo se creó) se guarda como fecha y hora de Firestore.
- **Montos** (técnica). En pesos, con dos decimales, como hoy.

### Solo en el teléfono

| Qué | Por qué | Sale de |
|---|---|---|
| Tema claro u oscuro, última impresora y último material elegidos | Son del dispositivo, no del negocio | Técnica |
| Si ya se vio la introducción | Cada dispositivo la muestra una vez; la cuenta nueva pasa por el arranque con `arranqueHecho` (§4.2) | D88 |
| Sin cuenta: los ajustes de prueba y la cotización en curso | Sin cuenta no se guardan cotizaciones; al entrar, se suben o se descartan (§9) | D39, D84–D86 |

### En el código de la app

La lista de impresoras y materiales comunes con sus precios de referencia (D47), los motivos de rechazo (D76) y las formas de pago (D77). Viajan con la app: no cuestan lecturas y se actualizan con cada versión (técnica).

---

## 4. Las colecciones

### 4.1 `usuarios/{uid}` — la persona

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `correo`, `nombre` | Copia de los de la cuenta, para mostrarlos | D37 | Sí |
| `negocioId` | El negocio al que entra. En la primera versión, uno | D36, D46 | Sí |
| `creadoEn` | Cuándo se creó | Técnica | Sí |

Si el correo está confirmado (D53) lo dice Firebase Authentication; no se copia.

### 4.2 `negocios/{negocioId}` — el negocio

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `nombre` | El nombre comercial, como «La Casita del Molde» | D35 | Sí |
| `miembros` | Quién entra y con qué rol: `{ uid: 'dueño' }`. En la primera versión, una persona | D36, D46 | Sí |
| `arranqueHecho` | Si ya eligió impresoras y materiales. Una cuenta nueva sin él pasa por el flujo 7 | D47, D86 | Sí |
| `creadoEn` | Cuándo se creó | Técnica | Sí |

Este documento es corto a propósito: las reglas de seguridad lo leen en cada consulta (§6).

### 4.3 `ajustes/general` — un solo documento

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| Costeo de hoy: `kwhCost`, `laborCostPerHour`, `wastePercent`, `maintenancePercent`, `amsPurgeGrams`, `ipaLiterCost`, `ipaMlPerPrint`, `resinSupportPct` | Lo que hoy está en Ajustes, igual | v100 | Sí |
| `fixedMonthlyCost`, `fixedCostItems`, `monthlyPrintHours` | Gastos fijos y horas al mes. **Vacíos (`null`) si el taller todavía no los sabe:** la calculadora avisa | D47, D87 | Sí |
| `indirectMonthlyCost`, `indirectCostItems` | Gastos indirectos, ya sin el empaque | D25 | Sí |
| `bizPhone`, `bizEmail`, `bizSocial`, `bizQrUrl`, `bizBank`, `bizAccountHolder`, `bizAccountNumber`, `showBankInfo` | Datos de contacto y bancarios que imprime la cotización | v100 | Sí |
| `anticipoPct` | Anticipo por defecto: 50 % al empezar | D14, D97 | Sí |
| `vigenciaDias` | Vigencia por defecto: 15 días al empezar | D10, D97 | Sí |
| `plazoDias` | Plazo de entrega por defecto, en días hábiles: 5 al empezar | D15, D97 | Sí |
| `ventanaCancelacionDias` | Días hábiles para devolver el anticipo: 2 al empezar. Con él se arma el texto de la política | D17, D26, D97 | Sí |
| `diasHabiles`, `festivos` | Días que se trabaja (lunes a viernes al empezar) y festivos, como `AAAA-MM-DD` | D27 | Sí |
| `empaqueDefault` | Costo de empaque por pieza que se propone | D25 | Después |
| `ivaPct`, `datosFiscales` | Tasa de IVA (16 %) y RFC, razón social y régimen del negocio | D21, D22, D43 | Después |
| `canales` | Canales de venta con su comisión: `[{ id, nombre, pct }]`, con «Venta directa» al 0 % | D23 | Después |

`bizName` pasa al documento del negocio como `nombre` (§4.2). `theme`, `lastPrinterId` y `lastMaterialId` se quedan en el teléfono (§3).

### 4.4 `ajustes/documento` — cómo se ve la cotización

Lo que hoy es `quoteStyle`, igual: colores, qué secciones se muestran, `termsText` y `footerText`. **El logo se guarda reducido** (unos 50 KB), porque un documento de Firestore acepta hasta 1 MB y hoy se guarda la imagen como se sube (D91).

### 4.5 `contadores/cotizaciones`

`{ actual: 12 }`. El folio lo suma Firebase, no el teléfono, para que dos dispositivos no den el mismo número (`BASE-DE-DATOS.md` §4). Sin conexión, la cotización queda «Sin folio» y lo recibe sola al conectarse (D89).

### 4.6 Catálogos: `impresoras`, `materiales`, `insumos`, `productos`

| Colección | Campos | Sale de | 1.ª |
|---|---|---|---|
| `impresoras` | Los de hoy: `name`, `type`, `power`, `cost`, `lifeHours`, `multicolor`, `heads`. Más `refId`, si salió de la lista de comunes | v100, D47 | Sí |
| `materiales` | Los de hoy: `name`, `type`, `costPerKg`, `density` | v100 | Sí |
| `insumos` | `nombre`, `costoUnitario`. Herrajes, imanes, argollas | D61 | Sí |
| `productos` | Los de hoy: `name`, `variant`, `type` (`cost` o `table`), `designH`, `defaultWeight`, `defaultTimeH`, `defaultMargin`, `priceTable`. Más `empaque` por pieza | v100, D25 | Sí; `empaque`, después |

### 4.7 `rollos/{id}` — el inventario de filamento

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `materialId`, `material` | El material y una copia de su nombre, como hoy | v100 | Sí |
| `brand`, `color`, `totalG`, `costPerKg` | Como hoy | v100 | Sí |
| `remainingG` | Lo que queda. Se descuenta con una suma atómica de Firebase, para que dos dispositivos no se pisen | D13, técnica | Sí |
| `colorHex` | El color como lo escribe el archivo del slicer (`#00BCD4`), para proponer el rollo de cada color | D74, derivada | Sí |

Un rollo que aparece en los consumos de un pedido en producción no se borra: hace falta para devolverle el filamento si el pedido regresa un paso (derivada de D18).

### 4.8 `clientes/{id}`

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `name`, `phone`, `email`, `social`, `notes`, `source`, `tag` | Como hoy | v100 | Sí |
| `datosFiscales` | RFC, razón social, código postal, régimen y uso de CFDI | D22 | Después |
| `creadoEn` | Cuándo se creó | Técnica | Sí |

Cuántas cotizaciones tiene y cuánto se le ha cotizado se calcula al abrir su ficha (§5), no se guarda.

### 4.9 `cotizaciones/{id}` — el centro

**Identidad y estado**

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `quoteNum` | El folio: `COT-0012`. Vacío mientras no tenga | v100, D89 | Sí |
| `status` | `borrador`, `enviada`, `aceptada`, `en_produccion`, `entregada`, `rechazada` o `cancelada`. `pendiente` se migra a `borrador` | D1, D6, D11, D16 | Sí |
| `historial` | `[{ estado, en }]`: por dónde pasó y cuándo. Con él se regresa un paso al estado del que vino | D18 | Sí |
| `quoteDate` | Fecha de la cotización. Se renueva al editarla | D28 | Sí |
| `vigenciaDias` | Cuántos días es válida, desde `quoteDate` | D10 | Sí |
| `notes` | Notas, también lo que se entregó en parte | v100, D68 | Sí |

**Cliente**

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `clienteId` | La ficha del cliente. Hoy se liga por el nombre en minúsculas (§3 de las reglas) | Derivada | Sí |
| `client`, `phone` | Copia de cómo se emitió: si el cliente cambia de nombre, la cotización vieja no cambia | v100 | Sí |
| `datosFiscalesCliente` | Copia de los datos fiscales del cliente, si lleva IVA | D22 | Después |

**Partidas: `items[ ]`**, cada una:

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `desc`, `qty`, `printer`, `material` | Descripción, cantidad y copia de los nombres | v100 | Sí |
| `weight`, `timeH`, `designH`, `pieces`, `margin` | Por pieza, con las piezas de la placa, como hoy. El tiempo se captura en horas y minutos y se guarda en horas | v100, D58 | Sí |
| Desglose: `matCost`, `energyCost`, `laborCost`, `deprecCost`, `fixedCost`, `indirectCost`, `maintCost`, `postProcCost`, `ipaCost`, `uvCost`, `wasteCost`, `baseCost` | El costo como se calculó ese día. Si mañana sube el PLA, la cotización no cambia | v100 | Sí |
| `totalCost`, `autoPrice`, `priceManual` | Precio, precio de la fórmula y si se escribió a mano | v100 | Sí |
| `spoolId`, `amsColors`, `amsPurgeGrams` | El rollo, o los rollos por color con sus gramos | v100, D74 | Sí |
| `archivo` | `{ nombre, placa }` del archivo del slicer del que salió | D57, D72 | Sí |
| `miniatura` | La imagen de la placa, reducida a unos 10 KB | D57, D91 | Sí |
| `insumos` | `[{ insumoId, nombre, costoUnitario, cantidad }]` por pieza | D61 | Sí |
| `empaque` | Costo de empaque por pieza | D25 | Después |

**Cargos y totales**

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `cargos` | `[{ concepto, monto, costo }]`: envío, urgencia, diseño extra. `costo` es lo que te cuesta, en $0 si no se llena: el cargo deja de ganancia `monto − costo` | D62, D93 | Sí |
| `subtotal`, `discount`, `discountAmt` | Como hoy | v100 | Sí |
| `commission`, `commissionAmt` | La comisión por recomendación | D24 | Sí |
| `recomendador`, `comisionPagadaEn` | A quién se le debe y cuándo se le pagó | D31 | Después |
| `canal` | Copia del canal elegido: `{ id, nombre, pct }` | D23 | Después |
| `conIva`, `ivaPct`, `iva` | El interruptor del IVA, su tasa y el monto, sobre el total después de descuento y comisión | D21, D32 | Después |
| `grandTotal` | Lo que paga el cliente | v100 | Sí |
| `totalBaseCost` | El costo del pedido; vacío si lleva productos de tabla sin costo conocido | v100 | Sí |

**Anticipo y entrega**

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `anticipoPct`, `anticipo` | Porcentaje y monto. 0 % es que no lo pide | D14 | Sí |
| `plazoDias` | Plazo en días hábiles | D15 | Sí |
| `aceptadaEn` | Cuándo se aceptó. Hoy se llama `acceptedAt` | D8, D20 | Sí |
| `fechaEntrega` | Vacía hasta que se cubre el anticipo, o desde que se acepta si no lo pide | D15, D20, D75 | Sí |
| `fechaEntregaEditada` | Si se cambió a mano, para no recalcularla encima | D15 | Sí |

**Resumen de pagos.** Se escribe junto con cada pago, en la misma operación, para que la lista y la tarjeta no tengan que leer los pagos (técnica):

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `pagado`, `saldo` | Suma de pagos menos devoluciones, y lo que falta | D12 | Sí |
| `estadoPago` | `esperando_anticipo`, `anticipo_incompleto`, `con_saldo` o `pagada` | Flujo 4 | Sí |
| `anticipoCubiertoEn` | Fecha del pago que completó el anticipo: de ahí corren el plazo y la ventana de cancelación | D20, D26, D79 | Sí |
| `numPagos` | Cuántos pagos lleva, para numerar el recibo | D59, D95 | Sí |

**Producción y cierre**

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `consumos` | `[{ rolloId, gramos }]`: lo que se descontó al empezar producción, de uno o más rollos. Se devuelve si regresa un paso | D13, D18, D80 | Sí |
| `motivoRechazo` | `{ motivo, nota }`, opcional | D76 | Sí |
| `creadaEn`, `actualizadaEn`, `creadaPor` | Cuándo y quién; `creadaPor` sirve cuando haya roles | Técnica, D36 | Sí |

Se dejan de guardar `notionPageId` y `notionSyncedAt` (D33).

### 4.10 `pagos/{id}` — pagos y devoluciones

Van en su propia colección, y no dentro de la cotización, porque el panel del mes y el Excel del contador buscan pagos por fecha, de todas las cotizaciones (D19, D45). Pedir «los pagos de octubre» a una colección cuesta una lectura por pago; buscarlos dentro de las cotizaciones obligaría a leerlas todas (técnica).

| Campo | Qué guarda | Sale de | 1.ª |
|---|---|---|---|
| `cotizacionId` | De qué cotización es | D12 | Sí |
| `quoteNum`, `client` | Copias, para el recibo y el Excel sin leer la cotización | Técnica | Sí |
| `tipo` | `pago` o `devolucion`. Una devolución resta en el mes en que se hace | D17, D19 | Sí |
| `monto`, `fecha` | Cuánto y qué día | D12, D19 | Sí |
| `forma` | `efectivo`, `transferencia`, `tarjeta` u `otro` | D77 | Sí |
| `numero` | El número de pago de esa cotización, para el recibo: «COT-0012 · Pago 2» | D59, D95 | Sí |
| `ganancia`, `comision`, `iva` | Su parte de cada cosa. El ingreso es `monto − comision − iva`. Si el pedido cambia, lo registrado no cambia y los pagos que faltan llevan el resto | D29, D30, D44, D92 | Sí; `iva`, después |
| `anulado`, `anuladoEn` | Un pago borrado por error queda anulado, con su recibo, y no suma | D78 | Sí |
| `creadoEn`, `creadoPor` | Cuándo y quién | Técnica | Sí |
| `referencia` | El número de operación del cobro en línea | D64 | Después |

**Una cotización con pagos no se borra:** se cancela, y sus pagos se quedan en su mes (D96).

### 4.11 `calculos/{id}` y `favoritos/{id}`

- **`calculos`:** el historial de cálculos, como hoy (`lastCalc` completo). La app borra el más viejo cuando pasa de 100, como hoy en [`js/calculator.js:604`](../js/calculator.js). En la cuenta y no solo en el teléfono, porque la web y Android ven los mismos datos (derivada de D49).
- **`favoritos`:** lo que hoy son los presets: `{ name, printerId, materialId, margin }` (derivada de D49).

### 4.12 `ligas/{token}` — después

Para que el cliente acepte desde la liga (D63). Una copia de lo que ve el cliente, con su `negocioId` y su respuesta. El token es largo y al azar: quien tiene la liga ve esa cotización y nada más. **En la primera versión no hace falta:** la liga de hoy lleva la cotización dentro de la dirección ([`quote.html:400`](../quote.html)), sin base de datos.

---

## 5. Lo que se calcula y no se guarda

| Dato | Cómo se calcula | Sale de |
|---|---|---|
| Ingreso del mes | Pagos de ese mes, no anulados, menos devoluciones; sin la comisión ni el IVA | D19, D30, D44 |
| Ganancia del mes | Suma de `ganancia` de esos pagos | D29 |
| Por cobrar | Suma de `saldo` de las aceptadas, en producción y entregadas | D19 |
| Por pagar al recomendador | Suma de `comision` de los pagos de cotizaciones con `comisionPagadaEn` vacío | D30, D31 |
| IVA cobrado | Suma de `iva` de los pagos del mes | D44 |
| Motivos de rechazo | Cuenta de `motivoRechazo` en las rechazadas del periodo | D76 |
| Vencida | `quoteDate` + `vigenciaDias` antes de hoy, en Enviada | D10 |
| Cotizaciones y total de un cliente | Al abrir su ficha, con las cotizaciones de ese `clienteId` | v100 |

Se calculan en la app, con los datos que ya bajó. Una función en el servidor que los sume necesitaría el plan Blaze (técnica).

---

## 6. Reglas de seguridad

Lo que impide que un negocio lea los datos de otro. Va en `firestore.rules`:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function esMiembro(negocioId) {
      return request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/negocios/$(negocioId)).data.miembros;
    }

    match /usuarios/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    match /negocios/{negocioId} {
      // Crear un negocio: solo con quien lo crea como único miembro.
      allow create: if request.auth != null &&
        request.resource.data.miembros.keys().hasOnly([request.auth.uid]);
      allow read, update, delete: if request.auth != null &&
        request.auth.uid in resource.data.miembros;

      // Todo lo de adentro: solo sus miembros.
      match /{coleccion}/{docId} {
        allow read, write: if esMiembro(negocioId);
      }
    }
  }
}
```

Léelo así: *«dentro de un negocio, lee y escribe solo quien está en su lista de miembros»*.

**Desde el 2026-11-09 viven en [`firestore.rules`](../firestore.rules)** (D108), ajustadas a lo que hace `js/db.js`: el negocio se llama `neg_` + uid, solo se crea el propio, y la sesión anónima no entra. Cómo publicarlas y probarlas: [`firebase.md`](firebase.md).

- **Cuesta una lectura por consulta**, no por documento: para revisar la lista, la regla lee el documento del negocio. Por eso ese documento es corto (§4.2).
- **Cuando haya roles** (D36), la regla de `update` del negocio se cierra para que solo el dueño cambie la lista de miembros.
- **Nunca se publica con las reglas de prueba** que ofrece Firebase al crear el proyecto (`BASE-DE-DATOS.md` §5).

---

## 7. Índices

| Consulta | Para qué | Índice |
|---|---|---|
| Cotizaciones vivas, ordenadas por última modificación | La lista al abrir (D90) | Compuesto |
| `status` en Aceptada o En producción, ordenadas por `fechaEntrega` | La lista de producción (D60, D82) | Compuesto |
| `clienteId` igual a uno, ordenadas por `quoteDate` | La ficha del cliente | Compuesto |
| Pagos con `fecha` dentro del mes | El panel y el Excel del mes (D19, D45) | Automático |
| Pagos de una `cotizacionId`, por `numero` | Los pagos y recibos de un pedido (D59) | Compuesto |

Firebase avisa en la consola con una liga que crea el índice la primera vez que falta (`BASE-DE-DATOS.md` §6). La búsqueda por texto completo no existe en Firestore: con D90, se busca por el inicio del nombre del cliente o del folio.

---

## 8. Lecturas, escrituras y cuota

**El plan gratuito de Firestore (Spark):** 50 000 lecturas, 20 000 escrituras y 20 000 borrados al día, y 1 GiB guardado, **para todo el proyecto**: lo comparten todos los negocios. Si se pasa, la app deja de leer y escribir en la nube hasta el día siguiente.

**Qué gasta lecturas**

- Cada documento que baja del servidor. Lo que ya está en la copia del teléfono no cuenta.
- **Abrir la app después de 30 minutos** cuenta como una consulta nueva: vuelve a bajar todo lo que pide la pantalla. Por eso al abrir baja solo lo vivo y lo de los últimos 3 meses (D90).
- Las reglas de seguridad: una lectura más por consulta (§6).

**Qué gasta escrituras.** Guardar en cada tecla. `svDebounced()` de [`js/store.js`](../js/store.js) ya espera a que se deje de escribir; con Firebase, todo guardado de un campo que se escribe pasa por ahí. (`BASE-DE-DATOS.md` §7 apunta a `js/sync.js`, que se quitó en v101.)

**Cuándo pasar al plan Blaze** (pago por uso, con la misma cuota gratuita incluida): cuando la cuota diaria se quede corta o se quiera Cloud Storage o funciones en el servidor. Pide tarjeta, y el presupuesto de Google Cloud avisa por correo pero no detiene el gasto por sí solo (derivada de D33).

**Cloud Storage** (imágenes y archivos) pide el plan Blaze desde octubre de 2024, también para proyectos nuevos. Por eso la miniatura y el logo van reducidos dentro de los documentos (D91).

---

## 9. Sin cuenta, al entrar y al salir

| Momento | Qué pasa con los datos | Sale de |
|---|---|---|
| Sin cuenta | Los ajustes de prueba (impresoras, materiales, gastos) viven en el teléfono, con las claves de hoy (`c3d_printers`, `c3d_materials`, `c3d_config`). La cotización en curso, también. No se guardan cotizaciones | D39, D84 |
| Al entrar con una cuenta nueva | En una sola operación: se crean el negocio con la persona como `dueño`, su `usuarios/{uid}`, los ajustes y catálogos de prueba, y la cotización en curso como Borrador. Después se borran del teléfono | D40, D84 |
| Al entrar a una cuenta con datos | Se usan los de la cuenta; los ajustes de prueba se descartan. Solo la cotización en curso se agrega como Borrador: sus partidas llevan copias de los nombres, así que no dependen de los ajustes del teléfono | D86 |
| En otro dispositivo | Se entra con la misma cuenta y baja lo que pide la pantalla | D49 |
| Al cerrar sesión | La app espera a que suba lo pendiente (`waitForPendingWrites`). Sin conexión, avisa y no cierra. Después borra la copia del teléfono (`terminate` y `clearIndexedDbPersistence`) | D83 |

---

## 10. Borrar la cuenta

**Desde la app** (D41):

1. Ofrece descargar el respaldo: Ajustes › Exportar, que ahora lee de Firebase.
2. Confirma, y si se entró hace mucho, pide entrar otra vez (§4.13 de las reglas).
3. Borra cada documento de cada colección del negocio, en tandas de hasta 500. Firestore no borra lo de adentro al borrar el documento de afuera.
4. Borra el negocio, después `usuarios/{uid}` y al final la cuenta.

Va en ese orden para que, si se corta la conexión a la mitad, la persona pueda volver a entrar y terminar (técnica). Sin funciones en el servidor, todo lo hace la app (técnica, por el plan Spark). Cuando haya roles, quien no es dueño solo sale de la lista de miembros.

**Desde la página web** que pide Google Play (D98): la página explica cómo borrar desde la app y da un correo, y Francisco borra a mano desde la consola de Firebase, en el plazo que diga la página (por ejemplo, 7 días).

---

## 11. Migrar los datos de hoy

Los datos de La Casita del Molde están en el navegador de cada dispositivo de Francisco. Antes de migrar: un respaldo con Ajustes › Exportar.

| Hoy (`localStorage`) | Va a | Qué cambia |
|---|---|---|
| `c3d_config` | `ajustes/general` y el `nombre` del negocio | `bizName` pasa al negocio; `theme`, `lastPrinterId` y `lastMaterialId` se quedan en el teléfono |
| `c3d_quoteStyle` | `ajustes/documento` | El logo se reduce (D91) |
| `c3d_printers`, `c3d_materials` | `impresoras`, `materiales` | Nada |
| `c3d_inventory` | `rollos` | `colorHex` queda vacío hasta que se edite el rollo |
| `c3d_clients` | `clientes` | Sin los dos clientes de ejemplo, si siguen sin cambios (D47) |
| `c3d_quotes` | `cotizaciones` | `pendiente` pasa a `borrador` (D6); `clienteId` se busca por el nombre, como hoy; `acceptedAt` pasa a `aceptadaEn`; el `historial` se arma con las fechas que hay; se quitan los campos de Notion (D33). Las aceptadas pasan como Entregadas y pagadas, con un pago «migrado» por el total en la fecha de aceptación, o en la de la cotización si no la tienen; las que sigan en curso se regresan un paso y se borra su pago (D94) |
| `c3d_quoteCounter` | `contadores/cotizaciones` | Nada |
| `c3d_catalog` | `productos` | Nada |
| `c3d_presets` | `favoritos` | Nada |
| `c3d_history` | `calculos` | Solo los últimos 100 |
| `c3d_onboardingDone` | Se queda en el teléfono | — |

**Cómo se hace:** la primera vez que Francisco entra con su cuenta en el dispositivo que tiene sus datos, la app ofrece una sola vez «Subir los datos de este teléfono». Es distinto del paso de invitado a cuenta (§9), que sube solo ajustes y la cotización en curso: hoy solo Francisco tiene cotizaciones guardadas (derivada de D84). Lo demás va por los pasos de `BASE-DE-DATOS.md` §9: primero la capa intermedia, después Firebase en paralelo, y al final se cambia la lectura.

---

## 12. Preguntas

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P88 | Cómo recibe su folio una cotización hecha sin conexión | (a) lo da Firebase al conectarse; mientras, «Sin folio» | Respondida (a) → D89 |
| P89 | Qué cotizaciones baja la app al abrirla | (a) las vivas y las de los últimos 3 meses | Respondida (a) → D90 |
| P90 | Dónde se guardan la miniatura del slicer y el logo | (a) reducidas dentro del documento, sin Cloud Storage | Respondida (a) → D91 |
| P91 | Si el pedido cambia, ¿cambian las partes de los pagos ya registrados? | (a) no; los pagos que faltan llevan el resto | Respondida (a) → D92 |
| P92 | ¿Los cargos libres cuentan como ganancia? | (a) cada cargo puede llevar lo que te cuesta | Respondida (a) → D93 |
| P93 | Cómo pasan a Firebase tus cotizaciones aceptadas de hoy | (a) Entregadas y pagadas, con un pago «migrado» | Respondida (a) → D94 |
| P94 | Qué folio lleva el recibo de un pago | (a) el de la cotización y el número de pago | Respondida (a) → D95 |
| P95 | ¿Se puede borrar una cotización con pagos? | (a) no; se cancela | Respondida (a) → D96 |
| P96 | Con qué valores empieza un taller nuevo, y si la ventana de cancelación se cambia | (a) valores de inicio, todos editables | Respondida (a) → D97 |
| P97 | Cómo se atiende el borrado pedido desde la página web | (a) a mano, desde la consola | Respondida (a) → D98 |

**P88. ¿Cómo recibe su folio una cotización hecha sin conexión?** Hoy el folio lo da cada dispositivo, y con la web y el teléfono abiertos dos cotizaciones podrían salir con el mismo número (`BASE-DE-DATOS.md` §4). Ejemplo: en el taller, sin señal, armas la cotización de Rosalía en el teléfono.
- (a) El folio lo da Firebase al guardar con conexión. Sin conexión, la cotización queda «Sin folio» y lo recibe sola al conectarse.
- (b) Cada dispositivo tiene su serie: `COT-A-0012` en el teléfono y `COT-B-0007` en la computadora.
- (c) El folio sale de la fecha y la hora: `COT-261103-1432`.
- **Recomendado: (a).** Los folios siguen seguidos y nunca chocan. Enviar por WhatsApp o con la liga ya pide conexión; lo único que pierde es que un PDF hecho sin conexión sale «Sin folio».
- **Respuesta (2026-11-03): (a) → D89.**

**P89. ¿Qué cotizaciones baja la app al abrirla?** Cada cotización que baja del servidor cuenta contra las 50 000 lecturas diarias de todo el proyecto (§8). Ejemplo: 12 talleres en la prueba cerrada, con 600 cotizaciones cada uno, abren la app 5 veces al día.
- (a) Las vivas (de Borrador a Entregada con saldo) y las de los últimos 3 meses. Las más viejas se buscan con conexión, por el nombre del cliente o el folio. En el ejemplo: unas 80 por apertura, 4 800 lecturas al día, el 10 % de la cuota.
- (b) Todas, como hoy. En el ejemplo: 36 000 lecturas al día, el 72 %.
- (c) Solo las vivas; todo lo demás, buscando.
- **Recomendado: (a).** Cabe con holgura en el plan gratuito y en la pantalla se ve lo mismo que hoy. La (c) haría buscar hasta lo del mes pasado.
- **Respuesta (2026-11-03): (a) → D90.**

**P90. ¿Dónde se guardan la miniatura del archivo del slicer y el logo?** Cloud Storage, el lugar de Firebase para imágenes, pide el plan Blaze con tarjeta desde 2024; un documento de Firestore acepta hasta 1 MB. Ejemplo: una cotización de 4 partidas, cada una con la miniatura de su placa.
- (a) Reducidas dentro del documento: unos 10 KB por miniatura, que se ve bien en el PDF, y unos 50 KB el logo.
- (b) En Cloud Storage, a tamaño completo, con el plan Blaze desde la prueba cerrada.
- (c) La miniatura no se guarda: solo se ve mientras armas la cotización.
- **Recomendado: (a).** La prueba no necesita tarjeta ni plan de pago, y el PDF lleva la miniatura que pide D57. Si un día se quieren fotos de piezas terminadas, esas sí irían a Cloud Storage.
- **Respuesta (2026-11-03): (a) → D91.**

**P91. Si el pedido cambia después de un pago, ¿cambian las partes de los pagos ya registrados?** Cada pago guarda su parte de la ganancia, de la comisión y del IVA (D29, D30, D44), y un pedido aceptado se puede cambiar (D67). Ejemplo: pedido de $1,200 con $500 de ganancia; el anticipo de $600 de septiembre trae $250. En octubre el cliente agrega piezas y el pedido queda en $1,800, con $800 de ganancia.
- (a) Lo registrado no cambia: septiembre se queda con $250, y los pagos que faltan llevan el resto ($550 en los $1,200 que faltan).
- (b) Se recalcula todo: el anticipo de septiembre pasa a traer $266.67 y el panel de septiembre cambia.
- **Recomendado: (a).** Un mes cerrado no cambia, y si ya le mandaste el Excel al contador (D45), sigue cuadrando. El pedido completo suma lo mismo con las dos.
- **Respuesta (2026-11-03): (a) → D92.**

**P92. ¿Los cargos libres cuentan como ganancia?** D62 los agregó, pero no dijo si dejan ganancia (D29). Ejemplo: cobras $150 de envío que le pagas a la paquetería y $100 de urgencia.
- (a) Cada cargo puede llevar «lo que te cuesta», en $0 si no se llena: el envío con costo de $150 no deja ganancia, y la urgencia deja $100.
- (b) Todos los cargos son ganancia completa: el panel diría $250.
- (c) Ningún cargo es ganancia: entran al ingreso y nada más.
- **Recomendado: (a).** Un campo opcional; con (b) el envío inflaría tu ganancia, y con (c) la urgencia no contaría.
- **Respuesta (2026-11-03): (a) → D93.**

**P93. ¿Cómo pasan a Firebase tus cotizaciones aceptadas de hoy?** Hoy no se registran pagos, y el panel nuevo cuenta el ingreso por pagos (D19): sin ellos, tus meses pasados saldrían en $0. Ejemplo: COT-0002 de Rosalía, aceptada en septiembre por $325.
- (a) Pasan como Entregadas y pagadas, con un pago por el total en la fecha en que se aceptaron (o en la de la cotización, si no la tienen), marcado «migrado». Las que todavía estén en curso las regresas un paso (D18) y borras su pago (D78).
- (b) Pasan como Aceptadas, sin pagos, y tú registras los que falten.
- (c) Al migrar, la app te pregunta por cada una.
- **Recomendado: (a).** El panel conserva tu historia y solo corriges las pocas que siguen en curso. Con (b) tendrías que registrar a mano los pagos de meses.
- **Respuesta (2026-11-03): (a) → D94.**

**P94. ¿Qué folio lleva el recibo de cada pago?** (D59). Ejemplo: el segundo pago de COT-0012.
- (a) El de la cotización y el número de pago: «COT-0012 · Pago 2».
- (b) Un consecutivo propio: «REC-0045».
- **Recomendado: (a).** El cliente lo relaciona con su cotización, y no hace falta otro contador.
- **Respuesta (2026-11-03): (a) → D95.**

**P95. ¿Se puede borrar una cotización que ya tiene pagos?** Hoy se borra cualquiera ([`js/quotes.js:1349`](../js/quotes.js)). Ejemplo: COT-0015 tiene un anticipo de $500 registrado.
- (a) No: solo se borran las que no tienen pagos. Una con pagos se cancela (D16) y su dinero se queda en su mes.
- (b) Sí: se borra con sus pagos.
- **Recomendado: (a).** Borrarla cambiaría los ingresos de meses pasados y lo que ya recibió el contador.
- **Respuesta (2026-11-03): (a) → D96.**

**P96. ¿Con qué valores empieza un taller nuevo, y se puede cambiar la ventana de cancelación?** Las decisiones dan el anticipo (50 %, D14), el plazo de ejemplo (5 días hábiles, D15) y la ventana (2 días hábiles, D26), pero no la vigencia (D10). Ejemplo: un taller de Monterrey pide 30 % de anticipo y lo devuelve hasta 3 días después.
- (a) Anticipo 50 %, vigencia 15 días, plazo 5 días hábiles y ventana de 2 días hábiles. Todo se cambia en Ajustes, y el texto de la política se arma con el número de cada taller.
- (b) Los mismos valores, pero la ventana de 2 días es igual para todos.
- **Recomendado: (a).** Cada taller tiene su política; con (b), el de Monterrey imprimiría una que no es la suya. Los 15 días de vigencia son propuesta mía.
- **Respuesta (2026-11-03): (a) → D97.**

**P97. ¿Cómo se atiende el borrado de datos pedido desde la página web?** Google Play pide una liga web para pedir el borrado sin reinstalar la app (§4.10 de las reglas). Hacerlo automático pide funciones en el servidor, y con ellas el plan Blaze. Ejemplo: un taller que ya desinstaló la app pide que borren sus datos.
- (a) La página explica cómo borrar desde la app y da un correo. Tú borras a mano desde la consola de Firebase, en el plazo que diga la página (por ejemplo, 7 días).
- (b) Un formulario que borra solo, con funciones en el servidor y el plan Blaze.
- **Recomendado: (a).** En la prueba cerrada serán pocos casos, y no obliga a pasar a Blaze.
- **Respuesta (2026-11-03): (a) → D98.**

---

## 13. Lo que sigue

1. ~~**Respuestas a P88–P97.** Se anotan como decisiones en el §2 de [`reglas-de-negocio.md`](reglas-de-negocio.md), y aquí se marca cada una.~~ Respondidas el 2026-11-03: D89–D98.
2. **Borrador del aviso de privacidad** (D51). Los datos personales que guarda la app están aquí: de cada cliente, nombre, teléfono, correo, redes y, con factura, datos fiscales (§4.8); de la persona, correo y nombre (§4.1).
3. **Programar la migración** con los pasos de §11.
