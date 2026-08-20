import type { Subscribers } from "../domain/ports.js";
import type { Dependencies } from "../domain/ports.js";
import type { DomainEvent } from "../domain/events.js";

/**
 * Les abonnés vivent avec l'infrastructure, là où on assemble l'application.
 * Le domaine ignorait qu'un service de mail existe avant l'événement,
 * il l'ignore après.
 */
async function notifyTenantAndHost(
  event: DomainEvent<never>,
  dependencies: Dependencies
): Promise<void> {
  const payload = event.payload as unknown as {
    tenantId: string;
    accommodationId: string;
  };

  // Un abonné a le droit de relire l'état : l'événement porte des
  // identifiants, pas des adresses email — elles peuvent changer.
  const tenant = await dependencies.users.findById(payload.tenantId);
  const accommodation = await dependencies.accommodations.findById(
    payload.accommodationId
  );
  if (!tenant || !accommodation) return;
  const host = await dependencies.users.findById(accommodation.hostId);
  if (!host) return;

  for (const recipient of [tenant, host]) {
    await dependencies.notifications.send({
      type: event.type,
      to: recipient.email,
      payload: event.payload,
    });
  }
}

export const subscribers: Subscribers = {
  BookingConfirmed: [notifyTenantAndHost],
  BookingCancelled: [notifyTenantAndHost],
};
