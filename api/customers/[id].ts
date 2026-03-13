import { z } from "zod";
import * as CustomerService from "../../server/services/customers";

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID parameter" });
  }

  if (req.method === "GET") {
    try {
      const customer = await CustomerService.getCustomer(id);
      return res.json(customer);
    } catch (err: any) {
      return res.status(404).json({ message: err.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const customer = await CustomerService.updateCustomer(id, req.body);
      return res.status(200).json(customer);
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
