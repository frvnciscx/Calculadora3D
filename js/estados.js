/* ===== ESTADOS DE LA COTIZACIÓN (D1, D6–D9, D18, D140–D144) =====
   Las reglas de los estados en un solo lugar, sin tocar la pantalla, para
   probarlas en Node (tests/estados.test.js). Las pantallas solo preguntan aquí.

   Por ahora: Borrador → Enviada → Aceptada o Rechazada. En producción,
   Entregada y Cancelada (flujos 4 y 5 de docs/flujos.md) van después.

   «pendiente» es el nombre viejo de Borrador (D6). Se lee igual y no se
   reescriben las cotizaciones guardadas: cambian solas cuando se editan o
   cambian de estado (D141). */

var ESTADOS_COTIZACION = {
  borrador:  { etiqueta: 'Borrador',  icono: 'edit_note' },
  enviada:   { etiqueta: 'Enviada',   icono: 'send' },
  aceptada:  { etiqueta: 'Aceptada',  icono: 'check_circle' },
  rechazada: { etiqueta: 'Rechazada', icono: 'cancel' }
};

function estadoDe(q) {
  var s = q && q.status;
  return !s || s === 'pendiente' || !ESTADOS_COTIZACION[s] ? 'borrador' : s;
}

function etiquetaEstado(estado) {
  return (ESTADOS_COTIZACION[estadoDe({ status: estado })] || ESTADOS_COTIZACION.borrador).etiqueta;
}

/* WhatsApp y el enlace pasan Borrador → Enviada. Compartir una enviada,
   aceptada o rechazada no le cambia el estado (D7). */
function estadoAlCompartir(q) {
  return estadoDe(q) === 'borrador' ? 'enviada' : null;
}

/* Una aceptada no se edita; editar una enviada la regresa a Borrador, porque lo
   que tiene el cliente ya no coincide (D9). */
function sePuedeEditar(q) {
  return estadoDe(q) !== 'aceptada';
}
function estadoAlEditar(q) {
  var e = estadoDe(q);
  return e === 'enviada' ? 'borrador' : e;
}

/* «Regresar un paso» (D18): al estado del que vino. Las aceptadas o rechazadas
   viejas no saben de dónde vinieron: regresan a Enviada (D67). */
function estadoAnterior(q) {
  var e = estadoDe(q);
  if (e === 'enviada') return 'borrador';
  if (e === 'aceptada' || e === 'rechazada') {
    var antes = estadoDe({ status: q.estadoAnterior || 'enviada' });
    return antes === 'borrador' || antes === 'enviada' ? antes : 'enviada';
  }
  return null;
}

/* La acción principal de cada tarjeta (D143); lo demás va en el menú «⋯» */
function accionesPrincipales(q) {
  switch (estadoDe(q)) {
    case 'borrador': return ['enviar'];
    case 'enviada':  return ['aceptar', 'rechazar'];
    default:         return ['ver'];
  }
}

/* Lo que va en el menú «⋯», en orden */
function accionesDelMenu(q) {
  var e = estadoDe(q), a = [];
  if (e !== 'aceptada' && e !== 'rechazada') a.push('ver');
  if (sePuedeEditar(q)) a.push('editar');
  if (e !== 'borrador') a.push('enviar');
  if (e === 'borrador') a.push('marcar-enviada', 'aceptar', 'rechazar');
  a.push('duplicar', 'pdf', 'imagen', 'texto');
  if (estadoAnterior(q)) a.push('regresar');
  a.push('borrar');
  return a;
}

/* Lo que te necesita hoy, para el Inicio (D258): las enviadas que esperan
   respuesta, los borradores sin mandar y los rollos por acabarse o agotados.
   Las enviadas cuentan desde que se mandaron (enviadaAt, D261); las de antes
   de v156, que no lo guardaban, desde la fecha de la cotización. Los
   borradores, desde que se hicieron. estadoDeRollo(r) da 'ok' | 'bajo' | 'agotado'
   (estadoDeStock en js/store.js); aquí llega de fuera para probarlo en Node. */
function pendientesDeHoy(quotes, rollos, hoy, estadoDeRollo) {
  var r = { enviadas: 0, diasEnviadaMasVieja: null, borradores: 0, diasBorradorMasViejo: null,
            rollosBajos: 0, rollosAgotados: 0 };
  var ahora = (hoy instanceof Date ? hoy : new Date(hoy)).getTime();
  var dias = function(q, fecha) {
    var t = new Date(fecha || q.quoteDate).getTime();
    return isNaN(t) ? null : Math.max(0, Math.floor((ahora - t) / 86400000));
  };
  var mayor = function(a, b) { return b == null ? a : (a == null || b > a ? b : a); };
  (quotes || []).forEach(function(q) {
    var e = estadoDe(q);
    if (e === 'enviada')  { r.enviadas++;   r.diasEnviadaMasVieja  = mayor(r.diasEnviadaMasVieja, dias(q, q.enviadaAt)); }
    if (e === 'borrador') { r.borradores++; r.diasBorradorMasViejo = mayor(r.diasBorradorMasViejo, dias(q)); }
  });
  (rollos || []).forEach(function(x) {
    var s = estadoDeRollo ? estadoDeRollo(x) : 'ok';
    if (s === 'bajo') r.rollosBajos++;
    else if (s === 'agotado') r.rollosAgotados++;
  });
  r.hay = r.enviadas + r.borradores + r.rollosBajos + r.rollosAgotados > 0;
  return r;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ESTADOS_COTIZACION: ESTADOS_COTIZACION, estadoDe: estadoDe, etiquetaEstado: etiquetaEstado,
    estadoAlCompartir: estadoAlCompartir, sePuedeEditar: sePuedeEditar, estadoAlEditar: estadoAlEditar,
    estadoAnterior: estadoAnterior, accionesPrincipales: accionesPrincipales, accionesDelMenu: accionesDelMenu,
    pendientesDeHoy: pendientesDeHoy
  };
}
