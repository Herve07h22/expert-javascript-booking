import { fakeAccommodations } from "./fakeAccommodations.js";
import type { Accommodation, AccommodationRepository } from "../domain/ports.js";

export class MemoryAccommodationRepository implements AccommodationRepository {
  private readonly accommodations: Accommodation[] = fakeAccommodations;

  async findById(id: string): Promise<Accommodation | null> {
    return this.accommodations.find((a) => a.id === id) ?? null;
  }

  async all(): Promise<Accommodation[]> {
    return this.accommodations;
  }
}
