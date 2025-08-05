import { useState, useMemo } from "react";

export interface Project {
  id: number;
  name: string;
}

export function useProjectList(initial: Project[]) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [newProject, setNewProject] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [showConfirmBulk, setShowConfirmBulk] = useState(false);
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // 名前順ソート
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.name.localeCompare(b.name, "ja")),
    [projects]
  );

  // 編集開始
  const startEdit = (id: number, currentName: string) => {
    setEditingProject(id);
    setEditValue(currentName);
  };

  // 編集確定（更新 or 削除）
  const confirmEdit = async (
    id: number,
    updateProject: (id: number, name: string) => Promise<Project | null>,
    deleteProject: (id: number) => Promise<boolean>
  ) => {
    const trimmed = editValue.trim();
    try {
      if (!trimmed) {
        // 空なら削除
        const ok = await deleteProject(id);
        if (ok) setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        // 値があれば更新
        const updated = await updateProject(id, trimmed);
        if (updated)
          setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
    } catch (e) {
      console.error("編集処理に失敗しました:", e);
    } finally {
      setEditingProject(null);
      setEditValue("");
    }
  };

  // 選択切替
  const toggleSelect = (id: number) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 全選択/解除
  const selectAllOrClear = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map((p) => p.id));
    }
  };

  return {
    projects,
    setProjects,
    newProject,
    setNewProject,
    deleteMode,
    setDeleteMode,
    selectedProjects,
    setSelectedProjects,
    showConfirmBulk,
    setShowConfirmBulk,
    editingProject,
    editValue,
    setEditValue,
    sortedProjects,
    startEdit,
    confirmEdit, // ← ここでエクスポート
    toggleSelect,
    selectAllOrClear,
  };
}
