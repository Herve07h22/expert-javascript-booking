import { encrypt } from "../domain/usecases/login";

export class MemoryUserRepository {
  // On indique par défaut un utilisateur déjà enregistré
  _users = [
    {
      id: "tenant-1",
      email: "faketenant@mail.com",
      encryptedPassword: encrypt("secret"),
    },
  ];
  async findByEmail(email) {
    return this._users.find((user) => user.email === email);
  }
}
