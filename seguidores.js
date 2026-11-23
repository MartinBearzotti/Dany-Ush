// Vercel serverless: seguidores de cada plataforma, rápido y liviano (sin listas de videos).
// Uso: /api/seguidores?p=kick | youtube | tiktok | discord   (sin "p" devuelve las cuatro)
// Env (todas opcionales): KICK_SLUG, YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID, TIKTOK_USER, DISCORD_TOKEN, DISCORD_GUILD_ID
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const num = (s) => { const n = Number(String(s).replace(/[.,\s]/g, "")); return n > 0 ? n : null; };

// devuelve el primer resultado que no sea null (las consultas corren a la vez)
const primero = (ps) => new Promise((ok) => {
  let n = ps.length;
  ps.forEach((p) => p.then((v) => { if (v) ok(v); else if (--n === 0) ok(null); }, () => { if (--n === 0) ok(null); }));
});

async function kick(slug) {
  const api = async () => {
    const r = await fetch(`https://kick.com/api/v2/channels/${slug}`, { signal: AbortSignal.timeout(2500), headers: { Accept: "application/json", "User-Agent": UA } });
    if (!r.ok) return null;
    const d = await r.json();
    return num(d.followers_count ?? d.followersCount);
  };
  const pagina = async () => {
    const r = await fetch(`https://kick.com/${slug}`, { signal: AbortSignal.timeout(2500), headers: { "User-Agent": UA, "Accept-Language": "en" } });
    if (!r.ok) return null;
    const t = await r.text();
    const m = t.match(/"followers_?[cC]ount"\s*:\s*(\d+)/) || t.match(/([\d.,]+)\s*followers/i);
    return m ? num(m[1]) : null;
  };
  return primero([api(), pagina()]);
}

async function youtube(ch, key) {
  if (!key) return null;
  const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${ch}&key=${key}`, { signal: AbortSignal.timeout(3000) });
  const st = (await r.json()).items?.[0]?.statistics;
  return st && !st.hiddenSubscriberCount ? num(st.subscriberCount) : null;
}

async function tiktok(user) {
  const r = await fetch(`https://www.tiktok.com/@${user}`, { signal: AbortSignal.timeout(2500), headers: { "User-Agent": UA, "Accept-Language": "es-AR,es;q=0.9" } });
  if (!r.ok) return null;
  const html = await r.text();
  const j = html.match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_HYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
  if (j) {
    try {
      const ui = JSON.parse(j[1])?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo;
      const n = num(ui?.statsV2?.followerCount ?? ui?.stats?.followerCount);
      if (n) return n;
    } catch (_) {}
  }
  const m = html.match(/"followerCount":\s*"?(\d+)/);
  return m ? num(m[1]) : null;
}

async function discord(guildId, token) {
  if (!guildId || !token) return null;
  const r = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
    signal: AbortSignal.timeout(3000),
    headers: { Authorization: `Bot ${token}` },
  });
  if (!r.ok) return null;
  const members = await r.json();
  return Array.isArray(members) ? members.filter((m) => !m.user?.bot).length : null;
}

export default async function handler(req, res) {
  const env = process.env;
  const slug = env.KICK_SLUG && !/^CAMBIAR/i.test(env.KICK_SLUG) ? env.KICK_SLUG : "danyush";
  const fuentes = {
    kick: () => kick(slug),
    youtube: () => youtube(env.YOUTUBE_CHANNEL_ID || "UCG7poDcbGtKNc4hAQWBvqpA", env.YOUTUBE_API_KEY),
    tiktok: () => tiktok(env.TIKTOK_USER || "dany_ush_oficial"),
    discord: () => discord(env.DISCORD_GUILD_ID || "1099019810697908244", env.DISCORD_TOKEN),
  };
  const p = new URL(req.url, "http://x").searchParams.get("p");
  const pedidas = fuentes[p] ? [p] : Object.keys(fuentes);
  const out = {};
  await Promise.all(pedidas.map(async (k) => { try { const n = await fuentes[k](); if (n) out[k] = n; } catch (_) {} }));
  // caché corta en el borde: casi todos los visitantes reciben la respuesta al instante
  res.setHeader("Cache-Control", Object.keys(out).length ? "s-maxage=30, stale-while-revalidate=300" : "no-store");
  res.status(200).json(out);
}
