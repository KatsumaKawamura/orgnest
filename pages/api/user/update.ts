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
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Cookie からトークン取得
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.session;
    if (!token) return res.status(401).json({ error: "認証情報がありません" });

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
      // 形式不一致（verifyは通ったが payload が期待と違う）
      return res.status(400).json({ error: "トークン形式エラー" });
    }

    const { user_name, contact, login_id, password } = req.body ?? {};

    // 何も変更がない場合
    if (
      typeof user_name === "undefined" &&
      typeof contact === "undefined" &&
      typeof login_id === "undefined" &&
      typeof password === "undefined"
    ) {
      return res.status(400).json({ error: "更新する項目がありません" });
    }

    // 更新内容の組み立て（今回は user_name / contact のみ保存対象）
    const patch: Record<string, unknown> = {};
    if (typeof user_name !== "undefined") patch.user_name = user_name ?? null;
    if (typeof contact !== "undefined") patch.contact = contact ?? null;

    // login_id / password の取り扱いは別途ポリシーに沿って実装（今回は保存しない）
    // ※ 将来ここで login_id の更新を許可する場合は、フロントと同じ正規表現/長さの検証を必ず入れること

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "更新対象の項目がありません" });
    }

    const { error } = await supabase
      .from("users")
      .update(patch)
      .eq("user_id", userId);

    if (error) {
      return res.status(500).json({ error: "更新に失敗しました" });
    }

    return res.status(200).json({ message: "更新しました" });
  } catch (err: any) {
    // verify 例外の内訳を出し分け（デバッグしやすく）
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ error: "トークン期限切れ" });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ error: "無効なトークン" });
    }
    console.error("[user/update] unexpected:", err);
    return res.status(401).json({ error: "認証エラー" });
  }
}
