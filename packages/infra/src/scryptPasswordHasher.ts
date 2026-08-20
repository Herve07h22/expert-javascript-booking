import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { PasswordHasher } from "@booking/core";

const derive = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/**
 * Un mot de passe ne se chiffre pas, il se HACHE : on ne veut pas pouvoir le
 * retrouver, seulement vérifier qu'on nous représente le bon.
 *
 * `scrypt` est lent par construction et salé par utilisateur. `argon2id` est
 * préférable aujourd'hui — au prix d'une dépendance native, que ce dépôt
 * évite pour rester installable partout. Le port est le même.
 *
 * La comparaison passe par timingSafeEqual : l'égalité de chaînes s'arrête au
 * premier caractère différent, et le temps de réponse trahit alors le nombre
 * de caractères corrects.
 */
export const scryptPasswordHasher: PasswordHasher = {
  hash: async (plain) => {
    const salt = randomBytes(16);
    const key = await derive(plain, salt, KEY_LENGTH);
    return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
  },

  verify: async (plain, hashed) => {
    const [scheme, saltHex, keyHex] = String(hashed).split("$");
    if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
    const key = Buffer.from(keyHex, "hex");
    const candidate = await derive(
      String(plain),
      Buffer.from(saltHex, "hex"),
      key.length
    );
    return timingSafeEqual(key, candidate);
  },
};
