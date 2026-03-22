import { storage } from "../../../server/storage.js";
import { addPointsHandler } from "../../../server/handlers/customers.js";
import { z } from "zod";

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const customer = await addPointsHandler(storage, id as string, req.body);
    return res.status(200).json(customer);
  } catch (err: any) {
    if (err.message === "Customer not found") {
      return res.status(404).json({ message: err.message });
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
