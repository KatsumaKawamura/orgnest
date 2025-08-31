// @/components/mypage/team/timeline/TimelineHeader.tsx
// @ts-nocheck
"use client";

import { TimelineHeaderProps } from "@/types/timeline";
import { TIME_LABEL_WIDTH } from "@/constants/timeline";

type Props = TimelineHeaderProps & {
  /** 先頭に時間ラベルぶんの空き列を含めるか（右上ヘッダーでは false にする） */
  includeTimeLabelSpacer?: boolean;
};

export default function TimelineHeader({
  members,
  memberColumnWidth,
  includeTimeLabelSpacer = true,
}: Props) {
  const templateCols = includeTimeLabelSpacer
    ? `${TIME_LABEL_WIDTH}px repeat(${members.length}, ${memberColumnWidth}px)`
    : `repeat(${members.length}, ${memberColumnWidth}px)`;

  return (
    <div
      className="grid min-w-max border-b bg-white"
      style={{ gridTemplateColumns: templateCols }}
    >
      {includeTimeLabelSpacer && <div />}

      {members.map((m) => (
        <div
          key={m.id}
          className="text-center font-semibold text-gray-800"
          style={{ width: memberColumnWidth }}
        >
          {m.name}
        </div>
      ))}
    </div>
  );
}
