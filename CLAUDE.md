# Calculadora 3D — La Casita del Molde

Cotizador de impresión 3D del negocio de Francisco. Nombre de producto, provisional: **«Placa 3D»** (D56 de `docs/reglas-de-negocio.md`). Una sola página HTML con JavaScript sin framework, publicada en Vercel; los datos viven en `localStorage` y, con cuenta, en Firebase (desde v105, 2026-11-06, de Javi Gama; revisión en `docs/reglas-de-negocio.md` §5, «Integración de Firebase»).

**No es Teckio.** Las reglas 1–5 del `CLAUDE.md` del Asistente, `DESIGN.md` e `INSTRUCTIONS.md` no aplican aquí.

---

## Antes de empezar, leer

1. **Decisiones del cotizador** — qué es, dónde vive cada cosa, qué decidió Francisco y qué sigue:
   `<ASISTENTE>\docs\projects\cotizador\README.md`
2. **Forma de trabajo con Francisco** — comunicación, alcance, verificación, git y modo aprendizaje:
   `<ASISTENTE>\docs\asistente\forma-de-trabajo.md`
3. **El documento de `docs/` que toque la tarea** (abajo), y [`docs/aprendizajes.md`](docs/aprendizajes.md).

Estos documentos viven en el repo del Asistente y se leen de ahí: no se copian a este repo.

**`<ASISTENTE>` es la carpeta donde está el repo del Asistente en ESTE equipo.** Cambia de equipo, así que este repo no la guarda: cada equipo la anota una vez en su `~/.claude/CLAUDE.md`, en «Repos en este equipo», con la línea «Repo del asistente en este equipo: <ruta>» (convención del Asistente, `herramientas.md` §8.5, 2026-10-19). Si no está anotada, preguntarla a Francisco antes de leer.

---

## Documentos de este repo (`docs/`)

| Documento | Qué tiene |
|---|---|
| [`docs/reglas-de-negocio.md`](docs/reglas-de-negocio.md) | Ciclo de vida de la cotización, anticipo, entrega, IVA, comisiones, empaque, cuentas, tiendas y qué entra a la primera versión. Es el **único registro de decisiones** (D1–D132 al 2026-11-09), también de las que salen de `flujos.md`, `modelo-de-datos.md` y `competencia.md`. Manda sobre los demás documentos cuando se contradigan |
| [`docs/flujos.md`](docs/flujos.md) | Los flujos de la primera versión, con diagramas HTML en `docs/flujos/`. **Hechos los 7**, con sus preguntas respondidas, al 2026-11-03 |
| [`docs/competencia.md`](docs/competencia.md) | Qué ofrecen las apps y plataformas que compiten, qué tienen y no tiene la app, y cómo proceder (2026-10-16) |
| [`docs/modelo-de-datos.md`](docs/modelo-de-datos.md) | Qué guarda la app en Firebase, organizado por negocio, con su diagrama (2026-11-03). Sus preguntas, respondidas: D89–D98 |
| [`docs/firebase.md`](docs/firebase.md) | Para Javi: lo que hay en Firebase, cómo publicar y probar las reglas de seguridad, y lo que falta de la integración, en orden (2026-11-09) |
| [`docs/BASE-DE-DATOS.md`](docs/BASE-DE-DATOS.md) | El diseño anterior (2026-10-05), por persona. Superado en parte por `modelo-de-datos.md`; no se renombra: en Windows sería el mismo archivo que `base-de-datos.md` |
| [`docs/MAPA-DE-SITIO.md`](docs/MAPA-DE-SITIO.md) | Qué pantallas existen y qué se puede añadir |
| [`docs/AUDITORIA.md`](docs/AUDITORIA.md) | Revisión del código (2026-10-04) con orden de trabajo |
| [`docs/AUDITORIA-UX.md`](docs/AUDITORIA-UX.md) | Auditoría de usabilidad con tres personas y las decisiones de negocio pendientes |
| [`docs/ANDROID.md`](docs/ANDROID.md) | Ruta a Android con Capacitor y Firebase Auth |
| [`docs/aprendizajes.md`](docs/aprendizajes.md) | Lo aprendido en este proyecto: síntoma → causa → solución |
| [`docs/para-el-asistente/`](docs/para-el-asistente/README.md) | Lo que hay que llevar al repo del Asistente; se aplica desde la sesión central del Asistente |

