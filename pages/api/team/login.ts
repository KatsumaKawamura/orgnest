// pages/api/team/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import * as cookie from "cookie";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;
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
    // -------- A) 個人セッション 必須（user_id取得） --------
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const userToken = cookies.session;
    if (!userToken) {
      return res.status(401).json({ error: "UNAUTHORIZED_USER" });
    }
    const userSecret = process.env.JWT_SECRET;
    if (!userSecret) {
      if (isDev) console.error("[team/login] Missing JWT_SECRET");
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
    let userPayload: any;
    try {
      userPayload = jwt.verify(userToken, userSecret);
    } catch {
      return res.status(401).json({ error: "UNAUTHORIZED_USER" });
    }
    const user_id = String(userPayload?.sub ?? "");
    if (!user_id) {
      return res.status(401).json({ error: "UNAUTHORIZED_USER" });
    }

    // -------- B) チーム取得・認証 --------
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

    let ok = false;
    try {
      ok = await bcrypt.compare(password, stored);
    } catch (e: any) {
      if (isDev)
        console.warn(
          "[team/login] bcrypt.compare failed (maybe plain text):",
          e?.message
        );
      ok = false;
    }

    // 平文からの“なまけ移行”
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
      ok = true;
    }

    if (!ok) {
      return res
        .status(401)
        .json({ error: "チームIDまたはパスワードが違います" });
    }

    // -------- C) 所属チェック＆幂等INSERT --------
    // 既に別チーム所属なら 409、同一チーム所属なら何もしないで続行
    const { data: current, error: curErr } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user_id)
      .limit(1);

    if (curErr) {
      if (isDev) console.error("[team/login] membership select error:", curErr);
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }

    const already = current?.[0]?.team_id as string | undefined;
    if (already && already !== team.team_id) {
      return res.status(409).json({ error: "ALREADY_IN_ANOTHER_TEAM" });
    }

    if (!already) {
      const { error: insErr } = await supabase
        .from("team_members")
        .insert([{ team_id: team.team_id, user_id }]);
      if (insErr) {
        // UNIQUE(user_id) 競合はすでに別チーム所属の可能性だが、直前で判定済み。
        if (isDev)
          console.error("[team/login] membership insert error:", insErr);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
      }
    }
    // 以降はクッキー付与

    // -------- D) TEAM セッション発行（失効なし） --------
    const secret = process.env.TEAM_JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      if (isDev)
        console.error("[team/login] Missing TEAM_JWT_SECRET/JWT_SECRET");
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }

    const token = jwt.sign(
      { sub: team.team_id, team_login_id: team.team_login_id },
      secret
    );

    res.setHeader(
      "Set-Cookie",
      serialize("team_session", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: TEN_YEARS_SEC,
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
