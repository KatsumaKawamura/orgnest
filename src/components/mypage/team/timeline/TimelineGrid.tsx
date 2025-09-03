// @/components/mypage/team/timeline/TimelineGrid.tsx
// @ts-nocheck
"use client";

import { ReactNode } from "react";

interface TimelineGridProps {
  startHour: number;
  endHour: number;
  pxPerMinute: number;
  memberCount: number;
  memberColumnWidth: number;
  children?: ReactNode;
  /** 旧構成との互換用：受けるだけ（内部では使用しない） */
  showTimeLabels?: boolean;
}

export default function TimelineGrid({
  startHour,
  endHour,
  pxPerMinute,
  memberCount,
  memberColumnWidth,
  children,
}: TimelineGridProps) {
  const startMin = Math.round(startHour * 60);
  const endMin = Math.round(endHour * 60);
  const totalMin = endMin - startMin;
  const totalHeight = totalMin * pxPerMinute;
  const innerWidth = memberCount * memberColumnWidth;

  const hours: number[] = [];
  for (let h = Math.ceil(startHour); h <= Math.floor(endHour); h++) {
    hours.push(h);
  }

  return (
    <div
      className="relative bg-transparent"
      style={{
        // 左レールぶんのスペースは常時 CSS 変数で確保
        marginLeft: "var(--time-label-w)",
        width: innerWidth,
        height: totalHeight,
      }}
    >
      {/* 背景の横線（時間 = 1時間ごと） */}
      {hours.map((h) => {
        const y = (h * 60 - startMin) * pxPerMinute;
        return (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-gray-300"
            style={{ top: y }}
          />
        );
      })}

      {/* 縦のメンバー境界線（左右端も含む） */}
      {Array.from({ length: memberCount + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-gray-300"
          style={{ left: i * memberColumnWidth }}
        />
      ))}

      {/* バー群（同一原点・同一相対親） */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
