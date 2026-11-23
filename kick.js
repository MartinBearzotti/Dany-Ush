// Vercel serverless: estado en vivo (API oficial de Kick) + streams anteriores + seguidores (mejor esfuerzo).
// Env: KICK_CLIENT_ID, KICK_CLIENT_SECRET, KICK_SLUG
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const HEAD = { Accept: "application/json", "User-Agent": UA, "Accept-Language": "es-AR,es;q=0.9", Referer: "https://kick.com/" };
const get = (url, ms = 4000) => fetch(url, { headers: HEAD, signal: AbortSignal.timeout(ms) });

// Kick manda la fecha como "2026-11-18 22:43:19" (UTC, sin zona): se pasa a ISO con Z para que Safari la lea y no se corra de día
const iso = (f) => (f && /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(f) ? f.replace(" ", "T") + "Z" : f);

export default async function handler(req, res) {
  const { KICK_CLIENT_ID: id, KICK_CLIENT_SECRET: secret } = process.env;
  const slug = process.env.KICK_SLUG && !/^CAMBIAR/i.test(process.env.KICK_SLUG) ? process.env.KICK_SLUG : "danyush";
  const soloLive = new URL(req.url, "http://x").searchParams.has("live"); // ?live=1: respuesta rápida, solo el estado
  res.setHeader("Cache-Control", soloLive ? "s-maxage=10, stale-while-revalidate=20" : "s-maxage=30, stale-while-revalidate=60");
  const out = { live: false, vods: [] };

  // las tres consultas corren a la vez (antes eran una atrás de otra y podían colgar la función)
  const enVivo = async () => {
    if (!id || !secret) return;
    const t = await (await fetch("https://id.kick.com/oauth/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, signal: AbortSignal.timeout(4000),
      body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials" }),
    })).json();
    const c = await (await fetch(`https://api.kick.com/public/v1/channels?slug=${slug}`, {
      headers: { Authorization: `Bearer ${t.access_token}` }, signal: AbortSignal.timeout(4000),
    })).json();
    const ch = c.data?.[0];
    if (ch?.stream?.is_live) Object.assign(out, { live: true, viewers: ch.stream.viewer_count, titulo: ch.stream_title, thumb: ch.stream.thumbnail });
  };
  const vods = async () => { // endpoint no oficial: Kick puede bloquearlo (Cloudflare)
    const r = await get(`https://kick.com/api/v2/channels/${slug}/videos`);
    if (!r.ok) return;
    const v = await r.json();
    out.vods = (Array.isArray(v) ? v : v.data || []).map((x) => ({
      id: x.video?.uuid || x.uuid, titulo: x.session_title || x.title || "Stream anterior", fecha: iso(x.start_time || x.created_at),
      thumb: x.thumbnail?.src || x.thumbnail, vistas: x.views ?? x.video?.views ?? null,
      video: [x.source, x.video?.source].find((u) => typeof u === "string" && u.startsWith("http")) || "", // link directo del video (m3u8), si Kick lo entrega
    })).filter((x) => x.id);
  };
  const seguidores = async () => {
    const r = await get(`https://kick.com/api/v2/channels/${slug}`);
    if (r.ok) { const j = await r.json(); out.seguidores = j.followers_count ?? j.followersCount ?? null; }
  };
  if (soloLive) { await Promise.allSettled([enVivo()]); return res.status(200).json(out); }
  await Promise.allSettled([enVivo(), vods(), seguidores()]);
  res.status(200).json(out);
}
