# Competencia — Cotizador 3D

Qué ofrecen las apps y plataformas que compiten con el cotizador, qué tienen ellas que la app no, qué tiene la app que ellas no, y cómo proceder.

**Actualizado:** 2026-10-16 (P56–P65 respondidas: D57–D66 en `reglas-de-negocio.md`)

**Fuentes:** fichas de Google Play y App Store, sitios oficiales y reseñas, consultados el 2026-10-16 por tres agentes de investigación. El asistente comprobó en la fuente oficial los datos de las cinco que más pesan: Bugeo App, 3Dcalc+, 3D Print Pricing, 3DPCC y Printforge. Ligas en §8.

**Relacionados:** [`reglas-de-negocio.md`](reglas-de-negocio.md) (sobre todo §4.12, primera versión) · [`MAPA-DE-SITIO.md`](MAPA-DE-SITIO.md) («Lo que se puede añadir») · [`MEJORAS.md`](../MEJORAS.md)

> Las preguntas de este documento siguen la numeración de `reglas-de-negocio.md` (P56 en adelante). Sus respuestas se anotan como decisiones en el §2 de ese documento, que es el único registro de decisiones.

---

## 1. En resumen

- **La competencia directa en México es Bugeo App**, de un desarrollador de Jalisco, lanzada en marzo de 2026: costeo, cotización en PDF, clientes, métricas y una biblioteca técnica, desde $39 MXN al mes. No tiene resina, ni pedidos de producción, ni inventario con existencias.
- **La más completa es 3D Print Pricing**, de Rusia: pedidos con tablero, anticipos, liga para el cliente, facturas, inventario y equipo con roles, desde 0.49 USD al mes. Su sitio no está en español ni cobra en pesos.
- **Lo que casi todas tienen y la app no:** leer el archivo del slicer para no teclear peso y tiempo. Lo tienen cinco competidoras.
- **Lo que la app tiene y ninguna otra:** mandar la cotización por WhatsApp, el flujo de anticipo, entrega y cancelación pensado para México, y el costeo con gastos fijos por hora real, placa y purga por cambio de color.
- **Lo que más piden los usuarios en las reseñas:** cotización con su marca e imagen, inventario que se descuente solo, más rubros de costo, capturar el tiempo en horas y minutos, y precios sin muro de pago.

---

## 2. Quién compite

### Apps en español o con mercado hispano

| App | Origen | Plataformas | Precio | Lo que la distingue |
|---|---|---|---|---|
| **Bugeo App** | México (Jalisco) | Android, iPhone | Gratis con compras: $39 MXN al mes, $399 al año o $999 de por vida | Biblioteca técnica y academia; importa el 3MF laminado de Bambu Studio; piezas por bandeja |
| **3Dcalc+** | España | Android, iPhone, Mac, web | Pago único: 4.99 € la app; la web 29.99 € o 9.99 € al año | Lee G-code, desglosa color y purga del AMS, PDF con logo e imagen, base de 150 impresoras, sincroniza |
| **3DCost** | Colombia | Android, iPhone | Con anuncios; $129 MXN al mes, $399 al año o $999 Pro | Resina con lavado y curado, PDF |
| **PrintCalc** | Argentina | Android | Con anuncios y compras | IVA y comisión de tarjeta, PDF con logo, estados de pedido |

### Apps en otros idiomas con presencia en Google Play

| App | Origen | Precio | Lo que la distingue |
|---|---|---|---|
| **3D Print Pricing** | Rusia | Gratis limitado; 0.49 a 6.99 USD al mes | Casi un sistema del taller: tablero de pedidos, anticipos, liga para el cliente, facturas y remisiones, inventario por lotes con NFC, equipo con roles, móvil y web |
| **3D Print Cost Calculator** | Sudáfrica | Gratis limitado; premium de pago | La más descargada (más de 10 000); lee G-code; casi todo detrás del pago y con quejas por eso |
| **Spool** | — | Gratis | Se conecta a Bambu Lab e importa el historial de impresión; inventario que se descuenta solo; comisiones de Etsy, eBay y Amazon |

### Plataformas web para talleres

| Plataforma | Precio | Lo que la distingue |
|---|---|---|
| **3DPCC** | Gratis solo para calcular; PRO 12.50 USD al mes | En español; clientes, pedidos por etapas, inventario de filamento, herrajes y empaque. App solo para iPhone |
| **Printforge** (Australia) | De gratis a 39 AUD al mes | Lee G-code de Bambu, Orca, Prusa y Cura; liga para que el cliente suba su archivo; cotización instantánea y cobro con Stripe; tablero de 7 etapas |
| **AutoQuote3D** | Desde 25 USD al mes | Cotización instantánea al subir el STL, en el sitio del taller, con cobro en línea |
| **Printago** | Gratis el primer trabajo simultáneo; 4 USD por cada uno extra | Junta los pedidos de Shopify, Etsy y otras tiendas en una cola y los manda a la impresora correcta |

