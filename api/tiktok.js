// Vercel serverless: reels de TikTok desde un feed RSS (RSS.app) + visualizaciones (mejor esfuerzo).
// Env (opcionales): TIKTOK_RSS_URL, TIKTOK_USER
// Uso de diagnóstico: /api/tiktok?debug=1
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const RSS_POR_DEFECTO = "https://rss.app/feeds/Lwrs1ycz4yXl1cEv.xml";
const HEAD = { "User-Agent": UA, "Accept-Language": "es-AR,es;q=0.9" };

const limpiar = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .trim();

const num = (s) => { const n = Number(s); return Number.isFinite(n) && n >= 0 ? n : null; };

// seguidores: se lee del perfil público (mejor esfuerzo, TikTok suele bloquearlo). Máx. 2,5 s
async function leerSeguidores(user) {
  try {
    const r = await fetch(`https://www.tiktok.com/@${user}`, { signal: AbortSignal.timeout(2500), headers: HEAD });
    if (!r.ok) return null;
    const html = await r.text();
    // primero el dato exacto del perfil (statsV2); el primer "followerCount" suelto puede ser un número redondeado
    const j = html.match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_HYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    if (j) {
      try {
        const ui = JSON.parse(j[1])?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo;
        const n = Number(ui?.statsV2?.followerCount ?? ui?.stats?.followerCount);
        if (n > 0) return n;
      } catch (_) {}
    }
    const m = html.match(/"followerCount":\s*"?(\d+)/);
    return m ? Number(m[1]) : null;
  } catch (_) { return null; }
}

// visualizaciones de UN reel: prueba la página del reproductor incrustado y después la página pública del video
async function vistasDe(id, user) {
  const metodos = [
    async () => { // reproductor incrustado
      const r = await fetch(`https://www.tiktok.com/embed/v2/${id}`, { signal: AbortSignal.timeout(3000), headers: HEAD });
      if (!r.ok) return null;
      const m = (await r.text()).match(/"playCount"\s*:\s*"?(\d+)/);
      return m ? num(m[1]) : null;
    },
    async () => { // página pública del video
      const r = await fetch(`https://www.tiktok.com/@${user}/video/${id}`, { signal: AbortSignal.timeout(3000), headers: HEAD });
      if (!r.ok) return null;
      const html = await r.text();
      const j = html.match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_HYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      if (j) {
        try {
          const it = JSON.parse(j[1])?.__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct;
          const n = num(it?.statsV2?.playCount ?? it?.stats?.playCount);
          if (n != null) return n;
        } catch (_) {}
      }
      const m = html.match(/"playCount"\s*:\s*"?(\d+)/);
      return m ? num(m[1]) : null;
    },
  ];
  for (const f of metodos) {
    try { const n = await f(); if (n != null) return n; } catch (_) {}
  }
  return null;
}

async function leerVideos(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`RSS respondió ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<item>[\s\S]*?<\/item>/g)].map(([it]) => {
    const tag = (t) => (it.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`)) || [])[1] || "";
    const link = limpiar(tag("link"));
    const id = (link.match(/\/video\/(\d+)/) || [])[1] || "";
    const thumb = (it.match(/(?:media:content|media:thumbnail|enclosure)[^>]+url="([^"]+)"/)
      || it.match(/<img[^>]+src="([^"]+)"/) || [])[1] || "";
    return {
      id,
      titulo: limpiar(tag("title")) || "Reel de TikTok",
      fecha: limpiar(tag("pubDate")),
      thumb: thumb.replace(/&amp;/g, "&"),
    };
  }).filter((v) => v.id);
}

export default async function handler(req, res) {
  const env = process.env;
  const user = env.TIKTOK_USER || "dany_ush_oficial";
  const debug = new URL(req.url, "http://x").searchParams.has("debug");
  // primero la URL de Vercel (si la hay) y, si no trae reels (por ejemplo, si es el link del perfil y no del feed), el feed por defecto
  const candidatos = [...new Set([env.TIKTOK_RSS_URL, RSS_POR_DEFECTO].filter((u) => u && !/^CAMBIAR/i.test(u)))];

  const segP = leerSeguidores(user); // corre mientras se lee el feed
  let vids = [], url = null; const errores = {};
  for (const u of candidatos) {
    try { vids = await leerVideos(u); } catch (e) { errores[u] = String(e.message || e); vids = []; }
    if (vids.length) { url = u; break; }
    errores[u] = errores[u] || "no tiene reels (¿es el link del feed RSS?)";
  }
  const seg = { status: "fulfilled", value: await segP };
  const out = { videos: vids };
  if (seg.value) out.seguidores = seg.value;

  // visualizaciones de los reels más nuevos (todas a la vez, con tope de tiempo)
  if (out.videos.length) {
    const nuevos = out.videos.slice(0, 12);
    const tope = new Promise((ok) => setTimeout(ok, 3800));
    await Promise.race([
      Promise.all(nuevos.map(async (v) => { const n = await vistasDe(v.id, user); if (n != null) v.vistas = n; })),
      tope,
    ]);
  }

  if (!out.videos.length) out.aviso = "No se pudieron leer los videos del feed RSS de TikTok";
  if (debug) {
    out.debug = {
      rss: url, probados: errores,
      reels: out.videos.length,
      conMiniatura: out.videos.filter((v) => v.thumb).length,
      conVistas: out.videos.filter((v) => v.vistas != null).length,
    };
  }
  // si salió vacío NO se guarda en caché, así se recupera solo en el próximo intento
  res.setHeader("Cache-Control", out.videos.length && !debug ? "s-maxage=300, stale-while-revalidate=600" : "no-store");
  res.status(200).json(out);
}
