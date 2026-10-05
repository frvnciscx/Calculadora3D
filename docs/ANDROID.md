# Framework para Android — decisión y preparación

Qué tecnología usar para llevar la app a Android Studio, por qué, y qué hay que preparar
antes de empezar.

---

## La decisión: Capacitor

**Recomiendo Capacitor**, que envuelve la app web actual en un proyecto nativo de Android
Studio sin reescribirla.

El razonamiento en una frase: tienes **10 748 líneas que ya funcionan** y que contienen
conocimiento de negocio que no está escrito en ningún otro lado — la fórmula de costeo,
el manejo de purga del AMS, el post-proceso de resina. Tirarlas para volver a escribirlas
en un lenguaje que no conoces es cambiar un activo por un riesgo.

### Comparación honesta

| | Capacitor | Kotlin + Compose | PWABuilder (TWA) |
|---|---|---|---|
| Reescribir la app | No | Sí, completa | No |
| Se abre en Android Studio | Sí | Sí | Sí |
| Lenguaje | El que ya usas | Kotlin, nuevo | El que ya usas |
| Acceso nativo (archivos, cámara, biometría) | Sí, por plugins | Total | Muy limitado |
| Publicable en Play Store | Sí | Sí | Sí |
| Rendimiento | Bueno | El mejor | Bueno |
| Tiempo hasta la primera versión | Días | Meses | Horas |
| Qué aprendes | Web + algo de nativo | Android nativo | Casi nada |

**Por qué no Kotlin ahora.** No es que sea malo — es excelente, y Compose es más cercano a
cómo piensa un diseñador que casi cualquier otro framework. El problema es la
simultaneidad: lenguaje nuevo, paradigma nuevo, entorno nuevo y reescritura completa, todo
a la vez. Dijiste que la lógica de programación te cuesta; esa combinación es donde la
gente abandona.

**Por qué no TWA.** Es lo que tu README ya menciona como plan. Funciona, pero no es una
app: es tu sitio dentro de una ventana sin barra de direcciones. No tienes acceso a
archivos, ni compartir nativo, ni biometría. Si vas a pasar por Android Studio, Capacitor
te da lo mismo con mucho más.

### Cuándo cambiaría de opinión

Dos escenarios concretos, para que no sea una decisión de fe:

1. **Si la app se siente lenta en un teléfono de gama baja.** Capacitor corre en un
   WebView. Tu app es texto, formularios y listas — eso va bien. Si algún día agregas
   visor 3D de los modelos, ahí Kotlin gana claramente.
2. **Si lo que quieres es aprender desarrollo Android, no tener la app.** Son objetivos
   distintos y ambos válidos. Si el objetivo es aprender Android, empieza por Kotlin y
   deja esta app como está.

---

## Qué significa en la práctica

Capacitor crea una carpeta `android/` que **es** un proyecto de Android Studio. Lo abres
ahí, compilas, firmas y publicas como cualquier app nativa.

```
calculadora-3d/
├── index.html          ← tu app, sin cambios
├── js/  css/  assets/
├── capacitor.config.json
└── android/            ← proyecto de Android Studio
    ├── app/
    │   ├── build.gradle
    │   ├── google-services.json      ← Firebase va aquí
    │   └── src/main/
    │       ├── AndroidManifest.xml   ← permisos, nombre, icono
    │       └── java/.../MainActivity.java
    └── gradle/
```

El ciclo de trabajo diario:

```bash
# 1. Editas tu HTML/CSS/JS como hasta hoy
# 2. Copias los cambios al proyecto Android
npx cap sync android
# 3. Abres Android Studio
npx cap open android
```

Mientras diseñas y programas sigues usando el navegador, que es más rápido para iterar.
Android Studio aparece solo cuando toca probar en el teléfono o publicar.

### Los plugins que vas a necesitar

| Plugin | Para qué |
|---|---|
| `@capacitor-firebase/authentication` | Iniciar sesión — ver abajo |
| `@capacitor/filesystem` | Guardar el PDF de la cotización en el teléfono |
| `@capacitor/share` | Compartir a WhatsApp con el diálogo nativo |
| `@capacitor/preferences` | Reemplazo de `localStorage` que Android no borra |
| `@capacitor/haptics` | Vibración — hoy usas la API web, que es irregular |

