/* ============ CONFIG: lo único que hay que editar ============ */

const CONFIG = {
  nombre: "DANY-USH",
  logo: "/logo-v2.png",
  tagline: "Directos, videos y reels en un solo lugar.",
  bio: "Gaming divertido: Valorant, F1, Among Us y mucho más. El fin es divertirse y pasar un buen rato.",
  email: "", // mail para marcas y colaboraciones
  redes: [ // los que tengan url se muestran
    { nombre: "Instagram", url: "" },
    { nombre: "Facebook", url: "" },
    { nombre: "X", url: "" }, // Twitter
    { nombre: "Discord", url: "https://discord.gg/bghCDSQVdm" },
    { nombre: "WhatsApp", url: "" },
  ],
  donar: { mp: "", alias: "", paypal: "" }, // mp: link de cobro de Mercado Pago (https://link.mercadopago.com.ar/...), alias: alias o CVU para transferir, paypal: link de PayPal (https://paypal.me/TUUSUARIO)
  kick: "danyush", // kick.com/USUARIO
  youtubeCanal: "https://www.youtube.com/@dany-ush6495",
  youtubeId: "UCG7poDcbGtKNc4hAQWBvqpA", // link del canal
  tiktok: "dany_ush_oficial",
  // Horario fijo de directos (hora Argentina). dia: 0=domingo ... 6=sábado
  horario: [
    { dia: 2, hora: "21:00" },
    { dia: 4, hora: "21:00" },
    { dia: 6, hora: "22:00" },
  ],
  bannerOffline: "/og-v2.png", // imagen fija cuando Kick está offline
  // Streams anteriores de Kick a mano (se suman a los automáticos). id = el código largo del video: kick.com/USUARIO/videos/ESTE-CODIGO
  kickVods: [
    // { id: "CODIGO-DEL-VIDEO", titulo: "Nombre del stream", fecha: "2026-11-18T22:00:00Z", thumb: "" },
  ],
  // Clips destacados a mano. tipo: "youtube" | "kickvod" | "tiktok". thumb es opcional (en YouTube se arma sola)
  clips: [
    // { tipo: "youtube", id: "ID_DEL_VIDEO", titulo: "Mi mejor momento" },
  ],
  // Para avisos por mail: URL de un formulario (Formspree, Getform, etc.). Vacío = se ofrece Discord
  avisosUrl: "",
  // Si el nombre del Discord se ve raro, escribí acá el que quieras mostrar
  discordNombre: "",
  // Números a mano por si alguna plataforma no entrega el dato sola (0 = no mostrar). Los automáticos tienen prioridad.
  seguidores: { kick: 0, youtube: 0, tiktok: 11148, discord: 63 },
  seguidoresPiso: ["tiktok"], // piso: TikTok nunca muestra menos que el número de arriba (subilo a mano cada tanto). Sacá "tiktok" de la lista para que sea 100% automático.
  tiktokVideos: [ // reels a mano: se usan SOLO si la API de TikTok no trae nada
    { id: "7710750350315097345", titulo: "no entiendo nada!!!... #directos #stream #backseatchampions", fecha: "2026-11-21T22:11:13Z" },
    { id: "7710417426558586118", titulo: "nunca confias en el del clima! #backseatchampions #F1", fecha: "2026-11-21T00:37:27Z" },
    { id: "7710411302316887348", titulo: "#backseatchampions #carreras #F1 #game", fecha: "2026-11-21T00:13:49Z" },
    { id: "7709643648996019457", titulo: "estamos probando #backseatchampions en directo!!!", fecha: "2026-11-18T22:36:55Z" },
    { id: "7709604276275875073", titulo: "UN JUEGO DE F1 DIFERENTE! #backseatchampions", fecha: "2026-11-18T20:03:54Z" },
    { id: "7709603833768381717", titulo: "Carrera: nos sacan de pista y perdimos cuatro posiciones", fecha: "2026-11-18T20:00:11Z" },
    { id: "7709596238836010292", titulo: "Pinchazo en plena carrera y llegamos sin parar en pits", fecha: "2026-11-18T19:30:59Z" },
    { id: "7709544698951519494", titulo: "PONETE EN LOS ZAPATOS DE LOS INGENIEROS DE CARRERA!!", fecha: "2026-11-18T16:10:33Z" },
    { id: "7706271311470824724", titulo: "tengo miedo jajaja #airsoft #cqb #ushuaia", fecha: "2026-11-09T20:28:38Z" },
    { id: "7678547038287580433", titulo: "juguemos para divertirnos!!! #valorant #valorantlatam", fecha: "2026-08-27T03:24:13Z" },
    { id: "7678542899981700368", titulo: "soy super realista. #valorant #valorantlatam", fecha: "2026-08-27T03:08:42Z" },
    { id: "7678531745469304080", titulo: "nosotros gobernamos el juego #valorant #valorantlatam", fecha: "2026-08-27T02:25:12Z" },
  ],
};

