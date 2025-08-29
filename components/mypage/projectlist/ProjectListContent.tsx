// @/components/mypage/projectlist/ProjectListContent.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import type { useProjectApi, Project } from "@/hooks/useProjectApi";
import type { useProjectList } from "@/hooks/useProjectList";
import ProjectListItem from "./ProjectListItem";
import {
  PROJECT_TEXT_COLOR,
  PROJECT_ADD_PLACEHOLDER,
  PROJECT_VALIDATION_ERROR,
  PROJECT_ADD_ERROR,
  PROJECT_EMPTY_MESSAGE,
} from "@/constants/project";

type Props = {
  state: ReturnType<typeof useProjectList>;
  api: ReturnType<typeof useProjectApi>;
};

export default function ProjectListContent({ state, api }: Props) {
  const {
    newProject,
    setNewProject,
    sortedProjects,
    setProjects,
    editingProject,
    setEditingProject,
    editValue,
    setEditValue,
    startEdit,
  } = state;

  // 追加フォーム
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const addTrimmed = useMemo(() => newProject.trim(), [newProject]);
  const addTooLong = addTrimmed.length > 100;
  const addDisabled = addBusy || addTrimmed.length === 0 || addTooLong;

  const handleAdd = async () => {
    setAddError(null);
    const trimmed = newProject.trim();
    if (!trimmed || trimmed.length > 100) return;
    try {
      setAddBusy(true);
      const created = await api.addProject(trimmed);
      setProjects((prev) => [...prev, created]);
      setNewProject("");
      inputRef.current?.focus();
    } catch (e) {
      console.error("[ProjectList] add error:", e);
      setAddError(PROJECT_ADD_ERROR);
    } finally {
      setAddBusy(false);
    }
  };

  // 行操作（親ハンドラ）：保存（更新/削除を内包）
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; msg: string } | null>(
    null
  );

  const handleSave = async (id: string) => {
    if (rowBusyId) return;
    const trimmed = editValue.trim();
    try {
      setRowError(null);
      setRowBusyId(id);

      if (!trimmed) {
        await api.deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        if (trimmed.length > 100) {
          setRowError({ id, msg: PROJECT_VALIDATION_ERROR });
          return;
        }
        const updated = await api.updateProject(id, trimmed);
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
      setEditingProject(null);
      setEditValue("");
    } catch (e) {
      console.error("[ProjectList] save error:", e);
      setRowError({
        id,
        msg: !trimmed ? "削除に失敗しました。" : "保存に失敗しました。",
      });
    } finally {
      setRowBusyId(null);
    }
  };

  const handleCancel = () => {
    setRowError(null);
    setEditingProject(null);
    setEditValue("");
  };

  const hasItems = sortedProjects.length > 0;

  return (
    <div className="p-4 max-w-xl">
      {/* 追加フォーム（下線入力 + ＋ボタン） */}
      <div className="mb-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newProject}
          onChange={(e) => {
            setNewProject(e.target.value);
            if (addError) setAddError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !addDisabled) handleAdd();
          }}
          placeholder={PROJECT_ADD_PLACEHOLDER}
          className={`flex-1 px-3 py-2 bg-transparent border-0 border-b border-gray-400 focus:outline-none focus:border-gray-800 ${PROJECT_TEXT_COLOR}`}
          aria-label="New Project"
        />
        <button
          type="button"
          disabled={addDisabled}
          onClick={handleAdd}
          title="追加"
          aria-label="プロジェクトを追加"
          className={`px-3 py-1 hover:text-gray-600 disabled:opacity-50 ${PROJECT_TEXT_COLOR}`}
        >
          ＋
        </button>
      </div>
      {addTooLong && (
        <p className="mb-3 text-sm text-red-600">{PROJECT_VALIDATION_ERROR}</p>
      )}
      {addError && <p className="mb-3 text-sm text-red-600">{addError}</p>}

      {/* リスト */}
      {!hasItems ? (
        <p className="text-sm text-gray-600">{PROJECT_EMPTY_MESSAGE}</p>
      ) : (
        <ul className="space-y-2">
          {sortedProjects.map((p: Project) => {
            const isEditing = editingProject === p.id;
            const editDisabled = editingProject !== null && !isEditing;
            const errMsg =
              rowError && rowError.id === p.id ? rowError.msg : null;
            const busy = rowBusyId === p.id;

            return (
              <ProjectListItem
                key={p.id}
                item={p}
                isEditing={isEditing}
                editDisabled={editDisabled}
                value={isEditing ? editValue : p.project}
                setValue={setEditValue}
                onStartEdit={() => state.startEdit(p.id, p.project)}
                onSave={() => handleSave(p.id)}
                onCancel={handleCancel}
                busy={busy}
                errorMessage={errMsg}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
