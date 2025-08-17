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
  // ラベルは刁E��上げた整数から
  const labelStartHour = Math.ceil(startHour);
  const hours = Array.from(
    { length: endHour - labelStartHour + 1 },
    (_, i) => labelStartHour + i
  );

  // 高さ計算！EtartHourからendHourまで�E�E
  const totalMinutes = (endHour - startHour) * 60;
  const gridHeight = totalMinutes * pxPerMinute;
  const gridWidth = memberCount * memberColumnWidth;

  return (
    <div className="relative" style={{ width: gridWidth, height: gridHeight }}>
      {/* 横緁E& ラベル */}
      {hours.map((hour, i) => (
        <div key={i}>
          {/* 横緁E*/}
          <div
            className="absolute left-0 right-0 border-t border-gray-300"
            style={{
              top: `${(hour - startHour) * 60 * pxPerMinute}px`,
              width: "100%",
            }}
          />
          {/* 時間ラベル */}
          <div
            className="absolute text-sm text-gray-700"
            style={{
              left: `-${TIME_LABEL_WIDTH}px`, // ラベル列�E幁E�E左にずらぁE
              top: `${(hour - startHour) * 60 * pxPerMinute - 8}px`,
              width: `${TIME_LABEL_WIDTH - 8}px`, // ちめE��冁E�Eに
              textAlign: "right",
            }}
          >
            {hour}:00
          </div>
        </div>
      ))}

      {/* 縦緁E*/}
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

