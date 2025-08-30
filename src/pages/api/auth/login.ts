// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const login_id = String(req.body?.login_id ?? "");
  const password = String(req.body?.password ?? "");
  if (!login_id || !password) {
    return res
      .status(400)
      .json({ error: "USER_ID と PASSWORD を入力してください" });
  }

  try {
    // 1) ユーザー取得（列名は 'pass'）
    const { data: rows, error: selErr } = await supabase
      .from("users")
      .select("user_id, login_id, pass")
      .eq("login_id", login_id)
      .limit(1);

    if (selErr) {
      if (isDev) console.error("[login] select error:", selErr);
      return res.status(500).json({
        error: isDev
          ? `DB error: ${selErr.message}`
          : "ログイン処理でエラーが発生しました",
      });
    }

    const user = rows?.[0];
    if (!user) {
      return res
        .status(401)
        .json({ error: "ユーザーIDまたはパスワードが違います" });
    }

    const stored = user.pass as string | null;
    if (!stored) {
      return res
        .status(401)
        .json({ error: "ユーザーIDまたはパスワードが違います" });
    }

    // 2) パスワード照合
    let ok = false;
    try {
      // bcrypt 形式ならこれで照合できる（非bcryptなら例外）
      ok = await bcrypt.compare(password, stored);
    } catch (e: any) {
      if (isDev)
        console.warn(
          "[login] bcrypt.compare failed (maybe plain text), message:",
          e?.message
        );
      ok = false;
    }

    // 3) 平文からの“なまけ移行”（stored が平文と一致したらログイン許可しつつハッシュへ更新）
    if (!ok && stored === password) {
      try {
        const newHash = await bcrypt.hash(password, 12);
        const { error: upErr } = await supabase
          .from("users")
          .update({ pass: newHash })
          .eq("user_id", user.user_id);
        if (upErr && isDev)
          console.warn("[login] lazy upgrade failed:", upErr.message);
      } catch (e: any) {
        if (isDev) console.warn("[login] lazy upgrade error:", e?.message);
      }
      ok = true; // アップグレードに失敗しても今回の認証は通す
    }

    if (!ok) {
      return res
        .status(401)
        .json({ error: "ユーザーIDまたはパスワードが違います" });
    }

    // 4) JWT 発行
    if (!process.env.JWT_SECRET) {
      if (isDev) console.error("[login] Missing JWT_SECRET");
      return res.status(500).json({
        error: isDev
          ? "Missing JWT_SECRET"
          : "ログイン処理でエラーが発生しました",
      });
    }

    const token = jwt.sign(
      { sub: user.user_id, login_id: user.login_id },
      process.env.JWT_SECRET
    );

    res.setHeader(
      "Set-Cookie",
      serialize("session", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 10,
      })
    );

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    if (isDev) console.error("[login] unexpected error:", e);
    return res.status(500).json({
      error: isDev
        ? `Unexpected: ${e?.message}`
        : "ログイン処理でエラーが発生しました",
    });
  }
}
