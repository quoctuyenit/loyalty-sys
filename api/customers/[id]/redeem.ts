import { storage } from "../../../server/storage.js";
import { redeemPointsHandler } from "../../../server/handlers/customers.js";

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const customer = await redeemPointsHandler(storage, id as string);
    return res.status(200).json(customer);
  } catch (err: any) {
    if (err.message === "Customer not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === "Insufficient points for redemption") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: err.message, stack: err.stack });
  }
}