También en la raíz: [`CHANGELOG.md`](CHANGELOG.md) (qué cambió en cada versión) y [`MEJORAS.md`](MEJORAS.md) (backlog del uso diario). Cuando se contradigan, manda la auditoría.

---

## Skills del Asistente

Viven en `<ASISTENTE>\.agents\skills\` y **se leen de ahí antes de usarlos**; no se copian ni se hacen de memoria. El de diagramas trae su revisión: `python <ASISTENTE>\.agents\skills\diagram-design\scripts\self_check.py <archivo>` (en Windows es `python`, no `python3`).

| Skill | Archivo de entrada | Cuándo |
|---|---|---|
| `/plan` | `plan\prompt.md` | Planeación antes de diseñar: personas, arquitectura de información, mapa de sitio, flujos, inventario de pantallas |
| `/diagram-design` | `diagram-design\SKILL.md` | Cualquier diagrama: flujos, máquina de estados, modelo de datos. Estilo neutro (decisión de Francisco, 2026-10-15) |
| `/system-design` | `system-design\SKILL.md` | Si se rediseña la interfaz: el sistema arranca aquí, con su `punto-de-partida.md` |
| `/crd` | `crd\SKILL.md` | Cada componente del rediseño: su documento de requerimientos |

`/plan` genera sus diagramas en Pencil; en este proyecto los diagramas van con `/diagram-design`.

---

## Reglas de este repo

Derivadas de los documentos de arriba. Si chocan, mandan ellos.

- **Preguntas en bloques de 10**, con la opción recomendada, al final de la respuesta y numeradas (P#). Cada decisión se anota con fecha y quién la tomó; nada se borra: lo superado se tacha o se marca.
- **Lo que una respuesta no deja claro** se aplica con la lectura más razonable, se escribe en la decisión como «Interpretación:» y se pregunta en el siguiente bloque; al confirmarse, «Confirmado en Dnnn» (forma de trabajo §3).
- **Git:** los cambios suben directo a `main`, sin ramas en GitHub (D109, confirmado en D110). `main` se publica solo en Vercel, así que se prueba antes de subir. El commit y el push los hace Francisco con GitHub Desktop, salvo que pida que los haga Claude. Al cerrar, decir qué archivos cambiaron y proponer el mensaje del commit.
- **La app publicada es `calculadora3-d-delta.vercel.app`, con guion.** `calculadora3d-delta` (sin guion) es otro producto. ~~El `README.md` todavía apunta ahí~~ (corregido el 2026-11-03).
- **No capturar datos de prueba en la app publicada** sin permiso. (La sincronización con Notion se quitó en v101, D71.)
- **En git va solo lo de la app y sus documentos.** La documentación vieja en Word, las órdenes de compra, los respaldos y `node_modules/` están en `.gitignore` (D99–D103). Antes de agregar un archivo nuevo a la raíz, ver si es del negocio y no de la app.
- **Las reglas de seguridad de Firestore están en `firestore.rules`** (D108). Se cambian ahí y se publican en Firebase como dice `docs/firebase.md`; un cambio en el repo no las publica solo.
- **Lo que se publica está en `.vercelignore`** como lista de lo que sí sale (D70). Si la app necesita un archivo nuevo en la raíz, hay que agregarlo ahí.
- **Notion sale del proyecto; los datos y las cuentas van en Firebase** (D33 de `docs/reglas-de-negocio.md`, 2026-10-16). Lo que hoy usa Notion se retira; no se construye nada nuevo sobre él.
- **Antes de reportar o subir un cambio a `js/`, `index.html`, `quote.html` o `sw.js`, también de diseño, correr `npm test`** (D113, confirmado en D114). Tarda unos segundos y no toca la nube real:
  - `tests/costing.test.js`: la fórmula de costeo, con cotizaciones reales.
  - `tests/sincronizacion.test.js` y `tests/entrar-con-cuenta.test.js`: que no se pierdan registros, con un Firestore de mentira (`tests/nube-de-prueba.js`).
  - `tests/conexiones.test.js`: que existan las funciones y las listas que `js/db.js` usa por su nombre, y que la caché de `sw.js` y `.vercelignore` tengan lo que cargan las páginas.
- La lista de caché de `sw.js` debe coincidir con los `<script>` y `<link>` de `index.html`, y `CACHE_NAME` sube en cada despliegue.