/* ============================================================ */

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const kickUrl = `https://kick.com/${CONFIG.kick}`, ttUrl = `https://www.tiktok.com/@${CONFIG.tiktok}`;
let enVivo = false;
const DATA = { kick: [], youtube: [], tiktok: [] };
let proxT = null;
let slides = [], idx = 0, timer = null, pausa = false, KICK = { live: false };
const ETQ = { kick: "Kick", youtube: "YouTube", tiktok: "TikTok" };

document.title = `${CONFIG.nombre} | Directos, videos y reels`;
$("#nombre").textContent = CONFIG.nombre;
$("#tagline").textContent = CONFIG.tagline;
$("#foot-name").textContent = `© ${new Date().getFullYear()} ${CONFIG.nombre}`;

[
  ["#link-kick2", kickUrl], ["#btn-kick", kickUrl], ["#f-kick", kickUrl],
  ["#link-yt", CONFIG.youtubeCanal], ["#btn-yt", CONFIG.youtubeCanal], ["#f-yt", CONFIG.youtubeCanal],
  ["#link-tt", ttUrl], ["#btn-tt", ttUrl], ["#f-tt", ttUrl]
].forEach(([s, u]) => { const el = $(s); if (el) el.href = u; });

/* ---- visor ---- */
const visor = $("#visor"), marco = $("#marco");
const EMBEDS = {
  kick: (id) => [`https://player.kick.com/${id}?autoplay=true`, "v16"],
  kickvod: (id) => [`https://player.kick.com/video/${id}`, "v16"],
  youtube: (id) => [`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`, "v16"],
  tiktok: (id) => [`https://www.tiktok.com/embed/v2/${id}`, "v9"],
};
let linkActual = kickUrl;
const LINKS = {
  kick: (id) => `https://kick.com/${id}`,
  kickvod: (id) => `https://kick.com/${CONFIG.kick}/videos/${id}`,
  kickclip: (id) => `https://kick.com/${CONFIG.kick}/clips/${id}`,
  youtube: (id) => `https://youtu.be/${id}`,
  tiktok: (id) => `https://www.tiktok.com/@${CONFIG.tiktok}/video/${id}`,
};

$("#copiar-link").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(linkActual);
    const b = $("#copiar-link"); b.textContent = "¡Copiado!";
    setTimeout(() => (b.textContent = "Copiar link"), 1800);
  } catch (_) {}
});

// Kick y TikTok no se pueden reproducir dentro de la página: se muestra la portada con el título y un botón al medio para verlo en la app
function tarjeta(tipo, thumb) {
  const red = tipo === "tiktok" ? "TikTok" : "Kick";
  marco.className = `marco tarjeta ${tipo === "tiktok" ? "vert" : "horiz"} ${tipo === "tiktok" ? "tt" : "kk"}`;
  marco.innerHTML = `<div class="tj-fondo"></div><img class="tj-img" alt="" referrerpolicy="no-referrer" hidden><a class="btn primary tj-btn" href="${esc(linkActual)}" target="_blank" rel="noopener">Ver en ${red}</a>`;
  const img = marco.querySelector(".tj-img"), fondo = marco.querySelector(".tj-fondo");
  if (!thumb) return;
  const ok = (u) => { img.src = u; img.hidden = false; fondo.style.backgroundImage = `url("${u}")`; };
  const probar = (u, siFalla) => { const t = new Image(); t.referrerPolicy = "no-referrer"; t.onload = () => ok(u); t.onerror = siFalla; t.src = u; };
  probar(thumb, () => { if (tipo === "tiktok") probar(`/api/tiktok-img?u=${encodeURIComponent(thumb)}`, () => {}); }); // si TikTok bloquea la imagen, se pide por /api/tiktok-img
}

