# MySignal CMS

Vite + React frontend, Netlify Functions + Edge Functions backend, Turso
(libSQL) database, Netlify Blobs for uploaded media. No separate backend
server, no local dev step required — everything builds and runs on Netlify.

## Why Edge Functions for media

Regular Netlify Functions (the ones handling auth/articles/hero-slides CRUD)
cap request/response bodies around 6MB. That's exactly what breaks video
uploads. `media-upload` and `media-serve` run as **Edge Functions** instead
(`netlify/edge-functions/`) — they stream the file instead of buffering it
whole, so uploads work reliably up to 100MB without any local workaround.

## Deploy straight from GitHub (recommended — no local setup needed)

1. **Push this folder to a new GitHub repo:**
   ```bash
   cd mysignal-cms
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/mysignal-cms.git
   git push -u origin main
   ```
2. **Create the Turso database** (needs the Turso CLI or their web dashboard):
   ```bash
   turso db create mysignal-content
   turso db show mysignal-content --url
   turso db tokens create mysignal-content
   turso db shell mysignal-content < db/schema.sql
   turso db shell mysignal-content < db/seed.sql   # optional starter hero slides
   ```
   No Turso CLI handy? Paste the contents of `db/schema.sql` (then
   `db/seed.sql`) into the **Edit Data → SQL Console** on the Turso web
   dashboard instead — same as before.
3. **In Netlify:** "Add new site" → "Import an existing project" → pick this
   GitHub repo. Build command and publish directory are already set in
   `netlify.toml`, so just deploy.
4. **Set 4 environment variables** in Netlify (Site settings → Environment
   variables) — take these straight from `.env.example`:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `ADMIN_PASSWORD` — your `/admin` login password
   - `ADMIN_SESSION_SECRET` — any random long string
   Netlify Blobs needs no extra keys — it's automatic once the site exists.
5. **Redeploy** (Netlify → Deploys → Trigger deploy) after adding the env
   vars so the functions pick them up. Then visit `https://<your-site>.netlify.app/admin/login`.

Every future change: `git push`, Netlify rebuilds automatically. No local
`npm install` or `netlify dev` required at any point.

## Optional: running it locally anyway

```bash
npm install
netlify link       # only needed once, for local Netlify Blobs access
netlify dev         # runs Vite + Functions + Edge Functions together
```
Visit `http://localhost:8888/admin/login`. This is optional — everything
above already works from a straight GitHub deploy.

## What's built so far (Phase 1)

- Public homepage with a CMS-driven **Hero Slider**: upload image or video,
  pick a Ken Burns transition (zoom in/out, pan left/right, or none), set
  copy, CTA, order and published/draft status — all from `/admin/hero-slides`.
- Admin auth (password + signed session cookie), matching the pattern used
  in `falcomadsv1`.
- Database schema and CRUD APIs already in place for **Articles** and
  **Gallery** (`netlify/functions/articles.js`, `gallery.js`) — ready for
  their admin screens and public pages next phase.

## Next phases

1. Admin screens for Articles (rich text + embedded image/video) and Gallery.
2. Public Gallery, News, and Article-detail pages reading from the CMS.
3. News page + "Signal Sources" admin.
