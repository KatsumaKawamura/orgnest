"use client";
import TimelineGrid from "./TimelineGrid";
import TimelineBar from "./TimelineBar";
import TimelineHeader from "./TimelineHeader";
import { sampleMembers, sampleSchedules } from "./sampleData";
import { Schedule } from "@/types/schedule"; // 共通型をインポート
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
    <div className="relative">
      <TimelineHeader
        members={members}
        memberColumnWidth={memberColumnWidth}
        onSettingsClick={() => alert("設定ボタンクリック！")}
      />
      <div className="flex">
        <div style={{ width: "48px" }} />
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
  );
}
