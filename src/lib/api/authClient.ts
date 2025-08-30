// lib/api/authClient.ts
export async function checkLoginIdAvailable(
  login_id: string
): Promise<boolean | "unknown"> {
  try {
    const res = await fetch(
      `/api/auth/check-login-id?login_id=${encodeURIComponent(login_id)}`,
      {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      }
    );
    if (!res.ok) {
      // 形式NGは 400 LOGIN_ID_INVALID → unknown 扱い
      return "unknown";
    }
    const data = await res.json().catch(() => ({}));
    return typeof data?.available === "boolean" ? data.available : "unknown";
  } catch {
    return "unknown";
  }
}
