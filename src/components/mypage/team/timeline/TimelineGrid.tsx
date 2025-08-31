// @/components/mypage/team/timeline/TimelineGrid.tsx
// @ts-nocheck
"use client";

import { ReactNode } from "react";
import { TIME_LABEL_WIDTH } from "@/constants/timeline";

interface TimelineGridProps {
  startHour: number;
  endHour: number;
  pxPerMinute: number;
  memberCount: number;
  memberColumnWidth: number;
  children?: ReactNode;
  /** 旧構成との互換用：true のときだけ左の時間ラベルを内部描画 */
  showTimeLabels?: boolean;
}

export default function TimelineGrid({
  startHour,
  endHour,
  pxPerMinute,
  memberCount,
  memberColumnWidth,
  children,
  showTimeLabels = false,
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

  const marginLeft = showTimeLabels ? TIME_LABEL_WIDTH : 0;

  return (
    <div className="relative">
      {/* 左：時間ラベル列（オプション） */}
      {showTimeLabels && (
        <div
          className="absolute left-0 top-0 h-full border-r bg-transparent"
          style={{ width: TIME_LABEL_WIDTH }}
        >
          {hours.map((h) => {
            const y = (h * 60 - startMin) * pxPerMinute;
            return (
              <div
                key={h}
                className="absolute left-0 right-0"
                style={{ top: y }}
              >
                <div className="pr-2 text-sm text-gray-700 text-right">
                  {h}:00
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 右：本体（この内側の左上が原点 0,0） */}
      <div
        className="relative"
        style={{
          marginLeft,
          width: innerWidth,
          height: totalHeight,
        }}
      >
        {/* 背景の横線（時間） */}
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
    </div>
  );
}
