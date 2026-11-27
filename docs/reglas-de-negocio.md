# Reglas de negocio — Cotizador 3D

Qué regla manda en cada paso de una cotización: qué acción la mueve de estado, cuándo se cobra el anticipo, cuándo se entrega, cómo entran el IVA, las comisiones y el empaque, y cómo funcionan las cuentas en las tiendas. Es la base para `flujos.md` y [`modelo-de-datos.md`](modelo-de-datos.md).

Desde D33, Notion sale del proyecto: los datos y las cuentas van en Firebase y la app se publica en las tiendas.

**Actualizado:** 2026-11-27 (D264, «Mis productos» ya no tapa la Calculadora; D261–D263, la fecha de envío para «Para hoy» y la pausa para usarla; D258–D260, «Para hoy» en el Inicio; D256–D257, un color por rubro en la barra del costo y un solo aviso de stock; D249–D255, el color del rollo en la cotización del cliente, la hoja angosta, «Enviar» en el teléfono y «Configurar después»; D243–D248, estilo de taller: etiquetas sin mayúsculas y el color real del filamento; D242, la «G» de Google en el acceso; D239–D241, aviso de Ajustes también en el teléfono y sigue el estilo de taller; D235–D238, un solo formato de dinero y aviso al salir de Ajustes con cambios; D227–D234, arreglos rápidos de la crítica: recientes que abren su cotización, «Borrar» aparte, Filamento y «Nueva cotización» en el Inicio de escritorio; D217–D226, respuestas a la crítica, el P2 —la Orden en dos renglones, «Revisar orden», un color por estado, Cotizaciones con poco ancho—, ingresos sin comisión e «Iniciar sesión» sin cuenta; D212–D216, la crítica de diseño: precio que no se queda viejo, una sola definición de margen, accesibilidad, Calculadora del teléfono y estilo de taller para después; D208–D211, configurar impresoras, materiales y gastos al empezar; D205–D207, Dashboard con estados vacíos, todo parejo y centrado; D203–D204, la Ayuda en dos secciones; D199–D202, la Ayuda y los archivos de varias placas; D197–D198, estado vacío de indirectos y recorrido guiado; D195–D196, agregar los comunes y la introducción por cuenta; D193–D194, empezar vacío y estados vacíos; D187–D191, kits a precio fijo; D192, entrar con Google en la app publicada; D186, el color del rollo queda como punto; D185, el color del rollo; D183–D184, el panel de la cotización se cierra al salir de Cotizaciones; D181–D182, filamento y materiales en el Dashboard; D179–D180, Materiales en Ajustes y la tarjeta «Material usado»; D171–D178, escritorio de verdad y menos textos; D168–D170, las medidas de la pieza desde el archivo del slicer y «Cake Topper» por tamaño; D165–D167, tarjetas sin ícono, «Cake Topper» y cotización nueva vacía; D160–D164, sin Excel, aviso del redondeo, solo archivos del slicer, tarjetas a todo el ancho y «Cancelar» en el teléfono; D152–D159, editar los productos de la orden, su pie, la vista previa y confirmaciones; D148–D151, el catálogo dentro de la calculadora; D140–D147, enviar y su estado; D133–D139, lectura de archivos del slicer y confirmaciones; D115–D132, cambios de diseño y revisión con /impeccable; D104–D114, de la integración de Firebase; antes, D87–D103: arranque de un negocio nuevo, modelo de datos y limpieza del repositorio; van 211 decisiones; las reglas de negocio se cerraron el 2026-10-16 y desde entonces suman las de `flujos.md`, `modelo-de-datos.md` y de publicación)

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
| D6 | El primer estado se llama «Borrador» en todo; ~~al abrir la app, `pendiente` se migra a `borrador`~~ (afinado en D141: se lee como Borrador y no se reescribe) | Francisco (P1: a) | 2026-10-16 |
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
| D47 | Un negocio nuevo elige de una lista de impresoras y materiales comunes, con precios de referencia editables, y la introducción le pide sus gastos fijos y sus horas de impresión al mes. Sin clientes de ejemplo. **Precisada por D87 y D88 (2026-11-03):** los gastos y las horas se pueden dejar para después, y la introducción conserva sus 5 pasos, corregidos (afinado en D193: mientras no exista la lista para elegir, se empieza vacío, sin los de ejemplo) | Francisco (P44: a) | 2026-10-16 |
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
| D72 | Si el archivo del slicer trae varias placas, se elige una: cada placa es un cálculo (afinado en D201: de inicio se usan todas juntas, y se puede elegir una) | Francisco (P71: a, en `flujos.md`) | 2026-10-16 |
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
| D88 | La introducción conserva los 5 pasos de hoy, corregidos donde ya no corresponden, y después vienen las pantallas para elegir impresoras, materiales y gastos. Las correcciones están en `flujos.md` §7. Precisa D47 (impresoras y materiales, hechos en D208) | Francisco (P87: b, en `flujos.md`) | 2026-11-03 |
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
| D113 | Las pruebas de la sincronización viven en el repo, en `tests/`, y corren con `npm test` («Sí, guárdalas»). **Interpretación:** entran también las de entrar con cuenta (v106) y las que revisan lo que une las pantallas con la nube, la caché sin conexión y lo que se publica; y `npm test` se corre antes de subir cualquier cambio a `js/`, `index.html`, `quote.html` o `sw.js`, también los de diseño. Se confirma en P115. **Confirmado en D114** | Francisco (P114) | 2026-11-09 |
| D114 | Confirma la interpretación de D113: `npm test` se corre siempre antes de subir un cambio a la app, también los de diseño, y entran todas las pruebas de `tests/` | Francisco (P115: «Sí, siempre») | 2026-11-09 |
| D115 | Pantalla de entrada: casilla «Recordar contraseña» y un ojo para mostrar u ocultar la contraseña («en la vista de inicio de sesión agrega el recordar contraseña, el icono para mostrar la contraseña»). **Interpretación:** «Recordar contraseña» deja que el navegador o el teléfono guarden la contraseña en su administrador de contraseñas, y que la app recuerde el correo; la app nunca guarda la contraseña. Viene marcada. No es recuperar por correo una contraseña olvidada. Se confirma en P116. **Confirmado en D119** | Francisco | 2026-11-09 |
| D116 | Ajustes › Diseño: la vista previa de la cotización va a la derecha y se queda a la vista al bajar («muestra la vista previa de la cotización del lado derecho»). En el teléfono sigue debajo, porque no cabe al lado | Francisco | 2026-11-09 |
| D117 | Todo Ajustes va centrado («En toda la sección de ajustes centra los contenidos»): el encabezado, las pestañas y el contenido, con el mismo ancho. **Interpretación:** en escritorio; en el teléfono ya ocupa el ancho de la pantalla. Se confirma en P118. **Confirmado en D121**. Al hacerlo apareció un error y quedó corregido: el panel medía toda la ventana y se salía 240 px por la derecha, y cortaba Exportar e Importar | Francisco | 2026-11-09 |
| D118 | Barra lateral: «Cerrar sesión» abajo, donde estaba el tema; el tema (Claro, Oscuro, Auto) debajo de Ajustes; Clientes junto a Inventario («mueve la selección de tema abajo de ajustes y clientes muévelo al inventario»). **Interpretación:** Clientes pasa a la sección Catálogo, debajo de Inventario, como otra opción de la barra y no como pestaña dentro de Inventario; en el teléfono, que no tiene barra lateral, el tema y «Cerrar sesión» siguen en Ajustes › Otros. Se confirma en P117 y P118. **Confirmado en D120 y D121** | Francisco | 2026-11-09 |
| D119 | Queda «Recordar contraseña» como en D115 y se agrega «¿Olvidaste tu contraseña?»: Firebase manda un correo, en español, para poner una contraseña nueva. Usa una función que Firebase Auth ya trae; no cambia nada en Firebase, `js/auth.js` ni `js/db.js` | Francisco (P116: a) | 2026-11-09 |
| D120 | Clientes queda en la barra lateral, debajo de Inventario (confirma D118) | Francisco (P117: a) | 2026-11-09 |
| D121 | En el teléfono no cambia nada de D117 y D118: no hay barra lateral, y Ajustes ya ocupa la pantalla | Francisco (P118: a) | 2026-11-09 |
| D122 | El tema de la barra lateral es un interruptor de claro y oscuro; mientras no se elige, sigue al navegador («El selector de tema cámbialo con un toggle de claro y oscuro, la opción automática déjala por defecto según el navegador del usuario»). **Interpretación:** el tema se guarda en cada navegador y no en la cuenta: antes se subía a la nube con cada cambio, cambiarlo en un equipo lo cambiaba en todos y empezaba en oscuro. Quien había elegido Claro lo conserva. En Ajustes › Otros siguen Claro, Oscuro y Auto, para volver a automático. Se confirma en P119 y P120. **Confirmado en D124 y D125** | Francisco | 2026-11-09 |
| D123 | El logo de Ajustes › Diseño va también en el ícono de la barra lateral («Que la imagen que se agrega en la cotización se agregue al icono de la sidebar»), y en el de la barra de arriba del teléfono, que usa la misma función. Corrige un error: la barra buscaba el logo con otro nombre (`logoDataUrl`, que nadie llena) y nunca aparecía | Francisco | 2026-11-09 |
| D124 | El tema se guarda en cada navegador, no en la cuenta (confirma D122) | Francisco (P119: a) | 2026-11-09 |
| D125 | «Auto» se queda en Ajustes › Otros, para volver a automático después de usar el interruptor (confirma D122) | Francisco (P120: a) | 2026-11-09 |
| D126 | Claude agrega en `js/db.js` que la barra se redibuje cuando llega de la nube el diseño de la cotización, para que el logo cambie al momento en los otros equipos: una línea en la lista de qué se redibuja (`_DOCS.quoteStyle.render`). No cambia qué se guarda ni cómo se sincroniza. Con su prueba en `tests/sincronizacion.test.js`, que fallaba antes del cambio | Francisco (P121: a) | 2026-11-09 |
| D127 | «¿Olvidaste tu contraseña?» se queda solo si no hay que cambiar nada del backend; si hubiera que cambiarlo, lo agrega Javi («solo si no tenemos que modificar nada del back, sino le digo a javi que lo agregue»). No hace falta: usa la plantilla de correo que Firebase ya trae. Si se quiere personalizar el correo (remitente, texto o el nombre que aparece), eso se hace en la consola de Firebase y le toca a Javi | Francisco | 2026-11-09 |
| D128 | La revisión de diseño con `/impeccable` (24/40, 5 problemas prioritarios) empieza por lo que ve el cliente. La cotización de inicio sale sin el desglose de costos y con la paleta Esmeralda, no con el morado de Material; Ajustes › Diseño trae 4 paletas (Esmeralda, Grafito, Terracota, Azul), y las partes del desglose quedan debajo de él, atenuadas si está apagado, con una línea que explica qué ve el cliente. **Interpretación:** solo cambia para quien nunca guardó su diseño; una cuenta con diseño guardado, como la de La Casita del Molde, conserva el suyo, y apagar el desglose ahí es un interruptor en Ajustes › Diseño. Se confirma en P126. **Confirmado en D138** | Francisco (P122: a) | 2026-11-09 |
| D129 | Si falta el nombre del negocio, la app lo pide al generar la cotización y lo guarda en Ajustes › Negocio; antes salía «Mi Negocio 3D» (parte de P122) | Francisco (P122: a) | 2026-11-09 |
| D130 | Se afina la apariencia actual, sin cambiar de identidad (colores, letras y estructura se quedan). Con eso se quitan las etiquetas chicas encima de los títulos, que `/impeccable` no admite y en Cotizaciones repetían el título; el conteo de cotizaciones pasa debajo del título | Francisco (P123: a) | 2026-11-09 |
| D131 | Alcance de la ronda: lo de D128 y D129 más contraste y detalles menores (texto de ejemplo de los campos, ayudas en modo claro, línea de los campos, aviso «Sin conexión», pie de la cotización, «1 cotización», «Escanéame», «Quitar» solo con logo, avisos que el lector de pantalla anuncia, sombras de brillo). Al probar apareció y se corrigió un error que ya existía: al angostar la ventana con Ajustes abierto, la página quedaba corrida 240 px | Francisco (P124: a) | 2026-11-09 |
| D132 | `/stageshow` se usa para la ficha de Google Play o una página de presentación cuando se publique la app (D34, D38), no dentro de la app | Francisco (P125: a) | 2026-11-09 |
| D133 | La Calculadora lee el archivo del slicer («quiero agregar la lectura de gcodes para que el cálculo del tiempo, los gramos, etc. sean automáticos»): `.gcode` de Bambu Studio, OrcaSlicer, PrusaSlicer, Cura y Simplify3D, y el `.gcode.3mf` de Bambu Studio. Llena el peso, el tiempo total estimado, las piezas si la placa trae copias del mismo objeto, la descripción si está vacía (con el nombre del archivo), el material si hay uno solo de ese tipo y, con AMS, los gramos de cada color con la purga por cambio en 0 g, porque el peso del archivo ya la incluye: en la daga de 4 colores, 272 g, de los que unos 95 g son purga. Muestra un resumen con la miniatura de la placa y «Deshacer». Se lee en el dispositivo, solo el principio y el final del archivo; no se sube a ningún lado. La resina queda a mano: los `.ctb` de Chitubox vienen cifrados. **Interpretación:** Francisco mandó el archivo de 4 colores (P134) sin contestar P128–P133; se aplicó lo recomendado de cada una. Se confirma en P135. **Confirmado en D137** | Francisco | 2026-11-18 |
| D134 | El archivo de prueba multicolor es «SGAEYL PUNTA DAGA 4 COLORES», laminado en Bambu Studio 2.9 para la A1 con AMS lite. Su ficha y la de «Sin título» quedan como muestras en `tests/muestras/`, sin el G-code completo | Francisco (P134: a) | 2026-11-18 |
| D135 | Correcciones tras la prueba de Francisco («no se cambian las configuraciones de la impresora, el material y el cambio de color… El contenedor para leer el archivo, debe ser clicleable en todo lugar»): el archivo elige la impresora (por el modelo del archivo; con varios colores, una con AMS, y si no está el modelo, la única con AMS), luego el material, y llena los cambios de color con el último «; toolchange #» del G-code (1,217 en la daga). Todo el recuadro abre el selector de archivo. «Deshacer» también regresa la impresora y los cambios. **Interpretación:** los rollos de cada cabezal no se eligen solos, porque el inventario guarda el color con nombre («Negro») y el archivo con código (#545454); el resumen numera cada color por cabezal para elegirlo a mano. Se confirma en P136. **Confirmado en D136** | Francisco | 2026-11-18 |
| D136 | Los rollos de cada cabezal se eligen a mano; el resumen del archivo numera cada color por su cabezal (confirma D135) | Francisco (P136: a) | 2026-11-18 |
| D137 | Confirma la interpretación de D133: se queda lo recomendado de P128 a P133 | Francisco (P135: a) | 2026-11-18 |
| D138 | Confirma la interpretación de D128: la cotización nueva solo cambia para quien nunca guardó su diseño | Francisco (P126: a) | 2026-11-18 |
| D139 | De la revisión de diseño sigue «enviar y su estado» (problemas 3 y 4): que enviar marque la cotización como enviada y que cada tarjeta tenga una acción principal | Francisco (P127: a) | 2026-11-18 |
| D140 | Claude programa la parte de «enviar y su estado» (Borrador, Enviada, Aceptada y Rechazada) y le deja anotado a Javi en `docs/firebase.md` que ya está; En producción, Entregada, Cancelada y pagos siguen en su lista | Francisco (P137: a) | 2026-11-18 |
| D141 | Afina D6: `pendiente` se lee como Borrador y no se reescriben las cotizaciones guardadas; las nuevas se guardan como `borrador`, y las viejas cambian solas cuando se editan o cambian de estado. Así no se reescriben de golpe todas las cotizaciones en la nube | Francisco (P138: a) | 2026-11-18 |
| D142 | Cuando WhatsApp o el enlace pasan una cotización a Enviada, la app lo avisa con «Deshacer» | Francisco (P140: a) | 2026-11-18 |
| D143 | La tarjeta de cotización se abre al tocarla y tiene una sola acción principal según su estado: Borrador → «Enviar»; Enviada → «Aceptar» y «Rechazar»; Aceptada o Rechazada → «Ver». Lo demás va en el menú «⋯» (Editar, Duplicar, PDF, imagen, texto, Aceptar en mostrador, Marcar como enviada, Regresar un paso y Borrar). La ventana de envío pone WhatsApp arriba como acción principal y «Listo» como secundario | Francisco (P139: a) | 2026-11-18 |
| D144 | Notion sale de la app: se quitan el botón de las tarjetas y el envío al aceptar (D33). `api/notion.js` queda para que Javi lo retire del servidor | Francisco (P141: a) | 2026-11-18 |
| D145 | Tras la prueba de Francisco («siempre se queda el mismo archivo en la vista… lo agregué a la cotización y se mantuvo. Tampoco se hizo el cambio del botón»): al agregar el producto a la cotización se quita el resumen del archivo y el AMS vuelve a como estaba, porque la siguiente pieza heredaba la purga por cambio en 0 g. La app avisa «Hay una versión nueva · Actualizar» cuando el service worker baja archivos nuevos, y muestra su versión en la barra lateral y en Ajustes. **Interpretación:** el recuadro no cambió porque el navegador seguía con la versión anterior; borrar «imágenes y archivos en caché» no borra lo que guarda el service worker. Se confirma en P142. Confirmado en D155 | Francisco | 2026-11-18 |
| D146 | El recuadro del lector del slicer no lleva un botón adentro: el ícono y «Leer archivo del slicer» van como texto, y el botón es todo el recuadro («Elimina los estilos css del btn btn-ghost slicer-boton») | Francisco | 2026-11-18 |
| D147 | El contenido del recuadro del lector va centrado («centra en contenido del botón de leer el archivo del slicer») | Francisco | 2026-11-18 |
| D148 | El catálogo se cotiza dentro de la calculadora: «¿Qué cotizas?» arriba de los campos elige entre «Pieza nueva» y los productos guardados. Un producto por tamaño cambia la calculadora a modo producto (tamaño, diseño, refuerzo y cantidad, sin peso ni tiempo): el precio sale en el panel de resultado con su desglose, «Agregar a orden» lo agrega y se queda en el producto para el siguiente. La descripción lleva el tamaño y lo elegido («· 8 cm · diseño sencillo · con refuerzo»). Un producto por costo llena los campos de la pieza; si no trae peso y tiempo, se respeta lo que ya está (por ejemplo, lo leído del slicer). El panel «Catálogo de productos» pasa a «Mis productos»: editar, nuevo, exportar y «Cotizar». Ninguna medida queda elegida de entrada, para que el precio no salga del tamaño más chico por descuido. Las cuentas viven en `js/precios-tamano.js`, con sus pruebas en `tests/precios-tamano.test.js` | Francisco (P143: «En la calculadora») | 2026-11-18 |
| D149 | Los precios por tamaño se capturan en una tabla (tamaño, precio y refuerzo por renglón) con «Agregar tamaño», quitar renglón y «Llenar varios tamaños de una vez» (de 4 a 20 cm, el primero $15 y +$3 por cm), que cambia el precio de esos tamaños y conserva su refuerzo. Acepta medios centímetros (8.5) y marca cada renglón que no cuadra con su error, en vez de descartarlo sin avisar como el texto «tamaño:precio», que convertía 8.5 en 8 y tiraba «9 : $30». Un producto se puede guardar sin precios; avisa que le faltan | Francisco (P144: «Tabla editable») | 2026-11-18 |
| D150 | Los niveles de diseño y el refuerzo son de cada producto (`designLevels` y `refuerzoTable` en su documento de `productos`). Los productos de antes siguen con los de siempre (Sin diseño $0, Muy simple $15, Sencillo $20, Medio $25, Complejo $35; refuerzo de 4–5 cm $5, de 9–14 cm $10 y de 15 cm en adelante $15) hasta que se editan: su editor ya los trae escritos. Siempre queda un nivel sin costo. ~~La lista de precios en Excel lleva el refuerzo y los niveles de cada producto.~~ (la exportación se quitó en D160) Son campos nuevos en un documento que la app ya guarda: no cambian `firestore.rules` ni `js/db.js` | Francisco (P145: «Editables por producto») | 2026-11-18 |
| D151 | Con todo lo anterior, y con accesibilidad: la orden se ve (una tira «Orden · n productos · total» abajo del botón, que se ilumina al agregar, y un aviso con «Ver orden»). Un producto por tamaño se guarda con sus rubros de costo en 0, `baseCost` vacío y lo elegido en `detalleTabla`: antes su precio salía como «Material» y el refuerzo como «Desperdicio» en el desglose. En la orden dice «Precio por tamaño» en lugar de «— · —», y la cotización ya no muestra «—» como material. Accesibilidad de paneles y campos: Esc cierra los paneles, el foco entra al abrir y regresa al botón al cerrar, y se anuncian como diálogo; los interruptores se alcanzan con Tab; «(opcional)» sin transparencia (estaba en 2.4–2.9:1) y las etiquetas en un renglón, porque al partirse tapaban lo escrito; las listas vuelven a tener flecha | Francisco (P146: «Todo + accesibilidad») | 2026-11-18 |
| D152 | Los productos de la orden se pueden editar («agrega la función de editar los registros de una cotización, actualmente no se pueden editar los productos»): «Editar» en cada producto, en el teléfono y en escritorio, lo lleva de regreso a la calculadora con lo que se capturó, con un aviso «Editando un producto de la orden» y el botón «Guardar cambios», que lo reemplaza en su mismo lugar y regresa a la orden; «Cancelar» lo deja como estaba. Ir a la orden sin guardar descarta los cambios y lo avisa. Una pieza conserva su cantidad; un producto por tamaño abre en modo producto con su tamaño, diseño, refuerzo y cantidad. Desde v116 cada pieza guarda lo capturado tal cual (`entrada`: la placa, el AMS y el post-procesado); las de antes se reconstruyen (lo guardado por pieza × las piezas, la impresora y el material por su nombre, y el post-procesado en una sola línea para que el precio no cambie) y la app dice qué revisar. **Interpretación:** si el producto tenía un precio escrito a mano, al guardar queda el precio calculado y la app lo avisa con los dos precios. Se confirma en P147. Confirmado en D154 | Francisco | 2026-11-20 |
| D153 | En la orden (nueva o «Editar COT-…») ya no se abre el contenedor de la cotización a la derecha: la orden tiene su propia vista previa y se veían dos («en la vista de editar se repite la vista de la cotización; quita el drawer») | Francisco | 2026-11-20 |
| D154 | Confirma la interpretación de D152: al editar un producto que tenía un precio escrito a mano, queda el precio calculado y la app avisa con los dos precios | Francisco (P147: a) | 2026-11-20 |
| D155 | Confirma la interpretación de D145: con la versión nueva, el recuadro del lector del slicer es clicable y el resumen del archivo se quita al agregar el producto; lo que no se veía era la versión anterior que guardaba el service worker | Francisco (P142: a) | 2026-11-20 |
| D156 | El pie de la orden en escritorio se reparte en dos columnas («los elementos no se distribuyen adecuadamente en el contenedor. Elimina la línea que está arriba de subtotal, agrega un botón de cancelar»): ~~a la izquierda Subtotal, Descuento y Comisión, sin la línea de arriba del subtotal; a la derecha el total y abajo «Cancelar» y «Generar cotización» o «Actualizar». Con poco espacio se apila.~~ (afinado en D157) Sin la línea de arriba del subtotal; abajo «Cancelar» y «Generar cotización» o «Actualizar». **Interpretación:** «Cancelar» sale de la orden sin guardar: editando una cotización la deja como estaba y regresa a Cotizaciones; una orden nueva se descarta. Si hay algo que perder pregunta antes («¿Salir sin guardar los cambios de COT-…?» o «¿Descartar esta orden?»); sin cambios sale directo. ~~En el teléfono, «Cancelar» del panel de la orden sigue solo cerrándolo.~~ Se confirma en P148. Confirmado en D164 | Francisco | 2026-11-20 |
| D157 | Afina D156: Subtotal, Descuento, Comisión y Total van uno debajo de otro, cada renglón a todo el ancho del pie, con la etiqueta a la izquierda y el valor a la derecha («en la fila del subtotal utiliza un gap automático para distribuirlo en el total del contenedor. El descuento, la comisión y el total deben estar distribuidos de manera vertical»). Abajo, «Cancelar» y el botón de guardar a la derecha, con su ancho; con poco espacio, a todo el ancho | Francisco | 2026-11-20 |
| D158 | En la orden de escritorio, la vista previa llega hasta el borde inferior de la ventana («el alto de la vista previa debe llegar hasta abajo»), como un panel de orilla; antes terminaba 16 px antes, con el mismo margen que la columna de la orden, que lo conserva | Francisco | 2026-11-20 |
| D159 | En la vista previa de la orden, la hoja de la cotización ocupa todo el alto del panel, como una página: el total, las notas y el pie bajan al fondo y el espacio queda entre la tabla y el total («el alto debe ser igual que en la imagen de referencia»). Con muchos productos la hoja crece y el panel se desplaza. Solo en esa vista previa: el PDF, la imagen y el visor del cliente no cambian | Francisco | 2026-11-20 |
| D160 | Se quita «Exportar precios» a Excel de «Mis productos» («elimina la opción de exportar los precios en excel»), con el código que bajaba SheetJS. El Excel del mes para el contador (D45) es otra cosa y sigue pendiente | Francisco | 2026-11-20 |
| D161 | La app dice que el precio sugerido se redondea hacia arriba de $5 en $5, así que siempre termina en 5 o en 0 («agrega la información al usuario de que los precios se redondean de 5 y 10»): debajo del precio, con el número antes de redondear cuando cambia («$75.90 → $80»). La regla no cambia (`roundUpToFive` en `js/costing.js`); un precio escrito a mano en la orden no se redondea (afinado en D171: solo aparece cuando el redondeo cambió el precio) | Francisco | 2026-11-20 |
| D162 | El lector del slicer solo acepta .gcode y .3mf (también .gco, .g y .nc, que son G-code): cualquier otro archivo, elegido o arrastrado, muestra «Ese archivo no es del slicer: elige un .gcode o un .3mf» sin intentar leerlo. En la computadora el explorador de archivos solo muestra .gcode, .gco y .3mf. En el teléfono no se filtra el explorador, porque Android deja en gris los .gcode si se filtran por tipo (no les conoce un tipo MIME); ahí la app revisa el archivo al elegirlo | Francisco | 2026-11-20 |
| D163 | Las tarjetas de «¿Qué cotizas?» se reparten en todo el ancho del contenedor («distribuye las tarjetas en todo el contenedor»): antes quedaban columnas vacías a la derecha. Con más productos de los que caben en un renglón, siguen en el siguiente; en el teléfono, dos por renglón | Francisco | 2026-11-20 |
| D164 | Confirma la interpretación de D156 y la lleva al teléfono: «Cancelar» del panel de la orden también sale sin guardar (editando, la cotización se queda como estaba y se vuelve a Cotizaciones; una orden nueva se descarta, preguntando antes). La ✕ y tocar fuera cierran el panel y conservan la orden. Si no se confirma, se vuelve al panel | Francisco (P148: a) | 2026-11-20 |
| D165 | Las tarjetas de «¿Qué cotizas?» no llevan ícono («elimina los iconos de las tarjetas de qué cotizas»): el nombre y su línea de abajo dicen lo que es | Francisco | 2026-11-20 |
| D166 | «Topper Cake» se llama «Cake Topper» («cambia el texto de topper cake por "Cake Topper"»): en el catálogo inicial y en los negocios que ya lo tenían guardado, que se cambia solo al abrir la app o al llegar los productos de la nube, y se guarda como cualquier edición. Solo el nombre exacto «Topper Cake»; las cotizaciones ya hechas conservan su descripción | Francisco | 2026-11-20 |
| D167 | «Nueva cotización» (en Cotizaciones, el Dashboard y la lista vacía) empieza con la orden vacía. Antes solo abría la calculadora, y si había quedado una orden a medias o la edición de una cotización que no se guardó ni se canceló, aparecía con sus productos (Francisco: «en una nueva cotización, sin agregar nada me aparece que ya hay un producto»), y lo que se agregara iba a dar a esa cotización. Una edición sin cambios se suelta sin preguntar; con cambios pregunta («Seguir editando» o «Empezar de cero»), y una orden nueva sin terminar también («Seguir con esa orden» o «Empezar de cero»). La tira de la orden dice «Editando COT-…» cuando es una edición. «Calculadora» en la barra lateral sigue con la orden que haya | Francisco | 2026-11-20 |
| D168 | El lector del slicer saca las medidas de la pieza (Francisco mandó un cake topper: «este archivo sí tiene tamaño y otros datos»). En el .gcode.3mf de Bambu Studio y Orca, el ancho y el largo salen del contorno de la placa (`Metadata/plate_N.json`, sin la torre de purga; si son copias, de una) y el alto, de `; max_z_height` del G-code; en un G-code de Cura, de `;MINX` a `;MAXZ`. Se ven en el resumen («Mide 15.7 × 13.6 × 0.4 cm»). Del topper ya se leían el tiempo (1 h 17 min), los gramos (21.47 g), los dos colores, la P1S y los 20 cambios. ~~**Interpretación:** la medida también va al final de la descripción de la cotización («Cake Topper · 15.7 × 13.6 × 0.4 cm»); «Deshacer» la quita.~~ Se confirma en P150: no va en la descripción (D170) | Francisco | 2026-11-20 |
| D169 | «Cake Topper» se cotiza por tamaño, como los cortadores: es un producto «Por tamaño», sin precios hasta que se capturan en «Mis productos › Editar», y sin refuerzo. El que ya estaba guardado por peso y tiempo se cambia solo, una vez por equipo. En el panel del producto, la fila de Refuerzo solo aparece si algún tamaño lo lleva | Francisco (P149: c) | 2026-11-20 |
| D170 | La medida que sale del archivo se ve solo en el resumen («Mide 15.7 × 13.6 × 0.4 cm»); no va a la descripción de la cotización | Francisco (P150: b) | 2026-11-20 |
| D171 | Menos textos en escritorio y teléfono (P152: «Textos y duplicados»). Se quitan: el párrafo «Captura lo que te da el slicer para la placa completa…» (lo dicen las etiquetas: «Peso de placa (g)», «Tiempo de placa (h)», «Piezas en la placa»), las ayudas «De toda la placa», «En esa placa» y «Se reparte entre las piezas», «también puedes arrastrarlo aquí», la numeración «01 · …» de las secciones, «50% margen» y la «Ganancia» repetidos, «hasta 4 colores», «Primer, color, barniz», «Elegoo Mercury Plus…», «Con el peso y el tiempo», las ayudas de «Mis productos» y de su editor, «Así la verá el cliente», la etiqueta «Cotización» del panel, «Margen promedio» del Dashboard (ya está junto al ingreso), «Estudio 3D» de la barra lateral, los títulos de cada sección de Ajustes en escritorio (los nombra su pestaña), «Categorías de gasto mensual» y el aviso del Banco («Mostrar en cotizaciones y PDF» lo dice). Las ayudas que sí sirven van detrás de un «?» (P154): gastos indirectos, mantenimiento y purga del AMS. La nota del redondeo (D161) solo aparece cuando el redondeo cambió el precio: «Redondeado de $75.90 (de $5 en $5)». Errores sueltos: «10% %» en Otros, «Toca para cambiar» → «Cambiar logo», y la cotización (vista previa, PDF e imagen) en Plus Jakarta Sans: pedía Roboto e Inter, que no se cargan, y en Windows salía en Arial. Revisión con /impeccable (critique en producción, 26/40) | Francisco | 2026-11-25 |
| D172 | En escritorio con ratón, controles de tamaño de escritorio (P155): botones de 40 px y chips de 32 px, en lugar de 44–52 px. En el teléfono y en pantallas táctiles se quedan como estaban (`@media (pointer: fine)`) | Francisco | 2026-11-25 |
| D173 | Listas de escritorio (P153: «Las 3 P1»): Cotizaciones como tabla (Folio, Cliente, Productos, Fecha, Total y la acción; con el panel de la cotización abierto se quedan Folio, Cliente, Total y acción); Impresoras, Materiales e Inventario en rejilla; el Dashboard en dos columnas (el mes arriba, recientes y salud lado a lado) sin «Accesos rápidos», que repetían la barra lateral; ancho máximo de 1240 px y sin el hueco de la barra inferior del teléfono. También se quitan en escritorio «Regresar» y el ícono de historial de la Calculadora, y la flecha de Historial. En el teléfono todo sigue igual (afinado en D207: ese ancho, centrado) | Francisco | 2026-11-25 |
| D174 | En escritorio, el detalle del cliente se abre en el panel lateral, como la cotización, en lugar de a pantalla completa: tapaba la barra lateral y la cotización que se abría desde ahí quedaba debajo, sin verse. Desde el panel del cliente, cada cotización se abre en el mismo panel con «‹ Cliente» para regresar. En el teléfono sigue a pantalla completa | Francisco | 2026-11-25 |
| D175 | Ajustes en escritorio (P156: a): Negocio, Banco y Electricidad como formulario de dos columnas, con la etiqueta arriba y el campo con borde; un solo «Guardar» para todas las pestañas, en una barra abajo que aparece al cambiar algo («Cambios sin guardar · Descartar · Guardar»). Lo escrito ya no se pierde al pasar de una pestaña a otra: antes cada pestaña volvía a cargar lo guardado. Diseño se sigue guardando solo. En el teléfono queda el «Guardar» de cada sección (afinado en D178: el interruptor del Banco va junto al número de cuenta) | Francisco (P156: a) | 2026-11-25 |
| D176 | El editor de cliente es un panel como los demás editores: Nombre, WhatsApp, Correo, Red social, «¿Cómo te conoció?» y Notas, con Cancelar y Guardar. Se quitan «‹ Clientes», la etiqueta «Nuevo/Editar», el título de 34 px, el avatar de 84 px y la «Vista previa en tu lista». Si el cliente está abierto en el panel lateral, se actualiza al guardar | Francisco (P156: a) | 2026-11-25 |
| D177 | En escritorio, los editores (Impresora, Material, Filamento, Descontar, Mis productos, editor de producto y cliente) se abren como panel a la derecha sin velo oscuro: la página se angosta y se sigue viendo, como el panel de la cotización. Tocar fuera ya no cierra el editor (no se pierde lo escrito por un clic); se cierra con ✕, Cancelar, Esc o al cambiar de página. Las ayudas «?» siguen como ventana al centro | Francisco (P156: a) | 2026-11-25 |
| D178 | Ajustes en escritorio: la fila de pestañas ya no muestra barra de desplazamiento (salía una barra vertical junto a «Diseño»); entre 900 y 1099 px las pestañas van sin ícono para que quepan las siete. En Banco, «Mostrar en cotizaciones y PDF» y su interruptor van en la columna junto a «Número de cuenta», en lugar de una fila aparte a todo el ancho. En el teléfono no cambia | Francisco | 2026-11-25 |
| D179 | Materiales sale del catálogo y va a Ajustes, como pestaña entre Electricidad y Gastos fijos (en el teléfono, una fila más de la lista de Ajustes, con «+ Material»). Son precios por kilo y densidades, como el costo del kWh: se capturan una vez y se cambian cuando cambia el precio. No hubo razón para dejarlo en el catálogo: los rollos de Inventario siguen ligados a su material por su id, y la lista de materiales sigue mostrando los colores de sus rollos. Se quitan «Materiales» de la barra lateral y la pestaña del catálogo (queda Impresoras · Inventario); lo que abría Materiales (el «Agregar material» del Dashboard) abre Ajustes › Materiales | Francisco | 2026-11-25 |
| D180 | En Inventario, arriba, la tarjeta «Material usado» del mes, con el diseño de la referencia de Francisco y sin acordeón: los gramos de las cotizaciones aceptadas en el mes, el cambio contra el mes anterior, una barra partida por material y la lista con el porcentaje y los gramos, de más a menos; con más de 4 materiales, el resto va junto en «Otros». Cuentan los mismos gramos que se descuentan de los rollos al aceptar (peso por pieza × cantidad; en el AMS, cada color en el material de su rollo, con su parte de la purga), en el mes en que se aceptó. Colores probados para daltonismo en claro y oscuro (`--serie-1` a `--serie-4`). En escritorio va a todo el ancho, con la cifra a la izquierda y la barra con su lista a la derecha. Sin ninguna cotización aceptada, la tarjeta no aparece. Interpretación: «el que se ocupa con más frecuencia» se mide en gramos y por mes calendario; se pregunta en P157. Confirmado en D181 | Francisco | 2026-11-25 |
| D181 | La tarjeta «Material usado» mide gramos del mes calendario contra el mes anterior, como quedó en D180 (P157: a). Las impresoras se quedan en el catálogo, por ahora; no pasan a Ajustes como los materiales (P158: b, «por ahora») | Francisco (P157: a, P158: b) | 2026-11-25 |
| D182 | El Dashboard muestra el filamento y los materiales, en dos tarjetas más (en escritorio, lado a lado debajo de recientes y salud): «Material usado» del mes, la misma de Inventario (D180) con su título afuera, y «Filamento», con lo que queda en todos los rollos, cuántos son, cuánto valen al precio por kilo del rollo o de su material, y los 4 rollos con menos porcentaje, cada uno con su barra (verde, ámbar o rojo, como en Inventario) y el ícono de aviso con 20 % o menos. «Ver inventario →» lleva a Inventario. Sin rollos, «Sin rollos registrados» y «+ Filamento». Los títulos de las secciones del Dashboard quedan a la misma altura en cada fila (afinado en D205: estados vacíos en una cuenta nueva y columnas parejas) | Francisco | 2026-11-25 |
| D183 | En escritorio, el panel de la cotización (el contenedor a la derecha, desde v102) se cierra al ir a otra página. Solo sigue abierto entre Cotizaciones y Clientes, que lo usan («al abrir una cotización y no cerrarla, al entrar a la calculadora se queda abierta la cotización»). Antes se quedaba abierto en cualquier sección, también en la Calculadora, donde tapaba el resumen. Interpretación: se cierra también al ir al Dashboard, Inventario, Impresoras, Historial y Ajustes, no solo a la Calculadora; se pregunta en P159. Confirmado en D184 | Francisco | 2026-11-25 |
| D184 | El panel de la cotización se cierra al ir a cualquier página que no sea Cotizaciones o Clientes, como quedó en D183, no solo al entrar a la Calculadora | Francisco (P159: a) | 2026-11-25 |
| D185 | Al agregar o editar un rollo se elige su color: 10 muestras (Blanco, Negro, Gris, Rojo, Naranja, Amarillo, Verde, Azul, Morado y Rosa) y «Otro», que abre el selector de color del sistema; tocar otra vez el elegido lo quita. Elegir una muestra llena el campo «Color» con su nombre si está vacío. Se guarda en `colorHex` como `#RRGGBB`, el campo que ya tenía el rollo en el modelo (D74). Ese color se muestra en la tarjeta del rollo, como un punto junto al nombre, y en los demás lugares que ya pintaban el color del rollo: la Calculadora, la lista de Materiales y el Dashboard. Los rollos de antes sin color toman el de la muestra si su nombre coincide («Blanco»). Se corrigen de paso «Costo por kg (opcional) (opcional)» y «Color (opcional)», que no cabía. Interpretación: el color va en un punto y la barra sigue mostrando cuánto queda (verde, ámbar o rojo); se pregunta en P160. Confirmado en D186 | Francisco | 2026-11-25 |
| D186 | El color del rollo se queda como un punto junto al nombre; la barra sigue en verde, ámbar o rojo para avisar cuánto queda, como quedó en D185 | Francisco (P160: a) | 2026-11-26 |
| D187 | Los kits, como el de la casita de galleta de 10 cortadores y marcadores ($250), son un tipo de producto nuevo, «Precio fijo»: el precio de venta lo pone el negocio y la app no lo cambia; lo que cuesta sale de la fórmula de siempre con los gramos y las horas de sus placas, y la calculadora muestra «Precio fijo» con el costo, la ganancia y el margen («Margen 138 %»). En la orden entra como una línea, con su precio, y al aceptarla descuenta sus gramos del inventario y cuenta en «Material usado». Si después se edita en la orden, sigue con su precio fijo. En «Mis productos» se ve «Precio fijo · $250 · 2 placas · 98.1 g · 4.75 h» | Francisco (P161: a) | 2026-11-26 |
| D188 | Las placas de un producto de precio fijo se escriben a mano (nombre, gramos y horas) o se leen del slicer: «Leer del slicer» acepta uno o varios `.gcode` o `.3mf`, y cada placa del archivo es una fila. Se pueden mezclar | Francisco (P162: c, «se puede elegir») | 2026-11-26 |
| D189 | Las piezas del kit no se venden sueltas: solo el kit. Se maneja como cualquier otra impresión: se elige impresora, material y rollo como en una pieza, y la fórmula, el inventario y «Material usado» son los de siempre. Interpretación: «se maneja como cualquier otra impresión» es eso, no que el kit lleve otra fórmula | Francisco (P163: a) | 2026-11-26 |
| D190 | Si al precio fijo el margen queda abajo del margen de la calculadora, la nota del precio avisa («Margen 25 %, abajo del 50 % de la calculadora», en ámbar y con ícono de aviso); el precio no cambia. Interpretación: P164 decía «el margen que tienes en Ajustes», pero Ajustes no guarda un margen; se compara con el de la calculadora (50 % al abrirla) | Francisco (P164: a) | 2026-11-26 |
| D191 | Un kit tiene un solo precio, sin variantes | Francisco (P165: a) | 2026-11-26 |
| D192 | Entrar con Google no funciona en la app publicada: la lista de dominios autorizados de Firebase (pública, la que lee el SDK antes de abrir la ventana de Google) trae `localhost`, `calculadora3d-prod.firebaseapp.com` y `calculadora3d-prod.web.app`, pero no `calculadora3-d-delta.vercel.app`, y Firebase corta con `auth/unauthorized-domain` antes de abrir la ventana. En local sí abre. Se arregla en la consola de Firebase (Authentication › Settings › Authorized domains › agregar `calculadora3-d-delta.vercel.app`), sin cambiar código; lo hace Francisco o Javi. Mientras, la app dice «Entrar con Google todavía no está habilitado en este sitio. Por ahora entra con tu correo» en lugar del mensaje en inglés, y el de «método no habilitado» ya no habla solo de correo y contraseña | Revisión del 2026-11-26 (Francisco preguntó) | 2026-11-26 |
| D193 | Un equipo o una cuenta nueva empieza sin impresoras, sin materiales, con $0 de gastos fijos y sin clientes de ejemplo («hice una prueba con una cuenta nueva y me da los gastos fijos de 2000… también me aparecieron materiales e impresoras»). No era la caché: eran los valores de ejemplo de `js/store.js` ($2,000 de gastos fijos, 4 impresoras y 5 materiales), y una cuenta nueva sube lo del teléfono a la nube al crearse (D40). Quien ya usaba la app en un equipo conserva lo que tenía: si nunca guardó sus impresoras o materiales, se le guardan los de ejemplo con los que trabajaba, una sola vez por equipo. La nube no cambia; la cuenta de prueba que ya se creó conserva los de ejemplo hasta que se borren a mano | Francisco | 2026-11-26 |
| D194 | Estados vacíos de lo que hace falta para cotizar: Ajustes › Gastos fijos («Sin gastos fijos», con «Agregar gasto»), Ajustes › Materiales y Catálogo › Impresoras (ya existían; con ellos a la vista se esconde el otro botón de agregar, para que haya uno solo), y en la Calculadora, arriba de los selectores, «Para cotizar, agrega una impresora y un material» con «+ Impresora» y «+ Material», que abren su editor ahí mismo. Al guardar o borrar una impresora o un material, la calculadora los ve sin cambiar de página. De paso: el selector decía «Sin materiales para null» | Francisco | 2026-11-26 |
| D195 | Los estados vacíos ofrecen los comunes, como pedía D47: en Materiales, «Agregar los comunes» pone de una vez PLA, PETG, ABS, TPU y resina con precios de referencia ($350 a $600 el kilo, los de ejemplo de antes), sin repetir los que ya estén por nombre; en Impresoras, «Elegir de una lista» abre las 4 de ejemplo de antes (Ender 3 V2, Ender 3 S1 Pro, Bambu Lab A1 + AMS y Elegoo Mars 3) con su consumo, costo y vida útil, y se agregan las marcadas. Al agregarlas, la app pide cambiar los valores por los propios | Francisco (P166: a) | 2026-11-26 |
| D196 | La introducción se ve una vez por cuenta, no una vez por equipo («algo que no me apareció al iniciar sesión con la nueva cuenta es el onboarding»): se marcaba vista en el equipo (`c3d_onboardingDone`), y una cuenta nueva en un equipo que ya la había visto no la veía. Ahora cada cuenta lleva su marca en el equipo (`c3d_onboardingDone_<uid>`); sin cuenta, una vez por equipo como antes. Al llegar esta versión, la cuenta que ya estaba abierta en un equipo que la vio no la repite. No se guarda en la nube: la misma cuenta en otro equipo la ve una vez | Francisco | 2026-11-26 |
| D197 | Ajustes › Gastos indirectos tiene estado vacío, como los fijos: «Sin gastos indirectos · Guantes, lijas, alcohol, empaque: lo que se gasta poco a poco al imprimir», con «Agregar gasto». Mientras se ve, «+ Categoría» se esconde; «¿Qué va aquí?» se queda | Francisco | 2026-11-26 |
| D198 | Recorrido guiado la primera vez («utiliza una librería gratuita parecida a TourGuide.js»): con Driver.js 1.3.1 (licencia MIT, gratuita, sin dependencias), al terminar o saltar la introducción se señalan en la pantalla de verdad Impresoras, Inventario, Ajustes, Cotizar y Cotizaciones (5 pasos en escritorio, en la barra lateral; 3 en el teléfono, en la barra de abajo, porque ahí no hay Inventario ni Calculadora a la vista), con «Siguiente», «Atrás», «Listo» y «1 de 5», en los colores de la app. Se baja de jsDelivr solo cuando se va a mostrar, con la versión fija; sin conexión no aparece. No va en la caché del service worker: si el CDN fallara, la app no dejaría de instalarse. Se repite al volver a ver la introducción desde Ajustes. Interpretación: el recorrido va después de la introducción de 5 pasos, no en su lugar; se pregunta en P167. Confirmado en D199 | Francisco | 2026-11-26 |
| D199 | Al entrar por primera vez se ven las dos cosas: la introducción de 5 pasos (por qué cuesta lo que cuesta) y después el recorrido (dónde está cada cosa), como quedó en D198 | Francisco (P167: a) | 2026-11-26 |
| D200 | Una página de Ayuda: en escritorio, «Ayuda» en la barra lateral, debajo de Ajustes; en el teléfono, una fila más de Ajustes. Lleva «Ver el recorrido», «Ver la introducción», un buscador (sin acentos ni mayúsculas) y 8 preguntas con su respuesta corta, todas a la vista y sin acordeón: cómo sale el precio, qué hace falta antes de cotizar, qué peso y tiempo escribir, varias piezas en una cotización, cortadores y kits, qué significa cada estado, el inventario y dónde se guardan los datos. El recorrido suma un paso para señalarla en escritorio (afinado en D203: el recorrido y la guía, cada uno en su sección) | Francisco | 2026-11-26 |
| D201 | Un `.3mf` con varias placas («los archivos 3mf no detectan múltiples placas en un solo archivo»): el lector sí las encontraba (el casco NFL de 18 cm trae 8), pero la calculadora usaba la placa 1 (316.5 g y 10 h) y el selector de placa casi no se veía. Ahora el resumen dice «8 placas» y, de inicio, usa «Todas juntas»: suma gramos, tiempo y cambios de color, junta los colores por cabezal y deja «Piezas en la placa» en 1 (el casco completo: 672.5 g, 25 h 47 min, 4 colores y 286 cambios). En el mismo selector se elige una placa, con sus gramos a la vista. Para los kits, «Leer del slicer» de «Mis productos» sigue poniendo cada placa en su fila (D188). Interpretación: un `.3mf` de varias placas suele ser un solo producto, por eso «Todas juntas» va de inicio; se pregunta en P168. Confirmado en D202 | Francisco | 2026-11-26 |
| D202 | Un `.3mf` de varias placas empieza con «Todas juntas», como una sola pieza, y se puede elegir una placa en el mismo selector, como quedó en D201 | Francisco (P168: a) | 2026-11-26 |
| D203 | La Ayuda se divide en dos secciones («divide el tour y la guía»): «Recorrido», con dos tarjetas, «Por la pantalla» (te señala dónde está cada cosa, «Ver el recorrido») e «Introducción» (por qué cada pieza cuesta lo que cuesta, en 5 pasos, «Ver la introducción»); y «Guía», con el buscador y las 8 preguntas. Interpretación: dividir es separar en dos secciones de la misma página, una debajo de la otra, no en pestañas. Confirmado en D204 | Francisco | 2026-11-26 |
| D204 | El recorrido y la guía se quedan como dos secciones de la misma página de Ayuda, una debajo de la otra, sin pestañas: se ve todo de una vez, como quedó en D203 | Francisco (P169: a) | 2026-11-26 |
| D205 | El Dashboard de una cuenta nueva («en las cuentas nuevas agrega empty states. Distribuye los contenedores de manera uniforme»): sin ninguna cotización, cada tarjeta muestra su estado vacío en lugar de ceros y guiones: «Aún no hay ingresos» con «Nueva cotización», «Sin cotizaciones», «Sin números del mes», «Sin material usado» y «Sin rollos» con «Agregar filamento». En el teléfono no van los accesos rápidos mientras no haya cotizaciones: el botón de arriba ya es «Nueva cotización». En escritorio, las dos columnas tienen el mismo ancho (antes 1.4 a 1) y en cada fila las tarjetas el mismo alto | Francisco | 2026-11-27 |
| D206 | Las preguntas de la Ayuda miden todas lo mismo, del alto de la más alta («los contenedores de la sección de ayuda deben de ser del mismo tamaño») | Francisco | 2026-11-27 |
| D207 | En escritorio las páginas van centradas: Dashboard, Cotizaciones, Clientes, Catálogo (Impresoras e Inventario), Historial y Ayuda («¿por qué los contenedores de las secciones están inclinados a la izquierda?»). D173 limitó su ancho a 1240 px pero no las centró, y en pantallas anchas quedaba un hueco a la derecha; Ajustes ya iba centrado | Francisco | 2026-11-27 |
| D208 | La introducción termina configurando lo que hace falta para cotizar («utiliza el onboarding para que el usuario agregue su primera impresora y sus materiales»), como pedía D88. Después de los 5 pasos (o al saltarlos), una cuenta o un equipo sin impresoras ni materiales ve «Configura · 1 de 2»: «Tu impresora», con las 4 comunes para marcar (Ender 3 V2, Ender 3 S1 Pro, Bambu Lab A1 + AMS y Elegoo Mars 3) y «Otra», con nombre, consumo, lo que costó, vida útil y tipo; y «Tus materiales», con los 5 comunes y lo que cuesta el kilo de cada uno para cambiarlo ahí mismo (PLA marcado; también la resina si alguna impresora es de resina). «Ahora no» deja todo para después, y los estados vacíos lo vuelven a pedir. Al terminar, el recorrido. Quien ya tiene impresoras y materiales no ve estos pasos. Interpretación: los gastos fijos no entran todavía; se pregunta en P170. Superado en D209: sí entran (afinado en D210) | Francisco | 2026-11-27 |
| D209 | Un tercer paso al empezar, «Tus gastos del mes» («Configura · 3 de 3»): el total de gastos fijos al mes y las horas que se imprimen al mes (200 de inicio), con «= $15.50 por hora de impresión» mientras se escribe. Sale si no hay gastos fijos (ni total ni categorías), con «Ahora no» como los otros (afinado en D255: «Configurar después»). Las categorías (renta, luz…) y los indirectos se capturan después en Ajustes (afinado en D210: un renglón por gasto) | Francisco (P170: a) | 2026-11-27 |
| D210 | Los tres pasos de configurar al empezar se rehacen con lo que pidió Francisco al probarlos («al seleccionar otra, el registro se muestra en la parte de abajo y no permite verse bien en pantallas menores a 1440… no se puede agregar más de una impresora. En los materiales no permite agregar nuevos. En los gastos fijos no permite agregar registros individuales»): en escritorio, la lista a la izquierda y lo que se escribe en un panel a la derecha (en el teléfono, debajo). Impresoras: «¿No está la tuya?» con «Agregar impresora», tantas como hagan falta, cada una en la lista con «Tuya» y ✕. Materiales: «¿Otro material?» (nombre, tipo, precio por kilo y densidad) con «Agregar material». Gastos: un renglón por gasto, con nombre y monto al mes (de inicio Renta, Luz e Internet), «+ Agua», «+ Teléfono», «+ Software» y «+ Otro gasto»; a la derecha el total, las horas al mes y lo que le toca a cada hora. Se guardan como las categorías de Ajustes › Gastos fijos. Lo escrito sin tocar «Agregar» también se guarda al seguir, y «Atrás» no repite lo ya guardado (afinado en D211: listas con scroll y hojas en el teléfono) | Francisco | 2026-11-27 |
| D211 | En configurar al empezar («agrega un scroll dentro de las impresoras, materiales y gastos fijos para que se vean. En móvil utiliza sheets para los nuevos registros»): las listas de impresoras, materiales y gastos tienen su propio alto y se desplazan dentro, así el título y los botones quedan a la vista en pantallas bajas. En el teléfono, lo nuevo se escribe en una hoja que sube desde abajo: «Agregar otra impresora», «Agregar otro material» y «+ Otro gasto» (nombre y monto), con «Cancelar» y «Agregar»; se cierra también tocando fuera o con Esc. En escritorio, el formulario sigue a la derecha | Francisco | 2026-11-27 |
| D212 | La Calculadora no muestra un precio que no corresponde a lo escrito (crítica de diseño del 2026-11-27, P1 «la Calculadora pierde datos y muestra un resultado viejo»; Francisco eligió empezar por «Datos y margen» y hacer los cuatro P1 en esta vuelta). La descripción se guarda al escribirla, aunque sea después del peso y el tiempo: antes el producto entraba a la orden como «Sin descripción». Al vaciar el peso o el tiempo, o al agregar a la orden, el precio, el costo, la ganancia y el desglose regresan a «—»: antes se quedaba el precio anterior. Sin precio, «Agregar a orden» se ve apagado y al tocarlo marca el campo que falta y dice cuál («Escribe el peso de la placa»); igual en un producto por tamaño sin tamaño elegido o sin precios. **Interpretación:** apagado pero se puede tocar, para decir qué falta; se pregunta en P174. Confirmado en D220 | Francisco | 2026-11-27 |
| D213 | Una sola definición de margen (P1 de la crítica: «Margen 50 %» era un recargo sobre el costo, y en el Dashboard «margen» era ganancia entre ingreso). El control de la Calculadora se llama «Ganancia sobre el costo» (+50 %: lo que se le suma al costo) y debajo dice «Margen: 33 % del precio». «Margen» es solo la parte del precio que es ganancia, en la Calculadora, la Orden, el panel de la cotización y el Dashboard (`margenDePrecio` en `js/costing.js`, con sus pruebas en `tests/margen.test.js`). El número grande se llama «Precio sugerido» (era «Costo total sugerido») y debajo van Costo, Ganancia y Margen en 16 px (la ganancia iba en 12 px). La Orden muestra «Tu ganancia» debajo del total, ya con el descuento, y el panel de la cotización en escritorio «Ganancia … · margen … · solo la ves tú». La comisión del recomendador no entra en la ganancia ni en el margen, tampoco en el Dashboard, como decía D30; «Ingresos aceptados» todavía la incluye (P172; afinado en D218: ya no la incluye). Historial dice «+50 % sobre costo» (antes «Margen 50%», o «Margen undefined%» si faltaba el dato) y «Margen típico» de los productos pasa a «Ganancia sobre el costo». **Interpretación:** los nombres; se confirman en P171. Confirmado en D217 | Francisco | 2026-11-27 |
| D214 | Accesibilidad para lector de pantalla y teclado (P1 de la crítica). Los íconos ya no se leen en voz alta («edit», «delete»): se ocultan al lector. Los botones de solo ícono tienen nombre, con el registro cuando hace falta («Editar Ender 3 V2», «Borrar el rollo de PLA»). En Ajustes, el texto de cada campo es su etiqueta y la pestaña elegida se anuncia como la actual. Los segmentos (Impresoras · Inventario, Cotizaciones · Clientes, moneda, tema) dicen cuál está elegido. El panel de la cotización y el del cliente reciben el foco al abrirse, Esc los cierra y el foco regresa a la fila de la lista. El contorno de foco mide 2 px, del color de acento, en claro y oscuro (antes, una línea de 1 px que casi no se veía en claro). La pestaña del navegador dice en qué pantalla estás («Calculadora · Calculadora de Costos 3D») | Francisco | 2026-11-27 |
| D215 | La Calculadora del teléfono empieza por lo que se escribe (P1 de la crítica: arriba iban $0.00, Preset, Guardar, «Agregar a orden» y las tarjetas de producto, y el peso y el tiempo quedaban fuera de la pantalla). Primero «¿Qué cotizas?», en un renglón que se desliza de lado; luego la pieza (descripción, archivo del slicer, peso, tiempo, piezas, diseño); después el precio con su desglose y los botones. Mientras el precio no se ve, va en la barra de abajo con «Agregar a orden». Las etiquetas son cortas («Peso (g)», «Tiempo (h)», «Piezas») y arriba de ellas dice «De la placa completa, como la da el slicer.» (afina D171: las largas se cortaban justo en la unidad). Cada página abre arriba, no donde se quedó la anterior (Ajustes abría en Exportar/Importar). En escritorio el orden no cambia. Al probarlo se corrigió también que la barra de abajo quedara al final de la página cuando la animación de cambio de página no terminaba (W16 de `aprendizajes.md`). **Interpretación:** el precio después de los datos; se confirma en P173. Confirmado en D219 | Francisco | 2026-11-27 |
| D216 | El estilo se lleva hacia el taller, en otra vuelta (la crítica dijo que se siente de app de finanzas: verde menta sobre negro y etiquetas en mayúsculas en todas partes). Usar el color real del filamento en los datos, por ejemplo en «Material usado», y quitar las etiquetas en mayúsculas donde sobran. Se planea aparte, con `/impeccable` | Francisco (respuesta a la crítica: «Más de taller») | 2026-11-27 |
| D217 | El control de la Calculadora se queda como «Ganancia sobre el costo» y «margen» es solo la parte del precio que es ganancia, en toda la app, como quedó en D213 | Francisco (P171: a) | 2026-11-27 |
| D218 | «Ingresos aceptados» del Dashboard ya no cuenta la comisión del recomendador: es de él, no del negocio (D30). La gráfica de los últimos 6 meses tampoco. Debajo del número dice cuánto se dejó fuera («Sin $100.00 de comisiones») cuando ese mes hubo comisión. La ganancia y el margen ya la dejaban fuera desde D213. **Interpretación:** la nota de la comisión; se pregunta en P177. Confirmado en D228 | Francisco (P172: a) | 2026-11-27 |
| D219 | En el teléfono el precio se queda después de los datos de la pieza, y en la barra de abajo mientras no se ve, como quedó en D215 | Francisco (P173: a) | 2026-11-27 |
| D220 | Sin precio, «Agregar a orden» se queda apagado pero se puede tocar para que diga qué falta, como quedó en D212 | Francisco (P174: a) | 2026-11-27 |
| D221 | Sigue el P2 de la crítica de diseño, antes que el estilo de taller (D216): la Orden de escritorio sin desplazamiento lateral, un botón con un solo significado y Enviada con otro color que Aceptada (D222–D225) | Francisco (P175: a) | 2026-11-27 |
| D222 | La Orden de escritorio es una lista y cada producto va en dos renglones (P2 de la crítica: la tabla medía 848 px en una caja de 637, y el precio, el importe y «Quitar» quedaban detrás de una barra de desplazamiento lateral). Arriba, el producto con su impresora, material y margen, y a la derecha «Editar» y ✕. Abajo, la cantidad × el precio por pieza («c/u»), y el importe a la derecha: los importes de todos los productos quedan en una columna. En una columna angosta se quitan los botones − y + (el campo de cantidad sigue), y «Cancelar» y «Generar cotización» van uno arriba del otro: «Generar cotización» se partía en dos renglones | Francisco | 2026-11-27 |
| D223 | Cuando hay orden y nada nuevo que agregar, el botón de la Calculadora dice «Revisar orden» con el número de productos. Antes decía «Generar cotización», igual que el botón de la revisión, que es el que sí la guarda. «Generar cotización» queda solo para guardar, y la Ayuda lo dice igual | Francisco | 2026-11-27 |
| D224 | Cada estado de la cotización tiene su color y su ícono: Borrador ámbar (lápiz), Enviada azul (avión de papel), Aceptada verde (palomita) y Rechazada roja (✕). Así se ve en la lista, el Dashboard y el panel del cliente. Antes Enviada y Aceptada eran del mismo verde que los botones, los folios y la ganancia. Ahora el verde queda para lo aceptado y la ganancia, y el folio va en gris. En la tabla de Cotizaciones de escritorio, «Enviar» y «Aceptar» van con contorno, y «Rechazar» y «Ver» sin él: antes las píldoras negras pesaban más que el total, que ahora va en negritas. **Interpretación:** azul para Enviada; se pregunta en P176. Confirmado en D227 | Francisco | 2026-11-27 |
| D225 | Con poco ancho, la tabla de Cotizaciones de escritorio deja de mostrar Productos y, si tampoco cabe, Fecha, como ya hacía con el panel de la cotización abierto. Antes la columna Productos se quedaba en 0 y su encabezado se encimaba con «Fecha» (visto a 1112 px de pantalla). Se mide el ancho de la lista, no el de la pantalla. **Interpretación:** ocultar columnas en lugar de pasar a dos renglones; se pregunta en P178. Confirmado en D229 (afinado en D234: Productos se oculta desde 1080 px de lista) | Francisco | 2026-11-27 |
| D226 | Sin cuenta («Entrar sin cuenta»), el botón de abajo de la barra lateral y el de Ajustes del teléfono dicen «Iniciar sesión», no «Cerrar sesión» («En la versión de invitado, en la sidebar, debe decir iniciar sesión porque no esta iniciada»). Abren la pantalla de acceso sin borrar nada del equipo, y ahí «Entrar sin cuenta» cambia a «Seguir sin cuenta», que regresa a la app como estaba. Al entrar con correo o Google, lo configurado sin cuenta pasa a la cuenta como dicen D40, D84 y D86. Antes «Cerrar sesión» borraba lo del equipo con un aviso que hablaba de datos «guardados en tu cuenta en la nube», que un invitado no tiene | Francisco | 2026-11-27 |
| D227 | Enviada se queda en azul con su ícono, y el verde para Aceptada y la ganancia, como quedó en D224 | Francisco (P176: a) | 2026-11-27 |
| D228 | Se queda la nota «Sin $X de comisiones» debajo de «Ingresos aceptados», como quedó en D218 | Francisco (P177: a) | 2026-11-27 |
| D229 | Con poco ancho, Cotizaciones de escritorio oculta columnas (Productos y luego Fecha) en lugar de pasar a dos renglones, como quedó en D225 | Francisco (P178: a) | 2026-11-27 |
| D230 | Siguen los arreglos rápidos de la crítica, antes que el estilo de taller (D216): las recientes del Inicio abren su cotización, «Borrar» aparte en el menú «⋯», Filamento dice cuáles rollos muestra y «Nueva cotización» en el Inicio de escritorio (D231–D234) | Francisco (P179: a) | 2026-11-27 |
| D231 | Una cotización reciente del Inicio abre esa cotización, no la lista (la crítica: «las recientes llevan a la lista y no a la cotización»). En escritorio va a Cotizaciones con su panel abierto; en el teléfono se abre la hoja de siempre, sin salir del Inicio. Cada reciente se puede abrir con el teclado (Enter o espacio). **Interpretación:** en escritorio, a Cotizaciones con el panel, no el panel sobre el Inicio; se pregunta en P180. Confirmado en D235 | Francisco | 2026-11-27 |
| D232 | En el menú «⋯» de una cotización, «Borrar» va aparte, debajo de una raya, para no tocarlo por error: estaba pegado a «Compartir texto» | Francisco | 2026-11-27 |
| D233 | Con más de 4 rollos, Filamento del Inicio dice cuáles muestra: «Los 4 más vacíos · 1 rollo más en Inventario». Antes decía «en 5 rollos» y mostraba 4 sin explicarlo | Francisco | 2026-11-27 |
| D234 | El Inicio de escritorio tiene título y «Nueva cotización» arriba a la derecha, como Cotizaciones; antes había que ir a la Calculadora o a Cotizaciones. Debajo del título va el mes. Sin cotizaciones no sale el botón: el estado vacío de «Ingresos aceptados» ya lo trae (D205). En el teléfono no cambia: ahí están los accesos rápidos. También: el número de ingresos se redondea a centavos antes de darle formato (999.9999 salía «$1000.00» y 1000 salía «$1,000»), y en Cotizaciones la columna Productos se oculta desde 1080 px de lista: con menos solo mostraba «Llavero p…» | Francisco | 2026-11-27 |
| D235 | En escritorio, una cotización reciente del Inicio lleva a Cotizaciones con su panel abierto, donde están las acciones de la lista, como quedó en D231 | Francisco (P180: a) | 2026-11-27 |
| D236 | Sigue un solo formato de dinero en toda la app y avisar al salir de Ajustes con cambios sin guardar, antes que el estilo de taller (D216) (D237, D238) | Francisco (P181: a) | 2026-11-27 |
| D237 | El dinero se escribe igual en toda la app: «$1,250.00», con comas de miles, punto y dos decimales, también en los enteros. Antes había varios formatos: «$1,000» y «$1000» en el Inicio, «$1000.00» en la Orden y la cotización, «$27» en los productos por tamaño y «$12,000», sin centavos, en las impresoras. Aplica en la Calculadora, la Orden, la cotización (vista previa, PDF, imagen y texto para compartir), Cotizaciones, Clientes, Inicio, Inventario, Impresoras, Materiales, Ajustes y la introducción. Los negativos llevan el signo menos antes de la moneda («−$12.50»). En los dos precios grandes (Calculadora e Inicio) los centavos van a menos de la mitad del tamaño, para que se lea «$1,250» de un vistazo. Los campos donde se escribe un número no cambian: un campo de número no acepta comas. Es `formatoDinero` en `js/costing.js`, con sus pruebas en `tests/dinero.test.js`. **Interpretación:** los centavos más chicos en los precios grandes; se pregunta en P182. Confirmado en D239 | Francisco | 2026-11-27 |
| D238 | Al salir de Ajustes con cambios sin guardar (a otra página, en escritorio), la app pregunta: «Seguir editando», «Salir sin guardar» o «Guardar». Si no se puede guardar, te quedas para corregir. Al cerrar o recargar la pestaña, el navegador también pregunta. Pasar de una pestaña de Ajustes a otra no pregunta: lo escrito se conserva (D175). En el teléfono no cambia todavía (P183; afinado en D240: también en el teléfono) | Francisco | 2026-11-27 |
| D239 | En los dos precios grandes, los centavos se quedan a menos de la mitad del tamaño («$1,250» grande y «.00» chico), como quedó en D237 | Francisco (P182: a) | 2026-11-27 |
| D240 | El aviso de cambios sin guardar de Ajustes (D238) también va en el teléfono: al ir a otra página desde Ajustes o desde una de sus secciones, con algo escrito y sin guardar, pregunta lo mismo. Los tres botones van uno debajo de otro, con «Guardar» arriba. Regresar de una sección a la lista de Ajustes no pregunta: lo escrito se conserva hasta guardar o descartar | Francisco (P183: a) | 2026-11-27 |
| D241 | Sigue el estilo de taller (D216): el color real del filamento en los datos y menos etiquetas en mayúsculas. Se planea con `/impeccable` antes de tocar la pantalla | Francisco (P184: a) | 2026-11-27 |
| D242 | «Continuar con Google» en la pantalla de acceso lleva la «G» de Google en sus cuatro colores («agrega el icono de google al inicio de sesión con google»); antes era un ícono genérico de persona | Francisco | 2026-11-27 |
| D243 | Primera vuelta del estilo de taller (D216, D241): la letra y el color del filamento, no la marca (D244–D248). La cotización que recibe el cliente (`css/quote.css`) no cambia | Francisco (P185–P189) | 2026-11-27 |
| D244 | Las etiquetas ya no van en mayúsculas de letra de máquina: letra normal con mayúscula inicial («Ingresos aceptados · nov», «Cotizaciones recientes», «Nombre del cliente», «Correo», «Negocio» en la barra lateral). Aplica en todas: títulos de sección, separadores («Pieza»), nombres de los campos, la barra lateral y los meses de la gráfica («Nov»). La letra de máquina se queda en números, folios y gramos | Francisco (P185: a) | 2026-11-27 |
| D245 | Las etiquetas de estado tampoco van en mayúsculas: «Borrador», «Enviada», «Aceptada», «Rechazada», con su ícono y su color (D224). El panel del cliente usa la misma etiqueta que la lista | Francisco (P186: a) | 2026-11-27 |
| D246 | «Material usado» (Inicio e Inventario) va por rollo de color: «PLA · Rojo», «PLA · Blanco», en lugar de un solo «PLA». Cada parte de la barra y su punto llevan el color real del rollo, con un contorno fino para que el blanco y el negro se vean en claro y oscuro. Si el rollo no tiene color guardado, o el producto no tiene rollo elegido, va el material con la paleta de antes (D180). El nombre va junto a cada color, así no se depende solo del color. **Interpretación:** separar por color; se pregunta en P191. Confirmado en D250 | Francisco (P187: a) | 2026-11-27 |
| D247 | Junto al material de cada producto de la Orden (escritorio y teléfono) va un punto del color del rollo, uno por color en el AMS; el lector de pantalla dice el nombre del color. En la Calculadora ya estaba: los botones de «Color · Rollo» llevan el color de cada rollo (D185). **Interpretación:** el panel de la cotización no cambia todavía, porque es la cotización que recibe el cliente (también en PDF e imagen); se pregunta en P190 (afinado en D252: también ahí) | Francisco (P188: a) | 2026-11-27 |
| D248 | El verde menta del acento (botones, foco, selección) se queda: el cambio de taller es el color del filamento y la letra, no la marca | Francisco (P189: a) | 2026-11-27 |
| D249 | El color del rollo también va en la cotización que recibe el cliente: al cliente le sirve confirmar el color de su pieza (D252) | Francisco (P190: a) | 2026-11-27 |
| D250 | «Material usado» se queda separado por color, con «Otros» después del tercero, como quedó en D246 | Francisco (P191: a) | 2026-11-27 |
| D251 | Sigue lo que quedaba de la crítica: la vista previa que se salía del papel, «Enviar» en la hoja de una cotización en borrador y «Ahora no» chico en la configuración (D253–D255) | Francisco (P192: a) | 2026-11-27 |
| D252 | En la cotización del cliente (vista previa, panel, PDF, imagen y el enlace), debajo de cada producto van el material, el color del rollo con su punto y los gramos: «PLA · ● Rojo · 10g»; en el AMS, un color por rollo. Los textos para compartir lo dicen con palabras: «(PLA Rojo)», «Material: PLA · Blanco y Rojo». Sin rollo elegido o sin color guardado, como antes. El enlace lleva los colores porque el visor no tiene el inventario; el visor revisa que el color sea un hex antes de usarlo | Francisco (P190: a) | 2026-11-27 |
| D253 | La cotización ya no se sale del papel en una hoja angosta (la vista previa de la Orden con la columna angosta, el panel y la hoja del teléfono): con menos de 420 px la tabla usa letra de 12 px y menos relleno, y los importes no se parten; con menos de 300 px se quita la columna «Precio unit.», como en el visor del cliente en el teléfono (`quote.html`), porque la cantidad y el subtotal la dicen. El PDF y la imagen se hacen a lo ancho y no cambian | Francisco | 2026-11-27 |
| D254 | La hoja de una cotización en el teléfono tiene «Enviar» (abre las formas de mandarla, como en la lista) junto a «Cerrar», y arriba «PDF» e «Imagen». Antes un borrador solo ofrecía PDF e imagen | Francisco | 2026-11-27 |
| D255 | En configurar al empezar, «Ahora no» pasa a «Configurar después», con contorno y 44 px de alto (antes un texto de 74 × 31): deja los tres pasos para después, no solo el que se ve. Los avisos que lo mencionan también cambian | Francisco | 2026-11-27 |
| D256 | La barra del costo de la Calculadora lleva un color por rubro (P193; la crítica: era casi toda gris y el rubro más grande, Costos fijos, iba en el gris más apagado). En el orden del desglose: Material azul, Desperdicio gris (es material que se tira, va junto a Material), Energía naranja, Diseño aqua, Depreciación amarillo, Costos fijos, Mantenimiento e Indirectos magenta (los gastos del taller) y Post-procesado violeta. Los puntos del desglose llevan los mismos colores. Mide 8 px, con 2 px entre partes; las partes en cero no se dibujan y cada parte dice su nombre, monto y porcentaje al pasar el ratón. La barra también se pinta al volver a la Calculadora (antes se quedaba vacía). Paleta validada con la herramienta de gráficas (`validate_palette`) en claro y oscuro: vecinos distinguibles con daltonismo (ΔE ≥ 8.4) y con vista normal (≥ 18); el verde y el rojo de esa paleta no se usan, porque son de la ganancia y las pérdidas. **Interpretación:** los tres gastos del taller con el mismo color; se pregunta en P194. Confirmado en D259 | Francisco (P193: a) | 2026-11-27 |
| D257 | Un solo aviso de stock (P193): un rollo con 20 % o menos dice «Por acabarse» en ámbar, con ícono y palabra; sin gramos, «Agotado» en rojo. La misma regla en Inventario, Materiales e Inicio (antes ⚠ rojo con 20 % en Inventario y ↓ roja con menos de 150 g en Materiales). Las barras de lo que queda van neutras y en ámbar cuando se acaba: el rojo ya no dice cuatro cosas en una tarjeta «TPU Rojo» (el color del rollo, la barra, el aviso y Borrar). **Interpretación:** barras neutras, sin el verde de antes; se pregunta en P195. Confirmado en D260 | Francisco (P193: a) | 2026-11-27 |
| D258 | Arriba del Inicio, «Para hoy» dice lo que te necesita (la crítica: «¿y si Inicio respondiera qué te necesita hoy?»): cuántas enviadas esperan respuesta y de hace cuántos días es la más vieja, cuántos borradores faltan por mandar y cuántos rollos hay que reponer (por acabarse y agotados, con la regla de D257). Cada renglón lleva a donde se resuelve: Cotizaciones con el filtro de Enviadas o de Borradores, o Inventario. Sin nada pendiente no sale. En escritorio los renglones van lado a lado. Es `pendientesDeHoy` en `js/estados.js`, con pruebas en `tests/pendientes.test.js`. **Interpretación:** los días se cuentan desde la fecha de la cotización, porque la app no guarda cuándo se mandó, y cuentan todas las enviadas, no solo las viejas; se pregunta en P197 y P198 (afinado en D261: desde que se mandó; confirmado en D262: todas) | Francisco (P196: a) | 2026-11-27 |
| D259 | Costos fijos, Mantenimiento e Indirectos se quedan con el mismo magenta en la barra del costo, como quedó en D256 | Francisco (P194: a) | 2026-11-27 |
| D260 | Las barras de lo que queda en Inventario e Inicio se quedan neutras, y en ámbar cuando el rollo se acaba, como quedó en D257 | Francisco (P195: a) | 2026-11-27 |
| D261 | Cada cotización guarda cuándo se mandó (`enviadaAt`; en el modelo de datos, `enviadaEn`): se pone al pasar a Enviada, por WhatsApp, el enlace o «Marcar como enviada», y queda vacía (null) al volver a Borrador (Deshacer, Regresar un paso o editarla). Aceptada y Rechazada la conservan. «Para hoy» cuenta los días de las enviadas desde ahí; las de antes de v156, que no la tienen, desde la fecha de la cotización. Es un campo nuevo en un documento que la app ya escribe: no cambian `firestore.rules` ni `js/db.js`. Anotado en `docs/modelo-de-datos.md` y, para Javi, en `docs/firebase.md` §3 | Francisco (P197: a) | 2026-11-27 |
| D262 | «Para hoy» cuenta todas las enviadas, con los días de la más vieja, como quedó en D258 | Francisco (P198: a) | 2026-11-27 |
| D263 | Aquí se para: Francisco sube v140–v156 con GitHub Desktop y la usa unos días con sus datos reales en el teléfono. Lo que salga de ese uso es lo siguiente. Quedan anotados para después: Ajustes (que el título no se mueva entre pestañas, Gastos fijos e Indirectos con la misma forma y «Otros» dividido) | Francisco (P199: a) | 2026-11-27 |
| D264 | En escritorio, la página deja el ancho real del panel que se abre a la derecha, no 440 px fijos («al abrir mis productos en la cotización se superpone con el resto de contenido»): «Mis productos» y el editor de producto miden 480 px y tapaban 40 px del precio de la Calculadora. Vale para todos los paneles y para Ajustes | Francisco | 2026-11-27 |

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
| P114 | ¿Guardo las pruebas de sincronización en `npm test`? | Sí | Respondida «Sí, guárdalas» → D113 |
| P115 | ¿Se interpretó bien D113? | (a) sí: siempre antes de subir, también en cambios de diseño | Respondida «Sí, siempre» → D114 |

