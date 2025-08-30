// pages/api/team/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

const isProd = process.env.NODE_ENV === "production";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  // 期限切れCookieで無効化
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
}
