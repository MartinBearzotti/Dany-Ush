# DANY-USH web

Página de directos (Kick), videos (YouTube) y reels (TikTok). Se despliega en Vercel.

## Archivos
- `index.html`, `styles.css`, `app.js`: la página. Lo editable está en `CONFIG`, arriba de `app.js`.
- `api/kick.js`, `api/youtube.js`, `api/tiktok.js`, `api/tiktok-thumb.js`: funciones de Vercel (tienen que estar dentro de la carpeta `api/`).

## Variables de entorno (Vercel > Settings > Environment Variables)
| Variable | Para qué |
|---|---|
| `KICK_SLUG` | usuario de Kick |
| `KICK_CLIENT_ID`, `KICK_CLIENT_SECRET` | estado "en vivo" de Kick |
| `YOUTUBE_API_KEY` | videos y suscriptores de YouTube |
| `TIKTOK_RSS_URL` | feed RSS de los reels de TikTok (RSS.app) |
| `TIKTOK_USER` | opcional, por defecto `dany_ush_oficial` |

Después de cambiar una variable hay que hacer **Redeploy**.
