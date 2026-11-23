// Vercel serverless: ¿está en vivo en TikTok? (mejor esfuerzo: TikTok a veces bloquea servidores)
// Env (opcionales): TIKTOK_USER, TIKTOK_LIVE_FORCE=1 (para forzar "en vivo" a mano si TikTok bloquea la lectura)
// Diagnóstico: /api/tiktok-live?debug=1
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const HEAD = { "User-Agent": UA, "Accept-Language": "es-AR,es;q=0.9", Accept: "text/html,application/xhtml+xml" };

export default async function handler(req, res) {
  const user = process.env.TIKTOK_USER || "dany_ush_oficial";
  const debug = new URL(req.url, "http://x").searchParams.has("debug");
  const out = { live: false };
  const dbg = {};
  res.setHeader("Cache-Control", debug ? "no-store" : "s-maxage=5");

  if (process.env.TIKTOK_LIVE_FORCE === "1") { out.live = true; dbg.forzado = true; }
  else {
    try {
      const r = await fetch(`https://www.tiktok.com/@${user}/live`, { headers: HEAD, signal: AbortSignal.timeout(4000), redirect: "follow" });
      dbg.status = r.status;
      const html = await r.text();
      const j = html.match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_HYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      if (j) {
        const sc = JSON.parse(j[1])?.__DEFAULT_SCOPE__ || {};
        const live = sc["webapp.live-detail"]?.liveRoomInfo || sc["webapp.live-detail"]?.LiveRoomInfo;
        const ui = sc["webapp.user-detail"]?.userInfo;
        const status = live?.status ?? live?.liveRoomUserInfo?.user?.status ?? ui?.user?.liveRoomStatus;
        const roomId = ui?.user?.roomId || live?.roomId || live?.liveRoomUserInfo?.user?.roomId;
        dbg.status_live = status; dbg.roomId = roomId || null;
        // status 2 = en vivo; 4 = terminó
        if (status === 2) { // solo status 2 = en vivo (un roomId viejo no alcanza: queda guardado después del directo)
          out.live = true;
          out.titulo = live?.title || live?.liveRoomUserInfo?.liveRoom?.title || "";
          out.viewers = live?.liveRoomStats?.userCount ?? live?.liveRoomUserInfo?.liveRoom?.liveRoomStats?.userCount ?? null;
        }
      } else dbg.sinDatos = true;
    } catch (e) { dbg.error = String(e.message || e); }
  }
  if (debug) out.debug = dbg;
  res.status(200).json(out);
}
