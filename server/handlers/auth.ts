import type { Request } from "express";

export async function loginHandler(req: Request, body: any) {
  const { secretKey } = body;
  const adminKey = process.env.ADMIN_SECRET_KEY;

  if (!adminKey) {
    throw new Error("Server not configured");
  }

  if (secretKey !== adminKey) {
    throw new Error("Invalid secret key");
  }

  // Regenerate session to prevent session fixation
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });

  req.session.authenticated = true;
  return { success: true };
}

export async function logoutHandler(req: Request) {
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });
}

export function meHandler(req: Request) {
  return { authenticated: !!req.session?.authenticated };
}
