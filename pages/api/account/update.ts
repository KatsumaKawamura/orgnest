// @/pages/api/user/update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import * as cookie from "cookie";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 小文字英字と _ のみ 1〜32 文字
const LOGIN_ID_RE = /^[a-z_]{1,32}$/;
// パスワード最小長（必要に応じて強化）
const PASSWORD_MIN = 4;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Cookie からセッショントークン取得
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.session;
    if (!token) return res.status(401).json({ error: "認証情報がありません" });

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ error: "サーバ設定エラー: JWT_SECRET 未設定" });
    }

    // JWT 検証（sub に user_id）
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      sub?: string;
      [k: string]: unknown;
    };
    const userId = decoded?.sub;
    if (!userId) return res.status(400).json({ error: "トークン形式エラー" });

    const { login_id, password, user_name, contact } = req.body ?? {};

    // 何も変更が無い
    if (
      typeof login_id === "undefined" &&
      typeof password === "undefined" &&
      typeof user_name === "undefined" &&
      typeof contact === "undefined"
    ) {
      return res.status(400).json({ error: "更新する項目がありません" });
    }

    // 既存の自分の値を取得（login_id重複チェックのため）
    const { data: current, error: curErr } = await supabase
      .from("users")
      .select("user_id, login_id")
      .eq("user_id", userId)
      .single();

    if (curErr || !current) {
      return res.status(401).json({ error: "認証エラー" });
    }

    // バリデーション & 可用性確認
    if (typeof login_id !== "undefined") {
      if (!LOGIN_ID_RE.test(String(login_id))) {
        return res.status(400).json({
          error: "LOGIN_ID_INVALID",
          message: "login_idの形式が不正です",
        });
      }
      // 変更がある場合のみ重複チェック
      if (String(login_id) !== String(current.login_id)) {
        const { data: dup, error: dupErr } = await supabase
          .from("users")
          .select("user_id")
          .eq("login_id", String(login_id))
          .limit(1);

        if (dupErr) {
          return res.status(500).json({ error: "重複チェックに失敗しました" });
        }
        if (dup && dup.length > 0) {
          // 自分以外の誰かが同じlogin_id
          if (dup[0].user_id !== userId) {
            return res.status(409).json({ error: "LOGIN_ID_TAKEN" });
          }
        }
      }
    }

    let passwordHash: string | undefined = undefined;
    if (typeof password !== "undefined") {
      const raw = String(password);
      if (raw.length < PASSWORD_MIN) {
        return res.status(400).json({
          error: "PASSWORD_TOO_SHORT",
          message: "passwordが短すぎます",
        });
      }
      passwordHash = await bcrypt.hash(raw, 10);
    }

    // UPDATE パッチ
    const patch: Record<string, unknown> = {};
    if (typeof login_id !== "undefined") patch.login_id = String(login_id);
    if (typeof user_name !== "undefined") patch.user_name = user_name ?? null;
    if (typeof contact !== "undefined") patch.contact = contact ?? null;
    if (typeof passwordHash !== "undefined") patch.pass = passwordHash; // 生パスは保存しない

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "更新対象の項目がありません" });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update(patch)
      .eq("user_id", userId);

    if (updateError) {
      return res.status(500).json({ error: "更新に失敗しました" });
    }

    // 更新後ユーザーを返す（passwordは返さない）
    const { data: me, error: fetchError } = await supabase
      .from("users")
      .select("login_id, user_name, contact")
      .eq("user_id", userId)
      .single();

    if (fetchError || !me) {
      return res.status(500).json({ error: "更新後の取得に失敗しました" });
    }

    return res.status(200).json({ user: me });
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ error: "トークン期限切れ" });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ error: "無効なトークン" });
    }
    console.error("[user/update] unexpected:", err);
    return res.status(401).json({ error: "認証エラー" });
  }
}
