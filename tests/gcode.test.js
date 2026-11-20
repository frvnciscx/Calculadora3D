/* Pruebas del lector de archivos del slicer (js/gcode.js, D133).
   Se corren con:  npm test

   Las muestras de tests/muestras/ salen de dos archivos reales de Francisco,
   laminados en Bambu Studio 2.9 para una A1 con AMS lite: «Sin título» (un
   color) y «SGAEYL PUNTA DAGA 4 COLORES». Llevan solo la ficha y el encabezado,
   no el G-code completo. Los de PrusaSlicer, Cura y Simplify3D están armados
   abajo con el formato que escribe cada slicer, porque no hay archivos reales. */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const g = require('../js/gcode.js');

const MUESTRAS = path.join(__dirname, 'muestras');

function archivo(nombre, contenido) {
  const datos = contenido != null ? contenido : fs.readFileSync(path.join(MUESTRAS, nombre));
  const blob = new Blob([datos]);
  blob.name = nombre;
  return blob;
}

const leer = (nombre, contenido, opts) => g.leerArchivoSlicer(archivo(nombre, contenido), opts);

test('Bambu Studio, un color (.gcode.3mf): tiempo, gramos, filamento, objeto y miniatura', async () => {
  const r = await leer('bambu-1color.gcode.3mf');
  const p = r.placas[0];
  assert.strictEqual(r.slicer, 'Bambu Studio');
  assert.strictEqual(p.tiempoS, 2395, 'el total estimado (39 min 55 s), no solo el del modelo (P129)');
  assert.strictEqual(p.gramos, 9.23);
  assert.deepStrictEqual(p.filamentos, [{ tipo: 'PLA', color: '#FFFFFF', gramos: 9.23, metros: 3.05 }]);
  assert.deepStrictEqual(p.objetos, ['Cuerpo604.stl']);
  assert.ok(p.miniatura && p.miniatura.length > 0, 'trae la miniatura de la placa');
});

test('Bambu Studio, 4 colores: los gramos por color suman el total, que ya incluye la purga', async () => {
  const r = await leer('bambu-4colores.gcode.3mf');
  const p = r.placas[0];
  assert.strictEqual(p.tiempoS, 119235);
  assert.strictEqual(p.gramos, 272.04);
  assert.deepStrictEqual(p.filamentos.map((f) => f.color), ['#545454', '#43403D', '#39699E', '#5B6579']);
  const suma = p.filamentos.reduce((s, f) => s + f.gramos, 0);
  assert.ok(Math.abs(suma - p.gramos) < 0.01, `suma ${suma} contra total ${p.gramos}`);
});

test('El .gcode suelto de Bambu da lo mismo que su .gcode.3mf (con fin de línea de Windows)', async () => {
  const del3mf = (await leer('bambu-4colores.gcode.3mf')).placas[0];
  const r = await leer('bambu-4colores.gcode');
  const p = r.placas[0];
  assert.strictEqual(r.slicer, 'Bambu Studio');
  assert.strictEqual(p.tiempoS, del3mf.tiempoS);
  assert.strictEqual(p.gramos, del3mf.gramos);
  assert.deepStrictEqual(p.filamentos.map((f) => [f.tipo, f.color, f.gramos]),
                         del3mf.filamentos.map((f) => [f.tipo, f.color, f.gramos]));
});

test('La impresora y los cambios de color salen del archivo (D135)', async () => {
  const p = (await leer('bambu-4colores.gcode.3mf')).placas[0];
  assert.strictEqual(p.impresora, 'Bambu Lab A1', 'de la configuración del proyecto');
  assert.strictEqual(p.cambios, 1217, 'del último «; toolchange #» del G-code de adentro');
  const t = (await leer('bambu-4colores.gcode')).placas[0];
  assert.strictEqual(t.impresora, 'Bambu Lab A1');
  assert.strictEqual(t.cambios, 1217);
  const uno = (await leer('bambu-1color.gcode.3mf')).placas[0];
  assert.strictEqual(uno.impresora, 'Bambu Lab P1S', 'sin configuración del proyecto, por la clave del modelo (C12)');
  assert.strictEqual(uno.cambios, null, 'un color no tiene cambios');
});

