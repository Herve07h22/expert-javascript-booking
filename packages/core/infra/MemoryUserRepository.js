export class MemoryUserRepository {
  _users = [
    {
      id: "tenant-1",
      email: "faketenant@mail.com",
      hashedPassword: "hashed:secret",
    },
    {
      id: "tenant-2",
      email: "otherguest@mail.com",
      hashedPassword: "hashed:secret",
    },
  ];

  async findByEmail(email) {
    return (
      this._users.find(
        (user) => user.email.toLowerCase() === String(email).toLowerCase()
      ) ?? null
    );
  }

  async findById(id) {
    return this._users.find((user) => user.id === id) ?? null;
  }
}
