const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

export function isAuthenticated(): boolean {
    const auth = localStorage.getItem("admin_authenticated");
    const expiry = Number(localStorage.getItem("admin_auth_expiry"));

    if (!auth || !expiry || Date.now() > expiry) {
        logout();
        return false;
    }

    // Sliding expiry: refresh on each visit
    localStorage.setItem("admin_auth_expiry", (Date.now() + TWO_DAYS).toString());
    return true;
}

export function setAuthenticated() {
    localStorage.setItem("admin_authenticated", "true");
    localStorage.setItem("admin_auth_expiry", (Date.now() + TWO_DAYS).toString());
}

export function logout() {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_auth_expiry");
}
