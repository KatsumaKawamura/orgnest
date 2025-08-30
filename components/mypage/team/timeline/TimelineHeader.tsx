// components/mypage/team/timeline/TimelineHeader.tsx
"use client";

import { TimelineHeaderProps } from "@/types/timeline";
import { TIME_LABEL_WIDTH } from "@/constants/timeline";

export default function TimelineHeader({
  members,
  memberColumnWidth,
}: TimelineHeaderProps) {
  return (
    <div
      className="grid border-b text-xs text-gray-600"
      style={{
        gridTemplateColumns: `${TIME_LABEL_WIDTH}px repeat(${members.length}, ${memberColumnWidth}px)`,
      }}
    >
      {/* 左端の空き（時間ラベル列） */}
      <div style={{ width: TIME_LABEL_WIDTH }} />
      {/* メンバー名ヘッダ */}
      {members.map((m) => (
        <div
          key={m.id}
          className="flex h-9 items-center justify-center border-l bg-gray-50"
          style={{ width: memberColumnWidth }}
          title={m.name}
        >
          <span className="truncate max-w-full">{m.name}</span>
        </div>
      ))}
    </div>
  );
}
