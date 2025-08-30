// pages/api/team/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;

// 無期限運用に近づけるため、十分に長い有効期限（10年相当）を設定
const TEN_YEARS_SEC = 60 * 60 * 24 * 365 * 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const team_login_id = String(req.body?.team_login_id ?? "");
  const password = String(req.body?.password ?? "");
  if (!team_login_id || !password) {
    return res
      .status(400)
      .json({ error: "TEAM_ID と PASSWORD を入力してください" });
  }

  try {
    // 1) チーム取得（列名は 'pass'）
    const { data: rows, error: selErr } = await supabase
      .from("teams")
      .select("team_id, team_login_id, pass")
      .eq("team_login_id", team_login_id)
      .limit(1);

    if (selErr) {
      if (isDev) console.error("[team/login] select error:", selErr);
      return res.status(500).json({
        error: isDev
          ? `DB error: ${selErr.message}`
          : "ログイン処理でエラーが発生しました",
      });
    }

    const team = rows?.[0];
    if (!team) {
      return res
        .status(401)
        .json({ error: "チームIDまたはパスワードが違います" });
    }

    const stored = team.pass as string | null;
    if (!stored) {
      return res
        .status(401)
        .json({ error: "チームIDまたはパスワードが違います" });
    }

    // 2) パスワード照合
    let ok = false;
    try {
      ok = await bcrypt.compare(password, stored);
    } catch (e: any) {
      if (isDev)
        console.warn(
          "[team/login] bcrypt.compare failed (maybe plain text), message:",
          e?.message
        );
      ok = false;
    }

    // 3) 平文からの“なまけ移行”
    if (!ok && stored === password) {
      try {
        const newHash = await bcrypt.hash(password, 12);
        const { error: upErr } = await supabase
          .from("teams")
          .update({ pass: newHash })
          .eq("team_id", team.team_id);
        if (upErr && isDev)
          console.warn("[team/login] lazy upgrade failed:", upErr.message);
      } catch (e: any) {
        if (isDev) console.warn("[team/login] lazy upgrade error:", e?.message);
      }
      ok = true; // 今回は通す
    }

    if (!ok) {
      return res
        .status(401)
        .json({ error: "チームIDまたはパスワードが違います" });
    }

    // 4) JWT 発行（失効なし：expiresIn を付けない）
    const secret = process.env.TEAM_JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      if (isDev)
        console.error("[team/login] Missing TEAM_JWT_SECRET/JWT_SECRET");
      return res.status(500).json({
        error: isDev
          ? "Missing TEAM_JWT_SECRET/JWT_SECRET"
          : "ログイン処理でエラーが発生しました",
      });
    }

    const token = jwt.sign(
      { sub: team.team_id, team_login_id: team.team_login_id },
      secret
      // 失効を付けない（exp未設定）
    );

    res.setHeader(
      "Set-Cookie",
      serialize("team_session", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: TEN_YEARS_SEC, // 十分に長い
      })
    );

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    if (isDev) console.error("[team/login] unexpected error:", e);
    return res.status(500).json({
      error: isDev
        ? `Unexpected: ${e?.message}`
        : "ログイン処理でエラーが発生しました",
    });
  }
}
