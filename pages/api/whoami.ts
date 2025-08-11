// pages/api/whoami.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.session;
  if (!token) return res.status(200).json({ hasSession: false });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    return res.status(200).json({ hasSession: true, payload });
  } catch (e: any) {
    return res.status(200).json({ hasSession: true, verifyError: e?.message });
  }
}
