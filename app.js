/* ============ CONFIG: lo único que hay que editar ============ */
const CONFIG = {
  nombre: "DANY-USH",
  logo: "img/logo.png",
  tagline: "Directos, videos y reels en un solo lugar.",
  bio: "Gaming divertido y aventuras en la Tierra Media. El fin es divertirse y pasar un buen rato.",
  email: "",                          // mail para marcas y colaboraciones
  redes: [                            // los que tengan url se muestran
    { nombre: "Instagram", url: "" },
    { nombre: "Discord", url: "https://discord.gg/bghCDSQVdm" },
    { nombre: "WhatsApp", url: "" },
  ],
  donar: { texto: "Invitame un cafecito", url: "" },   // Cafecito / MercadoPago
  kick: "danyush",                    // kick.com/USUARIO
  youtubeCanal: "https://www.youtube.com/@dany-ush6495",
  youtubeId: "UCG7poDcbGtKNc4hAQWBvqpA",   // link del canal
  tiktok: "dany_ushh",
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
const DATA = { kick: [], youtube: [], tiktok: [] };
let filtro = "todo", visibles = 12, proxT = null;
let slides = [], idx = 0, timer = null, pausa = false, KICK = { live: false };
const ETQ = { kick: "Kick", youtube: "YouTube", tiktok: "TikTok" };

document.title = `${CONFIG.nombre} | Directos, videos y reels`;
$("#nombre").textContent = CONFIG.nombre;
$("#tagline").textContent = CONFIG.tagline;
$("#foot-name").textContent = `© ${new Date().getFullYear()} ${CONFIG.nombre}`;
[["#link-kick", kickUrl], ["#link-kick2", kickUrl], ["#f-kick", kickUrl], ["#link-yt", CONFIG.youtubeCanal], ["#btn-yt", CONFIG.youtubeCanal], ["#btn-tt", ttUrl],
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
  const ifr = (s) => `<iframe src="${s}" title="${titulo}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  marco.className = tipo === "kick" ? "marco kickchat" : `marco ${ratio}`;
  marco.innerHTML = ifr(src) + (tipo === "kick" ? `<iframe class="chat" src="https://kick.com/popout/${id}/chat" title="Chat de Kick"></iframe>` : "");
  $("#visor-titulo").textContent = titulo;
  visor.showModal();
}
visor.addEventListener("close", () => (marco.innerHTML = ""));
visor.addEventListener("click", (e) => { if (e.target === visor) visor.close(); });
$("#cerrar").addEventListener("click", () => visor.close());
const abrirKick = () => abrir("kick", CONFIG.kick, `Directo de ${CONFIG.nombre}`);
$("#btn-directo").addEventListener("click", abrirKick);
$("#poster-kick").addEventListener("click", () => {
  const s = slides[idx];
  if (!s || s.tipo === "kick") return abrirKick();
  abrir(s.tipo, s.id, s.titulo);
});

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
  const hora = new Date(t - 3 * 3600e3).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
  proxT = t;
  el.innerHTML = `Próximo directo: ${dia} ${hora} h<small>${cuenta} (hora Argentina)</small><button class="mini" id="btn-cal" type="button">Agregar a mi calendario</button>`;
}
setInterval(pintarProximo, 30000);

/* ---- datos automáticos ---- */
async function cargarKick() {
  let d = { live: false, vods: [] };
  try { d = await (await fetch("/api/kick")).json(); } catch (_) {}
  enVivo = !!d.live; KICK = d;
  pintarProximo();
  DATA.kick = (d.vods || []).map((v) => ({ ...v, tipo: "kickvod" }));
  fila($("#rail-kick"), DATA.kick, "med", "Próximamente"); pintarUltimo();
}
async function cargarYouTube() {
  let d = { videos: [] };
  try { d = await (await fetch("/api/youtube")).json(); } catch (_) {}
  DATA.youtube = (d.videos || []).map((v) => ({ ...v, tipo: "youtube" }));
  if (!DATA.youtube.length) { // sin API: lista oficial de reproducción con todos los videos del canal
    $("#rail-yt").innerHTML = `<iframe class="lista" src="https://www.youtube.com/embed/videoseries?list=UU${CONFIG.youtubeId.slice(2)}" title="Videos de ${CONFIG.nombre}" loading="lazy" allowfullscreen></iframe>`;
    pintarUltimo(); return;
  }
  fila($("#rail-yt"), DATA.youtube, "med", "Próximamente"); pintarUltimo();
}
async function cargarTikTok() {
  let d = { videos: [] };
  try { d = await (await fetch("/api/tiktok")).json(); } catch (_) {}
  const lista = d.videos?.length ? d.videos : CONFIG.tiktokVideos;
  DATA.tiktok = lista.map((v) => ({ ...v, tipo: "tiktok" }));
  $("#rail-tt").hidden = !DATA.tiktok.length;
  fila($("#rail-tt"), DATA.tiktok, "tall", "Próximamente");
  pintarUltimo();

  // Si algún video vino sin miniatura en el RSS, la busca con oEmbed
  DATA.tiktok.forEach(async (v) => {
    if (v.thumb) return;
    try {
      const r = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(`https://www.tiktok.com/@${CONFIG.tiktok}/video/${v.id}`)}`);
      v.thumb = (await r.json()).thumbnail_url;
      if (v.thumb) { fila($("#rail-tt"), DATA.tiktok, "tall", "Próximamente"); pintarUltimo(); }
    } catch (_) {}
  });

  $("#tt-embed").innerHTML = `<blockquote class="tiktok-embed" cite="${ttUrl}" data-unique-id="${CONFIG.tiktok}" data-embed-type="creator" style="max-width:780px;min-width:288px;"><section><a target="_blank" rel="noopener" href="${ttUrl}?refer=creator_embed">@${CONFIG.tiktok}</a></section></blockquote>`;
  const s = document.createElement("script"); s.async = true; s.src = "https://www.tiktok.com/embed.js"; document.body.append(s);
}
pintarProximo(); cargarKick(); cargarYouTube(); cargarTikTok();