Ninguna plataforma menciona pesos mexicanos ni CFDI, y de las plataformas web solo 3DPCC y Printago tienen app móvil.

---

## 3. Lo que la app ya ofrece

| Área | Hoy (v100) | Decidido en `reglas-de-negocio.md` |
|---|---|---|
| Costeo | Material, energía, depreciación, gastos fijos e indirectos por hora, mantenimiento, desperdicio, diseño, post-procesado, resina (soportes, IPA, curado), multicolor AMS (gramos por color y purga por cambio), piezas por placa, margen, redondeo a 5 y precio escrito con alerta bajo costo | Empaque por pieza (D25), IVA (D21), canales de marketplace (D23) |
| Cotización | Varias partidas, descuento, comisión, PDF, imagen, texto, WhatsApp, QR, liga pública, editor visual (colores, logo, términos) y datos bancarios | Vigencia (D10), anticipo (D14), plazo de entrega (D15), política de cancelación (D26) |
| Pedidos | Borrador, enviada, aceptada y rechazada; al aceptar descuenta inventario | En producción, entregada y cancelada, pagos y saldo (D11, D12, D16) |
| Clientes | Alta, autocompletado, historial por cliente y WhatsApp | Datos fiscales (D22), recomendador (D31) |
| Inventario | Rollos con gramos restantes, alerta al 20 %, descuento automático | Descuento al producir (D13) |
| Catálogo | Productos con costo calculado o tabla de precios por tamaño; Excel | — |
| Reportes | Panel del mes: ingresos, ganancia, margen, tasa de aceptación, horas y capacidad; 6 meses | Ingreso por pago, por cobrar, IVA cobrado (D19, D44), Excel para el contador (D45) |
| Plataforma | Web instalable, sin conexión, versión de escritorio, tema claro y oscuro, respaldo JSON | Cuentas, Android, invitado, borrar cuenta (D33–D41) |
| Datos del slicer | Se teclean a mano; el tiempo, en horas con decimales | — |

---

## 4. Lo que la app tiene y la competencia no

Son las razones para elegirla. Conviene cuidarlas y decirlas en la tienda.

1. **WhatsApp como canal principal.** Ninguna de las apps de impresión 3D revisadas menciona WhatsApp. La app arma el mensaje con la cotización y abre el chat del cliente ([`js/quotes.js:722`](../js/quotes.js)); en México es como se cotiza.
2. **El ciclo completo para México:** anticipo del 50 %, plazo en días hábiles, vigencia, política de cancelación, IVA y datos para la factura (D10–D27, D21–D22). De las revisadas, solo 3D Print Pricing registra anticipos, y no está pensada para México.
3. **El costo real, no solo el material.** Bugeo, 3DPCC y Printforge incluyen gastos generales; la app además los reparte por hora de impresión y separa mantenimiento, desperdicio, indirectos y diseño.
4. **Multicolor medido.** La purga se calcula por cambio de color con el valor medido en Bambu Studio (0.7 g). De las revisadas, solo 3Dcalc+ menciona la purga.
5. **La placa.** Captura la placa completa y la reparte entre las piezas, con el diseño cobrado una sola vez. Bugeo (piezas por bandeja) y Spool (costo por lote) hacen algo parecido.
6. **Inventario conectado a la cotización:** el filamento se descuenta y se devuelve solo según el estado del pedido.
7. **Funciona sin conexión** y tiene versión de escritorio con el mismo diseño.

---

## 5. Lo que la competencia tiene y la app no

Ordenado por valor para un taller pequeño en México. «Quién» cuenta cuántas de las revisadas lo tienen.

