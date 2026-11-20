/* ===== LECTOR DE ARCHIVOS DEL SLICER (D133) =====
   Lee el resumen que el slicer deja dentro del archivo (tiempo, gramos,
   filamentos, objetos) y llena la calculadora.

   - Todo pasa en el dispositivo: el archivo no se sube a ningún lado y funciona
     sin conexión.
   - Solo lee el principio y el final del archivo, que es donde el slicer pone el
     resumen. Un G-code puede pesar 100 MB; leerlo completo trabaría el teléfono.

   Formatos:
   - .gcode.3mf de Bambu Studio y OrcaSlicer: es un zip; la ficha está en
     Metadata/slice_info.config, con la miniatura de cada placa.
   - .gcode de Bambu Studio, OrcaSlicer, PrusaSlicer, Cura y Simplify3D: el
     resumen va en comentarios («; total estimated time: …»).
   - Resina (.ctb, .goo): no. Chitubox los cifra (D133, P133).

   La primera mitad del archivo no toca la pantalla, así que se prueba en Node
   (tests/gcode.test.js). La segunda mitad conecta el lector con la calculadora. */

/* ══ 1. Leer el archivo ══════════════════════════════════════════ */

var SLICER_CABEZA = 1024 * 1024;   /* bytes que se leen del principio … */
var SLICER_COLA   = 512 * 1024;    /* … y del final del archivo */

function _errorSlicer(codigo) {
  var e = new Error(codigo);
  e.codigo = codigo;
  return e;
}

/* «1d 9h 7m 15s», «33m 37s», «2h 5m» → segundos */
function _segundosDeTexto(texto) {
  var total = 0, m;
  var re = /(\d+(?:\.\d+)?)\s*(d|h|m|s)\b/gi;
  var factor = { d: 86400, h: 3600, m: 60, s: 1 };
  while ((m = re.exec(String(texto || '')))) total += parseFloat(m[1]) * factor[m[2].toLowerCase()];
  return Math.round(total);
}

/* «87.54,39.44» o «1.24;1.27» → [87.54, 39.44] */
function _numeros(texto) {
  return String(texto || '').split(/[,;]/).map(function(x) { return parseFloat(x); })
    .filter(function(n) { return !isNaN(n); });
}

/* «PLA;PETG» o «"Bambu Lab";"Otro"» → ['PLA', 'PETG'] */
function _textos(texto) {
  return String(texto || '').split(';').map(function(x) { return x.trim().replace(/^"|"$/g, ''); });
}

/* «#545454FF» → «#545454» */
function _colorCorto(c) {
  var m = /^#?([0-9a-f]{6})/i.exec(String(c || '').trim());
  return m ? '#' + m[1].toUpperCase() : '';
}

function _valor(texto, re) {
  var m = re.exec(texto);
  return m ? m[1].trim() : null;
}

function _slicerDe(texto) {
  var conocidos = [
    [/OrcaSlicer/i, 'OrcaSlicer'], [/ElegooSlicer/i, 'ElegooSlicer'], [/BambuStudio|Bambu Studio/i, 'Bambu Studio'],
    [/SuperSlicer/i, 'SuperSlicer'], [/PrusaSlicer/i, 'PrusaSlicer'], [/Creality ?Print/i, 'Creality Print'],
    [/Simplify3D/i, 'Simplify3D'], [/Cura_SteamEngine|^;FLAVOR:/im, 'Cura']
  ];
  for (var i = 0; i < conocidos.length; i++) if (conocidos[i][0].test(texto)) return conocidos[i][1];
  return 'Slicer';
}

