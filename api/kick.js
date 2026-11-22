// Vercel serverless: estado en vivo (API oficial de Kick) + streams anteriores (mejor esfuerzo).
// Env: KICK_CLIENT_ID, KICK_CLIENT_SECRET, KICK_SLUG
export default async function handler(req, res) {
  const { KICK_CLIENT_ID: id, KICK_CLIENT_SECRET: secret } = process.env;
  // si KICK_SLUG no está cargado en Vercel (o quedó el texto de ejemplo), usa el canal por defecto
  const slug = process.env.KICK_SLUG && !/^CAMBIAR/i.test(process.env.KICK_SLUG) ? process.env.KICK_SLUG : "danyush";
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
  const out = { live: false, vods: [] };
  if (!slug) return res.status(200).json({ ...out, aviso: "Falta KICK_SLUG" });
  try {
    if (id && secret) {
      const t = await (await fetch("https://id.kick.com/oauth/token", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials" }),
      })).json();
      const c = await (await fetch(`https://api.kick.com/public/v1/channels?slug=${slug}`, {
        headers: { Authorization: `Bearer ${t.access_token}` },
      })).json();
      const ch = c.data?.[0];
      if (ch?.stream?.is_live) Object.assign(out, { live: true, viewers: ch.stream.viewer_count, titulo: ch.stream_title, thumb: ch.stream.thumbnail });
    }
  } catch (_) {}
  try { // streams anteriores: endpoint no oficial, Kick puede bloquearlo (Cloudflare)
    const r = await fetch(`https://kick.com/api/v2/channels/${slug}/videos`, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" } });
    if (r.ok) {
      const v = await r.json();
      out.vods = (Array.isArray(v) ? v : []).map((x) => ({
        id: x.video?.uuid, titulo: x.session_title || "Stream anterior", fecha: x.created_at,
        thumb: x.thumbnail?.src || x.thumbnail,
      })).filter((x) => x.id);
    }
  } catch (_) {}
  try { // seguidores: endpoint no oficial, mejor esfuerzo
    const r = await fetch(`https://kick.com/api/v2/channels/${slug}`, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" } });
    if (r.ok) { const j = await r.json(); out.seguidores = j.followers_count ?? j.followersCount ?? null; }
  } catch (_) {}
  if (!out.seguidores) { // plan B: leer el número desde la página pública del canal
    try {
      const r = await fetch(`https://kick.com/${slug}`, { signal: AbortSignal.timeout(3000), headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en" } });
      if (r.ok) {
        const h = await r.text();
        const m = h.match(/"followers_?[cC]ount"\s*:\s*(\d+)/) || h.match(/([\d.,]+)\s*followers/i);
        if (m) out.seguidores = Number(String(m[1]).replace(/[.,]/g, "")) || null;
      }
    } catch (_) {}
  }
  res.status(200).json(out);
}
