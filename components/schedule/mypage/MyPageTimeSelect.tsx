"use client";
import { Clock } from "lucide-react";
import { HOURS, MINUTES } from "@/constants/mypage";
import { MyPageTimeSelectProps } from "@/types/schedule";
import Combobox from "@/components/common/Combobox";

export default function MyPageTimeSelect({
  startHour,
  startMinute,
  endHour,
  endMinute,
  isEditing,
  onChange,
}: MyPageTimeSelectProps) {
  const hourOptions = HOURS.map((h) => ({ value: h, label: h }));
  const minuteOptions = MINUTES.map((m) => ({ value: m, label: m }));

  const comboBoxClass = "w-14 text-center text-sm"; // ← 共通スタイル

  return (
    <div>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-800" />
          <Combobox
            value={startHour || ""}
            onChange={(val) => onChange({ startHour: val })}
            options={hourOptions}
            placeholder=""
            allowCustom
            className={comboBoxClass} // ← 追加
          />
          <span className="text-gray-500">:</span>
          <Combobox
            value={startMinute || ""}
            onChange={(val) => onChange({ startMinute: val })}
            options={minuteOptions}
            placeholder=""
            allowCustom
            className={comboBoxClass}
          />
          <span className="text-gray-800">〜</span>
          <Combobox
            value={endHour || ""}
            onChange={(val) => onChange({ endHour: val })}
            options={hourOptions}
            placeholder=""
            allowCustom
            className={comboBoxClass}
          />
          <span className="text-gray-500">:</span>
          <Combobox
            value={endMinute || ""}
            onChange={(val) => onChange({ endMinute: val })}
            options={minuteOptions}
            placeholder=""
            allowCustom
            className={comboBoxClass}
          />
        </div>
      ) : (
        <p className="flex items-center text-gray-800 text-lg font-medium">
          <Clock className="w-4 h-4 mr-2 text-gray-800" />
          {startHour || ""}
          <span className="text-gray-500">：</span>
          {startMinute || ""} 〜 {endHour || ""}
          <span className="text-gray-500">：</span>
          {endMinute || ""}
        </p>
      )}
    </div>
  );
}