/* Resumen de un G-code de texto, con su principio y su final */
function analizarGcodeTexto(cabeza, cola, opts) {
  opts = opts || {};
  var t = String(cabeza || '') + '\n' + String(cola || '');

  /* Tiempo: el total estimado (calentar y calibrar también ocupan la impresora, P129) */
  var tiempoS = 0, v;
  if ((v = _valor(t, /;\s*total estimated time:\s*([^;\n]+)/i)))                  tiempoS = _segundosDeTexto(v);  /* Bambu, Orca */
  else if ((v = _valor(t, /;\s*estimated printing time \(normal mode\)\s*=\s*([^\n]+)/i))) tiempoS = _segundosDeTexto(v);  /* Prusa, Orca */
  else if ((v = _valor(t, /^;TIME:\s*(\d+)/m)))                                    tiempoS = parseInt(v, 10);       /* Cura */
  else {
    var s3d = /;\s*Build time:\s*(\d+)\s*hours?\s*(\d+)\s*minutes?/i.exec(t);     /* Simplify3D */
    if (s3d) tiempoS = parseInt(s3d[1], 10) * 3600 + parseInt(s3d[2], 10) * 60;
  }

  /* Gramos y metros de cada filamento que se usó */
  var gramos = null, metros = null, estimados = false;
  if ((v = _valor(t, /;\s*total filament weight \[g\]\s*:\s*([^\n]+)/i)))  gramos = _numeros(v);   /* Bambu */
  else if ((v = _valor(t, /;\s*filament used \[g\]\s*=\s*([^\n]+)/i)))    gramos = _numeros(v);   /* Prusa, Orca */
  else if ((v = _valor(t, /;\s*Plastic weight:\s*([\d.]+)\s*g/i)))        gramos = [parseFloat(v)]; /* Simplify3D */

  if ((v = _valor(t, /;\s*total filament length \[mm\]\s*:\s*([^\n]+)/i)))   metros = _numeros(v).map(function(mm) { return mm / 1000; });
  else if ((v = _valor(t, /;\s*filament used \[mm\]\s*=\s*([^\n]+)/i)))     metros = _numeros(v).map(function(mm) { return mm / 1000; });
  else if ((v = _valor(t, /^;Filament used:\s*([^\n]+)/mi)))                 metros = _numeros(v.replace(/m/g, ''));   /* Cura, en metros */

  var densidades = _numeros(_valor(t, /;\s*filament_density\s*[:=]\s*([^\n]+)/i));
  var diametros  = _numeros(_valor(t, /;\s*filament_diameter\s*[:=]\s*([^\n]+)/i));

  /* Cura no da gramos: se sacan de los metros con la densidad del material elegido */
  if (!gramos && metros) {
    estimados = true;
    gramos = metros.map(function(m, i) {
      var d = diametros[i] || diametros[0] || 1.75;
      var dens = opts.densidad || densidades[i] || densidades[0] || 1.24;
      return Math.round(m * 1000 * Math.PI * Math.pow(d / 2, 2) * dens / 10) / 100;
    });
  }

  /* Qué filamentos se usaron: Bambu dice «; filament: 1,2,4» (los demás son del AMS sin usar) */
  var usados = _numeros(_valor(t, /^;\s*filament:\s*([\d,\s]+)$/m)).map(function(n) { return n - 1; });
  var tipos   = _textos(_valor(t, /;\s*filament_type\s*=\s*([^\n]+)/i));
  var colores = _textos(_valor(t, /;\s*filament_colour\s*=\s*([^\n]+)/i) || _valor(t, /;\s*extruder_colour\s*=\s*([^\n]+)/i));
  var filamentos = (gramos || []).map(function(g, i) {
    var slot = usados.length === (gramos || []).length ? usados[i] : i;
    return {
      tipo:   tipos[slot] || '',
      color:  _colorCorto(colores[slot]),
      gramos: Math.round(g * 100) / 100,
      metros: metros && metros[i] != null ? Math.round(metros[i] * 100) / 100 : null
    };
  });

  /* Objetos, cuando el slicer los nombra (Klipper/Orca y Prusa con «etiquetar objetos») */
  var objetos = [], m;
  var reObj = /EXCLUDE_OBJECT_DEFINE\s+NAME=(\S+)|^M486\s+S\d+\s+A"([^"]+)"/gim;
  while ((m = reObj.exec(t))) objetos.push(m[1] || m[2]);

  if (!tiempoS && !filamentos.length) throw _errorSlicer('sin-datos');

  var total = filamentos.reduce(function(s, f) { return s + f.gramos; }, 0);
  return {
    slicer: _slicerDe(t),
    avisos: estimados ? ['gramos-estimados'] : [],
    placas: [{
      indice: 1,
      tiempoS: tiempoS,
      gramos: Math.round(total * 100) / 100,
      filamentos: filamentos,
      objetos: objetos,
      impresora: String(_valor(t, /;\s*printer_model\s*=\s*([^\n]+)/i) || '').replace(/^"|"$/g, '').trim(),
      cambios: cambiosDeColor(t),
      miniatura: null
    }]
  };
}

/* Cambios de color: Bambu, Orca y Prusa numeran cada uno («; toolchange #1217»),
   así que el número más alto del final del archivo es el total. */
function cambiosDeColor(texto) {
  var max = null, m, re = /;\s*toolchange #(\d+)/gi;
  while ((m = re.exec(String(texto || '')))) max = Math.max(max || 0, parseInt(m[1], 10));
  return max;
}

/* Modelos de Bambu Lab por su clave en slice_info.config, por si falta el nombre */
var _MODELOS_BAMBU = {
  'N2S': 'Bambu Lab A1', 'N1': 'Bambu Lab A1 mini', 'C11': 'Bambu Lab P1P', 'C12': 'Bambu Lab P1S',
  'BL-P001': 'Bambu Lab X1 Carbon', 'BL-P002': 'Bambu Lab X1', 'C13': 'Bambu Lab X1E', 'O1D': 'Bambu Lab H2D'
};

function _atributos(texto) {
  var at = {}, m, re = /([\w-]+)="([^"]*)"/g;
  while ((m = re.exec(texto))) at[m[1]] = m[2];
  return at;
}

