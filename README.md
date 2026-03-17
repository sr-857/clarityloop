# SABLE — Creative Agency Site

Static agency site with fullscreen video hero, frosted glass chips, AI-powered search, and a 3-step booking modal.

## Files

```
index.html    — markup
styles.css    — all styles (Cormorant Garamond + Instrument Sans)
main.js       — vanilla JS (typewriter, modal, calendar, scroll reveal)
vercel.json   — Vercel routing + cache + security headers
package.json  — project metadata
```

---

## Deploy to Vercel

### Option A — Drag & Drop (fastest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag the entire unzipped folder onto the page
3. Click **Deploy** — live in ~30 seconds

### Option B — Vercel CLI

```bash
npm i -g vercel
cd sable-agency-site
vercel            # follow prompts
vercel --prod     # promote to production
```

### Option C — GitHub → Vercel (recommended for ongoing)

1. Push this folder to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
3. Select the repo → **Deploy**
4. Every push to `main` auto-deploys

---

## Custom Domain

In the Vercel dashboard → **Project Settings → Domains** → add your domain and follow the DNS instructions.

---

## Local Preview

```bash
npx serve .
# → http://localhost:3000
```

---

## Swap the Hero Video

Replace the `<source src="...">` URL in `index.html` with your own hosted `.mp4`.
For best results: 1920×1080, H.264, under 8 MB, muted.
