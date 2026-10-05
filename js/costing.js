/* ===== COSTING — el núcleo del negocio =====================================

   Este archivo contiene la fórmula de costeo y NADA más. No lee campos de la
   pantalla, no pinta resultados, no guarda nada. Recibe números y devuelve
   números.

   Por qué está separado:

   1. Se puede probar. Una función que solo recibe y devuelve datos se verifica
      con un test automático (ver tests/costing.test.js). La versión anterior
      vivía dentro de calculate(), mezclada con document.getElementById, y para
      probarla había que simular un navegador entero.

   2. Es lo único que hay que portar a Android. Toda la interfaz se reescribe
      en la app nativa, pero esta fórmula se traduce línea por línea a Kotlin
      y debe dar exactamente los mismos números. Tenerla aislada convierte esa
      traducción en una tarea mecánica en vez de una arqueología.

   3. Un solo lugar donde cambia el precio. Si mañana el mantenimiento pasa de
      porcentaje a monto fijo, se toca aquí y se actualiza el test. Nada más.

   Orden de la fórmula (importa, porque cada paso se apila sobre el anterior):

     material + energía + diseño + depreciación + fijos + indirectos
       + IPA y UV (resina) + post-procesado          = costo directo
     + mantenimiento (% sobre costos de máquina)     = subtotal
     + desperdicio (% sobre subtotal)                = costo base
     ÷ piezas                                        = costo base por pieza
     × (1 + margen)  y redondeo hacia arriba         = precio de venta

   Sobre `pieces` — la placa:

   Nadie imprime de a una pieza. El slicer reporta el peso y el tiempo de la
   PLACA completa, y antes la app trataba ese número como si fuera de una sola
   pieza: una placa de 30 llaveros daba el precio de un llavero de 900 g. El
   error no era de poco, era de un factor igual a la cantidad.

   `pieces` dice cuántas piezas cubren los datos capturados. Todo se divide
   entre ese número — todo, sin excepciones, porque todo lo que se captura es
   de la placa: los gramos, las horas, las horas de diseño y la pintura.

   Es distinto de la cantidad de la cotización. Esa multiplica (cuántas te
   compran); ésta divide (cuántas salieron de una corrida). Si capturas la
   placa de 30 y vendes 30, el diseño se cobra exactamente una vez.
   =========================================================================== */

/* Redondea hacia arriba al múltiplo de 5 más cercano.
   $56.94 → $60. Es una decisión comercial, no matemática: los precios
   terminados en 5 o 0 se leen mejor. En piezas baratas infla bastante el
   margen — ver nota en docs/AUDITORIA.md. */
function roundUpToFive(n) {
  return Math.ceil(n / 5) * 5;
}

/**
 * Calcula el costo y precio de UNA pieza.
 *
 * @param {object} input   — todo se refiere a la PLACA capturada
 *   weight        gramos de la placa (sin soportes de resina)
 *   timeH         horas de impresión, incluida la preparación
 *   designH       horas de diseño a cobrar
 *   pieces        piezas que salen de esa placa (default 1)
 *   margin        porcentaje de margen (50 = +50%)
 *   postProcCost  costo de pintura, primer, barniz, insumos
 *   amsMatCost    costo de material en modo multicolor (reemplaza el cálculo normal)
 *   amsPurgeCost  costo del material purgado en los cambios de color
 *
 * @param {object} config    configuración del negocio (ver store.js DEF_CONFIG)
 * @param {object} printer   { power, cost, lifeHours, type }
 * @param {object} material  { costPerKg }
 *
 * @returns {object} desglose completo con todos los rubros
 */
