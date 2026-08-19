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
    // Le propriétaire est un utilisateur de la plateforme, pas une mention
    // sur une fiche : il signe un contrat et touchera une commission.
    { id: "host-1", email: "claire@mail.com", hashedPassword: "hashed:secret" },
    { id: "host-2", email: "yanis@mail.com", hashedPassword: "hashed:secret" },
    { id: "host-3", email: "marek@mail.com", hashedPassword: "hashed:secret" },
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
