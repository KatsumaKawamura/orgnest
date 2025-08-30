// pages/api/team/update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import * as cookie from "cookie";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// 無印準拠
const LOGIN_ID_RE = /^[a-z0-9_]{1,32}$/;
const PASSWORD_MIN = 4;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Cookie から team セッショントークン取得
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.team_session;
    if (!token) return res.status(401).json({ error: "認証情報がありません" });

    if (!process.env.TEAM_JWT_SECRET) {
      return res
        .status(500)
        .json({ error: "サーバ設定エラー: TEAM_JWT_SECRET 未設定" });
    }

    // JWT 検証（sub に team_id）
    const decoded = jwt.verify(token, process.env.TEAM_JWT_SECRET) as {
      sub?: string;
      [k: string]: unknown;
    };
    const teamId = decoded?.sub;
    if (!teamId) return res.status(400).json({ error: "トークン形式エラー" });

    const {
      team_login_id,
      password,
      team_name,
      contact,
    }: {
      team_login_id?: string;
      password?: string;
      team_name?: string | null;
      contact?: string | null;
    } = req.body ?? {};

    // 何も変更が無い
    if (
      typeof team_login_id === "undefined" &&
      typeof password === "undefined" &&
      typeof team_name === "undefined" &&
      typeof contact === "undefined"
    ) {
      return res.status(400).json({ error: "更新する項目がありません" });
    }

    // 既存の自分の値を取得（login_id重複チェックのため）
    const { data: current, error: curErr } = await supabase
      .from("teams")
      .select("team_id, team_login_id")
      .eq("team_id", teamId)
      .single();

    if (curErr || !current) {
      return res.status(401).json({ error: "認証エラー" });
    }

    // バリデーション & 可用性確認（無印準拠）
    if (typeof team_login_id !== "undefined") {
      const nextId = String(team_login_id);
      if (!LOGIN_ID_RE.test(nextId)) {
        return res.status(400).json({
          error: "LOGIN_ID_INVALID",
          message: "login_idの形式が不正です",
        });
      }
      // 変更がある場合のみ重複チェック
      if (nextId !== String(current.team_login_id)) {
        const { data: dup, error: dupErr } = await supabase
          .from("teams")
          .select("team_id")
          .eq("team_login_id", nextId)
          .limit(1);

        if (dupErr) {
          return res.status(500).json({ error: "重複チェックに失敗しました" });
        }
        if (dup && dup.length > 0) {
          // 自分以外の誰かが同じ team_login_id
          if (dup[0].team_id !== teamId) {
            return res.status(409).json({ error: "LOGIN_ID_TAKEN" });
          }
        }
      }
    }

    let passwordHash: string | undefined = undefined;
    if (typeof password !== "undefined") {
      const raw = String(password);
      if (raw.length < PASSWORD_MIN) {
        return res.status(400).json({
          error: "PASSWORD_TOO_SHORT",
          message: "passwordが短すぎます",
        });
      }
      passwordHash = await bcrypt.hash(raw, 10);
    }

    // UPDATE パッチ（teams 向け、無印準拠の最小変更）
    const patch: Record<string, unknown> = {};
    if (typeof team_login_id !== "undefined")
      patch.team_login_id = String(team_login_id);
    if (typeof team_name !== "undefined") patch.team_name = team_name ?? null;
    if (typeof contact !== "undefined") patch.contact = contact ?? null;
    if (typeof passwordHash !== "undefined") patch.pass = passwordHash; // 生パスは保存しない

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "更新対象の項目がありません" });
    }

    const { error: updateError } = await supabase
      .from("teams")
      .update(patch)
      .eq("team_id", teamId);

    if (updateError) {
      return res.status(500).json({ error: "更新に失敗しました" });
    }

    // 更新後チームを返す（passwordは返さない） — レスポンスは B 案
    const { data: team, error: fetchError } = await supabase
      .from("teams")
      .select("team_login_id, team_name, contact")
      .eq("team_id", teamId)
      .single();

    if (fetchError || !team) {
      return res.status(500).json({ error: "更新後の取得に失敗しました" });
    }

    return res.status(200).json({ team });
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ error: "トークン期限切れ" });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ error: "無効なトークン" });
    }
    console.error("[team/update] unexpected:", err);
    return res.status(401).json({ error: "認証エラー" });
  }
}
