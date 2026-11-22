/* ============ CONFIG: lo único que hay que editar ============ */
const CONFIG = {
  nombre: "Daniel Quiroga",
  siglas: "DQ",                       // se muestra si no hay img/logo.png
  tagline: "Directos, videos y reels en un solo lugar.",
  kick: "danielquiroga64",            // kick.com/USUARIO
  youtubeCanal: "https://www.youtube.com/",   // link del canal
  tiktok: "danielquiroga64",
  // Horario fijo de directos (hora Argentina). dia: 0=domingo ... 6=sábado
  horario: [
    { dia: 2, hora: "21:00" },
    { dia: 4, hora: "21:00" },
    { dia: 6, hora: "22:00" },
  ],
  // Reels de TikTok a mano (opcional, complementa el perfil embebido)
  tiktokVideos: [
    // { id: "7301234567890123456", titulo: "Título", thumb: "img/portada1.jpg" },
  ],
};
/* ============================================================ */
const $ = (s) => document.querySelector(s);
const kickUrl = `https://kick.com/${CONFIG.kick}`, ttUrl = `https://www.tiktok.com/@${CONFIG.tiktok}`;
let enVivo = false;

document.title = `${CONFIG.nombre} | Directos, videos y reels`;
$("#nombre").textContent = CONFIG.nombre;
$("#tagline").textContent = CONFIG.tagline;
$("#foot-name").textContent = `© ${new Date().getFullYear()} ${CONFIG.nombre}`;
[["#link-kick", kickUrl], ["#link-kick2", kickUrl], ["#f-kick", kickUrl], ["#link-yt", CONFIG.youtubeCanal],
 ["#f-yt", CONFIG.youtubeCanal], ["#link-tt", ttUrl], ["#f-tt", ttUrl]].forEach(([s, u]) => ($(s).href = u));

