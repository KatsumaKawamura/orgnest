// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // ★追加
import { serialize } from "cookie"; // ★追加

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const LOGIN_ID_RE = /^[a-z0-9_]{1,32}$/;
const PASSWORD_RE = /^[\x21-\x7E]+$/; // 可視ASCII（スペース不可）
const isProd = process.env.NODE_ENV === "production"; // ★追加

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // メソッド制限
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const body = (req.body ?? {}) as any;

    const login_id = String(body?.login_id ?? "").trim();
    const password = String(body?.password ?? "");
    const contact = body?.contact ?? null;
    const user_name = body?.user_name ?? null;

    // 入力検証
    if (!login_id || !password) {
      return res.status(400).json({ error: "INVALID_PAYLOAD" });
    }
    if (!LOGIN_ID_RE.test(login_id)) {
      return res.status(400).json({ error: "LOGIN_ID_INVALID" });
    }
    if (
      password.length < 4 ||
      password.length > 72 ||
      !PASSWORD_RE.test(password)
    ) {
      return res.status(400).json({ error: "PASSWORD_INVALID" });
    }

    // 重複チェック
    const { data: exists, error: selErr } = await supabase
      .from("users")
      .select("user_id")
      .eq("login_id", login_id)
      .limit(1);

    if (selErr) {
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
    if (exists && exists.length > 0) {
      return res.status(409).json({ error: "LOGIN_ID_TAKEN" });
    }

    // 登録処理
    const user_id = randomUUID();
    const pass = await bcrypt.hash(password, 12);

    const { error: insErr } = await supabase.from("users").insert([
      {
        user_id,
        login_id,
        pass,
        contact: contact || null,
        user_name: user_name || null,
      },
    ]);

    if (insErr) {
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }

    // ★ ここから追加：登録直後にログイン Cookie（JWT）を発行
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
    const token = jwt.sign({ sub: user_id, login_id }, secret);

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

    // キャッシュ無効化ヘッダ（任意）
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );
    res.setHeader("Pragma", "no-cache");

    return res.status(200).json({ ok: true, user_id, login_id });
  } catch {
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
