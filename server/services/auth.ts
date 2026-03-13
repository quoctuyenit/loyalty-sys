export async function login(secretKey: string) {
  const adminKey = process.env.ADMIN_SECRET_KEY;

  if (!adminKey) {
    throw new Error("Server not configured");
  }

  if (secretKey === adminKey) {
    return { success: true };
  }

  throw new Error("Invalid secret key");
}
