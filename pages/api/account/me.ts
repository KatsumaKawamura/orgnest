// @/pages/api/account/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import * as cookie from "cookie";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // キャッシュ無効化
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Cookie からトークン取得
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.session;
    if (!token) {
      return res.status(401).json({ error: "認証情報がありません" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ error: "サーバ設定エラー: JWT_SECRET 未設定" });
    }

    // JWT 検証（標準の sub を主体IDとして利用）
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      sub?: string;
      login_id?: string;
      iat?: number;
      exp?: number;
      [k: string]: unknown;
    };

    const userId = decoded?.sub;
    if (!userId) {
      return res.status(400).json({ error: "トークン形式エラー" });
    }

    // ユーザー情報取得
    const { data: user, error } = await supabase
      .from("users")
      .select("user_id, login_id, contact, user_name")
      .eq("user_id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    }

    return res.status(200).json(user);
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ error: "トークン期限切れ" });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ error: "無効なトークン" });
    }
    console.error("[me] unexpected:", err);
    return res.status(401).json({ error: "認証エラー" });
  }
}
