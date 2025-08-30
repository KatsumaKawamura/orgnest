// @/components/mypage/team/timeline/TimelineView.tsx
// @ts-nocheck
"use client";

import TimelineGrid from "./TimelineGrid";
import TimelineBar from "./TimelineBar";
import TimelineHeader from "./TimelineHeader";
import { assignSlots } from "@/utils/scheduleUtils";
import { TimelineViewProps } from "@/types/timeline";
import {
  DEFAULT_MEMBER_COLUMN_WIDTH,
  DEFAULT_PX_PER_MINUTE,
  DEFAULT_START_HOUR,
  DEFAULT_END_HOUR,
} from "@/constants/timeline";

export default function TimelineView({
  members,
  schedules,
}: TimelineViewProps) {
  const startHour = DEFAULT_START_HOUR;
  const endHour = DEFAULT_END_HOUR;
  const pxPerMinute = DEFAULT_PX_PER_MINUTE;
  const memberColumnWidth = DEFAULT_MEMBER_COLUMN_WIDTH;

  const safeMembers = Array.isArray(members) ? members : [];
  const safeSchedules = Array.isArray(schedules) ? schedules : [];
  const slotted = assignSlots(safeSchedules);

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      {/* ヘッダー（従来通り：TIME_LABEL_WIDTH + メンバー列） */}
      <TimelineHeader
        members={safeMembers}
        memberColumnWidth={memberColumnWidth}
      />

      {/* 本体：左スペーサ等は置かず、Grid に一任 */}
      <TimelineGrid
        startHour={startHour}
        endHour={endHour}
        pxPerMinute={pxPerMinute}
        memberCount={safeMembers.length}
        memberColumnWidth={memberColumnWidth}
      >
        {/* Bars は Grid 内側の同一原点に重ねる */}
        {safeMembers.length > 0 &&
          slotted.map((s) => (
            <TimelineBar
              key={s.id}
              schedule={s}
              members={safeMembers}
              startHour={startHour}
              pxPerMinute={pxPerMinute}
              memberColumnWidth={memberColumnWidth}
            />
          ))}
      </TimelineGrid>
    </div>
  );
}
