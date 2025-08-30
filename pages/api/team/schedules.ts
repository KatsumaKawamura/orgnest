// pages/api/team/schedules.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

type Item = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  start_min: number; // 開始を分に換算
  end_min: number; // 終了を分に換算
  project: string;
  notes: string | null;
  flag: string;
  created_at: string;
  updated_at: string;
  user: {
    user_id: string;
    login_id: string;
    user_name: string | null;
  };
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
    // --- 認証（team_session） ---
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.team_session;
    if (!token) return res.status(401).json({ error: "UNAUTHORIZED" });

    const secret = process.env.TEAM_JWT_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ error: "INTERNAL_ERROR", message: "TEAM_JWT_SECRET missing" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }
    const team_id = String(decoded?.sub ?? "");
    if (!team_id) return res.status(401).json({ error: "UNAUTHORIZED" });

    // --- team_members から user_id 一覧 ---
    const { data: members, error: memErr } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", team_id);

    if (memErr) return res.status(500).json({ error: "INTERNAL_ERROR" });

    const userIds = (members ?? []).map((m: any) => m.user_id).filter(Boolean);
    if (userIds.length === 0) {
      return res.status(200).json({ ok: true, items: [] });
    }

    // --- users 情報（表示用） ---
    const { data: users, error: usrErr } = await supabase
      .from("users")
      .select("user_id, login_id, user_name")
      .in("user_id", userIds);

    if (usrErr) return res.status(500).json({ error: "INTERNAL_ERROR" });

    const userMap = new Map<
      string,
      { user_id: string; login_id: string; user_name: string | null }
    >();
    (users ?? []).forEach((u: any) =>
      userMap.set(u.user_id, {
        user_id: u.user_id,
        login_id: u.login_id,
        user_name: u.user_name ?? null,
      })
    );

    // --- schedules 全件（期間無視） ---
    const { data: rows, error: schErr } = await supabase
      .from("schedules")
      .select(
        "id, user_id, date, start_hour, start_minute, end_hour, end_minute, project, notes, flag, created_at, updated_at, deleted_at"
      )
      .in("user_id", userIds)
      .is("deleted_at", null)
      .order("date", { ascending: true })
      .order("start_hour", { ascending: true })
      .order("start_minute", { ascending: true });

    if (schErr) return res.status(500).json({ error: "INTERNAL_ERROR" });

    const isValid = (r: any) => {
      if (
        r.start_hour == null ||
        r.start_minute == null ||
        r.end_hour == null ||
        r.end_minute == null
      )
        return false;
      const startTotal = r.start_hour * 60 + r.start_minute;
      const endTotal = r.end_hour * 60 + r.end_minute;
      if (!(startTotal < endTotal)) return false;
      if (!r.date) return false;
      return true;
    };

    const items: Item[] = (rows ?? []).filter(isValid).map((r: any) => {
      const u = userMap.get(r.user_id);
      return {
        id: r.id,
        user_id: r.user_id,
        date: r.date,
        start_min: r.start_hour * 60 + r.start_minute,
        end_min: r.end_hour * 60 + r.end_minute,
        project: r.project ?? "",
        notes: r.notes ?? null,
        flag: r.flag ?? "",
        created_at: r.created_at,
        updated_at: r.updated_at,
        user: u ?? {
          user_id: r.user_id,
          login_id: "",
          user_name: null,
        },
      };
    });

    return res.status(200).json({ ok: true, items });
  } catch {
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
