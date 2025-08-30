// pages/api/team/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const LOGIN_ID_RE = /^[a-z_]{1,32}$/; // USER版踏襲
const PASSWORD_RE = /^[\x21-\x7E]+$/; // USER版踏襲
const isProd = process.env.NODE_ENV === "production";

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

    // 入力検証（USER版のコードと同義のエラーコードで返す）
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

    // 重複チェック（UNIQUE: team_login_id）
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

    // 登録直後に TEAM のセッションでログイン
    const secret = process.env.TEAM_JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
    const token = jwt.sign({ sub: team_id, team_login_id }, secret, {
      expiresIn: "7d",
    });

    res.setHeader(
      "Set-Cookie",
      serialize("team_session", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
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
