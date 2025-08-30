// pages/api/team/members.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    // cookie から team_id 抽出（/api/team/me と同じロジックを流用）
    const cookie = req.headers.cookie || "";
    const m = cookie.match(/(?:^|;\s*)team_session=([^;]+)/);
    if (!m) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const raw = decodeURIComponent(m[1]);
    const secret = process.env.TEAM_JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }

    let payload: any;
    try {
      payload = jwt.verify(raw, secret);
    } catch {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const team_id = String(payload?.sub ?? "");
    if (!team_id) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    // 1. team_members から user_id 一覧
    const { data: tmRows, error: tmErr } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", team_id);

    if (tmErr) throw tmErr;

    const userIds = (tmRows ?? []).map((r) => r.user_id);

    let members: any[] = [];
    if (userIds.length > 0) {
      // 2. users からユーザー情報
      const { data: usersRows, error: usersErr } = await supabase
        .from("users")
        .select("user_id, user_name, login_id")
        .in("user_id", userIds);

      if (usersErr) throw usersErr;

      members = (usersRows ?? []).map((u) => ({
        id: u.user_id,
        name: u.user_name ?? u.login_id ?? "(no name)",
        loginId: u.login_id,
      }));
    }

    return res.status(200).json({ ok: true, team_id, members });
  } catch (err) {
    console.error("[/api/team/members] error:", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
