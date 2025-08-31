// @/components/mypage/team/timeline/TimelineView.tsx
// @ts-nocheck
"use client";

import { useRef, useCallback } from "react";
import TimelineGrid from "./TimelineGrid";
import TimelineBar from "./TimelineBar";
import TimelineHeader from "./TimelineHeader";
import TimelineTimeRail from "./TimelineTimeRail";
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

  // refs for scroll sync
  const headerScrollRef = useRef<HTMLDivElement | null>(null);
  const timeRailScrollRef = useRef<HTMLDivElement | null>(null);
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);

  const onBodyScroll = useCallback(() => {
    const body = bodyScrollRef.current;
    if (!body) return;

    // 横同期: ヘッダー
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = body.scrollLeft;
    }
    // 縦同期: 時間レール
    if (timeRailScrollRef.current) {
      timeRailScrollRef.current.scrollTop = body.scrollTop;
    }
  }, []);

  const innerWidth = safeMembers.length * memberColumnWidth;

  return (
    <div className="w-full">
      {/* 2x2 レイアウト */}
      <div className="grid grid-cols-[auto,1fr] grid-rows-[auto,1fr]">
        {/* 左上：空き（時間ラベルのヘッダー角） */}
        <div className="bg-white" />

        {/* 右上：ヘッダー（横スクロール同期対象） */}
        <div
          ref={headerScrollRef}
          className="overflow-x-hidden overflow-y-hidden"
        >
          <div style={{ width: innerWidth }}>
            <TimelineHeader
              members={safeMembers}
              memberColumnWidth={memberColumnWidth}
              includeTimeLabelSpacer={false}
            />
          </div>
        </div>

        {/* 左下：時間レール（縦スクロール同期対象） */}
        <div
          ref={timeRailScrollRef}
          className="overflow-y-hidden overflow-x-hidden"
        >
          {/* 本体の高さに合わせるため、内部に高さを持つレールを置く */}
          <TimelineTimeRail
            startHour={startHour}
            endHour={endHour}
            pxPerMinute={pxPerMinute}
          />
        </div>

        {/* 右下：描画エリア（縦横スクロールの主役） */}
        <div
          ref={bodyScrollRef}
          className="overflow-auto h-[60vh] sm:h-[70vh] sm:max-h-[720px] bg-white"
          onScroll={onBodyScroll}
        >
          <div style={{ width: innerWidth }}>
            <TimelineGrid
              startHour={startHour}
              endHour={endHour}
              pxPerMinute={pxPerMinute}
              memberCount={safeMembers.length}
              memberColumnWidth={memberColumnWidth}
              showTimeLabels={false}
            >
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
        </div>
      </div>
    </div>
  );
}