**Comprobado por Francisco el 2026-11-09, en v106:** la app ya abre sin conexión (antes se quedaba en negro) y la configuración se guarda en la cuenta; «los registros se borran». **Por qué:** cada aviso de la nube reemplaza la lista completa del dispositivo, y se pierde lo que se guardó solo en él: duplicar una cotización, el cliente que se crea al guardar una cotización y el id de Notion. El historial de cálculos y los favoritos nunca suben. Detalle y arreglo sugerido en [`firebase.md`](firebase.md) §3.

**Corregido en v107** (2026-11-09). La causa era más amplia que la de P111: cada aviso de la nube reemplazaba la lista completa del dispositivo, y se perdía todo lo que no hubiera alcanzado a subir, también los gastos guardados justo antes de cerrar la app (esperaban 0.8 s para subir). Ahora `js/db.js` junta los dos lados: recuerda cómo llegó cada registro la última vez de la nube, y así distingue qué cambió en el dispositivo y qué en la nube; lo que nunca subió se conserva y se sube; cualquier `sv()` sube lo que cambió; los ajustes suben al ocultarse la app; y el historial de cálculos y los favoritos ya viven en la nube. Comprobado con `js/db.js` y un Firestore simulado en tiempo real, con dos dispositivos y aperturas y cierres de la app: 20 de 20 pruebas, y abrir la app sin cambiar nada no escribe en la nube. La misma prueba sobre v106 reproduce lo que reportó Francisco: 13 fallas, con las cotizaciones, los clientes, los gastos fijos, los indirectos y los datos del negocio perdidos. No se probó con la cuenta real. Desde D113 esas pruebas están en el repo (`tests/sincronizacion.test.js` y `tests/entrar-con-cuenta.test.js`) y corren con `npm test`.