| Función | Quién la tiene | Valor | Esfuerzo | Propuesta |
|---|---|---|---|---|
| **Leer el archivo del slicer** (peso, tiempo, gramos por color y miniatura) | Bugeo, 3Dcalc+, 3D Print Pricing, 3D Print Cost Calculator y Printforge | Alto: quita el paso que más se equivoca y llena solo el multicolor | Medio | P56 |
| **Capturar el tiempo en horas y minutos** | Lo piden los usuarios de dos apps; hoy la app pide horas con decimales | Alto: el slicer dice «54 m 32 s» y hoy hay que convertirlo a 0.91 | Bajo | P57 |
| **Recibo de cada pago** (anticipo y saldo) | 3D Print Pricing, Printforge y AutoQuote3D (facturas y remisiones) | Medio-alto: con anticipo (D14) el cliente pide comprobante | Bajo | P58 |
| **Vista de producción** (pedidos por estado y fecha de entrega) | 3D Print Pricing y Printforge (tablero), 3DPCC (etapas) | Medio-alto: con los estados nuevos hace falta ver la cola | Bajo a medio | P59 |
| **Insumos y herrajes** (imanes, tornillos, argollas) y lista de compras | 3DPCC, 3Dcalc+ y 3D Print Pricing | Medio-alto: hoy se disfrazan de pintura (`MEJORAS.md` 6a) | Bajo; la lista de compras, medio | P60 |
| **Cargos libres en la cotización** (envío, urgencia) | 3D Print Pricing, Spool y PrintCalc | Medio | Bajo | P61 |
| **El cliente acepta desde la liga** | 3D Print Pricing (ve el estado), Printforge y AutoQuote3D (portal) | Alto, pero para después: alguien sin cuenta escribe en la base | Medio-alto | P62 |
| **Cobro en línea** | Printforge y AutoQuote3D (Stripe) | Medio: en México sería Mercado Pago | Medio-alto | P63 |
| **Conexión con impresoras, tiendas en línea y equipo con roles** | Spool, Printago, Printforge, 3D Print Pricing | Variable; lo de roles ya está decidido para después (D36) | Alto | P64 |
| Biblioteca técnica y academia | Bugeo | Bajo para el producto; es estrategia de contenido | — | No se propone |
| Etiquetas NFC en los rollos, secado de filamento | 3D Print Pricing, Spool | Bajo | — | No se propone |

---

## 6. Lo que piden los usuarios de la competencia

Reseñas de Google Play y App Store, en varios idiomas. Lo que ya cubre la app está marcado.

| Petición | Dónde | La app |
|---|---|---|
| Cotización con logo y nombre del taller, ocultar el desglose al cliente, imagen de la pieza | 3Dcalc+, PrintCalc, Bugeo | Logo y ocultar desglose, sí. Imagen, no (P56) |
| Inventario que se descuente solo | 3D Print Cost Calculator | Sí |
| Más rubros: desgaste, mano de obra, merma del AMS, mantenimiento, impuestos | Varias | Sí; impuestos con D21 |
| Precio justo, sin muro de pago | 3D Print Cost Calculator (en 5 idiomas), 3D Print Pricing | Gratis al lanzar (D42) |
| Capturar el tiempo en horas y minutos | 3D Print Cost Calculator, PrintCalc | No (P57) |
| Lotes y producción en volumen | 3Dcalc+, Spool | Sí, con la placa |
| Varios filamentos o marcas en un mismo trabajo | 3Dcalc+, PrintCalc, Bugeo | Sí en multicolor; en una pieza de un color, un solo rollo |
| Más impresoras en la lista inicial | 3D Print Pricing, Spool | Lista de impresoras comunes (D47) |
| Que el desarrollador responda y actualice | Lo más elogiado en tres apps | Depende del canal de comentarios (P65) |

---

## 7. Cómo proceder

1. **Defender lo que ya distingue a la app** (§4). Va en la descripción de la tienda y en las capturas: WhatsApp, anticipo y entrega, y el costo real.
2. **Agregar a la primera versión solo lo barato o lo que los talleres de la prueba van a echar de menos de inmediato** (P56–P61). La decisión D50 dice empezar con lo básico; esto ajusta qué cuenta como básico frente a la competencia.
3. **Dejar para después lo que necesita validación o esfuerzo grande** (P62–P64), y decidirlo con lo que digan los 12 talleres de la prueba cerrada (D48).
4. **Preparar el canal de comentarios antes de la prueba** (P65), porque de ahí sale qué sigue (D50).
5. **Precios, para cuando se definan los planes (D42):** las referencias en México son Bugeo ($39 MXN al mes, $399 al año, $999 de por vida), 3D Print Cost Calculator ($99 trimestral, $199 anual, $599 de por vida) y 3Dcalc+ (alrededor de $90 a $120 MXN, pago único). Las quejas por muro de pago se repiten.
6. **El nombre (P55):** «Costeo 3D» se parecería a 3DCost y a PrintCalc; «Placa 3D» no se parece a ninguna de las revisadas. Se eligió «Placa 3D», provisional (D56).

---

## 8. Fuentes

