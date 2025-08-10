// pages/api/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // session Cookie を削除
  res.setHeader(
    "Set-Cookie",
    serialize("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), // 1970年1月1日 => 即時無効化
      path: "/",
      sameSite: "lax",
    })
  );

  return res.status(200).json({ message: "ログアウトしました" });
}
