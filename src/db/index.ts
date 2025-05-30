import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { addresses, addressesRelations, users, usersRelations } from "./schema";
export const db = drizzle(process.env.DATABASE_URL!, {
  schema: {
    users,
    addresses,
    usersRelations,
    addressesRelations,
  },
});