Comprobadas por el asistente en la fuente oficial: [Bugeo App en App Store (México)](https://apps.apple.com/mx/app/id6760218974) · [3Dcalc+](https://www.3dcalc.app) · [3D Print Pricing](https://3dprintpricing.pro/en) · [3DPCC](https://3dpcc.com) · [Printforge](https://crm.printforge.com.au)

De los reportes de investigación: [Bugeo App en Google Play](https://play.google.com/store/apps/details?id=com.bugeo.app) · [3Dcalc+ en Google Play](https://play.google.com/store/apps/details?id=com.sozolabs.calc3D) · [3DCost](https://play.google.com/store/apps/details?id=com.rosertecnologias.threedcost) · [PrintCalc](https://play.google.com/store/apps/details?id=ar.com.electrogeek.printcalc) · [3D Print Pricing en Google Play](https://play.google.com/store/apps/details?id=com.ivan.calc3dprintflutter) · [3D Print Cost Calculator](https://play.google.com/store/apps/details?id=com.threed_print_calculator) · [Spool](https://play.google.com/store/apps/details?id=com.spool3d.printcost) · [3D Print Costs Calculator (DanVerse)](https://play.google.com/store/apps/details?id=com.danverse.costscalculator) · [AutoQuote3D](https://www.autoquote3d.com) · [3DPrint para WordPress](https://www.wp3dprinting.com) · [Printago](https://www.printago.io)

---

## 9. Preguntas

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P56 | ¿Leer el archivo del slicer en la primera versión? | (a) sí, el 3MF laminado de Bambu Studio y OrcaSlicer | Respondida (a) → D57 |
| P57 | ¿Capturar el tiempo en horas y minutos? | (a) sí, en la primera versión | Respondida (a) → D58 |
| P58 | ¿Recibo de cada pago? | (a) sí, en la primera versión | Respondida (a) → D59 |
| P59 | ¿Vista de producción? | (a) lista por fecha de entrega en la primera; tablero después | Respondida (a) → D60 |
| P60 | ¿Insumos y herrajes? | (a) insumos en la primera; lista de compras después | Respondida (a) → D61 |
| P61 | ¿Cargos libres en la cotización? | (a) sí, en la primera versión | Respondida (a) → D62 |
| P62 | ¿El cliente acepta desde la liga? | (a) lo primero después de la prueba | Respondida (a) → D63 |
| P63 | ¿Cobro en línea? | (a) después, cuando lo pidan | Respondida (a) → D64 |
| P64 | ¿Impresoras, tiendas en línea y roles? | (a) no por ahora | Respondida (a) → D65 |
| P65 | ¿Cómo se recogen los comentarios de la prueba? | (a) grupo de WhatsApp y dos encuestas cortas | Respondida (a) → D66 |

**P56. ¿La app lee el archivo del slicer en la primera versión?** Cinco competidoras lo hacen. Bambu Studio y OrcaSlicer guardan el archivo laminado (`.gcode.3mf`) con el peso por color, el tiempo y una miniatura de la pieza. Ejemplo: en vez de teclear 13.42 g, 54 m 32 s y los gramos de cada color, eliges el archivo y la calculadora se llena sola.
- (a) Sí, en la primera versión: el 3MF laminado de Bambu Studio y OrcaSlicer, con la miniatura en la cotización. El G-code de otros slicers, después.
- (b) Después de la prueba cerrada.
- (c) No: se sigue tecleando.
- **Recomendado: (a).** Los talleres de la prueba lo van a comparar con Bugeo y 3Dcalc+, quita el paso donde más errores hay y llena solo el multicolor. Esfuerzo medio. Es un agregado al corte de D50.
- **Respuesta (2026-10-16): (a) → D57.**

**P57. ¿Se captura el tiempo en horas y minutos?** Hoy el campo pide horas con decimales, y el slicer da «54 m 32 s» o «3 h 17 m». Ejemplo: para 54 m 32 s hay que escribir 0.91.
- (a) Sí, en la primera versión: un campo de horas y otro de minutos.
- (b) Se queda en horas con decimales.
- **Recomendado: (a).** Es poco trabajo y evita errores de conversión; lo piden usuarios de dos competidoras.
- **Respuesta (2026-10-16): (a) → D58.**

**P58. ¿La app genera un recibo de cada pago?** Con el anticipo (D14), el cliente pide comprobante. Ejemplo: te paga $600 de anticipo y le mandas por WhatsApp un recibo que dice cuánto pagó y cuánto falta.
- (a) Sí, en la primera versión: recibo en PDF o imagen, listo para WhatsApp, con lo pagado y el saldo.
- (b) Después.
- **Recomendado: (a).** Usa el mismo motor que ya hace el PDF de la cotización, y no es una factura fiscal (la app no factura, D22).
- **Respuesta (2026-10-16): (a) → D59.**

**P59. ¿Cómo se ven los pedidos en producción?** Con los estados nuevos (D11, D12) hace falta ver la cola. Ejemplo: tienes 6 pedidos aceptados y quieres saber cuál entregar primero.
- (a) En la primera versión, una lista de aceptados y en producción ordenada por fecha de entrega. El tablero que se arrastra por columnas, después.
- (b) El tablero completo en la primera versión.
- (c) Solo los filtros por estado que ya existen.
- **Recomendado: (a).** Resuelve la pregunta de todos los días con poco trabajo; el tablero se agrega si los talleres lo piden.
- **Respuesta (2026-10-16): (a) → D60.**

**P60. ¿La app maneja insumos y herrajes?** Hoy los imanes se capturan como si fueran pintura. Ejemplo: 15 marcos con 4 imanes cada uno, a $4 el imán.
- (a) En la primera versión, un bloque de insumos con nombre, costo unitario y cantidad por pieza. La lista de compras, que cruza pedidos con inventario, después.
- (b) Los dos después.
- **Recomendado: (a).** Ya lo necesitas en tus pedidos, lo tienen tres competidoras y es poco trabajo.
- **Respuesta (2026-10-16): (a) → D61.**

**P61. ¿Se pueden agregar cargos libres a la cotización?** Hoy no hay dónde poner el envío. Ejemplo: un pedido a Monterrey lleva $180 de paquetería.
- (a) Sí, en la primera versión: renglones con concepto y monto (envío, urgencia, diseño extra).
- (b) Después.
- **Recomendado: (a).** Es poco trabajo y hoy obliga a esconder el envío dentro del precio de una pieza.
- **Respuesta (2026-10-16): (a) → D62.**

**P62. ¿El cliente puede aceptar la cotización desde la liga?** Hoy la liga solo muestra la cotización. Ejemplo: el cliente abre la liga en WhatsApp y toca «Aceptar».
- (a) Es lo primero después de la prueba cerrada.
- (b) En la primera versión.
- (c) No.
- **Recomendado: (a).** Tiene mucho valor, pero exige que alguien sin cuenta escriba en la base de datos, con reglas de seguridad más cuidadosas. Mejor hacerlo con la base ya probada.
- **Respuesta (2026-10-16): (a) → D63.**

**P63. ¿Se cobra en línea desde la app?** En México sería con Mercado Pago. Ejemplo: el cliente paga el anticipo con tarjeta desde la liga.
- (a) Después, cuando los talleres de la prueba lo pidan.
- (b) En la primera versión.
- (c) No.
- **Recomendado: (a).** Necesita la aceptación desde la liga (P62) y una cuenta de cobro por taller; hoy el anticipo se paga por transferencia y se registra.
- **Respuesta (2026-10-16): (a) → D64.**

**P64. ¿Conexión con impresoras, tiendas en línea y equipo con roles?** Lo tienen las plataformas grandes (Spool, Printago, Printforge, 3D Print Pricing). Ejemplo: que la app sepa las horas reales que imprimió tu Bambu este mes.
- (a) No por ahora: se revisa con lo que digan los usuarios. Los roles ya están para después (D36).
- (b) Una de ellas en la primera versión: dime cuál.
- **Recomendado: (a).** Cada una es trabajo grande y depende de conexiones de cada marca o tienda que pueden cambiar. La de impresoras es la más interesante para después, porque daría las horas reales del mes, el dato que más pesa en el precio (`MEJORAS.md` 2).
- **Respuesta (2026-10-16): (a) → D65.**

**P65. ¿Cómo se recogen los comentarios de la prueba cerrada?** Es el pendiente de `reglas-de-negocio.md` §4.12, y de ahí sale qué sigue (D50). Ejemplo: un taller quiere decir que le falta algo sin escribirte un correo.
- (a) Un grupo de WhatsApp con los talleres de la prueba, más dos encuestas cortas: a la primera semana y al terminar.
- (b) Un botón «Enviar comentario» dentro de la app.
- (c) Solo el canal de comentarios de Google Play para la prueba.
- **Recomendado: (a).** Con 12 talleres, WhatsApp es donde ya están y deja responder rápido, que es lo más elogiado en las reseñas de la competencia. El botón dentro de la app puede venir después.
- **Respuesta (2026-10-16): (a) → D66.**
