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
      className={`relative border-r bg-transparent w-[32px] sm:w-[48px]`}
      style={{ height: totalHeight }}
    >
      {hours.map((h) => {
        const y = (h * 60 - startMin) * pxPerMinute;
        return (
          <div key={h} className="absolute left-0 right-0" style={{ top: y }}>
            <div className="pr-1 sm:pr-2 text-xs sm:text-sm text-gray-700 text-left">
              {h}:00
            </div>
          </div>
        );
      })}
    </div>
  );
}
