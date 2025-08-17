// @ts-nocheck
"use client";
import { TIME_LABEL_WIDTH } from "@/constants/timeline";

interface TimelineGridProps {
  startHour: number;
  endHour: number;
  pxPerMinute: number;
  memberCount: number;
  memberColumnWidth: number;
}

export default function TimelineGrid({
  startHour,
  endHour,
  pxPerMinute,
  memberCount,
  memberColumnWidth,
}: TimelineGridProps) {
  // 繝ｩ繝吶Ν縺ｯ蛻・ｊ荳翫￡縺滓紛謨ｰ縺九ｉ
  const labelStartHour = Math.ceil(startHour);
  const hours = Array.from(
    { length: endHour - labelStartHour + 1 },
    (_, i) => labelStartHour + i
  );

  // 鬮倥＆險育ｮ暦ｼ・tartHour縺九ｉendHour縺ｾ縺ｧ・・
  const totalMinutes = (endHour - startHour) * 60;
  const gridHeight = totalMinutes * pxPerMinute;
  const gridWidth = memberCount * memberColumnWidth;

  return (
    <div className="relative" style={{ width: gridWidth, height: gridHeight }}>
      {/* 讓ｪ邱・& 繝ｩ繝吶Ν */}
      {hours.map((hour, i) => (
        <div key={i}>
          {/* 讓ｪ邱・*/}
          <div
            className="absolute left-0 right-0 border-t border-gray-300"
            style={{
              top: `${(hour - startHour) * 60 * pxPerMinute}px`,
              width: "100%",
            }}
          />
          {/* 譎る俣繝ｩ繝吶Ν */}
          <div
            className="absolute text-sm text-gray-700"
            style={{
              left: `-${TIME_LABEL_WIDTH}px`, // 繝ｩ繝吶Ν蛻励・蟷・・蟾ｦ縺ｫ縺壹ｉ縺・
              top: `${(hour - startHour) * 60 * pxPerMinute - 8}px`,
              width: `${TIME_LABEL_WIDTH - 8}px`, // 縺｡繧・＞蜀・・縺ｫ
              textAlign: "right",
            }}
          >
            {hour}:00
          </div>
        </div>
      ))}

      {/* 邵ｦ邱・*/}
      {Array.from({ length: memberCount + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 border-l border-gray-300"
          style={{
            left: `${i * memberColumnWidth}px`,
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}

