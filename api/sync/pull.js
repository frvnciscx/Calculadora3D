/**
 * GET /api/sync/pull
 * Devuelve el snapshot más reciente guardado en Notion DB "App State — Calc3D".
 * Lee los bloques de la página y reconstruye el JSON.
 */

const NOTION_VERSION = '2022-06-28';
const NOTION_API     = 'https://api.notion.com/v1';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'GET')     { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }

  var token = process.env.NOTION_TOKEN;
  var dbId  = process.env.NOTION_STATE_DB_ID;
  if (!token || !dbId) {
    res.status(500).json({ ok: false, error: 'Falta NOTION_TOKEN o NOTION_STATE_DB_ID' });
    return;
  }

  var headers = {
    'Authorization':  'Bearer ' + token,
    'Notion-Version': NOTION_VERSION,
    'Content-Type':   'application/json',
  };

  try {
    /* Obtener la página más reciente */
    var queryRes = await fetch(NOTION_API + '/databases/' + dbId + '/query', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
        page_size: 1,
      }),
    });

    var queryData = await queryRes.json();
    var pages = queryData.results || [];

    if (!pages.length) {
      res.status(200).json({ ok: true, state: null, message: 'Sin snapshots' });
      return;
    }

    var page   = pages[0];
    var pageId = page.id;

    /* Leer la metadata de la página */
    var syncedAt = null;
    var version  = null;
    var device   = null;
    try {
      syncedAt = page.properties.SyncedAt && page.properties.SyncedAt.date
        ? page.properties.SyncedAt.date.start : null;
      version  = page.properties.Version && page.properties.Version.number;
      device   = page.properties.Device && page.properties.Device.rich_text
        ? (page.properties.Device.rich_text[0] && page.properties.Device.rich_text[0].text.content)
        : null;
    } catch(e) {}

    /* Leer bloques de la página (paginado por si hay muchos) */
    var allBlocks = [];
    var cursor    = undefined;
    var safety    = 0;

    do {
      var url = NOTION_API + '/blocks/' + pageId + '/children?page_size=100';
      if (cursor) url += '&start_cursor=' + cursor;

      var blocksRes  = await fetch(url, { headers: headers });
      var blocksData = await blocksRes.json();

      (blocksData.results || []).forEach(function(b) { allBlocks.push(b); });
      cursor = blocksData.has_more ? blocksData.next_cursor : null;
      safety++;
    } while (cursor && safety < 10);

    /* Reconstruir JSON concatenando el texto de los párrafos */
    var json = allBlocks
      .filter(function(b) { return b.type === 'paragraph'; })
      .map(function(b) {
        return (b.paragraph.rich_text || [])
          .map(function(rt) { return rt.text ? rt.text.content : ''; })
          .join('');
      })
      .join('');

    if (!json) {
      res.status(200).json({ ok: true, state: null, message: 'Página vacía' });
      return;
    }

    var state = JSON.parse(json);
    res.status(200).json({ ok: true, state: state, syncedAt: syncedAt, version: version, device: device });

  } catch (err) {
    console.error('[sync/pull] Error:', err);
    res.status(502).json({ ok: false, error: 'Error al leer snapshot de Notion' });
  }
};
