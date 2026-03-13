import { z } from "zod";
import * as CustomerService from "../../server/services/customers";

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    try {
      const search = req.query.search as string | undefined;
      const allCustomers = await CustomerService.listCustomers(search);
      return res.json(allCustomers);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const customer = await CustomerService.createCustomer(req.body);
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
