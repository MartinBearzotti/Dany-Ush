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


],

donar: { alias: "", cafecito: "", paypal: "" }, // alias de Mercado Pago, link de Cafecito, link de PayPal

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

// Reels de TikTok a mano (opcional, complementa el perfil embebido)

bannerOffline: "/og-v2.png", // imagen fija cuando Kick está offline

jugando: "Backseat Champions",

setup: [

{ item: "Procesador", valor: "Intel Core i5" },

{ item: "Placa de video", valor: "NVIDIA GeForce" },

{ item: "RAM", valor: "16 GB DDR4" },

{ item: "Micrófono / Auris", valor: "A completar" },

],

// Clips destacados a mano. tipo: "youtube" | "kickvod" | "tiktok". thumb es opcional (en YouTube se arma sola)

clips: [

// { tipo: "youtube", id: "ID_DEL_VIDEO", titulo: "Mi mejor momento" },

],

// "Qué hago en el canal" (editá los textos)

contenido: [

{ titulo: "Valorant", texto: "Partidas, clutches y mucho humor. Entrá al directo y jugá con la comunidad." },

{ titulo: "F1, Among Us y más", texto: "Carreras, juegos de deducción y de todo un poco." },

{ titulo: "Directos con la comunidad", texto: "Charla, risas y jugar juntos. Pasá y quedate un rato." },

{ titulo: "Clips y reels", texto: "Los mejores momentos, cortitos, en YouTube y TikTok." },

],

// Comandos del chat (EJEMPLOS: cambialos por los tuyos)

comandos: [

{ cmd: "!discord", desc: "Link al servidor de Discord" },

{ cmd: "!horario", desc: "Días y horas de directo" },

{ cmd: "!setup", desc: "Mi PC y mi equipo" },

],

// Reglas del chat (EJEMPLOS: cambialas por las tuyas)

reglas: [

"Respeto para todos: nada de insultos ni discriminación.",

"No spamear ni mandar links sin permiso.",

"Sin spoilers del juego.",

"Pasarla bien: el fin es divertirse.",

],

// Para avisos por mail: URL de un formulario (Formspree, Getform, etc.). Vacío = se ofrece Discord

avisosUrl: "",

// Si el nombre del Discord se ve raro, escribí acá el que quieras mostrar

discordNombre: "",

// Números a mano por si alguna plataforma no entrega el dato sola (0 = no mostrar). Los automáticos tienen prioridad.

seguidores: { kick: 134, youtube: 291, tiktok: 11100, discord: 63 }, // solo se usan hasta que cada plataforma entregue el dato real; después se reemplazan solos

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

const kickUrl = `https://kick.com/${CONFIG.kick}`, ttUrl = `https://www.tiktok.com/@${CONFIG.tiktok}`;

let enVivo = false;

const DATA = { kick: [], youtube: [], tiktok: [] };

let filtro = "todo", visibles = 12, proxT = null, busqueda = "";

let slides = [], idx = 0, timer = null, pausa = false, KICK = { live: false };

const ETQ = { kick: "Kick", youtube: "YouTube", tiktok: "TikTok" };



document.title = `${CONFIG.nombre} | Directos, videos y reels`;

$("#nombre").textContent = CONFIG.nombre;

$("#tagline").textContent = CONFIG.tagline;

$("#foot-name").textContent = `© ${new Date().getFullYear()} ${CONFIG.nombre}`;

[["#link-kick2", kickUrl], ["#f-kick", kickUrl], ["#link-yt", CONFIG.youtubeCanal], ["#btn-yt", CONFIG.youtubeCanal], ["#btn-tt", ttUrl],

["#f-yt", CONFIG.youtubeCanal], ["#link-tt", ttUrl], ["#f-tt", ttUrl]].forEach(([s, u]) => ($(s).href = u));



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

