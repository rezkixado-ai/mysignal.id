-- Optional: run this after schema.sql to pre-fill the hero slider with the
-- 4 default slides from the original wireframe. Media URLs point to Picsum
-- placeholders — replace them via /admin/hero-slides once real assets exist.

INSERT INTO hero_slides (id, eyebrow, title, description, cta_label, cta_url, media_type, media_url, ken_burns, sort_order, is_published) VALUES
('slide_seed_1','Cybersecurity','The New Threats Behind Our Digital World','Understanding the latest attacks, vulnerabilities, and how to stay protected.','Read Article','#','image','https://picsum.photos/seed/mysignal-cyber/1200/900','zoom-in',0,1),
('slide_seed_2','Cloud','What Happens When The Cloud Goes Down?','Inside the outages and the fragile backbone half the internet depends on.','Read Article','#','image','https://picsum.photos/seed/mysignal-cloud/1200/900','pan-left',1,1),
('slide_seed_3','Network','The Infrastructure Behind Your Internet','From subsea cables to fiber backbones — the physical signal path.','Read Article','#','image','https://picsum.photos/seed/mysignal-network/1200/900','zoom-out',2,1),
('slide_seed_4','Big Tech','Why Big Tech Is Fighting Over AI','Inside the compute race and the trillion-dollar bet reshaping tech.','Read Article','#','image','https://picsum.photos/seed/mysignal-bigtech/1200/900','pan-right',3,1);
