"use client";

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
  // ラベルは切り上げた整数から
  const labelStartHour = Math.ceil(startHour);
  const hours = Array.from(
    { length: endHour - labelStartHour + 1 },
    (_, i) => labelStartHour + i
  );

  // 高さ計算（startHourからendHourまで）
  const totalMinutes = (endHour - startHour) * 60;
  const gridHeight = totalMinutes * pxPerMinute;
  const gridWidth = memberCount * memberColumnWidth;

  return (
    <div className="relative" style={{ width: gridWidth, height: gridHeight }}>
      {/* 横線 & ラベル */}
      {hours.map((hour, i) => (
        <div key={i}>
          {/* 横線 */}
          <div
            className="absolute left-0 right-0 border-t border-gray-300"
            style={{
              top: `${(hour - startHour) * 60 * pxPerMinute}px`,
              width: "100%",
            }}
          />
          {/* 時間ラベル */}
          <div
            className="absolute -left-12 text-sm text-gray-700"
            style={{
              top: `${(hour - startHour) * 60 * pxPerMinute - 8}px`,
              width: "40px",
              textAlign: "right",
            }}
          >
            {hour}:00
          </div>
        </div>
      ))}

      {/* 縦線 */}
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
