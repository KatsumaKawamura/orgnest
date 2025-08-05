"use client";
import TimelineGrid from "./TimelineGrid";
import TimelineBar from "./TimelineBar";
import TimelineHeader from "./TimelineHeader";
import { sampleMembers, sampleSchedules } from "./sampleData";
import { Schedule } from "@/types/schedule";
import { assignSlots } from "@/utils/scheduleUtils";
import {
  TIME_LABEL_WIDTH,
  DEFAULT_MEMBER_COLUMN_WIDTH,
  DEFAULT_PX_PER_MINUTE,
  DEFAULT_START_HOUR,
  DEFAULT_END_HOUR,
} from "@/constants/timeline";

export default function TimelineView() {
  const members = sampleMembers;
  const schedules: Schedule[] = sampleSchedules;

  const startHour = DEFAULT_START_HOUR;
  const endHour = DEFAULT_END_HOUR;
  const pxPerMinute = DEFAULT_PX_PER_MINUTE;
  const memberColumnWidth = DEFAULT_MEMBER_COLUMN_WIDTH;

  const slottedSchedules: Schedule[] = assignSlots(schedules);

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      {/* 1行目: ヘッダー */}
      <TimelineHeader members={members} memberColumnWidth={memberColumnWidth} />

      {/* 2行目: タイムライン */}
      <div
        className="grid min-w-max"
        style={{
          gridTemplateColumns: `${TIME_LABEL_WIDTH}px repeat(${members.length}, ${memberColumnWidth}px)`,
        }}
      >
        <div className="col-span-full relative flex">
          {/* 左端：時間ラベル分のスペース */}
          <div style={{ width: `${TIME_LABEL_WIDTH}px` }} />
          {/* タイムライン本体 */}
          <div className="relative">
            <TimelineGrid
              startHour={startHour}
              endHour={endHour}
              pxPerMinute={pxPerMinute}
              memberCount={members.length}
              memberColumnWidth={memberColumnWidth}
            />
            {slottedSchedules.map((s) => (
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
