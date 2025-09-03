// @/components/mypage/team/timeline/TimelineTimeRail.tsx
"use client";

type Props = {
  startHour: number;
  endHour: number;
  pxPerMinute: number;
};

export default function TimelineTimeRail({
  startHour,
  endHour,
  pxPerMinute,
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
    <div
      className="relative w-[var(--time-label-w)] select-none bg-red-200/40"
      style={{ height: totalHeight }}
    >
      {/* 時刻ラベル */}
      {hours.map((h) => {
        const top = (h * 60 - startMin) * pxPerMinute;
        return (
          <div
            key={h}
            className="absolute right-0 text-gray-500 text-[11px] sm:text-xs leading-none"
            style={{ top }}
          >
            {/* <sm: "h" / sm以上: "h:00" */}
            <span className="sm:hidden">{h}</span>
            <span className="hidden sm:inline">{h}:00</span>
          </div>
        );
      })}
      {/* 目盛り線（必要ならここに描画を維持） */}
    </div>
  );
}
