import { logoutHandler } from "../../server/handlers/auth.js";
import { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {

  try {
    const result = await logoutHandler();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
