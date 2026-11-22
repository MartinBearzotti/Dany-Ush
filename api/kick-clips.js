// Vercel serverless: clips populares del canal de Kick.
// Prueba primero el endpoint público de la web de Kick y, si falla, la API oficial (si hay credenciales).
// Env: KICK_SLUG (opcional, por defecto "danyush"), KICK_CLIENT_ID y KICK_CLIENT_SECRET (opcionales)
// Diagnóstico: /api/kick-clips?debug=1  (muestra qué método anduvo y por qué falló el otro)
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const HEAD = { Accept: "application/json", "User-Agent": UA, "Accept-Language": "es-AR,es;q=0.9", Referer: "https://kick.com/" };

// cada versión de la API de Kick nombra los campos distinto: se aceptan todas
function normalizar(x) {
  const id = x.id ?? x.clip_id ?? x.uuid;
  if (!id) return null;
  const thumb = x.thumbnail_url || x.thumbnail?.src || x.thumbnail || x.preview_image || x.thumb || "";
  return {
    id: String(id),
    titulo: x.title || x.clip_title || "Clip",
    fecha: x.created_at || x.createdAt || null,
    thumb: typeof thumb === "string" ? thumb : "",
    vistas: x.view_count ?? x.views ?? x.viewCount ?? null,
    duracion: x.duration ?? null,
  };
}

async function webKick(slug, log) {
  const urls = [
    `https://kick.com/api/v2/channels/${slug}/clips?cursor=0&sort=view&time=all`,
    `https://kick.com/api/v2/channels/${slug}/clips?sort=view&time=all`,
    `https://kick.com/api/v2/channels/${slug}/clips`,
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(4000), headers: HEAD });
      if (!r.ok) { log.web = `HTTP ${r.status} (Kick puede estar bloqueando el servidor)`; continue; }
      const j = await r.json();
      const lista = Array.isArray(j) ? j : j.clips || j.data || [];
      const clips = lista.map(normalizar).filter(Boolean);
      if (clips.length) { log.web = "ok"; return clips; }
      log.web = "respondió sin clips";
    } catch (e) { log.web = String(e.message || e); }
  }
  return [];
}

async function apiOficial(slug, log) {
  const { KICK_CLIENT_ID: id, KICK_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) { log.oficial = "sin KICK_CLIENT_ID / KICK_CLIENT_SECRET"; return []; }
  try {
    const t = await (await fetch("https://id.kick.com/oauth/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(4000),
      body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials" }),
    })).json();
    const auth = { Authorization: `Bearer ${t.access_token}`, Accept: "application/json" };
    const c = await (await fetch(`https://api.kick.com/public/v1/channels?slug=${slug}`, { headers: auth, signal: AbortSignal.timeout(4000) })).json();
    const bid = c.data?.[0]?.broadcaster_user_id;
    if (!bid) { log.oficial = "no se encontró el canal"; return []; }
    const r = await fetch(`https://api.kick.com/public/v1/clips?broadcaster_user_id=${bid}&sort=view_count&time=all`, { headers: auth, signal: AbortSignal.timeout(4000) });
    if (!r.ok) { log.oficial = `HTTP ${r.status}`; return []; }
    const j = await r.json();
    const clips = (j.data || []).map(normalizar).filter(Boolean);
    log.oficial = clips.length ? "ok" : "respondió sin clips";
    return clips;
  } catch (e) { log.oficial = String(e.message || e); return []; }
}

export default async function handler(req, res) {
  const slug = process.env.KICK_SLUG && !/^CAMBIAR/i.test(process.env.KICK_SLUG) ? process.env.KICK_SLUG : "danyush";
  const debug = new URL(req.url, "http://x").searchParams.has("debug");
  const log = {};
  let clips = await webKick(slug, log);
  if (!clips.length) clips = await apiOficial(slug, log);
  clips = clips.slice(0, 12);
  // sin resultados NO se guarda en caché: se reintenta en la próxima visita
  res.setHeader("Cache-Control", clips.length && !debug ? "s-maxage=600, stale-while-revalidate=3600" : "no-store");
  res.status(200).json(debug ? { clips, debug: log } : { clips });
}
