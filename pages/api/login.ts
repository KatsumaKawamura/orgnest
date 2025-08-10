// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // 公開OK
  process.env.SUPABASE_SERVICE_ROLE_KEY! // サーバのみ（絶対に公開NG）
);

// ユーザー未発見時のタイミングばらつきを抑えるためのダミーハッシュ（任意）
const DUMMY_HASH =
  "$2a$10$X9fQ1b6wx1e5Cq8Wb8o7xO4qS8Q0XGk2q4p7Pp9YtR6Q8Yqk0yP1e"; // bcrypt.hashSync("dummy", 10) など

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!process.env.JWT_SECRET) {
    // 運用ミス検知
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const { login_id, password } = req.body ?? {};

  if (
    typeof login_id !== "string" ||
    typeof password !== "string" ||
    !login_id ||
    !password
  ) {
    return res
      .status(400)
      .json({ error: "USER_IDとPASSWORDを入力してください" });
  }

  // ユーザー取得（列を最小化 & 未ヒットは data:null）
  const { data: user, error: fetchErr } = await supabase
    .from("users")
    .select("user_id, login_id, pass")
    .eq("login_id", login_id)
    .maybeSingle();

  // 共通の失敗レスポンス（メッセージは固定で良い）
  const fail = () =>
    res.status(401).json({ error: "USER_IDまたはPASSWORDが違います" });

  if (fetchErr) {
    // 読み取り失敗は 500（DB障害など）
    return res.status(500).json({ error: "サーバーエラーが発生しました" });
  }

  if (!user) {
    // 未発見でもダミー比較を挟んでタイミング揃え（任意）
    await bcrypt.compare(password, DUMMY_HASH).catch(() => null);
    return fail();
  }

  // パスワード検証
  const isMatch = await bcrypt.compare(password, user.pass);
  if (!isMatch) return fail();

  // JWT 生成（payload は最小限）
  const token = jwt.sign(
    { sub: user.user_id, login_id: user.login_id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // HS256 が既定
  );

  // Cookie に保存
  res.setHeader(
    "Set-Cookie",
    serialize("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // 必要なら "strict" に
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7日
    })
  );

  return res.status(200).json({ message: "ログイン成功" });
}
