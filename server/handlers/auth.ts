import type { Request } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";

export async function loginHandler(body: any) {
  const { secretKey } = body;
  const adminKey = process.env.ADMIN_SECRET_KEY;

  if (!adminKey) {
    throw new Error("Server not configured");
  }

  if (secretKey !== adminKey) {
    throw new Error("Invalid secret key");
  }

  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "2d" });
  return { success: true, token };
}

export async function meHandler(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return { authenticated: false };

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { admin: boolean };
    return { authenticated: !!decoded.admin };
  } catch (err) {
    return { authenticated: false };
  }
}
