/* Pruebas de la fórmula de costeo.
   Se corren con:  node --test tests/
   No necesitan instalar nada: node trae su propio marco de pruebas.

   Los casos salen de cortes reales de Bambu Studio cotizados durante el
   desarrollo. Si un cambio al código rompe alguno, el precio que le das a un
   cliente cambió — y quieres enterarte aquí, no después de mandar la
   cotización. */

const test   = require('node:test');
const assert = require('node:assert');
const { computeCost, roundUpToFive } = require('../js/costing.js');

/* ── Configuración real del negocio ─────────────────────────────── */
const CONFIG = {
  currency: '$',
  kwhCost: 1.20,
  laborCostPerHour: 50,
  fixedMonthlyCost: 1860,
  monthlyPrintHours: 200,
  indirectMonthlyCost: 450,
  wastePercent: 10,
  maintenancePercent: 5,
  resinSupportPct: 20,
  ipaMlPerPrint: 150,
  ipaLiterCost: 80
};

const BAMBU  = { name: 'Bambu Lab A1 + AMS', power: 150, type: 'FDM',    cost: 12000, lifeHours: 5000 };
const ENDER  = { name: 'Ender 3 V2',         power: 350, type: 'FDM',    cost: 4500,  lifeHours: 3000 };
const MARS   = { name: 'Elegoo Mars 3',      power: 55,  type: 'Resina', cost: 5500,  lifeHours: 2000 };
const PLA    = { name: 'PLA',    costPerKg: 350 };
const RESINA = { name: 'Resina', costPerKg: 600 };

/* Compara con dos decimales — comparar flotantes con === falla por redondeo */
function casiIgual(actual, esperado, mensaje) {
  assert.ok(Math.abs(actual - esperado) < 0.005,
    `${mensaje}: esperaba ${esperado}, obtuvo ${actual.toFixed(4)}`);
}

/* ═══════════════════════════════════════════════════════════════════
   Redondeo
   ═══════════════════════════════════════════════════════════════════ */

test('redondea siempre hacia arriba al múltiplo de 5', () => {
  assert.strictEqual(roundUpToFive(56.94), 60);
  assert.strictEqual(roundUpToFive(11.46), 15);
  assert.strictEqual(roundUpToFive(6.07),  10);
  assert.strictEqual(roundUpToFive(15),    15, 'un múltiplo exacto no debe subir');
  assert.strictEqual(roundUpToFive(0),      0);
});

/* ═══════════════════════════════════════════════════════════════════
   Casos reales — cotizaciones COT-0001 y COT-0002
   ═══════════════════════════════════════════════════════════════════ */

test('marco decorativo — corte real, con imanes', () => {
  const r = computeCost(
    { weight: 13.42, timeH: 54.5333 / 60, designH: 0, margin: 50, postProcCost: 16.00 },
    CONFIG, BAMBU, PLA
  );
  casiIgual(r.matCost,      4.70, 'material');
  casiIgual(r.energyCost,   0.16, 'energía');
  casiIgual(r.deprecCost,   2.18, 'depreciación');
  casiIgual(r.fixedCost,    8.45, 'gastos fijos');
  casiIgual(r.indirectCost, 2.04, 'indirectos');
  casiIgual(r.maintCost,    0.77, 'mantenimiento');
  casiIgual(r.wasteCost,    3.43, 'desperdicio');
  casiIgual(r.baseCost,    37.75, 'costo base');
  assert.strictEqual(r.totalCost, 60, 'precio de venta');
});

test('herradura — dos por placa, tiempo prorrateado', () => {
  const r = computeCost(
    { weight: 15.32 / 2, timeH: (33 + 39 / 60) / 60 / 2, designH: 0, margin: 50 },
    CONFIG, BAMBU, PLA
  );
  casiIgual(r.baseCost, 7.64, 'costo base');
  assert.strictEqual(r.totalCost, 15);
});

