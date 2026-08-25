-- Run this once in the Turso SQL Console (Edit Data -> SQL Console) against
-- your existing database — it only adds columns, no data is touched.

ALTER TABLE articles ADD COLUMN meta_title TEXT;
ALTER TABLE articles ADD COLUMN meta_description TEXT;
ALTER TABLE articles ADD COLUMN focus_keyword TEXT;
