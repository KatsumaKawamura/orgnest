// @/lib/auth.ts
import type { NextApiRequest } from "next";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import * as cookie from "cookie";

export type SessionPayload = {
  sub?: string; // user_id
  login_id?: string;
  iat?: number;
  exp?: number;
  [k: string]: unknown;
};

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Cookie "session" から user_id を取り出す（無ければAuthError） */
export function getUserIdFromRequest(req: NextApiRequest): string {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const token = cookies.session;
  if (!token) throw new AuthError("認証情報がありません", 401);

  if (!process.env.JWT_SECRET) {
    throw new AuthError("サーバ設定エラー: JWT_SECRET 未設定", 500);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as SessionPayload;
    const userId = decoded?.sub;
    if (!userId) throw new AuthError("トークン形式エラー", 400);
    return userId;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new AuthError("トークン期限切れ", 401);
    }
    if (err instanceof JsonWebTokenError) {
      throw new AuthError("無効なトークン", 401);
    }
    throw new AuthError("認証エラー", 401);
  }
}
