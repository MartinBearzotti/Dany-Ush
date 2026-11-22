// Vercel serverless: devuelve la miniatura de un reel de TikTok (oEmbed publico), asi no hay que cargarla a mano.
// Uso: /api/tiktok-thumb?id=NUMERO_DEL_VIDEO   Env opcional: TIKTOK_USER
export default async function handler(req, res) {
  const id = String(req.query.id || "").replace(/\D/g, ""), user = process.env.TIKTOK_USER || "dany_ush_oficial";
  if (!id) return res.status(400).json({ thumb: null });
  try {
    const url = `https://www.tiktok.com/@${user}/video/${id}`;
    const r = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(5000) });
    const j = await r.json();
    res.setHeader("Cache-Control", j.thumbnail_url ? "s-maxage=3600, stale-while-revalidate=86400" : "no-store");
    return res.status(200).json({ thumb: j.thumbnail_url || null });
  } catch (_) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ thumb: null });
  }
}
