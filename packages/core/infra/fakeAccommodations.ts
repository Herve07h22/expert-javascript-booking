import { AccommodationId, UserId } from "../domain/ids.js";
import type { Accommodation } from "../domain/ports.js";

const make = (
  id: string,
  hostId: string,
  name: string,
  location: string,
  host: string,
  capacity: number,
  price: number
): Accommodation => ({
  id: AccommodationId(id),
  hostId: UserId(hostId),
  name,
  location,
  host,
  capacity,
  price,
  imageUrl: `https://picsum.photos/seed/${id}/400/300`,
});

// `hostId` référence un utilisateur : une clé étrangère produite par le besoin
// (prévenir le propriétaire), et non par un schéma dessiné à l'avance.
//
// Des données volontairement variées : des jeux d'essai tous identiques
// masquent la moitié des bugs d'affichage — un nom trop long qui déborde,
// un prix à trois chiffres qui casse l'alignement.
export const fakeAccommodations: Accommodation[] = [
  make("accommodation-1", "host-1", "Villa 6 pièces avec piscine", "Saint-Rémy-de-Provence", "Claire Vasseur", 8, 230),
  make("accommodation-2", "host-1", "Mas provençal rénové", "Gordes", "Claire Vasseur", 6, 180),
  make("accommodation-3", "host-2", "Studio vue mer", "Cassis", "Yanis Brahimi", 2, 95),
  make("accommodation-4", "host-2", "Chalet en bord de piste", "Le Grand-Bornand", "Yanis Brahimi", 10, 320),
  make("accommodation-5", "host-3", "Gîte au calme", "Sciotot", "Marek Nowak", 4, 110),
  make("accommodation-6", "host-3", "Loft d'architecte", "Bordeaux", "Marek Nowak", 3, 140),
];
