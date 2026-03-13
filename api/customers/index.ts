import { z } from "zod";
import { storage } from "../../server/storage.js";
import { listCustomersHandler, createCustomerHandler } from "../../server/handlers/customers.js";

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    try {
      const allCustomers = await listCustomersHandler(storage, req.query);
      return res.json(allCustomers);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const customer = await createCustomerHandler(storage, req.body);
      return res.status(201).json(customer);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