test('la misma herradura capturada como placa de 2 da lo mismo', () => {
  /* Antes había que dividir a mano antes de teclear. Éste es el mismo caso
     capturado como lo entrega el slicer: la placa completa y cuántas trae. */
  const r = computeCost(
    { weight: 15.32, timeH: (33 + 39 / 60) / 60, designH: 0, pieces: 2, margin: 50 },
    CONFIG, BAMBU, PLA
  );
  casiIgual(r.baseCost, 7.64, 'costo base por pieza');
  assert.strictEqual(r.totalCost, 15);
});

test('topper tricolor — el trabajo grande', () => {
  const r = computeCost(
    { weight: 79.74, timeH: 3 + 17 / 60, designH: 0, margin: 50 },
    CONFIG, BAMBU, PLA
  );
  casiIgual(r.fixedCost, 30.53, 'los fijos dominan en trabajos largos');
  casiIgual(r.baseCost,  85.41, 'costo base');
  assert.strictEqual(r.totalCost, 130);
});

/* ═══════════════════════════════════════════════════════════════════
   Reglas de la fórmula
   ═══════════════════════════════════════════════════════════════════ */

test('el mantenimiento NO se cobra sobre el post-procesado', () => {
  const base  = { weight: 20, timeH: 1, designH: 0, margin: 50 };
  const sinPP = computeCost(base, CONFIG, ENDER, PLA);
  const conPP = computeCost({ ...base, postProcCost: 100 }, CONFIG, ENDER, PLA);

  casiIgual(conPP.maintCost, sinPP.maintCost,
    'agregar $100 de pintura no debe aumentar el mantenimiento');
});

test('el mantenimiento NO se cobra sobre las horas de diseño', () => {
  const base   = { weight: 20, timeH: 1, designH: 0, margin: 50 };
  const sinDis = computeCost(base, CONFIG, ENDER, PLA);
  const conDis = computeCost({ ...base, designH: 3 }, CONFIG, ENDER, PLA);

  casiIgual(conDis.maintCost, sinDis.maintCost,
    'el desgaste de la máquina no depende de cuánto diseñaste');
});

test('la resina suma soportes al peso y cobra IPA y curado', () => {
  const r = computeCost(
    { weight: 100, timeH: 2, designH: 0, margin: 50 },
    CONFIG, MARS, RESINA
  );
  casiIgual(r.effectiveWeight, 120, '100 g + 20% de soportes');
  casiIgual(r.matCost,       72.00, '120 g a $600/kg');
  casiIgual(r.ipaCost,       12.00, '150 ml a $80/L');
  assert.ok(r.uvCost > 0 && r.uvCost < 0.01, 'el curado UV es despreciable pero existe');
});

test('una pieza FDM no cobra nada de resina', () => {
  const r = computeCost({ weight: 20, timeH: 1, designH: 0, margin: 50 }, CONFIG, ENDER, PLA);
  assert.strictEqual(r.ipaCost, 0);
  assert.strictEqual(r.uvCost,  0);
  assert.strictEqual(r.supportPct, 0, 'FDM no agrega soportes automáticos');
});

test('en modo multicolor el costo AMS reemplaza al cálculo por peso', () => {
  const r = computeCost(
    { weight: 999, timeH: 1, designH: 0, margin: 50, amsMatCost: 10, amsPurgeCost: 2 },
    CONFIG, BAMBU, PLA
  );
  casiIgual(r.matCost, 12, 'debe ignorar los 999 g y usar 10 + 2');
});

test('sin horas de impresión al mes no se prorratean fijos ni indirectos', () => {
  const sinHoras = { ...CONFIG, monthlyPrintHours: 0 };
  const r = computeCost({ weight: 20, timeH: 1, designH: 0, margin: 50 }, sinHoras, ENDER, PLA);
  assert.strictEqual(r.fixedCost,    0, 'dividir entre cero debe dar 0, no NaN');
  assert.strictEqual(r.indirectCost, 0);
  assert.ok(!Number.isNaN(r.baseCost), 'el costo base nunca debe ser NaN');
});

test('una impresora sin vida útil no deprecia', () => {
  const sinVida = { ...ENDER, lifeHours: 0 };
  const r = computeCost({ weight: 20, timeH: 1, designH: 0, margin: 50 }, CONFIG, sinVida, PLA);
  assert.strictEqual(r.deprecCost, 0, 'no debe dar Infinity');
});

