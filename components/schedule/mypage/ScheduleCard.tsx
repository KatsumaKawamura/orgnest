// @ts-nocheck
"use client";
import { Pencil, Check } from "lucide-react";
import MyPageTimeSelect from "@/components/schedule/mypage/MyPageTimeSelect";
import MyPageProjectSelect from "@/components/schedule/mypage/MyPageProjectSelect";
import MyPageNotes from "@/components/schedule/mypage/MyPageNotes";
import { ScheduleCardProps } from "@/types/schedule";
import { FLAG_COLORS } from "@/constants/mypage";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useScheduleCard } from "@/hooks/useScheduleCard";
import Button from "@/components/common/Button";

interface ExtendedProps extends ScheduleCardProps {
  sortOnSave: () => void;
  onEditEnd: () => void; // 蠢・医→縺励※蜀榊ｮ夂ｾｩ・亥・縺薫ptional縺ｪ繧峨％縺薙〒荳頑嶌縺搾ｼ・
}

export default function ScheduleCard({
  startHour,
  startMinute,
  endHour,
  endMinute,
  project,
  notes,
  flag,
  onChange,
  projectList,
  isEditing,
  onEditStart,
  onEditEnd = () => {}, // 繝・ヵ繧ｩ繝ｫ繝磯未謨ｰ縺ｧ螳牙・蛹・
  sortOnSave,
}: ExtendedProps) {
  const handleEndAndSort = () => {
    onEditEnd(); // 竊・縺薙％縺後ｂ縺・ndefined縺ｧ縺ｯ縺ｪ縺・
    sortOnSave();
  };

  const {
    dialogType,
    dialogMessage,
    handleSave,
    handleDialogConfirm,
    handleDialogCancel,
  } = useScheduleCard(
    startHour,
    startMinute,
    endHour,
    endMinute,
    onChange,
    handleEndAndSort
  );

  return (
    <div
      className={`border-2 border-gray-800 rounded shadow-sm p-4 mt-4 w-full max-w-2xl space-y-4 ${
        FLAG_COLORS[flag] || "bg-white"
      }`}
    >
      <div className="flex items-center justify-between relative">
        <MyPageTimeSelect
          startHour={startHour}
          startMinute={startMinute}
          endHour={endHour}
          endMinute={endMinute}
          isEditing={isEditing}
          onChange={onChange}
        />
        <div>
          {!isEditing ? (
            <Button onClick={onEditStart} variant="icon" size="sm">
              <Pencil className="w-5 h-5 text-gray-800" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                handleSave();
                sortOnSave(); // 菫晏ｭ俶凾縺ｫ繧ら峩謗･蜻ｼ縺ｶ
              }}
              variant="icon"
              size="sm"
            >
              <Check className="w-5 h-5 text-green-600" />
            </Button>
          )}
          {dialogType !== "none" && (
            <div className="absolute top-full right-0 mt-1 z-50">
              <ConfirmDialog
                message={dialogMessage}
                onCancel={handleDialogCancel}
                onConfirm={handleDialogConfirm}
                confirmLabel={
                  dialogType === "autoAdjust" ? "隱ｿ謨ｴ縺励※菫晏ｭ・ : "遐ｴ譽・＠縺ｦ邨ゆｺ・
                }
                cancelLabel="謌ｻ繧・
                confirmClassName="px-3 py-1 text-sm text-gray-600 hover:bg-white border border-gray-800 rounded"
                cancelClassName="px-3 py-1 text-sm text-gray-600 hover:bg-white border border-gray-800 rounded"
                position="absolute"
              />
            </div>
          )}
        </div>
      </div>

      <MyPageProjectSelect
        value={project}
        options={projectList}
        flag={flag}
        isEditing={isEditing}
        onChange={(val) => onChange({ project: val })}
        onFlagChange={(val) => onChange({ flag: val })}
      />

      <MyPageNotes
        notes={notes}
        isEditing={isEditing}
        onChange={(updated) => onChange(updated)}
      />
    </div>
  );
}