/* La ficha de Bambu Studio y Orca dentro del .gcode.3mf */
function analizarSliceInfo(xml) {
  var placas = [], m, re = /<plate>([\s\S]*?)<\/plate>/g;
  while ((m = re.exec(xml))) {
    var p = m[1], meta = {}, k;
    var reMeta = /<metadata\s+key="([^"]+)"\s+value="([^"]*)"/g;
    while ((k = reMeta.exec(p))) meta[k[1]] = k[2];

    var objetos = [], reObj = /<object\b([^>]*)>/g;
    while ((k = reObj.exec(p))) {
      var o = _atributos(k[1]);
      if (o.skipped !== 'true') objetos.push(o.name || '');
    }
    var filamentos = [], reFil = /<filament\b([^>]*)>/g;
    while ((k = reFil.exec(p))) {
      var f = _atributos(k[1]);
      filamentos.push({
        tipo: f.type || '',
        color: _colorCorto(f.color),
        gramos: parseFloat(f.used_g) || 0,
        metros: f.used_m != null ? parseFloat(f.used_m) || 0 : null
      });
    }
    var suma = filamentos.reduce(function(s, x) { return s + x.gramos; }, 0);
    placas.push({
      indice: parseInt(meta.index, 10) || placas.length + 1,
      tiempoS: Math.round(parseFloat(meta.prediction) || 0),
      gramos: Math.round((parseFloat(meta.weight) || suma) * 100) / 100,
      filamentos: filamentos,
      objetos: objetos,
      impresora: _MODELOS_BAMBU[meta.printer_model_id] || '',
      cambios: null,
      miniatura: null
    });
  }
  /* Orca escribe la misma ficha que Bambu Studio */
  return { slicer: /OrcaSlicer/i.test(xml) ? 'OrcaSlicer' : 'Bambu Studio', placas: placas };
}