test('margen cero vende al costo base, salvo por el redondeo', () => {
  const r = computeCost({ weight: 20, timeH: 1, designH: 0, margin: 0 }, CONFIG, ENDER, PLA);
  assert.ok(r.totalCost >= r.baseCost, 'nunca por debajo del costo');
  assert.ok(r.totalCost - r.baseCost < 5, 'la diferencia es solo el redondeo');
});

test('entradas vacías no rompen el cálculo', () => {
  const r = computeCost({}, CONFIG, ENDER, PLA);
  assert.ok(!Number.isNaN(r.baseCost), 'sin datos el costo base debe ser un número');
  assert.strictEqual(r.totalCost, 0);
});

/* ═══════════════════════════════════════════════════════════════════
   La placa — piezas por corrida
   El slicer reporta la placa completa. Tratar ese número como si fuera de
   una sola pieza multiplicaba el precio por la cantidad de piezas.
   ═══════════════════════════════════════════════════════════════════ */

test('una placa de 30 piezas no se cotiza como una pieza de 900 g', () => {
  const datosDeLaPlaca = { weight: 900, timeH: 14, designH: 0, margin: 50 };

  const comoUnaPieza = computeCost(datosDeLaPlaca, CONFIG, BAMBU, PLA);
  const comoPlaca    = computeCost({ ...datosDeLaPlaca, pieces: 30 }, CONFIG, BAMBU, PLA);

  /* El error reportado: un precio grande, plausible y 28 veces mayor */
  assert.ok(comoUnaPieza.totalCost / comoPlaca.totalCost > 20,
    'sin declarar las piezas, el precio se dispara');

  casiIgual(comoPlaca.baseCost, comoUnaPieza.baseCost / 30,
    'el costo base por pieza es el de la placa entre 30');
});

test('el diseño se reparte entre las piezas de la placa', () => {
  /* 12 h de diseño, 6 maquetas iguales en una corrida. Cada maqueta carga
     2 h; las 6 juntas vuelven a sumar las 12 h que se trabajaron. */
  const r = computeCost(
    { weight: 600, timeH: 12, designH: 12, pieces: 6, margin: 50 },
    CONFIG, BAMBU, PLA
  );
  casiIgual(r.laborCost, 2 * CONFIG.laborCostPerHour, 'diseño por pieza');
  casiIgual(r.laborCost * 6, 12 * CONFIG.laborCostPerHour,
    'las 6 juntas cobran el diseño una sola vez');
});

test('el redondeo se aplica a la pieza, no a la placa', () => {
  /* Redondear la placa y después dividir deja precios como $21.67. */
  const r = computeCost(
    { weight: 300, timeH: 5, designH: 0, pieces: 7, margin: 50 },
    CONFIG, BAMBU, PLA
  );
  assert.strictEqual(r.totalCost % 5, 0, 'el precio por pieza termina en 5 o en 0');
});

test('un número de piezas imposible se trata como una sola', () => {
  const base = { weight: 100, timeH: 2, designH: 1, margin: 50 };
  const una  = computeCost(base, CONFIG, BAMBU, PLA);

  [0, -5, null, undefined, '', 'abc', NaN].forEach(function(valor) {
    const r = computeCost({ ...base, pieces: valor }, CONFIG, BAMBU, PLA);
    casiIgual(r.baseCost, una.baseCost, `pieces=${valor} debe comportarse como 1`);
    assert.ok(Number.isFinite(r.totalCost), `pieces=${valor} no debe dar Infinity ni NaN`);
  });

  /* Media pieza no existe: 2.4 se redondea a 2 */
  const frac = computeCost({ ...base, pieces: 2.4 }, CONFIG, BAMBU, PLA);
  assert.strictEqual(frac.pieces, 2);
});

test('el peso por pieza es el que descuenta el inventario', () => {
  /* Es el dato que viaja a la cotización: si guardara los gramos de la placa,
     un pedido de 30 descontaría 30 placas del rollo. */
  const r = computeCost(
    { weight: 900, timeH: 14, designH: 0, pieces: 30, margin: 50 },
    CONFIG, BAMBU, PLA
  );
  casiIgual(r.effectiveWeight, 30, '900 g entre 30 piezas');
});

