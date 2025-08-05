"use client";
import Button from "@/components/common/Button";
import { useProjectList } from "@/hooks/useProjectList";
import ProjectListItem from "./ProjectListItem";
import ProjectBulkActions from "./ProjectBulkActions";

interface ProjectContentProps {
  projectList: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onReplace: (newList: string[]) => void;
}

export default function ProjectContent({
  projectList,
  onAdd,
  onRemove,
  onReplace,
}: ProjectContentProps) {
  const {
    newProject,
    setNewProject,
    deleteMode,
    setDeleteMode,
    selectedProjects,
    showConfirmBulk,
    setShowConfirmBulk,
    editingProject,
    editValue,
    setEditValue,
    sortedProjects,
    handleAdd,
    startEdit,
    confirmEdit,
    toggleSelect,
    selectAllOrClear,
    handleBulkRemove,
  } = useProjectList(projectList);

  return (
    <div className="p-4 bg-[#ece9e5] max-w-md relative">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold text-gray-800">Project List</h1>
        <ProjectBulkActions
          deleteMode={deleteMode}
          onToggleDeleteMode={() => setDeleteMode(!deleteMode)}
          onBulkDelete={() => handleBulkRemove(onReplace)}
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
          onKeyDown={(e) => e.key === "Enter" && handleAdd(onAdd)}
          placeholder="New Project"
          className="flex-1 px-3 py-2 text-gray-800 bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-800"
        />
        <button
          onClick={() => handleAdd(onAdd)}
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
        {sortedProjects.map((p: string) => (
          <ProjectListItem
            key={p}
            name={p}
            deleteMode={deleteMode}
            selected={selectedProjects.includes(p)}
            isEditing={editingProject === p}
            editValue={editValue}
            onSelect={() => toggleSelect(p)}
            onEditStart={() => startEdit(p)}
            onEditChange={(val) => setEditValue(val)}
            onEditConfirm={() => confirmEdit(p, onRemove, onReplace)}
          />
        ))}
      </ul>
    </div>
  );
}