/* ---- visor ---- */
const visor = $("#visor"), marco = $("#marco");
const EMBEDS = {
  kick: (id) => [`https://player.kick.com/${id}?autoplay=true`, "v16"],
  kickvod: (id) => [`https://player.kick.com/video/${id}`, "v16"],
  youtube: (id) => [`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`, "v16"],
  tiktok: (id) => [`https://www.tiktok.com/embed/v2/${id}`, "v9"],
};
function abrir(tipo, id, titulo) {
  const [src, ratio] = EMBEDS[tipo](id);
  marco.className = `marco ${ratio}`;
  marco.innerHTML = `<iframe src="${src}" title="${titulo}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  $("#visor-titulo").textContent = titulo;
  visor.showModal();
}
visor.addEventListener("close", () => (marco.innerHTML = ""));
visor.addEventListener("click", (e) => { if (e.target === visor) visor.close(); });
$("#cerrar").addEventListener("click", () => visor.close());
const abrirKick = () => abrir("kick", CONFIG.kick, `Directo de ${CONFIG.nombre}`);
$("#btn-directo").addEventListener("click", abrirKick);
$("#poster-kick").addEventListener("click", abrirKick);

/* ---- portadas ---- */
const fmt = (f) => (f ? new Date(f).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) : "");
function poster({ tipo, id, titulo, thumb, fecha }, clase) {
  const b = document.createElement("button");
  b.type = "button"; b.className = `poster ${clase}`;
  b.setAttribute("aria-label", `Reproducir: ${titulo}`);
  if (thumb) b.style.backgroundImage = `url("${thumb}")`;
  b.innerHTML = `<span class="play"></span><span class="poster-title"></span>${fecha ? `<span class="fecha">${fmt(fecha)}</span>` : ""}`;
  b.querySelector(".poster-title").textContent = titulo;
  b.addEventListener("click", () => abrir(tipo, id, titulo));
  return b;
}
function fila(rail, items, clase, vacio) {
  rail.innerHTML = "";
  if (!items.length) {
    for (let i = 0; i < 4; i++) { const g = document.createElement("div"); g.className = `poster ${clase} ghost`; g.innerHTML = `<span class="poster-title">${vacio}</span>`; rail.append(g); }
    return;
  }
  items.forEach((v) => rail.append(poster(v, clase)));
}

/* ---- próximo directo (hora Argentina, UTC-3 fija) ---- */
function proximoDirecto() {
  const ahora = Date.now(), OFF = 3 * 3600e3;
  let mejor = null;
  for (const h of CONFIG.horario) {
    const [hh, mm] = h.hora.split(":").map(Number);
    const base = new Date(ahora - OFF);
    for (let d = 0; d < 8; d++) {
      const x = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + d, hh, mm));
      const t = x.getTime() + OFF;
      if (x.getUTCDay() === h.dia && t > ahora && (!mejor || t < mejor)) mejor = t;
    }
  }
  return mejor;
}
function pintarProximo() {
  const el = $("#proximo");
  if (enVivo) { el.className = "proximo en-vivo"; el.innerHTML = "Está en vivo ahora<small>Tocá \"Ver el directo\"</small>"; return; }
  el.className = "proximo";
  const t = proximoDirecto();
  if (!t) { el.hidden = true; return; }
  const m = Math.max(0, Math.floor((t - Date.now()) / 60000));
  const cuenta = m >= 1440 ? `en ${Math.floor(m / 1440)} d ${Math.floor((m % 1440) / 60)} h` : m >= 60 ? `en ${Math.floor(m / 60)} h ${m % 60} min` : `en ${m} min`;
  const dia = new Date(t - 3 * 3600e3).toLocaleDateString("es-AR", { weekday: "long", timeZone: "UTC" });
  const hora = new Date(t - 3 * 3600e3).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  el.innerHTML = `Próximo directo: ${dia} ${hora} h<small>${cuenta} (hora Argentina)</small>`;
}
setInterval(pintarProximo, 30000);

/* ---- datos automáticos ---- */
async function cargarKick() {
  let d = { live: false, vods: [] };
  try { d = await (await fetch("/api/kick")).json(); } catch (_) {}
  enVivo = !!d.live;
  const badge = $("#badge-kick");
  if (enVivo) {
    badge.className = "badge live"; badge.textContent = `EN VIVO${d.viewers ? " · " + d.viewers : ""}`;
    $("#titulo-kick").textContent = d.titulo || "Directo en Kick";
    if (d.thumb) $("#poster-kick").style.backgroundImage = `url("${d.thumb}")`;
  } else { $("#poster-kick").classList.add("offline"); $("#titulo-kick").textContent = "Directo en Kick: ahora offline"; }
  pintarProximo();
  fila($("#rail-kick"), (d.vods || []).map((v) => ({ ...v, tipo: "kickvod" })), "med", "Próximamente");
}
async function cargarYouTube() {
  let d = { videos: [] };
  try { d = await (await fetch("/api/youtube")).json(); } catch (_) {}
  fila($("#rail-yt"), (d.videos || []).map((v) => ({ ...v, tipo: "youtube" })), "med", "Próximamente");
}
function cargarTikTok() {
  fila($("#rail-tt"), CONFIG.tiktokVideos.map((v) => ({ ...v, tipo: "tiktok" })), "tall", "Próximamente");
  if (!CONFIG.tiktokVideos.length) $("#rail-tt").hidden = true;
  $("#tt-embed").innerHTML = `<blockquote class="tiktok-embed" cite="${ttUrl}" data-unique-id="${CONFIG.tiktok}" data-embed-type="creator" style="max-width:780px;min-width:288px;"><section><a target="_blank" rel="noopener" href="${ttUrl}?refer=creator_embed">@${CONFIG.tiktok}</a></section></blockquote>`;
  const s = document.createElement("script"); s.async = true; s.src = "https://www.tiktok.com/embed.js"; document.body.append(s);
}
pintarProximo(); cargarKick(); cargarYouTube(); cargarTikTok();