test('Qué impresora se elige con el archivo', () => {
  const lista = [
    { id: 'ender', name: 'Ender 3 V2', type: 'FDM' },
    { id: 'a1ams', name: 'Bambu Lab A1 + AMS', type: 'FDM', multicolor: true },
    { id: 'mini', name: 'A1 mini', type: 'FDM' },
    { id: 'mars', name: 'Elegoo Mars 3', type: 'Resina' }
  ];
  const elige = (modelo, multicolor, actual) => {
    const p = g.impresoraDelArchivo(lista, modelo, multicolor, actual);
    return p ? p.id : null;
  };
  assert.strictEqual(elige('Bambu Lab A1', true, 'ender'), 'a1ams', 'varios colores: la del modelo con AMS');
  assert.strictEqual(elige('Bambu Lab A1', false, 'ender'), 'a1ams', 'un color: la del modelo, aunque tenga AMS');
  assert.strictEqual(elige('Bambu Lab A1', false, 'a1ams'), 'a1ams', 'si ya está elegida, se queda');
  assert.strictEqual(elige('Bambu Lab A1 mini', false, 'ender'), 'mini', '«A1» no confunde a la A1 mini');
  assert.strictEqual(elige('Bambu Lab P1S', false, 'ender'), null, 'un modelo que no está: se deja la elegida');
  assert.strictEqual(elige('Bambu Lab P1S', true, 'ender'), 'a1ams', 'varios colores sin el modelo: la única con AMS');
  assert.strictEqual(elige('', true, 'a1ams'), 'a1ams');
});

test('Piezas: se cuentan las copias del mismo objeto, no objetos distintos (P130)', async () => {
  const p = (await leer('bambu-copias.gcode.3mf')).placas[0];
  assert.strictEqual(g.piezasDeObjetos(p.objetos), 3);
  assert.strictEqual(g.piezasDeObjetos(['cabeza.stl', 'cuerpo.stl']), null);
  assert.strictEqual(g.piezasDeObjetos(['solo.stl']), null);
});

test('Un .gcode.3mf sin ficha se lee del encabezado del G-code de adentro (OrcaSlicer)', async () => {
  const r = await leer('orca-sin-ficha.gcode.3mf');
  const p = r.placas[0];
  assert.strictEqual(r.slicer, 'OrcaSlicer');
  assert.strictEqual(p.tiempoS, 3930);
  assert.strictEqual(p.gramos, 12.5);
  assert.deepStrictEqual(p.filamentos.map((f) => [f.tipo, f.color]), [['PETG', '#FF8000']]);
});

test('Lo que no se puede leer avisa con su motivo', async () => {
  await assert.rejects(leer('bambu-proyecto.3mf'), { codigo: 'sin-laminar' });
  await assert.rejects(leer('figura.ctb', 'x'), { codigo: 'resina' });
  await assert.rejects(leer('figura.goo', 'x'), { codigo: 'resina' });
  await assert.rejects(leer('figura.bgcode', 'x'), { codigo: 'bgcode' });
  await assert.rejects(leer('foto.png', 'x'), { codigo: 'formato' });
  await assert.rejects(leer('vacio.gcode', 'G28\nG1 X10\n'), { codigo: 'sin-datos' });
});

const PRUSA = '; generated by PrusaSlicer 2.7.1+win64 on 2026-11-18 at 10:00:00 UTC\n' +
  'G28\n' +
  '; filament used [mm] = 3045.64\n; filament used [cm3] = 7.33\n; filament used [g] = 9.23\n' +
  '; total filament used [g] = 9.23\n' +
  '; estimated printing time (normal mode) = 39m 55s\n; estimated printing time (silent mode) = 41m 2s\n' +
  '; prusaslicer_config = begin\n; extruder_colour = ""\n; filament_colour = #FF8000\n; filament_type = PETG\n' +
  '; prusaslicer_config = end\n';

