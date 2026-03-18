export function getToken(): string | null {
  return localStorage.getItem("admin_jwt_token");
}

export function setToken(token: string) {
  localStorage.setItem("admin_jwt_token", token);
}

export async function checkAuth(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.authenticated;
  } catch (err) {
    return false;
  }
}

export async function logout() {
  localStorage.removeItem("admin_jwt_token");
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("Logout failed", err);
  }
}

