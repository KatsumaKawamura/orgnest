"use client";
import { useState } from "react";
import { Pencil, Check } from "lucide-react";
import TimeSelect from "@/components/form/TimeSelect";
import Project from "@/components/form/Project";
import Notes from "@/components/form/Notes";

interface ScheduleCardProps {
  id: number;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  project: string;
  notes: string;
  flag: string;
  onChange: (updatedCard: Partial<ScheduleCardProps>) => void;
  projectList: string[];
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

const flagColors: Record<string, string> = {
  事務所: "bg-[#F8F8F8]",
  現場: "bg-[#E99F67]/20",
  打ち合わせ: "bg-[#8AB5A3]/20",
};

export default function ScheduleCard({
  id,
  startHour,
  startMinute,
  endHour,
  endMinute,
  project,
  notes,
  flag,
  onChange,
  projectList,
  onEditStart,
  onEditEnd,
}: ScheduleCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    if (onEditStart) onEditStart();
  };

  const handleSave = () => {
    // === バリデーション ===
    const start =
      parseInt(startHour || "0") * 60 + parseInt(startMinute || "0");
    const end = parseInt(endHour || "0") * 60 + parseInt(endMinute || "0");
    if (isNaN(start) || isNaN(end)) {
      alert("開始時間と終了時間を入力してください");
      return;
    }
    if (start >= end) {
      alert("終了時間は開始時間より後にしてください");
      return;
    }

    setIsEditing(false);
    if (onEditEnd) onEditEnd();
  };

  return (
    <div
      className={`border-2 border-gray-800 rounded shadow-sm p-4 mt-4 w-full max-w-2xl space-y-4 ${
        flagColors[flag] || "bg-white"
      }`}
    >
      {/* === 時間 + 編集/保存アイコン === */}
      <div className="flex items-center justify-between">
        <TimeSelect
          startHour={startHour}
          startMinute={startMinute}
          endHour={endHour}
          endMinute={endMinute}
          isEditing={isEditing}
          onChange={onChange}
        />
        {/* 編集/保存アイコン */}
        <div>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="p-1 rounded hover:bg-gray-200"
            >
              <Pencil className="w-5 h-5 text-gray-800" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="p-1 rounded hover:bg-gray-200"
            >
              <Check className="w-5 h-5 text-green-600" />
            </button>
          )}
        </div>
      </div>

      {/* === Project + Flag === */}
      <Project
        value={project}
        options={projectList}
        flag={flag}
        isEditing={isEditing}
        onChange={(val) => onChange({ project: val })}
        onFlagChange={(val) => onChange({ flag: val })}
      />

      {/* === Notes === */}
      <Notes
        notes={notes}
        isEditing={isEditing}
        onChange={(updated) => onChange(updated)}
      />
    </div>
  );
}
