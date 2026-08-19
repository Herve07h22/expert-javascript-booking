// Les gabarits vivent dans l'infrastructure : le domaine décide QUOI notifier,
// l'infrastructure décide COMMENT. Un test de domaine qui vérifie une balise
// <h1> casse à la première retouche du graphiste.
export const templates = {
  BookingConfirmed: (payload, baseUrl) => ({
    subject: "Votre réservation est confirmée",
    html: `<h1>Réservation confirmée</h1>
<p>Du ${payload.from} au ${payload.to}, pour ${payload.guests} voyageurs.</p>
<p><a href="${baseUrl}/bookings">Voir la réservation</a></p>`,
  }),

  BookingCancelled: (payload, baseUrl) => ({
    subject: "Votre réservation est annulée",
    html: `<h1>Réservation annulée</h1>
<p>Le séjour du ${payload.from} au ${payload.to} a été annulé.</p>
<p><a href="${baseUrl}/">Chercher un autre logement</a></p>`,
  }),
};
