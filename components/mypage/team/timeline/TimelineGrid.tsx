// components/mypage/team/timeline/TimelineGrid.tsx
"use client";

import { TIME_LABEL_WIDTH } from "@/constants/timeline";

type Props = {
  startHour: number;
  endHour: number;
  pxPerMinute: number;
  memberCount: number;
  memberColumnWidth: number;
};

export default function TimelineGrid({
  startHour,
  endHour,
  pxPerMinute,
  memberCount,
  memberColumnWidth,
}: Props) {
  const startMin = Math.round(startHour * 60);
  const endMin = Math.round(endHour * 60);
  const totalMin = endMin - startMin;
  const totalHeight = totalMin * pxPerMinute;

  const hours: number[] = [];
  for (let h = Math.ceil(startHour); h <= Math.floor(endHour); h++) {
    hours.push(h);
  }

  return (
    <div className="relative">
      {/* 時間ラベル列 */}
      <div
        className="absolute left-0 top-0 h-full border-r bg-white"
        style={{ width: TIME_LABEL_WIDTH }}
      >
        {/* 時間目盛り */}
        {hours.map((h) => {
          const y = (h * 60 - startMin) * pxPerMinute;
          return (
            <div key={h} className="absolute left-0 right-0" style={{ top: y }}>
              <div className="px-1 text-[10px] text-gray-500">{h}:00</div>
            </div>
          );
        })}
      </div>

      {/* 本体グリッド（メンバー列 x 時間） */}
      <div
        className="relative"
        style={{
          marginLeft: TIME_LABEL_WIDTH,
          width: memberCount * memberColumnWidth,
          height: totalHeight,
        }}
      >
        {/* 横の時間線 */}
        {hours.map((h) => {
          const y = (h * 60 - startMin) * pxPerMinute;
          return (
            <div
              key={h}
              className="absolute left-0 right-0 border-t border-dashed border-gray-200"
              style={{ top: y }}
            />
          );
        })}

        {/* 縦のメンバー境界線 */}
        {Array.from({ length: memberCount }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-gray-200/80"
            style={{ left: i * memberColumnWidth }}
          />
        ))}
      </div>
    </div>
  );
}
