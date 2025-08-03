"use client";
import { useState, useMemo } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Checkbox from "@/components/common/Checkbox";
import { Trash2 } from "lucide-react";

interface ProjectContentProps {
  projectList: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void; // 単品削除
  onReplace: (newList: string[]) => void; // まとめ削除
}

export default function ProjectContent({
  projectList,
  onAdd,
  onRemove,
  onReplace,
}: ProjectContentProps) {
  const [newProject, setNewProject] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showConfirmBulk, setShowConfirmBulk] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const handleAdd = () => {
    if (newProject.trim()) {
      onAdd(newProject.trim());
      setNewProject("");
    }
  };

  // === まとめ削除 ===
  const handleBulkRemove = () => {
    const newList = projectList.filter((p) => !selectedProjects.includes(p));
    onReplace(newList); // 一気に更新
    setSelectedProjects([]);
    setDeleteMode(false);
    setShowConfirmBulk(false);
  };

  // === 単品削除 ===
  const handleSingleRemove = () => {
    if (confirmTarget) {
      onRemove(confirmTarget); // 単品削除
      setConfirmTarget(null);
    }
  };

  const toggleSelect = (p: string) => {
    setSelectedProjects((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const selectAllOrClear = () => {
    if (selectedProjects.length === projectList.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects([...projectList]);
    }
  };

  const sortedProjects = useMemo(
    () => [...projectList].sort((a, b) => a.localeCompare(b, "ja")),
    [projectList]
  );

  return (
    <div className="p-4 bg-[#ece9e5] max-w-md relative">
      {/* === 見出し + ボタン群 === */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold text-gray-800">Project List</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setDeleteMode(!deleteMode)}
            className="flex items-center px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
          >
            <Trash2 className="w-4 h-4 mr-2 text-gray-800" />
            {deleteMode ? "戻る" : "選択"}
          </button>
          {deleteMode && (
            <div className="relative">
              <button
                onClick={() => setShowConfirmBulk(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
              >
                削除
              </button>
              {showConfirmBulk && (
                <ConfirmDialog
                  message="削除しますか？"
                  onCancel={() => setShowConfirmBulk(false)}
                  onConfirm={handleBulkRemove}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* === 入力欄 + 追加ボタン === */}
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New Project"
          className="flex-1 px-3 py-2 text-gray-800 bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-800"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-1 text-gray-800 hover:text-gray-600"
        >
          ＋
        </button>
      </div>

      {/* 一括選択ボタン */}
      {deleteMode && sortedProjects.length > 0 && (
        <div className="mb-2">
          <button
            onClick={selectAllOrClear}
            className="px-3 py-1 text-sm bg-white border border-gray-800 text-gray-800 rounded hover:bg-gray-100"
          >
            {selectedProjects.length === sortedProjects.length
              ? "全解除"
              : "全選択"}
          </button>
        </div>
      )}

      {/* === プロジェクト一覧 === */}
      <ul className="space-y-2">
        {sortedProjects.map((p: string) => (
          <li
            key={p}
            className="flex justify-between items-center text-gray-800 border-b border-gray-300 pb-1"
          >
            <div className="flex items-center space-x-2">
              {deleteMode && (
                <Checkbox
                  checked={selectedProjects.includes(p)}
                  onChange={() => toggleSelect(p)}
                />
              )}
              <span>{p}</span>
            </div>

            {/* 単品削除（通常モード） */}
            {!deleteMode && (
              <div className="relative">
                <button
                  onClick={() => setConfirmTarget(p)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {confirmTarget === p && (
                  <div className="absolute top-full left-0 mt-1 z-50">
                    <ConfirmDialog
                      message={`削除しますか？`}
                      onCancel={() => setConfirmTarget(null)}
                      onConfirm={handleSingleRemove}
                    />
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
