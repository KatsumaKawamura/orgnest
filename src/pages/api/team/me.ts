// pages/api/team/me.ts
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
    const cookie = req.headers.cookie || "";
    const m = cookie.match(/(?:^|;\s*)team_session=([^;]+)/);
    if (!m) {
      return res
        .status(401)
        .setHeader("Cache-Control", NO_STORE["Cache-Control"])
        .setHeader("Pragma", NO_STORE.Pragma)
        .json({ error: "UNAUTHORIZED" });
    }

    const raw = decodeURIComponent(m[1]);

    // ★ フォールバック除去：TEAM_JWT_SECRET のみを使用
    const secret = process.env.TEAM_JWT_SECRET;
    if (!secret) {
      return res
        .status(500)
        .setHeader("Cache-Control", NO_STORE["Cache-Control"])
        .setHeader("Pragma", NO_STORE.Pragma)
        .json({ error: "INTERNAL_ERROR" });
    }

    let payload: any;
    try {
      payload = jwt.verify(raw, secret);
    } catch {
      return res
        .status(401)
        .setHeader("Cache-Control", NO_STORE["Cache-Control"])
        .setHeader("Pragma", NO_STORE.Pragma)
        .json({ error: "UNAUTHORIZED" });
    }

    const team_id = String(payload?.sub ?? "");
    if (!team_id) {
      return res
        .status(401)
        .setHeader("Cache-Control", NO_STORE["Cache-Control"])
        .setHeader("Pragma", NO_STORE.Pragma)
        .json({ error: "UNAUTHORIZED" });
    }

    const { data: rows, error } = await supabase
      .from("teams")
      .select("team_id, team_login_id, team_name, contact")
      .eq("team_id", team_id)
      .limit(1);

    if (error) {
      return res
        .status(500)
        .setHeader("Cache-Control", NO_STORE["Cache-Control"])
        .setHeader("Pragma", NO_STORE.Pragma)
        .json({ error: "INTERNAL_ERROR" });
    }

    const team = rows?.[0];
    if (!team) {
      return res
        .status(401)
        .setHeader("Cache-Control", NO_STORE["Cache-Control"])
        .setHeader("Pragma", NO_STORE.Pragma)
        .json({ error: "UNAUTHORIZED" });
    }

    return res
      .status(200)
      .setHeader("Cache-Control", NO_STORE["Cache-Control"])
      .setHeader("Pragma", NO_STORE.Pragma)
      .json({
        ok: true,
        team: {
          team_id: team.team_id,
          team_login_id: team.team_login_id,
          team_name: team.team_name,
          contact: team.contact,
        },
      });
  } catch {
    return res
      .status(500)
      .setHeader("Cache-Control", NO_STORE["Cache-Control"])
      .setHeader("Pragma", NO_STORE.Pragma)
      .json({ error: "INTERNAL_ERROR" });
  }
}
