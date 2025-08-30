// components/mypage/team/timeline/TimelineBar.tsx
"use client";

import { useState } from "react";
import { TimelineBarProps } from "@/types/timeline";
import { getFlagColor, calculateBarPosition } from "@/utils/timeline";
import { BAR_PADDING } from "@/constants/timeline";
import Tooltip from "@/components/common/Tooltip";

function toHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

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

  // Tooltip 可視制御（Tooltip は children を取らず、visible 必須）
  const [hovered, setHovered] = useState(false);

  const tooltipContent = (
    <div className="text-xs">
      <div className="font-semibold">{schedule.project || "(no project)"}</div>
      <div className="text-gray-600">
        {toHHMM(schedule.startMin)} - {toHHMM(schedule.endMin)}
      </div>
      {schedule.flag && <div className="mt-1">flag: {schedule.flag}</div>}
      {schedule.notes && (
        <div className="mt-1 whitespace-pre-wrap">{schedule.notes}</div>
      )}
    </div>
  );

  return (
    // 相対座標コンテナ（この中の絶対配置でバーとツールチップを重ねる）
    <div
      className="absolute"
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.width,
        height: pos.height,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered((v) => !v)} // モバイル簡易対応：タップでトグル
    >
      {/* 実際のバー */}
      <div
        className={`h-full w-full overflow-hidden rounded-sm text-[10px] leading-[1.1] text-gray-800 shadow-sm ${colorClass}`}
        style={{ padding: "2px 4px" }}
        title={schedule.project || "(no project)"}
      >
        <div className="truncate">{schedule.project || "(no project)"}</div>
        <div className="truncate opacity-70">
          {toHHMM(schedule.startMin)} - {toHHMM(schedule.endMin)}
        </div>
        {schedule.notes ? (
          <div className="truncate opacity-70">{schedule.notes}</div>
        ) : null}
      </div>

      {/* 制御型 Tooltip（children ではなく content/visible を渡す） */}
      <Tooltip content={tooltipContent} visible={hovered} position="top" />
    </div>
  );
}
