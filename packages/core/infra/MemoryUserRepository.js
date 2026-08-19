import { encrypt } from "../domain/usecases/login.js";

export class MemoryUserRepository {
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
