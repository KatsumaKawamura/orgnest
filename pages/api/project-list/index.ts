// @/pages/api/project-list/index.ts
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
function sortCaseInsensitive(a: string, b: string) {
  return a.localeCompare(b, "ja", { sensitivity: "base" });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabase();

  try {
    const userId = getUserIdFromRequest(req);

    // GET: 一覧（昇順・大小無視）
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("project_list")
        .select("id, project")
        .eq("user_id", userId);

      if (error) return res.status(500).json({ error: error.message });

      const list = (data ?? [])
        .map(
          (r) =>
            ({ id: String(r.id), project: String(r.project) } as ProjectDto)
        )
        .sort((a, b) => sortCaseInsensitive(a.project, b.project));

      return res.status(200).json(list);
    }

    // POST: 追加
    if (req.method === "POST") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const raw = body?.project ?? "";
      const v = validateProject(raw);
      if (!v.ok) return res.status(400).json({ error: v.message });

      const { data, error } = await supabase
        .from("project_list")
        .insert([{ user_id: userId, project: v.value }])
        .select("id, project")
        .single();

      if (error) return res.status(500).json({ error: error.message });

      const dto: ProjectDto = {
        id: String(data!.id),
        project: String(data!.project),
      };
      return res.status(200).json(dto);
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return res.status(e.status).json({ error: e.message });
    }
    console.error("[project-list][index] unexpected:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
