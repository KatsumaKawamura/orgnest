"use client";
import { useState, useEffect, useRef } from "react";
import { Schedule, Member } from "@/types/schedule";
import { calculateBarPosition } from "@/utils/timeline";
import { FLAG_COLORS, BAR_PADDING } from "@/constants/timeline";
import Tooltip from "@/components/common/Tooltip";

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
  const {
    top,
    height,
    width: barWidth,
    left,
  } = calculateBarPosition(
    schedule.start,
    schedule.end,
    startHour,
    pxPerMinute,
    memberIndex,
    memberColumnWidth,
    schedule.slotIndex,
    schedule.slotCount,
    BAR_PADDING
  );

  const bgColor = FLAG_COLORS[schedule.flag] || FLAG_COLORS.default;

  const toggleTooltip = () => setShowTooltip((prev) => !prev);

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    }
    if (showTooltip) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

      {
        <Tooltip
          content={
            <>
              <div className="font-semibold">{schedule.project}</div>
              {schedule.notes && <div>{schedule.notes}</div>}
            </>
          }
          position="top"
          visible={showTooltip} // ← 既存の状態をそのまま渡す
          delay={200}
        />
      }
    </div>
  );
}
