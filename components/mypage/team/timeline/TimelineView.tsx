// components/mypage/team/timeline/TimelineView.tsx
"use client";

import TimelineGrid from "./TimelineGrid";
import TimelineBar from "./TimelineBar";
import TimelineHeader from "./TimelineHeader";
import { assignSlots } from "@/utils/scheduleUtils";
import { TimelineViewProps } from "@/types/timeline";
import {
  TIME_LABEL_WIDTH,
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

  // 念のためここでも assignSlots（既に付与済みでも問題なし）
  const slotted = assignSlots(schedules);

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      {/* ヘッダー */}
      <TimelineHeader members={members} memberColumnWidth={memberColumnWidth} />

      {/* タイムライン本体 */}
      <div
        className="grid min-w-max"
        style={{
          gridTemplateColumns: `${TIME_LABEL_WIDTH}px repeat(${members.length}, ${memberColumnWidth}px)`,
        }}
      >
        <div className="col-span-full relative flex">
          {/* 左端の時間ラベル列のスペース */}
          <div style={{ width: `${TIME_LABEL_WIDTH}px` }} />
          {/* タイムライン */}
          <div className="relative">
            <TimelineGrid
              startHour={startHour}
              endHour={endHour}
              pxPerMinute={pxPerMinute}
              memberCount={members.length}
              memberColumnWidth={memberColumnWidth}
            />
            {slotted.map((s) => (
              <TimelineBar
                key={s.id}
                schedule={s}
                members={members}
                startHour={startHour}
                pxPerMinute={pxPerMinute}
                memberColumnWidth={memberColumnWidth}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
