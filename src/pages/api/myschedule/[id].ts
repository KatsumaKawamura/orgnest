// pages/api/myschedule/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { getUserIdFromRequest, AuthError } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = String(req.query.id ?? "");

    if (!id) return res.status(400).json({ error: "Invalid id" });

    if (req.method === "PUT") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { data, error } = await supabase
        .from("schedules")
        .update({
          start_hour: body.start_hour ?? null,
          start_minute: body.start_minute ?? null,
          end_hour: body.end_hour ?? null,
          end_minute: body.end_minute ?? null,
          project: body.project ?? "",
          notes: body.notes ?? null,
          flag: body.flag ?? "",
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .maybeSingle();

      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: "対象が見つかりません" });
      return res.status(200).json(data);
    }

    if (req.method === "DELETE") {
      const { data, error } = await supabase
        .from("schedules")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: "対象が見つかりません" });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("[myschedule][id] unexpected:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