**Las reglas de Firebase hoy dejan leer a cualquiera** (comprobado el 2026-11-09: sin sesión, Firestore responde 404 y no 403 a un documento que no existe; solo se miró el código de respuesta). No es la causa de que se borren registros, pero cualquiera con la configuración del proyecto, que está en `js/auth.js`, puede leer los datos. Publicar `firestore.rules` es lo primero de [`firebase.md`](firebase.md).

**Los datos de La Casita del Molde se borraron** al entrar con la cuenta (P107, 2026-11-09): es el problema 1. No hay respaldos `calc3d_backup_*.json` en Descargas, Documentos ni el Escritorio (búsqueda por nombre, 2026-11-09). Queda de dónde recuperar: un dispositivo o navegador donde todavía no se haya entrado con la cuenta, y en Notion, la copia completa que guardaba la sincronización hasta v101 («App State — Calc3D») y las ventas aceptadas («Ventas Costeo»). Se pregunta en P110.

**Corregido en v106** (2026-11-09, en la rama `claude/project-review-e78fd0`, falta el Pull Request):

- **Entrar con cuenta ya no borra lo del dispositivo.** Lo que hay se decide antes de escuchar la nube: en una cuenta nueva se sube solo, ajustes incluidos (D40); en una cuenta que ya existía, la app pregunta si agregar las cotizaciones, los clientes y los rollos del dispositivo, y los ajustes de la cuenta se quedan (D86). Antes de subir, guarda una copia en el dispositivo (`c3d_respaldoAntesDeNube`, con el formato de Ajustes › Exportar). Sube en tandas de 450 (Firestore acepta 500) y sin campos vacíos, que hacían fallar la escritura completa. Comprobado con `js/db.js` y un Firestore simulado en 5 situaciones: con 600 cotizaciones, la cuenta nueva sube las 600 y conserva los gastos de $1,860; la cuenta que ya existía pregunta, y si se cancela no toca nada.
- **La app abre sin conexión.** `index.html` pide los archivos sin `?v=105`, y el service worker guarda también la librería de Firebase. Comprobado: los 29 archivos que pide `index.html` están en su lista, y los tres de Firebase se guardan en la caché (prueba en el navegador).
- **Importar un respaldo con sesión** también lo sube a la cuenta: sirve para recuperar datos.
- **«Otros (sin desglosar)» ya se puede borrar** de los gastos fijos. Volvía porque la app comparaba con el total anterior ($2,000, los de ejemplo que quedaron al borrarse los datos) y creaba «Otros» con la diferencia. Ahora eso pasa solo la primera vez que se desglosa un total escrito a mano.
- Lo que llega de la nube a Ajustes ya no se vuelve a escribir en ella cada vez que se abre la app.