function abrir(tipo, id, titulo) {

linkActual = LINKS[tipo] ? LINKS[tipo](id) : kickUrl;

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

pintarProximo(); pintarLive(); if (d.seguidores) { setStat("#st-kick", d.seguidores, "seguidores"); setSeg("kick", d.seguidores); }

DATA.kick = (d.vods || []).map((v) => ({ ...v, tipo: "kickvod" }));

fila($("#rail-kick"), DATA.kick, "med", "Próximamente"); pintarUltimo();

}

async function cargarYouTube() {

let d = { videos: [] };

try { d = await (await fetch("/api/youtube")).json(); } catch (_) {}

DATA.youtube = (d.videos || []).map((v) => ({ ...v, tipo: "youtube" }));

if (d.subs) { setStat("#st-yt", d.subs, "suscriptores"); setSeg("youtube", d.subs); }

if (!DATA.youtube.length) { // sin API: lista oficial de reproducción con todos los videos del canal

$("#rail-yt").innerHTML = `<iframe class="lista" src="https://www.youtube.com/embed/videoseries?list=UU${CONFIG.youtubeId.slice(2)}" title="Videos de ${CONFIG.nombre}" loading="lazy" allowfullscreen></iframe>`;

pintarUltimo(); return;

}

fila($("#rail-yt"), DATA.youtube, "med", "Próximamente"); pintarUltimo();

}

async function cargarTikTok() {

let d = { videos: [] };

try { d = await (await fetch("/api/tiktok")).json(); } catch (_) {}

if (d.seguidores) setSeg("tiktok", d.seguidores);

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

const cargarEmbed = () => { const s = document.createElement("script"); s.async = true; s.src = "https://www.tiktok.com/embed.js"; document.body.append(s); };

if ("IntersectionObserver" in window) { const o = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { o.disconnect(); cargarEmbed(); } }, { rootMargin: "400px" }); o.observe($("#tiktok")); } else cargarEmbed();

}

$("#grid").innerHTML = Array(6).fill('<div class="poster med skel"></div>').join("");

$("#buscar").addEventListener("input", (e) => { busqueda = e.target.value.trim().toLowerCase(); visibles = 12; pintarUltimo(); });

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

.filter((v) => (filtro === "todo" || v.plat === filtro) && (!busqueda || (v.titulo || "").toLowerCase().includes(busqueda)))

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

const COLOR = { Kick: "#53fc18", YouTube: "#ff2d2d", TikTok: "#22d3ee", Discord: "#5865f2", Instagram: "#e1306c", Facebook: "#1877f2", WhatsApp: "#25d366", X: "#ffffff", Twitch: "#9146ff" };

[{ nombre: "Kick", url: kickUrl }, { nombre: "YouTube", url: CONFIG.youtubeCanal }, { nombre: "TikTok", url: ttUrl },

...CONFIG.redes.filter((r) => r.nombre !== "Discord")].forEach((r) => {

const l = document.createElement("a");

l.className = "social"; if (r.url) { l.href = r.url; l.target = "_blank"; l.rel = "noopener"; } else { l.classList.add("off"); l.title = "Próximamente"; }

l.style.setProperty("--c", COLOR[r.nombre] || "#8b5cf6");

l.innerHTML = "<i></i>"; l.append(r.nombre); $("#redes").append(l);

});

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
  const D = CONFIG.donar, al = $("#donar-alias");
  $("#cap-donar").hidden = false;
  const pronto = () => { al.hidden = false; al.textContent = "Este medio de apoyo va a estar disponible muy pronto."; };
  $("#btn-mp").addEventListener("click", async () => {
    if (!D.alias) return pronto();
    let ok = false; try { await navigator.clipboard.writeText(D.alias); ok = true; } catch (_) {}
    al.hidden = false; al.innerHTML = "Alias: <b></b>" + (ok ? " · ¡copiado!" : ""); al.querySelector("b").textContent = D.alias;
  });
  [["#btn-cafecito", D.cafecito], ["#btn-paypal", D.paypal]].forEach(([sel, url]) =>
    $(sel).addEventListener("click", () => (url ? window.open(url, "_blank", "noopener") : pronto())));
})();



