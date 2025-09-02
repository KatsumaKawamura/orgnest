// pages/api/account/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const isProd = process.env.NODE_ENV === "production";

  // session / team_session を両方削除（発行時と同じ属性で無効化）
  res.setHeader("Set-Cookie", [
    serialize("session", "", {
      httpOnly: true,
      secure: isProd,
      expires: new Date(0), // 即時無効化
      path: "/",
      sameSite: "lax",
    }),
    serialize("team_session", "", {
      httpOnly: true,
      secure: isProd,
      expires: new Date(0), // 即時無効化
      path: "/",
      sameSite: "lax",
    }),
  ]);

  // 念のためキャッシュ抑止
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0"
  );
  res.setHeader("Pragma", "no-cache");

  return res.status(200).json({ message: "ログアウトしました" });
}
