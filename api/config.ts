import { Request, Response } from "express";

export default function handler(req: Request, res: Response) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  return res.json({
    pointsExpiryMonths: Math.max(1, parseInt(process.env.POINTS_EXPIRY_MONTHS || "12", 10) || 12),
  });
}
