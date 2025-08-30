// pages/api/team/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const isProd = process.env.NODE_ENV === "production";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const teamToken = cookies.team_session;
    const userToken = cookies.session;

    let team_id: string | null = null;
    let user_id: string | null = null;

    // decode team_session → team_id
    if (teamToken) {
      const secret = process.env.TEAM_JWT_SECRET || process.env.JWT_SECRET;
      if (secret) {
        try {
          const payload: any = jwt.verify(teamToken, secret);
          team_id = String(payload?.sub ?? "") || null;
        } catch {
          // 無効でも続行（クッキー破棄が目的）
        }
      }
    }

    // decode session → user_id
    if (userToken && process.env.JWT_SECRET) {
      try {
        const payload: any = jwt.verify(userToken, process.env.JWT_SECRET);
        user_id = String(payload?.sub ?? "") || null;
      } catch {
        // 無効でも続行
      }
    }

    // 「ログアウト＝退出」: 会員レコードを物理削除（条件が揃っているときのみ）
    if (team_id && user_id) {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .match({ team_id, user_id });
      // 失敗してもクッキーは無効化するため処理は続行
      if (error) {
        // ログ出しのみ（MVPでは表面化させない）
        // console.error("[team/logout] delete membership error:", error);
      }
    }

    // 期限切れCookieで無効化（チームセッションのみ）
    res.setHeader(
      "Set-Cookie",
      serialize("team_session", "", {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      })
    );

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );
    res.setHeader("Pragma", "no-cache");

    return res.status(200).json({ ok: true });
  } catch {
    // 例外時もクッキーは消す
    res.setHeader(
      "Set-Cookie",
      serialize("team_session", "", {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      })
    );
    return res.status(200).json({ ok: true });
  }
}
