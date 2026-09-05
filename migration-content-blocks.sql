-- Run this once against the Turso database (same way the meta_title /
-- meta_description / focus_keyword migration was run earlier).
-- Stores the Editor.js block output for new/edited articles as a JSON string.
-- Existing articles will have NULL here and keep rendering from body_html
-- (see the fallback logic in app/(site)/article/[slug]/page.jsx).
ALTER TABLE articles ADD COLUMN content_blocks TEXT;
