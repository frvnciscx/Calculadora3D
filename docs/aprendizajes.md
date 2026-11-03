# Lo aprendido en este proyecto

Para el asistente: lo que funcionó y los errores que no hay que repetir al trabajar el cotizador con Francisco. Cada aprendizaje va como qué pasó → por qué → qué hacer, igual que en `<ASISTENTE>\docs\asistente\`. La última columna dice si ya está en el Asistente o si conviene llevarlo allá ([`para-el-asistente/`](para-el-asistente/README.md)).

**Actualizado:** 2026-11-03

**Fuentes:** las sesiones del 2026-10-16 al 2026-11-03 y los documentos de este repo: [`reglas-de-negocio.md`](reglas-de-negocio.md), [`flujos.md`](flujos.md), [`competencia.md`](competencia.md) y el [`CHANGELOG.md`](../CHANGELOG.md) de v101.

---

## 1. Forma de trabajo

| # | Qué pasó | Por qué | Qué hacer | En el Asistente |
|---|---|---|---|---|
| T1 | Francisco responde por número, con «todo lo recomendado» o con otra numeración (2026-10-16: «5.» y «6.» para las preguntas 1 y 2; «66.» para P55) | Numera en orden, sin seguir los números de las preguntas | Tomarlas en orden y decirlo en la decisión y en el cierre | Ya está (forma de trabajo §3) |
| T2 | Una respuesta cambia una regla ya decidida: en P83 contestó «Para crear las cotizaciones se debe iniciar sesión», que precisa D39 y D40 (2026-10-19) | Las opciones de la pregunta no cubrían lo que él quería | Registrar la decisión con «Interpretación:», anotar en las decisiones que precisa que cambiaron y preguntar la interpretación en el siguiente bloque (D84 → P84) | Ya está (forma de trabajo §3) |
| T3 | Las preguntas viven en tres documentos (`reglas-de-negocio.md`, `flujos.md` y `competencia.md`) | Cada tema tiene su documento | Un solo registro de decisiones: el §2 de `reglas-de-negocio.md`, con numeración continua (D1–D84). Así no se repiten IDs | Nuevo, solo de este proyecto |
| T4 | Un script de Python escrito con `python - <<'PY'` en Bash falló con `unicodeescape` (2026-10-19) | En el texto había rutas `C:\Users\...`: `\U` es un escape de Python | Escribir el script con la herramienta de archivos y correrlo por ruta, o editar con Edit. Lo mismo para scripts con acentos: el heredoc los cambia | Conviene llevarlo (`herramientas.md` §10) |
| T5 | En la pregunta P14 se dijo que «hoy el ingreso cuenta en el mes en que se acepta», y era falso: el panel usa la fecha de la cotización (2026-10-16) | Se repitió lo que decía el `CHANGELOG.md` sin leer el código | Antes de escribir «hoy funciona así», leer el código. Se corrigió en público y quedó tachado | Ya está (forma de trabajo §6) |
| T6 | Francisco no tenía acceso a Vercel para borrar una variable (2026-10-16) | La cuenta del proyecto no está a su alcance en ese momento | Buscar el camino que sí controla: el arreglo llega al juntar a `main` en GitHub, porque Vercel publica solo desde ahí | Nuevo, solo de este proyecto |
| T7 | Francisco pensó que había creado otra rama por error al hacer el commit en GitHub Desktop (2026-11-03). En su equipo y en GitHub solo estaban `main` y `claude/project-review-e78fd0` | La app de Claude abre cada sesión en un worktree con su propia rama, y el botón «Publish branch» la sube a GitHub como rama nueva | Al cerrar una sesión con cambios, decir en qué rama quedaron y que llegan a `main` con un Pull Request. Antes de explicar, revisar las ramas con `git branch -a` y `git fetch --prune` | Conviene llevarlo (`herramientas.md` §8.5) |
| T8 | Las reglas anunciaban `docs/base-de-datos.md`, y ya existía `docs/BASE-DE-DATOS.md` (2026-11-03) | Windows no distingue mayúsculas de minúsculas: los dos nombres son el mismo archivo, y crear el nuevo habría reemplazado el anterior | Antes de crear un archivo, buscar si ya existe con otras mayúsculas. El documento nuevo se llamó `modelo-de-datos.md` y el anterior se quedó con una nota | Conviene llevarlo (`herramientas.md` §10) |

## 2. Publicación y seguridad

| # | Qué pasó | Por qué | Qué hacer | En el Asistente |
|---|---|---|---|---|
| W1 | Cualquiera podía abrir `/docs/AUDITORIA.md`, `/MEJORAS.md` y `/CHANGELOG.md` en la dirección de la app (comprobado el 2026-10-16) | Un sitio estático en Vercel sin paso de compilación publica todo el repo | Un `.vercelignore` como lista de lo que sí se publica: `/*` y después `!index.html`, `!js`, etc. Después de publicar, comprobar con `curl` que esas direcciones respondan 404 | Conviene llevarlo (`herramientas.md` §11.4) |
| W2 | El plan gratuito de Vercel (Hobby) es solo para uso personal no comercial (sus reglas de uso justo, 2026-10-16) | Vercel cuenta como comercial cualquier proyecto que deje ganancia a quien participa en él | Para un producto: Vercel Pro o Firebase Hosting (D55). Revisar también los otros proyectos que publican en Vercel | Conviene llevarlo (`herramientas.md` §11.4) |
| W3 | La app bajaba al abrir una copia de los datos desde `/api/sync/pull`, y `/api/sync/push` dejaba subir otra sin contraseña (2026-10-16) | La sincronización por copia completa no tenía autenticación | Se quitó en v101 (D71). Una función de servidor que lee o escribe datos de usuarios necesita autenticación antes de publicarse | Nuevo, solo de este proyecto |
| W4 | Revisar si `/api/sync/pull` devolvía datos fue bloqueado por la sesión (2026-10-16) | El clasificador del modo automático lo tomó como manejo de datos personales | Comprobar solo el código de estado (`curl -o /dev/null -w '%{http_code}'`), o pedirle a Francisco que revise las variables en el panel. No buscar otra forma de leer los datos | Nuevo |
| W5 | Requisitos de las tiendas: borrar la cuenta desde la app y desde una página web, 12 personas durante 14 días en la prueba cerrada de una cuenta personal nueva de Google Play, y la opción de Apple si se ofrece Google | Reglas de Apple y Google al 2026-10-16 | Están con sus fuentes en `reglas-de-negocio.md` §4.10 y §4.11. Revisarlos antes de publicar, porque cambian | Conviene llevarlo si otro producto va a las tiendas |
| W6 | Con Firebase Auth en la web, entrar con Google por redirección deja de funcionar en navegadores que bloquean el almacenamiento de terceros | La app y el inicio de sesión quedan en dominios distintos | Ventana emergente, o la web en Firebase Hosting con su propio dominio (D55) | Conviene llevarlo si otro producto usa Firebase |

## 3. Diagramas con `/diagram-design`

| # | Qué pasó | Por qué | Qué hacer | En el Asistente |
|---|---|---|---|---|
| G1 | «Regresar un paso» vale para todos los estados de la cotización | Dibujarlo como flecha desde cada estado rebasa el límite de transiciones | Una nota en mono («DESDE CUALQUIER ESTADO…»), como pide el tipo de diagrama de estados | Ya está (en el skill) |
| G2 | Etiquetas como «CUBRE ANTICIPO» no caben entre dos cajas separadas 48 px | La etiqueta va centrada en su tramo y con su máscara | Llevar la flecha por arriba, en codo, y poner la etiqueta en el tramo largo; o ponerla al lado de un tramo vertical | Nuevo |
| G3 | El panel del navegador mide unos 675 px y el diagrama, con ancho mínimo de 960, se ve cortado | El diagrama tiene su propio desplazamiento horizontal, como pide el skill | Para revisarlo, `resize_window` a 1280 × 900, captura y regresar a «desktop» | Conviene llevarlo (`herramientas.md` §7) |
| G4 | `self_check.py` del skill se corre desde la carpeta del Asistente | El skill no se copia a este repo | `python <ASISTENTE>\.agents\skills\diagram-design\scripts\self_check.py <archivo>`. Pasa en los seis diagramas, pero no mide si el texto cabe: revisar en el navegador | Ya está (`herramientas.md` §9.6) |