Ese cuarto punto importa más de lo que parece: **Android puede limpiar el `localStorage`
de un WebView** cuando necesita espacio. Para datos de negocio hay que migrar a
`Preferences` o a una base local de verdad.

---

## Firebase Auth

Dijiste que la base de datos es para autenticación. Un detalle técnico que conviene saber
antes de escribir código:

**El SDK de JavaScript de Firebase no sirve bien dentro de un WebView** para iniciar
sesión con Google. El flujo abre una ventana emergente que en una app embebida se
comporta mal o directamente es bloqueado por Google por motivos de seguridad.

La solución es el plugin nativo, que delega el inicio de sesión al sistema operativo:

```js
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

async function entrarConGoogle() {
  const resultado = await FirebaseAuthentication.signInWithGoogle();
  return resultado.user;   // uid, email, displayName, photoUrl
}

async function entrarConCorreo(email, password) {
  const resultado = await FirebaseAuthentication.signInWithEmailAndPassword({
    email, password
  });
  return resultado.user;
}
```

El mismo plugin funciona en el navegador durante el desarrollo, así que no tienes que
compilar para Android cada vez que pruebas el inicio de sesión.

### Lo que hay que configurar en Firebase

1. Crear el proyecto en la consola de Firebase
2. Agregar una app Android con el **nombre de paquete** (por ejemplo
   `mx.lacasitadelmolde.calculadora`) — elígelo bien, **no se puede cambiar** después de
   publicar en Play Store
3. Registrar la **huella SHA-1** de tu llave de firma, que Android Studio genera
4. Descargar `google-services.json` y ponerlo en `android/app/`
5. Activar los métodos de acceso: correo y contraseña, y Google

**El archivo `google-services.json` no es secreto** —va dentro de la app, cualquiera puede
extraerlo— pero sí identifica tu proyecto. Lo que protege tus datos son las reglas de
seguridad, no ese archivo.

---

## Qué preparar antes de tocar Android Studio

En orden. Los dos primeros ya están hechos en esta sesión.

### ✅ 1. Separar la lógica de negocio del DOM — hecho

[`js/costing.js`](../js/costing.js) contiene la fórmula de costeo pura: recibe números,
devuelve números, no toca la pantalla.

Esto importa por una razón específica para Android: **si algún día migras pantallas a
Kotlin, ese archivo es lo único que hay que traducir**, y se traduce línea por línea.
Además es lo que permite probarlo.

### ✅ 2. Pruebas de la fórmula — hecho

[`tests/costing.test.js`](../tests/costing.test.js), 14 casos con cortes reales. Se corren
con `npm test`.

Cuando traduzcas la fórmula a Kotlin, **estos mismos casos se vuelven las pruebas de la
versión Kotlin**. Si ambas dan $60 para el marco y $130 para el topper, la traducción es
correcta. Es la red de seguridad de la migración.

### ✅ 3. La interfaz de autenticación — hecha

[`js/auth.js`](../js/auth.js) ya expone las funciones con **la misma firma que Firebase**:

```js
signInWithEmailAndPassword({ email, password })   // → Promise<{user}>
signInWithGoogle()                                 // → Promise<{user}>
signOut()                                          // → Promise<void>
onAuthStateChanged(callback)                       // → función para cancelar
getCurrentUser()                                   // → {uid, email, displayName, photoUrl}
```

Hoy están implementadas contra `localStorage` con un retraso artificial de 700 ms, para
que la pantalla de acceso se diseñe contra el comportamiento real de una red lenta.

Cuando conectes Firebase, el cambio es este y nada más:

```js
// ANTES — js/auth.js
function signInWithEmailAndPassword(datos) {
  ... guarda en localStorage ...
}

// DESPUÉS
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
function signInWithEmailAndPassword(datos) {
  return FirebaseAuthentication.signInWithEmailAndPassword(datos);
}
```

