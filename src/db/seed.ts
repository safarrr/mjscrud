import { eq } from "drizzle-orm";
import { db } from ".";
import { addresses, users } from "./schema";
async function seed() {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, "demo"));
  if (existing.length == 0) {
    await db.insert(users).values([
      {
        username: "demo",
        hashPassword:
          "746d50f18be10b4d618e3ad4dd361682:defb3e6a2e7778286a27686b6de0b38f193d8eb0f5a6c0b8ef94a0592c4885f586b4257115bb3237a048815f3a27ef042650317b8a0494cbf2e24915f4fed3f1",
        firstname: "demo",
        lastname: "demo",
      },
    ]);
  }
  if (existing) {
    await db.insert(addresses).values([
      {
        userId: existing[0].id,
        street: "Jl. Merdeka No. 10",
        city: "Jakarta",
        province: "DKI Jakarta",
        postalCode: "10110",
      },
    ]);
  }
  console.log("Seed berhasil dijalankan");
}

seed()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