**Sigue pendiente:** las reglas de seguridad (P105), el folio que da Firebase (D89), bajar solo lo vivo y los últimos 3 meses (D90), y que un taller nuevo empiece sin los datos de La Casita del Molde (D47).

### Cambios de diseño (2026-11-09)

Francisco los pidió antes de subir las pruebas de D113: D115–D127, que van en v108. Claude los probó en el navegador, en escritorio y en teléfono, sin entrar a ninguna cuenta. **Comprobado por Francisco el 2026-11-09, en su equipo y antes de publicar:** el navegador ofrece guardar la contraseña y, al crear una cuenta, sugiere una segura; el logo aparece en la barra lateral.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P116 | ¿«Recordar contraseña» era que el dispositivo la guarde (D115) o recuperarla por correo si se olvida? | (a) las dos: queda lo hecho y se agrega «¿Olvidaste tu contraseña?» | Respondida (a) → D119 |
| P117 | ¿Clientes junto a Inventario era en la barra lateral (D118) o como pestaña dentro de Inventario? | (a) en la barra lateral, como quedó | Respondida (a) → D120 |
| P118 | ¿En el teléfono también cambia algo de esto? | (a) no: no hay barra lateral, y Ajustes ya ocupa la pantalla | Respondida (a) → D121 |
| P119 | ¿El tema se guarda en cada navegador (D122) o en la cuenta, igual en todos los equipos? | (a) en cada navegador, como quedó | Respondida (a) → D124 |
| P120 | ¿«Auto» se queda en Ajustes › Otros para volver a automático, o se quita también ahí? | (a) se queda | Respondida (a) → D125 |
| P121 | Si el logo cambia en otro equipo, la barra lateral puede no mostrarlo hasta volver a abrir la app. Para que cambie al momento hace falta una línea en `js/db.js`: la lista de qué se redibuja cuando llega algo de la nube; no cambia qué se guarda ni cómo. ¿La agrega Claude o se le deja a Javi? | (a) Claude, con `npm test` | Respondida (a) → D126 |
| P122 | Por cuál de los 5 problemas de la revisión empezar | (a) lo que ve el cliente | Respondida (a) → D128, D129 |
| P123 | Qué hacer con la apariencia | (a) afinar la actual | Respondida (a) → D130 |
| P124 | Hasta dónde llegar en la ronda | (a) lo elegido + contraste | Respondida (a) → D131 |
| P125 | Para qué usar `/stageshow` | (a) ficha de Google Play | Respondida (a) → D132 |
| P126 | ¿Se interpretó bien D128: la cotización nueva solo cambia para quien nunca guardó su diseño? | (a) sí | Respondida (a) → D138 |
| P127 | Qué sigue de la revisión | (a) enviar y su estado (problemas 3 y 4) | Respondida (a) → D139 |

