/* ===== Vercel Serverless Function — Notion Sync =====
   POST /api/notion
   Body: { quote }   → crea una página en la DB "Ventas 2026"
   Requiere: env var NOTION_API_KEY en Vercel
   ===================================================== */

const NOTION_DB_ID = '2e9e89bc3fee804caaa1cb47694330f4';
const NOTION_VERSION = '2022-06-28';

export default async function handler(req, res) {
  /* Solo POST */
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NOTION_API_KEY no configurada en Vercel' });
  }

  const { quote } = req.body || {};
  if (!quote) {
    return res.status(400).json({ error: 'Falta el objeto quote en el body' });
  }

  /* ── Mapeo de estado al select de Notion ── */
  const STATUS_MAP = {
    'pendiente':  'Sin empezar',
    'aceptada':   'En proceso',
    'rechazada':  'Cancelado'
  };

  /* ── Construir lista de productos como texto ── */
  const items = quote.items || [];
  const productosText = items.map(function(it) {
    var qty   = it.qty || 1;
    var total = (it.totalCost * qty).toFixed(2);
    return '• ' + it.desc + (it.material ? ' (' + it.material + ')' : '') +
           (qty > 1 ? ' x' + qty : '') + ' — $' + total;
  }).join('\n');

  /* ── Payload para Notion API ── */
  const payload = {
    parent: { database_id: NOTION_DB_ID },
    properties: {
      /* Título de la página = número de cotización */
      'Nombre': {
        title: [{ text: { content: quote.quoteNum || 'Sin número' } }]
      },
      /* Cliente */
      'Cliente': {
        rich_text: [{ text: { content: quote.client || '' } }]
      },
      /* Monto total */
      'Monto': {
        number: parseFloat((quote.grandTotal || 0).toFixed(2))
      },
      /* Fecha de cotización */
      'Fecha': {
        date: { start: (quote.quoteDate || new Date().toISOString()).slice(0, 10) }
      },
      /* Estado */
      'Estado': {
        select: { name: STATUS_MAP[quote.status] || 'Sin empezar' }
      },
      /* Teléfono (texto) */
      'Teléfono': {
        phone_number: quote.phone || null
      }
    }
  };

  /* Notas + productos como contenido de página (blocks) */
  const children = [];

  if (productosText) {
    children.push({
      object: 'block',
      type: 'heading_3',
      heading_3: { rich_text: [{ text: { content: 'Productos' } }] }
    });
    /* Notion: max 2000 chars por bloque de texto */
    const chunks = chunkText(productosText, 1900);
    chunks.forEach(function(chunk) {
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ text: { content: chunk } }] }
      });
    });
  }

  if (quote.notes) {
    children.push({
      object: 'block',
      type: 'heading_3',
      heading_3: { rich_text: [{ text: { content: 'Notas' } }] }
    });
    children.push({
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: [{ text: { content: quote.notes.slice(0, 1900) } }] }
    });
  }

  if (children.length) {
    payload.children = children;
  }

  /* ── Llamada a Notion API ── */
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion API error:', data);
      return res.status(response.status).json({
        error: data.message || 'Error al crear página en Notion',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      notionPageId: data.id,
      notionUrl: data.url
    });

  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'Error de red al conectar con Notion' });
  }
}

/* Helper: dividir texto largo en chunks */
function chunkText(text, maxLen) {
  var chunks = [];
  var i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + maxLen));
    i += maxLen;
  }
  return chunks;
}