/* ── Zip mínimo: lo justo para sacar la ficha y la miniatura del .gcode.3mf ── */
function _u16(b, i) { return b[i] | (b[i + 1] << 8); }
function _u32(b, i) { return (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0; }
function _u64(b, i) { return _u32(b, i) + _u32(b, i + 4) * 4294967296; }
function _bytes(blob) { return blob.arrayBuffer().then(function(ab) { return new Uint8Array(ab); }); }

async function _abrirZip(archivo) {
  var tam = archivo.size;
  var cola = await _bytes(archivo.slice(Math.max(0, tam - 65557)));
  var fin = -1;
  for (var i = cola.length - 22; i >= 0; i--) if (_u32(cola, i) === 0x06054b50) { fin = i; break; }
  if (fin < 0) throw _errorSlicer('formato');
  var dirTam = _u32(cola, fin + 12), dirIni = _u32(cola, fin + 16);
  /* Zip64: los archivos de más de 4 GB guardan los datos en otro registro */
  if (dirIni === 0xFFFFFFFF && fin >= 20 && _u32(cola, fin - 20) === 0x07064b50) {
    var reg = await _bytes(archivo.slice(_u64(cola, fin - 12), _u64(cola, fin - 12) + 56));
    dirTam = _u64(reg, 40);
    dirIni = _u64(reg, 48);
  }
  var dir = await _bytes(archivo.slice(dirIni, dirIni + dirTam));
  var entradas = {}, p = 0, deco = new TextDecoder();
  while (p + 46 <= dir.length && _u32(dir, p) === 0x02014b50) {
    var e = { metodo: _u16(dir, p + 10), comp: _u32(dir, p + 20), off: _u32(dir, p + 42) };
    var nl = _u16(dir, p + 28), el = _u16(dir, p + 30), cl = _u16(dir, p + 32);
    var nombre = deco.decode(dir.subarray(p + 46, p + 46 + nl));
    /* Zip64 dentro de la entrada: tamaños y posición de 8 bytes en el campo extra 0x0001 */
    var x = p + 46 + nl, xFin = x + el;
    while (x + 4 <= xFin) {
      var id = _u16(dir, x), largo = _u16(dir, x + 2), q = x + 4;
      if (id === 0x0001) {
        if (_u32(dir, p + 24) === 0xFFFFFFFF) q += 8;
        if (e.comp === 0xFFFFFFFF) { e.comp = _u64(dir, q); q += 8; }
        if (e.off === 0xFFFFFFFF) e.off = _u64(dir, q);
      }
      x += 4 + largo;
    }
    entradas[nombre] = e;
    p += 46 + nl + el + cl;
  }

  async function datos(nombre) {
    var e = entradas[nombre];
    if (!e) return null;
    var loc = await _bytes(archivo.slice(e.off, e.off + 30));
    if (_u32(loc, 0) !== 0x04034b50) throw _errorSlicer('formato');
    var ini = e.off + 30 + _u16(loc, 26) + _u16(loc, 28);
    return { metodo: e.metodo, blob: archivo.slice(ini, ini + e.comp) };
  }
  function flujo(d) {
    if (d.metodo === 0) return d.blob.stream();
    if (d.metodo !== 8) throw _errorSlicer('formato');
    if (typeof DecompressionStream === 'undefined') throw _errorSlicer('sin-descompresor');
    return d.blob.stream().pipeThrough(new DecompressionStream('deflate-raw'));
  }
  return {
    nombres: Object.keys(entradas),
    leer: async function(nombre) {
      var d = await datos(nombre);
      if (!d) return null;
      if (d.metodo === 0) return _bytes(d.blob);
      return new Uint8Array(await new Response(flujo(d)).arrayBuffer());
    },
    /* Solo el final de una entrada: se descomprime de corrido y se guardan los
       últimos «maximo» bytes, sin tener el archivo completo en memoria */
    leerFinal: async function(nombre, maximo) {
      var d = await datos(nombre);
      if (!d) return null;
      var lector = flujo(d).getReader(), partes = [], total = 0;
      while (true) {
        var r = await lector.read();
        if (r.done) break;
        partes.push(r.value);
        total += r.value.length;
        while (partes.length > 1 && total - partes[0].length >= maximo) total -= partes.shift().length;
      }
      var todo = new Uint8Array(total), pos = 0;
      partes.forEach(function(pt) { todo.set(pt, pos); pos += pt.length; });
      return todo;
    },
    /* Solo el principio de una entrada comprimida, sin descomprimirla toda */
    leerInicio: async function(nombre, maximo) {
      var d = await datos(nombre);
      if (!d) return null;
      var lector = flujo(d).getReader(), partes = [], total = 0;
      while (total < maximo) {
        var r = await lector.read();
        if (r.done) break;
        partes.push(r.value);
        total += r.value.length;
      }
      lector.cancel().catch(function() {});
      var todo = new Uint8Array(total), pos = 0;
      partes.forEach(function(pt) { todo.set(pt, pos); pos += pt.length; });
      return todo;
    }
  };
}

async function _leer3mf(archivo) {
  var zip = await _abrirZip(archivo);
  var deco = new TextDecoder();
  var resultado;
  var ficha = await zip.leer('Metadata/slice_info.config');
  if (ficha) {
    resultado = analizarSliceInfo(deco.decode(ficha));
    resultado.avisos = [];
    resultado.placas = resultado.placas.filter(function(p) { return p.tiempoS > 0 || p.gramos > 0; });
  }
  if (!resultado || !resultado.placas.length) {
    /* Sin ficha: si trae el G-code adentro, se lee su encabezado */
    var gcodes = zip.nombres.filter(function(n) { return /\.gcode$/i.test(n); });
    if (!gcodes.length) throw _errorSlicer('sin-laminar');
    var inicio = await zip.leerInicio(gcodes[0], SLICER_CABEZA);
    resultado = analizarGcodeTexto(deco.decode(inicio), '');
  }
  /* El nombre de la impresora viene en la configuración del proyecto */
  try {
    var config = await zip.leer('Metadata/project_settings.config');
    var modelo = config && JSON.parse(deco.decode(config)).printer_model;
    if (modelo) resultado.placas.forEach(function(p) { p.impresora = String(modelo); });
  } catch (e) { /* sin configuración: se queda la clave del modelo, si la había */ }

  for (var i = 0; i < resultado.placas.length; i++) {
    var placa = resultado.placas[i];
    var png = await zip.leer('Metadata/plate_' + placa.indice + '.png');
    placa.miniatura = png && png.length ? png : null;
    /* Multicolor: los cambios de color están al final del G-code de la placa */
    if (placa.filamentos.length > 1 && placa.cambios == null) {
      try {
        var fin = await zip.leerFinal('Metadata/plate_' + placa.indice + '.gcode', SLICER_COLA);
        if (fin) placa.cambios = cambiosDeColor(deco.decode(fin));
      } catch (e) { /* sin G-code: los cambios se quedan como estaban */ }
    }
  }
  return resultado;
}

async function _leerGcode(archivo, opts) {
  var tam = archivo.size;
  var cabeza = await archivo.slice(0, Math.min(tam, SLICER_CABEZA)).text();
  var cola = tam > SLICER_CABEZA ? await archivo.slice(Math.max(SLICER_CABEZA, tam - SLICER_COLA)).text() : '';
  return analizarGcodeTexto(cabeza, cola, opts);
}

/* Punto de entrada: un File (o Blob con name) → { slicer, placas, avisos } */
/* Los que lee la app: G-code en texto (.gcode, y sus variantes .gco, .g y
   .nc) y .3mf (el .gcode.3mf de Bambu y Orca termina en .3mf). D162. */
function esArchivoSlicer(nombre) {
  return /\.(gcode|gco|g|nc|3mf)$/i.test(String(nombre || '').trim());
}
/* Lo que se le pone al selector de la computadora para que solo muestre esos */
var ACEPTA_SLICER = '.gcode,.gco,.3mf';

async function leerArchivoSlicer(archivo, opts) {
  var nombre = String(archivo && archivo.name || '').toLowerCase();
  if (/\.(ctb|goo|cbddlp|photon|photons|pwmx|pwma|pws|pw0|prz|jxs|zip)$/.test(nombre)) throw _errorSlicer('resina');
  if (/\.bgcode$/.test(nombre)) throw _errorSlicer('bgcode');
  if (/\.3mf$/.test(nombre)) return _leer3mf(archivo);
  if (/\.(gcode|gco|g|nc)$/.test(nombre)) return _leerGcode(archivo, opts);
  throw _errorSlicer('formato');
}

/* Piezas (P130): solo si la placa trae copias del mismo objeto. Objetos
   distintos (cabeza + cuerpo) pueden ser un solo producto, y no se tocan. */
function piezasDeObjetos(objetos) {
  if (!objetos || objetos.length < 2) return null;
  var limpio = function(n) { return String(n || '').toLowerCase().replace(/\.(stl|3mf|obj|step|stp)$/, '').trim(); };
  var primero = limpio(objetos[0]);
  return objetos.every(function(o) { return limpio(o) === primero; }) ? objetos.length : null;
}

/* «Bambu Lab X1 Carbon» → «x1c»; «Bambu Lab A1 + AMS» → «a1 + ams» */
function _normalizarModelo(nombre) {
  return String(nombre || '').toLowerCase()
    .replace(/bambu ?lab|creality|prusa(?:3d)?|elegoo|anycubic|sovol|qidi|flashforge/g, ' ')
    .replace(/x1 ?carbon/g, 'x1c').replace(/\s+/g, ' ').trim();
}

/* Qué impresora de la lista corresponde al archivo (D135). Devuelve una de
   «impresoras» o null para dejar la que está elegida. */
function impresoraDelArchivo(impresoras, modelo, multicolor, actualId) {
  var fdm = (impresoras || []).filter(function(p) { return p && p.type !== 'Resina'; });
  var conAms = function(p) { return p.multicolor === true || /\bams\b/i.test(p.name || ''); };
  var corto = _normalizarModelo(modelo);
  var reModelo = corto
    ? new RegExp('(^|[^a-z0-9])' + corto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z0-9])' + (/mini$/.test(corto) ? '' : '(?!\\s*mini)'))
    : null;
  var porModelo = reModelo ? fdm.filter(function(p) { return reModelo.test(_normalizarModelo(p.name)); }) : [];
  var actual = fdm.find(function(p) { return p.id === actualId; }) || null;

  if (multicolor) {
    /* Hace falta AMS: primero una del modelo del archivo, luego la elegida si
       ya tiene AMS, y si no, la única con AMS que haya */
    var amsDelModelo = porModelo.filter(conAms);
    if (amsDelModelo.length) return amsDelModelo.indexOf(actual) !== -1 ? actual : amsDelModelo[0];
    if (actual && conAms(actual)) return actual;
    var todasAms = fdm.filter(conAms);
    return todasAms.length === 1 ? todasAms[0] : null;
  }
  /* Un color: la elegida se queda si es del modelo, aunque tenga AMS */
  if (actual && porModelo.indexOf(actual) !== -1) return actual;
  if (porModelo.length) return porModelo.filter(function(p) { return !conAms(p); })[0] || porModelo[0];
  return null;
}

