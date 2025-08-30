// components/mypage/team/timeline/TimelineBar.tsx
"use client";

import { useRef, useState } from "react";
import { TimelineBarProps } from "@/types/timeline";
import { getFlagColor, calculateBarPosition } from "@/utils/timeline";
import { BAR_PADDING } from "@/constants/timeline";
import Tooltip from "@/components/common/Tooltip";

export default function TimelineBar({
  schedule,
  members,
  startHour,
  pxPerMinute,
  memberColumnWidth,
}: TimelineBarProps) {
  const memberIndex = members.findIndex((m) => m.id === schedule.userId);
  if (memberIndex < 0) return null;

  const pos = calculateBarPosition(
    schedule.startMin,
    schedule.endMin,
    startHour,
    pxPerMinute,
    memberIndex,
    memberColumnWidth,
    schedule.slotIndex,
    schedule.slotCount,
    BAR_PADDING
  );
  const colorClass = getFlagColor(schedule.flag);

  const [hovered, setHovered] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const tooltipContent = (
    <div className="text-xs">
      <div className="font-semibold text-sm">
        {schedule.project || "(no project)"}
      </div>
      {schedule.notes && (
        <div className="mt-1 whitespace-pre-wrap">{schedule.notes}</div>
      )}
    </div>
  );

  return (
    <div
      ref={anchorRef}
      className="absolute"
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.width,
        height: pos.height,
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onTouchStart={() => setHovered((v) => !v)} // モバイル簡易対応（必要なければ削除可）
    >
      <div
        className={`h-full w-full flex flex-col items-center
                    rounded border border-gray-400/50 p-1
                    text-gray-800 cursor-pointer text-center ${colorClass}`}
      >
        <div className="w-full min-w-0 font-semibold truncate">
          {schedule.project || "(no project)"}
        </div>
        {schedule.notes ? (
          <div className="w-full min-w-0 text-sm text-gray-700 truncate">
            {schedule.notes}
          </div>
        ) : null}
      </div>

      <Tooltip
        content={tooltipContent}
        visible={hovered}
        position="top"
        anchorRef={anchorRef}
      />
    </div>
  );
}
