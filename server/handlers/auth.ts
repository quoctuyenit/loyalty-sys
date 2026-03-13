export async function loginHandler(body: any) {
  const { secretKey } = body;
  const adminKey = process.env.ADMIN_SECRET_KEY;

  if (!adminKey) {
    throw new Error("Server not configured");
  }

  if (secretKey === adminKey) {
    return { success: true };
  }

  throw new Error("Invalid secret key");
}
