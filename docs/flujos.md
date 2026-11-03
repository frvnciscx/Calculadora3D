# Flujos — primera versión

Qué hace la persona en cada flujo de la primera versión y qué hace la app en cada paso, con su diagrama. Cubre lo que entra a la primera versión según [`reglas-de-negocio.md`](reglas-de-negocio.md) §4.12.

**Actualizado:** 2026-10-19 (los 7 flujos hechos; abiertas P86 y P87, del flujo 7)

**Fuentes:** decisiones D1–D66 de [`reglas-de-negocio.md`](reglas-de-negocio.md) · código v100 revisado el 2026-10-16.

**Relacionados:** [`reglas-de-negocio.md`](reglas-de-negocio.md) · [`competencia.md`](competencia.md) · [`MAPA-DE-SITIO.md`](MAPA-DE-SITIO.md) · [`CLAUDE.md`](../CLAUDE.md)

> **Cómo se lee.** Cada flujo cita las decisiones (D#) de las que sale. Si un flujo choca con una regla, manda la regla y se pregunta. Los diagramas se hacen con `/diagram-design`, en su estilo neutro (decisión de Francisco, 2026-10-15), en tamaño para documento. Son archivos HTML en [`docs/flujos/`](flujos/) que se abren en el navegador.

---

## Índice

| # | Flujo | Sale de | Diagrama | Estado |
|---|---|---|---|---|
| 1 | Estados de la cotización | D6–D9, D11–D13, D16–D18, D67, D68 | [`estados-cotizacion.html`](flujos/estados-cotizacion.html) | Hecho; es el modelo de los demás (D69) |
| 2 | De la calculadora a la cotización: archivo del slicer o captura en horas y minutos, insumos, placa, cargos libres | D57, D58, D61, D62, D72–D74 | [`calculadora-a-cotizacion.html`](flujos/calculadora-a-cotizacion.html) | Hecho |
| 3 | Enviar y aceptar: WhatsApp o liga, vigencia, fecha de entrega | D7, D8, D10, D15, D20, D27, D28, D75, D76 | [`enviar-y-aceptar.html`](flujos/enviar-y-aceptar.html) | Hecho |
| 4 | Pagos: anticipo, saldo, recibo y cancelación con devolución | D12, D14, D17, D19, D26, D59, D75, D77–D79 | [`pagos.html`](flujos/pagos.html) | Hecho |
| 5 | Producción y entrega: lista por fecha, empezar y entregar | D11, D13, D60, D68, D80–D82 | [`produccion-y-entrega.html`](flujos/produccion-y-entrega.html) | Hecho |
| 6 | Cuentas: entrar, confirmar el correo, cerrar sesión, otro dispositivo y borrar la cuenta | D37, D39–D41, D49, D53, D83–D86 | [`cuentas.html`](flujos/cuentas.html) | Hecho; rehecho con D84 el 2026-10-19 |
| 7 | Arranque de un negocio nuevo | D47, D84–D86 | [`arranque.html`](flujos/arranque.html) | Hecho; preguntas P86 y P87 |

---

## 1. Estados de la cotización

**Diagrama:** [`flujos/estados-cotizacion.html`](flujos/estados-cotizacion.html) — diagrama de estados con el patrón de ciclo de vida: cinco fases principales de izquierda a derecha y dos salidas finales abajo.

### Qué muestra

- **Cinco fases principales:** Borrador, Enviada, Aceptada, En producción y Entregada (D1, D6, D11, D12).
- **Dos salidas finales:** Rechazada, antes de aceptar, y Cancelada, después (D8, D16).
- **Una regla para todos:** desde cualquier estado se puede regresar un paso (D18). Va como nota y no como flecha desde cada estado, para que el diagrama se lea.
- **Entregada va en color** porque es el final que se busca; es el único elemento resaltado.

### Transiciones

| Desde | Acción | Hacia | Qué hace la app | Sale de |
|---|---|---|---|---|
| — | Crear la cotización | Borrador | — | D6 |
| Borrador | Enviar: tocar WhatsApp o Link, o «Marcar como enviada» | Enviada | El PDF y la imagen no cambian el estado | D7 |
| Enviada | Editar | Borrador | Lo que tiene el cliente ya no coincide; hay que reenviarla | D9 |
| Borrador | Aceptar, por ejemplo en mostrador | Aceptada | Igual que desde Enviada | D8 |
| Enviada | Aceptar | Aceptada | Guarda la fecha de aceptación. El plazo se vuelve fecha de entrega cuando llega el anticipo, o de inmediato si no se pide | D8, D15, D20 |
| Borrador o Enviada | Rechazar | Rechazada | — | D8 |
| Aceptada | Empezar producción | En producción | Descuenta el filamento. Si falta el anticipo, avisa y deja seguir | D11, D13 |
| En producción | Entregar | Entregada | Si queda saldo, la tarjeta dice «Entregada · saldo $X» | D12 |
| Aceptada o En producción | Cancelar | Cancelada | Propone cuánto anticipo devolver según la ventana de 2 días hábiles. Desde En producción, el filamento no vuelve | D16, D17, D26 |
| Cualquiera | Regresar un paso | El estado del que vino | Deshace lo que pasó al avanzar: el filamento vuelve y las fechas se borran. Los pagos se quedan | D18 |

### Lo que no es un estado, a propósito

- **Vencida:** la vigencia es un aviso en la lista; la cotización sigue Enviada (D10).
- **Pagada o con saldo:** los pagos van aparte del estado (D12), y el flujo 4 los cubre.
- **Editar una cotización aceptada:** no se puede (§4.1 de las reglas). Para cambiar un pedido aceptado se regresa a Enviada, se edita y se vuelve a aceptar; el anticipo se queda (D67).
- **Entregada en parte:** no existe en la primera versión; el pedido se entrega completo (D68).

---

## 2. De la calculadora a la cotización

**Diagrama:** [`flujos/calculadora-a-cotizacion.html`](flujos/calculadora-a-cotizacion.html) — diagrama de decisiones, de arriba hacia abajo.

### Qué muestra

- **Cada pieza entra de dos formas:** leyendo el archivo laminado del slicer (D57) o a mano, con el tiempo en horas y minutos (D58).
- **Los dos caminos se juntan** en «Completar y agregar»: impresora, rollos, insumos (D61), margen y cantidad. La placa se reparte entre sus piezas, como hoy (`js/costing.js`).
- **«¿Otra pieza?»** regresa al inicio. Cuando ya no hay más, se arma la cotización.
- **Termina en Borrador,** donde sigue el flujo 1. Es lo que va en color.

### Pasos

| Paso | Qué hace la persona | Qué hace la app | Sale de |
|---|---|---|---|
| Leer el archivo | Elige el `.gcode.3mf` de Bambu Studio u OrcaSlicer; si trae varias placas, elige una | Llena el peso por color, el tiempo y la miniatura; propone las piezas con los objetos de la placa y el rollo de cada color | D57, D72–D74 |
| Capturar a mano | Escribe el peso, las horas y los minutos, y las piezas de la placa | Pasa el tiempo a horas para el cálculo; avisa si falta un dato | D58 |
| Completar y agregar | Elige impresora, rollos, insumos, margen y cantidad; puede escribir el precio | Calcula en vivo y avisa si el precio escrito queda bajo el costo | D61; v100 |
| Armar la cotización | Elige cliente; agrega cargos libres, descuento y comisión del recomendador; revisa anticipo y plazo | Muestra el total, el anticipo, el plazo y la vigencia | D10, D14, D15, D62 |
| Guardar | — | Crea el Borrador con su folio | D6 |

### A confirmar al implementar

- **La purga en el archivo.** Si el peso por color del archivo ya incluye la purga y la torre de limpieza, la app no suma la purga estimada (cambios de color × 0.7 g), para no cobrarla dos veces. `MEJORAS.md` 6b dice que el total del slicer las incluye; se confirma con un archivo real antes de programarlo (derivada).

---

## 3. Enviar y aceptar

**Diagrama:** [`flujos/enviar-y-aceptar.html`](flujos/enviar-y-aceptar.html) — diagrama de decisiones, de arriba hacia abajo.

### Qué muestra

- **Compartir** por WhatsApp o con la liga pasa la cotización a Enviada (D7).
- **El cliente responde de tres formas:** pide cambios y se regresa a Borrador (D9), rechaza, o acepta.
- **Al aceptar,** si la cotización pide anticipo, se registra cuando llega; si no, se sigue de inmediato. Los dos caminos se juntan en fijar la fecha de entrega (D15, D20, D27).
- **Termina en Aceptada con fecha,** donde sigue el flujo 5. Es lo que va en color.
- **La nota al margen** recuerda que la vigencia no es un estado: si el cliente no contesta, la lista avisa al vencer (D10).

### Pasos

| Paso | Qué hace la persona | Qué hace la app | Sale de |
|---|---|---|---|
| Compartir | Toca WhatsApp o Link, o «Marcar como enviada» si la mandó por otro medio | Pasa la cotización a Enviada. El PDF y la imagen no cambian el estado | D7 |
| Esperar respuesta | — | Cuenta la vigencia desde la fecha de la cotización y avisa en la lista cuando vence | D10, D28 |
| Pide cambios | Edita la cotización | La regresa a Borrador con la fecha renovada; hay que volver a compartirla | D9, D28 |
| Rechaza | Toca «Rechazar» y, si quiere, elige el motivo | La pasa a Rechazada y cuenta el motivo en el panel | D8, D76 |
| Acepta | Toca «Aceptar». También se puede aceptar un Borrador sin haberlo enviado, por ejemplo en mostrador | Guarda la fecha de aceptación | D8 |
| Registrar el anticipo | Registra el pago con su monto y su fecha | Hace el recibo para WhatsApp y calcula el saldo. Si el pago no cubre el anticipo, dice cuánto falta y el plazo todavía no corre | D12, D14, D59, D75 |
| Fijar fecha de entrega | Puede cambiar la fecha que propone la app | Suma el plazo en días hábiles a la fecha del anticipo, o a la de aceptación si no se pide anticipo | D15, D20, D27 |

Mientras no llega el anticipo, la tarjeta muestra el plazo y no una fecha («5 días hábiles después del anticipo»; §4.4 de las reglas).

---

## 4. Pagos

**Diagrama:** [`flujos/pagos.html`](flujos/pagos.html) — diagrama de estados del pago, aparte del estado de la cotización (D12).

### Qué muestra

- **Cuatro estados del pago,** de izquierda a derecha: Esperando anticipo, Anticipo incompleto, Con saldo y Pagada.
- **Un pago menor que el anticipo** deja el pago en Anticipo incompleto y el plazo no corre (D75). Cuando lo pagado llega al anticipo, pasa a Con saldo y corre el plazo (D20).
- **Abonos:** el saldo se puede pagar en partes sin cambiar de estado.
- **Pagada va en color:** es el final que se busca.
- **Cancelar con pagos hechos** lleva a la devolución: todo si se cancela dentro de los 2 días hábiles, y después la app propone $0, que se puede cambiar (D17, D26).
- **Dos notas para todos los estados:** cada pago genera su recibo y cuenta en el mes en que entra (D19, D59), y si la cotización no pide anticipo, el pago empieza en Con saldo (D14).

### Pasos

| Situación | Qué hace la persona | Qué hace la app | Sale de |
|---|---|---|---|
| Registrar un pago | Escribe el monto, la fecha y la forma de pago | Hace el recibo para WhatsApp, recalcula el saldo y cambia el estado del pago | D12, D59, D77 |
| Corregir un pago | Borra el pago equivocado, con confirmación | Anula su recibo, que queda en el historial, y recalcula el saldo | D78 |
| Pago menor que el anticipo | — | Deja el pago en Anticipo incompleto y dice cuánto falta; el plazo no corre | D75 |
| Se cubre el anticipo | — | Pasa a Con saldo y fija la fecha de entrega con el plazo en días hábiles | D20, D27, D75 |
| Abono al saldo | Registra el pago | Sigue en Con saldo, con su recibo | D12, D59 |
| Liquidar | Registra el último pago | Pasa a Pagada; si ya estaba Entregada, la tarjeta deja de mostrar saldo | D12 |
| Cancelar con pagos | Cancela el pedido (flujo 1) | Propone la devolución según la ventana de 2 días hábiles, contada desde el pago que completó el anticipo, y la registra como un movimiento negativo en el mes en que se hace | D17, D19, D26, D79 |
| Sin anticipo | — | Empieza en Con saldo, y «Empezar producción» no avisa nada | D11, D14 |

### Cómo cuenta en el panel

- **Ingreso del mes:** los pagos que entraron ese mes menos las devoluciones de ese mes (D19, derivada de D17).
- **Ganancia:** cada pago trae su parte proporcional de la ganancia del pedido (D29).
- **Fuera del ingreso:** la parte de la comisión del recomendador (D30) y el IVA cobrado (D44).

### Reglas que salen del diagrama (derivadas)

- Un pago no puede ser mayor que el saldo; si el cliente da de más, se registra el saldo exacto.
- Si se cancela un pedido ya pagado por completo, la devolución sigue la misma ventana de 2 días hábiles.

---

## 5. Producción y entrega

**Diagrama:** [`flujos/produccion-y-entrega.html`](flujos/produccion-y-entrega.html) — diagrama de decisiones, de arriba hacia abajo.

### Qué muestra

- **Se empieza desde la lista** de pedidos ordenada por fecha de entrega (D60).
- **Antes de descontar,** la app revisa si el filamento de cada rollo alcanza. Si no, se elige otro rollo para lo que falta (D80).
- **Al empezar se descuenta el filamento** (D13); vuelve si se regresa un paso (D18).
- **Se imprime fuera de la app** y se entrega el pedido completo, sin entregas parciales (D68).
- **Entregada va en color:** es el final que se busca. Si queda saldo, sigue el flujo 4.
- **Dos notas:** si falta el anticipo, «Empezar producción» avisa y deja seguir (D11); si una pieza falla, el filamento extra se descuenta a mano en Inventario, como hoy (D81).

### Pasos

| Paso | Qué hace la persona | Qué hace la app | Sale de |
|---|---|---|---|
| Ver la cola | Abre la lista de producción | Muestra los aceptados y en producción, ordenados por fecha de entrega; al final, en un grupo aparte, los que esperan anticipo, con cuánto falta | D60, D82 |
| Empezar producción | Toca «Empezar producción» | Avisa si falta el anticipo, revisa el filamento de cada rollo y lo descuenta | D11, D13 |
| Si no alcanza el filamento | Elige otro rollo para lo que falta | Descuenta de los dos rollos | D80 |
| Imprimir y terminar | Imprime, pinta y empaca, fuera de la app | — | — |
| Si una pieza falla | Descuenta el filamento extra en Inventario | — | D81 |
| Entregar | Toca «Entregar» cuando entrega todo el pedido | Pasa a Entregada; si queda saldo, la tarjeta lo dice | D12, D68 |

---

## 6. Cuentas

**Diagrama:** [`flujos/cuentas.html`](flujos/cuentas.html) — entrar a la app, como diagrama de decisiones. Los demás caminos de la cuenta van en tabla porque son pasos en línea, sin decisiones.

### Qué muestra

- **Tres formas de entrar:** correo, Google (D37) o sin cuenta (D39).
- ~~**El invitado puede crear su cuenta después,** y sus datos se suben solos (D40).~~ ~~**Si hay datos en el teléfono y en la cuenta,** la app pregunta qué conservar antes de juntar nada (D40).~~ Cambió el 2026-10-19 con D84; el diagrama se rehízo ese día.
- **Sin cuenta se usa la calculadora** y se arma la cotización; **al guardarla, la app pide entrar** o crear la cuenta (D84, confirmado en D85).
- **Si la cuenta ya tiene datos,** se usan los suyos sin preguntar y se agrega la cotización en curso (D86). **Si es nueva,** se suben los ajustes hechos sin cuenta y la cotización en curso (D40, D84).
- **Con correo y contraseña,** la app recuerda confirmar el correo, sin bloquear (D53).
- **Termina en «Con tu cuenta»,** con los mismos datos en la web y en Android (D49).

### Los demás caminos de la cuenta

| Camino | Pasos | Sale de |
|---|---|---|
| Olvidé mi contraseña | En la pantalla de acceso, «Olvidé mi contraseña»; Firebase manda un correo para crear una nueva | Firebase Auth (derivada) |
| Entrar en otro dispositivo | Se entra con la misma cuenta y la app baja los datos. Sin conexión, sigue trabajando con la copia del teléfono | D49, §4.10 de las reglas |
| Cerrar sesión | Ajustes › Cuenta › «Cerrar sesión». Los datos se borran del teléfono y siguen en la cuenta; si hay cambios sin subir, la app avisa y no cierra sesión hasta subirlos | D83 |
| Borrar la cuenta | Ajustes › Cuenta › «Borrar cuenta» → la app ofrece descargar el respaldo → se confirma → si se entró hace mucho, pide entrar otra vez → se borran los datos y la cuenta → vuelve a la pantalla de acceso. También se puede pedir desde una página web, como exige Google Play | D41, §4.10 y §4.13 de las reglas |
| ~~Invitado que cambia de teléfono~~ | ~~La app le recuerda que sus datos están solo en ese teléfono y le ofrece crear la cuenta o exportar el respaldo~~. Sin efecto desde D84: sin cuenta no se guardan cotizaciones | ~~D39~~ D84 |

---

## 7. Arranque de un negocio nuevo

**Diagrama:** [`flujos/arranque.html`](flujos/arranque.html) — diagrama de decisiones, de arriba hacia abajo.

### Qué muestra

- **Cuándo pasa:** la primera vez que se abre la app, o al crear una cuenta nueva sin ajustes en el teléfono. Una cuenta que ya tiene datos no pasa por aquí: usa sus propios ajustes (D86).
- **Una introducción corta,** que se puede saltar. Cuántos pasos lleva se pregunta en P87.
- **Impresoras de una lista de comunes** (D47). Si la suya no está, la agrega a mano con potencia, costo y vida útil.
- **Materiales con precio de referencia,** que se puede cambiar (D47).
- **Gastos del mes:** gastos fijos y horas de impresión al mes (D47). La nota al margen recuerda que las horas son el dato que más pesa en el precio (`MEJORAS.md` 2). Qué pasa si no los sabe se pregunta en P86.
- **Termina con la calculadora lista,** donde sigue el flujo 2. Sin clientes de ejemplo (D47).

### Pasos

| Paso | Qué hace la persona | Qué hace la app | Sale de |
|---|---|---|---|
| Introducción | Lee o salta | Explica el costo real y el camino del slicer a la cotización | P87 |
| Elegir impresoras | Marca las suyas en la lista, o agrega la suya a mano | Carga su potencia, costo y vida útil de referencia, que se pueden cambiar | D47 |
| Elegir materiales | Marca los que usa y ajusta el precio si quiere | Carga el precio por kilo de referencia | D47 |
| Gastos del mes | Escribe sus gastos fijos y sus horas de impresión al mes | Calcula el costo por hora que se reparte en cada pieza | D47, P86 |
| Listo | — | Abre la calculadora. Sin cuenta, guardar la primera cotización pide entrar (D84) | D84, D85 |

### Cambia con este flujo (derivadas)

- Los valores iniciales de hoy (las 4 impresoras de La Casita del Molde, sus precios, $2,000 de gastos fijos inventados y dos clientes de ejemplo, [`js/store.js:52`](../js/store.js)) se reemplazan por la lista de comunes y lo que el taller escriba.
- La introducción de hoy tiene 5 pasos que solo explican ([`js/onboarding.js`](../js/onboarding.js)); dos ya no corresponden: el 4 dice que se copia el peso del slicer (con D57 se lee el archivo) y el 5 que al aceptar se descuenta el inventario (con D13 es al empezar producción).

---

## Preguntas

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P66 | Cómo se cambia un pedido ya aceptado | (a) regresar un paso, editar y volver a aceptar | Respondida (a) → D67 |
| P67 | ¿Entregas parciales en la primera versión? | (a) no; se entrega todo junto | Respondida (a) → D68 |
| P68 | ¿El diagrama sirve de modelo para los otros 6? | (a) sí, mismo estilo y nivel de detalle | Respondida (a) → D69 |
| P71 | Qué pasa si el archivo trae varias placas | (a) se elige una; cada placa es un cálculo | Respondida (a) → D72 |
| P72 | ¿La app propone las piezas de la placa? | (a) sí, con los objetos del archivo, y tú confirmas | Respondida (a) → D73 |
| P73 | Cómo se asignan los rollos a los colores del archivo | (a) la app propone y tú confirmas | Respondida (a) → D74 |
| P74 | ¿El plazo corre con cualquier pago o con el anticipo completo? | (a) cuando lo pagado llega al anticipo pedido | Respondida (a) → D75 |
| P75 | ¿Se anota por qué rechazó el cliente? | (a) sí, un motivo opcional de una lista corta | Respondida (a) → D76 |
| P76 | ¿Se registra la forma de pago? | (a) sí: efectivo, transferencia, tarjeta u otro | Respondida (a) → D77 |
| P77 | Cómo se corrige un pago registrado por error | (a) se borra con confirmación y su recibo queda anulado | Respondida (a) → D78 |
| P78 | Desde cuándo cuenta la ventana de 2 días si el anticipo se pagó en partes | (a) desde el pago que lo completa | Respondida (a) → D79 |
| P79 | Qué pasa si no alcanza el filamento del rollo | (a) avisa y deja elegir otro rollo para lo que falta | Respondida (a) → D80 |
| P80 | Cómo se registra una pieza que falló | (a) a mano en Inventario, como hoy | Respondida (a) → D81 |
| P81 | ¿La lista de producción muestra los pedidos que esperan anticipo? | (a) sí, en un grupo aparte al final | Respondida (a) → D82 |
| P82 | Qué pasa con los datos del teléfono al cerrar sesión | (a) se borran del teléfono, después de subir lo pendiente | Respondida (a) → D83 |
| P83 | Qué opciones da la app si hay datos en el teléfono y en la cuenta | (a) «Juntar» o «Quedarme con los de la cuenta» | Respondida con otra regla → D84 · sus opciones quedan sin efecto |
| P84 | ¿Se interpretó bien D84? | (a) sin cuenta se calcula y se arma; guardar o enviar pide entrar | Respondida (a) → D85 |
| P85 | Qué pasa con los ajustes hechos sin cuenta al entrar a una cuenta con datos | (a) se quedan los de la cuenta, sin preguntar | Respondida (a) → D86 |
| P86 | Qué pasa si el taller no sabe sus gastos fijos o sus horas al mes | (a) se puede dejar para después, con un aviso en la calculadora | Abierta |
| P87 | Cuántos pasos lleva la introducción | (a) tres pasos cortos, y la configuración aparte | Abierta |

**P66. ¿Cómo se cambia un pedido ya aceptado?** Una aceptada no se puede editar. Ejemplo: el cliente ya pagó el anticipo de 8 herraduras y ahora quiere 10.
- (a) Se regresa un paso a Enviada, se edita (pasa a Borrador), se reenvía y se vuelve a aceptar. El anticipo se queda registrado y el saldo se recalcula con el total nuevo.
- (b) Se permite editar la aceptada, con un aviso de que cambian el total y el saldo.
- **Recomendado: (a).** Ya funciona así con las reglas decididas (D9, D18) y el cliente ve el precio nuevo antes de que imprimas. Son más pasos, pero no hay que construir nada aparte.
- **Respuesta (2026-10-16): (a) → D67.**

**P67. ¿Hay entregas parciales en la primera versión?** Ejemplo: de 16 herraduras entregas 8 el viernes y 8 el lunes.
- (a) No: el pedido pasa a Entregada cuando se entrega todo; lo parcial se anota en las notas.
- (b) Sí: se marca cuántas piezas de cada partida se entregaron.
- **Recomendado: (a).** Mantiene un solo estado por pedido. Si los talleres de la prueba lo piden, se agrega después (D50).
- **Respuesta (2026-10-16): (a) → D68.**

**P68. ¿El diagrama sirve de modelo para los otros 6 flujos?** Es la vista de prueba antes de hacer los demás.
- (a) Sí: mismo estilo y nivel de detalle.
- (b) Con cambios: dime cuáles (más o menos detalle, otro tipo de diagrama, en tablas en lugar de dibujos).
- **Recomendado: (a)**, si se entiende sin explicación. Los flujos 2, 3 y 6 llevarían un diagrama de decisiones, porque tienen caminos que se separan (archivo o captura a mano, con o sin anticipo, invitado o cuenta), y el 4, uno de estados de los pagos.
- **Respuesta (2026-10-16): (a) → D69.**

**P71. ¿Qué pasa si el archivo trae varias placas?** Bambu Studio puede guardar una placa o todas en el mismo archivo. Ejemplo: un pedido de llaveros en dos placas, una de 30 y otra de 12.
- (a) Al abrir el archivo se elige una placa; cada placa es un cálculo y cada una se agrega a la orden.
- (b) Se suman todas las placas en un solo cálculo.
- **Recomendado: (a).** Cada placa tiene su propio tiempo y sus propias piezas; sumarlas mezcla precios por pieza distintos.
- **Respuesta (2026-10-16): (a) → D72.**

**P72. ¿La app propone cuántas piezas trae la placa?** El archivo lista los objetos de cada placa. Ejemplo: abres una placa con 30 llaveros y el campo «Piezas» ya dice 30.
- (a) Sí: propone el número de objetos de la placa y tú lo confirmas o lo cambias.
- (b) No: siempre se escribe a mano.
- **Recomendado: (a).** Evita el error que más caro salió en v100, cotizar la placa como si fuera una pieza. Se confirma con un archivo real que el dato venga ahí.
- **Respuesta (2026-10-16): (a) → D73.**

**P73. ¿Cómo se asignan los rollos a los colores del archivo?** El archivo dice el material y el color de cada filamento, pero no de qué rollo de tu inventario sale. Ejemplo: el archivo usa PLA cian y PLA blanco, y en tu inventario hay dos rollos cian.
- (a) La app propone el rollo que coincide en material y color, y tú confirmas o cambias cada uno.
- (b) Eliges cada rollo a mano.
- **Recomendado: (a).** Casi siempre acierta y deja corregir; con dos rollos iguales propone el que tiene menos filamento, para terminarlo primero.
- **Respuesta (2026-10-16): (a) → D74.**

**P74. ¿El plazo de entrega corre con cualquier pago o solo con el anticipo completo?** Ejemplo: la cotización pide 50 % de anticipo ($600) y el cliente te paga $300.
- (a) Solo cuando lo pagado llega al anticipo pedido; mientras, la tarjeta dice cuánto falta para empezar a contar.
- (b) Con el primer pago, aunque sea menor.
- **Recomendado: (a).** Es lo que dice la cotización («a partir del anticipo») y protege tu plazo si el cliente paga en partes.
- **Respuesta (2026-10-16): (a) → D75.**

**P75. ¿Se anota por qué rechazó el cliente?** Ejemplo: tres cotizaciones rechazadas este mes, y quieres saber si fue por precio.
- (a) Sí: al rechazar, un motivo opcional de una lista corta (precio, tiempo de entrega, no contestó, otro), y el panel los cuenta.
- (b) No: solo se marca rechazada.
- **Recomendado: (a).** Es un campo y una cuenta, y es el dato que dice si tus precios se están quedando altos. Si prefieres no agregarlo a la primera versión, se queda para después.
- **Respuesta (2026-10-16): (a) → D76.** Entra a la primera versión.

**P76. ¿Se registra la forma de pago?** Ejemplo: tu contador te pide cuánto entró en efectivo y cuánto por transferencia.
- (a) Sí: al registrar un pago se elige efectivo, transferencia, tarjeta u otro, y aparece en el recibo y en el Excel del mes.
- (b) No: solo monto y fecha.
- **Recomendado: (a).** Es un campo más y es lo primero que pide un contador; el Excel de D45 lo necesita.
- **Respuesta (2026-10-16): «si» → D77.**

**P77. ¿Cómo se corrige un pago registrado por error?** Regresar un paso no toca los pagos (D18). Ejemplo: registraste $600 y eran $60.
- (a) El pago se puede borrar, con confirmación; su recibo queda anulado y el saldo se recalcula.
- (b) No se borra: se registra un ajuste negativo.
- **Recomendado: (a).** Es lo más claro para un taller pequeño. El recibo anulado queda en el historial del pedido para que no se pierda el rastro.
- **Respuesta (2026-10-16): (a) → D78.**

**P78. ¿Desde cuándo cuenta la ventana de 2 días hábiles si el anticipo se pagó en partes?** Ejemplo: pide 50 % ($600); el cliente paga $300 el lunes y $300 el jueves, y cancela el viernes.
- (a) Desde el pago que completa el anticipo (el jueves): el viernes sigue dentro de la ventana y se le devuelve todo.
- (b) Desde el primer pago (el lunes): la ventana cerró el miércoles y ya no se le devuelve.
- **Recomendado: (a).** Es cuando corre el plazo y empiezas a producir (D75); antes no has invertido material ni horas de máquina.
- **Respuesta (2026-10-16): (a) → D79.**

**P79. ¿Qué pasa si no alcanza el filamento del rollo?** Ejemplo: el pedido necesita 220 g de PLA cian y el rollo tiene 150 g.
- (a) La app avisa y deja elegir otro rollo para los 70 g que faltan; descuenta de los dos.
- (b) Avisa y deja el rollo en negativo, para corregirlo después.
- (c) No deja empezar hasta que haya filamento.
- **Recomendado: (a).** Es lo que pasa en el taller: terminas un rollo y sigues con otro. El inventario queda exacto.
- **Respuesta (2026-10-16): (a) → D80.**

**P80. ¿Cómo se registra una pieza que falló?** Ejemplo: una herradura sale mal y la reimprimes.
- (a) En la primera versión, a mano en Inventario con «Descontar», como hoy.
- (b) Un botón «Reimprimir» en el pedido, que descuenta otra vez el filamento de esa pieza y lo anota.
- **Recomendado: (a)** para la primera versión. (b) permitiría medir la merma real y ajustar el porcentaje de desperdicio, una idea que ya está en `MEJORAS.md`; conviene agregarlo si los talleres de la prueba lo piden.
- **Respuesta (2026-10-16): (a) → D81.**

**P81. ¿La lista de producción muestra los pedidos aceptados que esperan el anticipo?** Todavía no tienen fecha de entrega (D75). Ejemplo: aceptaron el lunes y el anticipo no ha llegado.
- (a) Sí, en un grupo aparte al final, con cuánto falta de anticipo.
- (b) No: aparecen hasta que se cubre el anticipo.
- **Recomendado: (a).** Así no se te olvida cobrarlos, y la lista sigue ordenada por fecha para los que ya corren.
- **Respuesta (2026-10-16): (a) → D82.**

**P82. ¿Qué pasa con los datos del teléfono al cerrar sesión?** Siguen en la cuenta; la pregunta es si se quedan también en el teléfono. Ejemplo: prestas o vendes el teléfono.
- (a) Se borran del teléfono. Si hay cambios que no se han subido por falta de conexión, la app avisa y no cierra sesión hasta subirlos.
- (b) Se quedan en el teléfono, ocultos hasta que vuelvas a entrar.
- **Recomendado: (a).** Son datos de tus clientes, y el aviso evita perder lo que hiciste sin señal.
- **Respuesta (2026-10-19): (a) → D83.**

**P83. Si hay datos en el teléfono y en la cuenta, ¿qué opciones da la app?** Ejemplo: usaste la app como invitado una semana, con 5 cotizaciones, y entras a tu cuenta, que ya tiene 40.
- (a) Dos opciones: «Juntar», que agrega las 5 del teléfono a la cuenta con folio nuevo, y «Quedarme con los de la cuenta», que descarta las del teléfono después de ofrecer el respaldo. Los ajustes, impresoras y materiales se quedan los de la cuenta.
- (b) Solo «Quedarme con los de la cuenta».
- (c) Las dos de (a), más «Reemplazar la cuenta con los del teléfono».
- **Recomendado: (a).** El folio nuevo evita dos COT-0003. (c) es justo el riesgo que encontró la auditoría: un teléfono que borra una cuenta con datos.
- **Respuesta (2026-10-19):** «Para crear las cotizaciones se debe iniciar sesión» → D84. Sin cuenta ya no hay cotizaciones que juntar, así que estas opciones quedan sin efecto. Cómo se interpretó, en P84; qué pasa con los ajustes hechos sin cuenta, en P85.

**P84. ¿Se interpretó bien tu respuesta «Para crear las cotizaciones se debe iniciar sesión»?** Quedó anotada como D84 con esta interpretación: sin cuenta se usa la calculadora y se arma la cotización, y al guardarla o enviarla la app pide entrar. Ejemplo: alguien descarga la app, calcula un llavero y lo agrega a una orden; al tocar «Guardar cotización», la app le pide crear su cuenta.
- (a) Sí: sin cuenta se calcula y se arma; guardar o enviar pide entrar, y la cotización en curso pasa a la cuenta.
- (b) Sin cuenta solo se calcula una pieza; agregar a la orden ya pide entrar.
- (c) Sin cuenta no se usa nada: la cuenta se pide al abrir la app.
- **Recomendado: (a).** Deja probar lo que distingue a la app, el costo real, y pide la cuenta justo cuando la persona ya quiere guardar algo, sin perder lo que capturó.
- **Respuesta (2026-10-19): (a) → D85.** Confirma D84.

**P85. ¿Qué pasa con los ajustes hechos sin cuenta al entrar a una cuenta que ya tiene datos?** Son impresoras, materiales y gastos. Ejemplo: sin cuenta agregaste tu impresora para probar, y al entrar tu cuenta ya tiene tres impresoras configuradas.
- (a) Se quedan los de la cuenta, sin preguntar; solo la cotización en curso se agrega a la cuenta.
- (b) La app pregunta si usar los del teléfono o los de la cuenta, como decía D40.
- **Recomendado: (a).** Lo que se configura sin cuenta es de prueba y la cuenta es la que lleva el negocio; una pregunta menos en el momento de entrar.
- **Respuesta (2026-10-19): (a) → D86.**

**P86. ¿Qué pasa si el taller no sabe sus gastos fijos o sus horas de impresión al mes?** Ejemplo: un taller que empieza no sabe cuántas horas imprime al mes.
- (a) Puede dejarlo para después. Mientras falten, la calculadora avisa «Tus precios todavía no incluyen gastos fijos», con un acceso para llenarlos.
- (b) Es obligatorio para terminar el arranque.
- (c) La app propone valores de referencia que se pueden cambiar.
- **Recomendado: (a).** No frena a quien quiere probar, y el aviso es honesto: (c) repetiría el problema de los $2,000 inventados de hoy (`MEJORAS.md` 8), y (b) obliga a inventar un número.

**P87. ¿Cuántos pasos lleva la introducción?** Hoy son 5 pantallas que solo explican, y el arranque suma tres pantallas de configuración. Ejemplo: alguien descarga la app y quiere calcular su primera pieza.
- (a) Tres pasos cortos (el costo real, del slicer a la cotización, y cómo se cobra con anticipo), y la configuración aparte.
- (b) Los 5 de hoy, corregidos, más la configuración.
- (c) Sin introducción: se explica en cada pantalla, cuando hace falta.
- **Recomendado: (a).** Ocho pantallas antes de calcular son muchas; tres explican lo que distingue a la app y el resto se aprende usándola. Es un agregado mío sobre D47: si prefieres (c), se quita en un minuto.
