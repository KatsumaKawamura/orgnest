// pages/api/myschedule/index.ts
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

    if (req.method === "GET") {
      const date = String(
        req.query.date ?? new Date().toISOString().slice(0, 10)
      );
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .is("deleted_at", null)
        .order("start_hour", { ascending: true, nullsFirst: false })
        .order("start_minute", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data ?? []);
    }

    if (req.method === "POST") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { data, error } = await supabase
        .from("schedules")
        .insert([
          {
            user_id: userId,
            date: body.date ?? new Date().toISOString().slice(0, 10),
            start_hour: body.start_hour ?? null,
            start_minute: body.start_minute ?? null,
            end_hour: body.end_hour ?? null,
            end_minute: body.end_minute ?? null,
            project: body.project ?? "",
            notes: body.notes ?? null,
            flag: body.flag ?? "",
          },
        ])
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("[myschedule][index] unexpected:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
