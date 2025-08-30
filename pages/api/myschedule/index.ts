// pages/api/myschedule/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { getUserIdFromRequest, AuthError } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// JSTのYYYY-MM-DDを返す（UTCずれ防止）
function todayJP(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const userId = getUserIdFromRequest(req);

    if (req.method === "GET") {
      const dateParam =
        typeof req.query.date === "string" ? req.query.date : null;

      // 基本クエリ（ユーザー縛り + 論理削除除外）
      let q = supabase
        .from("schedules")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null);

      // ▼MVP方針：date未指定なら全件返す（フィルタを付けない）
      if (dateParam) {
        q = q.eq("date", dateParam);
      }

      // 見通しの良い並び：date降順 → start時刻昇順 → 生成時刻昇順
      q = q
        .order("date", { ascending: false })
        .order("start_hour", { ascending: true, nullsFirst: false })
        .order("start_minute", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      const { data, error } = await q;
      if (error) {
        console.error("[myschedule][GET] supabase error:", error);
        return res.status(500).json({ error: error.message });
      }
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
            // 既存方針どおり date は一応保持。未指定時はJST“今日”
            date: body?.date ?? todayJP(),
            start_hour:
              body?.start_hour === 0 || body?.start_hour
                ? Number(body.start_hour)
                : null,
            start_minute:
              body?.start_minute === 0 || body?.start_minute
                ? Number(body.start_minute)
                : null,
            end_hour:
              body?.end_hour === 0 || body?.end_hour
                ? Number(body.end_hour)
                : null,
            end_minute:
              body?.end_minute === 0 || body?.end_minute
                ? Number(body.end_minute)
                : null,
            project: body?.project ?? "",
            notes:
              body?.notes === "" || body?.notes == null
                ? null
                : String(body.notes),
            flag: body?.flag ?? "",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("[myschedule][POST] supabase error:", error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json(data);
    }

    res.setHeader("Allow", "GET,POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("[myschedule][index] unexpected:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
