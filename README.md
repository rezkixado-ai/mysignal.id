# MySignal CMS

**Next.js (App Router)** + Turso (libSQL) + Netlify Blobs for media. Deployed
on Netlify via its official Next.js Runtime (auto-detected, zero-config).

## Why Next.js (migrated from a Vite/React SPA)

The previous version was a client-rendered SPA: every page shared the same
`<title>`/meta tags, and crawlers/link previews that don't execute
JavaScript saw nothing useful. Next.js Server Components render real HTML
per page on the server — `generateMetadata` gives every article its own
title, description, Open Graph image, and JSON-LD, already in the initial
response. That's the actual SEO fix; everything else (sitemap, robots,
the Yoast-style analyzer) was already in place before this migration.

## Why media upload/serve are still separate Netlify Edge Functions

Regular server functions (including Next.js API/Route Handlers, once
deployed through Netlify's Next.js Runtime) cap request/response bodies
around 6MB — too small for video, and the exact bug that broke video
uploads earlier in this project. `netlify/edge-functions/media-upload.js`
and `media-serve.js` are genuine Netlify Edge Functions (Deno, streaming),
deliberately kept outside the Next.js app so that fix doesn't get undone.
Next.js's own "edge runtime" on Netlify does **not** give the same
guarantee — per Netlify's docs it still executes through the regular
function infrastructure under the hood.

## Deploy straight from GitHub (recommended — no local setup needed)

1. **Push this folder to your GitHub repo** (same repo as before is fine —
   this replaces the old Vite app entirely):
   ```bash
   cd mysignal-cms
   git add -A
   git commit -m "Migrate to Next.js"
   git push
   ```
   Netlify auto-detects Next.js and rebuilds — no `netlify.toml` build
   command needed, it's handled by the Next.js Runtime plugin.

2. **Database migration** (if you haven't already run the SEO fields
   migration from before): in the Turso SQL Console, run
   `db/migrations/002_add_seo_fields.sql`. Everything else in the schema is
   unchanged — same database, same data, no re-seeding needed.

3. **Environment variables** — same 4 as before, already set in Netlify if
   you did the earlier setup: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
   `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`. Nothing new to add.

4. **Trigger a redeploy** after pushing if it doesn't fire automatically,
   then visit `/admin/login`.

## Local development (optional)

```bash
npm install
npm run dev
```
Visit `http://localhost:3000`. Note: local dev won't have working media
upload/serve, since those are genuine Netlify Edge Functions — use
`npx netlify dev` instead if you need to test uploads locally (requires
`npx netlify link` first, same as before).

## What's built

- **Public site** (Server Components, real per-page SEO): Home, News
  (with client-side category filter), Article detail (`generateMetadata`
  + `Article` JSON-LD), Gallery/About/Contact (placeholders).
- **Admin** (`/admin`, password-protected): Hero Slider (image/video
  upload, Ken Burns transitions), Gallery (per-card shape), Articles
  (rich text body, embedded media, SEO fields + live Yoast-style analyzer).
- **SEO**: `app/sitemap.js` and `app/robots.js` (native Next.js
  conventions, generated from the live database), per-page metadata,
  per-article Open Graph + JSON-LD.

Before submitting to Google Search Console, update the placeholder
`https://mysignal.id` in `app/layout.jsx`, `app/(site)/page.jsx` (canonical),
`app/sitemap.js`, `app/robots.js`, and `app/(site)/article/[slug]/page.jsx`
(JSON-LD `mainEntityOfPage`) to your real domain.

## Next steps

Full Gallery and About/Contact pages (currently placeholders), and an
Admin screen for the "Signal Sources" marquee and topic cards if you want
those editable too.
