// Vercel serverless: lista TODOS los videos del canal + detecta si está en vivo.
// Env: YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID (empieza con UC...)
export default async function handler(req, res) {
  const key = process.env.YOUTUBE_API_KEY, ch = process.env.YOUTUBE_CHANNEL_ID || "UCG7poDcbGtKNc4hAQWBvqpA";
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  if (!key) { // sin clave: feed RSS público (últimos ~15 videos)
    try {
      const xml = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch}`)).text();
      const dec = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      const videos = [...xml.matchAll(/<entry>[\s\S]*?<\/entry>/g)].map(([e]) => {
        const g = (t) => (e.match(new RegExp(`<${t}>([^<]*)</${t}>`)) || [])[1] || "";
        const id = g("yt:videoId");
        return { id, titulo: dec(g("title")), fecha: g("published"), thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
      }).filter((v) => v.id);
      return res.status(200).json({ videos, live: null });
    } catch (_) { return res.status(200).json({ videos: [], live: null }); }
  }
  try {
    const uploads = "UU" + ch.slice(2);
    let videos = [], token = "";
    for (let i = 0; i < 6; i++) { // hasta 300 videos
      const u = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploads}&key=${key}${token ? "&pageToken=" + token : ""}`;
      const d = await (await fetch(u)).json();
      (d.items || []).forEach((it) => videos.push({
        id: it.snippet.resourceId.videoId, titulo: it.snippet.title, fecha: it.snippet.publishedAt,
        thumb: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.medium?.url,
      }));
      token = d.nextPageToken; if (!token) break;
    }
    // ¿alguno está en vivo ahora? (mira los 10 más recientes, cuesta poca cuota)
    let live = null;
    const ids = videos.slice(0, 10).map((v) => v.id).join(",");
    if (ids) {
      const d = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${ids}&key=${key}`)).json();
      const l = (d.items || []).find((x) => x.liveStreamingDetails?.actualStartTime && !x.liveStreamingDetails?.actualEndTime);
      if (l) live = l.id;
    }
    let subs = null; // suscriptores (si el canal no los oculta)
    try {
      const s = await (await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${ch}&key=${key}`)).json();
      const st = s.items?.[0]?.statistics;
      if (st && !st.hiddenSubscriberCount) subs = Number(st.subscriberCount);
    } catch (_) {}
    res.status(200).json({ videos, live, subs });
  } catch (e) { res.status(200).json({ videos: [], live: null, aviso: "Error YouTube" }); }
}
