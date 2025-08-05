"use client";
import { useState, useEffect, useRef } from "react";
import { Schedule, Member } from "@/types/schedule";

interface TimelineBarProps {
  schedule: Schedule;
  members: Member[];
  startHour: number;
  pxPerMinute: number;
  memberColumnWidth: number;
}

export default function TimelineBar({
  schedule,
  members,
  startHour,
  pxPerMinute,
  memberColumnWidth,
}: TimelineBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const memberIndex = members.findIndex((m) => m.id === schedule.memberId);
  const startParts = schedule.start.split(":").map(Number);
  const endParts = schedule.end.split(":").map(Number);

  const startMinutes = (startParts[0] - startHour) * 60 + startParts[1];
  const endMinutes = (endParts[0] - startHour) * 60 + endParts[1];
  const top = startMinutes * pxPerMinute;
  const height = (endMinutes - startMinutes) * pxPerMinute;

  // 幅と位置の計算
  let barWidth: number;
  let left: number;

  if (schedule.slotCount > 1) {
    // 重なりあり → 分割幅
    const slotWidth = memberColumnWidth / schedule.slotCount;
    barWidth = slotWidth - 4;
    left = memberIndex * memberColumnWidth + schedule.slotIndex * slotWidth + 2;
  } else {
    // 重なりなし → 全幅
    barWidth = memberColumnWidth - 4;
    left = memberIndex * memberColumnWidth + 2;
  }

  const flagColors: Record<string, string> = {
    事務所: "bg-[#F8F8F8]",
    現場: "bg-[#E99F67]",
    打ち合わせ: "bg-[#8AB5A3]",
  };
  const bgColor = flagColors[schedule.flag] || "bg-gray-200";

  const toggleTooltip = () => setShowTooltip((prev) => !prev);

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    }
    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip]);

  return (
    <div
      ref={barRef}
      className={`absolute ${bgColor} border border-gray-400/50 rounded p-1 text-xs text-gray-800 cursor-pointer`}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        height: `${height}px`,
        width: `${barWidth}px`,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={toggleTooltip}
    >
      <div className="font-semibold truncate">{schedule.project}</div>
      {schedule.notes && (
        <div className="text-[10px] text-gray-700 truncate">
          {schedule.notes}
        </div>
      )}

      {showTooltip && (
        <div
          className="absolute z-50 -top-14 left-1/2 -translate-x-1/2 w-max max-w-xs px-2 py-1 bg-gray-800 text-white text-xs rounded shadow border-2 border-white
                        after:content-[''] after:absolute after:top-full after:left-[30%] after:-translate-x-1/2 
                        after:border-4 after:border-transparent after:border-t-gray-800"
        >
          <div className="font-semibold">{schedule.project}</div>
          {schedule.notes && <div>{schedule.notes}</div>}
        </div>
      )}
    </div>
  );
}
