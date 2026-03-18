export async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.authenticated;
  } catch (err) {
    return false;
  }
}

export async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("Logout failed", err);
  }
}