La revisión completa está en `.impeccable/critique/` (fuera de git). Quedan abiertos los problemas 2 a 5: «margen» con tres significados, ninguna cotización llega a «Enviada», 8 a 10 botones por tarjeta, y el primer uso de un taller nuevo.

### Lectura de archivos del slicer (2026-11-18)

Probado con los archivos reales de Francisco: «Sin título» (9.23 g, 39 min 55 s) y la daga de 4 colores (272.04 g, 33 h 7 min), en `.gcode.3mf` y en `.gcode` suelto de 41 MB (se lee en 5 ms). El peso que reporta Bambu ya incluye la purga: modelo ~127 g, torre ~51 g y purga en los cambios de color ~95 g.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P128 | Qué archivos lee | (a) `.gcode` de Bambu, Orca, Prusa y Cura, más el `.gcode.3mf` | Sin respuesta: se aplicó (a) → D133 |
| P129 | Qué tiempo usa | (a) el total estimado | Sin respuesta: se aplicó (a) → D133 |
| P130 | Piezas | (a) solo si son copias del mismo objeto | Sin respuesta: se aplicó (a) → D133 |
| P131 | Purga en multicolor | (a) gramos por color y la purga aparte en 0 | Sin respuesta: se aplicó (a), comprobado con el archivo de 4 colores → D133 |
| P132 | Material | (a) por tipo, si hay uno solo | Sin respuesta: se aplicó (a) → D133 |
| P133 | Resina | (a) a mano | Sin respuesta: se aplicó (a) → D133 |
| P134 | Archivo multicolor de prueba | (a) lo exporta Francisco | Respondida: mandó la daga de 4 colores → D134 |
| P135 | ¿Se interpretó bien D133? | (a) sí | Respondida (a) → D137 |
| P136 | ¿Los rollos de cada cabezal se eligen a mano (D135) o el inventario guarda el código de color para elegirlos solos? | (a) a mano por ahora | Respondida (a) → D136 |

