type Payload = Record<string, unknown>;

// Les gabarits vivent dans l'infrastructure : le domaine décide QUOI notifier,
// l'infrastructure décide COMMENT. Un test de domaine qui vérifie une balise
// <h1> casse à la première retouche du graphiste.
export const templates: Record<
  string,
  (payload: Payload, baseUrl: string) => { subject: string; html: string }
> = {
  BookingConfirmed: (payload, baseUrl) => ({
    subject: "Votre réservation est confirmée",
    html: `<h1>Réservation confirmée</h1>
<p>Du ${String(payload.from)} au ${String(payload.to)}, pour ${String(
      payload.guests
    )} voyageurs.</p>
<p><a href="${baseUrl}/bookings">Voir la réservation</a></p>`,
  }),

  BookingCancelled: (payload, baseUrl) => ({
    subject: "Votre réservation est annulée",
    html: `<h1>Réservation annulée</h1>
<p>Le séjour du ${String(payload.from)} au ${String(payload.to)} a été annulé.</p>
<p><a href="${baseUrl}/">Chercher un autre logement</a></p>`,
  }),
};