function computeCost(input, config, printer, material) {
  var weight   = Number(input.weight)  || 0;
  var timeH    = Number(input.timeH)   || 0;
  var designH  = Number(input.designH) || 0;
  var margin   = Number(input.margin)  || 0;

  /* Piezas de la placa. Nunca cero ni fracción: dividir entre 0 da infinito y
     media pieza no existe. */
  var pieces   = Math.max(1, Math.round(Number(input.pieces) || 1));

  var isResin  = printer.type === 'Resina';

  /* Peso efectivo — la resina necesita soportes que también se imprimen */
  var supportPct      = isResin ? (config.resinSupportPct || 20) : 0;
  var effectiveWeight = weight * (1 + supportPct / 100);

  /* Material: en multicolor el costo viene dado (un rollo por color + purga) */
  var usaAMS  = input.amsMatCost != null;
  var matCost = usaAMS
    ? (Number(input.amsMatCost) || 0) + (Number(input.amsPurgeCost) || 0)
    : (effectiveWeight / 1000) * (material.costPerKg || 0);

  var energyCost = (printer.power / 1000) * timeH * (config.kwhCost || 0);
  var laborCost  = designH * (config.laborCostPerHour || 0);

  /* Depreciación: lo que "gasta" la impresora de su vida útil en este trabajo */
  var deprecCost = printer.lifeHours > 0
    ? (printer.cost / printer.lifeHours) * timeH
    : 0;

  /* Gastos fijos e indirectos: el mensual repartido entre las horas del mes */
  var horasMes   = config.monthlyPrintHours || 0;
  var fixedCost  = horasMes > 0 ? ((config.fixedMonthlyCost    || 0) / horasMes) * timeH : 0;
  var indirectCost = horasMes > 0 ? ((config.indirectMonthlyCost || 0) / horasMes) * timeH : 0;

  /* Post-proceso de resina: lavado con alcohol y curado ultravioleta */
  var ipaCost = 0, uvCost = 0;
  if (isResin) {
    ipaCost = (config.ipaMlPerPrint || 150) * ((config.ipaLiterCost || 80) / 1000);
    /* Elegoo Mercury Plus: 24 W × 5 min de lavado + 36 W × 3 min de curado */
    var washKwh = (24 / 1000) * (5 / 60);
    var cureKwh = (36 / 1000) * (3 / 60);
    uvCost = (washKwh + cureKwh) * (config.kwhCost || 0);
  }

  var postProcCost = Number(input.postProcCost) || 0;

  var directCost = matCost + energyCost + laborCost + deprecCost +
                   fixedCost + indirectCost + ipaCost + uvCost + postProcCost;

  /* Mantenimiento sobre los costos de MÁQUINA solamente. El desgaste escala
     con el uso de la impresora y lo abrasivo del material, no con las horas
     de diseño ni con cuánta pintura lleve la pieza. */
  var machineCost = matCost + energyCost + deprecCost + fixedCost;
  var maintCost   = machineCost * ((config.maintenancePercent || 0) / 100);

  var subtotal  = directCost + maintCost;
  var wasteCost = subtotal * ((config.wastePercent || 0) / 100);

  /* De aquí para abajo todo es POR PIEZA. El redondeo a múltiplo de 5 se
     aplica al precio de la pieza, no al de la placa: redondear la placa y
     después dividir deja precios como $21.67. */
  function porPieza(v) { return v / pieces; }

  var baseCost  = porPieza(subtotal + wasteCost);
  var totalCost = roundUpToFive(baseCost * (1 + margin / 100));

  return {
    pieces:          pieces,
    effectiveWeight: porPieza(effectiveWeight),
    supportPct:      supportPct,
    isResin:         isResin,
    matCost:         porPieza(matCost),
    energyCost:      porPieza(energyCost),
    laborCost:       porPieza(laborCost),
    deprecCost:      porPieza(deprecCost),
    fixedCost:       porPieza(fixedCost),
    indirectCost:    porPieza(indirectCost),
    ipaCost:         porPieza(ipaCost),
    uvCost:          porPieza(uvCost),
    postProcCost:    porPieza(postProcCost),
    maintCost:       porPieza(maintCost),
    wasteCost:       porPieza(wasteCost),
    baseCost:        baseCost,
    totalCost:       totalCost,
    profit:          totalCost - baseCost
  };
}

/* Exportar para los tests en Node. En el navegador no existe module. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeCost: computeCost, roundUpToFive: roundUpToFive };
}
