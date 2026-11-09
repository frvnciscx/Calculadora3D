/* Lo que une las pantallas con la nube, con la caché sin conexión y con lo que se publica.
   Se corren con:  npm test

   Sirven para cambiar el diseño sin romper lo que no se ve: si una falla, el
   cambio rompió algo que en la pantalla no se nota hasta que pasa (la nube no
   redibuja, un guardado no sube, la app no abre sin conexión). Leen el código;
   no abren la app. */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const leer = (archivo) => fs.readFileSync(path.join(RAIZ, archivo), 'utf8');

const DB = leer('js/db.js');
const PANTALLAS = fs.readdirSync(path.join(RAIZ, 'js'))
  .filter((f) => f.endsWith('.js') && f !== 'db.js')
  .map((f) => leer('js/' + f))
  .join('\n');

const declarada = (codigo, nombre) => new RegExp(`^(async\\s+)?function\\s+${nombre}\\s*\\(`, 'm').test(codigo);

test('Existen las funciones que la nube llama para redibujar las pantallas', () => {
  const nombres = new Set([...DB.matchAll(/render:\s*\[([^\]]*)\]/g)]
    .flatMap((m) => [...m[1].matchAll(/'(\w+)'/g)].map((x) => x[1])));
  assert.ok(nombres.size >= 10, 'no se encontraron las listas «render:» de _LISTAS y _DOCS en js/db.js');

  /* db.js las busca en window: una «const» o «let» no queda ahí, una «function» sí */
  const faltan = [...nombres].filter((n) => !declarada(PANTALLAS, n));
  assert.deepStrictEqual(faltan, [],
    'js/db.js llama a estas funciones cuando llega algo de la nube, y no están declaradas como ' +
    '«function nombre()» en js/. Si se renombraron, cambiar también el nombre en _LISTAS o _DOCS de js/db.js.');
});

test('Existen las listas que la nube lee y escribe por su nombre', () => {
  const globales = [...DB.matchAll(/case '\w+':\s*(\w+) = v;/g)].map((m) => m[1]);
  assert.ok(globales.length >= 10, 'no se encontró _ponerLocal en js/db.js');

  const faltan = globales.filter((n) => !new RegExp(`^(var|let|const)\\s+${n}\\b`, 'm').test(PANTALLAS));
  assert.deepStrictEqual(faltan, [],
    'js/db.js lee y escribe estas variables por nombre (_leerLocal y _ponerLocal), y ya no existen en js/. ' +
    'Si se renombraron, cambiar también el nombre en js/db.js.');
});

test('Las funciones de guardar y borrar en la nube que usan las pantallas existen en js/db.js', () => {
  const usadas = new Set([...PANTALLAS.matchAll(/\b(db[A-Z]\w*)\s*\(/g)].map((m) => m[1]));
  assert.ok(usadas.size >= 10, 'no se encontraron llamadas a dbGuardar… o dbBorrar…');

  /* Las pantallas preguntan «typeof … === 'function'» antes de llamarlas: si no existen, no truena, solo no sube */
  const faltan = [...usadas].filter((n) => !declarada(DB, n));
  assert.deepStrictEqual(faltan, [],
    'las pantallas llaman a estas funciones y js/db.js ya no las tiene: lo que guardan no llegaría a la nube.');
});

const ASSETS = [...leer('sw.js').match(/const ASSETS = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)]
  .map((m) => m[1].replace(/^\.\//, ''));
const LOCALES = ASSETS.filter((a) => !/^https?:/.test(a));

test('Lo que cargan index.html y quote.html está en la caché de sw.js, con el mismo nombre', () => {
  const enCache = new Set(ASSETS);
  const faltan = ['index.html', 'quote.html'].flatMap((pagina) =>
    [...leer(pagina).matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)="([^"]+)"/g)]
      .map((m) => m[1])
      /* Las fuentes de Google no se guardan: sin conexión, la app usa las del sistema */
      .filter((ruta) => !/^https?:/.test(ruta) || ruta.startsWith('https://www.gstatic.com/'))
      .filter((ruta) => !enCache.has(ruta))
      .map((ruta) => `${pagina}: ${ruta}`));
  assert.deepStrictEqual(faltan, [],
    'agregarlos a ASSETS en sw.js con el mismo nombre (sin ?v=): sin conexión, lo que no está en la caché no carga.');
});

test('Todo lo de la caché de sw.js existe', () => {
  const faltan = LOCALES.filter((a) => !fs.existsSync(path.join(RAIZ, a)));
  assert.deepStrictEqual(faltan, [],
    'sw.js pide archivos que no existen: si uno falta, no se guarda ninguno y la app no abre sin conexión.');
});

test('Todo lo de la caché de sw.js se publica en Vercel', () => {
  const publicados = new Set([...leer('.vercelignore').matchAll(/^!(\S+)/gm)].map((m) => m[1].replace(/\/$/, '')));
  const faltan = LOCALES.filter((a) => !publicados.has(a.split('/')[0]));
  assert.deepStrictEqual(faltan, [],
    '.vercelignore es la lista de lo que sí se publica (D70): agregar la carpeta o el archivo con «!».');
});
