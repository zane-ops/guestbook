import { drizzle } from "drizzle-orm/node-postgres";

// You can specify any property from the node-postgres connection options
export const db = drizzle({
  logger: true,
  connection: {
    connectionString: process.env.DATABASE_URL!
  }
});