test('PrusaSlicer: el resumen va al final del archivo', async () => {
  const r = await leer('pieza.gcode', PRUSA);
  const p = r.placas[0];
  assert.strictEqual(r.slicer, 'PrusaSlicer');
  assert.strictEqual(p.tiempoS, 2395);
  assert.deepStrictEqual(p.filamentos, [{ tipo: 'PETG', color: '#FF8000', gramos: 9.23, metros: 3.05 }]);
});

test('Un G-code grande se lee solo por el principio y el final', async () => {
  const relleno = 'G1 X10.5 Y20.25 E0.0123\n'.repeat(150000);   /* unos 3.6 MB */
  const r = await leer('grande.gcode', PRUSA.split('G28\n')[0] + relleno + PRUSA.split('G28\n')[1]);
  assert.strictEqual(r.placas[0].tiempoS, 2395);
  assert.strictEqual(r.placas[0].gramos, 9.23);
});

test('Cura no da gramos: se calculan con los metros y la densidad del material', async () => {
  const cura = ';FLAVOR:Marlin\n;TIME:2395\n;Filament used: 3.04564m\n;Layer height: 0.2\n' +
               ';Generated with Cura_SteamEngine 5.7.1\nG28\n';
  const r = await leer('pieza.gcode', cura, { densidad: 1.26 });
  const p = r.placas[0];
  assert.strictEqual(r.slicer, 'Cura');
  assert.strictEqual(p.tiempoS, 2395);
  assert.ok(Math.abs(p.gramos - 9.23) < 0.02, `gramos ${p.gramos}`);
  assert.ok(r.avisos.includes('gramos-estimados'));
});

test('Simplify3D: tiempo en horas y minutos, peso en gramos', async () => {
  const s3d = '; G-Code generated by Simplify3D(R) Version 4.1.2\nG28\n' +
              ';   Build time: 0 hours 39 minutes\n;   Filament length: 3045.6 mm (3.05 m)\n' +
              ';   Plastic weight: 9.23 g (0.02 lb)\n';
  const r = await leer('pieza.gcode', s3d);
  assert.strictEqual(r.slicer, 'Simplify3D');
  assert.strictEqual(r.placas[0].tiempoS, 2340);
  assert.strictEqual(r.placas[0].gramos, 9.23);
});

test('Tiempos, descripciones y duraciones', () => {
  assert.strictEqual(g._segundosDeTexto('1d 9h 7m 15s'), 119235);
  assert.strictEqual(g._segundosDeTexto('33m 37s'), 2017);
  assert.strictEqual(g._segundosDeTexto('2h'), 7200);
  assert.strictEqual(g.descripcionDeArchivo('SGAEYL PUNTA DAGA 4 COLORES_makerlab.gcode.3mf'), 'SGAEYL PUNTA DAGA 4 COLORES_makerlab');
  assert.strictEqual(g.descripcionDeArchivo('Sin título.gcode.3mf'), '');
  assert.strictEqual(g.descripcionDeArchivo('llavero_plate_1.gcode'), 'llavero');
  assert.strictEqual(g.formatoDuracion(2395), '40 min');
  assert.strictEqual(g.formatoDuracion(119235), '33 h 7 min');
  assert.strictEqual(g.formatoDuracion(3600), '1 h');
});

test('Solo se aceptan archivos del slicer: .gcode y .3mf (D162)', () => {
  ['placa.gcode', 'PLACA.GCODE', 'llavero.gcode.3mf', 'proyecto.3mf', 'pieza.gco', 'cnc.nc', 'x.g']
    .forEach((n) => assert.ok(g.esArchivoSlicer(n), n + ' se debe aceptar'));
  ['foto.png', 'cotizacion.pdf', 'modelo.stl', 'gcode.txt', 'placa.gcode.zip', '', null]
    .forEach((n) => assert.ok(!g.esArchivoSlicer(n), String(n) + ' no se debe aceptar'));
  assert.strictEqual(g.ACEPTA_SLICER, '.gcode,.gco,.3mf');
});
