"use client";
import { useEffect } from "react";
import ProjectListItem from "./ProjectListItem";
import ProjectBulkActions from "./ProjectBulkActions";
import { useProjectList } from "@/hooks/useProjectList";
import { useProjectApi } from "@/hooks/useProjectApi";

export default function ProjectContent() {
  const {
    getProjects,
    addProject,
    updateProject,
    deleteProject,
    bulkDeleteProjects,
  } = useProjectApi();

  const {
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
    confirmEdit, // ← 追加
  } = useProjectList([]);

  // 初回読み込み
  useEffect(() => {
    (async () => {
      const data = await getProjects();
      setProjects(data);
    })();
  }, [getProjects, setProjects]);

  // 全選択/解除
  const selectAllOrClear = () => {
    if (selectedProjects.length === sortedProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(sortedProjects.map((p) => p.id));
    }
  };

  // 選択トグル
  const toggleSelect = (id: number) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 一括削除
  const handleBulkRemove = async (ids: number[]) => {
    const ok = await bulkDeleteProjects(ids);
    if (ok) setProjects((prev) => prev.filter((p) => !ids.includes(p.id)));
    setSelectedProjects([]);
    setDeleteMode(false);
    setShowConfirmBulk(false);
  };

  return (
    <div className="p-4 bg-[#ece9e5] max-w-md relative">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold text-gray-800">Project List</h1>
        <ProjectBulkActions
          deleteMode={deleteMode}
          onToggleDeleteMode={() => setDeleteMode(!deleteMode)}
          onBulkDelete={() => handleBulkRemove(selectedProjects)}
          showConfirm={showConfirmBulk}
          onShowConfirm={() => setShowConfirmBulk(true)}
          onCancelConfirm={() => setShowConfirmBulk(false)}
        />
      </div>

      {/* 追加フォーム */}
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              const added = await addProject(newProject.trim());
              if (added) setProjects((prev) => [...prev, added]);
              setNewProject("");
            }
          }}
          placeholder="New Project"
          className="flex-1 px-3 py-2 text-gray-800 bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-800"
        />
        <button
          onClick={async () => {
            const added = await addProject(newProject.trim());
            if (added) setProjects((prev) => [...prev, added]);
            setNewProject("");
          }}
          className="px-4 py-1 text-gray-800 hover:text-gray-600"
        >
          ＋
        </button>
      </div>

      {/* 全選択 */}
      {deleteMode && sortedProjects.length > 0 && (
        <div className="mb-2">
          <button
            onClick={selectAllOrClear}
            className="px-3 py-1 text-sm bg-white border border-gray-800 text-gray-800 rounded hover:bg-gray-100"
          >
            {selectedProjects.length === sortedProjects.length
              ? "全て解除"
              : "全て選択"}
          </button>
        </div>
      )}

      {/* リスト */}
      <ul className="space-y-2">
        {sortedProjects.map((p) => (
          <ProjectListItem
            key={p.id}
            id={p.id} // ← id を渡す
            name={p.name}
            deleteMode={deleteMode}
            selected={selectedProjects.includes(p.id)}
            isEditing={editingProject === p.id}
            editValue={editValue}
            onSelect={() => toggleSelect(p.id)}
            onEditStart={() => startEdit(p.id, p.name)}
            onEditChange={(val) => setEditValue(val)}
            onEditConfirm={() =>
              confirmEdit(p.id, updateProject, deleteProject)
            } // ← confirmEdit を使用
          />
        ))}
      </ul>
    </div>
  );
}