### Enviar y su estado (2026-11-18)

Primera parte del ciclo de vida de §4.1, con D6–D9 y D18 como estaban decididos desde el 2026-10-16. Las reglas viven en `js/estados.js`, con sus pruebas en `tests/estados.test.js`. Probado en el navegador con cotizaciones de ejemplo, en escritorio y en teléfono, sin abrir WhatsApp ni copiar al portapapeles.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P137 | Quién hace «enviar y su estado» | (a) Claude, y se le avisa a Javi | Respondida (a) → D140 |
| P138 | Cómo se cambia `pendiente` a `borrador` | (a) sin reescribir las guardadas | Respondida (a) → D141 |
| P139 | Acción principal de cada tarjeta | (a) la de la tabla, con el resto en «⋯» | Respondida (a) → D143 |
| P140 | Aviso al marcar Enviada por compartir | (a) con «Deshacer» | Respondida (a) → D142 |
| P141 | Notion | (a) quitar el botón y el envío al aceptar | Respondida (a) → D144 |
| P142 | Después de actualizar a la versión 112, ¿ya ves el recuadro clicable y el resumen se va al agregar el producto? | (a) sí | Respondida (a) → D155 |

### Catálogo dentro de la calculadora (2026-11-18)

Francisco: «al seleccionar el catálogo de productos se muestra un drawer con los productos pero no modifica nada en la cotización, es poco intuitivo como se agregan las medidas de los cortadores de galletas». Revisado con `/design:design-critique` e `/impeccable` critique y layout (17/40, cuatro problemas graves: lo agregado no se veía, el tamaño se perdía, dos calculadoras encimadas y la captura de precios frágil). Probado en el navegador en escritorio y teléfono, en claro y oscuro, con los datos de la pestaña respaldados y devueltos.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P143 | Dónde se configura el producto | En la calculadora | Respondida → D148 |
| P144 | Cómo se capturan los precios por tamaño | Tabla editable | Respondida → D149 |
| P145 | Niveles de diseño y refuerzo | Editables por producto | Respondida → D150 |
| P146 | Alcance | Todo + accesibilidad | Respondida → D151 |

