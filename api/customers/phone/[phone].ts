import { getCustomerByPhoneHandler } from "../../../server/handlers/customers.js";
import { storage } from "../../../server/storage.js";

export default async function handler(req: any, res: any) {
  const { phone } = req.query;

  if (req.method === "GET") {
    try {
      const customer = await getCustomerByPhoneHandler(storage, phone as string);
      return res.json(customer);
    } catch (err: any) {
      if (err.message === "Invalid phone parameter") {
        return res.status(400).json({ message: err.message });
      }
      return res.status(404).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
