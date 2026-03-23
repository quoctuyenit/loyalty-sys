import { logout } from "@/lib/auth";
import { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {

  try {
    const result = await logout();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
