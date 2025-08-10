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
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Cookieからトークン取得
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.session;
    if (!token) return res.status(401).json({ error: "認証情報がありません" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      user_id: string;
    };
    if (!decoded || !decoded.user_id)
      return res.status(401).json({ error: "無効なトークン" });

    const { user_name, contact } = req.body;
    if (!user_name && !contact) {
      return res.status(400).json({ error: "更新する項目がありません" });
    }

    // 更新
    const { error } = await supabase
      .from("users")
      .update({ user_name, contact })
      .eq("user_id", decoded.user_id);

    if (error) return res.status(500).json({ error: "更新に失敗しました" });

    return res.status(200).json({ message: "更新しました" });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "認証エラー" });
  }
}
