// Vercel serverless: lista TODOS los videos del canal + detecta si está en vivo.
// Env: YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID (empieza con UC...)
export default async function handler(req, res) {
  const key = process.env.YOUTUBE_API_KEY, ch = process.env.YOUTUBE_CHANNEL_ID;
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  if (!key || !ch) return res.status(200).json({ videos: [], live: null, aviso: "Faltan variables de entorno" });
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
    res.status(200).json({ videos, live });
  } catch (e) { res.status(200).json({ videos: [], live: null, aviso: "Error YouTube" }); }
}
