/**
 * Les abonnés vivent avec l'infrastructure, là où on assemble l'application.
 * Le domaine ignorait qu'un service de mail existe avant l'événement,
 * il l'ignore après.
 */
export const subscribers = {
  BookingConfirmed: [notifyTenantAndHost],
  BookingCancelled: [notifyTenantAndHost],
};

/**
 * Un abonné a le droit de relire l'état du système : l'événement porte des
 * identifiants, pas des adresses email — elles peuvent changer entre
 * l'émission et la lecture.
 */
async function notifyTenantAndHost(event, dependencies) {
  const { tenantId, accommodationId } = event.payload;

  const tenant = await dependencies.users.findById(tenantId);
  const accommodation = await dependencies.accommodations.findById(
    accommodationId
  );
  const host = await dependencies.users.findById(accommodation.hostId);

  for (const recipient of [tenant, host]) {
    await dependencies.notifications.send({
      type: event.type,
      to: recipient.email,
      payload: event.payload,
    });
  }
}
