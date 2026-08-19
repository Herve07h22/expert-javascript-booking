// `hostId` référence un utilisateur : c'est une clé étrangère, produite
// par le besoin (prévenir le propriétaire) et non par un schéma dessiné à l'avance.
// Des données volontairement variées : des jeux d'essai tous identiques
// masquent la moitié des bugs d'affichage.
// Le `seed` dans l'URL de picsum évite que l'image change à chaque rechargement.
export const fakeAccommodations = [
  {
    id: "accommodation-1",
    hostId: "host-1",
    name: "Villa 6 pièces avec piscine",
    location: "Saint-Rémy-de-Provence",
    host: "Claire Vasseur",
    capacity: 8,
    price: 230,
    imageUrl: "https://picsum.photos/seed/acc1/400/300",
  },
  {
    id: "accommodation-2",
    hostId: "host-1",
    name: "Mas provençal rénové",
    location: "Gordes",
    host: "Claire Vasseur",
    capacity: 6,
    price: 180,
    imageUrl: "https://picsum.photos/seed/acc2/400/300",
  },
  {
    id: "accommodation-3",
    hostId: "host-2",
    name: "Studio vue mer",
    location: "Cassis",
    host: "Yanis Brahimi",
    capacity: 2,
    price: 95,
    imageUrl: "https://picsum.photos/seed/acc3/400/300",
  },
  {
    id: "accommodation-4",
    hostId: "host-2",
    name: "Chalet en bord de piste",
    location: "Le Grand-Bornand",
    host: "Yanis Brahimi",
    capacity: 10,
    price: 320,
    imageUrl: "https://picsum.photos/seed/acc4/400/300",
  },
  {
    id: "accommodation-5",
    hostId: "host-3",
    name: "Gîte au calme",
    location: "Sciotot",
    host: "Marek Nowak",
    capacity: 4,
    price: 110,
    imageUrl: "https://picsum.photos/seed/acc5/400/300",
  },
  {
    id: "accommodation-6",
    hostId: "host-3",
    name: "Loft d'architecte",
    location: "Bordeaux",
    host: "Marek Nowak",
    capacity: 3,
    price: 140,
    imageUrl: "https://picsum.photos/seed/acc6/400/300",
  },
];
