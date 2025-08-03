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
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  const gridHeight = (endHour - startHour) * 60 * pxPerMinute;
  const gridWidth = memberCount * memberColumnWidth;

  return (
    <div className="relative" style={{ width: gridWidth, height: gridHeight }}>
      {/* 時間ラベル & 横線 */}
      {hours.map((hour, i) => (
        <div key={i}>
          {/* 横線（最上段と最下段は非表示） */}
          {i !== 0 && i !== hours.length - 1 && (
            <div
              className="absolute left-0 right-0 border-t border-gray-300"
              style={{
                top: `${(hour - startHour) * 60 * pxPerMinute}px`,
                width: "100%",
              }}
            />
          )}
          {/* 時間ラベル（左端に表示） */}
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

      {/* 縦線（メンバー列の区切り） */}
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
