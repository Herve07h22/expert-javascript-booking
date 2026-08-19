/**
 * Le texte n'est pas au serveur : il est ici, le seul endroit qui sache à qui
 * il parle. Le serveur envoie un code stable, le client en fait une phrase.
 *
 * Ne jamais afficher error.message brut : il est écrit pour vous, pas pour
 * l'utilisateur. Et ne jamais afficher une erreur sans dire quoi faire.
 */
const messages = {
  NETWORK_ERROR: () => "Connexion perdue. Vérifiez votre réseau et réessayez.",
  INVALID_CREDENTIALS: () => "Email ou mot de passe incorrect.",
  INVALID_SESSION: () => "Votre session a expiré. Merci de vous reconnecter.",
  SHOULD_BE_LOGGED: () => "Connectez-vous pour continuer.",
  ACCOMMODATION_NOT_AVAILABLE: () =>
    "Ce logement vient d'être réservé. Essayez d'autres dates.",
  ACCOMMODATION_TOO_SMALL: ({ capacity, guests }) =>
    `Ce logement accueille ${capacity} personnes, vous êtes ${guests}.`,
  UNKNOWN_ACCOMMODATION: () => "Ce logement n'existe plus.",
  UNKNOWN_BOOKING: () => "Cette réservation est introuvable.",
  BOOKING_ALREADY_CANCELLED: () => "Cette réservation est déjà annulée.",
  STAY_ALREADY_STARTED: () => "Le séjour a commencé : il n'est plus annulable.",
  NOT_A_CALENDAR_DAY: () => "Les dates saisies ne sont pas valides.",
  STAY_MUST_LAST_AT_LEAST_ONE_NIGHT: () =>
    "Le départ doit être au moins le lendemain de l'arrivée.",
  STAY_MUST_START_IN_THE_FUTURE: () =>
    "La réservation doit être faite au moins un jour à l'avance.",
  NEEDS_AT_LEAST_ONE_ADULT: () => "Il faut au moins un adulte.",
  INVALID_CHILDREN_COUNT: () => "Le nombre d'enfants est invalide.",
};

export function toMessage(error) {
  const template = messages[error?.code];
  // Un code inconnu — une version du serveur plus récente que celle du
  // navigateur — ne doit jamais afficher "undefined".
  return template
    ? template(error.details ?? {})
    : "Une erreur est survenue. Réessayez.";
}
