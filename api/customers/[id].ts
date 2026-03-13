import { z } from "zod";
import { storage } from "../../server/storage.js";
import { getCustomerHandler, updateCustomerHandler } from "../../server/handlers/customers.js";

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const customer = await getCustomerHandler(storage, id as string);
      return res.json(customer);
    } catch (err: any) {
      if (err.message === "Invalid ID parameter") {
        return res.status(400).json({ message: err.message });
      }
      return res.status(404).json({ message: err.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const customer = await updateCustomerHandler(storage, id as string, req.body);
      return res.status(200).json(customer);
    } catch (err: any) {
      if (err.message === "Invalid ID parameter") {
        return res.status(400).json({ message: err.message });
      }
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