function abrir(tipo, id, titulo, video, thumb) {
  linkActual = LINKS[tipo] ? LINKS[tipo](id) : kickUrl;
  const fuera = $("#abrir-fuera"); fuera.href = linkActual; fuera.textContent = `Ver en ${tipo === "youtube" ? "YouTube" : tipo === "tiktok" ? "TikTok" : "Kick"}`;
  $("#visor-titulo").textContent = titulo;
  if (tipo === "kickclip" || tipo === "kickvod" || tipo === "tiktok") {
    fuera.style.display = "none"; // el botón del medio ya hace eso
    tarjeta(tipo, thumb);
    visor.showModal();
    return;
  }
  fuera.style.display = ""; // botón de salida: si el reproductor incrustado falla (por ejemplo con bloqueador de anuncios), se abre en la red original
  const [src, ratio] = EMBEDS[tipo](id);
  const ifr = (s) => `<iframe src="${s}" title="${esc(titulo)}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  marco.className = tipo === "kick" ? "marco kickchat" : `marco ${ratio}`;
  marco.innerHTML = ifr(src) + (tipo === "kick" ? `<iframe class="chat" src="https://kick.com/popout/${id}/chat" title="Chat de Kick"></iframe>` : "");
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
  abrir(s.tipo, s.id, s.titulo, s.video, s.thumb);
});

/* ---- portadas ---- */
const fmt = (f) => (f ? new Date(f).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) : "");

function chipTxt(fecha, vistas) { // "18 nov · 3,4 mil vistas" (o solo la fecha / solo las vistas)
  const nv = vistas != null ? new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(vistas) + " vistas" : "";
  const t = nv && fecha ? `${new Date(fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short" })} · ${nv}` : nv || (fecha ? fmt(fecha) : "");
  return t ? `<span class="fecha">${t}</span>` : "";
}

function poster({ tipo, id, titulo, thumb, fecha, vistas, video }, clase) {
  const b = document.createElement("button");
  b.type = "button"; b.className = `poster ${clase}`;
  b.setAttribute("aria-label", `Reproducir: ${titulo}`);
  if (thumb) {
    b.style.backgroundImage = `url("${thumb}")`;
    if (tipo === "tiktok") { // si TikTok bloquea la imagen, se pide a través de /api/tiktok-img; si tampoco, portada de respaldo
      const sinThumb = () => { b.style.backgroundImage = ""; b.classList.add("sin-thumb"); };
      const im = new Image();
      im.onerror = () => {
        const prox = `/api/tiktok-img?u=${encodeURIComponent(thumb)}`, im2 = new Image();
        im2.onload = () => { b.style.backgroundImage = `url("${prox}")`; };
        im2.onerror = sinThumb; im2.src = prox;
      };
      im.src = thumb;
    }
  } else if (tipo === "tiktok") b.classList.add("sin-thumb");
  b.innerHTML = `<span class="play"></span><span class="poster-title"></span>${chipTxt(fecha, vistas)}`;
  b.querySelector(".poster-title").textContent = titulo;
  b.addEventListener("click", () => abrir(tipo, id, titulo, video, thumb));
  return b;
}

function fila(rail, items, clase, vacio) {
  if (!rail) return;
  rail.innerHTML = "";
  if (!items.length) {
    for (let i = 0; i < 6; i++) {
      const g = document.createElement("div");
      g.className = `poster ${clase} ghost`;
      g.innerHTML = `<span class="poster-title">${vacio}</span>`;
      rail.append(g);
    }
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
  if (enVivo) { el.className = "proximo en-vivo"; el.innerHTML = 'Está en vivo ahora, ven y sumate la directo<small>Tocá "Ver el directo"</small>'; return; }
  el.className = "proximo"; el.hidden = false;
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
  pintarProximo(); pintarLive();
  if (d.seguidores) { setSeg("kick", d.seguidores); }
  const vistos = new Set(), todos = [...(CONFIG.kickVods || []), ...(d.vods || [])];
  DATA.kick = todos.filter((v) => v.id && !vistos.has(v.id) && vistos.add(v.id)).map((v) => ({ ...v, tipo: "kickvod" }));
  fila($("#rail-kick"), DATA.kick.slice(0, 12), "med", "Próximamente");
  armarSlides();
}

async function cargarYouTube() {
  let d = { videos: [] };
  try { d = await (await fetch("/api/youtube")).json(); } catch (_) {}
  DATA.youtube = (d.videos || []).map((v) => ({ ...v, tipo: "youtube" }));
  if (d.subs) { setSeg("youtube", d.subs); }
  if (!DATA.youtube.length) { // sin API: lista oficial de reproducción con todos los videos del canal
    $("#rail-yt").innerHTML = `<iframe class="lista" src="https://www.youtube.com/embed/videoseries?list=UU${CONFIG.youtubeId.slice(2)}" title="Videos de ${CONFIG.nombre}" loading="lazy" allowfullscreen></iframe>`;
    armarSlides(); return;
  }
  fila($("#rail-yt"), DATA.youtube, "med", "Próximamente");
  armarSlides();
}

async function cargarTikTok() {
  let d = { videos: [] };
  try { d = await (await fetch("/api/tiktok")).json(); } catch (_) {}
  if (d.seguidores) setSeg("tiktok", d.seguidores);
  const lista = d.videos?.length ? d.videos : CONFIG.tiktokVideos;
  DATA.tiktok = lista.map((v) => ({ ...v, tipo: "tiktok" }));
  $("#rail-tt").hidden = !DATA.tiktok.length;
  fila($("#rail-tt"), DATA.tiktok, "tall", "Próximamente");
  armarSlides();

  // Si algún video vino sin miniatura en el RSS, la busca con oEmbed
  DATA.tiktok.forEach(async (v) => {
    if (v.thumb) return;
    try {
      const r = await fetch(`/api/tiktok-thumb?id=${v.id}`);
      v.thumb = (await r.json()).thumb;
      if (v.thumb) { fila($("#rail-tt"), DATA.tiktok, "tall", "Próximamente"); armarSlides(); }
    } catch (_) {}
  });
}

pintarProximo(); cargarKick(); cargarYouTube(); cargarTikTok();

/* ---- calendario (.ics) ---- */
$("#proximo").addEventListener("click", (e) => { if (e.target.id === "btn-cal" && proxT) descargarICS(proxT); });
function descargarICS(t) {
  const f = (ms) => new Date(ms).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DANY-USH//ES", "BEGIN:VEVENT", `UID:${t}@dany-ush`,
    `DTSTAMP:${f(Date.now())}`, `DTSTART:${f(t)}`, `DTEND:${f(t + 2 * 3600e3)}`, `SUMMARY:Directo de ${CONFIG.nombre} en Kick`,
    `URL:${kickUrl}`, "BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Arranca el directo", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "directo.ics"; a.click();
}

/* ---- Comunidad: bio, redes (cápsulas), Discord, donaciones, mail ---- */
$("#bio").textContent = CONFIG.bio;
$("#tt-handle").textContent = `@${CONFIG.tiktok}`;
document.querySelectorAll(".av").forEach((i) => (i.src = document.querySelector(".hero-logo").src));

const dc = CONFIG.redes.find((r) => r.nombre === "Discord" && r.url);
if (dc) {
  const c = $("#cap-discord"); c.href = dc.url; c.hidden = false;
  // nombre, imagen y miembros del servidor (desde el invite; si falla, queda el texto por defecto)
  fetch(`https://discord.com/api/v10/invites/${dc.url.split("/").pop()}?with_counts=true`).then((r) => r.json()).then((d) => {
    const g = d.guild; if (!g) return;
    if (g.icon) { const i = new Image(); i.className = "dc-icon"; i.alt = ""; i.src = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`; c.prepend(i); }
    setSeg("discord", d.approximate_member_count, d.approximate_presence_count ? `${d.approximate_presence_count.toLocaleString("es-AR")} en línea ahora` : "");
    let nom = (g.name || "").normalize("NFKC").trim().replace(/\s+/g, " ");
    if (nom.split(" ").every((t) => t.length <= 1)) nom = nom.replace(/ /g, "");
    c.querySelector("b").textContent = `Sumate a ${CONFIG.discordNombre || nom}`;
    if (d.approximate_member_count) c.querySelector("span").textContent = `${d.approximate_member_count.toLocaleString("es-AR")} miembros · ${(d.approximate_presence_count || 0).toLocaleString("es-AR")} en línea`;
  }).catch(() => {});
} else $("#bento").classList.add("sin-discord");

if (CONFIG.email) { $("#btn-mail").href = `mailto:${CONFIG.email}?subject=Colaboración con ${CONFIG.nombre}`; $("#cap-mail").hidden = false; }

(() => {
  const D = CONFIG.donar;
  $("#cap-donar").hidden = false;
  // aviso flotante: no empuja ni estira nada de la página
  const aviso = (txt) => {
    let t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
    t.textContent = txt; t.classList.add("ver"); clearTimeout(aviso.t); aviso.t = setTimeout(() => t.classList.remove("ver"), 2600);
  };
  const abrirLink = (url) => window.open(url, "_blank", "noopener");
  $("#btn-mp").addEventListener("click", async () => {
    if (D.alias) {
      let ok = false; try { await navigator.clipboard.writeText(D.alias); ok = true; } catch (_) {}
      aviso(ok ? `Alias copiado: ${D.alias}` : `Alias: ${D.alias}`);
    }
    if (D.mp) abrirLink(D.mp);
  });
  $("#btn-paypal").addEventListener("click", () => { if (D.paypal) abrirLink(D.paypal); });
})();

/* ---- Portada principal rotativa: Kick, YouTube, TikTok ---- */
function armarSlides() {
  const k = {
    tipo: "kick", id: CONFIG.kick, plat: "kick", vivo: !!KICK.live,
    titulo: KICK.live ? (KICK.titulo || "Directo en Kick") : "Directo en Kick: ahora offline",
    thumb: KICK.live ? KICK.thumb : CONFIG.bannerOffline
  };
  const listas = [
    [k],
    DATA.youtube.slice(0, 3).map((v) => ({ ...v, plat: "youtube" })),
    DATA.tiktok.slice(0, 3).map((v) => ({ ...v, plat: "tiktok" })),
    DATA.kick.slice(0, 2).map((v) => ({ ...v, plat: "kick" }))
  ];
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
  const vert = s.plat === "tiktok" && !!s.thumb; // reel vertical: se muestra entero sobre su propio fondo difuminado
  p.style.backgroundImage = !vert && s.thumb ? `url("${s.thumb}")` : "";
  p.style.setProperty("--thumb", vert ? `url("${s.thumb}")` : "none");
  p.classList.toggle("vertical", vert);
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

/* ---- Barra "estoy en vivo" + seguidores ---- */
const fmtN = (n) => new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(n);
function pintarLive() {
  $("#livebar").hidden = !enVivo;
  document.body.classList.toggle("live", enVivo);
  if (enVivo) $("#livebar-t").textContent = KICK.titulo ? `· ${KICK.titulo}` : "";
  const pill = $("#live-pill");
  pill.classList.toggle("off", !enVivo); pill.disabled = !enVivo;
  $("#live-pill-t").textContent = enVivo ? "EN VIVO" : "OFFLINE";
}
$("#live-pill").addEventListener("click", abrirKick);
$("#livebar-btn").addEventListener("click", abrirKick);

// revisa cada minuto si empezó o terminó el directo
setInterval(async () => {
  if (document.hidden) return; // pestaña en segundo plano: no gasta llamadas
  try {
    const d = await (await fetch("/api/kick")).json();
    if (!!d.live !== enVivo) { enVivo = !!d.live; KICK = d; pintarProximo(); pintarLive(); armarSlides(); }
  } catch (_) {}
}, 60000);

/* ---- Clips destacados ---- */
const CLIPS = CONFIG.clips.map((c) => ({ ...c, thumb: c.thumb || (c.tipo === "youtube" ? `https://i.ytimg.com/vi/${c.id}/hqdefault.jpg` : "") }));
if (CLIPS.length) { $("#clips").hidden = false; fila($("#rail-clips"), CLIPS, "med", ""); }

/* ---- Avisos de directos (mail o Discord) ---- */
(() => {
  const cap = $("#cap-avisos");
  if (CONFIG.avisosUrl) {
    cap.hidden = false; $("#avisos-form").hidden = false;
    $("#avisos-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = $("#avisos-msg"); msg.hidden = false; msg.textContent = "Enviando...";
      try {
        const r = await fetch(CONFIG.avisosUrl, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email: $("#avisos-mail").value }) });
        if (!r.ok) throw 0;
        msg.textContent = "¡Listo! Te vamos a avisar."; $("#avisos-form").hidden = true;
      } catch (_) { msg.textContent = "No pude guardar tu mail. Probá de nuevo en un rato."; }
    });
  }
})();

/* ---- Seguidores: cápsulas por plataforma + total ---- */
const SEG = { kick: 0, youtube: 0, tiktok: 0, discord: 0 };
const SEGLINK = { kick: kickUrl, youtube: CONFIG.youtubeCanal, tiktok: ttUrl, discord: dc ? dc.url : "" };
let segPrev = 0;
document.querySelectorAll(".seg").forEach((e) => { const u = SEGLINK[e.dataset.p]; if (u) e.href = u; else e.hidden = true; });

function contar(el, desde, hasta) { // anima el número
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = hasta.toLocaleString("es-AR"); return; }
  const t0 = performance.now(), dur = 1000;
  const paso = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(desde + (hasta - desde) * e).toLocaleString("es-AR"); if (p < 1) requestAnimationFrame(paso); };
  requestAnimationFrame(paso);
}

function setSeg(p, n, sub) {
  n = Number(n); if (!n) return;
  // el número de CONFIG.seguidores funciona como "piso": si la plataforma entrega uno menor (redondeado o viejo), no baja
  if ((CONFIG.seguidoresPiso || []).includes(p) && CONFIG.seguidores[p] > n) n = CONFIG.seguidores[p];
  const el = document.querySelector(`.seg[data-p="${p}"]`); if (!el) return;
  contar(el.querySelector(".n"), SEG[p], n); SEG[p] = n;
  if (sub) { const s = el.querySelector(".seg-sub"); s.textContent = sub; s.hidden = false; }
  pintarTotal();
}

let segListo = false;
setTimeout(() => { segListo = true; pintarTotal(); }, 8000);
function pintarTotal() {
  if (segListo) document.querySelectorAll(".seg").forEach((e) => { if (SEGLINK[e.dataset.p]) e.hidden = !SEG[e.dataset.p]; }); // sin dato: no se muestra "—"
  const visibles = Object.keys(SEG).filter((k) => SEGLINK[k]);
  const tot = visibles.reduce((x, k) => x + SEG[k], 0);
  $("#seg-total-box").hidden = !tot;
  contar($("#seg-total"), segPrev, tot); segPrev = tot;
  $("#seg-nota").textContent = visibles.some((k) => !SEG[k]) ? "Suma de las plataformas con dato disponible" : "";
}
Object.entries(CONFIG.seguidores).forEach(([p, n]) => setSeg(p, n));
fetch("/api/seguidores").then((r) => r.json()).then((d) => Object.entries(d).forEach(([p, n]) => setSeg(p, n))).catch(() => {}); // números rápidos de Kick, YouTube y TikTok

/* ---- Discord: abre la app directo; si no la tiene, abre la web ---- */
function abrirDiscord(e) {
  if (!dc) return;
  e.preventDefault();
  const code = dc.url.split("/").pop();
  const web = `https://discord.com/invite/${code}`;
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) { location.href = web; return; } // en el celu abre la app solo
  let abrio = false;
  const marcar = () => { abrio = true; };
  window.addEventListener("blur", marcar, { once: true });
  document.addEventListener("visibilitychange", marcar, { once: true });
  location.href = `discord://-/invite/${code}`;
  setTimeout(() => {
    window.removeEventListener("blur", marcar);
    document.removeEventListener("visibilitychange", marcar);
    if (!abrio) window.open(web, "_blank", "noopener");
  }, 1800);
}
document.querySelectorAll('.seg[data-p="discord"], #cap-discord, #avisos-dc')
  .forEach((a) => a.addEventListener("click", abrirDiscord));