La pantalla de acceso, el manejo de errores, el onboarding y el botón de cerrar sesión
siguen funcionando sin tocarse, porque llaman a los mismos nombres y reciben los mismos
datos. Eso se llama **programar contra una interfaz**, y es la misma idea que un sistema
de diseño: defines el componente una vez y puedes cambiar lo de adentro sin rediseñar
cada pantalla.

Los códigos de error también son los de Firebase (`auth/invalid-email`,
`auth/weak-password`), así que los mensajes que diseñes ahora seguirán siendo los
correctos después.

### 4. Una capa de almacenamiento — pendiente

Hoy todo el código llama a `ld()` y `sv()` directamente contra `localStorage`. En Android
eso debe cambiar a `Preferences`, y con cuentas de usuario a Firestore.

Si todas las llamadas pasan por una sola función, el cambio es un archivo. Si están
regadas por quince módulos, es una semana de trabajo con riesgo de olvidar alguna.

La buena noticia: **ya están centralizadas** en `store.js`. Solo falta que esas funciones
puedan ser asíncronas, porque leer de la nube toma tiempo y leer de `localStorage` no.
Ese es el cambio conceptual más grande de toda la migración.

### 5. Identificadores en vez de índices — pendiente

Los botones pasan la posición en el arreglo: `deleteQuote(3)`. Con datos que llegan de la
red y pueden reordenarse, **el botón borra el registro equivocado**.

Hay que pasar `deleteQuote('abc123')`. Es tedioso y mecánico, y es el punto donde más vas
a aprender cómo se conecta la app, porque te obliga a recorrerla entera.

### 6. Módulos en vez de variables globales — pendiente

Hoy las 200 funciones viven en el espacio global. Funciona porque `index.html` carga los
archivos en el orden correcto. Con `import` / `export`:

- VS Code autocompleta de verdad y te avisa si te equivocas en un nombre
- Puedes mover código sin romper el orden de carga
- Es requisito para empaquetar la app

Es el cambio más grande de los cinco y el que menos urge. Déjalo para cuando los otros
cuatro estén listos.

---

## Secuencia sugerida

| Fase | Qué | Resultado |
|---|---|---|
| 0 | ✅ Lógica separada, probada, e interfaz de auth lista | Hecho |
| 1 | Capa de almacenamiento asíncrona | La app funciona igual, lista para la nube |
| 2 | Identificadores en vez de índices | Sin bugs latentes de orden |
| 3 | Capacitor + compilar en Android Studio | Un APK en tu teléfono |
| 4 | Conectar Firebase Auth de verdad | Cambiar el cuerpo de `auth.js` |
| 5 | Datos en la nube | Multi-dispositivo real |
| 6 | Plugins nativos | Compartir, archivos, biometría |
| 7 | Publicar en Play Store | — |

La fase 4 es pequeña precisamente porque la pantalla de acceso y el onboarding ya existen
y ya funcionan. Lo que falta ahí no es diseño ni flujo: es conectar el servicio.

**La fase 3 vale la pena hacerla temprano**, aunque sea antes de la 1 y la 2. Ver tu
propia app como icono en el teléfono cambia cómo la piensas, y es una tarde de trabajo.

---

## Una nota sobre aprender con esto

La tentación con Capacitor es tratarlo como una caja negra: corres dos comandos y sale un
APK. Funciona, pero no aprendes nada.

Tres cosas que vale la pena entender aunque no las escribas tú:

**`AndroidManifest.xml`** — declara qué permisos pide tu app y cómo aparece en el sistema.
Es el equivalente a `manifest.json` de tu PWA y se lee igual de fácil.

**`build.gradle`** — define dependencias y versiones. Cuando un plugin no compile, el
error está aquí el 80 % de las veces.

**Firma de la app** — Android exige que firmes digitalmente el APK. Si pierdes esa llave,
**no puedes volver a actualizar tu app en Play Store nunca**. Respáldala el día que la
generes, en dos lugares.

Ese último punto no es una curiosidad técnica. Es el error irreversible más común en
desarrollo Android.
