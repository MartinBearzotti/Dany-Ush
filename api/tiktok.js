// Vercel serverless: lee un feed RSS de TikTok (ej. RSS.app, FetchRSS)
// Env: TIKTOK_RSS_URL, TIKTOK_USER (opcional)
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const limpiar = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .trim();

// seguidores: se lee del perfil público (mejor esfuerzo, TikTok suele bloquearlo). Máx. 2,5 s
async function leerSeguidores(user) {
  try {
    const r = await fetch(`https://www.tiktok.com/@${user}`, {
      signal: AbortSignal.timeout(2500),
      headers: { "User-Agent": UA, "Accept-Language": "es-AR,es;q=0.9" },
    });
    if (!r.ok) return null;
    const m = (await r.text()).match(/"followerCount":\s*(\d+)/);
    return m ? Number(m[1]) : null;
  } catch (_) { return null; }
}

async function leerVideos(url) {
  const xml = await (await fetch(url, { signal: AbortSignal.timeout(6000) })).text();
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
  const url = process.env.TIKTOK_RSS_URL, user = process.env.TIKTOK_USER || "dany_ush_oficial";
  if (!url) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ videos: [], aviso: "Falta TIKTOK_RSS_URL" });
  }
  // las dos lecturas van en paralelo: no suman espera
  const [seg, vids] = await Promise.allSettled([leerSeguidores(user), leerVideos(url)]);
  const out = { videos: vids.status === "fulfilled" ? vids.value : [] };
  if (seg.status === "fulfilled" && seg.value) out.seguidores = seg.value;
  if (!out.videos.length) out.aviso = "No se pudieron leer los videos del feed RSS de TikTok";
  // si salió vacío NO se guarda en caché, así se recupera solo en el próximo intento
  res.setHeader("Cache-Control", out.videos.length ? "s-maxage=300, stale-while-revalidate=600" : "no-store");
  res.status(200).json(out);
}
