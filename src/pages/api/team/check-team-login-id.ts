// pages/api/team/check-team-login-id.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const LOGIN_ID_RE = /^[a-z0-9_]{1,32}$/;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const NO_CACHE = {
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

  const team_login_id = String(req.query.team_login_id || "").trim();

  if (!LOGIN_ID_RE.test(team_login_id)) {
    return res
      .status(400)
      .setHeader("Cache-Control", NO_CACHE["Cache-Control"])
      .setHeader("Pragma", NO_CACHE.Pragma)
      .json({ error: "LOGIN_ID_INVALID" });
  }

  const { count, error } = await supabase
    .from("teams")
    .select("team_id", { head: true, count: "exact" })
    .eq("team_login_id", team_login_id);

  if (error) {
    return res
      .status(500)
      .setHeader("Cache-Control", NO_CACHE["Cache-Control"])
      .setHeader("Pragma", NO_CACHE.Pragma)
      .json({ error: "INTERNAL_ERROR" });
  }

  const available = (count ?? 0) === 0;
  return res
    .status(200)
    .setHeader("Cache-Control", NO_CACHE["Cache-Control"])
    .setHeader("Pragma", NO_CACHE.Pragma)
    .json({ available });
}
