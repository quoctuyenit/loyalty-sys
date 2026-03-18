import { loginHandler } from "../../server/handlers/auth.js";
import { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const result = await loginHandler(req, req.body);
    return res.json(result);
  } catch (err: any) {
    if (err.message === "Server not configured") {
      return res.status(500).json({ success: false, message: err.message });
    }
    return res.status(401).json({ success: false, message: err.message });
  }
}