### Editar los productos de la orden (2026-11-20)

Probado en el navegador en escritorio y teléfono con una orden de prueba (una pieza con post-procesado, un cortador y una pieza «de antes» sin `entrada`), con los datos de la pestaña respaldados y devueltos.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P147 | Al editar un producto que tenía un precio escrito a mano, ¿qué precio queda? | (a) el calculado, con un aviso que muestra los dos; (b) se conserva el escrito a mano | Respondida (a) → D154 |
| P148 | «Cancelar» en el pie de la orden sale sin guardar (D156). ¿En el teléfono también, o el panel de la orden sigue solo cerrándose con «Cancelar»? | (a) igual en los dos: «Cancelar» sale sin guardar, y la ✕ cierra y conserva la orden; (b) en el teléfono, solo cerrar | Respondida (a) → D164 |

### Tarjetas, Cake Topper y cotización nueva (2026-11-20)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P149 | «Cake Topper» es un producto por peso y tiempo sin datos típicos: al elegirlo solo pone su nombre y 1 h de diseño y pide el peso y el tiempo. ¿Qué hacemos con él? | (a) dejarlo como atajo y guardarle peso, tiempo y margen típicos para que llene todo; (b) pasarlo a «Por tamaño» con precios por tamaño; (c) dejarlo como está; (d) quitarlo | Respondida (c) → D169 |
| P150 | ¿La medida que sale del archivo va en la descripción de la cotización (D168)? | (a) sí, al final («Cake Topper · 15.7 × 13.6 × 0.4 cm»); (b) solo en el resumen del archivo, no en la cotización | Respondida (b) → D170 |
| P151 | ¿Qué tamaños y precios lleva el «Cake Topper»? | (a) los capturas en «Mis productos › Editar» (tabla, «Llenar varios tamaños de una vez»); (b) me los pasas y los dejo como precios iniciales del catálogo | Abierta |

### Escritorio de verdad y menos textos (2026-11-25)

Crítica con /impeccable sobre producción v127 en Edge (dos revisiones aisladas: diseño, solo lectura con la sesión real, y detector), 26/40; archivo en `.impeccable/critique/`. Lo hecho se probó en local con datos de prueba, en escritorio (1672 px) y teléfono.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P152 | ¿Qué hago primero? | Textos y duplicados | Respondida → D171 |
| P153 | ¿Cuánto abarco en esta vuelta? | Las 3 P1 (textos, listas como tablas, cliente sin pantalla completa) | Respondida → D171, D173, D174 |
| P154 | ¿Qué hago con las ayudas que sí sirven? | A un «?» | Respondida → D171 |
| P155 | ¿Controles más chicos para ratón en escritorio? | Sí, para ratón | Respondida → D172 |
| P156 | Quedan de la crítica: Ajustes en formulario de dos columnas con un solo «Guardar», el editor de cliente compacto y las hojas con velo oscuro (Impresora, Material, Filamento) como paneles sin velo. ¿Siguen? | (a) sí, en la siguiente vuelta; (b) no por ahora | Respondida (a) → D175–D177 |

### Materiales en Ajustes y material usado (2026-11-25)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P157 | ¿Cómo mide la tarjeta «Material usado» el material que más se ocupa? (a) gramos del mes calendario, contra el mes anterior, como quedó; (b) número de piezas en lugar de gramos; (c) los últimos 30 días en lugar del mes | (a) | Respondida (a) → D181 |
| P158 | Las impresoras también son parámetros que se capturan una vez (consumo, costo, vida útil), como los materiales. ¿Pasan también a Ajustes? (a) sí, y el catálogo queda con lo del día a día (Inventario y Clientes); (b) no, se quedan en el catálogo | (a) | Respondida (b, por ahora) → D181 |

### Panel de la cotización (2026-11-25)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P159 | El panel de la cotización ahora se cierra al salir de Cotizaciones y Clientes, a cualquier página (D183). ¿Así, o solo al entrar a la Calculadora? (a) a cualquier página, como quedó; (b) solo en la Calculadora | (a) | Respondida (a) → D184 |

### Color del rollo (2026-11-25)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P160 | El color del rollo se ve como un punto junto al nombre, y la barra sigue en verde, ámbar o rojo según lo que queda (D185). ¿Así, o la barra también en el color del filamento? (a) punto, y la barra avisa lo que queda; (b) la barra en el color del filamento (el aviso de 20 % o menos queda con el ícono) | (a) | Respondida (a) → D186 |

### Kits a precio fijo (2026-11-26)

El kit de la casita de galleta: 10 piezas, unos 98 g de PLA sólido según sus STL (3 cortadores y 7 marcadores). Se vende en $250.

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P161 | ¿Cómo se manejan los kits? (a) un tipo nuevo, «Precio fijo», con su receta y el margen a la vista; (b) por peso y tiempo, y ajustar el precio a mano; (c) un paquete de productos del catálogo | (a) | Respondida (a) → D187 |
| P162 | ¿De dónde sale el costo del kit? (a) de los `.3mf` de sus placas; (b) gramos y horas a mano; (c) las dos | (a) | Respondida (c, «se puede elegir») → D188 |
| P163 | ¿Las piezas del kit se venden sueltas? (a) no, solo el kit; (b) sí | (a) | Respondida (a, «aunque se maneja como cualquier otra impresión») → D189 |
| P164 | Si al precio fijo el margen queda abajo, ¿qué hace la app? (a) avisa y muestra el margen real, sin cambiar el precio; (b) además propone el precio | (a) | Respondida (a) → D190 |
| P165 | ¿El kit tiene variantes? (a) no, un solo precio; (b) sí | (a) | Respondida (a) → D191 |

### Empezar vacío (2026-11-26)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P166 | D47 decía que un negocio nuevo elige de una lista de impresoras y materiales comunes, con precios de referencia. ¿Agrego en los estados vacíos un botón para eso? (a) sí: «Agregar los comunes» pone PLA, PETG, ABS, TPU y resina con precios de referencia que se cambian; para impresoras, una lista de modelos para elegir; (b) no, cada quien captura los suyos | (a) | Respondida (a) → D195 |

