// Vercel serverless: lee un feed RSS de TikTok (ej. RSS.app, FetchRSS)
// Env: TIKTOK_RSS_URL
export default async function handler(req, res) {
  const url = process.env.TIKTOK_RSS_URL, user = process.env.TIKTOK_USER || "dany_ushh";
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  const extra = {};
  try { // seguidores: se lee del perfil público (mejor esfuerzo, TikTok puede bloquearlo)
    const r = await fetch(`https://www.tiktok.com/@${user}`, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", "Accept-Language": "es-AR,es;q=0.9" } });
    if (r.ok) { const m = (await r.text()).match(/"followerCount":\s*(\d+)/); if (m) extra.seguidores = Number(m[1]); }
  } catch (_) {}
  if (!url) return res.status(200).json({ videos: [], ...extra, aviso: "Falta TIKTOK_RSS_URL" });

  try {
    const xml = await (await fetch(url)).text();
    const limpiar = (s) => s
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .trim();

    const videos = [...xml.matchAll(/<item>[\s\S]*?<\/item>/g)].map(([it]) => {
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

    res.status(200).json({ videos, ...extra });
  } catch (_) {
    res.status(200).json({ videos: [], ...extra, aviso: "Error al leer RSS de TikTok" });
  }
}
