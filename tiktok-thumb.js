// Vercel serverless: devuelve la miniatura de un reel de TikTok. Prueba 3 metodos hasta que uno funcione.
// Uso: /api/tiktok-thumb?id=NUMERO_DEL_VIDEO        (agregar &debug=1 para ver que metodo anduvo)
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const get = (url) => fetch(url, { signal: AbortSignal.timeout(3000), headers: { "User-Agent": UA, "Accept-Language": "es-AR,es;q=0.9" } });
const limpiar = (u) => u.replace(/\\u002F/g, "/").replace(/\\u0026/g, "&").replace(/&amp;/g, "&");

async function oembed(id, user) {
  const r = await get(`https://www.tiktok.com/oembed?url=${encodeURIComponent(`https://www.tiktok.com/@${user}/video/${id}`)}`);
  return (await r.json()).thumbnail_url || null;
}
async function embed(id) { // pagina del reproductor incrustado
  const t = await (await get(`https://www.tiktok.com/embed/v2/${id}`)).text();
  const m = t.match(/"(?:originCover|cover|dynamicCover)":"([^"]+)"/) || t.match(/property="og:image" content="([^"]+)"/);
  return m ? limpiar(m[1]) : null;
}
async function pagina(id, user) { // pagina publica del video (og:image)
  const t = await (await get(`https://www.tiktok.com/@${user}/video/${id}`)).text();
  const m = t.match(/property="og:image" content="([^"]+)"/);
  return m ? limpiar(m[1]) : null;
}

export default async function handler(req, res) {
  const id = String(req.query.id || "").replace(/\D/g, ""), user = process.env.TIKTOK_USER || "dany_ush_oficial";
  if (!id) return res.status(400).json({ thumb: null });
  let thumb = null, metodo = null; const log = {};
  for (const [nombre, fn] of [["oembed", () => oembed(id, user)], ["embed", () => embed(id)], ["pagina", () => pagina(id, user)]]) {
    try { thumb = await fn(); } catch (e) { log[nombre] = String(e.message || e); }
    if (thumb) { metodo = nombre; break; }
    log[nombre] = log[nombre] || "sin resultado";
  }
  res.setHeader("Cache-Control", thumb ? "s-maxage=3600, stale-while-revalidate=86400" : "no-store");
  res.status(200).json(req.query.debug ? { thumb, metodo, log } : { thumb });
}
