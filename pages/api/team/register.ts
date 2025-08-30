// pages/api/team/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import * as cookie from "cookie";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const LOGIN_ID_RE = /^[a-z_]{1,32}$/;
const PASSWORD_RE = /^[\x21-\x7E]+$/;
const isProd = process.env.NODE_ENV === "production";
const TEN_YEARS_SEC = 60 * 60 * 24 * 365 * 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const body = (req.body ?? {}) as any;

    const team_login_id = String(body?.team_login_id ?? "").trim();
    const password = String(body?.password ?? "");
    const contact = body?.contact ?? null;
    const team_name = body?.team_name ?? null;

    if (!team_login_id || !password) {
      return res.status(400).json({ error: "INVALID_PAYLOAD" });
    }
    if (!LOGIN_ID_RE.test(team_login_id)) {
      return res.status(400).json({ error: "LOGIN_ID_INVALID" });
    }
    if (
      password.length < 4 ||
      password.length > 72 ||
      !PASSWORD_RE.test(password)
    ) {
      return res.status(400).json({ error: "PASSWORD_INVALID" });
    }

    // A) 個人セッション 必須（作成者 user_id 取得）
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const userToken = cookies.session;
    if (!userToken) {
      return res.status(401).json({ error: "UNAUTHORIZED_USER" });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
    let payload: any;
    try {
      payload = jwt.verify(userToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "UNAUTHORIZED_USER" });
    }
    const user_id = String(payload?.sub ?? "");
    if (!user_id) {
      return res.status(401).json({ error: "UNAUTHORIZED_USER" });
    }

    // B) team_login_id 重複チェック
    const { data: exists, error: selErr } = await supabase
      .from("teams")
      .select("team_id")
      .eq("team_login_id", team_login_id)
      .limit(1);

    if (selErr) {
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
    if (exists && exists.length > 0) {
      return res.status(409).json({ error: "LOGIN_ID_TAKEN" });
    }

    // C) 作成者がすでに別チーム所属なら 409
    {
      const { data: current, error: curErr } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user_id)
        .limit(1);
      if (curErr) {
        return res.status(500).json({ error: "INTERNAL_ERROR" });
      }
      if (current && current.length > 0) {
        return res.status(409).json({ error: "ALREADY_IN_ANOTHER_TEAM" });
      }
    }

    const team_id = randomUUID();
    const pass = await bcrypt.hash(password, 12);

    const { error: insErr } = await supabase.from("teams").insert([
      {
        team_id,
        team_login_id,
        pass,
        contact: contact || null,
        team_name: team_name || null,
      },
    ]);
    if (insErr) {
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }

    // D) 作成者を自動参加（MVP: roleなし、幂等だがこの時点では必ず未所属）
    {
      const { error: memErr } = await supabase
        .from("team_members")
        .insert([{ team_id, user_id }]);
      if (memErr) {
        // チーム自体は作られているので、ここで落ちると中途半端。
        // ただしMVPでは逐次でOKの合意のため、内部エラー扱い。
        return res.status(500).json({ error: "INTERNAL_ERROR" });
      }
    }

    // E) TEAMセッション付与（失効なし）
    const secret = process.env.TEAM_JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
    const token = jwt.sign({ sub: team_id, team_login_id }, secret);

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

    // キャッシュ無効化（任意）
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );
    res.setHeader("Pragma", "no-cache");

    return res.status(200).json({ ok: true, team_id, team_login_id });
  } catch {
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
