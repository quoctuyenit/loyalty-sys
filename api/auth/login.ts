import * as AuthService from "../../server/services/auth";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { secretKey } = req.body;
    const result = await AuthService.login(secretKey);
    return res.json(result);
  } catch (err: any) {
    if (err.message === "Server not configured") {
      return res.status(500).json({ success: false, message: err.message });
    }
    return res.status(401).json({ success: false, message: "Invalid secret key" });
  }
}