/* ---- Menú "Seguime en…": Kick, YouTube, TikTok y las redes de CONFIG.redes, cada una con su logo ---- */
(() => {
  const ICONOS = {"Kick": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect width=\"24\" height=\"24\" rx=\"6\" fill=\"#53fc18\"/><path d=\"M6.5 5.5h3.2v4.1l3.5-4.1h3.9l-4.1 4.8 4.4 6.7h-3.9l-2.7-4.3-1.1 1.2v3.1H6.5z\" fill=\"#0b0b0b\"/></svg>", "YouTube": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"1\" y=\"4.5\" width=\"22\" height=\"15\" rx=\"4.5\" fill=\"#ff0000\"/><path d=\"M10 8.8v6.4l5.6-3.2z\" fill=\"#fff\"/></svg>", "TikTok": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect width=\"24\" height=\"24\" rx=\"6\" fill=\"#0b0b0b\"/><path d=\"M12.6 4.5h2.3c.2 1.6 1.2 2.8 2.8 3.1v2.3c-1 0-1.9-.3-2.8-.9v4.9a4.2 4.2 0 1 1-4.2-4.2c.3 0 .5 0 .8.1v2.4a1.8 1.8 0 1 0 1.1 1.7z\" fill=\"#25f4ee\" transform=\"translate(-.8 .6)\"/><path d=\"M12.6 4.5h2.3c.2 1.6 1.2 2.8 2.8 3.1v2.3c-1 0-1.9-.3-2.8-.9v4.9a4.2 4.2 0 1 1-4.2-4.2c.3 0 .5 0 .8.1v2.4a1.8 1.8 0 1 0 1.1 1.7z\" fill=\"#fe2c55\" transform=\"translate(.8 -.5)\"/><path d=\"M12.6 4.5h2.3c.2 1.6 1.2 2.8 2.8 3.1v2.3c-1 0-1.9-.3-2.8-.9v4.9a4.2 4.2 0 1 1-4.2-4.2c.3 0 .5 0 .8.1v2.4a1.8 1.8 0 1 0 1.1 1.7z\" fill=\"#fff\"/></svg>", "Instagram": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><defs><linearGradient id=\"ig\" x1=\"0\" y1=\"1\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#feda75\"/><stop offset=\".35\" stop-color=\"#fa7e1e\"/><stop offset=\".6\" stop-color=\"#d62976\"/><stop offset=\"1\" stop-color=\"#4f5bd5\"/></linearGradient></defs><rect width=\"24\" height=\"24\" rx=\"6.5\" fill=\"url(#ig)\"/><rect x=\"5.2\" y=\"5.2\" width=\"13.6\" height=\"13.6\" rx=\"4\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.7\"/><circle cx=\"12\" cy=\"12\" r=\"3.2\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.7\"/><circle cx=\"16.2\" cy=\"7.8\" r=\"1\" fill=\"#fff\"/></svg>", "Facebook": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"11\" fill=\"#1877f2\"/><path d=\"M13.3 19.5v-6.2h2.1l.4-2.5h-2.5V9.3c0-.7.3-1.3 1.4-1.3h1.2V5.8c-.2 0-.9-.1-1.8-.1-2 0-3.2 1.2-3.2 3.3v1.8H8.8v2.5h2.1v6.2z\" fill=\"#fff\"/></svg>", "X": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect width=\"24\" height=\"24\" rx=\"6\" fill=\"#0b0b0b\" stroke=\"#444\" stroke-width=\".8\"/><path d=\"M6.2 6h3.2l8.4 12h-3.2z\" fill=\"#fff\"/><path d=\"M17.6 6 6.4 18\" stroke=\"#fff\" stroke-width=\"1.5\" stroke-linecap=\"round\" fill=\"none\"/></svg>", "Discord": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect width=\"24\" height=\"24\" rx=\"6\" fill=\"#5865f2\"/><path d=\"M7.6 7.4c1.3-.6 2.9-1 4.4-1s3.1.4 4.4 1c1 1.8 1.6 3.9 1.5 6.5-.9.7-2 1.2-3.2 1.5l-.7-1.1c-.5.1-1 .2-2 .2s-1.500-.1-2-.2l-.7 1.100c-1.200-.3-2.300-.8-3.200-1.500-.1-2.600.5-4.700 1.500-6.500z\" fill=\"#fff\"/><circle cx=\"9.600\" cy=\"12\" r=\"1.200\" fill=\"#5865f2\"/><circle cx=\"14.400\" cy=\"12\" r=\"1.200\" fill=\"#5865f2\"/></svg>", "WhatsApp": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"11\" fill=\"#25d366\"/><path d=\"M12 5.2a6.800 6.800 0 0 0-5.800 10.300L5.300 18.800l3.400-.9A6.800 6.800 0 1 0 12 5.200z\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.500\" stroke-linejoin=\"round\"/><path d=\"M9.600 8.900c.2-.4.6-.4.9-.3l.7 1.500-.5.7c.5 1 1.300 1.800 2.300 2.300l.7-.5 1.500.7c.1.3.1.7-.3.9-1 .6-2.300.3-3.400-.5S9 10.100 9.600 8.900z\" fill=\"#fff\"/></svg>", "Twitch": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect width=\"24\" height=\"24\" rx=\"6\" fill=\"#9146ff\"/><path d=\"M6 5.500h12.500v8.200l-3 3h-3l-2 2v-2H6z\" fill=\"#fff\"/><path d=\"M13.200 8.300v3.300M16 8.300v3.300\" stroke=\"#9146ff\" stroke-width=\"1.400\" stroke-linecap=\"round\"/></svg>"};
  const btn = $("#seguime-btn"), menu = $("#seguime-menu"), modal = $("#seguime-modal");
  [{ nombre: "Kick", url: kickUrl }, { nombre: "YouTube", url: CONFIG.youtubeCanal }, { nombre: "TikTok", url: ttUrl }, ...CONFIG.redes].forEach((r) => {
    const a = document.createElement(r.url ? "a" : "span");
    a.className = "seguime-item" + (r.url ? "" : " off"); a.setAttribute("role", "menuitem");
    if (r.url) { a.href = r.url; a.target = "_blank"; a.rel = "noopener"; } else a.title = "Próximamente";
    a.innerHTML = (ICONOS[r.nombre] || "") + "<b></b>"; a.querySelector("b").textContent = r.nombre;
    if (r.nombre === "Discord" && r.url) a.addEventListener("click", abrirDiscord); // Discord abre la app directo
    menu.append(a);
  });
  btn.addEventListener("click", () => modal.showModal()); // ventana flotante en el centro
  $("#seguime-cerrar").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("a")) modal.close(); }); // click afuera o en una red
})();

