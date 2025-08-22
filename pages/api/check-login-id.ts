// pages/api/check-login-id.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

// login_id は小文字英字と "_" のみ、1〜32 文字
const LOGIN_ID_RE = /^[a-z_]{1,32}$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 405: 許可メソッド
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // キャッシュ無効化（古い可用性を掴まないように）
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0"
  );
  res.setHeader("Pragma", "no-cache");

  // 入力取得（GET: query / POST: body）
  const login_id_raw =
    req.method === "GET"
      ? (req.query.login_id as string | undefined)
      : (req.body?.login_id as string | undefined);

  if (!login_id_raw) {
    return res.status(400).json({ error: "login_id is required" });
  }

  const login_id = String(login_id_raw).trim();

  // 形式バリデーション（フロントと同一基準）
  if (!LOGIN_ID_RE.test(login_id)) {
    return res.status(400).json({ error: "LOGIN_ID_INVALID" });
  }

  // 重複チェック
  // head: true でボディを返さず件数のみ確認
  const { count, error } = await supabase
    .from("users")
    .select("user_id", { head: true, count: "exact" })
    .eq("login_id", login_id);

  if (error) {
    // PostgRESTの「該当無し」は error にならないため、基本ここはサーバエラー系のみ
    return res
      .status(500)
      .json({ error: "internal_error", message: error.message });
  }

  const available = (count ?? 0) === 0;
  return res.status(200).json({ available });
}
