"use client";
import TimelineGrid from "./TimelineGrid";
import TimelineBar from "./TimelineBar";
import { sampleMembers, sampleSchedules } from "./sampleData";
import { Schedule } from "@/types/schedule";
import { assignSlots } from "@/utils/scheduleUtils";

export default function TimelineView() {
  const members = sampleMembers;
  const schedules: Schedule[] = sampleSchedules;

  const startHour = 6;
  const endHour = 20;
  const pxPerMinute = 2;
  const memberColumnWidth = 120;

  const slottedSchedules: Schedule[] = assignSlots(schedules);

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <div
        className="grid min-w-max"
        style={{
          gridTemplateColumns: `48px repeat(${members.length}, ${memberColumnWidth}px)`,
        }}
      >
        {/* 1行目: ヘッダー（時間ラベル列 + メンバー名） */}
        <div></div>
        {members.map((m) => (
          <div
            key={m.id}
            className="text-center font-semibold text-gray-800 border-r border-gray-300"
          >
            {m.name}
          </div>
        ))}

        {/* 2行目: タイムライン（時間ラベル + グリッド + バー） */}
        <div className="col-span-full relative flex">
          {/* 左端：時間ラベル分のスペース */}
          <div style={{ width: "48px" }} />
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
