-- =============================================
-- INSOLIT - Seed Data
-- Run this after schema.sql
-- =============================================

DELETE FROM promos;

-- Categories
INSERT INTO categories (label, icon) VALUES
  ('Sport', '🏋️'),
  ('Food', '🍔'),
  ('Chill', '🧘'),
  ('Culture', '🎬'),
  ('Tech', '💻'),
  ('Mode', '👟'),
  ('Expérience', '🎟️'),
  ('Beauté', '✨')
ON CONFLICT (label) DO UPDATE SET icon = EXCLUDED.icon;

-- Merchants
WITH merchant_seed AS (
  SELECT *
  FROM (
    VALUES
      ('a1111111-1111-1111-1111-111111111111'::uuid, 'Burger Palace', '12 Rue de Rivoli, 75001 Paris', POINT(2.3522, 48.8566), 'Food'),
      ('a2222222-2222-2222-2222-222222222222'::uuid, 'EscapeGame Paris', '45 Boulevard Saint-Germain, 75005 Paris', POINT(2.3499, 48.8530), 'Expérience'),
      ('a3333333-3333-3333-3333-333333333333'::uuid, 'StreetWear Co.', '8 Rue Oberkampf, 75011 Paris', POINT(2.3780, 48.8650), 'Mode'),
      ('a4444444-4444-4444-4444-444444444444'::uuid, 'TechDeal', '102 Avenue des Champs-Elysees, 75008 Paris', POINT(2.3075, 48.8698), 'Tech'),
      ('a5555555-5555-5555-5555-555555555555'::uuid, 'GlowUp Studio', '23 Rue du Faubourg Saint-Honore, 75008 Paris', POINT(2.3152, 48.8704), 'Beauté'),
      ('a6666666-6666-6666-6666-666666666666'::uuid, 'FitZone', '67 Rue de la Roquette, 75011 Paris', POINT(2.3784, 48.8564), 'Sport'),
      ('a7777777-7777-7777-7777-777777777777'::uuid, 'Cine Paradis', '15 Rue des Ecoles, 75005 Paris', POINT(2.3448, 48.8491), 'Culture'),
      ('a8888888-8888-8888-8888-888888888888'::uuid, 'Sushi Master', '33 Rue Sainte-Anne, 75001 Paris', POINT(2.3384, 48.8659), 'Food')
  ) AS t(id, name, address, coordinates, category_label)
)
INSERT INTO merchants (id, name, address, coordinates, category_id)
SELECT
  ms.id,
  ms.name,
  ms.address,
  ms.coordinates,
  c.id
FROM merchant_seed ms
JOIN categories c ON c.label = ms.category_label
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  coordinates = EXCLUDED.coordinates,
  category_id = EXCLUDED.category_id;

-- Promos
INSERT INTO promos (title, description, promo_code, end_date, is_exclusive, merchant_id) VALUES
  (
    'Menu Smash Burger à -40%',
    'Profite d''un menu complet avec burger smash, frites maison et boisson pour seulement 6,90€ au lieu de 11,50€. Offre valable en semaine uniquement.',
    'SMASH40',
    '2026-06-30',
    true,
    'a1111111-1111-1111-1111-111111111111'
  ),
  (
    'Escape Game : 1 place achetée = 1 offerte',
    'Vis une aventure immersive avec tes potes ! Pour toute place achetée, la deuxième est offerte. Plus de 10 scénarios disponibles.',
    'ESCAPE2X1',
    '2026-05-15',
    true,
    'a2222222-2222-2222-2222-222222222222'
  ),
  (
    '-30% sur toute la collection été',
    'Renouvelle ta garde-robe avec la nouvelle collection streetwear. Hoodies, tees, sneakers... tout y passe.',
    'STREET30',
    '2026-07-31',
    false,
    'a3333333-3333-3333-3333-333333333333'
  ),
  (
    'AirPods Pro à prix cassé',
    'Les AirPods Pro 2 à -25% grâce à notre partenariat exclusif. Stock limité, premier arrivé premier servi !',
    'TECHPODS25',
    '2026-04-30',
    true,
    'a4444444-4444-4444-4444-444444444444'
  ),
  (
    'Soin visage complet offert',
    'Découvre un soin du visage professionnel de 45 minutes. Nettoyage, gommage et masque inclus. Sur rendez-vous.',
    'GLOW100',
    '2026-05-31',
    false,
    'a5555555-5555-5555-5555-555555555555'
  ),
  (
    'Abonnement salle de sport à 9,99€/mois',
    '3 mois d''accès illimité à toutes les machines, cours collectifs et sauna. Sans engagement.',
    'FIT999',
    '2026-06-15',
    true,
    'a6666666-6666-6666-6666-666666666666'
  ),
  (
    'Place de ciné à 4€',
    'Tous les mardis et jeudis, ta place de cinéma à 4€ au lieu de 12€. Valable pour tous les films à l''affiche.',
    'CINE4',
    '2026-12-31',
    false,
    'a7777777-7777-7777-7777-777777777777'
  ),
  (
    'Plateau sushi all-you-can-eat à -35%',
    'Sushis, makis, sashimis en illimité pour 15€ au lieu de 23€. Le midi du lundi au vendredi.',
    'SUSHI35',
    '2026-08-31',
    false,
    'a8888888-8888-8888-8888-888888888888'
  ),
  (
    'Cours de poterie découverte',
    'Initie-toi à la poterie avec un atelier de 2h en petit groupe. Réduc exclusive INSOLIT de 50%.',
    'POTE50',
    '2026-09-30',
    true,
    'a2222222-2222-2222-2222-222222222222'
  );
