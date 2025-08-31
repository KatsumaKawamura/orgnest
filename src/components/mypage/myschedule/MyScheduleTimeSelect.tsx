// @/components/mypage/myschedule/MyScheduleTimeSelect.tsx
"use client";

import { Clock } from "lucide-react";
import { HOURS, MINUTES } from "@/constants/mypage";
import { MyPageTimeSelectProps } from "@/types/schedule";
import Combobox from "@/components/common/Combobox";

export default function MyScheduleTimeSelect({
  startHour,
  startMinute,
  endHour,
  endMinute,
  isEditing,
  onChange,
}: MyPageTimeSelectProps) {
  const hourOptions = HOURS.map((h) => ({ value: h, label: h }));
  const minuteOptions = MINUTES.map((m) => ({ value: m, label: m }));

  const comboBoxClassPC = "w-16 text-center text-sm";
  const comboBoxClassMobile = "w-14 text-center text-sm [&>div>input]:h-10";

  // モバイル時のみ2段目の「〜[]:[]」ひとかたまりを右にオフセット
  const secondRowIndent = "pl-10 sm:pl-0";

  return (
    <div>
      {isEditing ? (
        <>
          {/* モバイル：左カラム固定幅。2段目は左セルを空にして右セル側で塊をインデント */}
          <div className="sm:hidden grid grid-cols-[1.25rem,1fr] gap-x-2 gap-y-1">
            {/* 1行目：Clock + 開始 */}
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-800" />
            </div>
            <div className="flex items-center gap-2">
              <Combobox
                value={startHour || ""}
                onChange={(val) => onChange({ startHour: val })}
                options={hourOptions}
                placeholder=""
                allowCustom
                className={comboBoxClassMobile}
              />
              <span className="text-gray-500">:</span>
              <Combobox
                value={startMinute || ""}
                onChange={(val) => onChange({ startMinute: val })}
                options={minuteOptions}
                placeholder=""
                allowCustom
                className={comboBoxClassMobile}
              />
            </div>

            {/* 2行目：左セルは空、右セルに「〜[]:[]」をまとめて配置（モバイルのみオフセット） */}
            <div aria-hidden className="flex items-center" />
            <div className={`flex items-center gap-2 ${secondRowIndent}`}>
              <span className="text-gray-800">〜</span>
              <Combobox
                value={endHour || ""}
                onChange={(val) => onChange({ endHour: val })}
                options={hourOptions}
                placeholder=""
                allowCustom
                className={comboBoxClassMobile}
              />
              <span className="text-gray-500">:</span>
              <Combobox
                value={endMinute || ""}
                onChange={(val) => onChange({ endMinute: val })}
                options={minuteOptions}
                placeholder=""
                allowCustom
                className={comboBoxClassMobile}
              />
            </div>
          </div>

          {/* PC/タブレット：従来の横一列 */}
          <div className="hidden sm:flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-800" />
            <Combobox
              value={startHour || ""}
              onChange={(val) => onChange({ startHour: val })}
              options={hourOptions}
              placeholder=""
              allowCustom
              className={comboBoxClassPC}
            />
            <span className="text-gray-500">:</span>
            <Combobox
              value={startMinute || ""}
              onChange={(val) => onChange({ startMinute: val })}
              options={minuteOptions}
              placeholder=""
              allowCustom
              className={comboBoxClassPC}
            />
            <span className="text-gray-800">〜</span>
            <Combobox
              value={endHour || ""}
              onChange={(val) => onChange({ endHour: val })}
              options={hourOptions}
              placeholder=""
              allowCustom
              className={comboBoxClassPC}
            />
            <span className="text-gray-500">:</span>
            <Combobox
              value={endMinute || ""}
              onChange={(val) => onChange({ endMinute: val })}
              options={minuteOptions}
              placeholder=""
              allowCustom
              className={comboBoxClassPC}
            />
          </div>
        </>
      ) : (
        // 非編集時：従来の1行表示
        <p className="flex items-center text-gray-800 text-lg font-medium">
          <Clock className="w-4 h-4 mr-2 text-gray-800" />
          {startHour || ""}
          <span className="text-gray-500">:</span>
          {startMinute || ""}
          <span className="mx-1 text-gray-800">〜</span>
          {endHour || ""}
          <span className="text-gray-500">:</span>
          {endMinute || ""}
        </p>
      )}
    </div>
  );
}
