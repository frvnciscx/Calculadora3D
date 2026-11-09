# Reglas de negocio — Cotizador 3D

Qué regla manda en cada paso de una cotización: qué acción la mueve de estado, cuándo se cobra el anticipo, cuándo se entrega, cómo entran el IVA, las comisiones y el empaque, y cómo funcionan las cuentas en las tiendas. Es la base para `flujos.md` y [`modelo-de-datos.md`](modelo-de-datos.md).

Desde D33, Notion sale del proyecto: los datos y las cuentas van en Firebase y la app se publica en las tiendas.

**Actualizado:** 2026-11-09 (D104–D112, de la integración de Firebase; antes, D87–D103: arranque de un negocio nuevo, modelo de datos y limpieza del repositorio; van 112 decisiones; las reglas de negocio se cerraron el 2026-10-16 y desde entonces suman las de `flujos.md`, `modelo-de-datos.md` y de publicación)

**Fuentes:** código v100 (`main`, commit `7cc4b14`) revisado el 2026-10-16 · decisiones del cotizador en el repo del Asistente (`docs/projects/cotizador/README.md`, 2026-10-15) · [`AUDITORIA-UX.md`](AUDITORIA-UX.md) · respuestas de Francisco a P1–P65 (2026-10-16) · requisitos de publicación de Apple y Google, y planes de Firebase, revisados el 2026-10-16 (fuentes en §4.10).

**Relacionados:** [`modelo-de-datos.md`](modelo-de-datos.md) · [`BASE-DE-DATOS.md`](BASE-DE-DATOS.md) · [`MAPA-DE-SITIO.md`](MAPA-DE-SITIO.md) · [`AUDITORIA-UX.md`](AUDITORIA-UX.md) · [`CLAUDE.md`](../CLAUDE.md)

