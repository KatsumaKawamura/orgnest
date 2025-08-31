// @/components/mypage/myschedule/MyPageProjectSelect.tsx
"use client";

import { FLAG_OPTIONS } from "@/constants/mypage";
import { MyPageProjectSelectProps } from "@/types/schedule";
import Select from "@/components/common/Select";
import Combobox from "@/components/common/Combobox";

export default function MyPageProjectSelect({
  value,
  options,
  flag,
  isEditing,
  onChange,
  onFlagChange,
}: MyPageProjectSelectProps) {
  const flagOptions = FLAG_OPTIONS.map((f) => ({ value: f, label: f }));

  // 共通 wrapper 用
  const comboBoxClass = "w-full text-sm";
  // モバイル時だけ高さを強制上書き（sm未満=10, sm以上=8）
  const comboBoxInputMobile = "!h-10 sm:!h-8";
  const selectDisplayClass = "!h-10 sm:!h-8";

  return (
    <div className="relative space-y-2">
      {isEditing && (
        <Select
          value={flag}
          onChange={(val) => onFlagChange(val)}
          options={flagOptions}
          className="w-full"
          // 表示エリア（baseSelectClassが当たる要素）に高さを強制
          displayClassName={selectDisplayClass}
        />
      )}

      {isEditing ? (
        <Combobox
          value={value}
          options={options}
          onChange={onChange}
          placeholder="Project"
          className={comboBoxClass} // wrapper
          inputClassName={comboBoxInputMobile} // input（高さ上書き）
        />
      ) : (
        <p className="text-gray-800 px-1 pb-1 relative inline-block after:content-[''] after:block after:h-[2px] after:bg-gradient-to-r after:from-gray-800 after:to-gray-400 after:absolute after:bottom-0 after:left-0 after:w-[calc(100%+4em)] before:content-[''] before:block before:h-[1px] before:bg-gray-400 before:absolute before:bottom-[4px] before:left-0 before:w-[calc(100%+3em)]">
          <span className="font-medium mr-1">Project : </span>
          {value?.trim() ? value : ""}
        </p>
      )}
    </div>
  );
}