/* ═══════════════════════════════════════════════════════════════════
   El redondeo distorsiona las piezas baratas — queda documentado
   ═══════════════════════════════════════════════════════════════════ */

test('el redondeo infla el margen real en piezas pequeñas', () => {
  const letraK = computeCost(
    { weight: 7.35 / 2, timeH: (18 + 59 / 60) / 60 / 2, designH: 0, margin: 50 },
    CONFIG, BAMBU, PLA
  );
  const margenReal = (letraK.totalCost - letraK.baseCost) / letraK.totalCost;

  assert.strictEqual(letraK.totalCost, 10);
  assert.ok(margenReal > 0.55,
    `el margen configurado es 50% pero el real es ${(margenReal * 100).toFixed(0)}% ` +
    `por el redondeo de $${(letraK.baseCost * 1.5).toFixed(2)} a $10`);
});

/* ═══════════════════════════════════════════════════════════════════
   Vínculo rollo ↔ material
   Antes el rollo guardaba el NOMBRE del material y la app los comparaba
   como texto: renombrar un material desvinculaba todos sus rollos.
   ═══════════════════════════════════════════════════════════════════ */

/* Réplica de la lógica de store.js y calculator.js, para probarla sin DOM. */
function migrar(inventory, materials) {
  inventory.forEach(function(rollo) {
    if (rollo.materialId) return;
    var m = materials.find(function(x) {
      return x.name && rollo.material &&
             x.name.toLowerCase() === rollo.material.toLowerCase();
    });
    if (m) rollo.materialId = m.id;
  });
  return inventory;
}
function rollosDe(matId, inventory, materials) {
  var matSel = materials.find(function(m) { return m.id === matId; });
  return inventory.filter(function(it) {
    if (it.materialId) return it.materialId === matId;
    return matSel && it.material && it.material.toLowerCase() === matSel.name.toLowerCase();
  });
}

test('la migración vincula los rollos viejos por nombre', () => {
  const materials = [{ id: '1', name: 'PLA' }, { id: '2', name: 'PETG' }];
  const inventory = migrar([
    { id: 'a', material: 'PLA',  remainingG: 800 },
    { id: 'b', material: 'pla',  remainingG: 500 },   // minúsculas
    { id: 'c', material: 'PETG', remainingG: 900 }
  ], materials);

  assert.strictEqual(inventory[0].materialId, '1');
  assert.strictEqual(inventory[1].materialId, '1', 'debe ignorar mayúsculas');
  assert.strictEqual(inventory[2].materialId, '2');
});

test('renombrar un material NO desvincula sus rollos', () => {
  const materials = [{ id: '1', name: 'PLA' }];
  const inventory = migrar([{ id: 'a', material: 'PLA', remainingG: 800 }], materials);

  assert.strictEqual(rollosDe('1', inventory, materials).length, 1, 'antes del renombre');

  materials[0].name = 'PLA Básico';           // el usuario lo renombra en Materiales
  assert.strictEqual(rollosDe('1', inventory, materials).length, 1,
    'el rollo debe seguir apareciendo tras renombrar el material');
});

test('un rollo sin migrar aún se encuentra por nombre', () => {
  const materials = [{ id: '1', name: 'PLA' }];
  const inventory = [{ id: 'a', material: 'PLA', remainingG: 800 }];  // sin migrar
  assert.strictEqual(rollosDe('1', inventory, materials).length, 1);
});

test('rollos de otro material no se mezclan', () => {
  const materials = [{ id: '1', name: 'PLA' }, { id: '2', name: 'PETG' }];
  const inventory = migrar([
    { id: 'a', material: 'PLA'  },
    { id: 'b', material: 'PETG' }
  ], materials);
  assert.strictEqual(rollosDe('1', inventory, materials).length, 1);
  assert.strictEqual(rollosDe('2', inventory, materials)[0].id, 'b');
});