/* ---- Portada principal rotativa: Kick, YouTube, TikTok ---- */

function armarSlides() {

const k = { tipo: "kick", id: CONFIG.kick, plat: "kick", vivo: !!KICK.live,

titulo: KICK.live ? (KICK.titulo || "Directo en Kick") : "Directo en Kick: ahora offline", thumb: KICK.live ? KICK.thumb : CONFIG.bannerOffline };

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


/* ---- Horarios y Setup ---- */

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

$("#juego-actual").textContent = CONFIG.jugando;

$("#lista-horarios").innerHTML = CONFIG.horario

.map((h) => `<li><b>${DIAS[h.dia]}</b><span>${h.hora} h (ARG)</span></li>`).join("");

$("#lista-setup").innerHTML = CONFIG.setup

.map((s) => `<li><span>${s.item}</span><b>${s.valor}</b></li>`).join("");



/* ---- Barra "estoy en vivo" + seguidores ---- */

const fmtN = (n) => new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(n);

function setStat(sel, n, txt) { const e = $(sel); e.textContent = `${Number(n).toLocaleString("es-AR")} ${txt}`; e.hidden = false; }

function pintarLive() {

$("#livebar").hidden = !enVivo;

document.body.classList.toggle("live", enVivo);

if (enVivo) $("#livebar-t").textContent = KICK.titulo ? `· ${KICK.titulo}` : "";

}

$("#livebar-btn").addEventListener("click", abrirKick);

// revisa cada minuto si empezó o terminó el directo

setInterval(async () => {

try {

const d = await (await fetch("/api/kick")).json();

if (!!d.live !== enVivo) { enVivo = !!d.live; KICK = d; pintarProximo(); pintarLive(); armarSlides(); }

if (d.seguidores) { setStat("#st-kick", d.seguidores, "seguidores"); setSeg("kick", d.seguidores); }

} catch (_) {}

}, 60000);



/* ---- Clips destacados ---- */

const CLIPS = CONFIG.clips.map((c) => ({ ...c, thumb: c.thumb || (c.tipo === "youtube" ? `https://i.ytimg.com/vi/${c.id}/hqdefault.jpg` : "") }));

if (CLIPS.length) { $("#clips").hidden = false; fila($("#rail-clips"), CLIPS, "med", ""); }



/* ---- Qué hago, comandos y reglas ---- */

$("#canal-grid").innerHTML = CONFIG.contenido.map((c) => `<article class="cap"><h3>${c.titulo}</h3><p>${c.texto}</p></article>`).join("");

$("#lista-cmds").innerHTML = CONFIG.comandos.map((c) => `<li><b>${c.cmd}</b><span>${c.desc}</span></li>`).join("");

$("#lista-reglas").innerHTML = CONFIG.reglas.map((r) => `<li>${r}</li>`).join("");



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

} else if (dc) {

cap.hidden = false; $("#avisos-txt").textContent = "Activá las notificaciones en el Discord y te enterás apenas arranca el directo.";

const b = $("#avisos-dc"); b.href = dc.url; b.hidden = false;

}

})();



/* ---- Seguidores: cápsulas por plataforma + total ---- */

const SEG = { kick: 0, youtube: 0, tiktok: 0, discord: 0 };

const SEGLINK = { kick: kickUrl, youtube: CONFIG.youtubeCanal, tiktok: ttUrl, discord: dc ? dc.url : "" };

let segPrev = 0;

document.querySelectorAll(".seg").forEach((e) => { const u = SEGLINK[e.dataset.p]; if (u) e.href = u; else e.hidden = true; });

function contar(el, desde, hasta) { // anima el número

if (!desde || matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = hasta.toLocaleString("es-AR"); return; } // el primer número aparece al instante

const t0 = performance.now(), dur = 450;

const paso = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(desde + (hasta - desde) * e).toLocaleString("es-AR"); if (p < 1) requestAnimationFrame(paso); };

