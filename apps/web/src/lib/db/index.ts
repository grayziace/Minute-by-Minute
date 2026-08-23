import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!client) {
    client = postgres(connectionString, { prepare: false });
    db = drizzle(client, { schema });
  }
  return db!;
}

export { schema };
