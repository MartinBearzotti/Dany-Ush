// Vercel serverless: ¿está en vivo en TikTok? Prueba varios métodos en orden (TikTok a veces bloquea servidores).
// Env (opcionales): TIKTOK_USER, TIKTOK_LIVE_FORCE=1 (fuerza "en vivo" a mano si TikTok bloquea todo)
// Diagnóstico: /api/tiktok-live?debug=1 (muestra qué dijo cada método)
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const HEAD = { "User-Agent": UA, "Accept-Language": "es-AR,es;q=0.9", Referer: "https://www.tiktok.com/" };
const get = (url, accept = "application/json, text/plain, */*") =>
  fetch(url, { headers: { ...HEAD, Accept: accept }, signal: AbortSignal.timeout(3500), redirect: "follow" });

export default async function handler(req, res) {
  const user = process.env.TIKTOK_USER || "dany_ush_oficial";
  const debug = new URL(req.url, "http://x").searchParams.has("debug");
  const out = { live: false };
  const dbg = {};
  res.setHeader("Cache-Control", debug ? "no-store" : "s-maxage=5");

  if (process.env.TIKTOK_LIVE_FORCE === "1") {
    out.live = true; dbg.forzado = true;
  } else {
    // Método 1: API de salas en vivo de la web de TikTok. data.user.status: 2 = en vivo
    const m1 = async () => {
      const r = await get(`https://www.tiktok.com/api-live/user/room/?aid=1988&sourceType=54&uniqueId=${user}`);
      dbg.m1_http = r.status;
      const j = await r.json();
      const st = j?.data?.user?.status, lr = j?.data?.liveRoom;
      dbg.m1_status = st ?? null; dbg.m1_code = j?.statusCode ?? null;
      if (st === 2) return { live: true, titulo: lr?.title || "", viewers: lr?.liveRoomStats?.userCount ?? null };
      return st == null ? undefined : { live: false };
    };
    // Método 2: perfil público para sacar el roomId y preguntar si la sala está viva
    const m2 = async () => {
      const r = await get(`https://www.tiktok.com/@${user}`, "text/html");
      dbg.m2_http = r.status;
      const html = await r.text();
      const j = html.match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_HYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      if (!j) { dbg.m2_sinDatos = true; return undefined; }
      const u = JSON.parse(j[1])?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user;
      const room = u?.roomId;
      dbg.m2_roomId = room || null; dbg.m2_liveStatus = u?.liveRoomStatus ?? null;
      if (!room || room === "0") return { live: false };
      const c = await (await get(`https://webcast.tiktok.com/webcast/room/check_alive/?aid=1988&room_ids=${room}`)).json();
      const vivo = c?.data?.[0]?.alive;
      dbg.m2_alive = vivo ?? null;
      return vivo == null ? undefined : { live: !!vivo };
    };
    // Método 3: la página /live (el original)
    const m3 = async () => {
      const r = await get(`https://www.tiktok.com/@${user}/live`, "text/html");
      dbg.m3_http = r.status;
      const html = await r.text();
      const j = html.match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_HYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      if (!j) { dbg.m3_sinDatos = true; return undefined; }
      const sc = JSON.parse(j[1])?.__DEFAULT_SCOPE__ || {};
      const live = sc["webapp.live-detail"]?.liveRoomInfo || sc["webapp.live-detail"]?.LiveRoomInfo;
      const st = live?.status ?? live?.liveRoomUserInfo?.user?.status;
      dbg.m3_status = st ?? null;
      if (st === 2) return { live: true, titulo: live?.title || "" };
      return st == null ? undefined : { live: false };
    };
    for (const [n, f] of [["m1", m1], ["m2", m2], ["m3", m3]]) {
      try {
        const r = await f();
        if (r) { Object.assign(out, r); dbg.metodo = n; break; }
      } catch (e) { dbg[n + "_error"] = String(e.message || e); }
    }
    if (!dbg.metodo) dbg.metodo = "ninguno respondió (TikTok bloquea la lectura)";
  }
  if (debug) out.debug = dbg;
  res.status(200).json(out);
}
