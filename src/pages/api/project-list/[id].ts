// @/pages/api/project-list/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getUserIdFromRequest, AuthError } from "@/lib/auth";
import { createServerSupabase } from "@/pages/api/_supabase";

type ProjectDto = { id: string; project: string };

function normalizeProject(input: string) {
  const trimmed = (input ?? "").trim();
  return trimmed;
}
function validateProject(input: string) {
  const v = normalizeProject(input);
  if (v.length < 1 || v.length > 100) {
    return {
      ok: false,
      message: "プロジェクト名は1〜100文字で入力してください" as const,
    };
  }
  return { ok: true as const, value: v };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabase();

  try {
    const userId = getUserIdFromRequest(req);
    const id = String(req.query.id ?? "");

    // PATCH: 更新
    if (req.method === "PATCH") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const raw = body?.project ?? "";
      const v = validateProject(raw);
      if (!v.ok) return res.status(400).json({ error: v.message });

      // 自分のレコード限定で更新
      const { data, error } = await supabase
        .from("project_list")
        .update({ project: v.value })
        .eq("id", id)
        .eq("user_id", userId)
        .select("id, project")
        .maybeSingle();

      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: "対象が見つかりません" });

      const dto: ProjectDto = {
        id: String(data.id),
        project: String(data.project),
      };
      return res.status(200).json(dto);
    }

    // DELETE: 削除
    if (req.method === "DELETE") {
      // 自分のレコード限定で削除
      const { error, count } = await supabase
        .from("project_list")
        .delete({ count: "exact" })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) return res.status(500).json({ error: error.message });
      if (!count)
        return res.status(404).json({ error: "対象が見つかりません" });

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("[project-list][id] unexpected:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
