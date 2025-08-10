// /pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // 公開可
  process.env.SUPABASE_SERVICE_ROLE_KEY! // サーバ専用（絶対に公開NG）
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const { login_id, password, contact, user_name } = req.body ?? {};

  // 最低限のバリデーション
  if (
    typeof login_id !== "string" ||
    typeof password !== "string" ||
    !login_id ||
    !password
  ) {
    return res.status(400).json({ error: "USER_IDとPASSWORDは必須です" });
  }

  // 既存チェック（未ヒット=正常）
  const { data: existing, error: existErr } = await supabase
    .from("users")
    .select("login_id")
    .eq("login_id", login_id)
    .maybeSingle();

  if (existErr) {
    return res.status(500).json({ error: "確認に失敗しました" });
  }
  if (existing) {
    return res.status(409).json({ error: "このUSER_IDは既に使用されています" });
  }

  // パスワードハッシュ
  const hashedPass = await bcrypt.hash(password, 10);

  // 挿入（user_id は DB 側の DEFAULT gen_random_uuid() に任せる）
  const { data, error } = await supabase
    .from("users")
    .insert({
      login_id,
      pass: hashedPass,
      contact: contact || null,
      user_name: user_name || null,
    })
    .select()
    .single();

  if (error) {
    // UNIQUE違反など
    const pgCode = (error as any)?.code;
    if (pgCode === "23505") {
      return res
        .status(409)
        .json({ error: "このUSER_IDは既に使用されています" });
    }
    return res.status(500).json({ error: "登録に失敗しました" });
  }

  return res.status(200).json({ message: "登録成功", user: data });
}
