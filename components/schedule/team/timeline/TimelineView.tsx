// @/components/mypage/team/timeline/TimelineView.tsx
// @ts-nocheck
"use client";

import TimelineGrid from "./TimelineGrid";
import TimelineBar from "./TimelineBar";
import TimelineHeader from "./TimelineHeader";
// sample は本番では使わない想定。必要なら後述のコメントアウトを解除してください。
// import { sampleMembers, sampleSchedules } from "./sampleData";
import { Schedule, Member } from "@/types/schedule";
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
  // データ到着前のガタつきを避けるため、デフォルトは undefined のまま受け取り、内部で安全化します。
  // 本番でサンプル表示したい場合は下の2行に差し替え：
  // members = sampleMembers,
  // schedules = sampleSchedules,
  members,
  schedules,
}: TimelineViewProps) {
  const startHour = DEFAULT_START_HOUR;
  const endHour = DEFAULT_END_HOUR;
  const pxPerMinute = DEFAULT_PX_PER_MINUTE;
  const memberColumnWidth = DEFAULT_MEMBER_COLUMN_WIDTH;

  // --- 安全化（undefined 対策） ---
  const safeMembers: Member[] = Array.isArray(members) ? members : [];
  const safeSchedules: Schedule[] = Array.isArray(schedules) ? schedules : [];

  // --- 列数の下限を 1 に固定（ローディング時の潰れ防止） ---
  const memberCount = Math.max(1, safeMembers.length);

  // --- スロット付与（重なり回避） ---
  const slottedSchedules: Schedule[] = assignSlots(safeSchedules);

  // --- ローディング用ヘッダーのプレースホルダ（列ズレ防止） ---
  const headerMembers: Member[] =
    safeMembers.length > 0
      ? safeMembers
      : // Member 型を厳密に合わせる必要がある場合は型定義に合わせて調整してください
        // ここでは ts-nocheck のため簡易的に最低限の形だけ持たせています
        [{ id: "__loading__", name: "Loading...", color: "#eee" } as any];

  // --- バー描画はメンバー確定後のみ（列0の上に描画しない） ---
  const shouldRenderBars = safeMembers.length > 0;

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      {/* ヘッダー（ローディング時も1列で“幅”を確保） */}
      <TimelineHeader
        members={headerMembers}
        memberColumnWidth={memberColumnWidth}
      />

      {/* タイムライン本体 */}
      <div
        className="grid min-w-max"
        style={{
          gridTemplateColumns: `${TIME_LABEL_WIDTH}px repeat(${memberCount}, ${memberColumnWidth}px)`,
        }}
      >
        <div className="col-span-full relative flex">
          {/* 左の時間ラベル用余白 */}
          <div style={{ width: `${TIME_LABEL_WIDTH}px` }} />

          {/* グリッド＆バー層 */}
          <div className="relative">
            <TimelineGrid
              startHour={startHour}
              endHour={endHour}
              pxPerMinute={pxPerMinute}
              memberCount={memberCount}
              memberColumnWidth={memberColumnWidth}
            />

            {shouldRenderBars &&
              slottedSchedules.map((s) => (
                <TimelineBar
                  key={s.id}
                  schedule={s}
                  members={safeMembers}
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
