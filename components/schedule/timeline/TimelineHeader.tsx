"use client";
import { Member } from "@/types/schedule";

interface TimelineHeaderProps {
  members: Member[];
  memberColumnWidth: number;
  onSettingsClick?: () => void; // クリックイベント（例:設定用）
}

export default function TimelineHeader({
  members,
  memberColumnWidth,
  onSettingsClick,
}: TimelineHeaderProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ marginLeft: "48px" }}
    >
      {/* メンバー名リスト */}
      <div className="flex">
        {members.map((m) => (
          <div
            key={m.id}
            className="text-center font-semibold text-gray-800"
            style={{ width: `${memberColumnWidth}px` }}
          >
            {m.name}
          </div>
        ))}
      </div>

      {/* ボタンエリア */}
      <div className="flex items-center space-x-2 pr-2">
        <button
          onClick={onSettingsClick}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
        >
          設定
        </button>
      </div>
    </div>
  );
}
