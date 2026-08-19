export const bookingStatus = {
  confirmed: "confirmed",
  cancelled: "cancelled",
};

/**
 * Une réservation : une ENTITÉ, parce qu'elle a une identité propre.
 *
 * Elle est gelée, et pourtant mutable au sens du chapitre 3 : ce qui change au
 * fil du temps, c'est la réservation dans le système, pas l'objet en mémoire.
 * `cancel()` retourne une nouvelle instance portant le même identifiant.
 */
export class Booking {
  #id;
  #tenantId;
  #accommodationId;
  #guests;
  #stay;
  #status;

  constructor({ id, tenantId, accommodationId, guests, stay, status }) {
    this.#id = id;
    this.#tenantId = tenantId;
    this.#accommodationId = accommodationId;
    this.#guests = guests;
    this.#stay = stay;
    this.#status = status;
    Object.freeze(this);
  }

  static confirm({ id, tenantId, accommodationId, guests, stay }) {
    return new Booking({
      id,
      tenantId,
      accommodationId,
      guests,
      stay,
      status: bookingStatus.confirmed,
    });
  }

  get id() {
    return this.#id;
  }

  get tenantId() {
    return this.#tenantId;
  }

  get accommodationId() {
    return this.#accommodationId;
  }

  get guests() {
    return this.#guests;
  }

  get stay() {
    return this.#stay;
  }

  get status() {
    return this.#status;
  }

  isActive() {
    return this.#status === bookingStatus.confirmed;
  }

  belongsTo(user) {
    return this.#tenantId === user.id;
  }

  /** La même réservation, annulée. Aucun setStatus : une seule transition nommée. */
  cancel() {
    return new Booking({
      id: this.#id,
      tenantId: this.#tenantId,
      accommodationId: this.#accommodationId,
      guests: this.#guests,
      stay: this.#stay,
      status: bookingStatus.cancelled,
    });
  }

  toJSON() {
    return {
      id: this.#id,
      tenantId: this.#tenantId,
      accommodationId: this.#accommodationId,
      guests: this.#guests.toJSON(),
      stay: this.#stay.toJSON(),
      status: this.#status,
    };
  }
}
