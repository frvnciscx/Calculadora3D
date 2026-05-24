/**
 * POST /api/notion
 * Vercel Serverless Function — registra cotizaciones aceptadas
 * en la DB "Ventas Costeo" de Notion (Calculadora #D · impresión 3D).
 *
 * Env vars requeridas (Vercel → Settings → Environment Variables):
 *   NOTION_TOKEN  : token de la integration (ntn_xxx o secret_xxx)
 *   NOTION_DB_ID  : f335abef38da42938fdd0f135956baac
 */

const NOTION_VERSION = '2022-06-28';
const NOTION_API     = 'https://api.notion.com/v1';

/* Mapeo estados PWA → opciones status de la DB */
const STATUS_MAP = {
  pendiente: 'Sin empezar',
  enviada:   'En curso',
  aceptada:  'Listo',
  rechazada: 'Sin empezar',
  entregada: 'Listo',
};

function escText(s, max) {
  if (s == null) return '';
  s = String(s);
  if (max && s.length > max) s = s.slice(0, max - 1) + '…';
  return s;
}

/* Texto de productos:
   "Topper boda · PLA · 18g · 1.5h · x1 → $240.00"  */
function buildItemsText(items, currency) {
  if (!items || !items.length) return '';
  return items.map(function(it) {
    var name   = it.desc     || 'Pieza';
    var mat    = it.material ? ' \xb7 ' + it.material : '';
    var weight = it.weight   ? ' \xb7 ' + it.weight + 'g' : '';
    var time   = it.timeH    ? ' \xb7 ' + it.timeH + 'h' : '';
    var qty    = it.qty      || 1;
    var sub    = (it.totalCost || 0) * qty;
    return name + mat + weight + time + ' \xb7 x' + qty + ' → ' + currency + sub.toFixed(2);
  }).join('\n');
}

module.exports = async function handler(req, res) {
  /* CORS */
  res.setHeader('Access-Control-Allow-Origin',  req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST')    { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }

  /* Env vars */
  var token = process.env.NOTION_TOKEN;
  var dbId  = process.env.NOTION_DB_ID;
  if (!token || !dbId) {
    res.status(500).json({ ok: false, error: 'Falta NOTION_TOKEN o NOTION_DB_ID en el servidor' });
    return;
  }

  /* Body */
  var body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch(e) { body = {}; } }
  var q = body && body.quote;
  if (!q || !q.client || q.grandTotal == null) {
    res.status(400).json({ ok: false, error: 'Payload inv\xe1lido: requiere quote.client y quote.grandTotal' });
    return;
  }

  var currency   = body.currency || '$';
  var status     = STATUS_MAP[q.status] || 'Listo';
  var fechaStr   = q.quoteDate
    ? new Date(q.quoteDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  var prodsText  = buildItemsText(q.items, currency);
  var itemsCount = q.items ? q.items.length : 1;

  /* Propiedades — nombres exactos de la DB */
  var properties = {
    'Cliente':     { title:     [{ text: { content: escText(q.client, 200) } }] },
    'Cotizaci\xf3n':  { rich_text: [{ text: { content: escText(q.quoteNum || '', 100) } }] },
    'Fecha':       { date:      { start: fechaStr } },
    'Monto':       { number:    Number(q.grandTotal)    || 0 },
    'Costo base':  { number:    Number(q.totalBaseCost) || 0 },
    'Productos':   { rich_text: [{ text: { content: escText(prodsText, 2000) } }] },
    '# Items':     { number:    itemsCount },
    'Estado':      { status:    { name: status } },
    'Descuento %': { number:    Number(q.discount) || 0 },
  };
  if (q.phone) properties['Tel\xe9fono'] = { phone_number: String(q.phone) };
  if (q.notes) properties['Notas']      = { rich_text: [{ text: { content: escText(q.notes, 2000) } }] };

  /* POST a Notion */
  try {
    var notionRes = await fetch(NOTION_API + '/pages', {
      method: 'POST',
      headers: {
        'Authorization':  'Bearer ' + token,
        'Notion-Version': NOTION_VERSION,
        'Content-Type':   'application/json',
      },
      body: JSON.stringify({ parent: { database_id: dbId }, properties: properties }),
    });

    var data = await notionRes.json();

    if (!notionRes.ok) {
      console.error('[notion] API error:', notionRes.status, data);
      res.status(notionRes.status).json({
        ok: false,
        error: (data && data.message) || 'Error de Notion API',
        notionStatus: notionRes.status,
      });
      return;
    }

    res.status(200).json({ ok: true, notionPageId: data.id, url: data.url });

  } catch (err) {
    console.error('[notion] Request failed:', err);
    res.status(502).json({ ok: false, error: 'Error de red al contactar Notion' });
  }
};
