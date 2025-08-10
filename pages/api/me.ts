// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
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

    // Cookieからトークンを取得
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.session;

    if (!token) {
      return res.status(401).json({ error: "認証情報がありません" });
    }

    // トークン検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      user_id: string;
    };

    if (!decoded || !decoded.user_id) {
      return res.status(401).json({ error: "認証エラー" });
    }

    // ユーザー情報取得
    const { data: user, error } = await supabase
      .from("users")
      .select("user_id, login_id, contact, user_name")
      .eq("user_id", decoded.user_id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    }

    // ユーザー情報をそのまま返却
    return res.status(200).json(user);
  } catch (err) {
    console.error("JWT Verify Error:", err);
    return res.status(401).json({ error: "無効なトークン" });
  }
}
