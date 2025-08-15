// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { assertValidRegister, RegisterBody } from "@/lib/validators/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  let body: RegisterBody;
  try {
    assertValidRegister(req.body);
    body = req.body as RegisterBody;
  } catch (e: any) {
    return res.status(400).json({ error: e?.message ?? "不正な入力です" });
  }

  const { login_id, password, contact, user_name } = body;

  try {
    // 既存チェック
    const { data: exists, error: selErr } = await supabase
      .from("users")
      .select("user_id")
      .eq("login_id", login_id)
      .limit(1);
    if (selErr) throw selErr;
    if (exists && exists.length > 0) {
      return res
        .status(409)
        .json({ error: "この USER_ID は既に使用されています" });
    }

    // 生成
    const user_id = randomUUID();
    const pass = await bcrypt.hash(password, 12); // ← 'pass' 列にハッシュを入れる

    const { error: insErr } = await supabase.from("users").insert([
      {
        user_id,
        login_id,
        pass, // ← ここが列名 'pass'
        contact: contact || null,
        user_name: user_name || null,
      },
    ]);
    if (insErr) throw insErr;

    return res.status(200).json({ ok: true, user_id, login_id });
  } catch (e: any) {
    console.error("[register] error", e);
    return res.status(500).json({ error: "登録処理でエラーが発生しました" });
  }
}
