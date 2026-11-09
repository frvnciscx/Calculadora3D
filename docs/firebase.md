# Firebase: reglas de seguridad y lo que falta

Para Javi: qué hay en Firebase, las reglas de seguridad que faltaban y lo pendiente de la integración. Francisco pidió dejarlo en el repo para que Javi lo revise e implemente lo que haga falta (D108 de [`reglas-de-negocio.md`](reglas-de-negocio.md)).

**Actualizado:** 2026-11-09

**Fuentes:** [`js/auth.js`](../js/auth.js) y [`js/db.js`](../js/db.js) en v106 · [`modelo-de-datos.md`](modelo-de-datos.md) · [`reglas-de-negocio.md`](reglas-de-negocio.md) §5, «Integración de Firebase» · lo que Francisco probó el 2026-11-09.

**Cómo se trabaja en este repo:** las decisiones se anotan en el §2 de `reglas-de-negocio.md` (D#), y `main` se publica solo en Vercel. Antes de tocar scripts, ver las reglas de [`CLAUDE.md`](../CLAUDE.md): la lista de `sw.js` debe tener los mismos nombres que pide `index.html` (sin `?v=`), y `CACHE_NAME` sube en cada cambio publicado.

---

## 1. Lo que hay hoy (v106)

- **Proyecto** `calculadora3d-prod`. Inicio de sesión con correo, con Google (ventana emergente) y anónimo («Entrar sin cuenta», que no usa Firestore).
- **Firestore** con copia en el dispositivo (`enablePersistence`). Estructura de [`modelo-de-datos.md`](modelo-de-datos.md): `usuarios/{uid}` y `negocios/neg_{uid}`, con `miembros`, y adentro `ajustes` (`general` y `documento`), `impresoras`, `materiales`, `rollos`, `clientes`, `productos` y `cotizaciones`.
- **v107** (2026-11-09) corrigió que se borraran registros: ahora la app junta lo del dispositivo con la nube, en vez de reemplazarlo (ver el comentario de «Sincronización» en `js/db.js`). Cualquier `sv()` sube lo que cambió, y el historial y los favoritos ya están en la nube.
- **v106** (2026-11-09) corrigió dos cosas de v105:
  - Entrar con cuenta borraba los datos del dispositivo. Ahora se decide antes de escuchar la nube.
  - La app no abría sin conexión. Francisco comprobó el 2026-11-09 que ya abre.
  - Detalle en el [`CHANGELOG.md`](../CHANGELOG.md).

---

## 2. Reglas de seguridad

Están en [`firestore.rules`](../firestore.rules), en la raíz. Siguen el §6 de `modelo-de-datos.md`, ajustado a lo que hace `js/db.js`.

| Quién | Qué puede hacer |
|---|---|
| Persona con cuenta | Leer y cambiar su `usuarios/{uid}` |
| Persona con cuenta | Crear `negocios/neg_{su uid}`, siendo el único miembro y `dueño` |
| Miembro del negocio | Leer el negocio. El dueño lo cambia, sin tocar `miembros`, y lo borra |
| Miembro del negocio | Leer y escribir todo lo de adentro |
| Sin cuenta (anónimo) | Nada en Firestore |
| Todo lo demás | Cerrado |

- **Costo:** para revisar la lista de miembros, la regla lee el documento del negocio. Es una lectura por consulta, no por documento.
- **No están probadas:** en este equipo no hay emulador ni `firebase-tools`. Hay que revisarlas antes de publicar.

### Antes de publicar

> **Urgente:** hoy las reglas dejan leer a cualquiera. El 2026-11-09, sin sesión, Firestore respondió 404 (no 403) al pedir un documento que no existe. Solo se miró el código de respuesta.

1. **Ver qué reglas hay hoy** en la consola, en Firestore › Reglas.
   - Si dicen `allow read, write: if request.time < timestamp.date(...)`, es el «modo de prueba»: hasta esa fecha, cualquiera con la configuración del proyecto lee y cambia todo. Esa configuración está en `js/auth.js`, que es público.
   - Hoy la app guarda la configuración, así que no están cerradas del todo.
2. **Revisar los dominios autorizados** en Authentication › Settings: `calculadora3-d-delta.vercel.app` y `localhost`.
3. **Opcional:** restringir la clave de la API en Google Cloud › Credenciales a esos dos dominios. La clave es pública por diseño; la restricción evita que se use desde otros sitios.

### Cómo publicarlas

- **Desde la consola:** copiar `firestore.rules` en Firestore › Reglas, y luego «Publicar».
- **Desde la terminal**, con `firebase-tools` (`npm install -g firebase-tools`), en la raíz del repo:
  ```bash
  firebase login
  firebase deploy --only firestore:rules
  ```
  `firebase.json` y `.firebaserc` ya apuntan al proyecto. `.vercelignore` deja estos tres archivos fuera del sitio.

### Cómo probarlas

En la consola, en Firestore › Reglas › «Rules playground».
- La simulación lee datos reales para el `get()` de la regla, así que se prueba con un negocio que exista.
- `{uid}` es el de una cuenta de prueba, y `{otro}`, el de otra.

| Prueba | Operación y ruta | Sesión | Esperado |
|---|---|---|---|
| Tu perfil | get `usuarios/{uid}` | `{uid}`, con correo | Permitido |
| El perfil de otro | get `usuarios/{otro}` | `{uid}` | Denegado |
| Crear tu negocio | create `negocios/neg_{uid}` con `miembros: { {uid}: 'dueño' }` | `{uid}` | Permitido |
| Crear un negocio ajeno | create `negocios/neg_{otro}` | `{uid}` | Denegado |
| Tus cotizaciones | get `negocios/neg_{uid}/cotizaciones/x` | `{uid}` | Permitido |
| Las de otro negocio | get `negocios/neg_{otro}/cotizaciones/x` | `{uid}` | Denegado |
| Sin cuenta | get `negocios/neg_{uid}/cotizaciones/x` | anónima | Denegado |

Después, en la app, hacer lo mismo de verdad:
1. Entrar con una cuenta, crear y editar una cotización, cerrar la app y volver a abrirla.
2. Entrar con otra cuenta y ver que no aparece nada de la primera.

---

## 3. Lo que falta, en orden

1. ~~**Se borran registros**~~ **Corregido en v107** (D111, D112). Lo de abajo queda como explicación de qué pasaba.
   - **Por qué:** cada vez que la nube avisa de un cambio, `js/db.js` reemplaza la lista completa del dispositivo con la de la nube. Lo que se guardó solo con `sv()`, sin escribirlo en Firestore, desaparece. Pasa en tres lugares:
     - Duplicar una cotización ([`js/quotes.js:933`](../js/quotes.js)).
     - El cliente que se crea al guardar una cotización con «Guardar cliente» ([`js/quotes.js:529`](../js/quotes.js)).
     - El id de Notion que se anota en una cotización aceptada ([`js/quotes.js:1560`](../js/quotes.js)).
   - **Arreglo sugerido:** que `dbNotificarEscritura` también atienda `quotes`, `clients`, `inventory` y `catalog`, y escriba los documentos que cambiaron desde la última vez que llegó la nube. Así cualquier `sv()` llega a Firestore, también los que se agreguen después.
     - Los borrados siguen explícitos, con `dbBorrar*`: deducirlos de la lista puede borrar todo si una lista se vacía por error.
     - Las escuchas de la nube deben escribir con `localStorage.setItem` y no con `sv()`, para no reenviar lo que acaba de llegar. Así quedó ya con los ajustes en v106.
   - Quedó así en v107, con un ajuste: además de subir lo que cambió, al llegar la nube se junta con lo del dispositivo en vez de reemplazarlo. Así tampoco se pierde lo que se guardó sin conexión con la nube o justo antes de cerrar la app.
2. ~~**El historial de cálculos y los favoritos no van a la nube.**~~ **Corregido en v107.**
   - `modelo-de-datos.md` §4.11 los pone en `calculos/` (los últimos 100) y `favoritos/`.
   - Hoy viven solo en el dispositivo, y el historial se borra al cerrar sesión (`limpiarDatosLocales`).
3. **Folio** (D89). Hoy lo da cada dispositivo.
   - Lo debe dar Firebase con el contador de `contadores/cotizaciones`, en una transacción.
   - Sin conexión, la cotización queda «Sin folio» hasta conectarse.
4. **Qué baja al abrir** (D90). Hoy se escuchan todas las cotizaciones.
   - Deben bajar las vivas y las de los últimos 3 meses.
   - Las demás se buscan por cliente o folio.
5. **Borrar la cuenta** (D41) y la página web para pedirlo (D98). `modelo-de-datos.md` §10 trae el orden.
6. **Arranque de un negocio nuevo** (D47, D87, D88). Hoy un taller nuevo recibe lo de La Casita del Molde:
   - Sus impresoras y materiales.
   - $2,000 de gastos fijos.
   - Su nombre cuando no escribe uno ([`js/db.js:121`](../js/db.js)).
7. **Notion fuera** (D33). `api/notion.js` y `sendToNotion` todavía mandan a Notion las cotizaciones aceptadas.
8. **Lo de los flujos:** pagos, estados nuevos, anticipo y fecha de entrega ([`flujos.md`](flujos.md) y `modelo-de-datos.md` §4.9 y §4.10).