### Recorrido guiado (2026-11-26)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P167 | Al entrar por primera vez se ven la introducción de 5 pasos y después el recorrido por la pantalla (D198). ¿Así, o solo el recorrido? (a) las dos: la introducción explica por qué, el recorrido dónde está cada cosa; (b) solo el recorrido, más corto; (c) la introducción más corta (2 o 3 pasos) y el recorrido | (a) | Respondida (a) → D199 |

### Ayuda y archivos de varias placas (2026-11-26)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P168 | Un `.3mf` de varias placas, ¿con qué empieza la calculadora? (a) todas juntas, como una pieza, y se puede elegir una (como quedó); (b) la placa 1, y se puede elegir «Todas juntas»; (c) preguntar cada vez | (a) | Respondida (a) → D202 |

### La Ayuda en dos secciones (2026-11-26)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P169 | El recorrido y la guía quedaron en dos secciones de la misma página, una debajo de la otra (D203). ¿Así, o en pestañas? (a) secciones, se ve todo de una vez; (b) dos pestañas, «Recorrido» y «Guía» | (a) | Respondida (a) → D204 |

### Configurar al empezar (2026-11-27)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P170 | D88 también pedía los gastos en la introducción. ¿Agrego un tercer paso, «Tus gastos del mes», con los gastos fijos y las horas que imprimes al mes? (a) sí, con «Ahora no» como los otros; (b) no, se quedan en Ajustes | (a) | Respondida (a) → D209 |

### Crítica de diseño: datos, margen, accesibilidad y teléfono (2026-11-27)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P171 | El control de la Calculadora se llama «Ganancia sobre el costo» (+50 %) y «margen» es solo la parte del precio que es ganancia (33 %), en toda la app (D213). ¿Así? (a) sí; (b) el control vuelve a llamarse «Margen» y lo otro «ganancia sobre el precio» | (a) | Respondida (a) → D217 |
| P172 | La ganancia y el margen del Dashboard ya no cuentan la comisión del recomendador (D30), pero «Ingresos aceptados» sí. ¿También la saco de los ingresos? (a) sí, los ingresos sin la comisión; (b) por ahora no | (a) | Respondida (a) → D218 |
| P173 | En el teléfono, el precio va después de los datos de la pieza y, mientras no se ve, en la barra de abajo (D215). ¿Así, o arriba como antes? (a) así; (b) arriba | (a) | Respondida (a) → D219 |
| P174 | Sin precio, «Agregar a orden» se ve apagado y al tocarlo dice qué falta (D212). ¿Así, o desactivado del todo? (a) así, explica qué falta; (b) desactivado | (a) | Respondida (a) → D220 |
| P175 | ¿Qué sigue? (a) el P2 de la crítica: la Orden de escritorio sin desplazamiento lateral, un botón con un solo significado («Revisar orden (2)») y Enviada con otro color que Aceptada; (b) primero el estilo de taller (D216) | (a) | Respondida (a) → D221 |

### El P2 de la crítica e «Iniciar sesión» sin cuenta (2026-11-27)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P176 | Enviada va en azul con su ícono, y el verde queda para Aceptada y la ganancia (D224). ¿Así? (a) azul; (b) gris, para que solo resalten Borrador y Aceptada | (a) | Respondida (a) → D227 |
| P177 | Debajo de «Ingresos aceptados» dice cuánto se dejó fuera de comisiones («Sin $100.00 de comisiones», D218). ¿Se queda? (a) sí, así se entiende por qué no cuadra con la suma de las cotizaciones; (b) no, solo el número | (a) | Respondida (a) → D228 |
| P178 | En Cotizaciones de escritorio, con poco ancho se ocultan Productos y luego Fecha (D225). ¿Así, o cada cotización en dos renglones, como la Orden? (a) ocultar columnas; (b) dos renglones | (a) | Respondida (a) → D229 |
| P179 | ¿Qué sigue? (a) los arreglos rápidos de la crítica: las recientes del Inicio abren su cotización, «Borrar» lejos de «Compartir» en el menú «⋯», Filamento dice cuántos rollos muestra y «Nueva cotización» en el Inicio de escritorio; (b) el estilo de taller (D216) | (a) | Respondida (a) → D230 |

### Arreglos rápidos de la crítica (2026-11-27)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P180 | En escritorio, una cotización reciente del Inicio te lleva a Cotizaciones con su panel abierto (D231). ¿Así, o el panel encima del Inicio sin cambiar de página? (a) a Cotizaciones, donde están las acciones de la lista; (b) el panel sobre el Inicio | (a) | Respondida (a) → D235 |
| P181 | ¿Qué sigue? (a) un solo formato de dinero en toda la app («$1,000.00»: hoy el Inicio dice «$1,000» arriba y «$1000» en las recientes, y Ajustes «$12,000», «$ 1500» y «2410») y avisar al salir de Ajustes con cambios sin guardar; (b) el estilo de taller (D216) | (a) | Respondida (a) → D236 |

### Formato de dinero y aviso de Ajustes (2026-11-27)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P182 | En los dos precios grandes (Calculadora e Inicio), los centavos van a menos de la mitad del tamaño: «$1,250» grande y «.00» chico (D237). ¿Así? (a) así; (b) todo del mismo tamaño | (a) | Respondida (a) → D239 |
| P183 | En el teléfono, cada sección de Ajustes tiene su «Guardar» y salir con cambios no avisa. ¿Le pongo el mismo aviso que en escritorio (D238)? (a) sí; (b) no, en el teléfono cada sección se guarda con su botón | (a) | Respondida (a) → D240 |
| P184 | ¿Qué sigue? (a) el estilo de taller (D216): el color real del filamento en los datos y menos etiquetas en mayúsculas; (b) antes, lo que queda de la crítica: la vista previa de la cotización se sale del papel en columnas angostas y en el teléfono, la hoja de una cotización en borrador no ofrece «Enviar» y «Ahora no» chico en la configuración | (a) | Respondida (a) → D241 |

### El estilo de taller (D216, D241) (2026-11-27)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P185 | Las etiquetas en mayúsculas de letra de máquina («INGRESOS ACEPTADOS · NOV», «COTIZACIONES RECIENTES», «NOMBRE DEL CLIENTE», «CORREO») pasan a letra normal con mayúscula inicial: «Ingresos aceptados · nov», «Nombre del cliente». ¿Dónde? (a) en todas: títulos de sección y nombres de los campos; la letra de máquina se queda solo en números, folios y gramos; (b) solo en los títulos de sección; (c) solo en los nombres de los campos | (a) | Respondida (a) → D244 |
| P186 | Las etiquetas de estado («BORRADOR», «ENVIADA»…) ¿también sin mayúsculas, «Borrador», «Enviada»? (a) sí, ya llevan ícono y color; (b) se quedan en mayúsculas, son etiquetas cortas | (a) | Respondida (a) → D245 |
| P187 | «Material usado»: cada parte de la barra con el color real del rollo (rojo para «PLA · Rojo»), con una raya fina entre partes y contorno en los claros (blanco, natural). Sin color guardado, la paleta de hoy. ¿Así? (a) sí; (b) el color real solo en un punto junto al nombre, y la barra con la paleta probada para daltonismo (D180) | (a) | Respondida (a) → D246 |
| P188 | ¿Dónde más el color del rollo? (a) también junto al material en la Orden, el panel de la cotización y la Calculadora (un punto del color); (b) solo en Inventario, Inicio y «Material usado», donde ya está o se pidió | (a) | Respondida (a) → D247 |
| P189 | El verde menta del acento (botones, foco, selección) ¿se queda? (a) sí, por ahora: el cambio de taller es el color del filamento y la letra, no la marca; (b) probar un acento más cálido, de taller | (a) | Respondida (a) → D248 |

### Estilo de taller, primera vuelta (2026-11-27)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P190 | El panel de la cotización muestra la cotización tal como la recibe el cliente, igual que el PDF y la imagen. ¿Le pongo el color del rollo junto al material («PLA · Rojo», con su punto)? (a) sí: al cliente le sirve confirmar el color de su pieza; (b) no, el color solo en la Orden | (a) | Respondida (a) → D249 |
| P191 | «Material usado» ahora separa por color: «PLA · Rojo» y «PLA · Blanco» en lugar de un solo «PLA» (D246). Con más de 4, después del tercero se juntan en «Otros». ¿Así? (a) así, por color; (b) por material, con los colores solo en puntos | (a) | Respondida (a) → D250 |
| P192 | ¿Qué sigue? (a) lo que queda de la crítica: la vista previa de la cotización que se sale del papel en columnas angostas y en el teléfono, «Enviar» en la hoja de una cotización en borrador y «Ahora no» chico en la configuración; (b) otra cosa que tengas en mente | (a) | Respondida (a) → D251 |

### Después de la crítica (2026-11-27)

| # | Pregunta | Recomendado | Estado |
|---|---|---|---|
| P193 | ¿Qué sigue? (a) la barra del desglose del costo con un color por rubro (hoy casi toda gris, y el rubro más grande va en el gris más apagado) y un solo aviso de stock bajo (hoy ⚠ en Inventario y ↓ en Materiales); (b) Ajustes: que el título no se mueva entre pestañas, Gastos fijos e Indirectos con la misma forma y «Otros» dividido; (c) que el Inicio diga qué te necesita hoy: enviadas sin respuesta, rollos por acabarse y borradores sin mandar | (a) | Respondida (a) → D256, D257 |
| P194 | En la barra del costo, Costos fijos, Mantenimiento e Indirectos comparten el magenta: son los gastos del taller y los distingue su nombre en el desglose (D256). ¿Así? (a) así; (b) juntarlos en un solo rubro, «Gastos del taller», en la barra y el desglose | (a) | Respondida (a) → D259 |
| P195 | Las barras de lo que queda en Inventario e Inicio ya no van en verde: neutras, y en ámbar cuando el rollo se acaba (D257). ¿Así? (a) así: el color avisa solo cuando hay algo que hacer; (b) volver al verde, ámbar y rojo de antes | (a) | Respondida (a) → D260 |
| P196 | ¿Qué sigue? (a) que el Inicio diga qué te necesita hoy: enviadas sin respuesta, rollos por acabarse y borradores sin mandar; (b) Ajustes: que el título no se mueva entre pestañas, Gastos fijos e Indirectos con la misma forma y «Otros» dividido | (a) | Respondida (a) → D258 |
| P197 | «Para hoy» cuenta los días desde que se hizo la cotización, no desde que se mandó, porque eso no se guarda. ¿Guardo la fecha en que se manda? Es un dato más en cada cotización de Firebase (sin cambiar las reglas de seguridad); hay que anotarlo en `docs/modelo-de-datos.md` y avisarle a Javi. (a) sí, para que cuente desde que se mandó; (b) no, basta la fecha de la cotización | (a) | Respondida (a) → D261 |
| P198 | ¿«Para hoy» cuenta todas las enviadas, o solo las que llevan varios días sin respuesta? (a) todas, con los días de la más vieja; (b) solo las de más de 3 días | (a) | Respondida (a) → D262 |
| P199 | ¿Qué sigue? (a) parar aquí: subir v140–v155 con GitHub Desktop y usarla unos días con tus datos reales en el teléfono, y luego seguir con lo que salga; (b) seguir con Ajustes: que el título no se mueva entre pestañas, Gastos fijos e Indirectos con la misma forma y «Otros» dividido | (a) | Respondida (a) → D263 |

---

## 6. Lo que sigue

1. ~~**[`flujos.md`](flujos.md)**, en curso desde el 2026-10-16, con sus diagramas de `/diagram-design`: la máquina de estados de la cotización (con Cancelada y regresar un paso), de la calculadora a la cotización, de invitado a cuenta, borrar la cuenta, pagos con saldo y cancelación, y de leer el archivo del slicer a la cotización (D57).~~ Hecho: los 7 flujos con sus diagramas, y sus preguntas (P66–P87) respondidas al 2026-11-03.
2. ~~**`base-de-datos.md`**: el modelo por negocio (D46), completo aunque la primera versión no use todo (§4.12), y al día con v100.~~ Hecho como [`modelo-de-datos.md`](modelo-de-datos.md) el 2026-11-03, con su diagrama; sus preguntas se respondieron el mismo día (D89–D98).
3. **Borrador del aviso de privacidad** (D51), antes de subir la app a Google Play.
4. **Buscar «Placa 3D» en Marcanet y en Google Play** antes de pagar el dominio y la cuenta de desarrollador (D52, D56). Le toca a Francisco.
5. ~~**Juntar v101 a `main`** con un Pull Request en GitHub: hasta entonces la app publicada sigue con la sincronización sin contraseña (D71) y con los documentos del repo a la vista (D70). Le toca a Francisco; la rama ya está en GitHub desde el 2026-11-03.~~ Hecho el 2026-11-03 (Pull Request #1, merge `92c5fb8`). Comprobado ese día, solo con códigos de estado: la app responde 200 con la caché `calc3d-v101`, y `/MEJORAS.md`, `/CHANGELOG.md`, `/README.md`, `/docs/AUDITORIA.md`, `/docs/reglas-de-negocio.md`, `/js/sync.js`, `/api/sync/pull` y `/api/sync/push` responden 404.
6. **Corregir la integración de Firebase:** ~~que entrar con cuenta no borre los datos, que la app abra sin conexión~~ corregido en v106 y publicado el 2026-11-09 (commit `294fe17`); ~~recuperar los datos de La Casita del Molde (P110)~~ no se recuperan (D107); ~~que se borren registros~~ corregido en v107 (D111, D112). Falta que Javi publique las reglas de seguridad, que hoy dejan leer a cualquiera (D108; guía en [`firebase.md`](firebase.md)).
