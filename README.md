# Pragya Reddy A · Portfolio

A cinematic, scroll-told portfolio: one night in three colour chapters (red, gold, cool neon) over a WebGL long-exposure scene.

- Run: `npm --prefix site install` then `npm --prefix site run dev` (http://localhost:5173)
- Build: `npm --prefix site run build` (static output in `site/dist`)
- `PRODUCT.md` and `DESIGN.md` hold the product and design context.
- Deploy: connect the repo to Vercel or Netlify (settings are in `vercel.json` / `netlify.toml`), and set `VITE_SITE_URL` to the live address (no trailing slash) so link previews show the share image.
- Icons and the share image: `python site/scripts/make_icons.py`.