/* «SGAEYL PUNTA DAGA 4 COLORES_makerlab.gcode.3mf» → «SGAEYL PUNTA DAGA 4 COLORES_makerlab» */
function descripcionDeArchivo(nombre) {
  var d = String(nombre || '').replace(/\.(gcode\.3mf|3mf|gcode|gco|g)$/i, '').replace(/_plate_\d+$/i, '').trim();
  return /^(sin t[ií]tulo|untitled|plate_?\d*)$/i.test(d) ? '' : d;
}

function formatoDuracion(segundos) {
  var min = Math.round((segundos || 0) / 60);
  if (min < 60) return min + ' min';
  var h = Math.floor(min / 60), resto = min % 60;
  return h + ' h' + (resto ? ' ' + resto + ' min' : '');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    leerArchivoSlicer: leerArchivoSlicer, analizarGcodeTexto: analizarGcodeTexto,
    analizarSliceInfo: analizarSliceInfo, piezasDeObjetos: piezasDeObjetos,
    cambiosDeColor: cambiosDeColor, impresoraDelArchivo: impresoraDelArchivo,
    descripcionDeArchivo: descripcionDeArchivo, formatoDuracion: formatoDuracion,
    esArchivoSlicer: esArchivoSlicer, ACEPTA_SLICER: ACEPTA_SLICER,
    _segundosDeTexto: _segundosDeTexto
  };
}

/* ══ 2. Llenar la calculadora ════════════════════════════════════ */

var _slicerLeido = null;    /* lo que trajo el último archivo */
var _slicerAntes = null;    /* cómo estaban los campos, para «Deshacer» */
var _slicerMiniatura = null;

