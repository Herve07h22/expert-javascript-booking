// Le seul endroit de l'application où un `new Date()` a le droit d'exister
// à partir d'une donnée métier : Intl réclame un instant.
// `timeZone: "UTC"` est indispensable — nous construisons minuit UTC, et nous
// reformatons dans le même fuseau, sinon un utilisateur à Mexico lirait la veille.
const dayFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDay(iso) {
  return dayFormat.format(new Date(`${iso}T00:00:00Z`));
}

export function formatPrice(euros) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(euros);
}
