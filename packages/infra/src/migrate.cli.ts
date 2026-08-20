import { migrate } from "./migrate.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

migrate(databaseUrl)
  .then((applied) => {
    console.log(
      applied.length === 0
        ? "schema is up to date"
        : `applied: ${applied.join(", ")}`
    );
  })
  .catch((error: unknown) => {
    console.error(String(error));
    process.exit(1);
  });