var _MENSAJES_SLICER = {
  'resina': 'Los archivos de resina (.ctb, .goo) vienen cifrados y no se pueden leer. Captura el tiempo y los gramos a mano.',
  'bgcode': 'Es un G-code binario de Prusa (.bgcode). En PrusaSlicer, exporta el G-code en texto y vuelve a intentarlo.',
  'sin-laminar': 'Este .3mf es un proyecto sin laminar: no trae tiempo ni gramos. En Bambu Studio lamínalo y usa «Exportar archivo de placa laminada».',
  'sin-datos': 'No encontré el tiempo ni los gramos en este archivo. Captúralos a mano.',
  'sin-descompresor': 'Este navegador no puede abrir el .3mf. Exporta el G-code (.gcode) desde el slicer y vuelve a intentarlo.',
  'formato': 'Ese archivo no es del slicer: elige un .gcode o un .3mf.'
};

function _escSlicer(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function onArchivoSlicer(input) {
  var archivo = input.files && input.files[0];
  input.value = '';
  if (archivo) procesarArchivoSlicer(archivo);
}

function _campo(id) { return document.getElementById(id); }

function _poner(id, valor, evento) {
  var el = _campo(id);
  if (!el) return;
  el.value = valor;
  el.dispatchEvent(new Event(evento || 'input', { bubbles: true }));
}

function _capturarCampos() {
  var g = function(id) { var el = _campo(id); return el ? el.value : null; };
  return {
    peso: g('calc-weight'), tiempo: g('calc-time'), piezas: g('calc-pieces'), desc: g('calc-desc'),
    impresora: g('calc-printer'), material: g('calc-material'),
    purga: g('ams-purge-grams'), cambios: g('ams-color-changes'),
    ams: Array.prototype.map.call(document.querySelectorAll('#ams-color-slots .ams-weight-inp'), function(i) { return i.value; })
  };
}

async function procesarArchivoSlicer(archivo) {
  /* Otro tipo de archivo no se intenta leer (D162). Los de resina y el
     .bgcode sí pasan: leerArchivoSlicer explica por qué no se pueden. */
  if (!esArchivoSlicer(archivo.name) && !/\.(bgcode|ctb|goo|cbddlp|photon|photons|pwmx|pwma|pws|pw0|prz|jxs)$/i.test(archivo.name)) {
    _pintarResumenSlicer({ error: _MENSAJES_SLICER.formato, nombre: archivo.name });
    return;
  }
  /* Si se estaba cotizando un producto por tamaño, el archivo es de una pieza */
  if (typeof enModoProducto === 'function' && enModoProducto()) elegirQueCotizas('pieza');
  _pintarResumenSlicer({ cargando: true, nombre: archivo.name });
  try {
    var matEl = _campo('calc-material');
    var mat = matEl && typeof materials !== 'undefined' && materials.find(function(m) { return m.id === matEl.value; });
    var r = await leerArchivoSlicer(archivo, { densidad: mat && mat.density });
    r.nombre = archivo.name;
    _slicerLeido = r;
    _slicerAntes = _capturarCampos();
    aplicarPlacaSlicer(0);
  } catch (e) {
    console.warn('[Slicer] No se pudo leer:', e);
    /* Lo que llenó una lectura anterior se queda; este error solo se cierra */
    _slicerLeido = null;
    _slicerAntes = null;
    _pintarResumenSlicer({ error: _MENSAJES_SLICER[e && e.codigo] || 'No se pudo leer el archivo.', nombre: archivo.name });
  }
}

function aplicarPlacaSlicer(i) {
  var r = _slicerLeido;
  if (!r || !r.placas[i]) return;
  var p = r.placas[i];
  var avisos = [];

  _poner('calc-weight', String(Math.round(p.gramos * 100) / 100));
  _poner('calc-time', String(Math.round(p.tiempoS / 36) / 100));

  var piezas = piezasDeObjetos(p.objetos);
  if (piezas) _poner('calc-pieces', String(piezas));
  else if (p.objetos.length > 1) avisos.push('La placa trae ' + p.objetos.length + ' objetos distintos: revisa «Piezas».');

  var desc = _campo('calc-desc');
  if (desc && !desc.value.trim()) {
    var d = descripcionDeArchivo(r.nombre);
    if (d) _poner('calc-desc', d);
  }

  /* Impresora (D135): la del archivo; con varios colores, una con AMS. Va antes
     del material porque al cambiar de impresora se vuelve a armar la lista de
     materiales y aparece (o se esconde) el bloque del AMS. */
  var multicolor = p.filamentos.length > 1;
  var psEl = _campo('calc-printer');
  if (psEl && typeof printers !== 'undefined') {
    var imp = impresoraDelArchivo(printers, p.impresora, multicolor, psEl.value);
    if (imp && imp.id !== psEl.value) _poner('calc-printer', imp.id, 'change');
    else if (!imp && p.impresora) avisos.push('El archivo es para ' + p.impresora + ' y no está en tus impresoras: revisa cuál usar.');
  }

  /* Material (P132): solo si hay un único material de ese tipo en la lista */
  var tipos = p.filamentos.map(function(f) { return f.tipo.toUpperCase(); }).filter(Boolean);
  var matEl = _campo('calc-material');
  if (matEl && typeof materials !== 'undefined' && tipos.length &&
      tipos.every(function(t) { return t === tipos[0]; })) {
    var tipo = tipos[0];
    var reTipo = new RegExp('^' + tipo.replace(/[^\w]/g, '') + '\\b', 'i');
    var enLista = Array.prototype.map.call(matEl.options, function(op) {
      return materials.find(function(m) { return m.id === op.value; });
    }).filter(Boolean);
    var exactos   = enLista.filter(function(m) { return String(m.name).trim().toUpperCase() === tipo; });
    var parecidos = enLista.filter(function(m) { return reTipo.test(String(m.name).trim()); });
    var actual = materials.find(function(m) { return m.id === matEl.value; });
    if (!actual || !reTipo.test(String(actual.name).trim())) {
      var elegido = exactos.length === 1 ? exactos[0] : (parecidos.length === 1 ? parecidos[0] : null);
      if (elegido) _poner('calc-material', elegido.id, 'change');
      else avisos.push('El archivo es de ' + tipo + ': elige el material.');
    }
  }

  /* Multicolor (P131): gramos por color, y la purga en 0 porque el peso del
     archivo ya la incluye. Si no, se cobraría dos veces. */
  if (multicolor) {
    var bloque = _campo('calc-ams-block');
    if (bloque && !bloque.classList.contains('hidden')) {
      var slots = document.querySelectorAll('#ams-color-slots .ams-weight-inp');
      Array.prototype.forEach.call(slots, function(inp, n) {
        inp.value = p.filamentos[n] ? String(p.filamentos[n].gramos) : '';
      });
      if (p.filamentos.length > slots.length) avisos.push('El archivo usa ' + p.filamentos.length + ' colores y tu impresora tiene ' + slots.length + ' cabezales.');
      if (p.cambios != null) _poner('ams-color-changes', String(p.cambios));
      _poner('ams-purge-grams', '0');
      avisos.push('Los gramos ya incluyen la purga' + (p.cambios != null ? ' de los ' + p.cambios.toLocaleString('es-MX') + ' cambios de color' : '') +
                  ': la purga por cambio quedó en 0 g.');
      avisos.push('Elige el rollo de cada cabezal: el número de cada color arriba es su cabezal.');
    } else {
      avisos.push('Usa ' + p.filamentos.length + ' colores y no tienes una impresora con AMS para repartir los gramos.');
    }
  }
  if ((r.avisos || []).indexOf('gramos-estimados') !== -1) {
    avisos.push('Este slicer no da gramos: los calculé con los metros y la densidad del material.');
  }

  if (typeof calculate === 'function') calculate(true);
  _pintarResumenSlicer({ resultado: r, indice: i, avisos: avisos });
}

function deshacerLecturaSlicer() {
  var a = _slicerAntes;
  if (a) {
    _poner('calc-weight', a.peso || '');
    _poner('calc-time', a.tiempo || '');
    _poner('calc-pieces', a.piezas || '1');
    if (a.desc != null) _poner('calc-desc', a.desc);
    /* La impresora primero: al cambiarla se rearman los materiales y el AMS */
    if (a.impresora && a.impresora !== (_campo('calc-printer') || {}).value) _poner('calc-printer', a.impresora, 'change');
    if (a.material) _poner('calc-material', a.material, 'change');
    if (a.purga != null) _poner('ams-purge-grams', a.purga);
    if (a.cambios != null) _poner('ams-color-changes', a.cambios);
    Array.prototype.forEach.call(document.querySelectorAll('#ams-color-slots .ams-weight-inp'), function(inp, n) {
      inp.value = a.ams[n] || '';
    });
    if (typeof calculate === 'function') calculate(true);
  }
  _slicerLeido = null;
  _slicerAntes = null;
  _pintarResumenSlicer(null);
}

/* Después de agregar el producto a la cotización (o de generarla): el resumen se va,
   y lo que el archivo puso en el AMS (gramos, cambios, purga en 0) vuelve a como
   estaba, para que la siguiente pieza no herede la purga en 0. La impresora y el
   material se quedan: lo normal es seguir con los mismos. */
function limpiarLecturaSlicer() {
  var a = _slicerAntes;
  if (a) {
    if (a.purga != null) _poner('ams-purge-grams', a.purga);
    if (a.cambios != null) _poner('ams-color-changes', a.cambios);
    Array.prototype.forEach.call(document.querySelectorAll('#ams-color-slots .ams-weight-inp'), function(inp, n) {
      inp.value = a.ams[n] || '';
    });
  }
  _slicerLeido = null;
  _slicerAntes = null;
  _pintarResumenSlicer(null);
}

function _pintarResumenSlicer(estado) {
  var caja = _campo('slicer-resumen');
  if (!caja) return;
  if (_slicerMiniatura) { URL.revokeObjectURL(_slicerMiniatura); _slicerMiniatura = null; }
  if (!estado) { caja.innerHTML = ''; caja.classList.add('hidden'); return; }
  caja.classList.remove('hidden');

  if (estado.cargando) {
    caja.innerHTML = '<div class="slicer-resumen-texto"><div class="slicer-resumen-titulo">Leyendo ' + _escSlicer(estado.nombre) + '…</div></div>';
    return;
  }
  if (estado.error) {
    caja.innerHTML =
      '<span class="material-symbols-rounded slicer-error-icono" aria-hidden="true">error</span>' +
      '<div class="slicer-resumen-texto">' +
        '<div class="slicer-resumen-titulo">' + _escSlicer(estado.nombre) + '</div>' +
        '<div class="slicer-resumen-error">' + _escSlicer(estado.error) + '</div>' +
      '</div>' +
      '<button type="button" class="slicer-cerrar" onclick="_pintarResumenSlicer(null)" aria-label="Cerrar">' +
        '<span class="material-symbols-rounded" aria-hidden="true">close</span></button>';
    return;
  }

  var r = estado.resultado, p = r.placas[estado.indice];
  if (p.miniatura && typeof Blob !== 'undefined') {
    _slicerMiniatura = URL.createObjectURL(new Blob([p.miniatura], { type: 'image/png' }));
  }
  var colores = p.filamentos.length > 1
    ? p.filamentos.length + ' colores'
    : (p.filamentos[0] && p.filamentos[0].tipo ? p.filamentos[0].tipo : '');
  var selector = r.placas.length > 1
    ? ' · <select class="slicer-placa" onchange="aplicarPlacaSlicer(this.selectedIndex)" aria-label="Placa">' +
        r.placas.map(function(pl, n) {
          return '<option' + (n === estado.indice ? ' selected' : '') + '>Placa ' + pl.indice + '</option>';
        }).join('') + '</select>'
    : '';

  caja.innerHTML =
    (_slicerMiniatura ? '<img class="slicer-miniatura" src="' + _slicerMiniatura + '" alt="Placa ' + p.indice + '">' : '') +
    '<div class="slicer-resumen-texto">' +
      '<div class="slicer-resumen-titulo">' + _escSlicer(r.slicer) + selector + '</div>' +
      '<div class="slicer-resumen-datos num">' + p.gramos.toFixed(2) + ' g · ' + formatoDuracion(p.tiempoS) +
        (colores ? ' · ' + _escSlicer(colores) : '') +
        (p.filamentos.length > 1 && p.cambios != null ? ' · ' + p.cambios.toLocaleString('es-MX') + ' cambios' : '') + '</div>' +
      (p.impresora ? '<div class="slicer-resumen-titulo">' + _escSlicer(p.impresora) + '</div>' : '') +
      (p.filamentos.length > 1
        ? '<div class="slicer-filamentos">' + p.filamentos.map(function(f, n) {
            /* El número es el cabezal: así se sabe qué rollo elegir en cada uno */
            return '<span class="slicer-filamento"><span class="slicer-cabezal">' + (n + 1) + '</span>' +
                   '<span class="slicer-punto" style="background:' + (f.color || 'var(--ink-3)') + '"></span>' +
                   f.gramos.toFixed(1) + ' g</span>';
          }).join('') + '</div>'
        : '') +
      (estado.avisos.length
        ? '<ul class="slicer-avisos">' + estado.avisos.map(function(a) { return '<li>' + _escSlicer(a) + '</li>'; }).join('') + '</ul>'
        : '') +
    '</div>' +
    '<button type="button" class="btn btn-ghost slicer-deshacer" onclick="deshacerLecturaSlicer()">Deshacer</button>';
}

/* En la computadora, el explorador de archivos solo muestra .gcode y .3mf
   (D162). En el teléfono no: Android deja en gris los .gcode si se filtran
   por tipo, porque no les conoce un tipo MIME. Ahí la app revisa al elegir. */
(function _filtrarSelectorSlicer() {
  if (typeof document === 'undefined') return;
  var input = document.getElementById('slicer-archivo');
  if (!input) return;
  var ua = navigator.userAgent || '';
  var telefono = /Android|iPhone|iPad|iPod/i.test(ua) ||
                 (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);   /* iPad que se presenta como Mac */
  if (!telefono) input.setAttribute('accept', ACEPTA_SLICER);
})();

/* Arrastrar el archivo a la calculadora (escritorio) */
(function _arrastrarSlicer() {
  if (typeof document === 'undefined') return;
  var pagina = document.getElementById('page-calc');
  var zona = document.getElementById('slicer-lector');
  if (!pagina || !zona) return;
  var conArchivos = function(e) { return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') !== -1; };
  pagina.addEventListener('dragover', function(e) {
    if (!conArchivos(e)) return;
    e.preventDefault();
    zona.classList.add('slicer-arrastrando');
  });
  pagina.addEventListener('dragleave', function(e) {
    if (e.target === pagina || !pagina.contains(e.relatedTarget)) zona.classList.remove('slicer-arrastrando');
  });
  pagina.addEventListener('drop', function(e) {
    if (!conArchivos(e)) return;
    e.preventDefault();
    zona.classList.remove('slicer-arrastrando');
    var archivo = e.dataTransfer.files && e.dataTransfer.files[0];
    if (archivo) procesarArchivoSlicer(archivo);
  });
})();