> **Cómo se trabaja este documento.** Preguntas en bloques de 10 con la opción recomendada. Cada respuesta se convierte en una decisión (D#) con fecha y quién la tomó, y la regla se escribe en su tema (§4). Nada se borra: una pregunta respondida se marca con la decisión que produjo, y una decisión superada se tacha con el motivo.

---

## 1. Alcance

| Tema | Preguntas | Estado |
|---|---|---|
| Ciclo de vida: qué acción mueve cada estado | P1–P8, P11, P13 → D6–D13, D16, D18 | Respondido |
| Anticipo y pagos | P7, P9, P12, P21 → D12, D14, D17, D26 | Respondido |
| Fecha de entrega | P10, P15, P22 → D15, D20, D27 | Respondido |
| Vigencia | P5, P23 → D10, D28 | Respondido |
| Ingresos y ganancia del panel | P14, P24, P25 → D19, D29, D30 | Respondido |
| IVA y datos fiscales | P16, P17, P27 → D21, D22, D32 | Respondido |
| Comisiones: marketplace y recomendación | P18, P19, P25, P26 → D23, D24, D30, D31 | Respondido |
| Empaque por pieza | P20 → D25 | Respondido |
| ~~Qué se registra en Notion~~ | P28–P30 → D33 | Sale del proyecto: los datos van en Firebase (D33) |
| Cuentas, acceso y tiendas | P31–P40 → D34–D43 | Respondido |
| Cierre: IVA cobrado, exportar para el contador, base por negocio, arranque de un negocio nuevo, cuenta de desarrollador, versión web, primera versión y aviso de privacidad | P41–P48 → D44–D51 | Respondido |
| Revisión de dominio y gestión de usuarios, que pidió Francisco en P46 | P49–P54 → D52–D55 | Respondido |
| Nombre de la app | P55 → D56 | Respondido: «Placa 3D», provisional |
| Funciones frente a la competencia | P56–P65 → D57–D66 | Respondido; las preguntas están en [`competencia.md`](competencia.md) §9 |

---

## 2. Decisiones

| # | Decisión | Quién | Fecha |
|---|---|---|---|
| D1 | Ciclo de vida de la cotización: borrador → enviada → aceptada o rechazada → en producción → entregada | Francisco («si») | 2026-10-15 |
| D2 | Entran al proyecto: anticipos, fecha de entrega, IVA y datos fiscales, comisiones de marketplace y empaque por pieza | Francisco | 2026-10-15 |
| D3 | Firebase (Firestore) para empezar; algo más robusto si el proyecto crece | Francisco | 2026-10-15 |
| ~~D4~~ | ~~La sincronización con Notion queda pendiente: debía conectarse con lo que ya lleva en «Ventas» y creó una base aparte~~ Superada por D33 (2026-10-16): Notion sale del proyecto | Francisco | 2026-10-15 |
| D5 | Las reglas de negocio se escriben en `docs/` de este repo. Antes la planeación iba en `docs/projects/cotizador/` del Asistente | Francisco («Empezamos por docs/reglas-de-negocio.md») | 2026-10-16 |
| D6 | El primer estado se llama «Borrador» en todo; al abrir la app, `pendiente` se migra a `borrador` | Francisco (P1: a) | 2026-10-16 |
| D7 | Borrador → Enviada: automático al tocar WhatsApp o Link, y un botón «Marcar como enviada». El PDF y la imagen no cambian el estado | Francisco (P2: c) | 2026-10-16 |
| D8 | Se puede aceptar o rechazar un borrador sin pasar por Enviada | Francisco (P3: a) | 2026-10-16 |
| D9 | Editar una cotización enviada la regresa a Borrador hasta que se reenvía | Francisco (P4: b) | 2026-10-16 |
| D10 | Vigencia en días (default en Ajustes), impresa en el documento («Válida hasta…») y con aviso en la lista al vencer; sin estado nuevo. **Precisada por D97 (2026-11-03):** 15 días al empezar | Francisco (P5: b) | 2026-10-16 |
| D11 | Aceptada → En producción con un botón «Empezar producción», que avisa si falta el anticipo | Francisco (P6: c) | 2026-10-16 |
| D12 | Entrega y pago van por separado: la tarjeta dice «Entregada · saldo $X» hasta que se registra el pago | Francisco (P7: c) | 2026-10-16 |
| D13 | El filamento se descuenta al pasar a En producción (antes: al aceptar) | Francisco (P8: b) | 2026-10-16 |
| D14 | Anticipo: porcentaje por defecto en Ajustes (50 %), editable en cada cotización | Francisco (P9: a) | 2026-10-16 |
| D15 | La cotización lleva un plazo («5 días hábiles a partir del anticipo»); al aceptar se convierte en fecha, editable. **Precisada por D97 (2026-11-03):** 5 días hábiles al empezar, editable en Ajustes | Francisco (P10: c) | 2026-10-16 |
| D16 | Un pedido ya aceptado se cancela con un estado nuevo, «Cancelada», distinto de Rechazada. Se agrega al ciclo de D1 | Francisco (P11: b) | 2026-10-16 |
| D17 | Al cancelar se escribe cuánto anticipo se devuelve; por defecto, nada. La cotización debe especificar la política: «por cancelación del cliente no se regresa el anticipo dentro de los primeros 2 días hábiles» (palabras de Francisco; cómo se aplica: P21) | Francisco (P12: b) | 2026-10-16 |
| D18 | Se puede regresar un paso atrás desde cualquier estado, y se deshace lo que pasó al avanzar. Los pagos no se tocan | Francisco (P13: a) | 2026-10-16 |
| D19 | El ingreso del panel cuenta cada pago en el mes en que entra, y aparte se muestra lo que falta por cobrar | Francisco (P14: b) | 2026-10-16 |
| D20 | El plazo de entrega corre desde que se registra el anticipo; si la cotización no pide anticipo, desde que se acepta | Francisco (P15: a) | 2026-10-16 |
| D21 | IVA: se configura una sola vez en Ajustes, y cada cotización tiene un interruptor para agregarlo, apagado por defecto | Francisco (P16: c, «solo se configura una vez» y «un toggle para colocar el IVA») | 2026-10-16 |
| D22 | Con factura, la app guarda los datos fiscales del negocio y los del cliente (en su ficha). La app no emite facturas | Francisco (P17: b) | 2026-10-16 |
| D23 | Las comisiones de marketplace se definen por canal en Ajustes, con su porcentaje, y cada cotización elige su canal | Francisco (P18: a) | 2026-10-16 |
| D24 | El campo «Comisión» de hoy es la comisión de quien recomienda al cliente («si alguien me recomienda recibe una comisión, no estaba pensado para las tiendas»). Se queda, separado de los canales de D23 | Francisco (P19) | 2026-10-16 |
| D25 | El empaque se cobra por pieza: un costo en cada producto del catálogo y en la calculadora, con el de Ajustes como valor inicial. Sale de gastos indirectos | Francisco (P20: b) | 2026-10-16 |
| D26 | Ventana de cancelación: si el cliente cancela dentro de los 2 días hábiles siguientes a su anticipo, se le devuelve; después, ya no. Confirma cómo se aplica D17. **Precisada por D97 (2026-11-03):** los días de la ventana se cambian en Ajustes; 2 al empezar | Francisco (P21: a) | 2026-10-16 |
| D27 | Los días hábiles se marcan en Ajustes, más los festivos que se agreguen; se empieza con lunes a viernes | Francisco (P22: c) | 2026-10-16 |
| D28 | La vigencia cuenta desde la fecha de la cotización, y al editarla la fecha se renueva | Francisco (P23: a) | 2026-10-16 |
| D29 | La ganancia del mes sale de los pagos: cada pago trae su parte proporcional de la ganancia del pedido. **Precisada por D92 y D93 (2026-11-03):** lo registrado no cambia si el pedido cambia, y un cargo libre deja ganancia solo por encima de lo que cuesta | Francisco (P24: a) | 2026-10-16 |
| D30 | La comisión del recomendador no es ingreso del negocio: queda como «por pagar al recomendador» | Francisco (P25: a) | 2026-10-16 |
| D31 | La cotización guarda el nombre de quien recomendó y una marca de «comisión pagada» con fecha | Francisco (P26: a) | 2026-10-16 |
| D32 | El IVA se calcula sobre el total que paga el cliente, después del descuento y la comisión. Se confirma con el contador | Francisco (P27: a) | 2026-10-16 |
| D33 | Notion sale del proyecto. Firebase es la base de datos y el sistema de acceso de usuarios, y la app se publica en las tiendas («si tienes otra propuesta avísame»: revisada en §4.10) | Francisco (P28–P30) | 2026-10-16 |
| D34 | Otros negocios podrán usar la app, después de una prueba cerrada con Francisco y con quien él invite | Francisco (P31: b) | 2026-10-16 |
| ~~D35~~ | ~~La app se publica como «Quotia»~~; «La Casita del Molde» queda como el negocio de Francisco dentro de la app. El identificador lleva el nombre del producto. **El nombre lo supera D54 (2026-10-16); lo demás sigue** | Francisco (P32: a) | 2026-10-16 |
| D36 | Una persona por negocio en el primer MVP; los roles se agregan si el producto avanza («El primer mvp, si avanza podemos generar roles») | Francisco (P33: a) | 2026-10-16 |
| D37 | Se inicia sesión con correo y con Google. Apple no, porque por ahora no se publica en la App Store, aunque más adelante es posible | Francisco (P34: c) | 2026-10-16 |
| D38 | Google Play primero; la App Store después | Francisco (P35: a) | 2026-10-16 |
| D39 | La app se puede usar sin cuenta, como invitado, con los datos solo en ese teléfono. **Precisada por D84 (2026-10-19):** sin cuenta se usa la calculadora, pero guardar una cotización pide iniciar sesión | Francisco (P36: a) | 2026-10-16 |
| D40 | Al crear la cuenta, los datos de invitado se suben solos; si la cuenta ya tiene datos, la app pregunta qué conservar. **Precisada por D84 (2026-10-19):** lo que se sube son los ajustes hechos sin cuenta y la cotización en curso; ~~qué pasa con los ajustes si la cuenta ya tiene datos se pregunta en P85~~ si la cuenta ya tiene datos, se quedan sus ajustes sin preguntar (D86) | Francisco (P37: a) | 2026-10-16 |
| D41 | Borrar la cuenta borra todo de inmediato, después de confirmar y de ofrecer descargar un respaldo. El borrado pedido desde la página web: D98 | Francisco (P38: a) | 2026-10-16 |
| D42 | La app es gratis al lanzar; los planes se definen cuando el desarrollo esté terminado | Francisco (P39: a) | 2026-10-16 |
| D43 | Solo México: pesos, IVA del 16 %, RFC y CFDI | Francisco (P40: a) | 2026-10-16 |
| D44 | El IVA cobrado no es ingreso del negocio: se muestra aparte en el panel («se añade a la información del dashboard») | Francisco (P41: a) | 2026-10-16 |
| D45 | Para el contador, la app genera un Excel del mes con cada pago, el IVA cobrado y las comisiones por pagar | Francisco (P42: a) | 2026-10-16 |
| D46 | La base de datos se organiza por negocio desde el MVP: cada negocio tiene sus datos y una lista de personas, que al principio tiene solo una | Francisco (P43: a) | 2026-10-16 |
| D47 | Un negocio nuevo elige de una lista de impresoras y materiales comunes, con precios de referencia editables, y la introducción le pide sus gastos fijos y sus horas de impresión al mes. Sin clientes de ejemplo. **Precisada por D87 y D88 (2026-11-03):** los gastos y las horas se pueden dejar para después, y la introducción conserva sus 5 pasos, corregidos | Francisco (P44: a) | 2026-10-16 |
| D48 | Cuenta de desarrollador personal en Google Play; la prueba cerrada se hace con al menos 12 personas durante 14 días seguidos | Francisco (P45: a) | 2026-10-16 |
| D49 | La versión web sigue, con la misma cuenta y los mismos datos que la app de Android. Hay que revisar el dominio y cómo funciona la gestión de usuarios (revisión en §4.13) | Francisco (P46: a) | 2026-10-16 |
| D50 | La primera versión es un corte básico (§4.12); lo demás entra según lo que digan los usuarios de la prueba («empezamos con lo básico y con la información que se obtenga de los usuarios podemos seguir con las implementaciones e incluir más cosas») | Francisco (P47: b) | 2026-10-16 |
| D51 | El asistente escribe un borrador del aviso de privacidad con lo que la app guarda de verdad, y lo revisa un abogado o el contador antes de publicarlo | Francisco (P48: b) | 2026-10-16 |
| ~~D52~~ | ~~El nombre «Quotia» se queda, después de buscarlo en Marcanet (IMPI) y en Google Play y antes de pagar el dominio y la cuenta de desarrollador~~. Superada por D54 (2026-10-16): la búsqueda encontró un QUOTIA en español. Sigue en pie buscar el nombre nuevo en Marcanet antes de pagar | Francisco (P49: a) | 2026-10-16 |
| D53 | Al crear una cuenta con correo y contraseña se pide confirmar el correo: la app lo recuerda mientras no se confirme, pero deja usarla | Francisco (P52: a) | 2026-10-16 |
| D54 | «Quotia» no se usa: la app lleva otro nombre, porque ya existe un QUOTIA en español y sus dominios están ocupados. Candidatos en P55 | Francisco (P53: c) | 2026-10-16 |
| D55 | La versión web se publica en Firebase Hosting, con el dominio propio. La publicación automática al subir cambios se configura una vez con GitHub, paso a paso con Francisco | Francisco (P54: a) | 2026-10-16 |
| D56 | El nombre de la app es «Placa 3D», con el dominio `placa3d.com`. Es provisional: «mantenlo por ahora, se puede cambiar» | Francisco (P55: a) | 2026-10-16 |
| D57 | La primera versión lee el archivo laminado de Bambu Studio y OrcaSlicer (`.gcode.3mf`): peso por color, tiempo y miniatura, que aparece en la cotización. El G-code de otros slicers, después | Francisco (P56: a) | 2026-10-16 |
| D58 | El tiempo de impresión se captura en horas y minutos, no en horas con decimales | Francisco (P57: a) | 2026-10-16 |
| D59 | Cada pago genera un recibo en PDF o imagen, listo para WhatsApp, con lo pagado y el saldo. No es factura fiscal. Su folio: D95 | Francisco (P58: a) | 2026-10-16 |
| D60 | Los pedidos aceptados y en producción se ven en una lista ordenada por fecha de entrega; el tablero por columnas, después | Francisco (P59: a) | 2026-10-16 |
| D61 | La primera versión tiene un bloque de insumos y herrajes con nombre, costo unitario y cantidad por pieza; la lista de compras, después | Francisco (P60: a) | 2026-10-16 |
| D62 | La cotización admite cargos libres con concepto y monto (envío, urgencia, diseño extra). **Precisada por D93 (2026-11-03):** cada cargo puede llevar lo que cuesta | Francisco (P61: a) | 2026-10-16 |
| D63 | Que el cliente acepte desde la liga es lo primero después de la prueba cerrada | Francisco (P62: a) | 2026-10-16 |
| D64 | El cobro en línea (Mercado Pago) va después, cuando los talleres de la prueba lo pidan | Francisco (P63: a) | 2026-10-16 |
| D65 | Conexión con impresoras, tiendas en línea y roles: no por ahora; se revisa con lo que digan los usuarios | Francisco (P64: a) | 2026-10-16 |
| D66 | Los comentarios de la prueba cerrada llegan por un grupo de WhatsApp con los talleres, más dos encuestas cortas: a la primera semana y al terminar | Francisco (P65: a) | 2026-10-16 |
| D67 | Un pedido ya aceptado se cambia regresando un paso a Enviada, editándolo (pasa a Borrador), reenviándolo y volviéndolo a aceptar. El anticipo se queda registrado y el saldo se recalcula con el total nuevo | Francisco (P66: a, en `flujos.md`) | 2026-10-16 |
| D68 | La primera versión no tiene entregas parciales: el pedido pasa a Entregada cuando se entrega todo; lo parcial se anota en las notas | Francisco (P67: a, en `flujos.md`) | 2026-10-16 |
| D69 | Los diagramas de los flujos siguen el estilo y el nivel de detalle del flujo 1 | Francisco (P68: a, en `flujos.md`) | 2026-10-16 |
| D70 | Antes de juntar a `main`, un `.vercelignore` deja fuera del sitio todo lo que no es la app (documentos, órdenes de compra, `node_modules`, archivos de respaldo y `deploy.sh`). Con Firebase Hosting se repite en su configuración | Francisco (P69: a) | 2026-10-16 |
| D71 | La sincronización con Notion se corta ya: Francisco borra `NOTION_STATE_DB_ID` en Vercel, y en el mismo cambio del `.vercelignore` se quitan `api/sync/` y el botón «Sincronizar». Sin acceso a Vercel por ahora, el corte llega al publicar v101; la variable se borra después (nota en P70) | Francisco (P70: a) | 2026-10-16 |
| D72 | Si el archivo del slicer trae varias placas, se elige una: cada placa es un cálculo | Francisco (P71: a, en `flujos.md`) | 2026-10-16 |
| D73 | La app propone las piezas de la placa con los objetos del archivo, y la persona confirma. Se verifica con un archivo real que el dato venga ahí | Francisco (P72: a, en `flujos.md`) | 2026-10-16 |
| D74 | La app propone el rollo de cada color del archivo por material y color, y la persona confirma; con dos rollos iguales, propone el que tiene menos filamento | Francisco (P73: a, en `flujos.md`) | 2026-10-16 |
| D75 | El plazo de entrega corre cuando lo pagado llega al anticipo pedido, no con un pago menor; mientras, la tarjeta dice cuánto falta | Francisco (P74: a, en `flujos.md`) | 2026-10-16 |
| D76 | Al rechazar, se elige un motivo opcional de una lista corta (precio, tiempo de entrega, no contestó, otro), y el panel los cuenta | Francisco (P75: a, en `flujos.md`) | 2026-10-16 |
| D77 | Cada pago registra su forma: efectivo, transferencia, tarjeta u otro. Aparece en el recibo y en el Excel del mes | Francisco (P76: «si», en `flujos.md`) | 2026-10-16 |
| D78 | Un pago registrado por error se puede borrar, con confirmación; su recibo queda anulado en el historial del pedido y el saldo se recalcula | Francisco (P77: a, en `flujos.md`) | 2026-10-16 |
| D79 | Si el anticipo se pagó en partes, la ventana de 2 días hábiles para devolverlo cuenta desde el pago que lo completa | Francisco (P78: a, en `flujos.md`) | 2026-10-16 |
| D80 | Si al empezar producción no alcanza el filamento de un rollo, la app avisa y deja elegir otro rollo para lo que falta; descuenta de los dos | Francisco (P79: a, en `flujos.md`) | 2026-10-16 |
| D81 | En la primera versión, el filamento de una pieza que falló se descuenta a mano en Inventario, como hoy. Un botón «Reimprimir», si los talleres de la prueba lo piden | Francisco (P80: a, en `flujos.md`) | 2026-10-16 |
| D82 | La lista de producción muestra al final, en un grupo aparte, los pedidos aceptados que esperan el anticipo, con cuánto falta | Francisco (P81: a, en `flujos.md`) | 2026-10-16 |
| D83 | Al cerrar sesión, los datos se borran del teléfono y siguen en la cuenta. Si hay cambios sin subir por falta de conexión, la app avisa y no cierra sesión hasta subirlos | Francisco (P82: a, en `flujos.md`) | 2026-10-19 |
| D84 | Para crear cotizaciones hay que iniciar sesión («Para crear las cotizaciones se debe iniciar sesión»). **Interpretación:** sin cuenta se usa la calculadora y se arma la cotización; al guardarla o enviarla, la app pide entrar o crear la cuenta, y la cotización en curso se guarda en ella. Se confirma en P84. Precisa D39 y D40, y deja sin efecto las opciones de P83: sin cuenta ya no hay cotizaciones que juntar. **Confirmado en D85** | Francisco (respuesta a P83, en `flujos.md`) | 2026-10-19 |
| D85 | Confirma la interpretación de D84: sin cuenta se calcula y se arma la cotización; guardarla o enviarla pide entrar, y lo capturado pasa a la cuenta | Francisco (P84: a, en `flujos.md`) | 2026-10-19 |
| D86 | Al entrar a una cuenta que ya tiene datos, se quedan sus ajustes (impresoras, materiales y gastos) sin preguntar; solo la cotización en curso se agrega. Reemplaza, para los ajustes, la pregunta de D40 | Francisco (P85: a, en `flujos.md`) | 2026-10-19 |
| D87 | Si el taller no sabe sus gastos fijos o sus horas de impresión al mes, puede dejarlos para después. Mientras falten, la calculadora avisa «Tus precios todavía no incluyen gastos fijos», con un acceso para llenarlos. Precisa D47 | Francisco (P86: a, en `flujos.md`) | 2026-11-03 |
| D88 | La introducción conserva los 5 pasos de hoy, corregidos donde ya no corresponden, y después vienen las pantallas para elegir impresoras, materiales y gastos. Las correcciones están en `flujos.md` §7. Precisa D47 | Francisco (P87: b, en `flujos.md`) | 2026-11-03 |
| D89 | El folio lo da Firebase al guardar con conexión. Sin conexión, la cotización queda «Sin folio» y lo recibe sola al conectarse | Francisco (P88: a, en `modelo-de-datos.md`) | 2026-11-03 |
| D90 | Al abrir, la app baja las cotizaciones vivas (de Borrador a Entregada con saldo) y las de los últimos 3 meses. Las más viejas se buscan con conexión, por el nombre del cliente o el folio | Francisco (P89: a, en `modelo-de-datos.md`) | 2026-11-03 |
| D91 | La miniatura del archivo del slicer (unos 10 KB) y el logo (unos 50 KB) se guardan reducidos dentro de los documentos, sin Cloud Storage ni plan de pago | Francisco (P90: a, en `modelo-de-datos.md`) | 2026-11-03 |
| D92 | Las partes de un pago ya registrado (ganancia, comisión, IVA) no cambian si el pedido cambia: los pagos que faltan llevan el resto. Precisa D29 | Francisco (P91: a, en `modelo-de-datos.md`) | 2026-11-03 |
| D93 | Cada cargo libre puede llevar «lo que te cuesta», en $0 si no se llena; deja de ganancia el monto menos ese costo. Precisa D29 y D62 | Francisco (P92: a, en `modelo-de-datos.md`) | 2026-11-03 |
| D94 | Al migrar, las cotizaciones aceptadas de hoy pasan como Entregadas y pagadas, con un pago «migrado» por el total en la fecha de aceptación (o en la de la cotización, si no la tienen). Las que sigan en curso se regresan un paso y se borra su pago | Francisco (P93: a, en `modelo-de-datos.md`) | 2026-11-03 |
| D95 | El recibo de un pago lleva el folio de la cotización y el número de pago: «COT-0012 · Pago 2» | Francisco (P94: a, en `modelo-de-datos.md`) | 2026-11-03 |
| D96 | Una cotización con pagos no se borra: se cancela, y su dinero se queda en su mes. Las que no tienen pagos se borran como hoy | Francisco (P95: a, en `modelo-de-datos.md`) | 2026-11-03 |
| D97 | Un taller nuevo empieza con anticipo de 50 %, vigencia de 15 días, plazo de 5 días hábiles y ventana de cancelación de 2 días hábiles; todo se cambia en Ajustes, y el texto de la política se arma con los días de cada taller. Precisa D10, D15 y D26 | Francisco (P96: a, en `modelo-de-datos.md`) | 2026-11-03 |
| D98 | El borrado de datos pedido desde la página web: la página explica cómo borrar desde la app y da un correo, y Francisco borra a mano desde la consola de Firebase en el plazo que diga la página (por ejemplo, 7 días) | Francisco (P97: a, en `modelo-de-datos.md`) | 2026-11-03 |
| D99 | `node_modules/` sale de git: estaba en `.gitignore`, pero se subió antes (abril). Si hace falta, `npm install` lo vuelve a crear | Francisco (P98: a) | 2026-11-03 |
| D100 | `calculadora 3d/` y `calculadora 3d.zip` salen de git: el paquete de diseño original no lo usa la app. Sigue en el historial (commit `5f05e0b`) | Francisco (P99: «si») | 2026-11-03 |
| D101 | Los tres `.docx` de documentación de la versión 1 salen de git, y `.gitignore` ignora los `.docx`. Francisco guarda una copia fuera del repo si la quiere | Francisco (P100: a) | 2026-11-03 |
| D102 | `ordenes/` sale de git y se ignora, como los respaldos: las órdenes de compra son del negocio, no de la app, y se guardan fuera del repo | Francisco (P101: a) | 2026-11-03 |
| D103 | `deploy.sh` se quita, con su sección del `README.md`: se publica con GitHub Desktop y un Pull Request, y su `git add .` podía subir archivos por error | Francisco (P102: a) | 2026-11-03 |
| D104 | La integración de Firebase se queda en `main` y publicada («todo se agregó en main y funciona»). **Interpretación:** no se regresa a v102; las correcciones se hacen encima, en `main`. Se confirma en P108. **Confirmado en D105** | Francisco (respuesta a P104) | 2026-11-09 |
| D105 | Confirma la interpretación de D104: Firebase se queda publicado y se corrige encima | Francisco (P108: «si») | 2026-11-09 |
| D106 | Claude corrige los dos problemas graves de la integración, después de lo que Javi tenga pendiente. Las correcciones llegan a `main` con un Pull Request desde la carpeta de la sesión, porque la app no deja editar la carpeta principal desde la sesión | Francisco (P109: a) | 2026-11-09 |
| D107 | Los datos de La Casita del Molde que se borraron al entrar con la cuenta no se recuperan: «No guardé el respaldo que tenía, no hay problema». Si hiciera falta, la copia de Notion («App State — Calc3D», hasta el 2026-11-03) sigue ahí | Francisco (respuesta a P110) | 2026-11-09 |
| D108 | Las reglas de seguridad de Firestore viven en el repo, en `firestore.rules`, con una guía en `docs/firebase.md`; Javi las revisa, las publica e implementa lo que haga falta («Agrega las reglas de seguridad al repo para que javi lo revise e implemente lo que haga falta») | Francisco (sobre P105) | 2026-11-09 |
| D109 | Los cambios suben directo a `main`, sin ramas en GitHub («sube los cambios a main, elimina la rama que hiciste, vercel no permite otros deploys en el plan gratuito»). **Interpretación:** vale desde ahora para todos, también para Javi, y no solo para esa vez. Se confirma en P113. **Confirmado en D110** | Francisco | 2026-11-09 |
| D110 | Confirma la interpretación de D109: todos, también Javi, suben directo a `main`, sin ramas en GitHub | Francisco (P113: a) | 2026-11-09 |
| D111 | Lo que se borraba con v106: cotizaciones, clientes, gastos fijos, gastos indirectos y datos del negocio | Francisco (respuesta a P111) | 2026-11-09 |
| D112 | Lo que se pueda arreglar sin la consola de Firebase lo arregla Claude; lo demás, Javi («si podemos arreglarlo nosotros hay que hacerlo, sino que lo haga javi») | Francisco (P112) | 2026-11-09 |

---

## 3. Cómo funciona hoy (v100)

Revisado en el código el 2026-10-16. Es el punto de partida: lo que las decisiones cambien se compara contra esta tabla.

| Tema | Hoy | Dónde |
|---|---|---|
| Estados guardados | `pendiente`, `enviada`, `aceptada`, `rechazada`. No existen «en producción» ni «entregada» | [`js/quotes.js:487`](../js/quotes.js) |
| Un estado con tres nombres | El dato dice `pendiente`, el filtro «Borradores», la tarjeta «⏳ Pendiente» y el mapa de sitio «borrador» | [`js/quotes.js:489`](../js/quotes.js), [`:567`](../js/quotes.js) |
| Botones de estado | Aceptar, Rechazar y Pendiente. **Ningún botón asigna «Enviada»**: el filtro y la etiqueta existen, pero nada llega ahí | [`js/templates.js:632`](../js/templates.js) |
| Al aceptar | Pide confirmación, guarda `acceptedAt`, descuenta el filamento y manda la cotización a Notion | [`js/quotes.js:575`](../js/quotes.js), [`:623`](../js/quotes.js) |
| Al salir de aceptada | Pasar a pendiente o rechazada devuelve el filamento y borra `acceptedAt` | [`js/quotes.js:634`](../js/quotes.js) |
| Editar | Una aceptada no se puede editar. Las demás sí, y **conservan su estado y su fecha** al guardarse | [`js/quotes.js:167`](../js/quotes.js), [`:414`](../js/quotes.js) |
| Descuento | Porcentaje sobre el subtotal | [`js/quotes.js:234`](../js/quotes.js) |
| Comisión | Porcentaje que se **suma al cliente** después del descuento. Es la comisión de quien recomienda al cliente (D24), no de marketplace | [`js/quotes.js:236`](../js/quotes.js) |
| Ingreso del mes | El panel cuenta el ingreso en el mes de la **fecha de la cotización**. `acceptedAt` se guarda al aceptar, pero ningún cálculo lo lee, aunque el `CHANGELOG.md` de v100 lo da por corregido | [`js/dashboard.js:48`](../js/dashboard.js), [`:75`](../js/dashboard.js), [`js/quotes.js:627`](../js/quotes.js) |
| Comisión en el panel | Ingreso y ganancia usan `grandTotal`, que **incluye la comisión** que se le paga a quien recomendó | [`js/dashboard.js:51`](../js/dashboard.js), [`:58`](../js/dashboard.js) |
| Términos | La cotización imprime un texto libre de términos, que se escribe en el editor visual de cotizaciones | [`js/quotes.js:891`](../js/quotes.js) |
| IVA y datos fiscales | No existen: cero coincidencias de IVA, impuesto, RFC o razón social | `js/`, `index.html` |
| Anticipo, vigencia y fecha de entrega | No existen | `js/`, `index.html` |
| Empaque | Va en gastos indirectos y se prorratea por **hora de impresión**, no por pieza | [`index.html:1074`](../index.html) |
| Cliente | La cotización se liga al cliente por **nombre** (texto en minúsculas), no por id | [`js/clients.js:90`](../js/clients.js) |
| Notion | Al aceptar se crea una página en la base de `NOTION_DB_ID`, una sola vez: después no se actualiza. El código la llama «Ventas Costeo» y el `README.md` «Ventas 2026». La fecha que manda es la **de la cotización**, no la de aceptación | [`api/notion.js`](../api/notion.js), [`js/quotes.js:630`](../js/quotes.js) |

---

## 4. Reglas

Cada regla dice de dónde viene: **D#** es una decisión de Francisco; **derivada** es una consecuencia directa que escribió el asistente a partir de una decisión, y se corrige si no es así.

### 4.1 Estados

| Estado | Cómo se llega | Qué pasa al llegar | ¿Se edita? |
|---|---|---|---|
| Borrador | Al crear la cotización (D6) · al editar una enviada (D9) | — | Sí |
| Enviada | Desde Borrador: al tocar WhatsApp o Link, o con «Marcar como enviada» (D7) | — | Sí, y regresa a Borrador (D9) |
| Aceptada | «Aceptar», desde Borrador o Enviada (D8) | Se guarda la fecha de aceptación. Si no se pide anticipo, el plazo se convierte en fecha de entrega (D15, D20) | No (como hoy) |
| Rechazada | «Rechazar», desde Borrador o Enviada (D8) | — | Sí (como hoy) |
| En producción | «Empezar producción», desde Aceptada (D11) | Se descuenta el filamento (D13). Si falta el anticipo, avisa y deja seguir (D11) | No (derivada: si ya no se edita la aceptada, menos lo que viene después) |
| Entregada | «Entregar», desde En producción (D1, D12) | Si queda saldo, la tarjeta dice «Entregada · saldo $X» (D12) | No (derivada) |
| Cancelada | «Cancelar», desde Aceptada o En producción (D16; desde qué estados: derivada, porque antes de aceptar se rechaza y después de entregar ya no hay pedido) | Se registra cuánto anticipo se devuelve (D17). Si venía de En producción, el filamento no vuelve: ya se usó (derivada) | No (derivada) |

- **Compartir no regresa el estado** (derivada de D7). WhatsApp y Link solo cambian a Enviada una cotización en Borrador: volver a compartir una aceptada no la regresa a Enviada.
- **Regresar un paso** (D18). Cada estado puede volver al estado del que vino. Lo que pasó al avanzar se deshace: el filamento vuelve al salir de En producción hacia atrás, y la fecha de aceptación y la de entrega se borran al salir de Aceptada hacia atrás. Los pagos registrados se quedan, porque el dinero sí entró.

### 4.2 Vigencia (D10, D28)

- Los días de vigencia se definen en Ajustes y cada cotización los imprime: «Válida hasta el 16/10/2026». Un taller nuevo empieza con 15 días (D97).
- Al vencer, la lista lo avisa; la cotización sigue en Enviada, porque no hay estado «Vencida».
- La vigencia cuenta desde la fecha de la cotización. Al editarla, la fecha se renueva y la vigencia vuelve a empezar (D28). Hoy editar no cambia la fecha (§3).

### 4.3 Anticipo y pagos (D12, D14, D17, D26)

- El porcentaje de anticipo se define en Ajustes (50 %) y se puede cambiar en cada cotización.
- El documento lo dice: «Anticipo 50 %: $X · resto contra entrega».
- Cada pago se registra aparte, con monto, fecha y forma de pago (D77), y el saldo es el total menos los pagos (derivada de D12).
- Un pago registrado por error se borra con confirmación; su recibo queda anulado en el historial (D78).
- **Recibo** (D59, D95). Lleva el folio de la cotización y el número de pago: «COT-0012 · Pago 2».
- **Una cotización con pagos no se borra** (D96): se cancela, y su dinero se queda en su mes. Las que no tienen pagos se borran como hoy.
- Un anticipo de 0 % significa que la cotización no lo pide, y «Empezar producción» no avisa nada (derivada de D11 y D14).
- **Cancelación** (D17). Al cancelar se escribe cuánto anticipo se devuelve; por defecto, nada. La cotización imprime la política de cancelación.
- **Ventana de 2 días hábiles** (D26, D79, D97). Cada taller cambia los días en Ajustes; empieza con 2. Si el anticipo se pagó en partes, cuenta desde el pago que lo completa. Si el cliente cancela dentro de los 2 días hábiles siguientes a su anticipo, se le devuelve; después, ya no. Ejemplo: paga el lunes 5 de octubre; si cancela a más tardar el miércoles 7 se le devuelve, desde el jueves 8 no.
- La cotización lo dice: «Si cancelas dentro de los 2 días hábiles siguientes a tu anticipo, te lo devolvemos; después, no es reembolsable».
- Al cancelar, la app propone el monto según la ventana (todo el anticipo dentro de ella, $0 fuera) y se puede cambiar, porque D17 deja el monto en tus manos (derivada de D17 y D26).

### 4.4 Fecha de entrega (D15, D20, D27)

- La cotización lleva un plazo en días hábiles: «5 días hábiles a partir del anticipo». Un taller nuevo empieza con 5 y lo cambia en Ajustes (D97).
- El plazo corre desde que se registra el anticipo. Si la cotización no pide anticipo, corre desde que se acepta.
- Un pago menor que el anticipo no echa a correr el plazo: corre cuando lo pagado llega al anticipo pedido (D75).
- Si al aceptar todavía no hay anticipo, la fecha se calcula cuando llega; mientras tanto la tarjeta dice el plazo, no una fecha (derivada de D15 y D20).
- La fecha de entrega se puede editar.
- **Días hábiles** (D27). Se marcan en Ajustes los días que se trabaja, más los festivos que se agreguen; se empieza con lunes a viernes. Valen para el plazo de entrega y para la ventana de cancelación (D26).

### 4.5 Inventario (D13, D18)

- El filamento se descuenta al pasar a En producción, ya no al aceptar.
- Si se regresa de En producción a Aceptada, el filamento vuelve (D18).
- Si se cancela desde En producción, el filamento no vuelve (derivada de D16: ya se usó).
- Si no alcanza el filamento de un rollo, se elige otro para lo que falta y se descuenta de los dos (D80).
- El filamento de una pieza que falló se descuenta a mano en Inventario (D81).
- El quinto paso de la introducción, «Al aceptar, todo se mueve solo» ([`js/onboarding.js:122`](../js/onboarding.js)), tendrá que cambiar: con D13, el filamento ya no se descuenta al aceptar (derivada).

### 4.6 Ingresos y ganancia (D19, D29, D30)

- El ingreso del mes es la suma de los pagos que entraron ese mes, cada uno con su fecha.
- Aparte se muestra lo que falta por cobrar: los saldos de las cotizaciones aceptadas, en producción y entregadas.
- Una devolución por cancelación resta en el mes en que se hace (derivada de D17 y D19).
- **Ganancia** (D29). Cada pago trae su parte de la ganancia del pedido. Ejemplo: cotización de $1,200 con costo de $700 (ganancia de $500); el anticipo de $600 trae $250 de ganancia a septiembre y el saldo de $600 trae $250 a octubre.
- **Si el pedido cambia después de un pago** (D92), lo registrado no cambia: los pagos que faltan llevan el resto. Ejemplo: el pedido de arriba crece en octubre a $1,800 con $800 de ganancia; septiembre se queda con $250 y los $1,200 que faltan traen $550.
- **Cargos libres** (D93). Cada cargo puede llevar lo que te cuesta, en $0 si no se llena, y deja de ganancia el monto menos ese costo. Ejemplo: $150 de envío que le pagas a la paquetería no dejan ganancia; $100 de urgencia, sí.
- **Comisión del recomendador** (D30). No es ingreso del negocio: queda como «por pagar al recomendador». De cada pago, la parte proporcional de la comisión va a «por pagar» (derivada de D19 y D30). Ejemplo: total de $1,100 con $100 de comisión; un anticipo de $550 suma $500 de ingreso y $50 por pagar.
- Hoy el panel cuenta la comisión como ingreso y ganancia (§3); D30 lo corrige.
- **IVA cobrado** (D44). No es ingreso del negocio: el panel lo muestra aparte. Ejemplo: piezas por $1,000, 10 % de descuento, 10 % de comisión e IVA; el cliente paga $1,148.40, tu ingreso es $900, y aparte quedan $158.40 de IVA cobrado y $90 por pagar al recomendador.
- **Para el contador** (D45). Un Excel del mes, generado desde la app, con cada pago, el IVA cobrado y las comisiones por pagar. La app ya genera Excel para la lista de precios ([`js/catalog.js:461`](../js/catalog.js)).

### 4.7 IVA y datos fiscales (D21, D22, D32)

- En Ajustes se configura una sola vez: la tasa de IVA (16 %) y los datos fiscales del negocio (RFC, nombre o razón social y régimen).
- Cada cotización tiene un interruptor para agregar el IVA, apagado por defecto. Encendido, el documento desglosa subtotal, IVA y total.
- Con el IVA encendido, la cotización usa los datos fiscales del cliente (RFC, razón social, código postal, régimen y uso de CFDI), que se guardan en su ficha para la próxima vez (D22; que el mismo interruptor active los datos del cliente es derivada).
- La app no emite facturas: guarda los datos para pasárselos a quien factura.
- **Se puede hacer, y con piezas que ya existen** (Francisco pidió revisarlo). Ajustes ya guarda interruptores que se configuran una vez, como el de datos bancarios ([`index.html:949`](../index.html), [`js/config.js:154`](../js/config.js)). La cotización ya tiene un interruptor con porcentaje que recalcula el total, el de comisión ([`js/templates.js:809`](../js/templates.js), [`js/quotes.js:222`](../js/quotes.js)). El IVA sigue esos dos patrones.
- **Base del IVA** (D32). Se calcula sobre el total que paga el cliente, después del descuento y la comisión del recomendador. Ejemplo: piezas por $1,000, 10 % de descuento y 10 % de comisión dan $990; el IVA es $158.40 y el total $1,148.40. Francisco lo confirma con su contador, porque la comisión que se le pasa al recomendador puede tratarse distinto.

### 4.8 Comisiones (D23, D24, D30, D31)

- **Marketplace** (D23). En Ajustes se definen los canales con su porcentaje; cada cotización elige el suyo. El canal inicial es «Venta directa», con 0 % (derivada).
- El precio se calcula como precio ÷ (1 − comisión del canal): con 16 % sube 19.05 %, para que recibas lo que calculaste.
- **Recomendación** (D24). El campo «Comisión» de hoy es para quien te recomienda un cliente. Se queda, separado de los canales, con un nombre que diga qué es (por ejemplo, «Comisión por recomendación»). Sigue sumándose al precio del cliente, como hoy (derivada: no se pidió cambiarlo).
- No cuenta como ingreso del negocio: queda como «por pagar al recomendador» (D30, §4.6).
- La cotización guarda el nombre de quien recomendó y una marca de «comisión pagada» con fecha (D31). Así se sabe a quién se le debe y no se paga dos veces.

### 4.9 Empaque (D25)

- El costo de empaque por pieza se define en cada producto del catálogo y en la calculadora, con el de Ajustes como valor inicial.
- «Empaque» sale de gastos indirectos para no cobrarlo dos veces.
- El empaque se suma al costo de cada pieza después de dividir la placa, porque cada pieza lleva su propio empaque (derivada de D25 y del campo «Piezas» de [`js/costing.js`](../js/costing.js)).

### 4.10 Firebase y requisitos de las tiendas (D33)

- **Notion sale del proyecto** (D33). Se retiran el envío de ventas al aceptar (`api/notion.js`), la sincronización por copia completa (`api/sync/push.js`, `api/sync/pull.js`, `js/sync.js`) y el botón «Notion» (derivada). **La sincronización ya se quitó en v101** (D71, 2026-10-16); el envío de ventas y el botón «Notion» siguen hasta la migración. Con eso desaparecen también dos puntos de acceso que hoy no piden contraseña: cualquiera que conozca la dirección de la app puede leer o reemplazar con ellos todos los datos del negocio.
- Lo que se consultaba en Notion, ventas e ingresos, lo da el panel de la app (D19, D29, D30). Exportarlo para el contador va en el bloque 5.
- **Firebase** (D3, D33): Authentication para las cuentas y Firestore para los datos, como lo diseña [`BASE-DE-DATOS.md`](BASE-DE-DATOS.md).
- La app sigue funcionando sin conexión, como hoy: Firestore guarda una copia en el teléfono y sube los cambios al reconectar ([`BASE-DE-DATOS.md`](BASE-DE-DATOS.md) §8). Derivada: es lo que la app hace hoy y lo que pide cotizar en el taller sin señal.

**Requisitos para publicar.** No son decisiones: son condiciones de las tiendas, revisadas el 2026-10-16.

| Requisito | Quién lo pide |
|---|---|
| Si se puede crear una cuenta, se tiene que poder borrar desde la app, con sus datos. Desactivarla no basta | Apple (5.1.1 v) y Google Play |
| Además, una liga web para pedir el borrado sin reinstalar la app | Google Play |
| Si la app no depende de la cuenta para lo principal, se tiene que poder usar sin cuenta | Apple (5.1.1 v) |
| Si se ofrece entrar con Google, hay que ofrecer otra opción que limite los datos a nombre y correo y deje ocultar el correo; la de Apple cumple. Con solo correo y contraseña propios no hace falta | Apple (4.8) |
| Si la app cobra para desbloquear funciones o suscripciones, se cobra con el sistema de pagos de la tienda, que se queda con una comisión | Apple (3.1.1) y Google Play |
| Cuenta de desarrollador: 25 USD una sola vez en Google Play; 99 USD al año en Apple | Las dos tiendas |
| La versión de iPhone se compila en una Mac con Xcode, o con un servicio que compile en la nube | Apple |

**¿Firebase u otra opción?** Francisco pidió avisar si había otra propuesta. La alternativa real es Supabase.

| | Firebase (Auth + Firestore) | Supabase (Auth + Postgres) |
|---|---|---|
| Lo que ya está hecho | `BASE-DE-DATOS.md` está diseñado para Firestore, `js/auth.js` imita sus funciones y `ANDROID.md` usa su plugin para Capacitor | Habría que rehacer el diseño de la base y el interior de `auth.js` |
| Sin conexión | Incluido: copia local y sube los cambios al reconectar | No viene incluido; hay que agregar otra herramienta |
| Reportes (ingresos por mes, deuda por recomendador) | Se calculan en la app con los datos del negocio | Consultas SQL directas: más cómodo cuando los reportes crecen |
| Plan gratuito | 50 000 lecturas y 20 000 escrituras al día, para todo el proyecto | 500 MB por proyecto, y el proyecto se pausa después de 7 días sin uso |
| Al crecer | Pago por uso (plan Blaze), con la misma cuota gratuita incluida; pide tarjeta | Plan de pago mensual para que no se pause |

- **Recomendación del asistente: quedarse con Firebase.** Gana en lo que más pesa hoy: funciona sin conexión en el taller, el diseño ya está hecho y el plan gratuito no se pausa. Supabase gana en reportes; conviene revisarlo si crecen mucho, como ya prevé D3 («algo más robusto si el proyecto crece»).
- Lo que deja abierta esa puerta es la capa intermedia de [`BASE-DE-DATOS.md`](BASE-DE-DATOS.md) §9, paso 1: si toda la app guarda y lee por un solo lugar, cambiar de servicio después es cambiar ese lugar.
- **El plan gratuito ya no alcanza igual.** `BASE-DE-DATOS.md` §7 lo calculó para un solo usuario: unas 165 cargas completas al día. En las tiendas, esa cuota diaria se comparte entre todos los negocios que usen la app. Cuando haya otros negocios, hay que pasar a Blaze con un límite de presupuesto (derivada de D33).

Fuentes: [App Review Guidelines de Apple](https://developer.apple.com/app-store/review/guidelines/) · [Borrado de cuentas en Apple](https://developer.apple.com/support/offering-account-deletion-in-your-app) · [Borrado de cuentas en Google Play](https://support.google.com/googleplay/android-developer/answer/13327111) · [Planes de Firebase](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) · [Comparación Firebase y Supabase](https://agentdeals.dev/supabase-vs-firebase) (fuente no oficial; la pausa de Supabase se confirma en su sitio antes de decidir) · [Costos de las cuentas de desarrollador](https://splitmetrics.com/blog/google-play-apple-app-store-fees/).

### 4.11 Cuentas y tiendas (D34–D43, D46–D49, D51)

- **Quién la usa** (D34). Cualquier negocio de impresión 3D, después de una prueba cerrada con Francisco y con quien él invite. Cada cuenta es un negocio con sus propios datos, impresoras y precios (derivada).
- **Cuenta de desarrollador y prueba cerrada** (D48). Cuenta personal en Google Play. Por ser personal y nueva, antes de publicar necesita una prueba cerrada con al menos 12 personas durante 14 días seguidos: otros talleres, clientes de confianza o amigos.
- **Nombre** (D35, D54, D56). «Placa 3D», con `placa3d.com`, de forma provisional: se puede cambiar hasta que se cree la app en Google Play, porque ahí se fija el identificador (derivada). Antes de pagar el dominio se busca en Marcanet y en Google Play (D52). El identificador lleva el nombre del producto, porque ya no se puede cambiar después de publicar, y «La Casita del Molde» es el negocio de Francisco dentro de la app. Cambiar el nombre cuesta poco en el código: «Quotia» solo aparece en comentarios de `css/tokens.css` y `quote.html`; el nombre visible hoy es «La Casita del Molde» (`manifest.json`).
- **Personas por negocio** (D36, D46). Una por negocio en el primer MVP; si el producto avanza, se agregan roles. Para no mover datos cuando lleguen, la base se organiza por negocio desde el inicio: cada negocio tiene sus datos y una lista de personas, que al principio tiene solo una. `BASE-DE-DATOS.md` lo tiene por persona y ~~se actualiza en `base-de-datos.md`~~ se actualizó en [`modelo-de-datos.md`](modelo-de-datos.md) (2026-11-03; el nombre cambió porque en Windows `base-de-datos.md` y `BASE-DE-DATOS.md` son el mismo archivo).
- **Inicio de sesión** (D37). Con correo y con Google, y sin cuenta (D39). Antes de publicar en la App Store hay que agregar la opción de Apple, porque Apple la exige si se ofrece Google (derivada de D37 y del requisito 4.8, §4.10).
- **Tiendas** (D38). Google Play primero; la App Store después.
- **Invitado** (D39, D84). Sin cuenta se usa la calculadora y se arma la cotización; al guardarla o enviarla, la app pide entrar o crear la cuenta (confirmado en D85). Lo que se configura sin cuenta vive solo en ese teléfono.
- **Confirmar el correo** (D53). Con correo y contraseña, Firebase manda un correo para confirmar la dirección; la app lo recuerda mientras no se confirme, pero deja usarla. Con Google no aplica: el correo ya viene confirmado.
- **De invitado a cuenta** (D40, D84). Al entrar, la cotización en curso se guarda en la cuenta. En una cuenta nueva se suben también los ajustes hechos sin cuenta; si la cuenta ya tiene datos, se quedan los suyos sin preguntar (D86). Nunca se sube un teléfono vacío encima de una cuenta con datos.
- **Cerrar sesión** (D83). Los datos se borran del teléfono y siguen en la cuenta; si hay cambios sin subir, la app avisa y no cierra sesión hasta subirlos.
- **Borrar la cuenta** (D41). Se borra todo de inmediato, después de confirmar y de ofrecer descargar un respaldo. El respaldo ya existe: Ajustes › Exportar ([`js/config.js:300`](../js/config.js)). Además se publica una liga web para pedir el borrado, que Google Play exige (derivada del requisito, §4.10). La página da un correo y Francisco borra a mano desde la consola de Firebase, en el plazo que diga la página (D98).
- **Cobro** (D42). La app es gratis al lanzar. Los planes se definen cuando el desarrollo esté terminado y se cobran con el sistema de pagos de la tienda (§4.10).
- **País** (D43). Solo México: pesos, IVA del 16 %, RFC y CFDI. Las tiendas dejan elegir en qué países aparece la app.
- **Un negocio nuevo** (D47). Elige de una lista de impresoras y materiales comunes, con precios de referencia que puede cambiar, y la introducción le pide sus gastos fijos y sus horas de impresión al mes. No hay clientes de ejemplo. Hoy los valores iniciales son los de La Casita del Molde ([`js/store.js:52`](../js/store.js)). Si no sabe sus gastos fijos o sus horas, los deja para después y la calculadora avisa que sus precios todavía no los incluyen (D87). Antes de configurar ve la introducción de 5 pasos de hoy, corregida (D88).
- **Versión web** (D49). Sigue, con la misma cuenta y los mismos datos que la app de Android. Cómo funciona eso: §4.13.
- **Aviso de privacidad** (D51). El asistente escribe un borrador con lo que la app guarda de verdad (nombres, teléfonos y, con factura, RFC de los clientes de cada negocio), y lo revisa un abogado o el contador antes de subir la app a Google Play.

Fuentes: [requisitos para cuentas personales nuevas en Google Play](https://support.google.com/googleplay/android-developer/answer/14151465) · lo de las cuentas de organización: [guía de Choicely](https://www.choicely.com/blog/google-play-12-tester-rule) (no oficial).

### 4.12 Primera versión (D50)

Se empieza con lo básico, y lo que digan los usuarios de la prueba cerrada decide qué sigue.

| Entra a la primera versión | Queda para después |
|---|---|
| Cuentas: correo y Google, invitado, paso de invitado a cuenta y borrar la cuenta (D37, D39–D41) | IVA y datos fiscales (D21, D22, D32, D44) |
| Firebase con modo sin conexión, y Notion fuera (D33) | Canales de marketplace (D23) |
| Ciclo de vida completo, con Cancelada y regresar un paso (D6–D9, D11, D16, D18) | Nombre de quien recomendó y control de pago de su comisión (D31) |
| Anticipo, pagos, saldo y ventana de cancelación (D12, D14, D17, D26) | Empaque por pieza (D25) |
| Fecha de entrega, días hábiles y vigencia (D10, D15, D20, D27, D28) | Excel para el contador (D45) |
| Ingreso y ganancia por pago, con la comisión del recomendador fuera del ingreso (D19, D29, D30) | Roles (D36) |
| Arranque de un negocio nuevo (D47) | La App Store y el inicio de sesión con Apple (D37, D38) |
| Leer el archivo laminado de Bambu Studio y OrcaSlicer, con la miniatura en la cotización (D57) | G-code de otros slicers (D57) |
| Tiempo en horas y minutos (D58) | Tablero de producción por columnas (D60) |
| Recibo de cada pago (D59) | Lista de compras (D61) |
| Lista de pedidos por fecha de entrega (D60) | Que el cliente acepte desde la liga: lo primero después de la prueba (D63) |
| Insumos y herrajes (D61) | Cobro en línea con Mercado Pago (D64) |
| Cargos libres en la cotización (D62) | Conexión con impresoras y tiendas en línea (D65) |

- **La base de datos se diseña completa desde el inicio**, con todo lo de la columna derecha, para no moverla cuando entre (parte de la opción elegida en P47).
- **El arranque de un negocio nuevo entra a la primera versión** porque la prueba cerrada la hacen otros talleres (derivada de D47 y D48).
- **Comentarios de la prueba** (D66). Un grupo de WhatsApp con los talleres, más dos encuestas cortas: a la primera semana y al terminar. De ahí sale qué sigue (D50).
- **Lo que se agregó por la competencia** (D57–D62) sale de [`competencia.md`](competencia.md): es lo barato o lo que los talleres de la prueba echarían de menos frente a Bugeo App y 3Dcalc+.

### 4.13 Revisión: dominio y gestión de usuarios (D49)

Francisco pidió revisarlo en P46. Revisado el 2026-10-16 contra la documentación de Firebase.

**Cómo funciona la gestión de usuarios**

- **Una sola cuenta para la web y Android.** Las dos usan el mismo proyecto de Firebase, así que quien entra con el mismo correo o la misma cuenta de Google ve los mismos datos en los dos lados.
- **Dónde se administran.** En la consola de Firebase, Authentication › Users: ahí se ven las cuentas y se pueden deshabilitar o borrar. En la primera versión no se construye un panel de administración propio: la consola alcanza (derivada de D50).
- **Correo y contraseña.** Firebase se encarga de mandar los correos para confirmar la dirección y para restablecer la contraseña.
- **Borrar la cuenta pide un inicio de sesión reciente.** Firebase rechaza el borrado si la persona entró hace mucho; la app le pide volver a entrar antes de borrar (D41). Hay un reporte de que el plugin de Capacitor no tenía cómo hacerlo directamente; se revisa al implementar.
- **Dominios autorizados.** El dominio de la versión web tiene que estar en la lista de dominios autorizados de Firebase; si no, entrar con Google falla.
- **Google en la web.** Desde junio de 2024, Chrome, Firefox y Safari bloquean el almacenamiento de terceros, y el inicio de sesión de Firebase por redirección deja de funcionar, salvo que la app esté en Firebase Hosting con su propio dominio o se agregue un ajuste en el servidor. La salida más simple es entrar con una ventana emergente, que sigue funcionando y en escritorio es cómoda. En Android no aplica: ahí entra con el plugin nativo (`ANDROID.md`).

**El dominio**

- **Hoy** la app vive en `calculadora3-d-delta.vercel.app`, un subdominio gratuito de Vercel, y el `README.md` apunta a otro producto con un nombre casi igual.
- **Para qué hace falta uno propio:** la versión web (D49), la liga pública que reciben los clientes con su cotización, la política de privacidad (D51) y la liga web para pedir el borrado de la cuenta (Google Play), los correos de Firebase y la lista de dominios autorizados.
- **El nombre.** No apareció ningún producto llamado «Quotia», pero sí nombres parecidos en la misma categoría: «Quotae», una app de cotizaciones y facturas para iPhone y Android, y «Quoti», cotizaciones por WhatsApp para contratistas. Conviene revisarlo antes de pagar el dominio y la cuenta de desarrollador (P49).
- **Dónde se publica la web.** Al retirar Notion, la app ya no necesita funciones de servidor, así que puede quedarse en Vercel con el dominio propio o pasar a Firebase Hosting (P51, que sigue en P54).

**Lo que se encontró al seguir la revisión (2026-10-16)**

- **Ya existe un QUOTIA en español.** En `quotia.app` hay una plataforma web llamada QUOTIA para cobrar cuotas diarias de préstamos, con reportes y recordatorios por WhatsApp. Por el voseo y la agencia que la firma parece de Argentina. Es otra categoría, pero mismo nombre, mismo idioma y también trata de cobros.
- **Los dominios «quotia» están ocupados.** `quotia.mx` (lo confirmó Francisco), `quotia.com`, `quotia.app` y `quotia.io` ya tienen dueño.

| Dominio | Estado al 2026-10-16 | Cómo se comprobó |
|---|---|---|
| `quotia.mx`, `quotia.com`, `quotia.app`, `quotia.io` | Ocupados | Registro público (RDAP) o servidores de nombres |
| `quotia3d.com`, `quotiaapp.com`, `getquotia.com` | Libres | Registro público de .com (RDAP) |
| `quotia.com.mx`, `quotia3d.com.mx` | Probablemente libres: sin registros en DNS | Se confirma al comprarlo; el registro .mx no se pudo consultar directo |

- **¿Alcanza el ancho de banda para muchos usuarios? Sí; el límite real es otro.** Francisco lo preguntó en P51.
  - La versión web pesa 574 KB, y 159 KB comprimida, que es como se descarga (33 archivos, medido el 2026-10-16). Las librerías de PDF, Excel, QR e imagen y las fuentes vienen de otros servidores y no cuentan.
  - En Android, los archivos van dentro de la app: no gastan ancho de banda del hosting.
  - El service worker guarda la app en el navegador, así que cada persona la descarga una vez por versión.
  - Los datos (cotizaciones, clientes, pagos) no pasan por el hosting: van directo a Firestore.
  - Con los 10 GB gratis al mes de Firebase Hosting caben unas 64 000 descargas completas de la web. Ejemplo: 500 negocios en la web con 4 versiones nuevas al mes son 2 000 descargas, unos 320 MB: el 3 % del límite.
  - Lo que se acaba primero son las 50 000 lecturas diarias de Firestore, compartidas por todos los negocios (§4.10). Ahí se pasa a Blaze, pago por uso, con un tope de gasto.
- **El plan gratuito de Vercel no permite uso comercial.** Hobby es «solo para uso personal no comercial», y Vercel cuenta como comercial cualquier proyecto que deje ganancia a cualquiera que participe en él. Quotia la usa un negocio y tendrá planes (D42), así que en Vercel necesitaría el plan Pro, de unos 20 USD al mes por persona. Si hoy la app está en Hobby, ya está en zona gris. Firebase Hosting no menciona esa restricción en sus precios: 10 GB de almacenamiento y 10 GB de transferencia al mes sin costo, y 0.15 USD por GB extra en Blaze.
- **Dónde se publica la web: Firebase Hosting** (D55), con el dominio propio. Consecuencias (derivadas): el inicio de sesión con Google también funciona por redirección, porque la app y el inicio de sesión quedan en el mismo dominio; Vercel deja de usarse cuando la web pase a Firebase; y la sección de despliegue del `README.md` y `deploy.sh` cambian en ese momento.
- **`BASE-DE-DATOS.md` §7 tiene un dato viejo:** dice 360 MB al día de transferencia; hoy son 10 GB al mes. ~~Se corrige en `base-de-datos.md`.~~ Corregido en [`modelo-de-datos.md`](modelo-de-datos.md) §1 y §8 (2026-11-03).

Fuentes de este seguimiento: [QUOTIA (quotia.app)](https://quotia.app) · [Registro RDAP](https://rdap.org) · [Uso justo y uso comercial en Vercel](https://vercel.com/docs/limits/fair-use-guidelines) · [Precio de Vercel Pro (fuente no oficial)](https://makerkit.dev/blog/saas/vercel-cost) · [Precios de Firebase Hosting](https://firebase.google.com/docs/hosting/usage-quotas-pricing)

Fuentes: [Inicio de sesión por redirección en navegadores que bloquean el almacenamiento de terceros (Firebase)](https://firebase.google.com/docs/auth/web/redirect-best-practices) · [Errores de Firebase Auth: dominio no autorizado e inicio de sesión reciente](https://firebase.google.com/docs/reference/node/firebase.auth.Error) · [Administrar usuarios (Firebase)](https://firebase.flutter.dev/docs/auth/manage-users) · [Reporte del plugin de Capacitor](https://polar.sh/capawesome-team/capacitor-firebase/issues/539) · [Quotae en Capterra](https://www.capterra.com/p/10045618/Quotae/) · [Quoti en Capterra](https://www.capterra.co.za/software/1109916/Quoti)

---

## 5. Preguntas

### Bloque 1 — ciclo de vida, anticipo y entrega (2026-10-16)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P1 | Nombre del primer estado | (a) «Borrador» en todo | Respondida (a) → D6 |
| P2 | Qué mueve Borrador → Enviada | (c) automático con WhatsApp o Link, más un botón | Respondida (c) → D7 |
| P3 | ¿Aceptar o rechazar sin pasar por Enviada? | (a) sí | Respondida (a) → D8 |
| P4 | Qué pasa al editar una enviada | (b) regresa a Borrador | Respondida (b) → D9 |
| P5 | ¿Las enviadas vencen? | (b) vigencia en el documento y aviso, sin estado nuevo | Respondida (b) → D10 |
| P6 | Qué mueve Aceptada → En producción | (c) botón, con aviso si falta el anticipo | Respondida (c) → D11 |
| P7 | Qué mueve a Entregada y cómo se relaciona con el saldo | (c) entrega y pago por separado | Respondida (c) → D12 |
| P8 | Cuándo se descuenta el filamento | (b) al pasar a En producción | Respondida (b) → D13 |
| P9 | Cómo se define el anticipo | (a) % en Ajustes, editable por cotización | Respondida (a) → D14 |
| P10 | Cómo se define la fecha de entrega | (c) plazo en la cotización, fecha al aceptar | Respondida (c) → D15 |

**P1. Nombre del primer estado.** Hoy el dato dice `pendiente`, el filtro «Borradores» y la tarjeta «⏳ Pendiente»; D1 lo llama «borrador».
- (a) «Borrador» en todo, y al abrir la app se migra `pendiente` → `borrador`.
- (b) «Pendiente» en todo.
- **Recomendado: (a).** Es el nombre de D1, y «pendiente» se confunde con «enviada, esperando respuesta».
- **Respuesta (2026-10-16): (a) → D6.**

**P2. ¿Qué mueve una cotización de Borrador a Enviada?** Hoy nada la asigna. Ejemplo: armas la COT-0003 y se la mandas al cliente.
- (a) Automático al tocar WhatsApp o Link.
- (b) Solo un botón «Marcar como enviada».
- (c) Las dos.
- **Recomendado: (c).** WhatsApp y el link casi siempre van al cliente; el botón cubre el correo o el PDF impreso. El PDF y la imagen no la cambian solos porque a veces los generas para revisarla tú.
- **Respuesta (2026-10-16): (c) → D7.**

**P3. ¿Se puede aceptar o rechazar un borrador sin pasar por Enviada?** Ejemplo: el cliente está en el mostrador y acepta en ese momento.
- (a) Sí, se puede saltar.
- (b) No, primero se marca enviada.
- **Recomendado: (a).** Obligar el paso agrega un toque que no aporta información.
- **Respuesta (2026-10-16): (a) → D8.**

**P4. ¿Qué pasa al editar una cotización ya enviada?** Hoy se edita y sigue «Enviada». Ejemplo: el cliente recibió 8 herraduras y pide 10.
- (a) Se edita y sigue enviada.
- (b) Se edita y regresa a Borrador hasta que la reenvíes.
- (c) Se crea una versión nueva (COT-0003-v2) y la enviada queda intacta.
- **Recomendado: (b).** Lo que el cliente tiene ya no coincide, y regresarla a borrador lo hace visible. (c) es lo más formal, pero agrega folios y pantallas.
- **Respuesta (2026-10-16): (b) → D9.**

**P5. ¿Las cotizaciones enviadas vencen?** Ejemplo: la mandas el 1 de octubre, el cliente no contesta y el 20 sube el PLA.
- (a) No vencen.
- (b) Vigencia en días (default en Ajustes) que se imprime en el documento («Válida hasta el 16/10/2026») y un aviso en la lista cuando pasa, sin estado nuevo.
- (c) Estado «Vencida» automático.
- **Recomendado: (b).** La vigencia la pidió Alfonso para compras, y D1 no tiene estado «Vencida»: un aviso basta para darle seguimiento.
- **Respuesta (2026-10-16): (b) → D10.**

**P6. ¿Qué mueve una cotización de Aceptada a En producción?** Ejemplo: aceptan el lunes, pero tienes dos pedidos en cola y empiezas el jueves.
- (a) Automático al aceptar.
- (b) Automático al registrar el anticipo.
- (c) Un botón «Empezar producción», con aviso si falta el anticipo.
- **Recomendado: (c).** Aceptar no significa que ya estés imprimiendo, y separarlos te deja ver la cola.
- **Respuesta (2026-10-16): (c) → D11.**

**P7. ¿Qué mueve una cotización a Entregada, y qué tiene que ver con el saldo?** Ejemplo: entregas las 16 piezas el viernes y te pagan el resto el lunes.
- (a) Un botón «Entregar», sin relación con el pago.
- (b) «Entregar» exige registrar el pago del saldo.
- (c) Entrega y pago por separado: la tarjeta dice «Entregada · saldo $X» hasta que registras el pago.
- **Recomendado: (c).** Entregar y cobrar pasan en días distintos; juntarlos obliga a registrar mal uno de los dos.
- **Respuesta (2026-10-16): (c) → D12.**

**P8. ¿Cuándo se descuenta el filamento del inventario?** Hoy, al aceptar. Ejemplo: aceptan el lunes y cancelan el martes, antes de imprimir.
- (a) Al aceptar, como hoy.
- (b) Al pasar a En producción.
- (c) Al entregar.
- **Recomendado: (b).** Es cuando el filamento se usa de verdad; con (a), una cancelación antes de imprimir obliga a devolverlo.
- **Respuesta (2026-10-16): (b) → D13.**

**P9. ¿Cómo se define el anticipo?** Ejemplo: Rosa cobra 50 % al confirmar, siempre; un cliente de empresa paga 30 %.
- (a) Porcentaje por defecto en Ajustes (50 %), editable en cada cotización.
- (b) Monto libre en cada cotización.
- (c) Sin anticipo: solo se registran los pagos que lleguen.
- **Recomendado: (a).** Cubre el caso de siempre sin teclear y deja la excepción. El documento diría «Anticipo 50 %: $X · resto contra entrega».
- **Respuesta (2026-10-16): (a) → D14.**

**P10. ¿Cómo se define la fecha de entrega?** Ejemplo: cotizas hoy, pero no sabes si aceptan mañana o en dos semanas.
- (a) Una fecha que escribes al aceptar.
- (b) Calculada con las horas de impresión de la orden.
- (c) En la cotización va un plazo («5 días hábiles a partir del anticipo») y al aceptar se convierte en fecha, editable.
- **Recomendado: (c).** Al cotizar todavía no hay fecha posible; el plazo sí. (b) suena bien, pero no conoce tu cola ni el tiempo de pintado.
- **Respuesta (2026-10-16): (c) → D15.**

### Bloque 2 — cancelación, ingresos, IVA, comisiones y empaque (2026-10-16)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P11 | Cómo se cancela una cotización ya aceptada | (b) estado nuevo «Cancelada» | Respondida (b) → D16 |
| P12 | Qué pasa con el anticipo si el cliente cancela | (b) escribes cuánto devuelves; por defecto, nada | Respondida (b), con política de 2 días → D17 · P21 |
| P13 | ¿Se puede regresar al estado anterior? | (a) un paso atrás, deshaciendo lo que pasó al avanzar | Respondida (a) → D18 |
| P14 | En qué mes cuenta el ingreso en el panel | (b) cada pago en el mes en que entra | Respondida (b) → D19 |
| P15 | Desde cuándo corre el plazo de entrega | (a) desde el anticipo; sin anticipo, desde que se acepta | Respondida (a) → D20 |
| P16 | Cómo entra el IVA | (c) interruptor por cotización | Respondida (c), configurado una vez → D21 |
| P17 | Qué datos fiscales guarda la app | (b) los tuyos y los del cliente, solo con factura | Respondida (b) → D22 |
| P18 | Cómo se definen las comisiones de marketplace | (a) canales en Ajustes con su % | Respondida (a) → D23 |
| P19 | Para qué se usa hoy el campo «Comisión» | Sin recomendación: depende del uso | Respondida: comisión por recomendación → D24 |
| P20 | Dónde se define el costo de empaque por pieza | (b) por producto, con valor inicial en Ajustes | Respondida (b) → D25 |

**P11. ¿Cómo se cancela una cotización ya aceptada?** D1 no tiene un estado para esto; hoy se marca rechazada. Ejemplo: aceptan, pagan el anticipo y a los dos días se echan para atrás.
- (a) Se marca «Rechazada», con un motivo opcional.
- (b) Un estado nuevo, «Cancelada», distinto de Rechazada.
- (c) No se cancela: se regresa a Borrador.
- **Recomendado: (b).** «Rechazó la cotización» y «canceló el pedido» son cosas distintas: mezclarlas ensucia la tasa de aceptación del panel, y la cancelada puede tener un anticipo que resolver (P12). Es un agregado al ciclo de D1.
- **Respuesta (2026-10-16): (b) → D16.**

**P12. ¿Qué pasa con el anticipo si el cliente cancela?** Ejemplo: pagó $600 y cancela cuando ya imprimiste 8 de 16 piezas.
- (a) Se queda siempre; nunca se devuelve.
- (b) Al cancelar escribes cuánto devuelves, de $0 a lo pagado; por defecto, $0.
- (c) La app no lo registra; se resuelve fuera.
- **Recomendado: (b).** Depende de cuánto se imprimió, así que es un monto que decides tú; el ingreso queda como lo pagado menos lo devuelto.
- **Respuesta (2026-10-16): (b) → D17.** Con una condición: «hay que especificar que por cancelación del cliente no se regresa el anticipo dentro de los primeros 2 días hábiles». Cómo se aplica la ventana se confirma en P21.

**P13. ¿Se puede regresar una cotización a su estado anterior?** Ejemplo: marcaste «En producción» por error en la COT-0005. Hoy se puede regresar de Aceptada a Pendiente y el filamento vuelve.
- (a) Sí, un paso atrás desde cualquier estado, y se deshace lo que pasó al avanzar (el filamento vuelve, la fecha se borra). Los pagos no se tocan.
- (b) Solo con «Deshacer» en el aviso, durante unos segundos.
- (c) No se regresa: se cancela y se duplica.
- **Recomendado: (a).** Es lo que ya hace la app con Aceptada, extendido a los estados nuevos. Los pagos se quedan porque el dinero sí entró.
- **Respuesta (2026-10-16): (a) → D18.**

**P14. ¿En qué mes cuenta el ingreso en el panel?** ~~Hoy cuenta el total en el mes en que se acepta.~~ Ejemplo: una cotización de $1,200, con anticipo de $600 el 28 de septiembre y el resto el 10 de octubre.
- (a) $1,200 en septiembre, al aceptar (como hoy).
- (b) $600 en septiembre y $600 en octubre: cada pago en el mes en que entra, y aparte un dato de «por cobrar».
- (c) $1,200 en octubre, al entregar.
- **Recomendado: (b).** Es el dinero que de verdad entró cada mes, y con D12 los pagos ya tienen fecha. Cómo se reporta la ganancia va en el bloque 3.
- **Corrección del asistente (2026-10-16):** la frase tachada era falsa. Hoy el panel cuenta el ingreso en el mes de la **fecha de la cotización**, no en el de aceptación (§3), y por eso «como hoy» en la opción (a) tampoco era exacto. La decisión no cambia.
- **Respuesta (2026-10-16): (b) → D19.**

**P15. ¿Desde cuándo corre el plazo de entrega?** Ejemplo: plazo de 5 días hábiles; aceptan el lunes y el anticipo llega el miércoles.
- (a) Desde que se registra el anticipo; si la cotización no pide anticipo (0 %), desde que se acepta.
- (b) Siempre desde que se acepta.
- (c) Desde que pasa a En producción.
- **Recomendado: (a).** Es lo que promete el texto de la cotización y protege tu plazo si el cliente tarda en pagar. Con (a), D15 se precisa: si al aceptar todavía no hay anticipo, la fecha se calcula cuando llega.
- **Respuesta (2026-10-16): (a) → D20.**

**P16. ¿Cómo entra el IVA?** Hoy no existe. Ejemplo: cotizas un topper de $240 a una empresa que pide factura.
- (a) La app no maneja IVA.
- (b) Todos los precios llevan el IVA incluido y el documento lo desglosa.
- (c) Por cotización: un interruptor «Con factura» suma el IVA (16 %, tasa editable en Ajustes) y lo desglosa. Apagado por defecto.
- **Recomendado: (c).** A un cliente particular no le cambia nada, y la empresa ve subtotal más IVA, como lo pide su área de compras. Si te toca cobrar IVA en todas tus ventas lo define tu contador; la app solo necesita saber cómo mostrarlo.
- **Respuesta (2026-10-16): (c) → D21.** Además: «revisa si se puede agregar en la configuración (solo se configura una vez) y en la cotización utilizar un toggle para colocar el IVA». Revisado: se puede, con dos patrones que la app ya tiene (§4.7).

**P17. ¿Qué datos fiscales guarda la app?** La app no emite facturas (eso se hace en el portal del SAT o con tu contador); la pregunta es qué datos imprime y guarda. Ejemplo: la empresa de P16 te pide factura.
- (a) Solo los tuyos (RFC, nombre o razón social y régimen), impresos en la cotización.
- (b) Los tuyos y los del cliente (RFC, razón social, código postal, régimen y uso de CFDI), guardados en su ficha para pasárselos a quien factura.
- (c) Ninguno.
- **Recomendado: (b), solo cuando la cotización es «Con factura».** Son los datos que te van a pedir para facturar, y guardarlos en la ficha del cliente evita pedirlos dos veces.
- **Respuesta (2026-10-16): (b) → D22.**

**P18. ¿Cómo se definen las comisiones de marketplace?** Hoy no existen. Ejemplo: vendes un organizador por Mercado Libre y te descuentan una comisión del precio.
- (a) Canales en Ajustes (Venta directa 0 %, Mercado Libre, Etsy…) con su porcentaje; cada cotización elige su canal.
- (b) Un porcentaje libre en cada cotización.
- (c) No vendes por marketplace.
- **Recomendado: (a).** El porcentaje de cada canal casi no cambia, así que no hay que teclearlo. El precio se calcula como precio ÷ (1 − comisión): con 16 % sube 19.05 %, no 16 %, para que recibas lo que calculaste.
- **Respuesta (2026-10-16): (a) → D23.**

**P19. ¿Para qué usas hoy el campo «Comisión» de la cotización?** Hoy suma un porcentaje al cliente después del descuento: con 10 %, $1,000 se vuelven $1,100.
- (a) Para cobrar la comisión de alguien que te trajo al cliente.
- (b) Para cobrar la comisión del pago con tarjeta o de una plataforma de pago.
- (c) Como aproximación a la comisión de marketplace.
- (d) No lo uso.
- **Sin recomendación: depende de tu uso.** Con (c) o (d) se reemplaza por los canales de P18; con (a) o (b) se queda como un cargo aparte, con un nombre que diga qué es.
- **Respuesta (2026-10-16): «si alguien me recomienda recibe una comisión, no estaba pensado para las tiendas»**, o sea (a) → D24.

**P20. ¿Dónde se define el costo de empaque por pieza?** Hoy va en gastos indirectos y se reparte por hora de impresión: un topper de 3 h carga unas 6 veces más empaque que un organizador. Ejemplo: 30 organizadores llevan 30 bolsas de $2; un topper lleva una caja de $15.
- (a) Un costo por pieza en Ajustes, igual para todas.
- (b) Un costo por pieza en cada producto del catálogo y en la calculadora, con el de Ajustes como valor inicial.
- (c) Se queda en indirectos, por hora.
- **Recomendado: (b).** Una bolsa y una caja no cuestan lo mismo, y el valor inicial evita teclearlo cada vez. El empaque sale de gastos indirectos para no cobrarlo dos veces.
- **Respuesta (2026-10-16): (b) → D25.**

### Bloque 3 — ventana de cancelación, fechas, ganancia, recomendador, IVA y Notion (2026-10-16)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P21 | Cómo se aplica la ventana de 2 días hábiles del anticipo | (a) dentro de la ventana se devuelve; después, no | Respondida (a) → D26 |
| P22 | Qué días son hábiles | (c) los que marques en Ajustes, más festivos | Respondida (c) → D27 |
| P23 | Desde qué fecha cuenta la vigencia | (a) desde la fecha de la cotización, que se renueva al editarla | Respondida (a) → D28 |
| P24 | Cómo se reporta la ganancia del mes | (a) cada pago trae su parte de ganancia | Respondida (a) → D29 |
| P25 | ¿La comisión del recomendador cuenta como tu ingreso? | (a) no | Respondida (a) → D30 |
| P26 | ¿Se registra quién recomendó y si ya se le pagó? | (a) nombre y marca de pagada | Respondida (a) → D31 |
| P27 | Sobre qué monto se calcula el IVA | (a) sobre el total que paga el cliente | Respondida (a) → D32 |
| P28 | En qué base de Notion se registran las ventas | Sin recomendación: depende de cuál revisas | Respondida: Notion sale; Firebase → D33 |
| P29 | Cuándo se manda una venta a Notion | (a) al aceptar, y se actualiza después | Sin efecto: Notion sale (D33) |
| P30 | Qué fecha lleva la venta en Notion | (a) la de aceptación | Sin efecto: Notion sale (D33) |

**P21. ¿Cómo se aplica la ventana de 2 días hábiles del anticipo?** En P12 escribiste: «por cancelación del cliente no se regresa el anticipo dentro de los primeros 2 días hábiles». Ejemplo: el cliente paga el anticipo el lunes 5 de octubre.
- (a) Si cancela a más tardar el miércoles 7, se le devuelve; desde el jueves 8, ya no.
- (b) Si cancela a más tardar el miércoles 7, no se le devuelve; después, sí.
- (c) Solo puede cancelar hasta el miércoles 7, y en ningún caso se le devuelve.
- **Lo tomé como (a)**, porque en esos días normalmente todavía no compras material ni imprimes. Los 2 días cuentan desde que paga el anticipo. En la cotización diría: «Si cancelas dentro de los 2 días hábiles siguientes a tu anticipo, te lo devolvemos; después, no es reembolsable».
- **Respuesta (2026-10-16): (a) → D26.**

**P22. ¿Qué días son hábiles?** Se usan para el plazo de entrega (D20) y para la ventana de cancelación (P21). Ejemplo: un plazo de 5 días hábiles que empieza un jueves.
- (a) Lunes a viernes: termina el jueves siguiente.
- (b) Lunes a sábado: termina el miércoles siguiente.
- (c) Los días que marques en Ajustes, más los festivos que agregues.
- **Recomendado: (c), empezando con lunes a viernes.** Se configura una vez y el plazo coincide con los días en que de verdad trabajas.
- **Respuesta (2026-10-16): (c) → D27.**

**P23. ¿Desde qué fecha cuenta la vigencia?** Hoy editar una cotización no cambia su fecha. Ejemplo: la creas el 1 de octubre con 15 días de vigencia, la editas el 10 y la reenvías.
- (a) Desde la fecha de la cotización, y al editarla la fecha se renueva: vence el 25.
- (b) Desde que se marca Enviada.
- (c) Desde la fecha original, aunque la edites: vence el 16.
- **Recomendado: (a).** La fecha impresa y la vigencia siempre cuadran, y una cotización corregida le da al cliente su plazo completo.
- **Respuesta (2026-10-16): (a) → D28.**

**P24. ¿Cómo se reporta la ganancia del mes?** Con D19 el ingreso cuenta cuando entra cada pago. Ejemplo: una cotización de $1,200 con costo de $700; anticipo de $600 en septiembre y $600 en octubre.
- (a) Cada pago trae su parte de ganancia: $250 en septiembre y $250 en octubre.
- (b) Toda la ganancia ($500) en el mes en que se entrega.
- (c) Toda la ganancia en el mes en que se acepta.
- **Recomendado: (a).** Ingreso y ganancia salen de los mismos pagos, así que el margen del mes cuadra con el dinero que entró.
- **Respuesta (2026-10-16): (a) → D29.**

**P25. ¿La comisión del recomendador cuenta como tu ingreso?** Hoy sí: el panel suma el total con la comisión, así que tu ingreso y tu ganancia salen inflados. Ejemplo: piezas por $1,000 más 10 % de comisión = $1,100, de los que $100 son para quien te recomendó.
- (a) No: tu ingreso es $1,000, y los $100 quedan como «por pagar al recomendador».
- (b) Sí, como hoy: $1,100.
- **Recomendado: (a).** Es dinero que solo pasa por tus manos; contarlo infla tu margen.
- **Respuesta (2026-10-16): (a) → D30.**

**P26. ¿Se registra quién te recomendó y si ya le pagaste?** Hoy la cotización solo guarda el porcentaje. Ejemplo: Laura te recomendó con tres clientes este mes y quieres saber cuánto le debes.
- (a) El nombre de quien recomendó en la cotización, y una marca de «comisión pagada» con fecha.
- (b) Solo el nombre, sin control de pago.
- (c) Solo el porcentaje, como hoy.
- **Recomendado: (a).** Sin el nombre no hay forma de saber a quién le debes, y la marca evita pagar dos veces.
- **Respuesta (2026-10-16): (a) → D31.**

**P27. ¿Sobre qué monto se calcula el IVA?** Ejemplo: piezas por $1,000, 10 % de descuento y 10 % de comisión del recomendador: $990 antes de IVA.
- (a) Sobre el total que paga el cliente, después del descuento y la comisión: IVA de $158.40, total $1,148.40.
- (b) Solo sobre las piezas con descuento ($900), sin la comisión: IVA de $144, total $1,134.
- **Recomendado: (a)**, porque es lo que el cliente te paga. Confírmalo con tu contador: la comisión que le pasas al recomendador puede tratarse distinto.
- **Respuesta (2026-10-16): (a) → D32.**

**P28. ¿En qué base de Notion se registran las ventas?** Hoy la app escribe en la base configurada en Vercel; el código la llama «Ventas Costeo» y el `README.md` «Ventas 2026». En tu página «Ventas» tienes «Ventas 2026», «Venta mensual 2026», «Ingresos» y «Ventas Costeo».
- (a) «Ventas 2026».
- (b) «Ventas Costeo».
- (c) Otra, o varias: dime cuáles y para qué usas cada una.
- **Sin recomendación:** depende de cuál revisas tú para saber cuánto vendiste. D4 dice que debía conectarse con lo que ya llevas.
- **Respuesta (2026-10-16):** «Quiero utilizar firebase para la base de datos (si tienes otra propuesta avísame), para gestionar accesos de usuarios, la idea es lanzar la aplicación a las tiendas» → D33. Notion sale del proyecto y D4 queda superada. La otra propuesta se revisó en §4.10: se recomienda quedarse con Firebase.

**P29. ¿Cuándo se manda una venta a Notion?** Hoy se manda una sola vez, al aceptar, y después no se actualiza. Ejemplo: la COT-0007 se acepta el lunes, se entrega el viernes y el saldo llega el lunes siguiente.
- (a) Al aceptar se crea el registro, y se actualiza con cada cambio de estado y cada pago.
- (b) Solo al entregar.
- (c) Un registro por cada pago, como ingreso.
- **Recomendado: (a).** Una venta es un renglón que va cambiando; así Notion siempre dice en qué va y cuánto falta por cobrar.
- **Respuesta (2026-10-16):** «ya no se usara notion, se explico en la pregunta anterior» → sin efecto (D33).

**P30. ¿Qué fecha lleva la venta en Notion?** Hoy manda la fecha de la cotización. Ejemplo: cotizas el 28 de septiembre y aceptan el 2 de octubre.
- (a) La fecha de aceptación (2 de octubre), y aparte la de entrega cuando exista.
- (b) La fecha de la cotización, como hoy.
- **Recomendado: (a).** La venta ocurre cuando el cliente acepta; con la fecha de la cotización, una venta de octubre aparece en septiembre.
- **Respuesta (2026-10-16):** «ya no se usara notion, se explico en la pregunta anterior» → sin efecto (D33).

### Bloque 4 — cuentas, acceso y tiendas (2026-10-16)

Sale de D33: con cuentas de Firebase y la app en las tiendas, hace falta decidir quién la usa, cómo entra y qué pasa con sus datos. Los requisitos de las tiendas que se citan están en §4.10.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P31 | ¿Otros negocios podrán usar la app? | (b) sí, después de una prueba cerrada contigo | Respondida (b) → D34 |
| P32 | Con qué nombre se publica | (a) «Quotia», si la usarán otros negocios | Respondida (a) → D35 |
| P33 | ¿Varias personas pueden entrar al mismo negocio? | (a) una persona por negocio al lanzar | Respondida (a) → D36 |
| P34 | Con qué se inicia sesión | (b) correo, Google y Apple | Respondida (c) → D37 |
| P35 | En qué tiendas y en qué orden | (a) Google Play primero, App Store después | Respondida (a) → D38 |
| P36 | ¿Se puede usar sin cuenta? | (a) sí, como invitado | Respondida (a) → D39 |
| P37 | Qué pasa con los datos de invitado al crear la cuenta | (a) se suben solos; si la cuenta ya tiene datos, pregunta | Respondida (a) → D40 |
| P38 | Cómo se borra una cuenta | (a) de inmediato, con respaldo ofrecido antes | Respondida (a) → D41 |
| P39 | ¿La app se cobra? | (a) gratis al lanzar | Respondida (a) → D42 |
| P40 | En qué países se publica | (a) solo México | Respondida (a) → D43 |

**P31. ¿Otros negocios podrán usar la app?** Hoy está hecha para tu negocio: sus valores iniciales son tus impresoras y tus precios. Ejemplo: un taller de impresión 3D en Monterrey la encuentra en la tienda y la descarga.
- (a) Sí, desde el lanzamiento: cada cuenta es un negocio con sus propios datos, impresoras y precios.
- (b) Sí, pero primero una prueba cerrada solo contigo y con quien invites; después se abre.
- (c) No: solo tu negocio la usa.
- **Recomendado: (b).** Las dos tiendas permiten pruebas cerradas antes de publicar, y así los errores aparecen con tus pedidos reales antes de que los vea otro negocio.
- **Respuesta (2026-10-16): (b) → D34.**

**P32. ¿Con qué nombre se publica?** El identificador de la app (por ejemplo, `mx.lacasitadelmolde.calculadora`, el que propone `ANDROID.md`) no se puede cambiar después de publicar; el nombre visible sí. Ejemplo: el taller de Monterrey busca «cotizador 3D» en la tienda.
- (a) «Quotia», la identidad de julio; «La Casita del Molde» queda como tu negocio dentro de la app.
- (b) «La Casita del Molde».
- (c) Otro nombre.
- **Recomendado: (a), si otros negocios la van a usar (P31).** Una app con el nombre de tu taller confunde a otro taller, y el identificador debe llevar el nombre del producto, no el del taller.
- **Respuesta (2026-10-16): (a) → D35.**

**P33. ¿Varias personas pueden entrar al mismo negocio?** Hoy la base está diseñada para una persona por negocio: todo cuelga de su cuenta. Ejemplo: un ayudante que imprime y marca «En producción», pero no debe ver tus costos ni tus márgenes.
- (a) Una persona por negocio.
- (b) Varias personas, con roles: el dueño ve todo; un ayudante ve pedidos y producción, sin costos.
- (c) Varias personas, y todas ven todo.
- **Recomendado: (a) al lanzar.** Si crees que en el primer año vas a tener ayudantes, dímelo: conviene armar la base por negocio desde el inicio aunque tenga una sola persona, porque cambiarla después obliga a mover todos los datos.
- **Respuesta (2026-10-16): (a) → D36.** «El primer mvp, si avanza podemos generar roles». Cómo preparar la base para eso: P43.

**P34. ¿Con qué se inicia sesión?** Hoy la pantalla de acceso simula correo, Google y entrar sin cuenta. Ejemplo: quien usa Android espera entrar con su cuenta de Google.
- (a) Solo correo y contraseña.
- (b) Correo, Google y Apple.
- (c) Correo y Google.
- **Recomendado: (b).** Si la app ofrece Google, la App Store exige otra opción equivalente que proteja el correo, y la de Apple cumple. Con (a) no hace falta Apple, pero cada persona tiene que crear y recordar otra contraseña. (c) solo sirve si nunca se publica en la App Store.
- **Respuesta (2026-10-16): (c) → D37.** «de momento no se va a publicar en la tienda de apple, aunque más adelante si existe la posibilidad». Antes de llegar a la App Store se agrega Apple (§4.11).

**P35. ¿En qué tiendas, y en qué orden?** La versión de iPhone se compila en una Mac con Xcode o con un servicio en la nube, y tú trabajas en Windows. La cuenta de desarrollador cuesta 25 USD una vez en Google Play y 99 USD al año en Apple.
- (a) Google Play primero y la App Store después.
- (b) Las dos al mismo tiempo.
- (c) Solo Google Play.
- **Recomendado: (a).** Android Studio corre en Windows y la ruta de `ANDROID.md` ya está armada para Android; la App Store se agrega cuando la app esté probada, con una Mac o un servicio de compilación.
- **Respuesta (2026-10-16): (a) → D38.**

**P36. ¿Se puede usar la app sin cuenta?** Hoy sí: se entra como invitado y los datos se quedan en el teléfono. Apple pide dejar usar la app sin cuenta si lo principal no depende de ella. Ejemplo: alguien la descarga para probar una cotización antes de dar su correo.
- (a) Sí, como invitado, con los datos solo en ese teléfono; la cuenta se pide para respaldar y usar varios dispositivos.
- (b) No: la cuenta es obligatoria desde la primera pantalla.
- **Recomendado: (a).** Es como funciona hoy y deja probar la app sin compromiso. El riesgo es que un invitado pierda sus datos si cambia de teléfono, así que conviene recordárselo.
- **Respuesta (2026-10-16): (a) → D39.**

**P37. ¿Qué pasa con los datos de invitado al crear la cuenta?** Ejemplo: usaste la app dos semanas como invitado, con 12 cotizaciones, y después creas tu cuenta.
- (a) Se suben solos a la cuenta nueva. Si entras a una cuenta que ya tiene datos, la app pregunta qué conservar.
- (b) Siempre pregunta antes de subir.
- (c) Se descartan: la cuenta empieza vacía.
- **Recomendado: (a).** Una cuenta nueva no tiene nada que perder, y preguntar solo cuando hay datos en los dos lados evita lo que encontró la auditoría: un teléfono vacío que borra una cuenta con datos.
- **Respuesta (2026-10-16): (a) → D40.**

**P38. ¿Cómo se borra una cuenta?** Las dos tiendas exigen poder borrar la cuenta y sus datos desde la app, y Google Play pide además una liga web. Ejemplo: un taller deja de usar la app y pide borrar todo.
- (a) Se borra todo de inmediato, después de confirmar y de ofrecer descargar un respaldo.
- (b) La cuenta se desactiva y se borra a los 30 días si la persona no vuelve a entrar.
- **Recomendado: (a).** Es lo más claro para quien la borra y para la revisión de las tiendas, que no aceptan solo desactivar. El respaldo cubre el arrepentimiento.
- **Respuesta (2026-10-16): (a) → D41.**

**P39. ¿La app se cobra?** Si la app desbloquea funciones con un pago o una suscripción, las dos tiendas obligan a cobrar con su sistema de pagos y se quedan con una comisión. Ejemplo: un taller la usa gratis y quiere funciones extra.
- (a) Gratis al lanzar; cobrar se decide cuando haya negocios usándola.
- (b) Gratis, con una suscripción para funciones extra, cobrada por la tienda.
- (c) Pago único al descargar.
- **Recomendado: (a).** Cobrar desde el inicio obliga a definir qué es gratis y qué no, y a conectar el cobro de las dos tiendas, antes de saber si otro negocio la usa.
- **Respuesta (2026-10-16): (a) → D42.** «se pueden generar planes cuando el desarrollo esté terminado».

**P40. ¿En qué países se publica?** El IVA del 16 %, el RFC y el CFDI de D21 y D22 son de México. Ejemplo: un taller de Bogotá la descarga y cotiza en pesos colombianos con su propio impuesto.
- (a) Solo México.
- (b) Latinoamérica, con moneda, impuesto y datos fiscales configurables por país.
- **Recomendado: (a) al lanzar.** Las tiendas dejan elegir en qué países aparece la app, y D21 y D22 ya están pensados para México. Abrir otros países obliga a revisar los datos fiscales de cada uno.
- **Respuesta (2026-10-16): (a) → D43.**

### Bloque 5 — cierre (2026-10-16)

Es el último bloque: son 8 preguntas porque es lo que falta, no se rellenó hasta 10. Con estas respuestas se cierran las reglas de negocio y sigue `flujos.md`.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P41 | ¿El IVA cobrado cuenta como ingreso? | (a) no: va aparte como «IVA cobrado» | Respondida (a) → D44 |
| P42 | Cómo se le entrega la información al contador | (a) Excel del mes desde la app | Respondida (a) → D45 |
| P43 | Cómo se prepara la base para los roles futuros | (a) por negocio desde el MVP | Respondida (a) → D46 |
| P44 | Con qué arranca un negocio nuevo | (a) lista de impresoras y materiales comunes para elegir | Respondida (a) → D47 |
| P45 | Cuenta de desarrollador personal o de organización | (a) personal, con la prueba cerrada de 12 personas | Respondida (a) → D48 |
| P46 | ¿Sigue la versión web de escritorio? | (a) sí, con la misma cuenta y los mismos datos | Respondida (a) → D49 |
| P47 | Qué entra a la primera versión | (b) un primer corte; la base se diseña completa | Respondida (b) → D50 |
| P48 | Quién redacta el aviso de privacidad | (b) borrador del asistente, revisado por un profesional | Respondida (b) → D51 |

**P41. ¿El IVA cobrado cuenta como ingreso?** Con D30, la comisión del recomendador ya no cuenta como tuyo; el IVA es otro dinero que solo pasa por tus manos. Ejemplo: piezas por $1,000, 10 % de descuento, 10 % de comisión y el IVA: el cliente paga $1,148.40.
- (a) No: tu ingreso es $900; aparte quedan $158.40 de «IVA cobrado» y $90 «por pagar al recomendador».
- (b) Sí: tu ingreso es $1,058.40 (todo menos la comisión).
- **Recomendado: (a).** El IVA cobrado se entera al SAT, no es tuyo; contarlo como ingreso infla tu margen igual que la comisión. Confírmalo con tu contador.
- **Respuesta (2026-10-16): (a) → D44.** «se añade a la información del dashboard».

**P42. ¿Cómo se le entrega la información al contador?** Antes lo que vendías quedaba en Notion; con D33 ya no. Ejemplo: fin de mes, tu contador te pide lo que cobraste y el IVA.
- (a) Un Excel del mes, desde la app, con cada pago, el IVA cobrado y las comisiones por pagar.
- (b) Un PDF de resumen del mes.
- (c) No hace falta: lo consultas en el panel y se lo pasas a mano.
- **Recomendado: (a).** Es lo que un contador puede trabajar sin volver a capturar, y la app ya genera Excel para la lista de precios ([`js/catalog.js:461`](../js/catalog.js)).
- **Respuesta (2026-10-16): (a) → D45.**

**P43. ¿Cómo se prepara la base de datos para los roles que vendrán?** Con D36, el MVP tiene una persona por negocio y los roles llegan «si avanza». Hoy la base está diseñada por persona: todo cuelga de su cuenta. Ejemplo: dentro de un año agregas a un ayudante a tu negocio.
- (a) Por negocio desde el MVP: cada negocio es un registro con sus datos y una lista de personas, que al principio tiene solo una.
- (b) Por persona, como está diseñada; si llegan los roles, se mueven los datos.
- **Recomendado: (a).** Cuesta un poco más ahora, en las reglas de seguridad, y evita mover los datos de todos los negocios cuando lleguen los roles. Es un agregado mío sobre el diseño de `BASE-DE-DATOS.md`.
- **Respuesta (2026-10-16): (a) → D46.**

**P44. ¿Con qué arranca un negocio nuevo?** Hoy los valores iniciales son tus 4 impresoras, 5 materiales con tus precios, $2,000 de gastos fijos inventados y dos clientes de ejemplo ([`js/store.js:52`](../js/store.js)). La introducción de 5 pasos explica, pero no pide datos. Ejemplo: el taller de Monterrey abre la app por primera vez.
- (a) Elige de una lista de impresoras y materiales comunes, con precios de referencia que puede cambiar, y la introducción le pide sus gastos fijos y sus horas de impresión al mes. Sin clientes de ejemplo.
- (b) Todo vacío: captura todo antes de cotizar.
- (c) Tus valores actuales, como ejemplo.
- **Recomendado: (a).** Con (b) su primera cotización sale en $0 hasta que capture todo; con (c) cotiza con tus costos sin darse cuenta.
- **Respuesta (2026-10-16): (a) → D47.**

**P45. ¿La cuenta de desarrollador de Google Play es personal o de organización?** Una cuenta personal nueva necesita una prueba cerrada con al menos 12 personas durante 14 días seguidos antes de publicar. Una de organización no tiene ese requisito (según una fuente no oficial), pero pide un número D-U-N-S del negocio, que se tramita aparte.
- (a) Personal, y la prueba cerrada de D34 se hace con 12 personas: otros talleres, clientes de confianza o amigos.
- (b) De organización, con el número D-U-N-S.
- **Recomendado: (a).** La prueba cerrada ya está decidida (D34), así que el requisito no agrega un paso; solo pide juntar 12 personas que la usen dos semanas.
- **Respuesta (2026-10-16): (a) → D48.**

**P46. ¿Sigue la versión web de escritorio?** Hoy la app es una página web con versión de escritorio (barra lateral, cajones laterales), y la liga pública de la cotización también vive en la web. Ejemplo: armas cotizaciones largas en la computadora y las revisas en el teléfono.
- (a) Sí: la web y la app de Android usan la misma cuenta y los mismos datos.
- (b) No: solo la app de Android; la web se apaga.
- **Recomendado: (a).** La versión de escritorio ya existe, Firebase funciona igual en la web, y con teclado se cotiza más rápido.
- **Respuesta (2026-10-16): (a) → D49.** «hay que revisar lo del dominio y como funciona la gestión de usuarios». Revisión en §4.13.

**P47. ¿Qué entra a la primera versión que va a la prueba cerrada?** Este documento ya tiene 43 decisiones; construirlas todas antes de probar retrasa saber si funcionan. Ejemplo: la prueba cerrada empieza con 12 talleres que cotizan sus pedidos reales.
- (a) Todo lo decidido en este documento.
- (b) Un primer corte. Entran: cuentas y Firebase con modo sin conexión, el ciclo de vida completo con Cancelada, anticipo y pagos, fecha de entrega y vigencia, ingreso y ganancia por pago, y la comisión del recomendador fuera del ingreso. Después: IVA y datos fiscales, canales de marketplace, control de pago del recomendador, empaque por pieza y exportar para el contador.
- (c) Solo cuentas y Firebase sobre la app de hoy; las reglas nuevas después.
- **Recomendado: (b), con la base de datos diseñada completa desde el inicio.** Lo que se prueba es el flujo de un pedido de principio a fin; el IVA y los marketplaces sirven a clientes y canales que la prueba no necesita. Diseñar la base completa evita moverla cuando entre lo demás. El corte es propuesta mía: muévelo como quieras.
- **Respuesta (2026-10-16): (b) → D50.** «empezamos con lo básico y con la información que se obtenga de los usuarios podemos seguir con las implementaciones e incluir más cosas».

**P48. ¿Quién redacta el aviso de privacidad?** Google Play pide una liga a la política de privacidad, y la app guarda datos personales de los clientes de cada negocio: nombres, teléfonos y, con factura, RFC. Ejemplo: un taller pregunta qué haces con los datos de sus clientes.
- (a) Un abogado, desde cero.
- (b) Un borrador que escribe el asistente con lo que la app guarda de verdad, revisado por un abogado o tu contador antes de publicarlo.
- (c) Una plantilla de internet, sin revisión.
- **Recomendado: (b).** El borrador ahorra tiempo y parte de los datos reales de la app; la revisión profesional es necesaria porque es un documento legal.
- **Respuesta (2026-10-16): (b) → D51.**

### Revisión de dominio y usuarios (2026-10-16)

Salen de la revisión que pidió Francisco en P46 (§4.13). Son 4 porque es lo que la revisión dejó abierto.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P49 | ¿Se queda el nombre «Quotia»? | (a) sí, después de revisar el IMPI y Google Play | Respondida (a) → D52 · sigue en P53 |
| P50 | Qué dominio | (a) quotia.mx, si está libre | Respondida: quotia.mx está ocupado · sigue en P53 |
| P51 | Dónde se publica la versión web | (a) Vercel, con el dominio propio | Respondida con una pregunta (§4.13) · sigue en P54 |
| P52 | ¿Se pide confirmar el correo? | (a) sí, con recordatorio, sin bloquear | Respondida (a) → D53 |

**P49. ¿Se queda el nombre «Quotia»?** No apareció ningún producto con ese nombre, pero sí dos parecidos en la misma categoría: «Quotae», cotizaciones y facturas para iPhone y Android, y «Quoti», cotizaciones por WhatsApp para contratistas. Ejemplo: un taller busca «Quotia» en Google Play y le sale «Quotae» primero.
- (a) Se queda, después de buscarlo en Marcanet (el buscador de marcas del IMPI) y en Google Play, y antes de pagar el dominio y la cuenta de desarrollador.
- (b) Se busca otro nombre ahora.
- **Recomendado: (a).** Parecido no es lo mismo, pero el identificador de la app no se puede cambiar después de publicar (D35), así que conviene confirmarlo antes. Si quieres registrar la marca, eso ya es trámite con el IMPI.
- **Respuesta (2026-10-16): (a) → D52.** Al seguir la revisión apareció un QUOTIA en español (§4.13): se vuelve a preguntar en P53.

**P50. ¿Qué dominio?** Hace falta uno propio para la versión web, la liga que reciben los clientes, la política de privacidad y la liga para borrar la cuenta (§4.13). Ejemplo: un cliente recibe por WhatsApp la liga de su cotización.
- (a) `quotia.mx`, si está libre.
- (b) `quotia.com` o `quotia.app`.
- (c) Seguir con `calculadora3-d-delta.vercel.app`.
- **Recomendado: (a).** La app es solo para México (D43) y la terminación .mx se reconoce aquí. (c) se descarta porque la liga que recibe el cliente parece provisional y se confunde con el otro producto que tiene casi la misma dirección.
- **Respuesta (2026-10-16):** «al revisar, el dominio mx ya no esta disponible». Las alternativas se revisaron en §4.13 y se preguntan en P53.

**P51. ¿Dónde se publica la versión web?** Al retirar Notion, la app ya no necesita funciones de servidor. Hoy cada cambio que llega a `main` se publica solo en Vercel.
- (a) Se queda en Vercel, con el dominio propio, y Google se usa en la web con ventana emergente.
- (b) Pasa a Firebase Hosting: todo en un solo proyecto, y el inicio de sesión por redirección funciona sin ajustes.
- **Recomendado: (a).** Conserva la publicación automática que ya usas, y la ventana emergente funciona bien en escritorio, que es donde se usa la web (D49). (b) conviene si algún día la web se usa mucho en teléfonos.
- **Respuesta (2026-10-16):** «Con el limite de ancho de banda, podemos atender a muchos usuarios?». Sí: la respuesta con números está en §4.13. Al revisarlo apareció que el plan gratuito de Vercel no permite uso comercial, y eso cambia la recomendación: se vuelve a preguntar en P54.

**P52. ¿Se pide confirmar el correo al crear una cuenta con correo y contraseña?** Ejemplo: alguien escribe mal su correo al registrarse y un mes después olvida su contraseña; el correo para restablecerla nunca le llega.
- (a) Sí: Firebase le manda el correo para confirmar y la app se lo recuerda mientras no lo haga, pero puede usarla.
- (b) Sí, y no puede usar la cuenta hasta confirmarlo.
- (c) No se pide.
- **Recomendado: (a).** Detecta los correos mal escritos a tiempo sin frenar a quien apenas está probando la app. Con Google no aplica: el correo ya viene confirmado.
- **Respuesta (2026-10-16): (a) → D53.**

### Seguimiento de la revisión (2026-10-16)

Salen de tus respuestas a P49–P51 y de lo que se encontró al revisarlas (§4.13).

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P53 | Con qué nombre y dominio se sigue | (b) «Quotia 3D» con quotia3d.com | Respondida (c) → D54 · sigue en P55 |
| P54 | Dónde se publica la versión web | (a) Firebase Hosting con el dominio propio | Respondida (a) → D55 |

**P53. ¿Con qué nombre y dominio seguimos?** En `quotia.app` ya hay un QUOTIA en español para cobrar cuotas diarias de préstamos, y `quotia.mx`, `.com`, `.app` e `.io` están ocupados. Ejemplo: un taller busca «Quotia» en Google y le sale una plataforma de préstamos.
- (a) «Quotia», con `quotia.com.mx`, que parece libre y se confirma al comprarlo. Comparte nombre con la plataforma de cobranza.
- (b) «Quotia 3D», con `quotia3d.com`, que está libre. Conserva la identidad de julio, se distingue de la de cobranza y dice qué hace.
- (c) Otro nombre.
- **Recomendado: (b).** El identificador de la app no se puede cambiar después de publicar (D35), y con el nombre exacto ya en uso en español conviene distinguirse desde el inicio. La búsqueda en Marcanet (D52) sigue antes de pagar.
- **Respuesta (2026-10-16): (c) → D54.** Otro nombre; los candidatos están en P55.

**P54. ¿Dónde se publica la versión web?** El plan gratuito de Vercel es solo para uso no comercial, y Quotia la usa un negocio y tendrá planes. El ancho de banda no es problema en ninguno (§4.13).
- (a) Firebase Hosting, con el dominio propio: gratis hasta 10 GB al mes, en el mismo proyecto que las cuentas, y el inicio de sesión con Google funciona sin ajustes. La publicación automática al subir cambios a `main` se configura una vez, con GitHub.
- (b) Vercel Pro, con el dominio propio: unos 20 USD al mes por persona, y la publicación sigue como hoy.
- (c) Vercel Hobby, como hoy: no cumple sus reglas para un uso comercial.
- **Recomendado: (a).** Es gratis para el tamaño de la app, cumple las reglas y junta todo en Firebase. Cambia cómo se publica, pero la configuración se hace una sola vez y se puede hacer contigo paso a paso. Esto cambia la recomendación que di en P51, por la regla de Vercel que apareció al revisar.
- **Respuesta (2026-10-16): (a) → D55.**

### Nombre (2026-10-16)

Sale de D54. Se buscaron nombres en español que digan qué hace la app, con dominio `.com` libre en el registro público y sin una app con el mismo nombre en las búsquedas (2026-10-16).

| Candidato | Dominio | Qué dice | En contra |
|---|---|---|---|
| Placa 3D | `placa3d.com` libre; `placa3d.com.mx` sin registros en DNS | La placa es la idea propia de la app: el slicer da la placa completa y la app la reparte entre las piezas | En México «la placa» también se dice de la policía; con «3D» se entiende |
| Costeo 3D | `costeo3d.com` libre; `costeo3d.com.mx` sin registros en DNS | Dice exactamente qué hace | Solo describe, y un nombre así es más difícil de registrar como marca |
| Tarifa 3D | `tarifa3d.com` libre | Precio, en una palabra | En México «tarifa» se usa más para servicios que para productos |

Libres también, sin evaluar a fondo: `cotizapieza.com`, `capacosto.com`, `filacosto.com`. Ocupados: `cotiza3d.com`, `capa3d.com`, `moldea.com`, `moldea.app`.

En la misma categoría ya hay apps en español que cotizan impresión 3D, como Bugeo App (costos, PDF e inventario) y 3DCalc+. Ninguna se llama como los candidatos, y conviene tenerlas en cuenta para diferenciarse.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P55 | Cuál es el nombre de la app | (a) «Placa 3D» | Respondida (a) → D56 |

**P55. ¿Cuál es el nombre de la app?** Ejemplo: un taller busca en Google Play «cotizar impresión 3D» y ve el nombre junto a Bugeo App y 3DCalc+.
- (a) «Placa 3D», con `placa3d.com`.
- (b) «Costeo 3D», con `costeo3d.com`.
- (c) «Tarifa 3D», con `tarifa3d.com`.
- (d) Uno tuyo: dime cuál y reviso su dominio y si ya existe.
- **Recomendado: (a).** Nombra lo que hace distinta a la app, que es repartir la placa entre las piezas, se distingue de las otras calculadoras y tiene el `.com` libre. Antes de pagar se busca en Marcanet y en Google Play (D52).
- **Respuesta (2026-10-16): (a) → D56.** «Utiliza placa3d (mantenlo por ahora, se puede cambiar)».

Fuentes: [registro público de .com (RDAP)](https://rdap.verisign.com/com/v1/) · [Bugeo App](https://mwm.ai/apps/bugeo3d/6760218974) · [3DCalc+](https://apps.apple.com/app/id6752701677)

### Publicación y seguridad (2026-10-16)

Salen de revisar, antes del primer *merge* a `main`, qué publica hoy el sitio.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P69 | Qué archivos publica el sitio | (a) excluir todo lo que no es la app, antes de juntar a `main` | Respondida (a) → D70 |
| P70 | Qué se hace con la sincronización a Notion mientras llega Firebase | (a) cortarla hoy en Vercel y quitar el código en el mismo cambio | Respondida (a) → D71 |

**P69. ¿Qué archivos publica el sitio?** Hoy publica todo el repo: el 2026-10-16 se comprobó que `/docs/AUDITORIA.md`, `/MEJORAS.md`, `/CHANGELOG.md` y `/docs/BASE-DE-DATOS.md` se abren en la dirección de la app. Al juntar esta rama a `main` se publicarían también estas reglas y el análisis de competencia. Ejemplo: un competidor abre `/docs/competencia.md`.
- (a) Antes de juntar a `main`, un archivo `.vercelignore` que deje fuera lo que no es la app: `docs/`, los `.md`, `tests/`, `ordenes/`, `node_modules/`, la carpeta `calculadora 3d/`, los `.zip`, los `.docx` y `deploy.sh`. Con Firebase Hosting (D55) se pone lo mismo en su configuración.
- (b) Dejarlo así.
- **Recomendado: (a).** Es un archivo de texto, no toca la app, y deja de publicar decisiones de negocio, precios de proveedores (`ordenes/`) y una auditoría que describe puntos débiles.
- **Respuesta (2026-10-16): (a) → D70.**

**P70. ¿Qué se hace con la sincronización a Notion mientras llega Firebase?** `/api/sync/pull` y `/api/sync/push` no piden contraseña. Si en Vercel existen las variables `NOTION_TOKEN` y `NOTION_STATE_DB_ID`, cualquiera con la dirección puede descargar o reemplazar la copia de tus datos: clientes, teléfonos y cuenta bancaria. No se pudo comprobar si hoy responden con datos: esa revisión tocaba datos personales y la sesión la bloqueó. Ejemplo: alguien lee la auditoría publicada y prueba la dirección.
- (a) Hoy, borras en Vercel › Settings › Environment Variables la variable `NOTION_STATE_DB_ID`: las dos funciones dejan de responder. Y en el mismo cambio del `.vercelignore` se quitan esas funciones y el botón «Sincronizar», que D33 ya decidió retirar.
- (b) Solo borrar la variable.
- (c) Esperar a la migración a Firebase.
- **Recomendado: (a).** Borrar la variable se hace en el panel en un minuto y corta el riesgo de inmediato; quitar el código evita que vuelva. Si hoy usas «Sincronizar» para pasar datos entre teléfono y computadora, eso deja de funcionar: el respaldo de Ajustes › Exportar e Importar sigue disponible.
- **Respuesta (2026-10-16): (a) → D71.**
- **Actualización (2026-10-16):** Francisco no tiene acceso a la cuenta de Vercel por ahora. El corte llega al juntar v101 a `main`, porque Vercel publica solo desde GitHub. Borrar `NOTION_STATE_DB_ID` queda como limpieza para cuando recupere el acceso.
- **Actualización (2026-11-03):** v101 está publicado (Pull Request #1). Comprobado solo con códigos de estado: la app responde 200 con la caché `calc3d-v101`, y `/MEJORAS.md`, `/CHANGELOG.md`, `/README.md`, `/docs/AUDITORIA.md`, `/docs/reglas-de-negocio.md`, `/js/sync.js`, `/api/sync/pull` y `/api/sync/push` responden 404. Sigue pendiente borrar `NOTION_STATE_DB_ID` en Vercel; ya no hay código que la use.

### Limpieza del repositorio (2026-11-03)

Francisco pidió revisar qué no sirve en el repositorio y preguntarle antes de sacarlo de git.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P98 | ¿Se saca `node_modules/` de git? | (a) sí | Respondida (a) → D99 |
| P99 | ¿Se sacan `calculadora 3d/` y `calculadora 3d.zip`? | (a) sí | Respondida «si» → D100 |
| P100 | ¿Se sacan los tres `.docx`? | (a) sí, con una copia fuera del repo si se quiere | Respondida (a) → D101 |
| P101 | ¿Qué se hace con `ordenes/`? | (a) sacar las dos e ignorar la carpeta | Respondida (a) → D102 |
| P102 | ¿Se quita `deploy.sh`? | (a) sí, con su sección del `README.md` | Respondida (a) → D103 |

**P98. ¿Se saca `node_modules/` de git?** Son 142 archivos y 17.5 MB, el 90 % del repo: la librería `sharp` para Linux, que ningún script usa. Ya estaba en `.gitignore`, pero se subió antes.
- (a) Sí; `npm install` lo vuelve a crear si hace falta. (b) No.
- **Respuesta (2026-11-03): (a) → D99.**

**P99. ¿Se sacan `calculadora 3d/` y `calculadora 3d.zip`?** El paquete de diseño original de La Casita del Molde: prototipo y 5 capturas. Ya estaban en `.gitignore`, y en la carpeta principal ya se habían borrado.
- (a) Sí. (b) No, como referencia de diseño.
- **Respuesta (2026-11-03): «si» → D100.**

**P100. ¿Se sacan los tres `.docx`?** La documentación de la versión 1 (abril), superada por el `README.md`, el `CHANGELOG.md` y `docs/`.
- (a) Sí, con una copia fuera del repo si se quiere. (b) No.
- **Respuesta (2026-11-03): (a) → D101.**

**P101. ¿Qué se hace con `ordenes/`?** `ejemplo.md` está vacío, y `OC-2026-07-29-01.md` es una orden de compra de imanes y filamento.
- (a) Sacar las dos e ignorar la carpeta, como los respaldos; la orden se guarda fuera del repo. (b) Sacar solo `ejemplo.md`.
- **Respuesta (2026-11-03): (a) → D102.**

**P102. ¿Se quita `deploy.sh`?** Hace `git add .`, commit y push de un jalón; ya se publica con GitHub Desktop.
- (a) Sí, con su sección del `README.md`. (b) No.
- **Respuesta (2026-11-03): (a) → D103.**

### Integración de Firebase (2026-11-09)

Francisco pidió revisar qué cambia entre `main` y la rama `integración-firebase`. Las dos apuntan al mismo commit, `5355271` («🎉 Conexión inicial a firebase», de Javi Gama, 2026-11-06), así que Firebase ya está en `main` y publicado (caché `calc3d-v105`, comprobado el 2026-11-09). Problemas encontrados:

- **Entrar con cuenta puede borrar los datos del dispositivo.** Al crear la cuenta, la app se conecta a la nube vacía antes de ofrecer subir los datos, y reemplaza con «nada» las cotizaciones, clientes, rollos y ajustes del dispositivo ([`js/db.js:148`](../js/db.js), [`:247`](../js/db.js)). En otro dispositivo, con una cuenta que ya existe, ni siquiera ofrece subirlos. Comprobado el 2026-11-09 corriendo `js/db.js` con un Firestore simulado: con la nube respondiendo en 0.3 s, quedaron 0 de 3 cotizaciones y 0 de 2 clientes, se subieron 0, y la app dijo «✓ Tus datos ya están en la nube». No se probó con el Firebase real: eso pide crear cuentas en él.
- **Sin conexión, la app no abre.** `index.html` pide `js/auth.js?v=105`, `js/db.js?v=105` y `js/onboarding.js?v=105`, que el service worker no tiene guardados con ese nombre, y tampoco guarda la librería de Firebase. Comprobado en la caché de la app publicada el 2026-11-09.
- **Las reglas de seguridad no están en el repo.** No se sabe si la consola quedó en «modo de prueba».

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P103 | ¿Ya entraste con una cuenta en el dispositivo donde tienes tus cotizaciones? | — (era un dato) | Respondida: creó la cuenta en el teléfono y entró en la web; «eso funciona». Falta saber si sus cotizaciones siguen: P107 |
| P104 | Qué hacer con la versión publicada mientras se corrige | (a) regresar `main` a v102 | Respondida: «todo se agregó en main y funciona» → D104 (con interpretación) |
| P105 | Cómo quedan las reglas de seguridad | (a) las del §6 de `modelo-de-datos.md`, también en `firestore.rules` | Pendiente: Francisco no sabe cuáles hay. Desde el 2026-11-09 están en `firestore.rules` para que Javi las revise y publique → D108 |
| P106 | Quién corrige los dos problemas graves | (b) Javi, con una lista | Francisco preguntó qué problemas hay; se explicó y se vuelve a preguntar en P109 |
| P107 | ¿Siguen tus cotizaciones de antes? | — (era un dato) | Respondida: «no, se borró lo que tenía» |
| P108 | ¿Se interpretó bien D104? | (a) sí | Respondida «si» → D105 |
| P109 | Quién corrige los problemas 1 y 2 | (b) Javi, con una lista | Respondida (a) → D106 |
| P110 | Cómo se recuperan los datos borrados | (b) buscar un dispositivo sin la cuenta, y luego (a) la copia de Notion | Respondida: no se recuperan → D107 |
| P111 | Qué registros se borran | — (era un dato) | Respondida → D111 |
| P112 | Quién corrige que se borren registros | (a) Claude, ahora | Respondida → D112; corregido en v107 |
| P113 | ¿Se interpretó bien D109? | (a) sí, para todos | Respondida (a) → D110 |

**Comprobado por Francisco el 2026-11-09, en v106:** la app ya abre sin conexión (antes se quedaba en negro) y la configuración se guarda en la cuenta; «los registros se borran». **Por qué:** cada aviso de la nube reemplaza la lista completa del dispositivo, y se pierde lo que se guardó solo en él: duplicar una cotización, el cliente que se crea al guardar una cotización y el id de Notion. El historial de cálculos y los favoritos nunca suben. Detalle y arreglo sugerido en [`firebase.md`](firebase.md) §3.

**Corregido en v107** (2026-11-09). La causa era más amplia que la de P111: cada aviso de la nube reemplazaba la lista completa del dispositivo, y se perdía todo lo que no hubiera alcanzado a subir, también los gastos guardados justo antes de cerrar la app (esperaban 0.8 s para subir). Ahora `js/db.js` junta los dos lados: recuerda cómo llegó cada registro la última vez de la nube, y así distingue qué cambió en el dispositivo y qué en la nube; lo que nunca subió se conserva y se sube; cualquier `sv()` sube lo que cambió; los ajustes suben al ocultarse la app; y el historial de cálculos y los favoritos ya viven en la nube. Comprobado con `js/db.js` y un Firestore simulado en tiempo real, con dos dispositivos y aperturas y cierres de la app: 20 de 20 pruebas, y abrir la app sin cambiar nada no escribe en la nube. La misma prueba sobre v106 reproduce lo que reportó Francisco: 13 fallas, con las cotizaciones, los clientes, los gastos fijos, los indirectos y los datos del negocio perdidos. No se probó con la cuenta real.

**Las reglas de Firebase hoy dejan leer a cualquiera** (comprobado el 2026-11-09: sin sesión, Firestore responde 404 y no 403 a un documento que no existe; solo se miró el código de respuesta). No es la causa de que se borren registros, pero cualquiera con la configuración del proyecto, que está en `js/auth.js`, puede leer los datos. Publicar `firestore.rules` es lo primero de [`firebase.md`](firebase.md).

**Los datos de La Casita del Molde se borraron** al entrar con la cuenta (P107, 2026-11-09): es el problema 1. No hay respaldos `calc3d_backup_*.json` en Descargas, Documentos ni el Escritorio (búsqueda por nombre, 2026-11-09). Queda de dónde recuperar: un dispositivo o navegador donde todavía no se haya entrado con la cuenta, y en Notion, la copia completa que guardaba la sincronización hasta v101 («App State — Calc3D») y las ventas aceptadas («Ventas Costeo»). Se pregunta en P110.

**Corregido en v106** (2026-11-09, en la rama `claude/project-review-e78fd0`, falta el Pull Request):

- **Entrar con cuenta ya no borra lo del dispositivo.** Lo que hay se decide antes de escuchar la nube: en una cuenta nueva se sube solo, ajustes incluidos (D40); en una cuenta que ya existía, la app pregunta si agregar las cotizaciones, los clientes y los rollos del dispositivo, y los ajustes de la cuenta se quedan (D86). Antes de subir, guarda una copia en el dispositivo (`c3d_respaldoAntesDeNube`, con el formato de Ajustes › Exportar). Sube en tandas de 450 (Firestore acepta 500) y sin campos vacíos, que hacían fallar la escritura completa. Comprobado con `js/db.js` y un Firestore simulado en 5 situaciones: con 600 cotizaciones, la cuenta nueva sube las 600 y conserva los gastos de $1,860; la cuenta que ya existía pregunta, y si se cancela no toca nada.
- **La app abre sin conexión.** `index.html` pide los archivos sin `?v=105`, y el service worker guarda también la librería de Firebase. Comprobado: los 29 archivos que pide `index.html` están en su lista, y los tres de Firebase se guardan en la caché (prueba en el navegador).
- **Importar un respaldo con sesión** también lo sube a la cuenta: sirve para recuperar datos.
- **«Otros (sin desglosar)» ya se puede borrar** de los gastos fijos. Volvía porque la app comparaba con el total anterior ($2,000, los de ejemplo que quedaron al borrarse los datos) y creaba «Otros» con la diferencia. Ahora eso pasa solo la primera vez que se desglosa un total escrito a mano.
- Lo que llega de la nube a Ajustes ya no se vuelve a escribir en ella cada vez que se abre la app.

**Sigue pendiente:** las reglas de seguridad (P105), el folio que da Firebase (D89), bajar solo lo vivo y los últimos 3 meses (D90), y que un taller nuevo empiece sin los datos de La Casita del Molde (D47).

---

## 6. Lo que sigue

1. ~~**[`flujos.md`](flujos.md)**, en curso desde el 2026-10-16, con sus diagramas de `/diagram-design`: la máquina de estados de la cotización (con Cancelada y regresar un paso), de la calculadora a la cotización, de invitado a cuenta, borrar la cuenta, pagos con saldo y cancelación, y de leer el archivo del slicer a la cotización (D57).~~ Hecho: los 7 flujos con sus diagramas, y sus preguntas (P66–P87) respondidas al 2026-11-03.
2. ~~**`base-de-datos.md`**: el modelo por negocio (D46), completo aunque la primera versión no use todo (§4.12), y al día con v100.~~ Hecho como [`modelo-de-datos.md`](modelo-de-datos.md) el 2026-11-03, con su diagrama; sus preguntas se respondieron el mismo día (D89–D98).
3. **Borrador del aviso de privacidad** (D51), antes de subir la app a Google Play.
4. **Buscar «Placa 3D» en Marcanet y en Google Play** antes de pagar el dominio y la cuenta de desarrollador (D52, D56). Le toca a Francisco.
5. ~~**Juntar v101 a `main`** con un Pull Request en GitHub: hasta entonces la app publicada sigue con la sincronización sin contraseña (D71) y con los documentos del repo a la vista (D70). Le toca a Francisco; la rama ya está en GitHub desde el 2026-11-03.~~ Hecho el 2026-11-03 (Pull Request #1, merge `92c5fb8`). Comprobado ese día, solo con códigos de estado: la app responde 200 con la caché `calc3d-v101`, y `/MEJORAS.md`, `/CHANGELOG.md`, `/README.md`, `/docs/AUDITORIA.md`, `/docs/reglas-de-negocio.md`, `/js/sync.js`, `/api/sync/pull` y `/api/sync/push` responden 404.
6. **Corregir la integración de Firebase:** ~~que entrar con cuenta no borre los datos, que la app abra sin conexión~~ corregido en v106 y publicado el 2026-11-09 (commit `294fe17`); ~~recuperar los datos de La Casita del Molde (P110)~~ no se recuperan (D107); ~~que se borren registros~~ corregido en v107 (D111, D112). Falta que Javi publique las reglas de seguridad, que hoy dejan leer a cualquiera (D108; guía en [`firebase.md`](firebase.md)).