/* ---- calendario (.ics) ---- */
$("#proximo").addEventListener("click", (e) => { if (e.target.id === "btn-cal" && proxT) descargarICS(proxT); });
function descargarICS(t) {
  const f = (ms) => new Date(ms).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DANY-USH//ES", "BEGIN:VEVENT", `UID:${t}@dany-ush`,
    `DTSTAMP:${f(Date.now())}`, `DTSTART:${f(t)}`, `DTEND:${f(t + 2 * 3600e3)}`, `SUMMARY:Directo de ${CONFIG.nombre} en Kick`,
    `URL:${kickUrl}`, "BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Arranca el directo", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "directo.ics"; a.click();
}

/* ---- Lo último: todo mezclado con filtros ---- */
const PLAT = { kick: "Kick", youtube: "YouTube", tiktok: "TikTok" };
const chips = $("#chips");
[["todo", "Todo"], ...Object.entries(PLAT)].forEach(([k, n]) => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "chip"; b.textContent = n; b.setAttribute("aria-pressed", k === "todo");
  b.addEventListener("click", () => {
    filtro = k; visibles = 12;
    chips.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
    pintarUltimo();
  });
  chips.append(b);
});
$("#mas").addEventListener("click", () => { visibles += 12; pintarUltimo(); });
function pintarUltimo() {
  const todos = Object.entries(DATA).flatMap(([plat, arr]) => arr.map((v) => ({ ...v, plat })))
    .filter((v) => filtro === "todo" || v.plat === filtro)
    .sort((x, y) => new Date(y.fecha || 0) - new Date(x.fecha || 0));
  const g = $("#grid"); g.innerHTML = "";
  if (!todos.length) { g.innerHTML = '<p class="vacio">Todavía no hay contenido para mostrar.</p>'; $("#mas").hidden = true; return; }
  todos.slice(0, visibles).forEach((v) => {
    const p = poster(v, "med"), t = document.createElement("span");
    t.className = `plat ${v.plat}`; t.textContent = PLAT[v.plat]; p.append(t); g.append(p);
  });
  $("#mas").hidden = todos.length <= visibles;
  armarSlides();
}

