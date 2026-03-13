import { db } from "./db.js";
import { customers } from "@shared/schema.js";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");
  
  const existingCustomers = await db.select().from(customers);
  if (existingCustomers.length === 0) {
    console.log("Adding mock customers...");
    await db.insert(customers).values([
      {
        id: "7Gk92LpQ8D",
        phone: "0901234567",
        name: "Nguyen Van A",
        points: 120
      },
      {
        id: "Xm8L2kPq9A",
        phone: "0987654321",
        name: "Tran Thi B",
        points: 45
      },
      {
        id: "v9PqL2kM4B",
        phone: "0912345678",
        name: "Le Van C",
        points: 250
      }
    ]);
    console.log("Mock customers added successfully.");
  } else {
    console.log("Database already has customers, skipping seed.");
  }
}

seed().catch(console.error).finally(() => process.exit(0));
