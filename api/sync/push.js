/**
 * POST /api/sync/push
 * Guarda un snapshot completo del estado de la app en Notion DB "App State — Calc3D".
 * El JSON se parte en bloques de 1900 chars y se almacena como contenido de la página.
 *
 * Body: { state: { quotes, clients, inventory, materials, config, quoteStyle, quoteCounter },
 *         device: "iPhone de Paco", version: 5 }
 */

const NOTION_VERSION = '2022-06-28';
const NOTION_API     = 'https://api.notion.com/v1';
const CHUNK_SIZE     = 1900;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST')    { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }

  var token = process.env.NOTION_TOKEN;
  var dbId  = process.env.NOTION_STATE_DB_ID;
  if (!token || !dbId) {
    res.status(500).json({ ok: false, error: 'Falta NOTION_TOKEN o NOTION_STATE_DB_ID' });
    return;
  }

  var body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch(e) { body = {}; } }
  if (!body || !body.state) {
    res.status(400).json({ ok: false, error: 'Falta body.state' });
    return;
  }

  var state   = body.state;
  var device  = body.device  || 'PWA';
  var version = body.version || 1;
  var now     = new Date().toISOString();

  /* Serializar y partir en chunks */
  var json   = JSON.stringify(state);
  var chunks = [];
  for (var i = 0; i < json.length; i += CHUNK_SIZE) {
    chunks.push(json.slice(i, i + CHUNK_SIZE));
  }

  /* Construir bloques para el contenido de la página */
  var children = chunks.map(function(chunk) {
    return {
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] }
    };
  });

  var headers = {
    'Authorization':  'Bearer ' + token,
    'Notion-Version': NOTION_VERSION,
    'Content-Type':   'application/json',
  };

  try {
    /* Crear nueva página en la DB con el snapshot */
    var pageRes = await fetch(NOTION_API + '/pages', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: {
          'Name':     { title:     [{ text: { content: 'sync-' + now } }] },
          'Version':  { number:    version },
          'SyncedAt': { date:      { start: now } },
          'Device':   { rich_text: [{ text: { content: device } }] },
        },
        children: children,
      }),
    });

    var pageData = await pageRes.json();
    if (!pageRes.ok) {
      console.error('[sync/push] Notion error:', pageRes.status, pageData);
      res.status(pageRes.status).json({ ok: false, error: pageData.message || 'Error Notion' });
      return;
    }

    /* Limpiar páginas viejas — mantener solo las últimas 3 */
    try {
      var queryRes = await fetch(NOTION_API + '/databases/' + dbId + '/query', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          sorts: [{ timestamp: 'created_time', direction: 'descending' }],
          page_size: 20,
        }),
      });
      var queryData = await queryRes.json();
      var pages = (queryData.results || []).slice(3); /* eliminar todo excepto los 3 más recientes */
      await Promise.all(pages.map(function(p) {
        return fetch(NOTION_API + '/pages/' + p.id, {
          method: 'PATCH',
          headers: headers,
          body: JSON.stringify({ archived: true }),
        });
      }));
    } catch(e) { /* no crítico */ }

    res.status(200).json({ ok: true, pageId: pageData.id, chunks: chunks.length });

  } catch (err) {
    console.error('[sync/push] Error:', err);
    res.status(502).json({ ok: false, error: 'Error de red al contactar Notion' });
  }
};
