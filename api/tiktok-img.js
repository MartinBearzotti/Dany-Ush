// Vercel serverless: entrega una miniatura de TikTok desde tu propio dominio.
// TikTok a veces bloquea las imágenes cuando las pide otra página (hotlink); desde acá se piden sin referencia.
// Uso: /api/tiktok-img?u=URL_DE_LA_IMAGEN   (solo acepta imágenes de los servidores de TikTok)
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const PERMITIDO = /^https:\/\/[a-z0-9.-]+\.(tiktokcdn(-[a-z]+)?|tiktokv|ttwstatic)\.com\//i;

export default async function handler(req, res) {
  const u = new URL(req.url, "http://x").searchParams.get("u") || "";
  if (!PERMITIDO.test(u)) return res.status(400).end("url no permitida");
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(6000), headers: { "User-Agent": UA } });
    if (!r.ok) return res.status(502).end("TikTok respondió " + r.status);
    const tipo = r.headers.get("content-type") || "image/jpeg";
    if (!tipo.startsWith("image/")) return res.status(502).end("no es una imagen");
    res.setHeader("Content-Type", tipo);
    res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
    res.status(200).send(Buffer.from(await r.arrayBuffer()));
  } catch (_) {
    res.status(502).end("no se pudo leer la imagen");
  }
}
