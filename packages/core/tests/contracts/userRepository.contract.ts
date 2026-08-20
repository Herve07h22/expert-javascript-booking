import { it, expect, beforeEach } from "vitest";
import type { UserRepository } from "../../domain/ports.js";

/** Le contrat que doit tenir n'importe quel UserRepository. */
export function userRepositoryContract(
  makeRepository: () => Promise<UserRepository>
) {
  let repository: UserRepository;
  beforeEach(async () => {
    repository = await makeRepository();
  });

  it("retourne null quand l'email est inconnu", async () => {
    expect(await repository.findByEmail("personne@mail.com")).toBe(null);
  });

  it("retourne null quand l'identifiant est inconnu", async () => {
    expect(await repository.findById("tenant-404")).toBe(null);
  });

  // Une question métier — une adresse email est-elle sensible à la casse ? —
  // posée une fois, répondue une fois, garantie des deux côtés.
  it("trouve un utilisateur quelle que soit la casse de son email", async () => {
    const found = await repository.findByEmail("FakeTenant@Mail.com");
    expect(found).not.toBe(null);
    expect(found!.id).toBe("tenant-1");
  });

  it("ne laisse jamais sortir un mot de passe en clair", async () => {
    const found = await repository.findByEmail("faketenant@mail.com");
    expect((found as unknown as { password?: string }).password).toBeUndefined();
    expect(found!.hashedPassword).toBeDefined();
  });
}
