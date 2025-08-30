// @/hooks/useProjectList.ts
"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/hooks/useProjectApi";

/**
 * ProjectList の UI 状態管理（短編集／明示削除なし）
 * - 単一行のみ編集可能（他行の編集ボタンは disabled）
 * - 保存時に trim()。空なら削除扱い（API呼び出しは親から渡す）
 * - 並びは大小無視の昇順、同値は id で安定ソート
 */
export function useProjectList(initial: Project[]) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [newProject, setNewProject] = useState("");

  // 短編集（1行のみ）
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // 並び（大小無視＋安定）
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const p = a.project.localeCompare(b.project, "ja", {
        sensitivity: "base",
      });
      if (p !== 0) return p;
      return a.id.localeCompare(b.id);
    });
  }, [projects]);

  // 編集開始（他行が編集中でも上書きで開始＝短編集維持）
  const startEdit = (id: string, current: string) => {
    setEditingProject(id);
    setEditValue(current);
  };

  return {
    // データ
    projects,
    setProjects,

    // 追加フォーム
    newProject,
    setNewProject,

    // 編集（短編集）
    editingProject,
    setEditingProject,
    editValue,
    setEditValue,
    startEdit,

    // 導出
    sortedProjects,
  };
}
