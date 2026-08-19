-- Il ne peut pas exister deux réservations confirmées du même logement
-- dont les plages de dates se recouvrent.
--
-- Le '[)' est la rotation du samedi : fermé à gauche, ouvert à droite.
-- Une garantie déclarative, tenue par le moteur, quel que soit le niveau
-- d'isolation et quel que soit le code qui écrit.
alter table bookings
  add constraint no_double_booking
  exclude using gist (
    accommodation_id with =,
    daterange(starts_on, ends_on, '[)') with &&
  ) where (status = 'confirmed');
