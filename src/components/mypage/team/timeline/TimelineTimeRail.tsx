// @/components/mypage/team/timeline/TimelineTimeRail.tsx
"use client";

import { TIME_LABEL_WIDTH } from "@/constants/timeline";

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
      className="relative border-r bg-transparent"
      style={{ width: TIME_LABEL_WIDTH, height: totalHeight }}
    >
      {hours.map((h) => {
        const y = (h * 60 - startMin) * pxPerMinute;
        return (
          <div key={h} className="absolute left-0 right-0" style={{ top: y }}>
            <div className="pr-2 text-sm text-gray-700 text-right">{h}:00</div>
          </div>
        );
      })}
    </div>
  );
}