/* ---- Extras "wow": palabra que se escribe sola, brillo que sigue al mouse, barra de scroll, volver arriba y menú activo ---- */
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1) "Acá jugamos ___" con efecto máquina de escribir (editá las palabras a gusto)
  const PAL = ["Valorant", "Formula 1", "y probamos juegos nuevos", "juegos cooperativos", "y probamos cosas nuevas", "y competimos", "con la comunidad", "y la pasamos bien"];
  const p = document.createElement("p"); p.className = "rotador";
  p.innerHTML = 'Acá jugamos <b></b><span class="cursor" aria-hidden="true"></span>';
  $("#tagline").after(p);
  const pal = p.querySelector("b");
  if (quieto) pal.textContent = PAL.join(" · ");
  else {
    let i = 0, n = 0, borra = false;
    const paso = () => {
      const w = PAL[i]; n += borra ? -1 : 1; pal.textContent = w.slice(0, n);
      let t = borra ? 45 : 90;
      if (!borra && n === w.length) { borra = true; t = 1400; }
      else if (borra && n === 0) { borra = false; i = (i + 1) % PAL.length; t = 350; }
      setTimeout(paso, t);
    };
    paso();
  }

  // 2) brillo violeta que sigue al mouse dentro de las tarjetas
  document.querySelectorAll(".cap, .seg").forEach((el) => {
    el.classList.add("glow-host"); el.append(document.createElement("x-glow"));
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px"); el.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  // 3) barra de progreso de scroll + botón "volver arriba"
  const barra = document.createElement("div"); barra.id = "progreso"; document.body.append(barra);
  const arriba = document.createElement("button");
  arriba.id = "arriba"; arriba.type = "button"; arriba.textContent = "↑"; arriba.setAttribute("aria-label", "Volver arriba");
  arriba.addEventListener("click", () => scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" }));
  document.body.append(arriba);
  let espera = false;
  addEventListener("scroll", () => {
    if (espera) return; espera = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      barra.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      arriba.classList.toggle("ver", scrollY > 700); espera = false;
    });
  }, { passive: true });

  // 4) el menú de arriba marca en qué sección estás
  const links = [...document.querySelectorAll(".top nav a")];
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((en) => en.forEach((x) => {
      const a = links.find((l) => l.getAttribute("href") === "#" + x.target.id); if (!a) return;
      if (x.isIntersecting) links.forEach((l) => l.classList.toggle("activo", l === a));
      else a.classList.remove("activo"); // arriba de todo (portada) no queda ninguno marcado
    }), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((a) => { const sec = document.querySelector(a.getAttribute("href")); if (sec) io.observe(sec); });
  }
})();

/* ---- Clips populares de Kick (automático, se suman a los de CONFIG.clips) ---- */
(async () => {
  let d = { clips: [] };
  try { d = await (await fetch("/api/kick-clips")).json(); } catch (_) {}
  const auto = (d.clips || []).map((c) => ({ ...c, tipo: "kickclip" }));
  const clipsUrl = `https://kick.com/${CONFIG.kick}/clips`;
  $("#link-clips").href = clipsUrl;
  $("#clips").hidden = false;
  if (!auto.length && !CLIPS.length) { // la API no entregó clips: botón directo a los clips en Kick
    $("#rail-clips").innerHTML = `<a class="kick-cta" href="${clipsUrl}" target="_blank" rel="noopener"><div><b>Mirá los clips en Kick</b><span>Los mejores momentos del canal, ordenados por más vistos.</span></div><em>Ver clips</em></a>`;
    return;
  }
  fila($("#rail-clips"), [...CLIPS, ...auto].slice(0, 12), "med", "");
})();

/* ---- logo de arriba: sube al inicio sin dejar el "#" en la dirección ---- */
document.querySelector(".top .logo").addEventListener("click", (e) => {
  e.preventDefault();
  scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  history.replaceState(null, "", location.pathname + location.search);
});
