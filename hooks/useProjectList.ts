// /hooks/useProjectList.ts
import { useState, useMemo } from "react";

export function useProjectList(initial: string[]) {
  const [projectList, setProjectList] = useState(initial);
  const [newProject, setNewProject] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showConfirmBulk, setShowConfirmBulk] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // 並び替え
  const sortedProjects = useMemo(
    () => [...projectList].sort((a, b) => a.localeCompare(b, "ja")),
    [projectList]
  );

  // 追加
  const handleAdd = (onAdd: (name: string) => void) => {
    const trimmed = newProject.trim();
    if (trimmed) {
      onAdd(trimmed);
      setProjectList((prev) => [...prev, trimmed]); // ローカル更新
      setNewProject("");
    }
  };

  // 編集開始
  const startEdit = (p: string) => {
    setEditingProject(p);
    setEditValue(p);
  };

  // 編集確定
  const confirmEdit = (
    oldValue: string,
    onRemove: (name: string) => void,
    onReplace: (newList: string[]) => void
  ) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      onRemove(oldValue);
      setProjectList((prev) => prev.filter((p) => p !== oldValue)); // ローカル更新
    } else if (trimmed !== oldValue) {
      const newList = projectList.map((p) => (p === oldValue ? trimmed : p));
      onReplace(newList);
      setProjectList(newList); // ローカル更新
    }
    setEditingProject(null);
    setEditValue("");
  };

  // 選択切替
  const toggleSelect = (p: string) => {
    setSelectedProjects((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  // 全選択/解除
  const selectAllOrClear = () => {
    if (selectedProjects.length === projectList.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects([...projectList]);
    }
  };

  // 一括削除
  const handleBulkRemove = (onReplace: (newList: string[]) => void) => {
    const newList = projectList.filter((p) => !selectedProjects.includes(p));
    onReplace(newList);
    setProjectList(newList); // ローカル更新
    setSelectedProjects([]);
    setDeleteMode(false);
    setShowConfirmBulk(false);
  };

  return {
    projectList,
    setProjectList,
    newProject,
    setNewProject,
    deleteMode,
    setDeleteMode,
    selectedProjects,
    setSelectedProjects,
    showConfirmBulk,
    setShowConfirmBulk,
    editingProject,
    setEditingProject,
    editValue,
    setEditValue,
    sortedProjects,
    handleAdd,
    startEdit,
    confirmEdit,
    toggleSelect,
    selectAllOrClear,
    handleBulkRemove,
  };
}
