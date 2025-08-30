// @/components/mypage/team/timeline/TimelineHeader.tsx
// @ts-nocheck
"use client";

import { TimelineHeaderProps } from "@/types/timeline";
import { TIME_LABEL_WIDTH } from "@/constants/timeline";

export default function TimelineHeader({
  members,
  memberColumnWidth,
}: TimelineHeaderProps) {
  return (
    <div
      className="grid min-w-max"
      style={{
        gridTemplateColumns: `${TIME_LABEL_WIDTH}px repeat(${members.length}, ${memberColumnWidth}px)`,
      }}
    >
      {/* 左端の空き（時間ラベル列） */}
      <div />

      {/* メンバー名ヘッダ */}
      {members.map((m) => (
        <div
          key={m.id}
          className="text-center font-semibold text-gray-800"
          style={{ width: memberColumnWidth }}
        >
          {m.name}
        </div>
      ))}
    </div>
  );
}
