// pages/api/auth/check-login-id.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const LOGIN_ID_RE = /^[a-z0-9_]{1,32}$/;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// 共通ヘッダ（キャッシュ無効化）
const noCache = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const login_id = String(req.query.login_id || "").trim();

  // 形式チェック
  if (!LOGIN_ID_RE.test(login_id)) {
    return res
      .status(400)
      .setHeader("Cache-Control", noCache["Cache-Control"])
      .setHeader("Pragma", noCache.Pragma)
      .json({ error: "LOGIN_ID_INVALID" });
  }

  const { count, error } = await supabase
    .from("users")
    .select("user_id", { head: true, count: "exact" })
    .eq("login_id", login_id);

  if (error) {
    return res
      .status(500)
      .setHeader("Cache-Control", noCache["Cache-Control"])
      .setHeader("Pragma", noCache.Pragma)
      .json({ error: "INTERNAL_ERROR" });
  }

  const available = (count ?? 0) === 0;
  return res
    .status(200)
    .setHeader("Cache-Control", noCache["Cache-Control"])
    .setHeader("Pragma", noCache.Pragma)
    .json({ available });
}
