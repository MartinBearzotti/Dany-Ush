/* ============ CONFIG: lo único que hay que editar ============ */
const CONFIG = {
  nombre: "DANY-USH",
  logo: "img/logo.png",
  tagline: "Directos, videos y reels en un solo lugar.",
  bio: "Gaming divertido y aventuras en la Tierra Media. El fin es divertirse y pasar un buen rato.",
  email: "",

  redes: [
    { nombre: "Instagram", url: "" },
    { nombre: "Discord", url: "https://discord.gg/bghCDSQVdm" },
    { nombre: "WhatsApp", url: "" },
  ],

  donar: {
    texto: "Invitame un cafecito",
    url: "",
  },

  kick: "danyush",
  youtubeCanal: "https://www.youtube.com/@dany-ush6495",
  youtubeId: "UCG7poDcbGtKNc4hAQWBvqpA",
  tiktok: "dany_ushh",

  // Horario fijo de directos (hora Argentina)
  // dia: 0=domingo ... 6=sábado
  horario: [
    { dia: 2, hora: "21:00" },
    { dia: 4, hora: "21:00" },
    { dia: 6, hora: "22:00" },
  ],

  // Videos de TikTok manuales (opcional)
  tiktokVideos: [
    // { id: "7301234567890123456", titulo: "Título", thumb: "img/portada1.jpg" },
  ],
};

/* ============================================================ */

const $ = (s) => document.querySelector(s);

const kickUrl = `https://kick.com/$DIL0`;
const ttUrl = `https://www.tiktok.com/@$DIL1`;
