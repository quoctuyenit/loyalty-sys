import * as CustomerService from "../../../server/services/customers";

export default async function handler(req: any, res: any) {
  const { phone } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ message: "Invalid phone parameter" });
  }

  try {
    const customer = await CustomerService.getCustomerByPhone(phone);
    return res.json(customer);
  } catch (err: any) {
    return res.status(404).json({ message: err.message });
  }
}