requestAnimationFrame(paso);

}

function guardarSeg(p, n) { // recuerda el último número real para mostrarlo al instante la próxima vez
try { const c = JSON.parse(localStorage.getItem("dany_seg") || "{}"); c[p] = n; localStorage.setItem("dany_seg", JSON.stringify(c)); } catch (_) {}
}

function setSeg(p, n, sub, manual) {

n = Number(n); if (!n) return;

const el = document.querySelector(`.seg[data-p="${p}"]`); if (!el) return;

contar(el.querySelector(".n"), SEG[p], n); SEG[p] = n; if (!manual) guardarSeg(p, n);

if (sub) { const s = el.querySelector(".seg-sub"); s.textContent = sub; s.hidden = false; }

pintarTotal();

}

function pintarTotal() {

const visibles = Object.keys(SEG).filter((k) => SEGLINK[k]);

const tot = visibles.reduce((x, k) => x + SEG[k], 0);

$("#seg-total-box").hidden = !tot;

contar($("#seg-total"), segPrev, tot); segPrev = tot;

$("#seg-nota").textContent = visibles.some((k) => !SEG[k]) ? "Suma de las plataformas con dato disponible" : "";

}

// al abrir la página: último número real guardado en este navegador (o el de CONFIG si es la primera vez), sin esperar nada
let cacheSeg = {}; try { cacheSeg = JSON.parse(localStorage.getItem("dany_seg") || "{}"); } catch (_) {}
Object.entries(CONFIG.seguidores).forEach(([p, n]) => setSeg(p, cacheSeg[p] || n, "", !cacheSeg[p]));

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
  const btn = $("#seguime-btn"), menu = $("#seguime-menu"), cont = $("#seguime");
  [{ nombre: "Kick", url: kickUrl }, { nombre: "YouTube", url: CONFIG.youtubeCanal }, { nombre: "TikTok", url: ttUrl }, ...CONFIG.redes].forEach((r) => {
    const a = document.createElement(r.url ? "a" : "span");
    a.className = "seguime-item" + (r.url ? "" : " off"); a.setAttribute("role", "menuitem");
    if (r.url) { a.href = r.url; a.target = "_blank"; a.rel = "noopener"; } else a.title = "Próximamente";
    a.innerHTML = (ICONOS[r.nombre] || "") + "<b></b>"; a.querySelector("b").textContent = r.nombre;
    if (r.nombre === "Discord" && r.url) a.addEventListener("click", abrirDiscord); // Discord abre la app directo
    menu.append(a);
  });
  const cerrar = () => { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", () => { const abrir = menu.hidden; menu.hidden = !abrir; btn.setAttribute("aria-expanded", String(abrir)); });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) cerrar(); });
  document.addEventListener("click", (e) => { if (!cont.contains(e.target)) cerrar(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { cerrar(); btn.focus(); } });
})();

/* ---- Seguidores en vivo: un pedido liviano por plataforma, todos a la vez, y se repite cada minuto ---- */
function leerSeguidores() {
  ["kick", "youtube", "tiktok"].forEach(async (p) => {
    try {
      const d = await (await fetch(`/api/seguidores?p=${p}`)).json();
      if (!d[p]) return;
      if (p === "kick") setStat("#st-kick", d[p], "seguidores");
      if (p === "youtube") setStat("#st-yt", d[p], "suscriptores");
      setSeg(p, d[p]);
    } catch (_) {}
  });
  if (dc) {
    fetch(`https://discord.com/api/v10/invites/${dc.url.split("/").pop()}?with_counts=true`).then((r) => r.json()).then((d) => {
      if (d.approximate_member_count) setSeg("discord", d.approximate_member_count, d.approximate_presence_count ? `${d.approximate_presence_count.toLocaleString("es-AR")} en línea ahora` : "");
    }).catch(() => {});
  }
}
leerSeguidores();
setInterval(leerSeguidores, 60000);