/* ---- Comunidad: bio, redes (cápsulas), Discord, donaciones, mail ---- */
$("#bio").textContent = CONFIG.bio;
$("#tt-handle").textContent = `@${CONFIG.tiktok}`;
document.querySelectorAll(".av").forEach((i) => (i.src = document.querySelector(".hero-logo").src));
const COLOR = { Kick: "#53fc18", YouTube: "#ff2d2d", TikTok: "#22d3ee", Discord: "#5865f2", Instagram: "#e1306c", WhatsApp: "#25d366", X: "#ffffff", Twitch: "#9146ff" };
[{ nombre: "Kick", url: kickUrl }, { nombre: "YouTube", url: CONFIG.youtubeCanal }, { nombre: "TikTok", url: ttUrl },
 ...CONFIG.redes.filter((r) => r.url && r.nombre !== "Discord")].forEach((r) => {
  const l = document.createElement("a");
  l.className = "social"; l.href = r.url; l.target = "_blank"; l.rel = "noopener";
  l.style.setProperty("--c", COLOR[r.nombre] || "#8b5cf6");
  l.innerHTML = "<i></i>"; l.append(r.nombre); $("#redes").append(l);
});
const dc = CONFIG.redes.find((r) => r.nombre === "Discord" && r.url);
if (dc) { const c = $("#cap-discord"); c.href = dc.url; c.hidden = false; } else $("#bento").classList.add("sin-discord");
if (CONFIG.email) { $("#btn-mail").href = `mailto:${CONFIG.email}?subject=Colaboración con ${CONFIG.nombre}`; $("#cap-mail").hidden = false; }
if (CONFIG.donar.url) { const d = $("#btn-donar"); d.href = CONFIG.donar.url; d.textContent = CONFIG.donar.texto; $("#cap-donar").hidden = false; }

/* ---- Portada principal rotativa: Kick, YouTube, TikTok ---- */
function armarSlides() {
  const k = { tipo: "kick", id: CONFIG.kick, plat: "kick", vivo: !!KICK.live,
    titulo: KICK.live ? (KICK.titulo || "Directo en Kick") : "Directo en Kick: ahora offline", thumb: KICK.live ? KICK.thumb : "" };
  const listas = [[k], DATA.youtube.slice(0, 3).map((v) => ({ ...v, plat: "youtube" })),
    DATA.tiktok.slice(0, 3).map((v) => ({ ...v, plat: "tiktok" })), DATA.kick.slice(0, 2).map((v) => ({ ...v, plat: "kick" }))];
  slides = [];
  for (let i = 0; i < 3; i++) listas.forEach((l) => l[i] && slides.push(l[i]));
  if (idx >= slides.length) idx = 0;
  const dots = $("#dots") || document.createElement("div");
  dots.innerHTML = "";
  slides.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("aria-label", `Ver: ${s.titulo}`);
    b.addEventListener("click", () => { mostrar(i, true); iniciarRotacion(); });
    dots.append(b);
  });
  dots.hidden = slides.length < 2;
  mostrar(idx, false);
}
function mostrar(i, anim) {
  const s = slides[i]; if (!s) return;
  idx = i;
  const p = $("#poster-kick"), b = $("#badge-kick");
  p.style.backgroundImage = s.thumb ? `url("${s.thumb}")` : "";
  p.classList.toggle("offline", s.tipo === "kick" && !s.vivo);
  b.className = "badge " + (s.vivo ? "live" : s.plat);
  b.textContent = s.vivo ? `EN VIVO${KICK.viewers ? " · " + KICK.viewers : ""}` : ETQ[s.plat] + (s.tipo === "kickvod" ? " · stream" : "");
  $("#titulo-kick").textContent = s.titulo || "";
  document.querySelectorAll("#dots button").forEach((d, n) => d.setAttribute("aria-current", n === i));
  if (anim) { p.classList.remove("entra"); void p.offsetWidth; p.classList.add("entra"); }
}
function iniciarRotacion() {
  clearInterval(timer);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  timer = setInterval(() => { if (slides.length > 1 && !pausa && !visor.open) mostrar((idx + 1) % slides.length, true); }, 5500);
}
const stage = $("#stage") || document.body;
["mouseenter", "focusin"].forEach((e) => stage.addEventListener(e, () => (pausa = true)));
["mouseleave", "focusout"].forEach((e) => stage.addEventListener(e, () => (pausa = false)));
iniciarRotacion();
