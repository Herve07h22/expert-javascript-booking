/**
 * Volontairement stupide, et volontairement rapide.
 * argon2 est CONÇU pour prendre 100 ms : multiplié par le nombre de tests
 * qui commencent par un login, la suite passerait de 40 ms à plusieurs secondes.
 * Une suite lente est une suite qu'on cesse de lancer.
 */
export const testPasswordHasher = {
  hash: async (plain) => `hashed:${plain}`,
  verify: async (plain, hashed) => hashed === `hashed:${plain}`,
};
